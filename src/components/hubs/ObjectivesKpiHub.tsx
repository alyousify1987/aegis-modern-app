import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  FileUpload as FileUploadIcon
} from '@mui/icons-material';

interface KPI {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  lastUpdated: string;
  owner: string;
  frequency: 'monthly' | 'quarterly' | 'annually';
}

interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  targetDate: string;
  owner: string;
  kpis: string[];
}

const mockKPIs: KPI[] = [
  {
    id: '1',
    name: 'Audit Completion Rate',
    description: 'Percentage of planned audits completed on time',
    target: 95,
    current: 87,
    unit: '%',
    status: 'at-risk',
    lastUpdated: '2025-08-09',
    owner: 'Quality Manager',
    frequency: 'monthly'
  },
  {
    id: '2',
    name: 'Non-Conformance Closure Time',
    description: 'Average days to close non-conformances',
    target: 30,
    current: 25,
    unit: 'days',
    status: 'on-track',
    lastUpdated: '2025-08-08',
    owner: 'Process Owner',
    frequency: 'monthly'
  },
  {
    id: '3',
    name: 'Training Compliance',
    description: 'Percentage of staff with up-to-date training',
    target: 100,
    current: 92,
    unit: '%',
    status: 'at-risk',
    lastUpdated: '2025-08-07',
    owner: 'HR Manager',
    frequency: 'quarterly'
  }
];

const mockObjectives: Objective[] = [
  {
    id: '1',
    title: 'Achieve ISO 22000:2018 Certification',
    description: 'Complete all requirements for ISO 22000:2018 food safety management certification',
    status: 'in-progress',
    progress: 75,
    startDate: '2025-01-01',
    targetDate: '2025-12-31',
    owner: 'Quality Director',
    kpis: ['1', '2']
  },
  {
    id: '2',
    title: 'Reduce Food Safety Incidents',
    description: 'Implement enhanced HACCP controls to minimize food safety risks',
    status: 'in-progress',
    progress: 60,
    startDate: '2025-03-01',
    targetDate: '2025-09-30',
    owner: 'Food Safety Manager',
    kpis: ['2', '3']
  }
];

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export function ObjectivesKpiHub() {
  const [tabValue, setTabValue] = useState(0);
  const [kpis, setKpis] = useState<KPI[]>(mockKPIs);
  const [objectives, setObjectives] = useState<Objective[]>(mockObjectives);
  const [openKpiDialog, setOpenKpiDialog] = useState(false);
  const [openObjectiveDialog, setOpenObjectiveDialog] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<KPI | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'completed':
        return 'success';
      case 'at-risk':
      case 'in-progress':
        return 'warning';
      case 'off-track':
      case 'on-hold':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success';
    if (progress >= 60) return 'warning';
    return 'error';
  };

  const KPICard = ({ kpi }: { kpi: KPI }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {kpi.name}
          </Typography>
          <Chip 
            label={kpi.status.replace('-', ' ')} 
            color={getStatusColor(kpi.status)} 
            size="small" 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {kpi.description}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Progress</Typography>
            <Typography variant="body2">
              {kpi.current} / {kpi.target} {kpi.unit}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min((kpi.current / kpi.target) * 100, 100)}
            color={getProgressColor((kpi.current / kpi.target) * 100)}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Updated: {kpi.lastUpdated}
          </Typography>
          <Box>
            <IconButton size="small" onClick={() => { setSelectedKpi(kpi); setOpenKpiDialog(true); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AssessmentIcon />
        Objectives & KPI Management Hub
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>RFP Requirement 3.6:</strong> Interactive Objectives & KPI Management module providing intelligent workflows 
        for tracking organizational objectives and Key Performance Indicators with automated ingestion and evidence analysis.
      </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Strategic Objectives" />
          <Tab label="KPI Dashboard" />
          <Tab label="Achievement Workflow" />
          <Tab label="Document Ingestion" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Strategic Objectives</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setSelectedObjective(null); setOpenObjectiveDialog(true); }}
          >
            Add Objective
          </Button>
        </Box>

        <Grid container spacing={3}>
          {objectives.map((objective) => (
            <Grid key={objective.id} xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {objective.title}
                    </Typography>
                    <Chip 
                      label={objective.status.replace('-', ' ')} 
                      color={getStatusColor(objective.status)} 
                      size="small" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {objective.description}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">{objective.progress}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={objective.progress}
                      color={getProgressColor(objective.progress)}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Target: {objective.targetDate}
                    </Typography>
                    <IconButton size="small" onClick={() => { setSelectedObjective(objective); setOpenObjectiveDialog(true); }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">KPI Dashboard</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setSelectedKpi(null); setOpenKpiDialog(true); }}
          >
            Add KPI
          </Button>
        </Box>

        <Grid container spacing={3}>
          {kpis.map((kpi) => (
            <Grid key={kpi.id} xs={12} md={6} lg={4}>
              <KPICard kpi={kpi} />
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>Interactive KPI Achievement Workflow</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Feature:</strong> Guided workflow to input achievement values, provide justification by uploading evidence, 
          and analyze results against targets with intelligent evidence analysis.
        </Alert>

        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>KPI Achievement Entry</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  select
                  label="Select KPI"
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Choose a KPI...</option>
                  {kpis.map((kpi) => (
                    <option key={kpi.id} value={kpi.id}>
                      {kpi.name}
                    </option>
                  ))}
                </TextField>
                <TextField
                  label="Achievement Value"
                  type="number"
                  fullWidth
                />
              </Box>
              
              <TextField
                label="Justification & Evidence Description"
                multiline
                rows={4}
                fullWidth
                sx={{ mb: 3 }}
                placeholder="Describe the evidence supporting this KPI achievement..."
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileUploadIcon />}
                  fullWidth
                >
                  Upload Evidence Documents
                </Button>
                <Button
                  variant="contained"
                  startIcon={<TrendingUpIcon />}
                  fullWidth
                >
                  Analyze & Submit
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>AI Analysis Results</Typography>
              <Typography variant="body2" color="text.secondary">
                Select a KPI and upload evidence to see intelligent analysis results here.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>Automated Objective Ingestion</Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>RFP Requirement:</strong> Upload existing objective-tracking documents and use "Computer Intelligence" 
          to parse and extract objectives and KPIs into structured format.
        </Alert>

        <Paper sx={{ p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'grey.300' }}>
          <FileUploadIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drop objective tracking documents here
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Supported formats: Excel (.xlsx), Word (.docx), PDF, CSV
          </Typography>
          <Button variant="contained" startIcon={<FileUploadIcon />}>
            Browse Files
          </Button>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Processing Results</Typography>
          <Typography variant="body2" color="text.secondary">
            Extracted objectives and KPIs will appear here after document processing.
          </Typography>
        </Box>
      </TabPanel>

      {/* KPI Dialog */}
      <Dialog open={openKpiDialog} onClose={() => setOpenKpiDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedKpi ? 'Edit KPI' : 'Add New KPI'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField
                label="KPI Name"
                fullWidth
                defaultValue={selectedKpi?.name || ''}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                defaultValue={selectedKpi?.description || ''}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                label="Target Value"
                type="number"
                fullWidth
                defaultValue={selectedKpi?.target || ''}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                label="Unit"
                fullWidth
                defaultValue={selectedKpi?.unit || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenKpiDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Objective Dialog */}
      <Dialog open={openObjectiveDialog} onClose={() => setOpenObjectiveDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedObjective ? 'Edit Objective' : 'Add New Objective'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField
                label="Objective Title"
                fullWidth
                defaultValue={selectedObjective?.title || ''}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                defaultValue={selectedObjective?.description || ''}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                defaultValue={selectedObjective?.startDate || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                label="Target Date"
                type="date"
                fullWidth
                defaultValue={selectedObjective?.targetDate || ''}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenObjectiveDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
