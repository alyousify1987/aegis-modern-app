import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as ReportIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { apiJson } from '../../utils/api';
import { initDuckDB, query as duckQuery, registerTable as duckRegister } from '../../services/duckdb/db';
import { useToast } from '../ToastProvider';
import { getSummary as getCachedSummary, saveSummary } from '../../services/analytics/cache';
import { t } from '../../services/i18n';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  const isPositive = change > 0;
  const changeColor = isPositive ? '#4caf50' : '#f44336';
  
  return (
    <Card>
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
        <Typography variant="h3" component="div" fontWeight="bold" mb={1}>
          {value}
        </Typography>
        <Box display="flex" alignItems="center">
          <TrendingUpIcon 
            fontSize="small" 
            sx={{ 
              color: changeColor, 
              transform: isPositive ? 'none' : 'rotate(180deg)',
              mr: 0.5 
            }} 
          />
          <Typography variant="body2" color={changeColor}>
            {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'} from last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
// Using centralized apiFetch

const recentAudits = [
  {
    id: '1',
    title: 'Internal Food Safety Audit - Line A',
    date: '2025-08-05',
    score: 92,
    findings: 3,
    status: 'completed',
  },
  {
    id: '2',
    title: 'SFDA Compliance Review',
    date: '2025-08-03',
    score: 85,
    findings: 5,
    status: 'completed',
  },
  {
    id: '3',
    title: 'Supplier Audit - ABC Foods',
    date: '2025-08-01',
    score: 90,
    findings: 2,
    status: 'completed',
  },
];

const complianceByStandard = [
  { standard: 'ISO 22000', score: 94, trend: 'up' },
  { standard: 'HACCP', score: 89, trend: 'up' },
  { standard: 'SFDA', score: 76, trend: 'down' },
  { standard: 'ISO 9001', score: 92, trend: 'stable' },
];

const findingsByCategory = [
  { category: 'Documentation', count: 15, percentage: 35 },
  { category: 'Process Control', count: 12, percentage: 28 },
  { category: 'Training', count: 8, percentage: 19 },
  { category: 'Equipment', count: 5, percentage: 12 },
  { category: 'Other', count: 3, percentage: 7 },
];

export function AnalyticsHub() {
  const { notify } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('last30days');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalAudits: number;
    completedAudits: number;
    inProgressAudits: number;
    plannedAudits: number;
    pendingActions: number;
    criticalFindings: number;
    riskScore: number;
    complianceScore: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try cache first
        const cached = await getCachedSummary();
        if (cached) setSummary(cached);

        const json = await apiJson<{ data: typeof summary }>(`/api/analytics`);
        if (json?.data) {
          setSummary(json.data);
          await saveSummary(json.data as any);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#ff9800';
    return '#f44336';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
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
          {t('analytics_title')}
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('time_range')}</InputLabel>
            <Select
              value={timeRange}
              label={t('time_range')}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="last7days">Last 7 days</MenuItem>
              <MenuItem value="last30days">Last 30 days</MenuItem>
              <MenuItem value="last90days">Last 90 days</MenuItem>
              <MenuItem value="lastyear">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            {t('filters')}
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}>
            {t('export')}
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Real-time dashboards, predictive analytics, and customizable reports with AI-driven insights.
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Audits Completed"
            value={summary?.completedAudits ?? 0}
            change={0}
            icon={<ReportIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Compliance Score"
            value={`${summary?.complianceScore ?? 0}%`}
            change={0}
            icon={<AnalyticsIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Open Findings"
            value={summary?.criticalFindings ?? 0}
            change={0}
            icon={<TrendingUpIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Avg Audit Time"
            value={'—'}
            change={0}
            icon={<DashboardIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Audit Performance" />
          <Tab label="Compliance Trends" />
          <Tab label="Custom Reports" />
          <Tab label="DuckDB Demo" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Recent Audits */}
          <Grid sx={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                {t('recent_audit_performance')}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Audit Title</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Findings</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAudits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell>{audit.title}</TableCell>
                        <TableCell>{new Date(audit.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Typography
                              variant="body2"
                              color={getScoreColor(audit.score)}
                              fontWeight="bold"
                            >
                              {audit.score}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{audit.findings}</TableCell>
                        <TableCell>
                          <Chip
                            label={audit.status}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Compliance by Standard */}
          <Grid sx={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" mb={2}>
                {t('compliance_by_standard')}
              </Typography>
              {complianceByStandard.map((item, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{item.standard}</Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" fontWeight="bold" mr={1}>
                        {item.score}%
                      </Typography>
                      <span>{getTrendIcon(item.trend)}</span>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(item.score),
                      },
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Audit Performance Chart Placeholder */}
          <Grid sx={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" mb={2}>
                Audit Performance Trends
              </Typography>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                height="300px"
                bgcolor="grey.50"
                borderRadius={1}
              >
                <Typography variant="h6" color="text.secondary">
                  📊 Interactive charts will be implemented here
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Findings by Category */}
          <Grid sx={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" mb={2}>
                Findings by Category
              </Typography>
              {findingsByCategory.map((category, index) => (
                <Box key={index} mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{category.category}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {category.count} ({category.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={category.percentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid sx={{ xs: 12 }}>
            <Paper sx={{ p: 2, height: 500 }}>
              <Typography variant="h6" mb={2}>
                Compliance Trends Over Time
              </Typography>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                height="400px"
                bgcolor="grey.50"
                borderRadius={1}
              >
                <Typography variant="h6" color="text.secondary">
                  📈 Time-series compliance charts will be implemented here
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid sx={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                Custom Report Builder
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Create custom reports with drag-and-drop widgets, filters, and scheduling.
              </Typography>
              
              <Box display="flex" gap={2} mb={3}>
                <Button variant="contained">New Report</Button>
                <Button variant="outlined">Load Template</Button>
                <Button variant="outlined">Scheduled Reports</Button>
              </Box>

              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                height="300px"
                bgcolor="grey.50"
                borderRadius={1}
              >
                <Typography variant="h6" color="text.secondary">
                  🔧 Report builder interface coming soon
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid sx={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                Available Widgets
              </Typography>
              <Box>
                {[
                  'Audit Summary',
                  'Compliance Status',
                  'Risk Heatmap',
                  'Action Tracker',
                  'Finding Trends',
                  'Performance Metrics',
                ].map((widget, index) => (
                  <Chip
                    key={index}
                    label={widget}
                    variant="outlined"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* DuckDB Demo */}
      <TabPanel value={tabValue} index={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>DuckDB In-Browser Demo</Typography>
      <Button variant="outlined" onClick={async () => {
            try {
              await initDuckDB();
              const rows = await duckQuery<{ hello: string }>("SELECT 'world' AS hello");
        notify(`DuckDB says: ${rows[0]?.hello}`, 'success');
            } catch (err: any) {
        notify(`DuckDB error: ${err?.message || String(err)}`,'error');
            }
          }}>Run Test Query</Button>
          <Button sx={{ ml: 2 }} variant="contained" onClick={async () => {
            try {
              await initDuckDB();
              // Get audits from API and aggregate by status
              const audits = await apiJson<{ data: Array<{ status: string }> }>(`/api/audits`);
              // Register a small values table
              const rows = (audits?.data || []).map(a => [a.status]);
              // Create table and count
              await duckQuery(`DROP TABLE IF EXISTS audits;`);
              await duckRegister('audits', ['status'], rows);
              const agg = await duckQuery<{ status: string; cnt: number }>(`SELECT status, COUNT(*) as cnt FROM audits GROUP BY status`);
              notify('Counts by status: ' + agg.map(a => `${a.status}: ${a.cnt}`).join(', '), 'info');
            } catch (err: any) {
              notify(`Aggregation error: ${err?.message || String(err)}`,'error');
            }
          }}>Aggregate Audits</Button>
        </Paper>
      </TabPanel>
    </Box>
  );
}
