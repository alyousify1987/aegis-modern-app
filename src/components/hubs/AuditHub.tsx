import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  Assessment as AuditIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import type { Audit, AuditStatus, StandardType, AuditType } from '../../types';
import { useToast } from '../../components/ToastProvider';
import { apiFetch } from '../../utils/api';
import { getAudits as getCachedAudits, saveAudits } from '../../services/audits/cache';
import { toCSV, downloadCSV } from '../../utils/csv';
import { OfflineBanner } from '../../components/OfflineBanner';
import { enqueue as enqueueSync } from '../../services/net/syncQueue';
import { isOnline } from '../../services/net/health';
import { ProgressDialog } from '../../components/ProgressDialog';
import { 
  ISO22000_CLAUSES, 
  getAllAuditQuestions, 
  generateAuditSummary,
  type AuditQuestion,
  type AuditClause 
} from '../../data/iso22000Clauses';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`audit-tabpanel-${index}`}
      aria-labelledby={`audit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const getStatusColor = (status: AuditStatus): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'primary';
    case 'planned': return 'info';
    case 'review': return 'warning';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

export function AuditHub() {
  const { notify } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAudit, setNewAudit] = useState({
    title: '',
    description: '',
    type: '' as AuditType,
    standard: '' as StandardType,
    scope: '',
    startDate: '',
    leadAuditor: '',
  });
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewAudit, setViewAudit] = useState<Audit | null>(null);
  const [auditQuestions, setAuditQuestions] = useState<AuditQuestion[]>([]);
  const [expandedClause, setExpandedClause] = useState<string | false>(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressText, setProgressText] = useState('Preparing...');

  useEffect(() => {
    (async () => {
      const cached = await getCachedAudits();
      if (cached?.length) setAudits(cached);
      fetchAudits();
    })();
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await apiFetch('/api/audits');
      if (response.ok) {
        const result = await response.json();
        setAudits(result.data);
        try { await saveAudits(result.data); } catch {}
      } else {
        setError('Failed to fetch audits');
      }
    } catch (error) {
      setError('Connection error');
      console.error('Audit fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, auditId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedAuditId(auditId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAuditId(null);
  };

  const handleViewAudit = async () => {
    if (!selectedAuditId) return;
    const a = audits.find(a => a.id === selectedAuditId) || null;
    setViewAudit(a);
    
    // Load complete ISO 22000 audit questions
    const allQuestions = getAllAuditQuestions();
    
    // Check if this audit has saved responses
    const savedResponses = localStorage.getItem(`audit-responses-${selectedAuditId}`);
    if (savedResponses) {
      try {
        const responses = JSON.parse(savedResponses);
        const questionsWithResponses = allQuestions.map(q => ({
          ...q,
          conformance: responses[q.id]?.conformance || 'pending',
          evidence: responses[q.id]?.evidence || [],
          comments: responses[q.id]?.comments || ''
        }));
        setAuditQuestions(questionsWithResponses);
      } catch {
        setAuditQuestions(allQuestions);
      }
    } else {
      setAuditQuestions(allQuestions);
    }
    
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleQuestionResponse = (questionId: string, conformance: string, comments?: string) => {
    setAuditQuestions(prev => {
      const updated = prev.map(q => 
        q.id === questionId 
          ? { ...q, conformance: conformance as any, comments: comments || q.comments }
          : q
      );
      
      // Save responses to localStorage
      if (selectedAuditId) {
        const responses: Record<string, any> = {};
        updated.forEach(q => {
          responses[q.id] = {
            conformance: q.conformance,
            comments: q.comments,
            evidence: q.evidence
          };
        });
        localStorage.setItem(`audit-responses-${selectedAuditId}`, JSON.stringify(responses));
      }
      
      return updated;
    });
  };

  const handleClauseExpansion = (clauseId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedClause(isExpanded ? clauseId : false);
  };

  const handleEditAudit = () => {
    if (selectedAuditId) {
      notify(`Editing audit: ${selectedAuditId}`, 'info');
    }
    handleMenuClose();
  };

  const handleDeleteAudit = async () => {
    if (selectedAuditId) {
      const confirmed = window.confirm('Are you sure you want to delete this audit?');
      if (confirmed) {
        try {
          // Optimistic remove locally
          setAudits(prev => prev.filter(a => a.id !== selectedAuditId));
          await saveAudits(audits.filter(a => a.id !== selectedAuditId));
          if (isOnline()) {
            const response = await apiFetch(`/api/audits/${selectedAuditId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Server delete failed');
          } else {
            await enqueueSync({ method: 'DELETE', path: `/api/audits/${selectedAuditId}` });
          }
          notify('Audit delete queued', 'success');
        } catch (error) {
          notify('Error deleting audit: ' + (error as Error).message, 'error');
        }
      }
    }
    handleMenuClose();
  };

  const handleCreateAudit = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewAudit({
      title: '',
      description: '',
      type: '' as AuditType,
      standard: '' as StandardType,
      scope: '',
      startDate: '',
      leadAuditor: '',
    });
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      const payload = { type: newAudit.standard, department: 'Custom' };
      if (isOnline()) {
        const response = await apiFetch('/api/audits/one-click', { method: 'POST', body: JSON.stringify(payload) });
        if (response.ok) {
          const result = await response.json();
          notify(`Audit created: ${result.audit.title}`, 'success');
          handleCreateDialogClose();
          fetchAudits();
        } else {
          notify('Failed to create audit', 'error');
        }
      } else {
        // Optimistic placeholder
        const tempId = `temp-${Date.now()}`;
        const now = new Date();
        const optimistic: Audit = {
          id: tempId,
          title: newAudit.title || 'New Audit',
          description: newAudit.description,
          type: (newAudit.type || 'internal') as AuditType,
          standard: (newAudit.standard || 'ISO_22000') as StandardType,
          status: 'planned',
          scope: newAudit.scope,
          startDate: now,
          leadAuditor: newAudit.leadAuditor || 'TBD',
          auditors: [],
          auditees: [],
          findings: [],
          evidence: [],
          createdBy: 'me',
          createdAt: now,
          updatedAt: now,
        };
        setAudits(prev => [optimistic, ...prev]);
        await saveAudits([optimistic, ...audits]);
        await enqueueSync({ method: 'POST', path: '/api/audits/one-click', body: payload });
        handleCreateDialogClose();
        notify('Audit creation queued (offline)', 'info');
      }
    } catch (error) {
      notify('Error creating audit: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickAudit = async () => {
    // Opens a folder picker (works in browser and Tauri) and sends basic ingestion metadata
    const pickFolderFiles = (): Promise<File[] | null> =>
      new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        // @ts-ignore - webkitdirectory is supported by Chromium-based engines and Tauri WebView
        input.webkitdirectory = true;
        input.multiple = true;
        input.style.display = 'none';
        input.onchange = () => {
          const files = Array.from(input.files || []);
          resolve(files);
          input.remove();
        };
        document.body.appendChild(input);
        input.click();
      });

    try {
      setLoading(true);
      setProgressOpen(true);
      setProgressText('Select a folder to analyze...');
  const files = await pickFolderFiles();
  if (files == null) {
        setLoading(false);
        setProgressOpen(false);
        return; // user cancelled
      }

      // Collect lightweight metadata only (no upload yet)
  const fileCount = files.length;
      const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
      const sample = files.slice(0, 5).map(f => ({ name: f.name, size: f.size }));

      const payload = {
        type: 'ISO 22000',
        department: 'Production',
        ingestion: { fileCount, totalBytes, sample },
      };

  if (isOnline()) {
    setProgressText('Uploading ingestion metadata...');
        const response = await apiFetch('/api/audits/one-click', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const result = await response.json();
          notify(`One-Click Audit created from ${fileCount} files (~${Math.round(totalBytes/1024)} KB) — ${result.audit.title}`, 'success');
          fetchAudits();
        } else {
          notify('Failed to create one-click audit', 'error');
        }
      } else {
        // Offline: add an optimistic local audit and queue the creation
        const now = new Date();
        const tempId = `temp-${Date.now()}`;
        const optimistic: Audit = {
          id: tempId,
          title: `AI-Generated ISO 22000 Audit - ${now.toLocaleDateString()}`,
          description: 'Auto-generated from local folder ingestion',
          type: 'internal' as AuditType,
          standard: 'ISO_22000' as StandardType,
          status: 'planned',
          scope: 'Folder ingestion summary',
          startDate: now,
          leadAuditor: 'AI Assistant',
          auditors: [],
          auditees: [],
          findings: [],
          evidence: files.slice(0, 50).map(f => ({ name: f.name, size: f.size } as any)),
          createdBy: 'me',
          createdAt: now,
          updatedAt: now,
        };
        setAudits(prev => [optimistic, ...prev]);
        await saveAudits([optimistic, ...audits]);
        setProgressText('Queuing for sync when back online...');
        await enqueueSync({ method: 'POST', path: '/api/audits/one-click', body: payload });
        notify(`Queued one-click audit from ${fileCount} files (offline)`, 'info');
      }
    } catch (error) {
      notify('Error creating audit: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
      setProgressOpen(false);
    }
  };

  if (loading && audits.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error} - Make sure the backend server is running on localhost:3001
      </Alert>
    );
  }

  const activeAudits = audits.filter(audit => 
    audit.status === 'in_progress' || audit.status === 'planned'
  );

  const completedAudits = audits.filter(audit => 
    audit.status === 'completed'
  );

  return (
    <Box>
  <OfflineBanner />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Audit Hub
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOneClickAudit}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#45a049' },
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 'bold',
            }}
          >
            🚀 One Click Audit
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateAudit}
          >
            Custom Audit
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const rows = completedAudits.map(a => ({
                id: a.id,
                title: a.title,
                type: a.type,
                standard: a.standard,
                endDate: a.endDate,
                complianceScore: a.complianceScore ?? '',
                leadAuditor: a.leadAuditor,
              }));
              const csv = toCSV(rows);
              downloadCSV('completed_audits.csv', csv);
            }}
          >
            Export Completed CSV
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Plan, execute, and manage audits with AI-powered assistance. Use "One Click Audit" for instant AI-generated comprehensive audits.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Active Audits" />
          <Tab label="Completed Audits" />
          <Tab label="Calendar" />
          <Tab label="Templates" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {activeAudits.map((audit) => (
            <Grid item xs={12} md={6} lg={4} key={audit.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Chip
                      label={audit.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(audit.status)}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, audit.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="h6" component="div" mb={1}>
                    {audit.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {audit.description}
                  </Typography>

                  <Box display="flex" alignItems="center" mb={1}>
                    <AuditIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {audit.standard} • {audit.type}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(audit.startDate).toLocaleDateString()}
                      {audit.endDate && ` - ${new Date(audit.endDate).toLocaleDateString()}`}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Lead: {audit.leadAuditor}
                    </Typography>
                  </Box>

                  {audit.complianceScore && (
                    <Box mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Compliance Score: {audit.complianceScore}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button size="small" startIcon={<ViewIcon />}>
                    View
                  </Button>
                  <Button size="small" startIcon={<EditIcon />}>
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Standard</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell>Compliance Score</TableCell>
                <TableCell>Lead Auditor</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedAudits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>{audit.title}</TableCell>
                  <TableCell>
                    <Chip label={audit.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{audit.standard}</TableCell>
                  <TableCell>{audit.endDate ? new Date(audit.endDate).toLocaleDateString() : 'In Progress'}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color={
                        (audit.complianceScore || 0) >= 90 ? 'success.main' :
                        (audit.complianceScore || 0) >= 75 ? 'warning.main' : 'error.main'
                      }>
                        {audit.complianceScore}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{audit.leadAuditor}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" mb={2}>
          Audit Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Calendar view loading - scheduled audits, deadlines, and availability will be displayed here.
          </Typography>
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" mb={2}>
          Audit Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pre-configured audit templates for ISO 22000, HACCP, SFDA, and custom standards.
        </Typography>
      </TabPanel>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewAudit}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEditAudit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Audit
        </MenuItem>
        <MenuItem onClick={handleDeleteAudit}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Audit Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Audit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Audit Title"
            fullWidth
            variant="outlined"
            value={newAudit.title}
            onChange={(e) => setNewAudit({ ...newAudit, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newAudit.description}
            onChange={(e) => setNewAudit({ ...newAudit, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Audit Type</InputLabel>
                <Select
                  value={newAudit.type}
                  label="Audit Type"
                  onChange={(e) => setNewAudit({ ...newAudit, type: e.target.value as AuditType })}
                >
                  <MenuItem value="internal">Internal</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                  <MenuItem value="certification">Certification</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Standard</InputLabel>
                <Select
                  value={newAudit.standard}
                  label="Standard"
                  onChange={(e) => setNewAudit({ ...newAudit, standard: e.target.value as StandardType })}
                >
                  <MenuItem value="ISO_22000">ISO 22000</MenuItem>
                  <MenuItem value="HACCP">HACCP</MenuItem>
                  <MenuItem value="SFDA">SFDA</MenuItem>
                  <MenuItem value="ISO_9001">ISO 9001</MenuItem>
                  <MenuItem value="ISO_14001">ISO 14001</MenuItem>
                  <MenuItem value="ISO_45001">ISO 45001</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            margin="dense"
            label="Scope"
            fullWidth
            variant="outlined"
            value={newAudit.scope}
            onChange={(e) => setNewAudit({ ...newAudit, scope: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newAudit.startDate}
            onChange={(e) => setNewAudit({ ...newAudit, startDate: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Lead Auditor"
            fullWidth
            variant="outlined"
            value={newAudit.leadAuditor}
            onChange={(e) => setNewAudit({ ...newAudit, leadAuditor: e.target.value })}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Create Audit
          </Button>
        </DialogActions>
      </Dialog>

      {/* ISO 22000 Comprehensive Audit Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5">{viewAudit?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {viewAudit?.standard} • {viewAudit?.type} • Lead: {viewAudit?.leadAuditor}
              </Typography>
            </Box>
            <Box>
              {auditQuestions.length > 0 && (() => {
                const summary = generateAuditSummary(auditQuestions);
                return (
                  <Box textAlign="right">
                    <Typography variant="h6" color="primary">
                      {summary.complianceScore}% Compliance
                    </Typography>
                    <Typography variant="body2">
                      {summary.completed}/{summary.total} Questions ({summary.conformant} ✓, {summary.nonConformant} ✗)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(summary.completed / summary.total) * 100} 
                      sx={{ mt: 1, width: 200 }}
                    />
                  </Box>
                );
              })()}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ height: '80vh', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            ISO 22000:2018 Audit Checklist - Complete Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This comprehensive audit covers all clauses of ISO 22000:2018, HACCP principles, and Prerequisite Programs.
            Answer each question based on objective evidence and document findings.
          </Typography>

          {ISO22000_CLAUSES.map((clause) => (
            <Accordion 
              key={clause.id}
              expanded={expandedClause === clause.id}
              onChange={handleClauseExpansion(clause.id)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                  <Box>
                    <Typography variant="h6">
                      Clause {clause.clauseNumber}: {clause.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {clause.description}
                    </Typography>
                  </Box>
                  <Box textAlign="right" mr={2}>
                    {(() => {
                      const clauseQuestions = auditQuestions.filter(q => q.clause.startsWith(clause.clauseNumber));
                      const answered = clauseQuestions.filter(q => q.conformance !== 'pending').length;
                      const conformant = clauseQuestions.filter(q => q.conformance === 'conformant').length;
                      return (
                        <Box>
                          <Typography variant="body2">
                            {answered}/{clauseQuestions.length} answered
                          </Typography>
                          <Chip 
                            label={`${conformant}✓ ${clauseQuestions.filter(q => q.conformance === 'non-conformant').length}✗`}
                            size="small"
                            color={answered === clauseQuestions.length ? "success" : "default"}
                          />
                        </Box>
                      );
                    })()}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {clause.questions.map((question) => {
                    const currentQuestion = auditQuestions.find(q => q.id === question.id) || question;
                    return (
                      <Card key={question.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                        <CardContent>
                          <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                            {question.clause}: {question.question}
                          </Typography>
                          
                          <FormControl component="fieldset" sx={{ mt: 2 }}>
                            <FormLabel component="legend">Conformance Assessment</FormLabel>
                            <RadioGroup
                              row
                              value={currentQuestion.conformance}
                              onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                            >
                              <FormControlLabel 
                                value="conformant" 
                                control={<Radio />} 
                                label="✓ Conformant" 
                                sx={{ color: 'success.main' }}
                              />
                              <FormControlLabel 
                                value="non-conformant" 
                                control={<Radio />} 
                                label="✗ Non-Conformant"
                                sx={{ color: 'error.main' }}
                              />
                              <FormControlLabel 
                                value="not-applicable" 
                                control={<Radio />} 
                                label="N/A"
                                sx={{ color: 'text.secondary' }}
                              />
                            </RadioGroup>
                          </FormControl>

                          <TextField
                            label="Comments / Evidence / Findings"
                            multiline
                            rows={2}
                            fullWidth
                            sx={{ mt: 2 }}
                            value={currentQuestion.comments || ''}
                            onChange={(e) => handleQuestionResponse(question.id, currentQuestion.conformance, e.target.value)}
                            placeholder="Document objective evidence, reference specific documents, note any non-conformities..."
                          />

                          {currentQuestion.linkedDocuments && currentQuestion.linkedDocuments.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                📎 Linked Documents: {currentQuestion.linkedDocuments.join(', ')}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Additional HACCP and PRP Questions */}
          <Accordion sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">HACCP Principles & Prerequisite Programs</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Additional detailed questions covering the 7 HACCP principles and prerequisite program requirements.
              </Typography>
              {auditQuestions
                .filter(q => q.clause.includes('HACCP') || q.clause.includes('PRP'))
                .map((question) => (
                  <Card key={question.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                        {question.clause}: {question.question}
                      </Typography>
                      
                      <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel component="legend">Conformance Assessment</FormLabel>
                        <RadioGroup
                          row
                          value={question.conformance}
                          onChange={(e) => handleQuestionResponse(question.id, e.target.value)}
                        >
                          <FormControlLabel value="conformant" control={<Radio />} label="✓ Conformant" />
                          <FormControlLabel value="non-conformant" control={<Radio />} label="✗ Non-Conformant" />
                          <FormControlLabel value="not-applicable" control={<Radio />} label="N/A" />
                        </RadioGroup>
                      </FormControl>

                      <TextField
                        label="Comments / Evidence / Findings"
                        multiline
                        rows={2}
                        fullWidth
                        sx={{ mt: 2 }}
                        value={question.comments || ''}
                        onChange={(e) => handleQuestionResponse(question.id, question.conformance, e.target.value)}
                        placeholder="Document objective evidence, reference specific documents, note any non-conformities..."
                      />
                    </CardContent>
                  </Card>
                ))}
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close Audit</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              const summary = generateAuditSummary(auditQuestions);
              notify(`Audit progress saved: ${summary.completed}/${summary.total} questions completed`, 'success');
            }}
          >
            Save Progress
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => {
              const summary = generateAuditSummary(auditQuestions);
              const reportData = {
                audit: viewAudit,
                summary,
                questions: auditQuestions,
                timestamp: new Date().toISOString()
              };
              
              // Generate audit report
              const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                type: 'application/json'
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `audit-report-${viewAudit?.id}-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              
              notify('Audit report generated and downloaded', 'success');
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

  <ProgressDialog open={progressOpen} title="One-Click Audit" progressText={progressText} />
    </Box>
  );
}
