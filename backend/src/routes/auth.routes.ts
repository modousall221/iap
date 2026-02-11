import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { asyncHandler, verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user (investor or entrepreneur)
 */
router.post('/register', asyncHandler(authController.register));

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post('/login', asyncHandler(authController.login));

/**
 * POST /api/auth/logout
 * Logout user (clear token)
 */
router.post('/logout', asyncHandler(authController.logout));

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', verifyJWT, asyncHandler(authController.refresh));

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', verifyJWT, asyncHandler(authController.getMe));

export default router;
