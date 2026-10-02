import { useMemo } from 'react';

import { useThemeMode } from 'src/theme/theme-provider';

// ----------------------------------------------------------------------

export interface DashboardThemeColors {
  // Backgrounds
  bgPage: string;
  bgCard: string;
  bgCardAlt: string;
  bgCardHover: string;
  bgHeader: string;
  bgTableHeader: string;
  bgTableRow: string;
  bgTableRowAlt: string;
  bgTableRowHover: string;
  bgInput: string;
  bgModal: string;
  bgOverlay: string;
  overlayBg: string;

  // Breadcrumb (sobre header de color)
  breadcrumbInactive: string;
  breadcrumbSeparator: string;

  // Today (calendar)
  todayBg: string;
  todayHoverBg: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;

  // Accent
  accent: string;
  accentHover: string;

  // Info color
  info: string;
  infoLight: string;

  // Borders
  border: string;
  borderLight: string;
  borderColor: string;
  borderColorHover: string;

  // Status
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;

  // Shadows
  shadow: string;
  shadowLight: string;

  // Help button
  helpBg: string;
  helpBorder: string;
  helpIcon: string;

  // Is dark mode
  isDark: boolean;
}

export function useDashboardTheme(): DashboardThemeColors {
  const { mode } = useThemeMode();

  const colors = useMemo(() => {
    const isDark = mode === 'dark';

    return {
      // Backgrounds
      bgPage: isDark ? '#0d1117' : '#ffffff',
      bgCard: isDark ? '#161b22' : 'white',
      bgCardAlt: isDark ? '#1e252e' : '#f8f9fa',
      bgCardHover: isDark ? '#262c36' : '#f0f4f8',
      // Panel / header con el navy del menú lateral
      bgHeader: isDark ? '#1e252e' : '#111A2E',
      bgTableHeader: isDark ? '#21262d' : '#111A2E',
      bgTableRow: isDark ? '#161b22' : 'white',
      bgTableRowAlt: isDark ? '#1e252e' : '#f5f5f5',
      bgTableRowHover: isDark ? '#262c36' : '#e3f2fd',
      bgInput: isDark ? '#1e252e' : 'white',
      bgModal: isDark ? '#161b22' : 'white',
      bgOverlay: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
      overlayBg: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',

      // Breadcrumb (texto sobre el header de color)
      breadcrumbInactive: 'rgba(255, 255, 255, 0.7)',
      breadcrumbSeparator: 'rgba(255, 255, 255, 0.5)',

      // Today (calendar)
      todayBg: isDark ? 'rgba(56, 139, 253, 0.15)' : '#e3f2fd',
      todayHoverBg: isDark ? 'rgba(56, 139, 253, 0.25)' : '#bbdefb',

      // Text
      textPrimary: isDark ? '#e0e0e0' : '#333333',
      textSecondary: isDark ? '#a0a0a0' : '#666666',
      textMuted: isDark ? '#707070' : '#999999',
      textOnPrimary: '#ffffff',

      // Primary colors
      primary: isDark ? '#64b5f6' : '#1976D2',
      primaryHover: isDark ? '#42a5f5' : '#1565C0',
      primaryLight: isDark ? 'rgba(100, 181, 246, 0.1)' : '#E3F2FD',

      // Accent (for dark mode emphasis)
      accent: '#58a6ff',
      accentHover: '#79c0ff',

      // Info color
      info: isDark ? '#58a6ff' : '#0288d1',
      infoLight: isDark ? 'rgba(56, 139, 253, 0.15)' : 'rgba(2, 136, 209, 0.1)',

      // Borders
      border: isDark ? '#30363d' : '#e0e0e0',
      borderLight: isDark ? '#21262d' : '#f0f0f0',
      borderColor: isDark ? '#30363d' : '#e0e0e0',
      borderColorHover: isDark ? '#58a6ff' : '#1976D2',

      // Status
      success: '#4caf50',
      successLight: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)',
      error: '#f44336',
      errorLight: isDark ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)',
      warning: '#ff9800',
      warningLight: isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)',

      // Shadows
      shadow: isDark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
      shadowLight: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0, 0, 0, 0.2)',

      // Help button
      helpBg: isDark ? '#161b22' : 'white',
      helpBorder: isDark ? '#58a6ff' : '#1976D2',
      helpIcon: isDark ? '#58a6ff' : '#1976D2',

      // Is dark mode
      isDark,
    };
  }, [mode]);

  return colors;
}
