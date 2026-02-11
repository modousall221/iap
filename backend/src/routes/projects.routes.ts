import { Router } from 'express';
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  submitProject,
  approveProject,
  rejectProject,
  launchProject,
} from '../controllers/projects.controller.js';
import { asyncHandler, verifyJWT, verifyRole } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/projects
 * Create a new project (entrepreneur/admin only)
 */
router.post('/', verifyJWT, asyncHandler(createProject));

/**
 * GET /api/projects
 * Get all projects (public list with filters for approved projects)
 */
router.get('/', asyncHandler(listProjects));

/**
 * GET /api/projects/:id
 * Get project detail (public)
 */
router.get('/:id', asyncHandler(getProject));

/**
 * PUT /api/projects/:id
 * Update project (owner only, draft status)
 */
router.put('/:id', verifyJWT, asyncHandler(updateProject));

/**
 * POST /api/projects/:id/submit
 * Submit project for approval (owner only)
 */
router.post('/:id/submit', verifyJWT, asyncHandler(submitProject));

/**
 * POST /api/projects/:id/approve
 * Approve project (admin only)
 */
router.post('/:id/approve', verifyJWT, verifyRole('admin'), asyncHandler(approveProject));

/**
 * POST /api/projects/:id/reject
 * Reject project and return to draft (admin only)
 */
router.post('/:id/reject', verifyJWT, verifyRole('admin'), asyncHandler(rejectProject));

/**
 * POST /api/projects/:id/launch
 * Launch project to funding (admin only)
 */
router.post('/:id/launch', verifyJWT, verifyRole('admin'), asyncHandler(launchProject));

export default router;
