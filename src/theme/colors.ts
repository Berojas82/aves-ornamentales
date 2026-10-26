// Design tokens for Aves Ornamentales
export const Colors = {
  // Brand palette - warm earth tones with vibrant accents
  primary: '#D97706',       // Amber 600 - warm gold
  primaryLight: '#F59E0B',  // Amber 400
  primaryDark: '#92400E',   // Amber 800
  secondary: '#065F46',     // Emerald 800 - deep green
  secondaryLight: '#10B981', // Emerald 500
  accent: '#7C3AED',        // Violet 600 - premium accent

  // Backgrounds
  bg: '#0F1117',            // Almost black
  bgCard: '#1A1F2E',        // Dark blue-gray
  bgCardLight: '#222838',   // Slightly lighter card
  bgModal: '#1E2333',
  bgInput: '#252B3B',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Status badges
  statusActive: '#10B981',   // Green
  statusBrood: '#F59E0B',    // Amber/egg
  statusTreatment: '#EF4444', // Red

  // UI elements
  border: '#2D3748',
  borderLight: '#374151',
  divider: '#1E2533',
  shadow: '#000000',

  // Gradients
  gradientStart: '#1A1040',
  gradientEnd: '#0F1117',

  // Tab bar
  tabActive: '#F59E0B',
  tabInactive: '#4B5563',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
