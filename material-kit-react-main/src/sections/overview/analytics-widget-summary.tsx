import type { CardProps } from '@mui/material/Card';
import type { PaletteColorKey } from 'src/theme/core';
import type { ChartOptions } from 'src/components/chart';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { fNumber, fPercent, fShortenNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  total: number;
  percent: number;
  color?: PaletteColorKey;
  icon: React.ReactNode;
  chart: {
    series: number[];
    categories: string[];
    options?: ChartOptions;
  };
};

// Dark mode color mappings (GitHub-style dark theme)
const DARK_MODE_COLORS: Record<PaletteColorKey, { bg: string; text: string; accent: string }> = {
  primary: { bg: 'rgba(56, 139, 253, 0.15)', text: '#58a6ff', accent: '#79c0ff' },
  secondary: { bg: 'rgba(188, 140, 255, 0.15)', text: '#bc8cff', accent: '#d2a8ff' },
  info: { bg: 'rgba(56, 139, 253, 0.15)', text: '#58a6ff', accent: '#79c0ff' },
  success: { bg: 'rgba(63, 185, 80, 0.15)', text: '#3fb950', accent: '#56d364' },
  warning: { bg: 'rgba(210, 153, 34, 0.15)', text: '#d29922', accent: '#e3b341' },
  error: { bg: 'rgba(248, 81, 73, 0.15)', text: '#f85149', accent: '#ff7b72' },
};

export function AnalyticsWidgetSummary({
  sx,
  icon,
  title,
  total,
  chart,
  percent,
  color = 'primary',
  ...other
}: Props) {
  const theme = useTheme();
  const themeColors = useDashboardTheme();

  const darkColors = DARK_MODE_COLORS[color];
  const chartColors = themeColors.isDark ? [darkColors.accent] : [theme.palette[color].dark];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    xaxis: { categories: chart.categories },
    grid: {
      padding: {
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
      },
    },
    tooltip: {
      y: { formatter: (value: number) => fNumber(value), title: { formatter: () => '' } },
    },
    markers: {
      strokeWidth: 0,
    },
    ...chart.options,
  });

  const renderTrending = () => (
    <Box
      sx={{
        top: 16,
        gap: 0.5,
        right: 16,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        color: themeColors.isDark ? darkColors.text : `${color}.darker`,
      }}
    >
      <Iconify width={20} icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'} />
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {percent > 0 && '+'}
        {fPercent(percent)}
      </Box>
    </Box>
  );

  return (
    <Card
      sx={[
        () => ({
          p: 3,
          boxShadow: themeColors.isDark ? themeColors.shadow : 'none',
          position: 'relative',
          color: themeColors.isDark ? darkColors.text : `${color}.darker`,
          backgroundColor: themeColors.isDark ? themeColors.bgCard : 'common.white',
          backgroundImage: themeColors.isDark
            ? `linear-gradient(135deg, ${darkColors.bg}, ${darkColors.bg})`
            : `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)})`,
          border: themeColors.isDark ? `1px solid ${darkColors.bg}` : 'none',
          transition: 'all 0.3s ease',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      {renderTrending()}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2', color: themeColors.isDark ? darkColors.text : 'inherit' }}>{title}</Box>

          <Box sx={{ typography: 'h4', color: themeColors.isDark ? themeColors.textPrimary : 'inherit' }}>{fShortenNumber(total)}</Box>
        </Box>

        <Chart
          type="line"
          series={[{ data: chart.series }]}
          options={chartOptions}
          sx={{ width: 84, height: 56 }}
        />
      </Box>

      <SvgColor
        src="/assets/background/shape-square.svg"
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: themeColors.isDark ? 0.1 : 0.24,
          position: 'absolute',
          color: themeColors.isDark ? darkColors.accent : `${color}.main`,
        }}
      />
    </Card>
  );
}
