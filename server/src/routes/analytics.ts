import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Main analytics endpoint that the frontend expects
router.get('/', async (req: AuthenticatedRequest, res) => {
  res.json({ 
    message: 'Analytics data',
    data: {
      totalAudits: 42,
      completedAudits: 35,
      pendingActions: 18,
      criticalFindings: 3,
      riskScore: 2.4,
      metrics: {
        total: 42,
        completed: 35,
        pending: 7
      }
    }
  });
});

router.get('/dashboard', async (req: AuthenticatedRequest, res) => {
  res.json({ 
    message: 'Analytics dashboard data',
    data: {
      totalAudits: 42,
      completedAudits: 35,
      pendingActions: 18,
      criticalFindings: 3,
      riskScore: 2.4
    }
  });
});

router.get('/reports', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Analytics reports - coming soon', data: [] });
});

router.get('/metrics', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Analytics metrics - coming soon', data: [] });
});

export default router;
