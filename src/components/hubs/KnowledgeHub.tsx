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
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  Avatar,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Article as ArticleIcon,
  Assignment as ChecklistIcon,
  School as TrainingIcon,
  Psychology as ScenarioIcon,
  ThumbUp as ThumbUpIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { KnowledgeItem, KnowledgeType, AuditScenario } from '../../types';
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
      id={`knowledge-tabpanel-${index}`}
      aria-labelledby={`knowledge-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const hydrateKnowledge = (k: any): KnowledgeItem => ({
  ...k,
  createdAt: new Date(k.createdAt),
  updatedAt: new Date(k.updatedAt),
});

const mockScenarios: AuditScenario[] = [
  {
    id: '1',
    title: 'Temperature Control Failure',
    description: 'Refrigeration system failure leading to temperature excursion in cold storage',
    standard: 'HACCP',
    clause: 'CCP-1',
    finding: 'Critical control point for temperature not maintained within specified limits',
    recommendedAction: 'Immediate corrective action: isolate affected products, investigate root cause, repair/replace equipment, verify system effectiveness',
    severity: 'critical',
    category: ['Temperature Control', 'Critical Control Points'],
    tags: ['refrigeration', 'CCP', 'corrective action'],
    confidence: 0.95,
    usage_count: 15,
    effectiveness_rating: 4.8,
    created_at: new Date('2025-06-01'),
    updated_at: new Date('2025-07-01'),
  },
  {
    id: '2',
    title: 'Supplier Documentation Gap',
    description: 'Missing or incomplete supplier certificates and audit reports',
    standard: 'ISO_22000',
    clause: '7.1.6',
    finding: 'Supplier verification documentation incomplete or outdated',
    recommendedAction: 'Request updated certificates, conduct supplier audit, establish regular review schedule',
    severity: 'medium',
    category: ['Supplier Management', 'Documentation'],
    tags: ['supplier', 'certificates', 'verification'],
    confidence: 0.89,
    usage_count: 8,
    effectiveness_rating: 4.2,
    created_at: new Date('2025-06-15'),
    updated_at: new Date('2025-07-10'),
  },
];

export function KnowledgeHub() {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState({
    title: '',
    content: '',
    type: '' as KnowledgeType,
    category: '',
    tags: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
  const json = await apiJson<{ data: any[] }>(`/api/knowledge`);
  const list = Array.isArray(json.data) ? json.data.map(hydrateKnowledge) : [];
        setItems(list);
      } catch (e: any) {
        setError(e?.message || 'Failed to load knowledge base');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateKnowledgeItem = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewKnowledgeItem({
      title: '',
      content: '',
      type: '' as KnowledgeType,
      category: '',
      tags: '',
    });
  };

  const handleCreateSubmit = async () => {
    try {
      const payload = {
        ...newKnowledgeItem,
        category: newKnowledgeItem.category,
        tags: newKnowledgeItem.tags,
      } as any;
      const json = await apiJson<{ data: any }>(`/api/knowledge`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (json?.data) setItems(prev => [hydrateKnowledge(json.data), ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      handleCreateDialogClose();
    }
  };

  const handleDelete = async (id: string) => {
    try {
  await apiFetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(k => k.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (item: KnowledgeItem) => setEditingItem({ ...item });
  const closeEdit = () => setEditingItem(null);
  const saveEdit = async () => {
    if (!editingItem) return;
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ data: any }>(`/api/knowledge/${editingItem.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingItem),
      });
      const updated = json?.data ? hydrateKnowledge(json.data) : editingItem;
      setItems(prev => prev.map(k => (k.id === updated.id ? updated : k)));
      setEditingItem(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: KnowledgeType) => {
    switch (type) {
      case 'article': return <ArticleIcon />;
      case 'checklist': return <ChecklistIcon />;
      case 'training': return <TrainingIcon />;
      case 'scenario': return <ScenarioIcon />;
      default: return <ArticleIcon />;
    }
  };

  const getTypeColor = (type: KnowledgeType) => {
    switch (type) {
      case 'article': return 'primary';
      case 'checklist': return 'success';
      case 'training': return 'warning';
      case 'scenario': return 'info';
      default: return 'default';
    }
  };

  const filteredKnowledgeItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Knowledge & Training Hub
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateKnowledgeItem}
        >
          Add Content
        </Button>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Centralized knowledge base with AI-powered search, training modules, and audit scenarios.
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search knowledge base, scenarios, or training materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

  {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ArticleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Articles</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
        {items.filter(item => item.type === 'article').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Knowledge articles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrainingIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Training</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {items.filter(item => item.type === 'training').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Training modules
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ScenarioIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Scenarios</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {mockScenarios.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Audit scenarios
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ChecklistIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Checklists</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {items.filter(item => item.type === 'checklist').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Procedure checklists
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Knowledge Base" />
          <Tab label="Training" />
          <Tab label="Scenarios" />
          <Tab label="Community Q&A" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {filteredKnowledgeItems.map((item) => (
            <Grid sx={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getTypeIcon(item.type)}
                    <Chip
                      label={item.type}
                      color={getTypeColor(item.type) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="h6" component="div" mb={1}>
                    {item.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {item.content.substring(0, 100)}...
                  </Typography>

                  <Box mb={2}>
                    {item.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                      <Typography variant="caption">
                        {item.author}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      v{item.version}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Button size="small" startIcon={<DownloadIcon />}>
                      Download
                    </Button>
                    <Box>
                      <Button size="small" onClick={() => openEdit(item)}>Edit</Button>
                      <Button size="small" startIcon={<ShareIcon />}>Share</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(item.id)}>Delete</Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" mb={3}>
          Training Modules
        </Typography>
        
        <Grid container spacing={3}>
          {items
            .filter(item => item.type === 'training')
            .map((item) => (
              <Grid sx={{ xs: 12, md: 6 }} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" mb={2}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {item.content}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip label={item.standard} color="primary" size="small" />
                      <Button variant="contained" size="small">
                        Start Training
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" mb={3}>
          Audit Scenarios & Best Practices
        </Typography>
        
        <List>
          {mockScenarios.map((scenario, index) => (
            <Box key={scenario.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <ScenarioIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {scenario.title}
                      </Typography>
                      <Chip
                        label={scenario.severity}
                        color={scenario.severity === 'critical' ? 'error' : 'warning'}
                        size="small"
                      />
                      <Chip
                        label={scenario.standard}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography variant="body2" mb={1}>
                        <strong>Description:</strong> {scenario.description}
                      </Typography>
                      <Typography variant="body2" mb={1}>
                        <strong>Finding:</strong> {scenario.finding}
                      </Typography>
                      <Typography variant="body2" mb={2}>
                        <strong>Recommended Action:</strong> {scenario.recommendedAction}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center">
                          <Typography variant="caption" mr={1}>Effectiveness:</Typography>
                          <Rating value={scenario.effectiveness_rating} readOnly size="small" />
                        </Box>
                        <Typography variant="caption">
                          Used {scenario.usage_count} times
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            {Math.round(scenario.confidence * 100)}% confidence
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < mockScenarios.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" mb={2}>
          Community Q&A
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Community questions, answers, and knowledge sharing coming soon.
        </Typography>
      </TabPanel>

      {/* Create Knowledge Item Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Knowledge Content</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={newKnowledgeItem.title}
            onChange={(e) => setNewKnowledgeItem({ ...newKnowledgeItem, title: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={newKnowledgeItem.type}
              label="Content Type"
              onChange={(e) => setNewKnowledgeItem({ ...newKnowledgeItem, type: e.target.value as KnowledgeType })}
            >
              <MenuItem value="article">Article</MenuItem>
              <MenuItem value="procedure">Procedure</MenuItem>
              <MenuItem value="checklist">Checklist</MenuItem>
              <MenuItem value="training">Training</MenuItem>
              <MenuItem value="scenario">Scenario</MenuItem>
              <MenuItem value="best_practice">Best Practice</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={newKnowledgeItem.content}
            onChange={(e) => setNewKnowledgeItem({ ...newKnowledgeItem, content: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            value={newKnowledgeItem.category}
            onChange={(e) => setNewKnowledgeItem({ ...newKnowledgeItem, category: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Tags (comma separated)"
            fullWidth
            variant="outlined"
            value={newKnowledgeItem.tags}
            onChange={(e) => setNewKnowledgeItem({ ...newKnowledgeItem, tags: e.target.value })}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Add Content
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Knowledge Item Dialog */}
      <Dialog open={!!editingItem} onClose={closeEdit} maxWidth="md" fullWidth>
        <DialogTitle>Edit Knowledge Content</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={editingItem?.title || ''}
            onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } as KnowledgeItem : prev)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={editingItem?.type || ''}
              label="Content Type"
              onChange={(e) => setEditingItem(prev => prev ? { ...prev, type: e.target.value as KnowledgeType } as KnowledgeItem : prev)}
            >
              <MenuItem value="article">Article</MenuItem>
              <MenuItem value="procedure">Procedure</MenuItem>
              <MenuItem value="checklist">Checklist</MenuItem>
              <MenuItem value="training">Training</MenuItem>
              <MenuItem value="scenario">Scenario</MenuItem>
              <MenuItem value="best_practice">Best Practice</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={editingItem?.content || ''}
            onChange={(e) => setEditingItem(prev => prev ? { ...prev, content: e.target.value } as KnowledgeItem : prev)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            value={editingItem ? editingItem.category.join(', ') : ''}
            onChange={(e) => setEditingItem(prev => prev ? { ...prev, category: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } as KnowledgeItem : prev)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Tags (comma separated)"
            fullWidth
            variant="outlined"
            value={editingItem?.tags?.join(', ') || ''}
            onChange={(e) => setEditingItem(prev => prev ? { ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } as KnowledgeItem : prev)}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
