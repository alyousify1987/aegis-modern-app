import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

interface MRMeeting {
  id: string;
  title: string;
  scheduledDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  attendees: string[];
  agenda: MRMAgendaItem[];
  chairman: string;
  secretary: string;
  nextReviewDate?: string;
  documentUrl?: string;
}

interface MRMAgendaItem {
  id: string;
  title: string;
  type: 'performance-review' | 'policy-review' | 'objectives-review' | 'audit-results' | 'customer-feedback' | 'improvement-opportunities' | 'resource-adequacy';
  status: 'pending' | 'reviewed' | 'action-required';
  content?: string;
  actionItems?: string[];
  responsible?: string;
  dueDate?: string;
}

interface ActionItem {
  id: string;
  meetingId: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: 'open' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

const mockMeetings: MRMeeting[] = [
  {
    id: '1',
    title: 'Q3 2025 Management Review',
    scheduledDate: '2025-09-30',
    status: 'planned',
    attendees: ['CEO', 'Quality Manager', 'Operations Manager', 'HR Director'],
    chairman: 'CEO',
    secretary: 'Quality Manager',
    nextReviewDate: '2025-12-30',
    agenda: [
      {
        id: '1',
        title: 'Internal Audit Results Review',
        type: 'audit-results',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Customer Satisfaction Analysis',
        type: 'customer-feedback',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Quality Objectives Performance',
        type: 'objectives-review',
        status: 'pending'
      }
    ]
  },
  {
    id: '2',
    title: 'Q2 2025 Management Review',
    scheduledDate: '2025-06-30',
    status: 'completed',
    attendees: ['CEO', 'Quality Manager', 'Operations Manager', 'HR Director'],
    chairman: 'CEO',
    secretary: 'Quality Manager',
    nextReviewDate: '2025-09-30',
    documentUrl: '/reports/mrm-q2-2025.pdf',
    agenda: [
      {
        id: '1',
        title: 'Policy Adequacy Review',
        type: 'policy-review',
        status: 'reviewed',
        content: 'Quality policy reviewed and confirmed as adequate'
      },
      {
        id: '2',
        title: 'External Audit Results',
        type: 'audit-results',
        status: 'action-required',
        actionItems: ['Update training procedures', 'Implement new document control'],
        responsible: 'Quality Manager',
        dueDate: '2025-08-15'
      }
    ]
  }
];

const mockActionItems: ActionItem[] = [
  {
    id: '1',
    meetingId: '2',
    description: 'Update training procedures based on external audit findings',
    responsible: 'Quality Manager',
    dueDate: '2025-08-15',
    status: 'in-progress',
    priority: 'high'
  },
  {
    id: '2',
    meetingId: '2',
    description: 'Implement new document control system',
    responsible: 'Quality Manager',
    dueDate: '2025-08-15',
    status: 'completed',
    priority: 'medium'
  }
];

const agendaItemTypes = [
  { value: 'performance-review', label: 'Performance Review' },
  { value: 'policy-review', label: 'Policy Review' },
  { value: 'objectives-review', label: 'Objectives Review' },
  { value: 'audit-results', label: 'Audit Results' },
  { value: 'customer-feedback', label: 'Customer Feedback' },
  { value: 'improvement-opportunities', label: 'Improvement Opportunities' },
  { value: 'resource-adequacy', label: 'Resource Adequacy' }
];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function ManagementReviewHub() {
  const [tabValue, setTabValue] = useState(0);
  const [meetings, setMeetings] = useState<MRMeeting[]>(mockMeetings);
  const [actionItems, setActionItems] = useState<ActionItem[]>(mockActionItems);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MRMeeting | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'reviewed':
        return 'success';
      case 'in-progress':
      case 'action-required':
        return 'warning';
      case 'planned':
      case 'pending':
        return 'info';
      case 'cancelled':
      case 'overdue':
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

  const MeetingWizardSteps = [
    'Basic Information',
    'Agenda Items',
    'Data Aggregation',
    'Review & Finalize'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AssignmentIcon />
        Management Review Hub
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>RFP Requirement 3.8:</strong> Automated Management Review (MRM) module that streamlines creation and management 
        of Management Review Meetings with intelligent data aggregation and multilingual document ingestion.
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Meetings Schedule" />
          <Tab label="Action Items Tracking" />
          <Tab label="Automated Reports" />
          <Tab label="Data Aggregation" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Management Review Meetings</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setSelectedMeeting(null); setOpenMeetingDialog(true); }}
          >
            Plan New Meeting
          </Button>
        </Box>

        <Grid container spacing={3}>
          {meetings.map((meeting) => (
            <Grid key={meeting.id} xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {meeting.title}
                    </Typography>
                    <Chip 
                      label={meeting.status} 
                      color={getStatusColor(meeting.status)} 
                      size="small" 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" />
                      Scheduled: {meeting.scheduledDate}
                    </Typography>
                    <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GroupIcon fontSize="small" />
                      Chairman: {meeting.chairman}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendees: {meeting.attendees.join(', ')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Agenda Items: {meeting.agenda.length}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {meeting.agenda.slice(0, 3).map((item) => (
                        <Chip 
                          key={item.id}
                          label={item.title}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {meeting.agenda.length > 3 && (
                        <Chip 
                          label={`+${meeting.agenda.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {meeting.documentUrl && (
                      <Button size="small" startIcon={<DownloadIcon />}>
                        Download Report
                      </Button>
                    )}
                    <IconButton size="small" onClick={() => { setSelectedMeeting(meeting); setOpenMeetingDialog(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>Action Items Tracking</Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Meeting</TableCell>
                <TableCell>Responsible</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actionItems.map((item) => {
                const meeting = meetings.find(m => m.id === item.meetingId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{meeting?.title || 'Unknown'}</TableCell>
                    <TableCell>{item.responsible}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.priority} 
                        color={getPriorityColor(item.priority)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        color={getStatusColor(item.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>Automated Report Generation</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Feature:</strong> Multi-format export with professionally formatted PDF and Microsoft Word documents. 
          Supports multilingual document ingestion including Arabic and French with translation to English.
        </Alert>

        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generate Management Review Report
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Meeting</InputLabel>
                    <Select
                      value=""
                      label="Select Meeting"
                    >
                      {meetings.map((meeting) => (
                        <MenuItem key={meeting.id} value={meeting.id}>
                          {meeting.title} - {meeting.scheduledDate}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Report Template</InputLabel>
                    <Select
                      value=""
                      label="Report Template"
                    >
                      <MenuItem value="standard">Standard MRM Report</MenuItem>
                      <MenuItem value="executive">Executive Summary</MenuItem>
                      <MenuItem value="detailed">Detailed Analysis</MenuItem>
                      <MenuItem value="action-focused">Action Items Focus</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Export Format</InputLabel>
                    <Select
                      value=""
                      label="Export Format"
                    >
                      <MenuItem value="pdf">PDF Report</MenuItem>
                      <MenuItem value="docx">Microsoft Word (.docx)</MenuItem>
                      <MenuItem value="both">Both PDF and Word</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" startIcon={<AssessmentIcon />} fullWidth>
                    Generate Report
                  </Button>
                  <Button variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                    Download Template
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Reports
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Q2 2025 MRM Report"
                      secondary="Generated 2025-07-01"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Q1 2025 Executive Summary"
                      secondary="Generated 2025-04-01"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>Intelligent Data Aggregation</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Feature:</strong> System automatically populates MRM agenda and minutes template by extracting 
          relevant data from other modules. Supports multilingual document analysis and translation.
        </Alert>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Automatic Data Sources
                </Typography>
                <List>
                  {[
                    'Internal Audit Results',
                    'External Audit Findings',
                    'Customer Feedback & Complaints',
                    'Non-Conformance Reports',
                    'Quality Objectives Performance',
                    'Training Records & Competence',
                    'Risk Assessment Updates',
                    'Supplier Performance Data'
                  ].map((source, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={source} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Document Upload & Analysis
                </Typography>
                <Paper 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    border: '2px dashed', 
                    borderColor: 'grey.300',
                    mb: 2
                  }}
                >
                  <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    Upload Supporting Documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Supports Arabic, French, and English
                  </Typography>
                  <Button variant="outlined" startIcon={<UploadIcon />}>
                    Browse Files
                  </Button>
                </Paper>
                
                <Typography variant="body2" color="text.secondary">
                  <strong>Supported Languages:</strong> Arabic, French, English<br/>
                  <strong>Auto-Translation:</strong> All documents translated to English for analysis<br/>
                  <strong>Formats:</strong> PDF, Word, Excel, PowerPoint
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Meeting Dialog with Wizard */}
      <Dialog open={openMeetingDialog} onClose={() => setOpenMeetingDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedMeeting ? 'Edit Management Review Meeting' : 'Plan New Management Review Meeting'}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {MeetingWizardSteps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                  {index === 0 && (
                    <Grid container spacing={2}>
                      <Grid xs={12} sm={6}>
                        <TextField
                          label="Meeting Title"
                          fullWidth
                          defaultValue={selectedMeeting?.title || ''}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <TextField
                          label="Scheduled Date"
                          type="date"
                          fullWidth
                          defaultValue={selectedMeeting?.scheduledDate || ''}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <TextField
                          label="Chairman"
                          fullWidth
                          defaultValue={selectedMeeting?.chairman || ''}
                        />
                      </Grid>
                      <Grid xs={12} sm={6}>
                        <TextField
                          label="Secretary"
                          fullWidth
                          defaultValue={selectedMeeting?.secretary || ''}
                        />
                      </Grid>
                      <Grid xs={12}>
                        <TextField
                          label="Attendees (comma-separated)"
                          fullWidth
                          defaultValue={selectedMeeting?.attendees.join(', ') || ''}
                        />
                      </Grid>
                    </Grid>
                  )}
                  
                  {index === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Agenda Items Configuration
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        System will automatically populate agenda items with relevant data from other modules.
                      </Alert>
                      {agendaItemTypes.map((type) => (
                        <Box key={type.value} sx={{ mb: 1 }}>
                          <Typography variant="body2">{type.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  {index === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Automatic Data Aggregation
                      </Typography>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Data will be automatically extracted from all system modules to populate the meeting agenda.
                      </Alert>
                    </Box>
                  )}
                  
                  {index === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Review & Finalize
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Review all meeting details before finalizing the Management Review Meeting setup.
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(activeStep + 1)}
                      sx={{ mr: 1 }}
                      disabled={activeStep === MeetingWizardSteps.length - 1}
                    >
                      {activeStep === MeetingWizardSteps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                    <Button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(activeStep - 1)}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeetingDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Meeting</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
