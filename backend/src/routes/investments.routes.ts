import { Router } from 'express';
import {
  createInvestment,
  listInvestments,
  getInvestment,
  initiatePayment,
  confirmPayment,
  adminConfirmPayment,
} from '../controllers/investments.controller.js';
import { asyncHandler, verifyJWT, verifyRole } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/investments
 * Create a new investment (authenticated user)
 */
router.post('/', verifyJWT, asyncHandler(createInvestment));

/**
 * GET /api/investments
 * Get investments (investor's own or project's investments if entrepreneur)
 */
router.get('/', verifyJWT, asyncHandler(listInvestments));

/**
 * GET /api/investments/:id
 * Get investment detail
 */
router.get('/:id', asyncHandler(getInvestment));

/**
 * POST /api/investments/:id/pay
 * Initiate payment (mock payment processing)
 */
router.post('/:id/pay', verifyJWT, asyncHandler(initiatePayment));

/**
 * POST /api/investments/:id/confirm
 * Confirm payment after successful payment
 */
router.post('/:id/confirm', verifyJWT, asyncHandler(confirmPayment));

/**
 * POST /api/investments/:id/admin-confirm
 * Admin manually confirms payment
 */
router.post(
  '/:id/admin-confirm',
  verifyJWT,
  verifyRole('admin'),
  asyncHandler(adminConfirmPayment)
);

export default router;
