import type { LoaderName } from 'src/sections/inicio/loaders/loader-meta';

import { Suspense, useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { LOADER_NAMES } from 'src/sections/inicio/loaders/loader-meta';

const CACHE_KEY = 'formularios_loader';
const THEME_CACHE_KEY = 'formularios_tema';
const DURATION_CACHE_KEY = 'formularios_loader_dur';
const COLOR_CACHE_KEY = 'formularios_loader_color';

function getLoaderFromCache(): LoaderName {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached && LOADER_NAMES.includes(cached as LoaderName)) {
      return cached as LoaderName;
    }
  } catch { /* ignore */ }
  return 'pulso-logo';
}

function getDurationFromCache(): number {
  try {
    const cached = localStorage.getItem(DURATION_CACHE_KEY);
    if (cached) {
      const n = parseInt(cached, 10);
      if (n >= 1 && n <= 10) return n;
    }
  } catch { /* ignore */ }
  return 2;
}

function getColorFromCache(): string | undefined {
  try {
    return localStorage.getItem(COLOR_CACHE_KEY) || undefined;
  } catch { /* ignore */ }
  return undefined;
}

const THEME_VARS: Record<string, Record<string, string>> = {
  corporativo: { '--landing-bg': '#FAFBFC', '--landing-primary': '#1B5E20', '--landing-accent': '#E65100', '--landing-text': '#333', '--landing-circle1': 'rgba(27,94,32,0.08)', '--landing-circle2': 'rgba(230,81,0,0.06)' },
  oscuro:      { '--landing-bg': '#0F172A', '--landing-primary': '#60A5FA', '--landing-accent': '#a78bfa', '--landing-text': '#E6EDF3', '--landing-circle1': 'rgba(96,165,250,0.1)', '--landing-circle2': 'rgba(167,139,250,0.08)' },
  naturaleza:  { '--landing-bg': '#F1F8E9', '--landing-primary': '#2E7D32', '--landing-accent': '#F57C00', '--landing-text': '#333', '--landing-circle1': 'rgba(46,125,50,0.08)', '--landing-circle2': 'rgba(245,124,0,0.06)' },
  startup:     { '--landing-bg': '#FFF8E1', '--landing-primary': '#F57C00', '--landing-accent': '#7B1FA2', '--landing-text': '#333', '--landing-circle1': 'rgba(245,124,0,0.08)', '--landing-circle2': 'rgba(123,31,162,0.06)' },
  tech:        { '--landing-bg': '#E8EAF6', '--landing-primary': '#283593', '--landing-accent': '#00BFA5', '--landing-text': '#333', '--landing-circle1': 'rgba(40,53,147,0.08)', '--landing-circle2': 'rgba(0,191,165,0.06)' },
};

function getThemeVars(): Record<string, string> {
  try {
    const tema = localStorage.getItem(THEME_CACHE_KEY) || 'corporativo';
    return THEME_VARS[tema] || THEME_VARS.corporativo;
  } catch {
    return THEME_VARS.corporativo;
  }
}

export function LoadingFallback() {
  const [LoadingScreen, setLoadingScreen] = useState<React.ComponentType<{ loader: LoaderName; color?: string }> | null>(null);
  const loaderName = getLoaderFromCache();
  const loaderColor = getColorFromCache();
  const themeVars = getThemeVars();

  useEffect(() => {
    import('src/sections/inicio/loaders/loading-screen').then((mod) => {
      setLoadingScreen(() => mod.LoadingScreen);
    });
  }, []);

  if (!LoadingScreen) {
    return (
      <Box sx={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: themeVars['--landing-bg'] || '#FAFBFC',
      }} />
    );
  }

  const styleVars = { ...themeVars } as Record<string, string>;
  if (loaderColor) {
    styleVars['--landing-primary'] = loaderColor;
    styleVars['--landing-accent'] = loaderColor;
  }

  return (
    <Box style={styleVars as React.CSSProperties}>
      <LoadingScreen loader={loaderName} color={loaderColor} />
    </Box>
  );
}

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible');
  const duration = getDurationFromCache();

  useEffect(() => {
    const timer = setTimeout(() => setPhase('fading'), duration * 1000);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (phase === 'fading') {
      const timer = setTimeout(() => setPhase('gone'), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [phase]);

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
      {phase !== 'gone' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            transition: 'opacity 0.6s ease',
            opacity: phase === 'fading' ? 0 : 1,
            pointerEvents: phase === 'fading' ? 'none' : 'auto',
          }}
        >
          <LoadingFallback />
        </Box>
      )}
    </>
  );
}

export function cacheLoaderPreference(loader: string, tema?: string, duracion?: number, color?: string) {
  try {
    localStorage.setItem(CACHE_KEY, loader);
    if (tema) localStorage.setItem(THEME_CACHE_KEY, tema);
    if (duracion !== undefined) localStorage.setItem(DURATION_CACHE_KEY, String(duracion));
    if (color !== undefined) localStorage.setItem(COLOR_CACHE_KEY, color);
  } catch { /* ignore */ }
}
