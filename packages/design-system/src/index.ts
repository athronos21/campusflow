/**
 * CampusFlow Design System Tokens
 * Comprehensive design tokens for Web (Next.js/Tailwind) & Mobile (Flutter Material 3)
 * Target: Ethiopian Higher Education (Haramaya University Pilot)
 */

export const brand = {
  name: 'CampusFlow',
  tagline: 'Campus Super-App for Ethiopian Universities',
  pilotCampus: 'Haramaya University (Main Campus, Bate)',
  version: '1.0.0',
};

export const colors = {
  // Primary Brand Scale (Deep Indigo & Modern Violet)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5', // Brand primary action
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b', // Hero deep background
  },

  // Secondary & Accent Scale
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // Violet accent
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // Slate Neutrals (Balanced for sunlight & high-contrast readability)
  neutral: {
    25: '#fcfcfd',
    50: '#f8fafc', // App canvas background
    100: '#f1f5f9', // Muted card background
    200: '#e2e8f0', // Border divider
    300: '#cbd5e1', // Inactive input border
    400: '#94a3b8', // Muted captions & placeholder
    500: '#64748b', // Subtle icons
    600: '#475569', // Secondary body text
    700: '#334155', // Primary body text
    800: '#1e293b', // Subheadings
    900: '#0f172a', // High-contrast display titles
    950: '#020617', // Dark mode foundation
  },

  // Semantic Status Colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981', // Paid & verified badges
    600: '#059669',
    700: '#047857',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b', // Preparing orders, departing shuttles
    600: '#d97706',
    700: '#b45309',
  },

  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444', // Out of stock, cancellation, emergency
    600: '#dc2626',
    700: '#b91c1c',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6', // Announcements, academic notes
    600: '#2563eb',
    700: '#1d4ed8',
  },

  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    500: '#14b8a6', // Housing & accommodations
    600: '#0d9488',
    700: '#0f766e',
  },

  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b', // Transport shuttles
    600: '#d97706',
    700: '#b45309',
  },
};

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    '2xs': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.02em' }], // 11px
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }], // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0em' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }], // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }], // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }], // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.03em' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.035em' }], // 36px
    '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.04em' }], // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
};

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
};

export const radii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

export const shadows = {
  xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
  sm: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.08)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.08)',
  xl: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
  glow: '0 0 25px -5px rgba(79, 70, 229, 0.35)',
  drawer: '0 -10px 25px -5px rgba(15, 23, 42, 0.15)',
};

export const motion = {
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1100,
  drawer: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  toast: 1500,
};

export const breakpoints = {
  mobile: '360px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
};
