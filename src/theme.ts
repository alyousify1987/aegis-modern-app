import { createTheme } from '@mui/material/styles';
import { colors, typography as tTokens, radii, shadows } from './design/tokens';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
  main: colors.electricBlue,
  contrastText: colors.charcoal,
    },
    background: {
  default: colors.charcoal,
  paper: colors.charcoalLight,
    },
    text: {
  primary: colors.offWhite,
      secondary: 'rgba(224,224,224,0.7)',
    },
    divider: colors.divider
  },
  typography: {
    fontFamily: tTokens.fontFamilyBase,
    h1: { fontFamily: tTokens.fontFamilyHeading, fontWeight: tTokens.fontWeightBold },
    h2: { fontFamily: tTokens.fontFamilyHeading, fontWeight: tTokens.fontWeightBold },
    h3: { fontFamily: tTokens.fontFamilyHeading, fontWeight: tTokens.fontWeightBold },
    h4: { fontFamily: tTokens.fontFamilyHeading, fontWeight: tTokens.fontWeightBold },
    h5: { fontFamily: tTokens.fontFamilyHeading, fontWeight: tTokens.fontWeightBold },
    h6: { fontFamily: tTokens.fontFamilyHeading, fontWeight: tTokens.fontWeightBold },
    button: { textTransform: 'none', fontWeight: tTokens.fontWeightBold },
  },
  shape: {
    borderRadius: radii.md,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
      borderBottom: `1px solid ${colors.divider}`
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
      borderRight: `1px solid ${colors.divider}`
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
      borderRadius: radii.lg,
      border: `1px solid ${colors.divider}`
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
      borderRadius: 10,
      boxShadow: shadows.glowPrimary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
