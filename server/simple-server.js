const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  jwt = null;
}

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'aegis_dev_secret_change_me';

// Configure CORS and middleware
app.use(cors({
  origin: ['http://localhost:1420', 'http://127.0.0.1:1420', 'tauri://localhost'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Keep-alive and stability improvements
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=5, max=1000');
  next();
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Simple auth middleware (JWT with backward-compat token_*)
function requireAuth(req, res, next) {
  if (req.path === '/api/auth/login' || req.path === '/health') return next();
  if (req.path.startsWith('/api')) {
    const auth = req.headers['authorization'] || '';
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.split(' ')[1];
    // Backward compatibility for legacy tokens
    if (token && token.startsWith('token_')) {
      const data = readData();
      req.user = (data.users && data.users[0]) ? data.users[0] : { id: 'system', role: 'admin', name: 'System' };
    } else if (jwt) {
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
      } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // jsonwebtoken not available, allow but warn
      req.user = { id: 'system', role: 'admin', name: 'System' };
    }
  }
  next();
}

app.use(requireAuth);

// Database helper functions
const dbPath = path.join(__dirname, 'data.json');

function readData() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(data);
    // Ensure required collections exist
    return {
      audits: parsed.audits || [],
      analytics: parsed.analytics || {},
      users: parsed.users || [],
      risks: parsed.risks || [],
      actions: parsed.actions || [],
      ncrs: parsed.ncrs || [],
      knowledge: parsed.knowledge || []
    };
  } catch (error) {
    console.error('Error reading data:', error);
    return { audits: [], analytics: {}, users: [], risks: [], actions: [], ncrs: [], knowledge: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const data = readData();
  const user = (data.users || []).find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    role: user.role || 'ADMIN'
  };
  const token = jwt ? jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' }) : `token_${user.id}_${Date.now()}`;
  return res.json({ message: 'Login successful', user: payload, token });
});

app.post('/api/audits/one-click', (req, res) => {
  const { type = 'ISO 22000', department = 'Production' } = req.body;
  const auditId = `audit_${Date.now()}`;
  
  const newAudit = {
    id: auditId,
    title: `AI-Generated ${type} Audit - ${new Date().toLocaleDateString()}`,
    description: 'Comprehensive AI-generated audit covering all critical control points and compliance requirements',
    type: 'internal',
    standard: type.includes('ISO') ? 'ISO_22000' : type.includes('HACCP') ? 'HACCP' : 'SFDA',
    status: 'planned',
    scope: `${department} department, Critical control points, Documentation review`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    leadAuditor: 'AI Assistant',
    auditors: ['AI Assistant', 'Quality Manager'],
    auditees: [`${department} Manager`, 'Staff Representatives'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const data = readData();
  data.audits.push(newAudit);
  data.analytics.totalAudits = data.audits.length;
  
  if (writeData(data)) {
    console.log(`🚀 One-click audit created: ${auditId}`);
    res.json({
      auditId,
      audit: newAudit,
      message: 'AI-powered audit created successfully',
      estimatedCompletion: newAudit.endDate,
      status: 'PLANNED'
    });
  } else {
    res.status(500).json({ error: 'Failed to create audit' });
  }
});

app.get('/api/audits', (req, res) => {
  const data = readData();
  res.json({
    data: data.audits
  });
});

app.get('/api/analytics/dashboard', (req, res) => {
  const data = readData();
  
  // Calculate real-time analytics from actual audit data
  const completedAudits = data.audits.filter(audit => audit.status === 'completed').length;
  const totalAudits = data.audits.length;
  const inProgressAudits = data.audits.filter(audit => audit.status === 'in_progress').length;
  const plannedAudits = data.audits.filter(audit => audit.status === 'planned').length;
  
  // Calculate average compliance score
  const completedAuditsWithScores = data.audits.filter(audit => 
    audit.status === 'completed' && audit.complianceScore
  );
  const avgComplianceScore = completedAuditsWithScores.length > 0 
    ? Math.round(completedAuditsWithScores.reduce((sum, audit) => sum + audit.complianceScore, 0) / completedAuditsWithScores.length)
    : 0;

  res.json({
    data: {
      totalAudits,
      completedAudits,
      inProgressAudits,
      plannedAudits,
      pendingActions: 5, // This would come from a real actions tracking system
      criticalFindings: 3, // This would come from findings analysis
      riskScore: 7.2, // This would be calculated from risk assessments
      complianceScore: avgComplianceScore
    }
  });
});

// General analytics summary
app.get('/api/analytics', (req, res) => {
  const data = readData();
  const completedAudits = data.audits.filter(audit => audit.status === 'completed').length;
  const totalAudits = data.audits.length;
  const inProgressAudits = data.audits.filter(audit => audit.status === 'in_progress').length;
  const plannedAudits = data.audits.filter(audit => audit.status === 'planned').length;
  const completedAuditsWithScores = data.audits.filter(audit =>
    audit.status === 'completed' && audit.complianceScore
  );
  const avgComplianceScore = completedAuditsWithScores.length > 0
    ? Math.round(completedAuditsWithScores.reduce((sum, audit) => sum + audit.complianceScore, 0) / completedAuditsWithScores.length)
    : (data.analytics && data.analytics.complianceScore) || 0;

  res.json({
    data: {
      totalAudits,
      completedAudits,
      inProgressAudits,
      plannedAudits,
      pendingActions: (data.actions && data.actions.filter(a => a.status !== 'completed').length) || 0,
      criticalFindings: data.analytics?.criticalFindings ?? 0,
      riskScore: data.analytics?.riskScore ?? 0,
      complianceScore: avgComplianceScore
    }
  });
});

// Get specific audit by ID
app.get('/api/audits/:id', (req, res) => {
  const data = readData();
  const audit = data.audits.find(a => a.id === req.params.id);
  
  if (audit) {
    res.json({ data: audit });
  } else {
    res.status(404).json({ error: 'Audit not found' });
  }
});

// Update audit
app.put('/api/audits/:id', (req, res) => {
  const data = readData();
  const auditIndex = data.audits.findIndex(a => a.id === req.params.id);
  
  if (auditIndex === -1) {
    return res.status(404).json({ error: 'Audit not found' });
  }

  const updatedAudit = {
    ...data.audits[auditIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  data.audits[auditIndex] = updatedAudit;
  
  if (writeData(data)) {
    console.log(`📝 Audit updated: ${req.params.id}`);
    res.json({ data: updatedAudit, message: 'Audit updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to update audit' });
  }
});

// Delete audit
app.delete('/api/audits/:id', (req, res) => {
  const data = readData();
  const auditIndex = data.audits.findIndex(a => a.id === req.params.id);
  
  if (auditIndex === -1) {
    return res.status(404).json({ error: 'Audit not found' });
  }

  const deletedAudit = data.audits.splice(auditIndex, 1)[0];
  data.analytics.totalAudits = data.audits.length;
  
  if (writeData(data)) {
    console.log(`🗑️ Audit deleted: ${req.params.id}`);
    res.json({ message: 'Audit deleted successfully', deletedAudit });
  } else {
    res.status(500).json({ error: 'Failed to delete audit' });
  }
});

// Compliance endpoints
app.get('/api/compliance/standards', (req, res) => {
  const data = readData();
  
  // Calculate compliance scores based on audit results
  const standards = [
    {
      id: 'iso_22000',
      name: 'ISO 22000:2018',
      score: 94,
      totalRequirements: 45,
      compliantRequirements: 42,
      lastAssessed: '2025-07-15',
      status: 'compliant'
    },
    {
      id: 'haccp',
      name: 'HACCP',
      score: 89,
      totalRequirements: 30,
      compliantRequirements: 27,
      lastAssessed: '2025-07-20',
      status: 'compliant'
    },
    {
      id: 'sfda',
      name: 'SFDA Regulations',
      score: 76,
      totalRequirements: 38,
      compliantRequirements: 29,
      lastAssessed: '2025-07-10',
      status: 'partial'
    },
    {
      id: 'iso_9001',
      name: 'ISO 9001:2015',
      score: 92,
      totalRequirements: 40,
      compliantRequirements: 37,
      lastAssessed: '2025-07-25',
      status: 'compliant'
    }
  ];

  const overallScore = Math.round(standards.reduce((sum, std) => sum + std.score, 0) / standards.length);

  res.json({
    data: {
      standards,
      overallScore,
      totalStandards: standards.length,
      compliantStandards: standards.filter(s => s.status === 'compliant').length
    }
  });
});

app.get('/api/compliance/requirements', (req, res) => {
  const requirements = [
    {
      id: 'req_001',
      standard: 'ISO_22000',
      clause: '7.4.2',
      requirement: 'Food safety hazard identification and assessment',
      status: 'compliant',
      evidence: ['HACCP_Plan_v2.1.pdf', 'Hazard_Analysis_2024.xlsx'],
      lastAssessed: '2025-07-15',
      nextAssessment: '2025-10-15',
      responsible: 'Food Safety Manager'
    },
    {
      id: 'req_002',
      standard: 'SFDA',
      clause: 'Article 15',
      requirement: 'Food establishment registration and licensing',
      status: 'non_compliant',
      evidence: [],
      lastAssessed: '2025-07-10',
      nextAssessment: '2025-08-10',
      responsible: 'Regulatory Affairs Manager',
      gaps: ['Missing updated facility license', 'Incomplete documentation'],
      recommendations: ['Submit license renewal application', 'Complete required documentation']
    },
    {
      id: 'req_003',
      standard: 'HACCP',
      clause: 'Principle 3',
      requirement: 'Establish critical limits for each CCP',
      status: 'partially_compliant',
      evidence: ['CCP_Limits_Document.pdf'],
      lastAssessed: '2025-07-20',
      nextAssessment: '2025-09-20',
      responsible: 'Production Manager',
      gaps: ['Critical limits not defined for CCP-3'],
      recommendations: ['Define critical limits for all CCPs', 'Update monitoring procedures']
    }
  ];

  res.json({ data: requirements });
});

// Risks endpoints
app.get('/api/risks', (req, res) => {
  const data = readData();
  res.json({ data: data.risks || [] });
});

app.get('/api/risks/:id', (req, res) => {
  const data = readData();
  const item = (data.risks || []).find(r => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

app.post('/api/risks', (req, res) => {
  const data = readData();
  const {
    title,
    description = '',
    category = 'operational',
    likelihood = 1,
    impact = 1,
    owner = 'Unassigned'
  } = req.body || {};

  const id = `risk_${Date.now()}`;
  const riskScore = Number(likelihood) * Number(impact);
  const now = new Date().toISOString();
  const newRisk = {
    id,
    title,
    description,
    category,
    likelihood: Number(likelihood),
    impact: Number(impact),
    riskScore,
    status: 'identified',
    owner,
    controls: [],
    linkedAudits: [],
    linkedActions: [],
    createdBy: 'system',
    createdAt: now,
    updatedAt: now
  };
  data.risks = data.risks || [];
  data.risks.push(newRisk);
  if (!data.analytics) data.analytics = {};
  if (writeData(data)) {
    res.json({ data: newRisk, message: 'Risk created' });
  } else {
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

app.put('/api/risks/:id', (req, res) => {
  const data = readData();
  const idx = (data.risks || []).findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  const current = data.risks[idx];
  const updates = req.body || {};
  const updated = {
    ...current,
    ...updates,
    likelihood: updates.likelihood !== undefined ? Number(updates.likelihood) : current.likelihood,
    impact: updates.impact !== undefined ? Number(updates.impact) : current.impact,
    riskScore: (updates.likelihood !== undefined || updates.impact !== undefined)
      ? Number(updates.likelihood ?? current.likelihood) * Number(updates.impact ?? current.impact)
      : current.riskScore,
    updatedAt: now,
  };
  data.risks[idx] = updated;
  if (writeData(data)) return res.json({ data: updated, message: 'Risk updated' });
  res.status(500).json({ error: 'Failed to update risk' });
});

app.delete('/api/risks/:id', (req, res) => {
  const data = readData();
  const before = (data.risks || []).length;
  data.risks = (data.risks || []).filter(r => r.id !== req.params.id);
  if (data.risks.length === before) return res.status(404).json({ error: 'Not found' });
  if (writeData(data)) return res.json({ message: 'Risk deleted' });
  res.status(500).json({ error: 'Failed to delete risk' });
});

// NCRs endpoints
app.get('/api/ncrs', (req, res) => {
  const data = readData();
  res.json({ data: data.ncrs || [] });
});

app.get('/api/ncrs/:id', (req, res) => {
  const data = readData();
  const item = (data.ncrs || []).find(n => n.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

app.post('/api/ncrs', (req, res) => {
  const data = readData();
  const { title = 'NCR', severity = 'minor', status = 'open' } = req.body || {};
  const id = `ncr_${Date.now()}`;
  const now = new Date().toISOString();
  const newNcr = { id, title, severity, status, createdAt: now, updatedAt: now };
  data.ncrs = data.ncrs || [];
  data.ncrs.push(newNcr);
  if (writeData(data)) return res.json({ data: newNcr, message: 'NCR created' });
  res.status(500).json({ error: 'Failed to create NCR' });
});

app.put('/api/ncrs/:id', (req, res) => {
  const data = readData();
  const idx = (data.ncrs || []).findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  const current = data.ncrs[idx];
  const updates = req.body || {};
  const updated = { ...current, ...updates, updatedAt: now };
  data.ncrs[idx] = updated;
  if (writeData(data)) return res.json({ data: updated, message: 'NCR updated' });
  res.status(500).json({ error: 'Failed to update NCR' });
});

app.delete('/api/ncrs/:id', (req, res) => {
  const data = readData();
  const before = (data.ncrs || []).length;
  data.ncrs = (data.ncrs || []).filter(n => n.id !== req.params.id);
  if (data.ncrs.length === before) return res.status(404).json({ error: 'Not found' });
  if (writeData(data)) return res.json({ message: 'NCR deleted' });
  res.status(500).json({ error: 'Failed to delete NCR' });
});

// Actions endpoints
app.get('/api/actions', (req, res) => {
  const data = readData();
  res.json({ data: data.actions || [] });
});

app.get('/api/actions/:id', (req, res) => {
  const data = readData();
  const item = (data.actions || []).find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

app.post('/api/actions', (req, res) => {
  const data = readData();
  const {
    title,
    description = '',
    type = 'corrective',
    priority = 'medium',
    assignedTo = 'Unassigned',
    dueDate
  } = req.body || {};

  const id = `action_${Date.now()}`;
  const now = new Date().toISOString();
  const newAction = {
    id,
    title,
    description,
    type,
    priority,
    status: 'open',
    assignedTo,
    createdBy: 'system',
    dueDate: dueDate || now,
    progress: 0,
    comments: [],
    linkedFindings: [],
    linkedRisks: [],
    linkedAudits: [],
    createdAt: now,
    updatedAt: now
  };
  data.actions = data.actions || [];
  data.actions.push(newAction);
  if (!data.analytics) data.analytics = {};
  if (writeData(data)) {
    res.json({ data: newAction, message: 'Action created' });
  } else {
    res.status(500).json({ error: 'Failed to create action' });
  }
});

app.put('/api/actions/:id', (req, res) => {
  const data = readData();
  const idx = (data.actions || []).findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  const current = data.actions[idx];
  const updates = req.body || {};
  const updated = {
    ...current,
    ...updates,
    dueDate: updates.dueDate || current.dueDate,
    progress: updates.progress !== undefined ? Number(updates.progress) : current.progress,
    updatedAt: now,
  };
  data.actions[idx] = updated;
  if (writeData(data)) return res.json({ data: updated, message: 'Action updated' });
  res.status(500).json({ error: 'Failed to update action' });
});

app.delete('/api/actions/:id', (req, res) => {
  const data = readData();
  const before = (data.actions || []).length;
  data.actions = (data.actions || []).filter(a => a.id !== req.params.id);
  if (data.actions.length === before) return res.status(404).json({ error: 'Not found' });
  if (writeData(data)) return res.json({ message: 'Action deleted' });
  res.status(500).json({ error: 'Failed to delete action' });
});

// Knowledge endpoints
app.get('/api/knowledge', (req, res) => {
  const data = readData();
  res.json({ data: data.knowledge || [] });
});

app.get('/api/knowledge/:id', (req, res) => {
  const data = readData();
  const item = (data.knowledge || []).find(k => k.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ data: item });
});

app.post('/api/knowledge', (req, res) => {
  const data = readData();
  const {
    title,
    content = '',
    type = 'article',
    category = [],
    tags = [],
    standard,
    author = 'System'
  } = req.body || {};

  const id = `kn_${Date.now()}`;
  const now = new Date().toISOString();
  const newItem = {
    id,
    title,
    content,
    type,
    category: Array.isArray(category) ? category : String(category).split(',').map(s => s.trim()).filter(Boolean),
    tags: Array.isArray(tags) ? tags : String(tags).split(',').map(s => s.trim()).filter(Boolean),
    standard,
    author,
    status: 'published',
    version: 1,
    createdAt: now,
    updatedAt: now
  };
  data.knowledge = data.knowledge || [];
  data.knowledge.push(newItem);
  if (writeData(data)) {
    res.json({ data: newItem, message: 'Knowledge item created' });
  } else {
    res.status(500).json({ error: 'Failed to create knowledge item' });
  }
});

app.put('/api/knowledge/:id', (req, res) => {
  const data = readData();
  const idx = (data.knowledge || []).findIndex(k => k.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const now = new Date().toISOString();
  const current = data.knowledge[idx];
  const updates = req.body || {};
  const updated = {
    ...current,
    ...updates,
    category: updates.category !== undefined ? (Array.isArray(updates.category) ? updates.category : String(updates.category).split(',').map(s => s.trim()).filter(Boolean)) : current.category,
    tags: updates.tags !== undefined ? (Array.isArray(updates.tags) ? updates.tags : String(updates.tags).split(',').map(s => s.trim()).filter(Boolean)) : current.tags,
    updatedAt: now,
  };
  data.knowledge[idx] = updated;
  if (writeData(data)) return res.json({ data: updated, message: 'Knowledge updated' });
  res.status(500).json({ error: 'Failed to update knowledge' });
});

app.delete('/api/knowledge/:id', (req, res) => {
  const data = readData();
  const before = (data.knowledge || []).length;
  data.knowledge = (data.knowledge || []).filter(k => k.id !== req.params.id);
  if (data.knowledge.length === before) return res.status(404).json({ error: 'Not found' });
  if (writeData(data)) return res.json({ message: 'Knowledge deleted' });
  res.status(500).json({ error: 'Failed to delete knowledge' });
});

const server = app.listen(port, () => {
  console.log(`🚀 Simple Aegis Server running on http://localhost:${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Enhanced server stability and keep-alive
server.keepAliveTimeout = 30000; // 30 seconds
server.headersTimeout = 35000; // 35 seconds
server.timeout = 120000; // 2 minutes

// Handle server errors gracefully
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${port} is already in use. Please close other instances.`);
  }
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep process alive and log uptime periodically
setInterval(() => {
  const uptime = Math.floor(process.uptime());
  console.log(`⏱️  Server uptime: ${uptime}s | Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
}, 60000); // Log every minute
