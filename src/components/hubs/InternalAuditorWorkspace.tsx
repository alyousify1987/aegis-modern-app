import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  NotificationsActive as NotificationsIcon,
  Assignment as AssignmentIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Notes as NotesIcon,
  ViewKanban as ViewKanbanIcon,
  Search as SearchIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  PlayCircle as PlayCircleIcon
} from '@mui/icons-material';

interface AuditorTask {
  id: string;
  title: string;
  description: string;
  type: 'audit' | 'ncr-followup' | 'document-review' | 'training' | 'meeting' | 'planning';
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  assignedDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  relatedAuditId?: string;
  relatedNCRId?: string;
  relatedDocumentId?: string;
  notes?: string;
}

interface AuditorNote {
  id: string;
  title: string;
  content: string;
  category: 'audit-finding' | 'improvement-idea' | 'procedure-update' | 'training-need' | 'general';
  createdDate: string;
  lastModified: string;
  tags: string[];
  linkedItems: {
    type: 'audit' | 'ncr' | 'document' | 'task';
    id: string;
    title: string;
  }[];
}

interface ProjectPlan {
  id: string;
  auditId: string;
  auditTitle: string;
  phases: ProjectPhase[];
  totalDuration: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'approved' | 'in-progress' | 'completed';
}

interface ProjectPhase {
  id: string;
  name: string;
  tasks: string[];
  duration: number;
  dependencies: string[];
  status: 'not-started' | 'in-progress' | 'completed';
}

const mockTasks: AuditorTask[] = [
  {
    id: '1',
    title: 'Conduct ISO 22000 Internal Audit - Production',
    description: 'Complete internal audit of production department focusing on HACCP implementation',
    type: 'audit',
    priority: 'high',
    status: 'in-progress',
    assignedDate: '2025-08-01',
    dueDate: '2025-08-15',
    estimatedHours: 16,
    actualHours: 8,
    relatedAuditId: 'AUD-2025-003'
  },
  {
    id: '2',
    title: 'Follow-up on NCR-2025-007 Corrective Actions',
    description: 'Verify implementation of corrective actions for document control non-conformance',
    type: 'ncr-followup',
    priority: 'medium',
    status: 'todo',
    assignedDate: '2025-08-05',
    dueDate: '2025-08-20',
    estimatedHours: 4,
    relatedNCRId: 'NCR-2025-007'
  },
  {
    id: '3',
    title: 'Review Updated Quality Manual v3.2',
    description: 'Review and approve changes to quality manual section 4.3',
    type: 'document-review',
    priority: 'medium',
    status: 'completed',
    assignedDate: '2025-07-28',
    dueDate: '2025-08-10',
    estimatedHours: 3,
    actualHours: 2.5,
    relatedDocumentId: 'DOC-QM-032'
  },
  {
    id: '4',
    title: 'Plan Q4 2025 Audit Schedule',
    description: 'Develop comprehensive audit schedule for Q4 including risk-based prioritization',
    type: 'planning',
    priority: 'high',
    status: 'todo',
    assignedDate: '2025-08-10',
    dueDate: '2025-08-25',
    estimatedHours: 8
  }
];

const mockNotes: AuditorNote[] = [
  {
    id: '1',
    title: 'HACCP Implementation Observations',
    content: 'During the production audit, noticed excellent implementation of CCP monitoring. Staff demonstrated good understanding of critical limits. Recommend this as best practice for other departments.',
    category: 'audit-finding',
    createdDate: '2025-08-08',
    lastModified: '2025-08-08',
    tags: ['HACCP', 'best-practice', 'production'],
    linkedItems: [
      { type: 'audit', id: 'AUD-2025-003', title: 'ISO 22000 Production Audit' }
    ]
  },
  {
    id: '2',
    title: 'Document Control System Enhancement Idea',
    content: 'Consider implementing automated document review reminders. Current manual system relies too heavily on individual department heads remembering review dates.',
    category: 'improvement-idea',
    createdDate: '2025-08-05',
    lastModified: '2025-08-05',
    tags: ['document-control', 'automation', 'improvement'],
    linkedItems: []
  }
];

const mockProjectPlan: ProjectPlan = {
  id: '1',
  auditId: 'AUD-2025-004',
  auditTitle: 'ISO 27001 Information Security Audit',
  startDate: '2025-09-01',
  endDate: '2025-09-30',
  totalDuration: 20,
  status: 'draft',
  phases: [
    {
      id: '1',
      name: 'Planning & Preparation',
      tasks: ['Review previous audit reports', 'Update audit checklist', 'Schedule opening meeting'],
      duration: 3,
      dependencies: [],
      status: 'not-started'
    },
    {
      id: '2',
      name: 'Document Review',
      tasks: ['Review ISMS policy', 'Check risk assessment', 'Verify asset inventory'],
      duration: 5,
      dependencies: ['1'],
      status: 'not-started'
    },
    {
      id: '3',
      name: 'Field Audit',
      tasks: ['Interview personnel', 'Test controls', 'Review evidence'],
      duration: 8,
      dependencies: ['2'],
      status: 'not-started'
    },
    {
      id: '4',
      name: 'Reporting',
      tasks: ['Draft findings', 'Review with auditee', 'Finalize report'],
      duration: 4,
      dependencies: ['3'],
      status: 'not-started'
    }
  ]
};

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function InternalAuditorWorkspace() {
  const [tabValue, setTabValue] = useState(0);
  const [tasks, setTasks] = useState<AuditorTask[]>(mockTasks);
  const [notes, setNotes] = useState<AuditorNote[]>(mockNotes);
  const [projectPlan, setProjectPlan] = useState<ProjectPlan>(mockProjectPlan);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AuditorTask | null>(null);
  const [selectedNote, setSelectedNote] = useState<AuditorNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'todo':
      case 'not-started':
        return 'info';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in-progress':
        return <PlayCircleIcon color="warning" />;
      default:
        return <RadioButtonUncheckedIcon color="action" />;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'audit':
        return <AssignmentIcon />;
      case 'ncr-followup':
        return <NotificationsIcon />;
      case 'document-review':
        return <NotesIcon />;
      case 'planning':
        return <ScheduleIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'audit-finding':
        return 'primary';
      case 'improvement-idea':
        return 'success';
      case 'procedure-update':
        return 'warning';
      case 'training-need':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    'todo': filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    'completed': filteredTasks.filter(t => t.status === 'completed'),
    'blocked': filteredTasks.filter(t => t.status === 'blocked')
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PersonIcon />
        Internal Auditor's Workspace
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>RFP Requirement 3.9:</strong> Personal intelligent assistant for internal auditors providing dedicated space 
        to organize tasks, manage notes, and plan activities with integrated to-do lists and intelligent scheduling.
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Task Dashboard" />
          <Tab label="Kanban Board" />
          <Tab label="Notes & Knowledge" />
          <Tab label="Project Planning" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Integrated To-Do List</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search tasks..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => { setSelectedTask(null); setOpenTaskDialog(true); }}
            >
              Add Task
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Active Tasks
              </Typography>
              <List>
                {filteredTasks.map((task) => (
                  <ListItem key={task.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <ListItemIcon>
                      {getTaskIcon(task.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getTaskTypeIcon(task.type)}
                          <Typography variant="subtitle1">{task.title}</Typography>
                          <Chip 
                            label={task.priority} 
                            color={getPriorityColor(task.priority)} 
                            size="small" 
                          />
                          <Chip 
                            label={task.status} 
                            color={getStatusColor(task.status)} 
                            size="small" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {task.description}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Due: {task.dueDate} | Estimated: {task.estimatedHours}h
                            {task.actualHours && ` | Actual: ${task.actualHours}h`}
                          </Typography>
                          {task.status === 'in-progress' && task.actualHours && (
                            <LinearProgress 
                              variant="determinate" 
                              value={(task.actualHours / task.estimatedHours) * 100}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                      }
                    />
                    <IconButton 
                      size="small" 
                      onClick={() => { setSelectedTask(task); setOpenTaskDialog(true); }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Summary
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Total Tasks: {tasks.length}
                  </Typography>
                  <Typography variant="body2" color="error" gutterBottom>
                    High Priority: {tasks.filter(t => t.priority === 'high').length}
                  </Typography>
                  <Typography variant="body2" color="warning.main" gutterBottom>
                    In Progress: {tasks.filter(t => t.status === 'in-progress').length}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Completed: {tasks.filter(t => t.status === 'completed').length}
                  </Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Upcoming Deadlines
                </Typography>
                <List dense>
                  {tasks
                    .filter(t => t.status !== 'completed')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 3)
                    .map((task) => (
                    <ListItem key={task.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={task.title}
                        secondary={`Due: ${task.dueDate}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ViewKanbanIcon />
            Kanban Board for Task Management
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <Grid key={status} xs={12} md={3}>
              <Paper sx={{ p: 2, minHeight: 400 }}>
                <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {status.replace('-', ' ')} ({statusTasks.length})
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {statusTasks.map((task) => (
                    <Card key={task.id} sx={{ cursor: 'pointer' }} onClick={() => { setSelectedTask(task); setOpenTaskDialog(true); }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getTaskTypeIcon(task.type)}
                          <Chip 
                            label={task.priority} 
                            color={getPriorityColor(task.priority)} 
                            size="small" 
                          />
                        </Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Due: {task.dueDate}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.estimatedHours}h estimated
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Rich Note-Taking & Knowledge Management</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search notes..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => { setSelectedNote(null); setOpenNoteDialog(true); }}
            >
              New Note
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {filteredNotes.map((note) => (
            <Grid key={note.id} xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {note.title}
                    </Typography>
                    <Chip 
                      label={note.category.replace('-', ' ')} 
                      color={getCategoryColor(note.category)} 
                      size="small" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {note.content.substring(0, 150)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                    {note.tags.map((tag) => (
                      <Chip 
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  
                  {note.linkedItems.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Linked Items:
                      </Typography>
                      {note.linkedItems.map((item, index) => (
                        <Chip 
                          key={index}
                          label={`${item.type}: ${item.title}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {note.lastModified}
                    </Typography>
                    <IconButton size="small" onClick={() => { setSelectedNote(note); setOpenNoteDialog(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>Intelligent Schedule and Milestone Generation</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Feature:</strong> System can automatically generate detailed project plans for complex audits 
          with intelligent scheduling and milestone tracking.
        </Alert>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Project Plan: {projectPlan.auditTitle}
              </Typography>
              <Chip 
                label={projectPlan.status} 
                color={getStatusColor(projectPlan.status)} 
                size="small" 
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Duration: {projectPlan.totalDuration} days ({projectPlan.startDate} - {projectPlan.endDate})
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={25} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                25% Complete
              </Typography>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Project Phases
            </Typography>
            
            {projectPlan.phases.map((phase, index) => (
              <Accordion key={phase.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle1">
                      Phase {index + 1}: {phase.name}
                    </Typography>
                    <Chip 
                      label={phase.status.replace('-', ' ')} 
                      color={getStatusColor(phase.status)} 
                      size="small" 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {phase.duration} days
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    Tasks:
                  </Typography>
                  <List dense>
                    {phase.tasks.map((task, taskIndex) => (
                      <ListItem key={taskIndex}>
                        <ListItemIcon>
                          <CheckCircleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={task} />
                      </ListItem>
                    ))}
                  </List>
                  
                  {phase.dependencies.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Dependencies:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Depends on Phase {phase.dependencies.join(', Phase ')}
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField
                label="Task Title"
                fullWidth
                defaultValue={selectedTask?.title || ''}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                defaultValue={selectedTask?.description || ''}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                select
                label="Type"
                fullWidth
                defaultValue={selectedTask?.type || ''}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Type...</option>
                <option value="audit">Audit</option>
                <option value="ncr-followup">NCR Follow-up</option>
                <option value="document-review">Document Review</option>
                <option value="training">Training</option>
                <option value="meeting">Meeting</option>
                <option value="planning">Planning</option>
              </TextField>
            </Grid>
            <Grid xs={6}>
              <TextField
                select
                label="Priority"
                fullWidth
                defaultValue={selectedTask?.priority || ''}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Priority...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </TextField>
            </Grid>
            <Grid xs={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                defaultValue={selectedTask?.dueDate || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                label="Estimated Hours"
                type="number"
                fullWidth
                defaultValue={selectedTask?.estimatedHours || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField
                label="Note Title"
                fullWidth
                defaultValue={selectedNote?.title || ''}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                select
                label="Category"
                fullWidth
                defaultValue={selectedNote?.category || ''}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Category...</option>
                <option value="audit-finding">Audit Finding</option>
                <option value="improvement-idea">Improvement Idea</option>
                <option value="procedure-update">Procedure Update</option>
                <option value="training-need">Training Need</option>
                <option value="general">General</option>
              </TextField>
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Content"
                multiline
                rows={6}
                fullWidth
                defaultValue={selectedNote?.content || ''}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Tags (comma-separated)"
                fullWidth
                defaultValue={selectedNote?.tags.join(', ') || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
