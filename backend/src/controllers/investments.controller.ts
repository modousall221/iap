import { Request, Response } from 'express';
import Investment from '../models/Investment.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import logger from '../config/logger.js';
import Joi from 'joi';
import { validate } from '../utils/validators.js';
import { processPayment, verifyPayment } from '../services/payment.service.js';

// Validation schemas
const investmentSchema = Joi.object({
  projectId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string().valid('mobile_money', 'bank_transfer', 'card').optional(),
});

// Create investment (investor commits to investment)
export const createInvestment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validate input
    const validation = validate(investmentSchema, req.body);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        errors: validation.errors,
      });
      return;
    }

    const { projectId, amount, paymentMethod = 'mobile_money' } = validation.data;

    // Verify project exists and is in funding status
    const project = await Project.findByPk(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.status !== 'funding') {
      res.status(400).json({ error: 'Project is not currently accepting investments' });
      return;
    }

    // Check funding goal not exceeded
    const projectedTotal = (project.raisedAmount || 0) + amount;
    if (projectedTotal > project.targetAmount) {
      res.status(400).json({
        error: `Investment exceeds project target. Maximum allowed: ${project.targetAmount - (project.raisedAmount || 0)} FCFA`
      });
      return;
    }

    // Create investment record
    const investment = await Investment.create({
      projectId,
      investorId: req.user.id,
      amount,
      status: 'pending',
      paymentMethod,
    } as any);

    logger.info(`Investment created: ${investment.id} for project ${projectId}`);

    res.status(201).json({
      success: true,
      message: 'Investment created. Proceed to payment.',
      investment,
    });
  } catch (error) {
    logger.error('Create investment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create investment',
    });
  }
};

// Get my investments (investor view) or project investments (entrepreneur view)
export const listInvestments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { projectId } = req.query;

    const where: any = {};

    if (projectId) {
      // Entrepreneur viewing investments in their project
      const project = await Project.findByPk(projectId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Not authorized to view these investments' });
        return;
      }

      where.projectId = projectId;
    } else {
      // Investor viewing their own investments
      where.investorId = req.user.id;
    }

    const investments = await Investment.findAll({
      where,
      include: [
        {
          model: Project,
          attributes: ['id', 'title', 'targetAmount', 'raisedAmount'],
          as: 'project',
        },
        {
          model: User,
          attributes: ['id', 'email'],
          as: 'investor',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      investments,
      total: investments.length,
    });
  } catch (error) {
    logger.error('List investments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list investments',
    });
  }
};

// Get investment detail
export const getInvestment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const investment = await Investment.findByPk(id, {
      include: [
        {
          model: Project,
          attributes: ['id', 'title', 'targetAmount', 'raisedAmount', 'ownerId'],
          as: 'project',
        },
        {
          model: User,
          attributes: ['id', 'email'],
          as: 'investor',
        },
      ],
    });

    if (!investment) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    // Check authorization
    if (
      req.user &&
      investment.investorId !== req.user.id &&
      (investment as any).project.ownerId !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      res.status(403).json({ error: 'Not authorized to view this investment' });
      return;
    }

    res.status(200).json({
      success: true,
      investment,
    });
  } catch (error) {
    logger.error('Get investment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investment',
    });
  }
};

// Initiate payment (mock payment processing)
export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const investment = await Investment.findByPk(id);
    if (!investment) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    // Authorization check
    if (investment.investorId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to pay for this investment' });
      return;
    }

    if (investment.status !== 'pending') {
      res.status(400).json({ error: 'Investment is not in pending status' });
      return;
    }

    // Process payment (mock)
    const paymentResult = await processPayment({
      investmentId: id,
      amount: investment.amount as any,
      method: investment.paymentMethod as any,
    });

    if (!paymentResult.success) {
      res.status(400).json({
        success: false,
        error: paymentResult.message,
      });
      return;
    }

    // Update investment with payment reference
    investment.paymentReference = paymentResult.paymentReference;
    investment.status = 'payment_confirmed';
    await investment.save();

    logger.info(
      `Payment initiated: ${paymentResult.paymentReference} for investment ${id}`
    );

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      investment,
      paymentReference: paymentResult.paymentReference,
      redirectUrl: paymentResult.redirectUrl,
    });
  } catch (error) {
    logger.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
    });
  }
};

// Confirm payment (after successful payment)
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentReference } = req.body;

    const investment = await Investment.findByPk(id);
    if (!investment) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    if (investment.status !== 'payment_confirmed') {
      res.status(400).json({ error: 'Payment not yet confirmed' });
      return;
    }

    // Verify payment with payment service
    const isValid = await verifyPayment(paymentReference || investment.paymentReference!);
    if (!isValid) {
      res.status(400).json({ error: 'Payment verification failed' });
      return;
    }

    // Update project raised amount
    const project = await Project.findByPk(investment.projectId);
    if (project) {
      project.raisedAmount = ((project.raisedAmount || 0) as any) + (investment.amount as any);

      // Check if fully funded
      if (project.raisedAmount >= project.targetAmount) {
        project.status = 'funded';
      }

      await project.save();
    }

    logger.info(`Payment confirmed: ${paymentReference} for investment ${id}`);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      investment,
    });
  } catch (error) {
    logger.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
    });
  }
};

// Admin: Mark investment payment as confirmed (for manual verification)
export const adminConfirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { id } = req.params;
    const { paymentReference } = req.body;

    const investment = await Investment.findByPk(id);
    if (!investment) {
      res.status(404).json({ error: 'Investment not found' });
      return;
    }

    // Update investment
    investment.paymentReference = paymentReference || investment.paymentReference;
    investment.status = 'payment_confirmed';
    await investment.save();

    // Update project
    const project = await Project.findByPk(investment.projectId);
    if (project) {
      if (!investment.paymentReference) {
        // Only increment if not already done
        project.raisedAmount = ((project.raisedAmount || 0) as any) + (investment.amount as any);
        if (project.raisedAmount >= project.targetAmount) {
          project.status = 'funded';
        }
        await project.save();
      }
    }

    logger.info(`Admin confirmed payment for investment ${id}`);

    res.status(200).json({
      success: true,
      message: 'Investment payment confirmed',
      investment,
    });
  } catch (error) {
    logger.error('Admin confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
    });
  }
};
