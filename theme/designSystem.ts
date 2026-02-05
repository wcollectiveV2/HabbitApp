/**
 * HabitPulse Design System
 * 
 * Central source of truth for all design tokens.
 * Update values here to change the entire app's appearance.
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Primary brand color
  primary: '#5D5FEF',
  primaryLight: '#8183F4',
  primaryDark: '#4648C9',
  primaryAlpha: (opacity: number) => `rgba(93, 95, 239, ${opacity})`,

  // Secondary accent
  secondary: '#FF6B6B',
  secondaryLight: '#FF8E8E',
  secondaryDark: '#E55555',

  // Success / Positive
  success: '#22C55E',
  successLight: '#86EFAC',
  successBg: '#DCFCE7',

  // Warning
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningBg: '#FEF3C7',

  // Error / Danger
  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorBg: '#FEF2F2',

  // Neutral / Gray scale
  white: '#FFFFFF',
  black: '#000000',
  
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    dark: '#0F172A',
  },

  // Text colors
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    link: '#5D5FEF',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #5D5FEF 0%, #8183F4 100%)',
    sunset: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    ocean: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    forest: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
    fire: 'linear-gradient(135deg, #F12711 0%, #F5AF19 100%)',
  },
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'SF Mono', 'Fira Code', monospace",
  },

  fontSize: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
    '4xl': '32px',
    '5xl': '36px',
    '6xl': '48px',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  letterSpacing: {
    tighter: '-0.5px',
    tight: '-0.25px',
    normal: '0',
    wide: '0.5px',
    wider: '1px',
    widest: '2px',
  },
};

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
  
  // Colored shadows
  primary: `0 12px 24px ${colors.primaryAlpha(0.3)}`,
  primaryLg: `0 20px 40px ${colors.primaryAlpha(0.3)}`,
  
  // Card shadows
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
  
  // Inner shadow
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
};

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  
  // Specific transitions
  colors: 'color 200ms ease, background-color 200ms ease, border-color 200ms ease',
  transform: 'transform 200ms ease',
  all: 'all 200ms ease',
};

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
};

// =============================================================================
// COMPONENT STYLES
// =============================================================================

export const components = {
  // Layout
  layout: {
    maxWidth: '430px',
    headerHeight: '64px',
    bottomNavHeight: '72px',
    contentPadding: spacing[4],
  },

  // Buttons
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
      padding: `${spacing[4]} ${spacing[6]}`,
      borderRadius: borderRadius.xl,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.md,
      boxShadow: shadows.primary,
    },
    secondary: {
      backgroundColor: colors.gray[100],
      color: colors.text.primary,
      padding: `${spacing[3]} ${spacing[5]}`,
      borderRadius: borderRadius.xl,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.md,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.primary,
      padding: `${spacing[3]} ${spacing[5]}`,
      borderRadius: borderRadius.xl,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.md,
    },
  },

  // Input fields
  input: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    padding: `${spacing[4]} ${spacing[4]} ${spacing[4]} ${spacing[12]}`,
    fontSize: typography.fontSize.md,
    iconSize: '20px',
    iconColor: colors.gray[400],
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    boxShadow: shadows.card,
  },

  // Avatar
  avatar: {
    sizes: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '64px',
    },
    borderRadius: borderRadius.full,
    border: `2px solid ${colors.white}`,
  },

  // Badge/Tag
  badge: {
    padding: `${spacing[1]} ${spacing[3]}`,
    borderRadius: borderRadius.full,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },

  // Progress bar
  progressBar: {
    height: '8px',
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    fillColor: colors.primary,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a complete button style object
 */
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'ghost' = 'primary'): React.CSSProperties => ({
  ...components.button[variant],
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: spacing[2],
  transition: transitions.all,
});

/**
 * Get a complete input style object
 */
export const getInputStyle = (): React.CSSProperties => ({
  width: '100%',
  backgroundColor: components.input.backgroundColor,
  border: 'none',
  borderRadius: components.input.borderRadius,
  padding: components.input.padding,
  fontSize: components.input.fontSize,
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: typography.fontFamily.primary,
});

/**
 * Get a complete card style object
 */
export const getCardStyle = (): React.CSSProperties => ({
  backgroundColor: components.card.backgroundColor,
  borderRadius: components.card.borderRadius,
  padding: components.card.padding,
  boxShadow: components.card.boxShadow,
});

// =============================================================================
// DESIGN SYSTEM EXPORT
// =============================================================================

const designSystem = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components,
  getButtonStyle,
  getInputStyle,
  getCardStyle,
};

export default designSystem;
