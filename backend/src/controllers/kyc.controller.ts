import { Request, Response } from 'express';
import multer from 'multer';
import User from '../models/User.js';
import KYCDocument from '../models/KYCDocument.js';
import { uploadFile } from '../services/s3.service.js';
import logger from '../config/logger.js';

// Multer configuration for file upload
const storage = multer.memoryStorage();
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Upload KYC document
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { documentType } = req.body;

    // Validate document type
    if (!['id', 'rib', 'kbis', 'proof_of_address'].includes(documentType)) {
      res.status(400).json({ error: 'Invalid document type' });
      return;
    }

    // Upload to S3
    const fileUrl = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Create KYC document record
    const kycDocument = await KYCDocument.create({
      userId: req.user.id,
      documentType,
      fileName: req.file.originalname,
      fileUrl,
      status: 'pending',
    });

    logger.info(`KYC document uploaded: ${kycDocument.id}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: kycDocument,
    });
  } catch (error) {
    logger.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Document upload failed',
    });
  }
};

// Get user KYC status
export const getKYCStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const documents = await KYCDocument.findAll({
      where: { userId: req.user.id },
    });

    res.status(200).json({
      success: true,
      status: user.kycStatus,
      documents,
    });
  } catch (error) {
    logger.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC status',
    });
  }
};

// Admin: Get pending KYC queue
export const getKYCQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const users = await User.findAll({
      where: { kycStatus: 'pending' },
      attributes: { exclude: ['password'] },
    });

    const queue = await Promise.all(
      users.map(async (user) => {
        const documents = await KYCDocument.findAll({
          where: { userId: user.id },
        });
        return {
          user,
          documents,
        };
      })
    );

    res.status(200).json({
      success: true,
      queue,
      count: queue.length,
    });
  } catch (error) {
    logger.error('Get KYC queue error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC queue',
    });
  }
};

// Admin: Approve KYC
export const approveKYC = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update documents status
    await KYCDocument.update(
      { status: 'approved' },
      { where: { userId } }
    );

    // Update user KYC status
    user.kycStatus = 'approved';
    await user.save();

    logger.info(`KYC approved for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'KYC approved successfully',
      user,
    });
  } catch (error) {
    logger.error('Approve KYC error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve KYC',
    });
  }
};

// Admin: Reject KYC
export const rejectKYC = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { userId } = req.params;
    const { rejectionReason } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update documents status
    await KYCDocument.update(
      { status: 'rejected', rejectionReason },
      { where: { userId } }
    );

    // Update user KYC status
    user.kycStatus = 'rejected';
    await user.save();

    logger.info(`KYC rejected for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'KYC rejected successfully',
      user,
    });
  } catch (error) {
    logger.error('Reject KYC error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject KYC',
    });
  }
};
