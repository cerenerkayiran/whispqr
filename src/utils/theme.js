// Theme configuration for whispqr app
// Pastel color palette with modern design principles

export const colors = {
  // Primary colors - muted teal/blue-gray
  primary: '#89A8B2',       // Muted teal-gray
  primaryLight: '#B3C8CF',  // Light blue-gray
  primaryDark: '#6B8A94',   // Deeper teal-gray
  
  // Secondary colors - complementary warm tones
  secondary: '#B3C8CF',     // Light blue-gray
  secondaryLight: '#D4DDE1', // Very light blue-gray
  secondaryDark: '#96AFB8',  // Medium blue-gray
  
  // Accent colors - using the warm neutrals
  accent: '#89A8B2',        // Same as primary for cohesion
  accentLight: '#E5E1DA',   // Warm off-white
  success: '#8FB2A1',       // Muted sage green
  warning: '#C4A888',       // Muted warm brown
  error: '#B89088',         // Muted coral
  
  // Neutral backgrounds
  background: '#F1F0E8',    // Very light warm white
  surface: '#E5E1DA',       // Warm off-white
  surfaceLight: '#F1F0E8',  // Same as background
  
  // Text colors - adjusted for new palette
  textPrimary: '#2C3E50',   // Dark blue-gray for contrast
  textSecondary: '#5A6C7D', // Medium blue-gray
  textLight: '#8A9BA8',     // Light blue-gray
  textOnPrimary: '#FFFFFF', // White text on primary
  
  // Border and divider colors
  border: '#D0CCC4',        // Subtle warm border
  divider: '#E8E4DC',       // Light warm divider
  
  // Status colors with muted palette
  online: '#8FB2A1',        // Muted sage
  offline: '#C4A888',       // Muted tan
  
  // Transparent overlays
  overlay: 'rgba(137, 168, 178, 0.1)', // Primary with low opacity
  modalOverlay: 'rgba(44, 62, 80, 0.3)', // Dark blue overlay
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  sm: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const animations = {
  // Subtle animation durations
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Easing curves for smooth animations
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
}; 