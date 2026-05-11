import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

// Colors from mobile app (src/theme/colors.ts)
export const colors = {
  // Page & Surfaces
  bgPage:                   '#f5f2ee',
  bgSurface:                '#ffffff',
  bgSurfaceContainerLowest: '#ffffff',
  bgSurfaceContainerLow:    '#f5f2ee',
  bgSurfaceContainer:       '#ece9e5',
  bgSurfaceContainerHigh:   '#e3e0dc',

  // Text
  textPrimary:              '#1a1a1a',
  textSecondary:            '#6b7280',
  onSurfaceVariant:         '#6b7280',

  // Primary (Indigo Blue)
  primary:                  '#3b5bdb',
  onPrimary:                '#ffffff',
  primaryContainer:         '#e0e7ff',
  onPrimaryContainer:       '#1a3299',
  primaryFixed:             '#e0e7ff',

  // Secondary (Green – streaks, success, active nav)
  secondary:                '#2f9e44',
  onSecondary:              '#ffffff',
  secondaryContainer:       '#d3f9d8',
  onSecondaryContainer:     '#1e6f30',

  // Tertiary (Amber – warnings, hard difficulty)
  tertiary:                 '#e67700',
  onTertiary:               '#ffffff',
  tertiaryContainer:        '#fff3cd',
  onTertiaryContainer:      '#7d4000',

  // Error
  error:                    '#c92a2a',
  onError:                  '#ffffff',
  errorContainer:           '#ffe3e3',
  onErrorContainer:         '#8b0000',

  // Borders
  outline:                  '#adb5bd',
  outlineVariant:           '#dee2e6',

  // Difficulty colors
  easyColor:                '#2f9e44',
  easyBg:                   '#d3f9d8',
  mediumColor:              '#3b5bdb',
  mediumBg:                 '#dbe4ff',
  hardColor:                '#e67700',
  hardBg:                   '#fff3cd',
  expertColor:              '#c92a2a',
  expertBg:                 '#ffe3e3',

  // Cell states
  bgCellSelected:           '#dbe4ff',
  bgCellHighlight:          '#f0f2ff',
  bgCellSameNumber:         '#e0e7ff',
  bgCellError:              '#ffe3e3',
  textInput:                '#3b5bdb',
  textGiven:                '#1a1a1a',
  textError:                '#c92a2a',
} as const;

export const typography = {
  title1: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '34px',
  },
  title2: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '22px',
    fontWeight: '600',
    lineHeight: '28px',
  },
  title3: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '17px',
    fontWeight: '600',
    lineHeight: '22px',
  },
  body: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '15px',
    fontWeight: '400',
    lineHeight: '20px',
  },
  boardNumberGiven: {
    fontFamily: 'DM Mono, monospace',
    fontSize: '22px',
    fontWeight: '600',
    lineHeight: '1',
  },
  boardNumberInput: {
    fontFamily: 'DM Mono, monospace',
    fontSize: '22px',
    fontWeight: '400',
    lineHeight: '1',
  },
  numpadNumber: {
    fontFamily: 'DM Mono, monospace',
    fontSize: '26px',
    fontWeight: '500',
    lineHeight: '1',
  },
  labelCaps: {
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
} as const;

export const rounded = {
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

export const spacing = {
  unit: '4px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  boardMargin: '16px',
  cellGap: '0px',
} as const;

interface ThemeContextType {
  colors: typeof colors;
  typography: typeof typography;
  rounded: typeof rounded;
  spacing: typeof spacing;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors, typography, rounded, spacing }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
