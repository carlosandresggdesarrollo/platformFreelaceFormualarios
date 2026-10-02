import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

export function AnalyticsWebsiteVisits({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();
  const themeColors = useDashboardTheme();

  const chartColors = chart.colors ?? (themeColors.isDark
    ? ['#58a6ff', '#e3b341']
    : [hexAlpha(theme.palette.primary.dark, 0.8), hexAlpha(theme.palette.warning.main, 0.8)]);

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: {
      categories: chart.categories,
      labels: {
        style: {
          colors: themeColors.isDark ? '#8b949e' : undefined,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: themeColors.isDark ? '#8b949e' : undefined,
        },
      },
    },
    legend: {
      show: true,
      labels: {
        colors: themeColors.isDark ? '#e0e0e0' : undefined,
      },
    },
    tooltip: { y: { formatter: (value: number) => `${value}` } },
    grid: {
      borderColor: themeColors.isDark ? '#30363d' : '#e0e0e0',
    },
    ...chart.options,
  });

  return (
    <Card
      sx={{
        bgcolor: themeColors.bgCard,
        boxShadow: themeColors.shadow,
        transition: 'all 0.3s ease',
        ...sx,
      }}
      {...other}
    >
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          '& .MuiCardHeader-title': { color: themeColors.textPrimary },
          '& .MuiCardHeader-subheader': { color: themeColors.textSecondary },
        }}
      />

      <Chart
        type="bar"
        series={chart.series}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{
          pl: 1,
          py: 2.5,
          pr: 2.5,
          height: 364,
        }}
      />
    </Card>
  );
}
