import type { CSSProperties } from 'react';

import { useMemo } from 'react';

import { DEFAULT_THEME, LANDING_THEMES } from './landing-themes';

import type { LandingThemeName } from './landing-themes';

// ----------------------------------------------------------------------

export function useLandingTheme(themeName?: string): CSSProperties {
  return useMemo(() => {
    const key = (themeName && themeName in LANDING_THEMES
      ? themeName
      : DEFAULT_THEME) as LandingThemeName;
    return LANDING_THEMES[key];
  }, [themeName]);
}
