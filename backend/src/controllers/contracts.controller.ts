import { Request, Response } from 'express';
import Contract from '../models/Contract.js';
import Investment from '../models/Investment.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import logger from '../config/logger.js';
import { generateContractPDF, ContractTerms } from '../utils/pdf-generator.js';
import { uploadFile } from '../services/s3.service.js';

// Auto-generate contract after payment confirmed
export const generateContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { investmentId } = req.body;

    // Get investment with relations
    const investment = await Investment.findByPk(investmentId, {
      include: [
        {
          model: Project,
          as: 'project',
        },
        {
          model: User,
          as: 'investor',
        },
      ],
    });

    if (!investment) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    // Check if contract already exists
    let contract = await Contract.findOne({
      where: { investmentId },
    });

    if (contract) {
      res.status(400).json({ error: 'Contract already exists for this investment' });
      return;
    }

    // Get entrepreneur/project owner
    const entrepreneur = await User.findByPk((investment as any).project.ownerId);
    if (!entrepreneur) {
      res.status(404).json({ error: 'Project owner not found' });
      return;
    }

    // Build contract terms
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]; // 1 year from now

    const terms: ContractTerms = {
      projectTitle: (investment as any).project.title,
      investorEmail: (investment as any).investor.email,
      entrepreneurEmail: entrepreneur.email,
      investmentAmount: investment.amount as any,
      contractType: (investment as any).project.contractType,
      profitShare: (investment as any).project.expectedReturn,
      duration: 12,
      expectedReturn: (investment as any).project.expectedReturn,
      startDate,
      endDate,
      conditions: [
        'Investor retains ownership rights to their investment portion',
        'Entrepreneur commits to monthly progress reports',
        'Fund disbursement subject to project milestones',
      ],
    };

    // Generate PDF
    const pdfBuffer = await generateContractPDF(terms);

    // Upload to S3
    const fileName = `contracts/contract-${investmentId}-${Date.now()}.pdf`;
    const pdfUrl = await uploadFile(pdfBuffer, fileName, 'application/pdf');

    // Create contract record
    contract = await Contract.create({
      investmentId,
      contractType: (investment as any).project.contractType,
      termsJSON: JSON.stringify(terms),
      contractPdfUrl: pdfUrl,
      status: 'active',
    } as any);

    logger.info(`Contract generated: ${contract.id} for investment ${investmentId}`);

    res.status(201).json({
      success: true,
      message: 'Contract generated successfully',
      contract,
    });
  } catch (error) {
    logger.error('Generate contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate contract',
    });
  }
};

// Get contract detail
export const getContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: Investment,
          as: 'investment',
          include: [
            {
              model: Project,
              as: 'project',
            },
            {
              model: User,
              as: 'investor',
            },
          ],
        },
      ],
    });

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    logger.error('Get contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contract',
    });
  }
};

// Get contracts by investment
export const getContractByInvestment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { investmentId } = req.params;

    const contract = await Contract.findOne({
      where: { investmentId },
      include: [
        {
          model: Investment,
          as: 'investment',
        },
      ],
    });

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    logger.error('Get contract by investment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contract',
    });
  }
};

// Sign contract (investor, entrepreneur, or admin)
export const signContract = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { signer } = req.body; // 'investor', 'entrepreneur', or 'admin'

    const contract = await Contract.findByPk(id, {
      include: [
        {
          model: Investment,
          as: 'investment',
          include: [
            {
              model: Project,
              as: 'project',
            },
            {
              model: User,
              as: 'investor',
            },
          ],
        },
      ],
    });

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    // Validate signer role
    const investment = contract.get('investment') as any;
    const isInvestor = investment.investorId === req.user.id;
    const isEntrepreneur = investment.project.ownerId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (signer === 'investor' && !isInvestor && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to sign as investor' });
      return;
    }

    if (signer === 'entrepreneur' && !isEntrepreneur && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to sign as entrepreneur' });
      return;
    }

    if (signer === 'admin' && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to sign as admin' });
      return;
    }

    // Mark as signed
    const now = new Date();
    if (signer === 'investor') {
      contract.investorSignedAt = now;
    } else if (signer === 'entrepreneur') {
      contract.entrepreneurSignedAt = now;
    } else if (signer === 'admin') {
      contract.adminSignedAt = now;
    }

    // Check if fully signed (all three parties)
    if (contract.investorSignedAt && contract.entrepreneurSignedAt && contract.adminSignedAt) {
      contract.status = 'signed';
    }

    await contract.save();

    logger.info(`Contract signed by ${signer}: ${id}`);

    res.status(200).json({
      success: true,
      message: `Contract signed by ${signer}`,
      contract,
    });
  } catch (error) {
    logger.error('Sign contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sign contract',
    });
  }
};

// Download contract PDF
export const downloadContractPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const contract = await Contract.findByPk(id);
    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    if (!contract.contractPdfUrl) {
      res.status(400).json({ error: 'Contract PDF not available' });
      return;
    }

    // Redirect to S3 signed URL
    res.status(200).json({
      success: true,
      pdfUrl: contract.contractPdfUrl,
    });
  } catch (error) {
    logger.error('Download contract error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download contract',
    });
  }
};
