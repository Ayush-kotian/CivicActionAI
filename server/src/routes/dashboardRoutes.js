import express from 'express';
import {
  getDashboardStats,
  getHotspots,
  getInsights
} from '../controllers/dashboardController.js';

const router = express.Router();

// Real-time KPI counters & distribution breakdown
router.get('/stats', getDashboardStats);

// Geospatial cluster & hotspot data
router.get('/hotspots', getHotspots);

// High-level pattern insights & recurring issue alerts
router.get('/insights', getInsights);

export default router;
