import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
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
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Assignment as DocumentIcon,
  Update as UpdateIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { apiJson } from '../../utils/api';

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
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ComplianceCardProps {
  name: string;
  score: number;
  totalRequirements: number;
  compliantRequirements: number;
  lastAssessed: string;
}

function ComplianceCard({ name, score, totalRequirements, compliantRequirements, lastAssessed }: ComplianceCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" mb={2}>
          {name}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h3" component="div" fontWeight="bold" mr={1}>
            {score}%
          </Typography>
          <Chip
            label={score >= 90 ? 'Compliant' : score >= 75 ? 'Partial' : 'Non-Compliant'}
            color={getScoreColor(score) as any}
            size="small"
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 2,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: score >= 90 ? '#4caf50' : score >= 75 ? '#ff9800' : '#f44336',
            },
          }}
        />

        <Typography variant="body2" color="text.secondary" mb={1}>
          {compliantRequirements} of {totalRequirements} requirements met
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Last assessed: {lastAssessed}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ComplianceHub() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Standards
        const std = await apiJson<{ data: { standards: any[]; overallScore: number } }>(`/api/compliance/standards`);
        if (std?.data) {
          setComplianceData(std.data.standards);
          setOverallScore(std.data.overallScore ?? 0);
        }
        // Requirements
        const req = await apiJson<{ data: any[] }>(`/api/compliance/requirements`);
        if (Array.isArray(req?.data)) setRequirements(req.data);
      } catch (error: any) {
        setError(error?.message || 'Failed to load compliance data');
      } finally {
        setLoading(false);
      }
    };
    fetchComplianceData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckIcon color="success" />;
      case 'partially_compliant':
        return <WarningIcon color="warning" />;
      case 'non_compliant':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'partially_compliant':
        return 'warning';
      case 'non_compliant':
        return 'error';
      default:
        return 'default';
    }
  };

  const recentUpdates = [
    {
      id: '1',
      title: 'SFDA Food Safety Regulation Amendment',
      description: 'New requirements for food establishment licensing and inspection protocols',
      date: '2025-08-01',
      type: 'regulatory_update',
      priority: 'high',
    },
    {
      id: '2',
      title: 'ISO 22000:2018 Guidance Document Released',
      description: 'Updated guidance on implementation of food safety management systems',
      date: '2025-07-28',
      type: 'standard_update',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'HACCP Training Requirements Updated',
      description: 'New certification requirements for HACCP team members',
      date: '2025-07-25',
      type: 'training_update',
      priority: 'medium',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Compliance Hub
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Monitor compliance status across all standards, track regulatory updates, and manage documentation.
      </Typography>

      {/* Overall Compliance Score */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Overall Compliance Score: {overallScore}%</strong> - Your organization is maintaining good compliance across all standards. 
          {overallScore < 80 && ' Focus areas identified that require immediate attention.'}
        </Typography>
      </Alert>

      {/* Compliance Cards */}
      <Grid container spacing={3} mb={4}>
        {complianceData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <ComplianceCard {...item} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Requirements" />
          <Tab label="Gap Analysis" />
          <Tab label="Documents" />
          <Tab label="Updates" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Standard</TableCell>
                <TableCell>Clause</TableCell>
                <TableCell>Requirement</TableCell>
                <TableCell>Responsible</TableCell>
                <TableCell>Last Assessed</TableCell>
                <TableCell>Next Assessment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requirements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {getStatusIcon(item.status)}
                      <Chip
                        label={item.status.replace('_', ' ')}
                        color={getStatusColor(item.status) as any}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{item.standard}</TableCell>
                  <TableCell>{item.clause}</TableCell>
                  <TableCell>{item.requirement}</TableCell>
                  <TableCell>{item.responsible}</TableCell>
                  <TableCell>{new Date(item.lastAssessed).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(item.nextAssessment).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" mb={3}>
          Compliance Gaps Analysis
        </Typography>
        
        <Grid container spacing={3}>
          {requirements
            .filter(item => item.status !== 'compliant')
            .map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      {getStatusIcon(item.status)}
                      <Typography variant="h6" component="div" ml={1}>
                        {item.standard} - {item.clause}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" mb={2}>
                      {item.requirement}
                    </Typography>

                    {item.gaps && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" color="error" mb={1}>
                          Identified Gaps:
                        </Typography>
                        <List dense>
                          {item.gaps.map((gap: string, index: number) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon>
                                <ErrorIcon color="error" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={gap} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {item.recommendations && (
                      <Box>
                        <Typography variant="subtitle2" color="primary" mb={1}>
                          Recommendations:
                        </Typography>
                        <List dense>
                          {item.recommendations.map((rec: string, index: number) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon>
                                <CheckIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={rec} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Compliance Documents
          </Typography>
          <Button variant="contained" startIcon={<DocumentIcon />}>
            Upload Document
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Document management system for compliance evidence, procedures, and records.
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" mb={3}>
          Regulatory Updates & Alerts
        </Typography>
        
        <List>
          {recentUpdates.map((update, index) => (
            <Box key={update.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  {update.type === 'regulatory_update' ? <UpdateIcon color="primary" /> :
                   update.type === 'standard_update' ? <DocumentIcon color="info" /> :
                   <ScheduleIcon color="warning" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {update.title}
                      </Typography>
                      <Chip
                        label={update.priority}
                        color={update.priority === 'high' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {update.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(update.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < recentUpdates.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </TabPanel>
    </Box>
  );
}
