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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Gavel as GavelIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';

interface ExternalAudit {
  id: string;
  certificationBody: string;
  standard: string;
  auditType: 'initial' | 'surveillance' | 'recertification' | 'special';
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  leadAuditor: string;
  scope: string;
  findings: number;
  majorNCs: number;
  minorNCs: number;
  certificateValid?: string;
  nextAuditDue?: string;
}

interface AuditDocument {
  id: string;
  auditId: string;
  name: string;
  type: 'report' | 'certificate' | 'nc-report' | 'plan' | 'corrective-action';
  uploadDate: string;
  size: string;
}

const mockAudits: ExternalAudit[] = [
  {
    id: '1',
    certificationBody: 'SGS International',
    standard: 'ISO 22000:2018',
    auditType: 'surveillance',
    scheduledDate: '2025-09-15',
    status: 'scheduled',
    leadAuditor: 'Dr. Sarah Johnson',
    scope: 'Food Safety Management System',
    findings: 0,
    majorNCs: 0,
    minorNCs: 0,
    nextAuditDue: '2026-09-15'
  },
  {
    id: '2',
    certificationBody: 'Bureau Veritas',
    standard: 'ISO 9001:2015',
    auditType: 'recertification',
    scheduledDate: '2025-07-20',
    completedDate: '2025-07-22',
    status: 'completed',
    leadAuditor: 'Mark Thompson',
    scope: 'Quality Management System',
    findings: 3,
    majorNCs: 0,
    minorNCs: 3,
    certificateValid: '2028-07-22',
    nextAuditDue: '2026-07-20'
  },
  {
    id: '3',
    certificationBody: 'DNV GL',
    standard: 'ISO 27001:2013',
    auditType: 'initial',
    scheduledDate: '2025-10-10',
    status: 'scheduled',
    leadAuditor: 'Lisa Chen',
    scope: 'Information Security Management System',
    findings: 0,
    majorNCs: 0,
    minorNCs: 0
  }
];

const mockDocuments: AuditDocument[] = [
  {
    id: '1',
    auditId: '2',
    name: 'ISO 9001 Certification Report 2025',
    type: 'report',
    uploadDate: '2025-07-25',
    size: '2.4 MB'
  },
  {
    id: '2',
    auditId: '2',
    name: 'Quality Management Certificate',
    type: 'certificate',
    uploadDate: '2025-07-25',
    size: '856 KB'
  },
  {
    id: '3',
    auditId: '2',
    name: 'Minor NC Corrective Actions',
    type: 'corrective-action',
    uploadDate: '2025-08-01',
    size: '1.2 MB'
  }
];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function ExternalAuditorHub() {
  const [tabValue, setTabValue] = useState(0);
  const [audits, setAudits] = useState<ExternalAudit[]>(mockAudits);
  const [documents, setDocuments] = useState<AuditDocument[]>(mockDocuments);
  const [openAuditDialog, setOpenAuditDialog] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ExternalAudit | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTimelineStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'grey';
    }
  };

  const getAuditTypeColor = (type: string) => {
    switch (type) {
      case 'initial':
        return 'primary';
      case 'surveillance':
        return 'info';
      case 'recertification':
        return 'warning';
      case 'special':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <GavelIcon />;
      case 'report':
        return <AssessmentIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <GavelIcon />
        External Auditor Hub
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>RFP Requirement 3.7:</strong> Centralized platform for managing all interactions and documentation related to external audits 
        with intelligent analytics and visual insights for non-conformance trends and auditor focus areas.
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Audit Schedule" />
          <Tab label="Document Repository" />
          <Tab label="Analytics & Insights" />
          <Tab label="Timeline View" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">External Audit Schedule</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setSelectedAudit(null); setOpenAuditDialog(true); }}
          >
            Schedule Audit
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Certification Body</TableCell>
                <TableCell>Standard</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Lead Auditor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Findings</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {audits.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell>{audit.certificationBody}</TableCell>
                  <TableCell>{audit.standard}</TableCell>
                  <TableCell>
                    <Chip 
                      label={audit.auditType} 
                      color={getAuditTypeColor(audit.auditType)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{audit.scheduledDate}</TableCell>
                  <TableCell>{audit.leadAuditor}</TableCell>
                  <TableCell>
                    <Chip 
                      label={audit.status} 
                      color={getStatusColor(audit.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {audit.status === 'completed' && (
                      <Box>
                        <Typography variant="body2">
                          Major: {audit.majorNCs} | Minor: {audit.minorNCs}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { setSelectedAudit(audit); setOpenAuditDialog(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Centralized Document Repository</Typography>
          <Button 
            variant="contained" 
            startIcon={<UploadIcon />}
          >
            Upload Document
          </Button>
        </Box>

        <Grid container spacing={3}>
          {audits.map((audit) => {
            const auditDocs = documents.filter(doc => doc.auditId === audit.id);
            if (auditDocs.length === 0) return null;

            return (
              <Grid key={audit.id} xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant="h6">
                        {audit.certificationBody} - {audit.standard}
                      </Typography>
                      <Chip 
                        label={`${auditDocs.length} documents`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {auditDocs.map((doc) => (
                        <ListItem key={doc.id}>
                          <ListItemIcon>
                            {getDocumentIcon(doc.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={doc.name}
                            secondary={`${doc.type} • ${doc.size} • Uploaded: ${doc.uploadDate}`}
                          />
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            );
          })}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>Advanced Analytics & Visual Insights</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Feature:</strong> Computer Intelligence engine analyzes uploaded audit documents to generate dashboards 
          on non-conformance trends and identify external auditor's historical areas of focus.
        </Alert>

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon />
                  Non-Conformance Trends
                </Typography>
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Chart showing NC trends across audits
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Auditor Focus Areas
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Documentation Control"
                      secondary="47% of findings in last 3 audits"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Training Records"
                      secondary="31% of findings in last 3 audits"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Risk Assessment"
                      secondary="22% of findings in last 3 audits"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Certification Status Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="h4">2</Typography>
                      <Typography variant="body2">Active Certificates</Typography>
                    </Paper>
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                      <Typography variant="h4">1</Typography>
                      <Typography variant="body2">Pending Audits</Typography>
                    </Paper>
                  </Grid>
                  <Grid xs={12} sm={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <Typography variant="h4">3</Typography>
                      <Typography variant="body2">Open Findings</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EventIcon />
          Interactive Audit Timeline
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Feature:</strong> Dynamic timeline that visualizes all historical and scheduled external audits.
        </Alert>

        <Timeline>
          {audits
            .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
            .map((audit, index) => (
            <TimelineItem key={audit.id}>
              <TimelineSeparator>
                <TimelineDot color={getTimelineStatusColor(audit.status) as any}>
                  <GavelIcon />
                </TimelineDot>
                {index < audits.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">
                        {audit.certificationBody} - {audit.standard}
                      </Typography>
                      <Chip 
                        label={audit.status} 
                        color={getStatusColor(audit.status)} 
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {audit.auditType.charAt(0).toUpperCase() + audit.auditType.slice(1)} Audit
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Lead Auditor:</strong> {audit.leadAuditor}
                    </Typography>
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Scheduled:</strong> {audit.scheduledDate}
                      {audit.completedDate && (
                        <span> | <strong>Completed:</strong> {audit.completedDate}</span>
                      )}
                    </Typography>
                    
                    {audit.status === 'completed' && (
                      <Typography variant="body2" color="text.secondary">
                        Findings: {audit.findings} | Major NCs: {audit.majorNCs} | Minor NCs: {audit.minorNCs}
                      </Typography>
                    )}
                    
                    {audit.nextAuditDue && (
                      <Typography variant="body2" color="primary">
                        <strong>Next Audit Due:</strong> {audit.nextAuditDue}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </TabPanel>

      {/* Audit Dialog */}
      <Dialog open={openAuditDialog} onClose={() => setOpenAuditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedAudit ? 'Edit Audit' : 'Schedule New Audit'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12} sm={6}>
              <TextField
                label="Certification Body"
                fullWidth
                defaultValue={selectedAudit?.certificationBody || ''}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                select
                label="Standard"
                fullWidth
                defaultValue={selectedAudit?.standard || ''}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Standard...</option>
                <option value="ISO 9001:2015">ISO 9001:2015</option>
                <option value="ISO 14001:2015">ISO 14001:2015</option>
                <option value="ISO 22000:2018">ISO 22000:2018</option>
                <option value="ISO 27001:2013">ISO 27001:2013</option>
                <option value="ISO 45001:2018">ISO 45001:2018</option>
              </TextField>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                select
                label="Audit Type"
                fullWidth
                defaultValue={selectedAudit?.auditType || ''}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select Type...</option>
                <option value="initial">Initial</option>
                <option value="surveillance">Surveillance</option>
                <option value="recertification">Recertification</option>
                <option value="special">Special</option>
              </TextField>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                label="Scheduled Date"
                type="date"
                fullWidth
                defaultValue={selectedAudit?.scheduledDate || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Lead Auditor"
                fullWidth
                defaultValue={selectedAudit?.leadAuditor || ''}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Scope"
                multiline
                rows={3}
                fullWidth
                defaultValue={selectedAudit?.scope || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAuditDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
