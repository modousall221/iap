import { Request, Response } from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import logger from '../config/logger.js';
import Joi from 'joi';
import { validate } from '../utils/validators.js';

// Validation schemas
const projectSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(500).required(),
  longDescription: Joi.string().max(5000).optional(),
  targetAmount: Joi.number().positive().required(),
  category: Joi.string().required(),
  country: Joi.string().required(),
  contractType: Joi.string().valid('mudarabah', 'musharaka', 'conventional_loan').required(),
  shariaCompliant: Joi.boolean().default(false),
  deadline: Joi.date().min('now').required(),
  expectedReturn: Joi.number().min(0).max(100).optional(),
  riskLevel: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

// Create project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Validate input
    const validation = validate(projectSchema, req.body);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        errors: validation.errors,
      });
      return;
    }

    // Verify user is entrepreneur or admin
    if (req.user.role !== 'entrepreneur' && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Only entrepreneurs can create projects' });
      return;
    }

    // Create project
    const project = await Project.create({
      ...validation.data,
      ownerId: req.user.id,
      status: 'draft',
    } as any);

    logger.info(`Project created: ${project.id}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    logger.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project',
    });
  }
};

// Get all projects (public list + filters)
export const listProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'approved', category, country, limit = 20, offset = 0 } = req.query;

    const where: any = {
      status: status || 'approved',
    };

    if (category) {
      where.category = category;
    }

    if (country) {
      where.country = country;
    }

    const projects = await Project.findAndCountAll({
      where,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['email'],
          as: 'owner',
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: projects.rows,
      total: projects.count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('List projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list projects',
    });
  }
};

// Get project detail
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'email'],
          as: 'owner',
        },
      ],
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    logger.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
    });
  }
};

// Update project (owner only, draft status)
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Only owner can update
    if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to update this project' });
      return;
    }

    // Only draft projects can be updated
    if (project.status !== 'draft') {
      res.status(400).json({ error: 'Only draft projects can be updated' });
      return;
    }

    // Validate input
    const validation = validate(projectSchema, req.body);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        errors: validation.errors,
      });
      return;
    }

    // Update project
    await project.update(validation.data);
    logger.info(`Project updated: ${project.id}`);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    logger.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
};

// Submit project for approval
export const submitProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Only owner can submit
    if (project.ownerId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to submit this project' });
      return;
    }

    // Only draft projects can be submitted
    if (project.status !== 'draft') {
      res.status(400).json({ error: 'Only draft projects can be submitted' });
      return;
    }

    project.status = 'submitted';
    await project.save();

    logger.info(`Project submitted: ${project.id}`);

    res.status(200).json({
      success: true,
      message: 'Project submitted for approval',
      project,
    });
  } catch (error) {
    logger.error('Submit project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit project',
    });
  }
};

// Admin: Approve project
export const approveProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Only submitted projects can be approved
    if (project.status !== 'submitted') {
      res.status(400).json({ error: 'Only submitted projects can be approved' });
      return;
    }

    project.status = 'approved';
    await project.save();

    logger.info(`Project approved: ${project.id}`);

    res.status(200).json({
      success: true,
      message: 'Project approved successfully',
      project,
    });
  } catch (error) {
    logger.error('Approve project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve project',
    });
  }
};

// Admin: Reject project
export const rejectProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Only submitted projects can be rejected
    if (project.status !== 'submitted') {
      res.status(400).json({ error: 'Only submitted projects can be rejected' });
      return;
    }

    // Return to draft for resubmission
    project.status = 'draft';
    await project.save();

    logger.info(`Project rejected: ${project.id}`);

    res.status(200).json({
      success: true,
      message: 'Project rejected and returned to draft',
      project,
    });
  } catch (error) {
    logger.error('Reject project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject project',
    });
  }
};

// Admin: Launch project to funding
export const launchProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Only approved projects can be launched
    if (project.status !== 'approved') {
      res.status(400).json({ error: 'Only approved projects can be launched' });
      return;
    }

    project.status = 'funding';
    await project.save();

    logger.info(`Project launched to funding: ${project.id}`);

    res.status(200).json({
      success: true,
      message: 'Project launched successfully',
      project,
    });
  } catch (error) {
    logger.error('Launch project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to launch project',
    });
  }
};
