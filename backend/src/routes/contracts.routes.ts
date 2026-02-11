import { Router } from 'express';
import {
  generateContract,
  getContract,
  getContractByInvestment,
  signContract,
  downloadContractPDF,
} from '../controllers/contracts.controller.js';
import { asyncHandler, verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/contracts
 * Generate a new contract (auto-call after payment confirmed)
 */
router.post('/', asyncHandler(generateContract));

/**
 * GET /api/contracts/:id
 * Get contract detail
 */
router.get('/:id', asyncHandler(getContract));

/**
 * GET /api/contracts/investment/:investmentId
 * Get contract by investment ID
 */
router.get('/investment/:investmentId', asyncHandler(getContractByInvestment));

/**
 * POST /api/contracts/:id/sign
 * Sign contract (investor, entrepreneur, or admin)
 */
router.post('/:id/sign', verifyJWT, asyncHandler(signContract));

/**
 * GET /api/contracts/:id/download
 * Download contract PDF
 */
router.get('/:id/download', asyncHandler(downloadContractPDF));

export default router;
