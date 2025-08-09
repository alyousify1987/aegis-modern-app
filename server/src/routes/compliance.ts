import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Compliance endpoint - coming soon', data: [] });
});

router.get('/policies', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Policies endpoint - coming soon', data: [] });
});

router.get('/controls', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Controls endpoint - coming soon', data: [] });
});

export default router;
