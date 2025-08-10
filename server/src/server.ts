import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import winston from 'winston';

const app = express();
const port = 3001;

// Setup basic logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:1420',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@aegisaudit.com' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      user: {
        id: 'admin-user-id',
        email: 'admin@aegisaudit.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      },
      token: 'dev-token-123'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Mock endpoints for development
app.get('/api/audits', (req, res) => {
  res.json({
    data: [
      {
        id: '1',
        title: 'ISO 22000 Internal Audit Q1 2024',
        type: 'INTERNAL',
        status: 'IN_PROGRESS',
        standard: 'ISO 22000:2018',
        startDate: '2024-01-15',
        endDate: '2024-01-25',
        score: 85,
        department: 'Production',
        auditor: 'Sarah Johnson'
      },
      {
        id: '2',
        title: 'HACCP System Review',
        type: 'COMPLIANCE',
        status: 'COMPLETED',
        standard: 'HACCP',
        startDate: '2024-01-10',
        endDate: '2024-01-12',
        score: 92,
        department: 'Quality Control',
        auditor: 'Mike Chen'
      },
      {
        id: '3',
        title: 'SFDA Compliance Check',
        type: 'REGULATORY',
        status: 'SCHEDULED',
        standard: 'SFDA Guidelines',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        score: null,
        department: 'Regulatory Affairs',
        auditor: 'Ahmed Al-Rashid'
      }
    ],
    total: 3
  });
});

// Additional audit endpoints
app.get('/api/audits/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    data: {
      id,
      title: 'ISO 22000 Internal Audit Q1 2024',
      type: 'INTERNAL',
      status: 'IN_PROGRESS',
      standard: 'ISO 22000:2018',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      score: 85,
      findings: 5,
      criticalFindings: 1,
      progress: 75
    }
  });
});

// One-click audit endpoint
app.post('/api/audits/one-click', (req, res) => {
  const { type = 'ISO 22000', department = 'Production' } = req.body;
  
  const auditId = `audit-${Date.now()}`;
  const estimatedCompletion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  logger.info(`🚀 One-click audit initiated: ${auditId} for ${department} department`);
  
  res.json({
    auditId,
    message: 'One-click audit initiated successfully',
    estimatedCompletion: estimatedCompletion.toISOString(),
    status: 'INITIATED',
    type,
    department,
    checklist: {
      totalItems: 45,
      completedItems: 0,
      categories: ['Documentation', 'Processes', 'Training', 'Records']
    },
    assignedAuditor: 'System Auto-Assign'
  });
});

// Create new audit endpoint
app.post('/api/audits', (req, res) => {
  const { title, type, standard, department, auditor, startDate, endDate } = req.body;
  
  if (!title || !type || !standard) {
    return res.status(400).json({ error: 'Missing required fields: title, type, standard' });
  }
  
  const newAudit = {
    id: `audit-${Date.now()}`,
    title,
    type,
    status: 'PLANNED',
    standard,
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    score: null,
    department: department || 'General',
    auditor: auditor || 'Unassigned',
    createdAt: new Date().toISOString()
  };
  
  logger.info(`📋 New audit created: ${newAudit.id} - ${title}`);
  
  return res.status(201).json({
    data: newAudit,
    message: 'Audit created successfully'
  });
});

app.get('/api/findings', (req, res) => {
  res.json({
    data: [
      {
        id: '1',
        title: 'Temperature Log Incomplete',
        severity: 'HIGH',
        status: 'OPEN',
        auditId: '1',
        clause: '7.2.3',
        description: 'Temperature monitoring records missing for cold storage unit B',
        createdAt: '2024-01-16'
      },
      {
        id: '2',
        title: 'Cleaning Schedule Not Updated',
        severity: 'MEDIUM',
        status: 'IN_PROGRESS',
        auditId: '1',
        clause: '8.1.1',
        description: 'Weekly cleaning schedule not updated for equipment maintenance',
        createdAt: '2024-01-17'
      }
    ],
    total: 2
  });
});

// NCR endpoints
app.get('/api/ncrs', (req, res) => {
  res.json({
    data: [
      {
        id: '1',
        title: 'Non-conformance in Temperature Control',
        severity: 'major',
        status: 'OPEN',
        auditId: '1',
        clause: '7.2.3',
        description: 'Temperature monitoring system failure in cold storage',
        createdAt: '2024-01-16',
        department: 'Production'
      },
      {
        id: '2',
        title: 'Documentation Missing',
        severity: 'minor',
        status: 'IN_PROGRESS',
        auditId: '2',
        clause: '4.2.4',
        description: 'Training records not properly maintained',
        createdAt: '2024-01-17',
        department: 'Quality'
      }
    ],
    total: 2
  });
});

app.post('/api/ncrs', (req, res) => {
  const { title, severity, description, clause, department } = req.body;
  
  const newNCR = {
    id: `ncr-${Date.now()}`,
    title: title || 'New Non-Conformance',
    severity: severity || 'minor',
    status: 'OPEN',
    auditId: 'audit-current',
    clause: clause || '4.1',
    description: description || 'Auto-generated NCR',
    createdAt: new Date().toISOString(),
    department: department || 'General'
  };
  
  logger.info(`📋 New NCR created: ${newNCR.id} - ${title}`);
  
  return res.status(201).json({
    data: newNCR,
    message: 'NCR created successfully'
  });
});

app.post('/api/audits/one-click', (req, res) => {
  const { type = 'ISO 22000', department = 'Production' } = req.body;
  
  const auditId = `audit-${Date.now()}`;
  const estimatedCompletion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  logger.info(`🚀 One-click audit initiated: ${auditId} for ${department} department`);
  
  res.json({
    auditId,
    message: 'One-click audit initiated successfully',
    estimatedCompletion: estimatedCompletion.toISOString(),
    status: 'INITIATED',
    type,
    department,
    checklist: {
      totalItems: 45,
      completedItems: 0,
      categories: ['Documentation', 'Processes', 'Training', 'Records']
    },
    assignedAuditor: 'System Auto-Assign'
  });
});

// Analytics endpoints
app.get('/api/analytics', (req, res) => {
  res.json({
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

app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    data: {
      totalAudits: 42,
      completedAudits: 35,
      pendingActions: 18,
      criticalFindings: 3,
      riskScore: 2.4
    }
  });
});

app.get('/api/notifications', (req, res) => {
  res.json({
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

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`🚀 Aegis Audit API Server running on http://localhost:${port}`);
  logger.info(`📊 Environment: development`);
  logger.info(`🔧 Simple development server mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
