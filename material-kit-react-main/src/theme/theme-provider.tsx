import type { ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import { createTheme } from './create-theme';
import { useThemeMode, ThemeModeProvider } from './theme-context';

import type {} from './extend-theme-types';
import type { ThemeOptions } from './types';

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps> & {
  themeOverrides?: ThemeOptions;
};

function ThemeProviderInner({ themeOverrides, children, ...other }: ThemeProviderProps) {
  const { mode } = useThemeMode();

  const theme = createTheme({
    themeOverrides,
  });

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} defaultMode={mode} {...other}>
      <CssBaseline />
      {children}
    </ThemeVarsProvider>
  );
}

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
  return (
    <ThemeModeProvider>
      <ThemeProviderInner themeOverrides={themeOverrides} {...other}>
        {children}
      </ThemeProviderInner>
    </ThemeModeProvider>
  );
}

// Re-export hook for easy access
export { useThemeMode } from './theme-context';
