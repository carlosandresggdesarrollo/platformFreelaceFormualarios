import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Bar,
  Cell,
  Area,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Treemap,
  BarChart,
  PieChart,
  AreaChart,
  Pie as RePie,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme as useMuiTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.php`;

const CHART_COLORS = [
  '#1976D2', '#4CAF50', '#FF9800', '#E91E63', '#9C27B0',
  '#00BCD4', '#FF5722', '#607D8B', '#8BC34A', '#FFC107',
  '#3F51B5', '#009688', '#795548', '#CDDC39', '#F44336',
];

const WEEKDAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface AnalyticsData {
  titulo: string;
  descripcion: string;
  estado: string;
  totalRespuestas: number;
  preguntas: Array<{
    idPregunta: number;
    textoPregunta: string;
    orden: number;
    opciones: Array<{
      idOpcion: number;
      textoOpcion: string;
      esCorrecta: string;
      selecciones: string;
    }>;
  }>;
  demografiaSexo: Array<{ sexo: string; total: string }>;
  demografiaEdad: Array<{ rango: string; total: string }>;
  demografiaGeografia: Array<{ estado: string; total: string }>;
  temporalRespuestas: Array<{ fecha: string; total: string }>;
  temporalVisitas: Array<{ fecha: string; total: string }>;
  dispositivos: Array<{ dispositivo: string; total: string }>;
  navegadores: Array<{ navegador: string; total: string }>;
  sistemasOperativos: Array<{ sistemaOperativo: string; total: string }>;
  funnel: { totalVisitas: string; visitasUnicas: string; promDuracion: string; promScroll: string; totalRespuestas: number };
  tiempoCompletado: { promTiempo: string; minTiempo: string; maxTiempo: string };
  respuestasPorDia: Array<{ dia: string; total: string }>;
  respuestasPorHora: Array<{ hora: string; total: string }>;
}

function ChartCard({
  title,
  icon,
  children,
  theme,
  minHeight = 300,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  theme: ReturnType<typeof useDashboardTheme>;
  minHeight?: number;
}) {
  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 2,
        boxShadow: theme.shadow,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Iconify icon={icon} sx={{ color: theme.primary, width: 22, height: 22 }} />
        <Typography variant="subtitle1" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight }}>{children}</Box>
    </Card>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
  theme,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  theme: ReturnType<typeof useDashboardTheme>;
}) {
  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 2,
        boxShadow: theme.shadow,
        textAlign: 'center',
      }}
    >
      <Iconify icon={icon} sx={{ color, width: 36, height: 36, mb: 1 }} />
      <Typography variant="h4" sx={{ color: theme.textPrimary, fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: theme.textSecondary }}>
        {label}
      </Typography>
    </Card>
  );
}

function formatSeconds(s: number): string {
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 1,
        p: 1.5,
        boxShadow: theme.shadow,
      }}
    >
      <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((p: any, i: number) => (
        <Typography key={i} variant="body2" sx={{ color: p.color || theme.textPrimary, fontWeight: 600 }}>
          {p.name}: {p.value}
        </Typography>
      ))}
    </Box>
  );
};

export function FormularioAnalyticsView() {
  const { id } = useParams();
  const router = useRouter();
  const theme = useDashboardTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await apiFetch<any>(`${API}?vista=analitica&id=${id}`, { headers });
      if (res.success) setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h6" sx={{ color: theme.textSecondary }}>
          No se encontraron datos para este formulario
        </Typography>
      </Box>
    );
  }

  const totalVisitas = parseInt(data.funnel?.totalVisitas || '0', 10);
  const visitasUnicas = parseInt(data.funnel?.visitasUnicas || '0', 10);
  const totalResp = data.totalRespuestas || 0;
  const promDuracion = parseFloat(data.funnel?.promDuracion || '0');
  const promTiempo = parseFloat(data.tiempoCompletado?.promTiempo || '0');
  const conversionRate = totalVisitas > 0 ? ((totalResp / totalVisitas) * 100).toFixed(1) : '0';

  // Chart 1: Per-question pie data
  const currentQuestion = data.preguntas[selectedQuestion];
  const questionPieData = currentQuestion?.opciones.map((o, i) => ({
    name: o.textoOpcion.length > 30 ? `${o.textoOpcion.substring(0, 27)}...` : o.textoOpcion,
    fullName: o.textoOpcion,
    value: parseInt(o.selecciones, 10),
    color: CHART_COLORS[i % CHART_COLORS.length],
  })) || [];

  // Chart 2: All questions stacked bar
  const questionsBarData = data.preguntas.map((q) => {
    const entry: Record<string, any> = {
      name: q.textoPregunta.length > 20 ? `P${q.orden}` : q.textoPregunta,
      fullName: q.textoPregunta,
    };
    q.opciones.forEach((o) => {
      entry[o.textoOpcion] = parseInt(o.selecciones, 10);
    });
    return entry;
  });
  const allOptionNames = data.preguntas.length > 0
    ? data.preguntas[0].opciones.map((o) => o.textoOpcion)
    : [];

  // Chart 3: Sexo donut
  const sexoData = data.demografiaSexo.map((d, i) => ({
    name: d.sexo,
    value: parseInt(d.total, 10),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Chart 4: Edad bars
  const edadData = data.demografiaEdad.map((d) => ({
    name: d.rango,
    total: parseInt(d.total, 10),
  }));

  // Chart 5: Geography treemap
  const geoData = data.demografiaGeografia.map((d, i) => ({
    name: d.estado,
    size: parseInt(d.total, 10),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Chart 6 + 7: Temporal (merge visits and responses by date)
  const dateMap = new Map<string, { fecha: string; visitas: number; respuestas: number }>();
  data.temporalVisitas.forEach((d) => {
    const key = d.fecha;
    const existing = dateMap.get(key) || { fecha: key, visitas: 0, respuestas: 0 };
    existing.visitas = parseInt(d.total, 10);
    dateMap.set(key, existing);
  });
  data.temporalRespuestas.forEach((d) => {
    const key = d.fecha;
    const existing = dateMap.get(key) || { fecha: key, visitas: 0, respuestas: 0 };
    existing.respuestas = parseInt(d.total, 10);
    dateMap.set(key, existing);
  });
  const temporalData = Array.from(dateMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha)).map((d) => ({
    ...d,
    fecha: d.fecha.substring(5),
  }));

  // Chart 8: Devices donut
  const deviceData = data.dispositivos.map((d, i) => ({
    name: d.dispositivo,
    value: parseInt(d.total, 10),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Chart 9: Browsers bar
  const browserData = data.navegadores.map((d) => ({
    name: d.navegador,
    total: parseInt(d.total, 10),
  }));

  // Chart 10: Weekday + hour heatmap data
  const weekdayData = WEEKDAY_NAMES.map((name, i) => {
    const match = data.respuestasPorDia.find((d) => parseInt(d.dia, 10) === i + 1);
    return { name, total: match ? parseInt(match.total, 10) : 0 };
  });

  // Funnel data
  const funnelData = [
    { name: 'Visitas totales', value: totalVisitas },
    { name: 'Visitantes únicos', value: visitasUnicas },
    { name: 'Respuestas', value: totalResp },
  ];

  const axisStyle = { fill: theme.textSecondary, fontSize: 12 };
  const gridColor = theme.border;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box
          component="button"
          onClick={() => router.back()}
          sx={{
            px: 2, py: 1, bgcolor: theme.bgCardAlt, color: theme.textPrimary,
            border: `1px solid ${theme.border}`, borderRadius: 1, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 14,
            '&:hover': { borderColor: theme.primary },
          }}
        >
          <Iconify icon="solar:arrow-left-bold" width={16} />
          Volver
        </Box>
        <Box>
          <Typography variant="h5" sx={{ color: theme.textPrimary, fontWeight: 700 }}>
            <Iconify icon="solar:chart-bold" sx={{ mr: 1, verticalAlign: 'middle', color: theme.primary }} />
            Analítica: {data.titulo}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textSecondary }}>
            Visualización completa de los datos del formulario
          </Typography>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatBox label="Respuestas" value={totalResp} icon="solar:document-bold" color={theme.primary} theme={theme} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatBox label="Visitas" value={totalVisitas} icon="solar:eye-bold" color={theme.info} theme={theme} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatBox label="Conversión" value={`${conversionRate}%`} icon="solar:graph-up-bold" color={theme.success} theme={theme} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatBox label="Tiempo prom." value={formatSeconds(promTiempo)} icon="solar:clock-circle-bold" color={theme.warning} theme={theme} />
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* 1. Per-question pie */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Distribución por pregunta" icon="solar:pie-chart-2-bold" theme={theme}>
            {data.preguntas.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {data.preguntas.map((q, i) => (
                  <Box
                    key={q.idPregunta}
                    component="button"
                    onClick={() => setSelectedQuestion(i)}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      border: `1px solid ${i === selectedQuestion ? theme.primary : theme.border}`,
                      bgcolor: i === selectedQuestion ? theme.primaryLight : 'transparent',
                      color: i === selectedQuestion ? theme.primary : theme.textSecondary,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: i === selectedQuestion ? 600 : 400,
                      '&:hover': { borderColor: theme.primary },
                    }}
                  >
                    P{q.orden}
                  </Box>
                ))}
              </Box>
            )}
            <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 1 }}>
              {currentQuestion?.textoPregunta}
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <RePie
                  data={questionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 80 : 100}
                  paddingAngle={2}
                  dataKey="value"
                  label={isMobile ? false : ({ name, percent }: any) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {questionPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </RePie>
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 2. All questions stacked bar */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Comparativa entre preguntas" icon="solar:chart-bold" theme={theme}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionsBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis type="number" tick={axisStyle} />
                <YAxis type="category" dataKey="name" tick={axisStyle} width={isMobile ? 30 : 50} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Legend />
                {allOptionNames.map((name, i) => (
                  <Bar key={name} dataKey={name} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 3. Sexo donut */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard title="Distribución por sexo" icon="solar:users-group-rounded-bold" theme={theme} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <RePie
                  data={sexoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sexoData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </RePie>
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 4. Edad bars */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard title="Distribución por edad" icon="solar:calendar-bold" theme={theme} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={edadData} margin={{ bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Bar dataKey="total" name="Personas" fill="#9C27B0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 5. Geography treemap */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard title="Distribución geográfica" icon="solar:map-bold" theme={theme} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <Treemap
                data={geoData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke={theme.bgCard}
                content={({ x, y, width: w, height: h, name, color: c }: any) => (
                  <g>
                    <rect x={x} y={y} width={w} height={h} fill={c || '#8884d8'} rx={4} />
                    {w > 40 && h > 20 && (
                      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={12}>
                        {name}
                      </text>
                    )}
                  </g>
                )}
              />
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 6. Temporal: visits vs responses line */}
        <Grid size={{ xs: 12 }}>
          <ChartCard title="Visitas y respuestas en el tiempo" icon="solar:graph-up-bold" theme={theme}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={temporalData} margin={{ right: 20 }}>
                <defs>
                  <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976D2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1976D2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="fecha" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Legend />
                <Area type="monotone" dataKey="visitas" name="Visitas" stroke="#1976D2" fillOpacity={1} fill="url(#colorVisitas)" />
                <Area type="monotone" dataKey="respuestas" name="Respuestas" stroke="#4CAF50" fillOpacity={1} fill="url(#colorResp)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 7. Funnel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ChartCard title="Embudo de conversión" icon="solar:filter-bold" theme={theme} minHeight={250}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              {funnelData.map((item, i) => {
                const maxVal = funnelData[0].value || 1;
                const pct = ((item.value / maxVal) * 100).toFixed(1);
                const widthPct = Math.max(20, (item.value / maxVal) * 100);
                return (
                  <Box key={i} sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Box
                      sx={{
                        mx: 'auto',
                        height: 48,
                        width: `${widthPct}%`,
                        bgcolor: CHART_COLORS[i],
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'width 0.6s ease',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>
                        {item.value} ({pct}%)
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </ChartCard>
        </Grid>

        {/* 8. Devices donut */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard title="Dispositivos" icon="solar:devices-bold" theme={theme} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <RePie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deviceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </RePie>
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 9. Browsers bar */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ChartCard title="Navegadores" icon="solar:global-bold" theme={theme} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={browserData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Bar dataKey="total" name="Visitas" fill="#00BCD4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* 10. Responses by weekday */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Respuestas por día de la semana" icon="solar:calendar-bold" theme={theme} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip theme={theme} />} />
                <Bar dataKey="total" name="Respuestas" fill="#FF9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Bonus: KPI detail cards */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Resumen de métricas" icon="solar:info-circle-bold" theme={theme} minHeight={250}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.bgCardAlt, borderRadius: 1 }}>
                  <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 700 }}>
                    {visitasUnicas}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                    Visitantes únicos
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.bgCardAlt, borderRadius: 1 }}>
                  <Typography variant="h5" sx={{ color: theme.info, fontWeight: 700 }}>
                    {formatSeconds(promDuracion)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                    Duración promedio visita
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.bgCardAlt, borderRadius: 1 }}>
                  <Typography variant="h5" sx={{ color: theme.success, fontWeight: 700 }}>
                    {data.preguntas.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                    Preguntas
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.bgCardAlt, borderRadius: 1 }}>
                  <Typography variant="h5" sx={{ color: theme.warning, fontWeight: 700 }}>
                    {formatSeconds(parseFloat(data.tiempoCompletado?.minTiempo || '0'))} — {formatSeconds(parseFloat(data.tiempoCompletado?.maxTiempo || '0'))}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                    Rango tiempo completado
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </ChartCard>
        </Grid>
      </Grid>
    </>
  );
}
