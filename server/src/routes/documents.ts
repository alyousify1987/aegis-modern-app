import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Documents endpoint - coming soon', data: [] });
});

router.post('/upload', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Document upload - coming soon' });
});

router.get('/:id/download', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Download document ${req.params.id} - coming soon` });
});

export default router;
