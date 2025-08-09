import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import type { Risk, RiskCategory, RiskLevel, RiskStatus } from '../../types';
import { apiFetch, apiJson } from '../../utils/api';

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
      id={`risk-tabpanel-${index}`}
      aria-labelledby={`risk-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface RiskHeatmapProps {
  risks: Risk[];
}

function RiskHeatmap({ risks }: RiskHeatmapProps) {
  const getRiskColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 16) return '#d32f2f'; // Critical
    if (score >= 9) return '#ed6c02';  // High
    if (score >= 4) return '#ffa000';  // Medium
    return '#2e7d32';                   // Low
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3}>
          Risk Heatmap
        </Typography>
        
        <Box sx={{ position: 'relative', height: 300 }}>
          {/* Y-axis (Impact) */}
          <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 30 }}>
            <Typography variant="caption" sx={{ writingMode: 'vertical-rl', textAlign: 'center', height: '100%' }}>
              Impact
            </Typography>
          </Box>
          
          {/* Grid */}
          <Box sx={{ ml: 4, height: '100%', position: 'relative' }}>
            <Grid container sx={{ height: '100%' }}>
              {[5, 4, 3, 2, 1].map((impact) => (
                <Grid container key={impact} sx={{ height: '20%' }}>
                  {[1, 2, 3, 4, 5].map((likelihood) => {
                    const cellRisks = risks.filter(r => r.likelihood === likelihood && r.impact === impact);
                    return (
                      <Grid 
                        key={likelihood}
                        sx={{ 
                          width: '20%', 
                          border: '1px solid #ddd',
                          backgroundColor: getRiskColor(likelihood, impact),
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {cellRisks.length}
                      </Grid>
                    );
                  })}
                </Grid>
              ))}
            </Grid>
            
            {/* X-axis (Likelihood) */}
            <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
              Likelihood
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Helper to parse dates from API
const hydrateRisk = (r: any): Risk => ({
  ...r,
  createdAt: new Date(r.createdAt),
  updatedAt: new Date(r.updatedAt),
});

export function RiskHub() {
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [newRisk, setNewRisk] = useState({
    title: '',
    description: '',
    category: '' as RiskCategory,
    likelihood: 1 as RiskLevel,
    impact: 1 as RiskLevel,
    owner: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
  const json = await apiJson<{ data: any[] }>(`/api/risks`);
  const list = Array.isArray(json.data) ? json.data.map(hydrateRisk) : [];
        setRisks(list);
      } catch (e: any) {
        setError(e?.message || 'Failed to load risks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateRisk = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewRisk({
      title: '',
      description: '',
      category: '' as RiskCategory,
      likelihood: 1,
      impact: 1,
      owner: '',
    });
  };

  const handleCreateSubmit = async () => {
    try {
      const json = await apiJson<{ data: any }>(`/api/risks`, {
        method: 'POST',
        body: JSON.stringify(newRisk),
      });
      if (json?.data) setRisks(prev => [hydrateRisk(json.data), ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      handleCreateDialogClose();
    }
  };

  const handleDelete = async (id: string) => {
    try {
  await apiFetch(`/api/risks/${id}`, { method: 'DELETE' });
      setRisks(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (risk: Risk) => setEditingRisk({ ...risk });
  const closeEdit = () => setEditingRisk(null);
  const saveEdit = async () => {
    if (!editingRisk) return;
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ data: any }>(`/api/risks/${editingRisk.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingRisk),
      });
      const updated = json?.data ? hydrateRisk(json.data) : editingRisk;
      setRisks(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      setEditingRisk(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update risk');
    } finally {
      setLoading(false);
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 16) return 'error';
    if (score >= 9) return 'warning';
    if (score >= 4) return 'info';
    return 'success';
  };

  const getRiskScoreLabel = (score: number) => {
    if (score >= 16) return 'Critical';
    if (score >= 9) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'identified': return 'default';
      case 'assessing': return 'info';
      case 'mitigating': return 'warning';
      case 'monitoring': return 'primary';
      case 'closed': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Risk Hub
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRisk}
        >
          New Risk
        </Button>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Identify, assess, and monitor risks with predictive analytics and AI-driven recommendations.
      </Typography>

      {/* Risk Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Critical Risks</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {risks.filter(r => r.riskScore >= 16).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Require immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">High Risks</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {risks.filter(r => r.riskScore >= 9 && r.riskScore < 16).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor closely
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Mitigations</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {risks.filter(r => r.status === 'mitigating').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BusinessIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Risk Coverage</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                89%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall coverage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Risk Register" />
          <Tab label="Heatmap" />
          <Tab label="Analytics" />
          <Tab label="Scenarios" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Risk Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {risks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {risk.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {risk.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={risk.category.replace('_', ' ')} 
                      size="small" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="h6" mr={1}>
                        {risk.riskScore}
                      </Typography>
                      <Chip
                        label={getRiskScoreLabel(risk.riskScore)}
                        color={getRiskScoreColor(risk.riskScore) as any}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={risk.status.replace('_', ' ')}
                      color={getStatusColor(risk.status) as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{risk.owner}</TableCell>
                  <TableCell>{new Date(risk.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton size="small" aria-label="edit" onClick={() => openEdit(risk)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" aria-label="delete" onClick={() => handleDelete(risk.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid sx={{ xs: 12, md: 8 }}>
            <RiskHeatmap risks={risks} />
          </Grid>
          <Grid sx={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Risk Distribution
                </Typography>
                {(() => {
                  const counts = [
                    { label: 'Critical (16-25)', count: risks.filter(r => r.riskScore >= 16).length, color: '#d32f2f' },
                    { label: 'High (9-15)', count: risks.filter(r => r.riskScore >= 9 && r.riskScore < 16).length, color: '#ed6c02' },
                    { label: 'Medium (4-8)', count: risks.filter(r => r.riskScore >= 4 && r.riskScore < 9).length, color: '#ffa000' },
                    { label: 'Low (1-3)', count: risks.filter(r => r.riskScore < 4).length, color: '#2e7d32' },
                  ];
                  return counts.map((item, index) => (
                  <Box key={index} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {item.count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={risks.length ? (item.count / risks.length) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: item.color,
                        },
                      }}
                    />
                  </Box>
                  ));
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" mb={2}>
          Risk Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Predictive analytics, trend analysis, and AI-driven risk insights coming soon.
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" mb={2}>
          Risk Scenarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pre-defined risk scenarios and response plans for various threat categories.
        </Typography>
      </TabPanel>

      {/* Create Risk Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Risk</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Risk Title"
            fullWidth
            variant="outlined"
            value={newRisk.title}
            onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newRisk.description}
            onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid sx={{ xs: 12 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newRisk.category}
                  label="Category"
                  onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value as RiskCategory })}
                >
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                  <MenuItem value="reputational">Reputational</MenuItem>
                  <MenuItem value="strategic">Strategic</MenuItem>
                  <MenuItem value="food_safety">Food Safety</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Likelihood</InputLabel>
                <Select
                  value={newRisk.likelihood}
                  label="Likelihood"
                  onChange={(e) => setNewRisk({ ...newRisk, likelihood: e.target.value as RiskLevel })}
                >
                  <MenuItem value={1}>1 - Very Low</MenuItem>
                  <MenuItem value={2}>2 - Low</MenuItem>
                  <MenuItem value={3}>3 - Medium</MenuItem>
                  <MenuItem value={4}>4 - High</MenuItem>
                  <MenuItem value={5}>5 - Very High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Impact</InputLabel>
                <Select
                  value={newRisk.impact}
                  label="Impact"
                  onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value as RiskLevel })}
                >
                  <MenuItem value={1}>1 - Very Low</MenuItem>
                  <MenuItem value={2}>2 - Low</MenuItem>
                  <MenuItem value={3}>3 - Medium</MenuItem>
                  <MenuItem value={4}>4 - High</MenuItem>
                  <MenuItem value={5}>5 - Very High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            margin="dense"
            label="Risk Owner"
            fullWidth
            variant="outlined"
            value={newRisk.owner}
            onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Create Risk
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Risk Dialog */}
      <Dialog open={!!editingRisk} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Risk</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Risk Title"
            fullWidth
            variant="outlined"
            value={editingRisk?.title || ''}
            onChange={(e) => setEditingRisk(prev => prev ? { ...prev, title: e.target.value } as Risk : prev)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editingRisk?.description || ''}
            onChange={(e) => setEditingRisk(prev => prev ? { ...prev, description: e.target.value } as Risk : prev)}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid sx={{ xs: 12 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editingRisk?.category || ''}
                  label="Category"
                  onChange={(e) => setEditingRisk(prev => prev ? { ...prev, category: e.target.value as RiskCategory } as Risk : prev)}
                >
                  <MenuItem value="operational">Operational</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="regulatory">Regulatory</MenuItem>
                  <MenuItem value="reputational">Reputational</MenuItem>
                  <MenuItem value="strategic">Strategic</MenuItem>
                  <MenuItem value="food_safety">Food Safety</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Likelihood</InputLabel>
                <Select
                  value={editingRisk?.likelihood ?? 1}
                  label="Likelihood"
                  onChange={(e) => setEditingRisk(prev => prev ? { ...prev, likelihood: Number(e.target.value) as RiskLevel } as Risk : prev)}
                >
                  <MenuItem value={1}>1 - Very Low</MenuItem>
                  <MenuItem value={2}>2 - Low</MenuItem>
                  <MenuItem value={3}>3 - Medium</MenuItem>
                  <MenuItem value={4}>4 - High</MenuItem>
                  <MenuItem value={5}>5 - Very High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Impact</InputLabel>
                <Select
                  value={editingRisk?.impact ?? 1}
                  label="Impact"
                  onChange={(e) => setEditingRisk(prev => prev ? { ...prev, impact: Number(e.target.value) as RiskLevel } as Risk : prev)}
                >
                  <MenuItem value={1}>1 - Very Low</MenuItem>
                  <MenuItem value={2}>2 - Low</MenuItem>
                  <MenuItem value={3}>3 - Medium</MenuItem>
                  <MenuItem value={4}>4 - High</MenuItem>
                  <MenuItem value={5}>5 - Very High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            margin="dense"
            label="Risk Owner"
            fullWidth
            variant="outlined"
            value={editingRisk?.owner || ''}
            onChange={(e) => setEditingRisk(prev => prev ? { ...prev, owner: e.target.value } as Risk : prev)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
