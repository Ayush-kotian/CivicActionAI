import express from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  assignReport,
  getCitizenTracking,
  updateDuplicateStatus,
  getMyReports
} from '../controllers/reportController.js';
import { uploadMiddleware } from '../middleware/upload.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Citizen report creation (strictly requires citizen login)
router.post('/', uploadMiddleware.single('image'), requireAuth, createReport);

// Citizen: view own complaints
router.get('/my-reports', requireAuth, getMyReports);

// Citizen public tracking lookup by complaintId
router.get('/tracking/:complaintId', getCitizenTracking);

// Query reports with search & filtering (Authority / Admin only)
router.get('/', requireAuth, requireAdmin, getReports);

// Detailed report lookup by ID or complaintId (Protected)
router.get('/:id', requireAuth, getReportById);

// Update complaint status lifecycle (Authority / Admin only)
router.patch('/:id/status', requireAuth, requireAdmin, updateReportStatus);

// Assign department & work lead (Authority / Admin only)
router.patch('/:id/assign', requireAuth, requireAdmin, assignReport);

// Update duplicate review status (Authority / Admin only)
router.patch('/:id/duplicate-status', requireAuth, requireAdmin, updateDuplicateStatus);

export default router;
