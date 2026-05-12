import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";

// Colors from mobile app (src/theme/colors.ts)
export const colors = {
  // Page & Surfaces
  bgPage: "#f7f5f2",
  bgSurface: "#ffffff",
  bgSurfaceContainerLowest: "#ffffff",
  bgSurfaceContainerLow: "#f7f5f2",
  bgSurfaceContainer: "#eae8e5",
  bgSurfaceContainerHigh: "#f2f0ed",

  // Text
  textPrimary: "#18171a",
  textSecondary: "#52505a",
  onSurfaceVariant: "#52505a",

  // Primary (Indigo Blue)
  primary: "#3650d4",
  onPrimary: "#ffffff",
  primaryContainer: "#e8edfb",
  onPrimaryContainer: "#2540c0",
  primaryFixed: "#e8edfb",

  // Secondary (Green – streaks, success, active nav)
  secondary: "#1a7a40",
  onSecondary: "#ffffff",
  secondaryContainer: "#d4f0e0",
  onSecondaryContainer: "#1a7a40",

  // Tertiary (Amber – warnings, hard difficulty)
  tertiary: "#a04f00",
  onTertiary: "#ffffff",
  tertiaryContainer: "#fde8cc",
  onTertiaryContainer: "#a04f00",

  // Error
  error: "#c0180f",
  onError: "#ffffff",
  errorContainer: "#fde4e2",
  onErrorContainer: "#c0180f",

  // Borders
  outline: "#bfbcba",
  outlineVariant: "#e0ddd9",

  // Difficulty colors
  easyColor: "#1a7a40",
  easyBg: "#d4f0e0",
  mediumColor: "#3650d4",
  mediumBg: "#e8edfb",
  hardColor: "#a04f00",
  hardBg: "#fde8cc",
  expertColor: "#c0180f",
  expertBg: "#fde4e2",

  // Cell states
  bgCellSelected: "#e8edfb",
  bgCellHighlight: "#e8edfb",
  bgCellSameNumber: "#e8edfb",
  bgCellError: "#fde4e2",
  textInput: "#3650d4",
  textGiven: "#18171a",
  textError: "#c0180f",
} as const;

export const typography = {
  title1: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "34px",
  },
  title2: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "22px",
    fontWeight: "600",
    lineHeight: "28px",
  },
  title3: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "17px",
    fontWeight: "600",
    lineHeight: "22px",
  },
  body: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "15px",
    fontWeight: "400",
    lineHeight: "20px",
  },
  boardNumberGiven: {
    fontFamily: "DM Mono, monospace",
    fontSize: "22px",
    fontWeight: "600",
    lineHeight: "1",
  },
  boardNumberInput: {
    fontFamily: "DM Mono, monospace",
    fontSize: "22px",
    fontWeight: "400",
    lineHeight: "1",
  },
  numpadNumber: {
    fontFamily: "DM Mono, monospace",
    fontSize: "26px",
    fontWeight: "600",
    lineHeight: "1",
  },
  labelCaps: {
    fontFamily: "DM Sans, sans-serif",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.05em",
  },
} as const;

export const rounded = {
  sm: "0.125rem",
  DEFAULT: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

export const spacing = {
  unit: "4px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  boardMargin: "16px",
  cellGap: "0px",
} as const;

interface ThemeContextType {
  colors: typeof colors;
  typography: typeof typography;
  rounded: typeof rounded;
  spacing: typeof spacing;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeContext.Provider value={{ colors, typography, rounded, spacing }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
