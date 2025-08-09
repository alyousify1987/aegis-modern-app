import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get all users
router.get('/', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Users endpoint - coming soon' });
});

// Get user by ID
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Get user ${req.params.id} - coming soon` });
});

// Create user
router.post('/', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Create user - coming soon' });
});

// Update user
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Update user ${req.params.id} - coming soon` });
});

// Delete user
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Delete user ${req.params.id} - coming soon` });
});

export default router;
