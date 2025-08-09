import { ReactNode, useEffect as useEffectReact, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment as AuditIcon,
  CheckCircle as ComplianceIcon,
  Description as DocumentsIcon,
  Warning as RiskIcon,
  Assignment as ActionIcon,
  School as KnowledgeIcon,
  Analytics as AnalyticsIcon,
  AccountCircle,
  PlayArrow,
  BuildCircle as DiagnosticsIcon,
} from '@mui/icons-material';
import CircleIcon from '@mui/icons-material/Circle';
import { useEffect } from 'react';
import { pingApi } from '../services/net/health';
import type { CurrentView } from '../types';
import { t, getLocale, setLocale, type Locale } from '../services/i18n';
import { useToast } from './ToastProvider';
import { PassphraseDialog } from './PassphraseDialog';
import { isProcessingQueue, onQueueChange } from '../services/net/syncQueue';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  onLogout?: () => void;
}

interface MenuItemData {
  key: 'menu_dashboard' | 'menu_audit' | 'menu_compliance' | 'menu_documents' | 'menu_ncrs' | 'menu_risk' | 'menu_actions' | 'menu_knowledge' | 'menu_analytics' | 'menu_diagnostics';
  icon: ReactNode;
  view: CurrentView;
}

const menuItems: MenuItemData[] = [
  { key: 'menu_dashboard', icon: <DashboardIcon />, view: 'dashboard' },
  { key: 'menu_audit', icon: <AuditIcon />, view: 'audit' },
  { key: 'menu_compliance', icon: <ComplianceIcon />, view: 'compliance' },
  { key: 'menu_documents', icon: <DocumentsIcon />, view: 'documents' },
  { key: 'menu_ncrs', icon: <ActionIcon />, view: 'ncrs' },
  { key: 'menu_risk', icon: <RiskIcon />, view: 'risk' },
  { key: 'menu_actions', icon: <ActionIcon />, view: 'actions' },
  { key: 'menu_knowledge', icon: <KnowledgeIcon />, view: 'knowledge' },
  { key: 'menu_analytics', icon: <AnalyticsIcon />, view: 'analytics' },
  { key: 'menu_diagnostics', icon: <DiagnosticsIcon />, view: 'diagnostics' },
];

const viewToKey: Record<CurrentView, MenuItemData['key']> = {
  dashboard: 'menu_dashboard',
  audit: 'menu_audit',
  compliance: 'menu_compliance',
  documents: 'menu_documents',
  ncrs: 'menu_ncrs',
  risk: 'menu_risk',
  actions: 'menu_actions',
  knowledge: 'menu_knowledge',
  analytics: 'menu_analytics',
  diagnostics: 'menu_diagnostics',
};

export function Layout({ children, currentView, setCurrentView, onLogout }: LayoutProps) {
  const theme = useTheme();
  const { notify } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lang, setLang] = useState<Locale>(getLocale());
  const [backendUp, setBackendUp] = useState<boolean | null>(null);
  const [passDlg, setPassDlg] = useState(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      const ok = await pingApi('/health');
      if (alive) setBackendUp(ok);
    };
    void check();
    const id = setInterval(check, 8000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Observe queue processing to render a subtle syncing indicator
  useEffectReact(() => {
    setSyncing(isProcessingQueue());
    const unsub = onQueueChange(() => setSyncing(isProcessingQueue()));
    return () => { unsub && unsub(); };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => setSettingsOpen(false);
  const handleLangChange = (e: SelectChangeEvent<Locale>) => {
    const value = e.target.value as Locale;
    setLang(value);
    setLocale(value);
  };

  const handleGlobalOneClickAudit = () => {
    // Switch to audit hub and trigger one click audit
    setCurrentView('audit');
    setTimeout(() => {
      notify('Global One Click Audit activated — switching to Audit Hub', 'info');
    }, 500);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
          {t('app_title')}
        </Typography>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.view} disablePadding>
            <ListItemButton
              selected={currentView === item.view}
              onClick={() => setCurrentView(item.view)}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(125,249,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(125,249,255,0.16)' },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.key)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={(t) => ({
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          [t.direction === 'rtl' ? 'mr' : 'ml']: { sm: `${drawerWidth}px` },
          backdropFilter: 'saturate(120%) blur(6px)',
          backgroundColor: 'rgba(36,36,36,0.8)'
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t(viewToKey[currentView])}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <CircleIcon sx={{ fontSize: 10, color: backendUp === null ? 'warning.main' : backendUp ? 'success.main' : 'error.main', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">API</Typography>
          </Box>
          {syncing && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <CircleIcon sx={{ fontSize: 10, color: 'info.main', mr: 1, animation: 'pulse 1s ease-in-out infinite' }} />
              <Typography variant="body2" color="text.secondary">Syncing…</Typography>
            </Box>
          )}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); openSettings(); }}>Settings</MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); onLogout?.(); }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backdropFilter: 'saturate(120%) blur(6px)', backgroundColor: 'rgba(36,36,36,0.8)' },
          }}
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
      
      {/* Global One Click Audit FAB */}
    <Fab
        color="primary"
        aria-label="One Click Audit"
        onClick={handleGlobalOneClickAudit}
        sx={{
          position: 'fixed',
          bottom: 24,
      [theme.direction === 'rtl' ? 'left' : 'right']: 24,
          backgroundColor: '#4caf50',
          '&:hover': {
            backgroundColor: '#45a049',
            transform: 'scale(1.1)',
          },
          width: 64,
          height: 64,
          fontSize: '1.5rem',
          boxShadow: 6,
          transition: 'all 0.3s ease-in-out',
          zIndex: 1000,
        }}
      >
        <PlayArrow sx={{ fontSize: '2rem' }} />
      </Fab>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={closeSettings} fullWidth maxWidth="xs">
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }} size="small">
            <InputLabel id="lang-label">Language</InputLabel>
            <Select
              labelId="lang-label"
              label="Language"
              value={lang}
              onChange={handleLangChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="ar">العربية</MenuItem>
            </Select>
          </FormControl>
          <Box mt={2}>
            <MenuItem onClick={() => setPassDlg(true)}>Set Encryption Passphrase…</MenuItem>
          </Box>
        </DialogContent>
        <DialogActions>
          <MenuItem onClick={closeSettings}>Close</MenuItem>
        </DialogActions>
      </Dialog>

      <PassphraseDialog open={passDlg} onClose={() => setPassDlg(false)} />
    </Box>
  );
}
