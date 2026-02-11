import { Router } from 'express';
import {
  uploadDocument,
  getKYCStatus,
  getKYCQueue,
  approveKYC,
  rejectKYC,
  upload,
} from '../controllers/kyc.controller.js';
import { asyncHandler, verifyJWT, verifyRole } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/kyc/upload
 * Upload KYC document (authenticated user)
 */
router.post(
  '/upload',
  verifyJWT,
  upload.single('document'),
  asyncHandler(uploadDocument)
);

/**
 * GET /api/kyc/status
 * Get current user KYC status
 */
router.get('/status', verifyJWT, asyncHandler(getKYCStatus));

/**
 * GET /api/kyc/queue
 * Get pending KYC queue (admin only)
 */
router.get('/queue', verifyJWT, verifyRole('admin'), asyncHandler(getKYCQueue));

/**
 * POST /api/kyc/approve/:userId
 * Approve user KYC (admin only)
 */
router.post(
  '/approve/:userId',
  verifyJWT,
  verifyRole('admin'),
  asyncHandler(approveKYC)
);

/**
 * POST /api/kyc/reject/:userId
 * Reject user KYC (admin only)
 */
router.post(
  '/reject/:userId',
  verifyJWT,
  verifyRole('admin'),
  asyncHandler(rejectKYC)
);

export default router;
