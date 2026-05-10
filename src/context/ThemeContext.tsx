import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { createTheme } from '../theme/theme';
import { useStore } from '../store/useStore';

interface ThemeContextType {
  colors: ReturnType<typeof createTheme>['colors'];
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const darkMode = useStore((state) => state.settings.darkMode);
  const theme = useMemo(() => createTheme(darkMode), [darkMode]);

  const contextValue = useMemo(() => ({
    colors: theme.colors,
    isDark: darkMode,
  }), [theme.colors, darkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
