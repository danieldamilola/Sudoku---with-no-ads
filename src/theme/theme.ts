import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from './colors';
import { Typography } from './typography';
import { Spacing, BorderRadius, Shadow } from './spacing';

export const createTheme = (isDark: boolean) => {
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadow: Shadow,
  };
};

export type Theme = ReturnType<typeof createTheme>;
