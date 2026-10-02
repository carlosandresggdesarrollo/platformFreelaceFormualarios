import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { fNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    series: {
      label: string;
      value: number;
    }[];
    options?: ChartOptions;
  };
};

export function AnalyticsCurrentVisits({ title, subheader, chart, sx, ...other }: Props) {
  const theme = useTheme();
  const themeColors = useDashboardTheme();

  const chartSeries = chart.series.map((item) => item.value);

  const chartColors = chart.colors ?? (themeColors.isDark
    ? ['#58a6ff', '#e3b341', '#56d364', '#ff7b72', '#bc8cff', '#79c0ff']
    : [
        theme.palette.primary.main,
        theme.palette.warning.light,
        theme.palette.info.dark,
        theme.palette.error.main,
      ]);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    labels: chart.series.map((item) => item.label),
    stroke: { width: 0 },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
      style: {
        colors: themeColors.isDark ? ['#0a192f'] : undefined,
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => fNumber(value),
        title: { formatter: (seriesName: string) => `${seriesName}` },
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
    legend: {
      labels: {
        colors: themeColors.isDark ? '#e0e0e0' : undefined,
      },
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
        type="pie"
        series={chartSeries}
        options={chartOptions}
        sx={{
          my: 6,
          mx: 'auto',
          width: { xs: 240, xl: 260 },
          height: { xs: 240, xl: 260 },
        }}
      />

      <Divider sx={{ borderStyle: 'dashed', borderColor: themeColors.border }} />

      <ChartLegends
        labels={chartOptions?.labels}
        colors={chartOptions?.colors}
        sx={{
          p: 3,
          justifyContent: 'center',
          '& .MuiTypography-root': { color: themeColors.textPrimary },
        }}
      />
    </Card>
  );
}
