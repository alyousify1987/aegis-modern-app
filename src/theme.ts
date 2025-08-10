import { createTheme } from '@mui/material/styles';
import { colors, typography as tTokens, radii, shadows } from './design/tokens';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.electricBlue,
      contrastText: colors.offWhite,
      dark: '#1565c0',
      light: '#42a5f5',
    },
    secondary: {
      main: '#90caf9',
      dark: '#5e92f3',
      light: '#e3f2fd',
    },
    background: {
      default: colors.charcoal,
      paper: colors.charcoalLight,
    },
    text: {
      primary: colors.offWhite,
      secondary: 'rgba(224,224,224,0.8)',
    },
    divider: colors.divider,
    success: {
      main: '#4caf50',
      dark: '#388e3c',
      light: '#81c784',
    },
    warning: {
      main: '#ff9800',
      dark: '#f57c00',
      light: '#ffb74d',
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      light: '#e57373',
    },
    info: {
      main: '#2196f3',
      dark: '#1976d2',
      light: '#64b5f6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontFamily: '"Inter", sans-serif', 
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: { 
      fontFamily: '"Inter", sans-serif', 
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: { 
      fontFamily: '"Inter", sans-serif', 
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: { 
      fontFamily: '"Inter", sans-serif', 
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: { 
      fontFamily: '"Inter", sans-serif', 
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: { 
      fontFamily: '"Inter", sans-serif', 
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    button: { 
      textTransform: 'none', 
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: '0.02857em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.divider}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        },
      },
      defaultProps: {
        elevation: 0,
        color: 'default',
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(25, 25, 25, 0.98)',
          borderRight: `1px solid ${colors.divider}`,
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colors.divider}`,
          background: 'linear-gradient(145deg, rgba(45, 45, 45, 0.9), rgba(35, 35, 35, 0.9))',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            borderColor: colors.electricBlue,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
          padding: '8px 24px',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 15px rgba(66, 165, 245, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
          boxShadow: '0 3px 10px rgba(66, 165, 245, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 5px 20px rgba(66, 165, 245, 0.4)',
          },
        },
        outlined: {
          borderColor: colors.electricBlue,
          color: colors.electricBlue,
          '&:hover': {
            backgroundColor: 'rgba(66, 165, 245, 0.1)',
            borderColor: colors.electricBlue,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(40, 40, 40, 0.9)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(66, 165, 245, 0.2)',
          color: colors.electricBlue,
          border: `1px solid rgba(66, 165, 245, 0.3)`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.electricBlue,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.electricBlue,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
          '&.Mui-selected': {
            color: colors.electricBlue,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(66, 165, 245, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(66, 165, 245, 0.25)',
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(45, 45, 45, 0.7)',
          borderRadius: '12px !important',
          border: `1px solid ${colors.divider}`,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
            borderColor: colors.electricBlue,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundColor: 'rgba(35, 35, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.divider}`,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableHead-root': {
            backgroundColor: 'rgba(66, 165, 245, 0.1)',
          },
          '& .MuiTableRow-root:hover': {
            backgroundColor: 'rgba(66, 165, 245, 0.05)',
          },
        },
      },
    },
  },
});
