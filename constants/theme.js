/**
 * Fitret Counseling - Premium Theme
 * Sage green palette with refined typography and spacing
 */

export const COLORS = {
  // Brand palette
  // #90beab #c5dbce #f4eedb
  primary: '#90beab',
  primaryLight: '#c5dbce',
  primaryDark: '#6f9e8a',
  
  // Neutrals
  white: '#FFFFFF',
  offWhite: '#FFFFFF',
  gray50: '#f8f6ef',
  gray100: '#ebe6d8',
  gray200: '#ddd8ca',
  gray300: '#c7c2b7',
  gray400: '#aaa59b',
  gray500: '#8a857c',
  gray600: '#6d6a62',
  gray700: '#4e4b45',
  gray800: '#35332f',
  gray900: '#1f1d1a',
  
  // Accents
  accent: '#f4eedb',
  accentLight: '#fcf8ee',
  success: '#6ca993',
  error: '#c85f5f',
  
  // Overlays
  overlay: 'rgba(0,0,0,0.4)',
  cardShadow: 'rgba(31,29,26,0.08)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#1f1d1a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#1f1d1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1f1d1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
};
