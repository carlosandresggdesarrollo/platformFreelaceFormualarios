import type { ReactNode } from 'react';

import { useMemo, useEffect, useContext, useCallback, createContext } from 'react';

// ----------------------------------------------------------------------

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ----------------------------------------------------------------------

type ThemeModeProviderProps = {
  children: ReactNode;
};

// El dashboard usa únicamente el modo claro. Se conserva la forma del contexto
// (mode/toggleMode/setMode) para no romper los componentes que lo consumen,
// pero el modo es fijo y las funciones de cambio son no-ops.
export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
  const mode: ThemeMode = 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', 'light');
  }, []);

  const noop = useCallback(() => {}, []);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: noop,
      setMode: noop,
    }),
    [noop]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ----------------------------------------------------------------------

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }

  return context;
}
