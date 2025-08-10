import { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { InstallBanner } from './InstallBanner';
import { apiJson } from '../utils/api';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Button,
  Fab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Assessment,
  CheckCircle,
  Warning,
  PlayArrow,
  Add,
} from '@mui/icons-material';

interface DashboardData {
  totalAudits: number;
  completedAudits: number;
  inProgressAudits: number;
  plannedAudits: number;
  pendingActions: number;
  criticalFindings: number;
  riskScore: number;
  complianceScore: number;
  recentActivities?: {
    text: string;
    time: string;
    type: 'audit' | 'compliance' | 'risk' | 'training';
  }[];
  upcomingTasks?: {
    task: string;
    due: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function DashboardCard({ title, value, icon, color, subtitle }: DashboardCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              color: 'white',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface ProgressCardProps {
  title: string;
  progress: number;
  target: number;
  color: string;
}

function ProgressCard({ title, progress, target, color }: ProgressCardProps) {
  const percentage = (progress / target) * 100;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" mb={2}>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="h4" component="div" fontWeight="bold">
            {progress}
          </Typography>
          <Typography variant="body1" color="text.secondary" ml={1}>
            / {target}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
            },
          }}
        />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {percentage.toFixed(1)}% Complete
        </Typography>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { notify } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
  const { data } = await apiJson<{ data: DashboardData }>(`/api/analytics/dashboard`);
      setData(data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickAudit = async () => {
    try {
      setLoading(true);
  const result = await apiJson<any>(`/api/audits/one-click`, {
        method: 'POST',
        body: JSON.stringify({ type: 'ISO 22000', department: 'Production' }),
      });

      if ((result as any)?.auditId) {
        notify(`Audit created: ${(result as any).audit.title}`, 'success');
        
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        notify('Failed to create audit', 'error');
      }
    } catch (error) {
      notify('Error creating audit: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
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

  if (!data) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        No dashboard data available
      </Alert>
    );
  }

  return (
    <Box>
      <InstallBanner />
      {/* Header with One Click Audit */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome to your Aegis Audit Platform dashboard. Here's an overview of your current audit and compliance status.
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleOneClickAudit}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: 3,
              '&:hover': {
                backgroundColor: '#1565c0',
                boxShadow: 6,
              },
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            One Click Audit
          </Button>
          <Fab
            color="primary"
            aria-label="Quick Audit"
            onClick={handleOneClickAudit}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#45a049',
              },
            }}
          >
            <Assessment />
          </Fab>
        </Box>
      </Box>

      {/* Quick Actions Section */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>
          🚀 Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={handleOneClickAudit}
            sx={{ borderColor: '#1976d2', color: '#1976d2' }}
          >
            Full System Audit
          </Button>
          <Button
            variant="outlined"
            startIcon={<CheckCircle />}
            onClick={() => notify('Food Safety Check initiated', 'info')}
            sx={{ borderColor: '#4caf50', color: '#4caf50' }}
          >
            Food Safety Check
          </Button>
          <Button
            variant="outlined"
            startIcon={<Warning />}
            onClick={() => notify('HACCP Verification started', 'info')}
            sx={{ borderColor: '#ff9800', color: '#ff9800' }}
          >
            HACCP Verification
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => notify('SFDA Compliance check initiated', 'info')}
            sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
          >
            SFDA Compliance
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => notify('Custom audit template wizard opened', 'info')}
            sx={{ borderColor: '#607d8b', color: '#607d8b' }}
          >
            Custom Audit
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Active Audits"
            value={data.totalAudits}
            icon={<Assessment />}
            color="#1976d2"
            subtitle={`${data.inProgressAudits} in progress, ${data.plannedAudits} planned`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Compliance Score"
            value={`${data.complianceScore}%`}
            icon={<CheckCircle />}
            color="#2e7d32"
            subtitle="Based on completed audits"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            title="Critical Findings"
            value={data.criticalFindings}
            icon={<Warning />}
            color="#ed6c02"
            subtitle={`${data.pendingActions} pending actions`}
          />
        </Grid>

        {/* Progress Cards */}
        <Grid item xs={12} sm={6} md={6}>
          <ProgressCard
            title="Audit Completion Progress"
            progress={data.completedAudits}
            target={data.totalAudits}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <ProgressCard
            title="Action Items Completed"
            progress={Math.max(0, data.pendingActions - 2)}
            target={data.pendingActions}
            color="#2e7d32"
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" component="div" mb={2}>
              Recent Activity
            </Typography>
            <Box>
              {data.recentActivities && data.recentActivities.length > 0 ? 
                data.recentActivities.map((activity: any, index: number) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    py={1}
                    borderBottom="1px solid #e0e0e0"
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: activity.type === 'audit' ? '#1976d2' :
                                       activity.type === 'compliance' ? '#2e7d32' :
                                       activity.type === 'risk' ? '#ed6c02' : '#9c27b0',
                        mr: 2,
                      }}
                    />
                    <Box flexGrow={1}>
                      <Typography variant="body2">
                        {activity.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    Activity feed will appear here as you use the system
                  </Typography>
                )}
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" component="div" mb={2}>
              Upcoming Tasks
            </Typography>
            <Box>
              {data.upcomingTasks && data.upcomingTasks.length > 0 ? 
                data.upcomingTasks.map((task: any, index: number) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    py={1}
                    borderBottom="1px solid #e0e0e0"
                  >
                    <Box>
                      <Typography variant="body2">
                        {task.task}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Due: {task.due}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: task.priority === 'high' ? '#ffebee' :
                                       task.priority === 'medium' ? '#fff3e0' : '#e8f5e8',
                        color: task.priority === 'high' ? '#c62828' :
                               task.priority === 'medium' ? '#ef6c00' : '#2e7d32',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {task.priority.toUpperCase()}
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    Tasks and deadlines will appear here based on your audit schedule
                  </Typography>
                )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
