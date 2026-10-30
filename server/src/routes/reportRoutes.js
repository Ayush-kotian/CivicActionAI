import express from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  assignReport,
  getCitizenTracking
} from '../controllers/reportController.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

// Citizen report creation (with optional image)
router.post('/', uploadMiddleware.single('image'), createReport);

// Query reports with search & filtering
router.get('/', getReports);

// Citizen public tracking lookup by complaintId
router.get('/tracking/:complaintId', getCitizenTracking);

// Detailed report lookup by ID or complaintId
router.get('/:id', getReportById);

// Update complaint status lifecycle
router.patch('/:id/status', updateReportStatus);

// Assign department & work lead
router.patch('/:id/assign', assignReport);

export default router;
