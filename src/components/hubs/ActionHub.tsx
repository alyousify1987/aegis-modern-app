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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
  CheckCircle as CompleteIcon,
  Warning as OverdueIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { Action, ActionType, Priority, ActionStatus } from '../../types';
import { apiFetch, apiJson } from '../../utils/api';
import { isOnline, onOnlineChange } from '../../services/net/health';
import { enqueue as enqueueSync, processQueue } from '../../services/net/syncQueue';
import { useSyncCompleteToast } from '../../services/net/syncNotify';

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
      id={`action-tabpanel-${index}`}
      aria-labelledby={`action-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const hydrateAction = (a: any): Action => ({
  ...a,
  dueDate: a.dueDate ? new Date(a.dueDate) : undefined,
  completedDate: a.completedDate ? new Date(a.completedDate) : undefined,
  createdAt: new Date(a.createdAt),
  updatedAt: new Date(a.updatedAt),
});

export function ActionHub() {
  useSyncCompleteToast('Actions synced');
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    type: '' as ActionType,
    priority: '' as Priority,
    assignedTo: '',
    dueDate: '',
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ data: any[] }>(`/api/actions`);
      const list = Array.isArray(json.data) ? json.data.map(hydrateAction) : [];
      setActions(list);
    } catch (e: any) {
      setError(e?.message || 'Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  // When coming back online, process the sync queue and then reload from server
  useEffect(() => {
    const unsub = onOnlineChange(() => {
      if (isOnline()) {
        void (async () => {
          try {
            await processQueue();
          } finally {
            // After processing, fetch latest from server to reflect persisted state
            await load();
          }
        })();
      }
    });
    return () => { unsub && unsub(); };
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateAction = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
    setNewAction({
      title: '',
      description: '',
      type: '' as ActionType,
      priority: '' as Priority,
      assignedTo: '',
      dueDate: '',
    });
  };

  const handleCreateSubmit = async () => {
    // If offline, optimistically add and enqueue for sync; otherwise call API
    if (!isOnline()) {
      const now = new Date();
      const temp: Action = {
        id: `temp_action_${Date.now()}`,
        title: newAction.title || 'New Action',
        description: newAction.description || '',
        type: (newAction.type || 'corrective') as ActionType,
        priority: (newAction.priority || 'medium') as Priority,
        status: 'open',
        assignedTo: newAction.assignedTo || 'Unassigned',
        createdBy: 'system',
        dueDate: newAction.dueDate ? new Date(newAction.dueDate) : now,
        linkedFindings: [],
        linkedRisks: [],
        linkedAudits: [],
        progress: 0,
        comments: [],
        createdAt: now,
        updatedAt: now,
      };
      setActions(prev => [temp, ...prev]);
      await enqueueSync({ method: 'POST', path: '/api/actions', body: newAction });
      handleCreateDialogClose();
      return;
    }

    try {
      const json = await apiJson<{ data: any }>(`/api/actions`, {
        method: 'POST',
        body: JSON.stringify(newAction),
      });
      if (json?.data) setActions(prev => [hydrateAction(json.data), ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      handleCreateDialogClose();
    }
  };

  // Hidden test hook: in E2E we can call window.__forceQueueProcess?.() to flush queue then reload
  useEffect(() => {
    (window as any).__forceQueueProcess = async () => {
      await processQueue();
      await load();
    };
    return () => { try { delete (window as any).__forceQueueProcess; } catch {} };
  }, []);

  const handleDelete = async (id: string) => {
    try {
  await apiFetch(`/api/actions/${id}`, { method: 'DELETE' });
      setActions(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (action: Action) => setEditingAction({ ...action });
  const closeEdit = () => setEditingAction(null);
  const saveEdit = async () => {
    if (!editingAction) return;
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<{ data: any }>(`/api/actions/${editingAction.id}`, {
        method: 'PUT',
        body: JSON.stringify(editingAction),
      });
      const updated = json?.data ? hydrateAction(json.data) : editingAction;
      setActions(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setEditingAction(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update action');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'open': return 'default';
      case 'overdue': return 'error';
      case 'escalated': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case 'completed': return <CompleteIcon color="success" />;
      case 'in_progress': return <TrendingUpIcon color="primary" />;
      case 'overdue': return <OverdueIcon color="error" />;
      default: return <PendingIcon color="action" />;
    }
  };

  const activeActions = actions.filter(action => 
    action.status !== 'completed'
  );

  const completedActions = actions.filter(action => 
    action.status === 'completed'
  );

  const overdueActions = actions.filter(action =>
    action.status !== 'completed' && new Date(action.dueDate) < new Date()
  );

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
          Action & Task Hub
        </Typography>
  <Box display="flex" gap={1}>
  <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateAction}
        >
          New Action
        </Button>
  <Button variant="outlined" onClick={() => void load()}>Refresh</Button>
  </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Manage corrective and preventive actions with smart reminders and automated workflows.
      </Typography>

      {/* Action Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TaskIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Actions</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold" data-testid="actions-total-value">
                {actions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">In Progress</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {activeActions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <OverdueIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Overdue</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {overdueActions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CompleteIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {completedActions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Active Actions" />
          <Tab label="Completed" />
          <Tab label="My Tasks" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getStatusIcon(action.status)}
                      <Chip
                        label={action.status.replace('_', ' ')}
                        color={getStatusColor(action.status) as any}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={action.type} 
                      size="small" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={action.priority}
                      color={getPriorityColor(action.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      {action.assignedTo}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      color={new Date(action.dueDate) < new Date() ? 'error' : 'inherit'}
                    >
                      {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <LinearProgress
                        variant="determinate"
                        value={action.progress}
                        sx={{ width: 60, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {action.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" aria-label="edit" onClick={() => openEdit(action)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" aria-label="delete" onClick={() => handleDelete(action.id)}>
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Completed Date</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={action.type} 
                      size="small" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={action.priority}
                      color={getPriorityColor(action.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{action.assignedTo}</TableCell>
                  <TableCell>{action.completedDate ? new Date(action.completedDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    {action.completedDate && 
                      `${Math.ceil(((action.completedDate as Date).getTime() - (action.createdAt as Date).getTime()) / (1000 * 60 * 60 * 24))} days`
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" mb={3}>
          My Assigned Tasks
        </Typography>
        
        <List>
          {activeActions.map((action) => (
            <ListItem key={action.id} divider>
              <ListItemIcon>
                {getStatusIcon(action.status)}
              </ListItemIcon>
              <ListItemText
                primary={action.title}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" component="div">
                      {action.description}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1} gap={1}>
                      <Chip
                        label={action.priority}
                        color={getPriorityColor(action.priority) as any}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Due: {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : ''}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" mb={2}>
          Action Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Performance metrics, completion rates, and efficiency analytics will be available here.
          </Typography>
        </Typography>
      </TabPanel>

      {/* Create Action Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Action</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Action Title"
            fullWidth
            variant="outlined"
            value={newAction.title}
            onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newAction.description}
            onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAction.type}
                  label="Type"
                  onChange={(e) => setNewAction({ ...newAction, type: e.target.value as ActionType })}
                >
                  <MenuItem value="corrective">Corrective</MenuItem>
                  <MenuItem value="preventive">Preventive</MenuItem>
                  <MenuItem value="improvement">Improvement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newAction.priority}
                  label="Priority"
                  onChange={(e) => setNewAction({ ...newAction, priority: e.target.value as Priority })}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            margin="dense"
            label="Assigned To"
            fullWidth
            variant="outlined"
            value={newAction.assignedTo}
            onChange={(e) => setNewAction({ ...newAction, assignedTo: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newAction.dueDate}
            onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Create Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Action Dialog */}
      <Dialog open={!!editingAction} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Action</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Action Title"
            fullWidth
            variant="outlined"
            value={editingAction?.title || ''}
            onChange={(e) => setEditingAction(prev => prev ? { ...prev, title: e.target.value } as Action : prev)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editingAction?.description || ''}
            onChange={(e) => setEditingAction(prev => prev ? { ...prev, description: e.target.value } as Action : prev)}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editingAction?.type || ''}
                  label="Type"
                  onChange={(e) => setEditingAction(prev => prev ? { ...prev, type: e.target.value as ActionType } as Action : prev)}
                >
                  <MenuItem value="corrective">Corrective</MenuItem>
                  <MenuItem value="preventive">Preventive</MenuItem>
                  <MenuItem value="improvement">Improvement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid sx={{ xs: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editingAction?.priority || ''}
                  label="Priority"
                  onChange={(e) => setEditingAction(prev => prev ? { ...prev, priority: e.target.value as Priority } as Action : prev)}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Assigned To"
            fullWidth
            variant="outlined"
            value={editingAction?.assignedTo || ''}
            onChange={(e) => setEditingAction(prev => prev ? { ...prev, assignedTo: e.target.value } as Action : prev)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={editingAction?.dueDate ? new Date(editingAction.dueDate).toISOString().substring(0,10) : ''}
            onChange={(e) => setEditingAction(prev => prev ? { ...prev, dueDate: e.target.value as any } as Action : prev)}
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
