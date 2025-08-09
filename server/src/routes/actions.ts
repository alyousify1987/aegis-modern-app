import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Actions endpoint - coming soon', data: [] });
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Get action ${req.params.id} - coming soon` });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Create action - coming soon' });
});

router.put('/:id', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Update action ${req.params.id} - coming soon` });
});

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Delete action ${req.params.id} - coming soon` });
});

export default router;
