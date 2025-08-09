import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
  res.json({ 
    message: 'Notifications endpoint',
    data: [
      {
        id: '1',
        title: 'Audit Completed',
        message: 'ISO 22000 audit has been completed successfully',
        type: 'success',
        read: false,
        createdAt: new Date()
      },
      {
        id: '2',
        title: 'Action Due Soon',
        message: 'Corrective action is due in 2 days',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 3600000)
      }
    ],
    unreadCount: 2
  });
});

router.put('/:id/read', async (req: AuthenticatedRequest, res) => {
  res.json({ message: `Mark notification ${req.params.id} as read` });
});

router.put('/read-all', async (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Mark all notifications as read' });
});

export default router;
