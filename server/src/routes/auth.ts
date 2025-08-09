import express from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

const router = express.Router();

// Simple login endpoint for development
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // For development - simple password check
    if (email === 'admin@aegisaudit.com' && password === 'admin123') {
      const payload = {
        userId: 'admin-user-id',
        email: 'admin@aegisaudit.com',
        role: 'ADMIN'
      };

      const token = jwt.sign(payload, config.jwt.secret);

      res.json({
        message: 'Login successful',
        user: {
          id: 'admin-user-id',
          email: 'admin@aegisaudit.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        },
        token
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // For development - return mock user
    res.json({
      id: decoded.userId,
      email: decoded.email,
      firstName: 'Admin',
      lastName: 'User',
      role: decoded.role,
      department: 'IT',
      position: 'System Administrator'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
