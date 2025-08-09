// Centralized, framework-agnostic design tokens
// Keep neutral; UI layers (MUI, etc.) map these as needed.

// Colors
export const colors = {
  electricBlue: '#7df9ff',
  charcoal: '#1a1a1a',
  charcoalLight: '#242424',
  offWhite: '#e0e0e0',
  divider: 'rgba(255,255,255,0.08)'
} as const;

// Typography
export const typography = {
  fontFamilyBase:
    'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, sans-serif',
  fontFamilyHeading: 'Poppins, Inter, sans-serif',
  fontWeightBold: 600,
} as const;

// Spacing scale (8px base)
export const spacing = (n: number) => `${n * 8}px`;

// Radii
export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

// Shadows
export const shadows = {
  glowPrimary: '0 4px 16px rgba(125, 249, 255, 0.15)',
} as const;

// Z-index
export const zIndex = {
  appBar: 1100,
  drawer: 1200,
  fab: 1050,
} as const;

// Motion
export const motion = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;
