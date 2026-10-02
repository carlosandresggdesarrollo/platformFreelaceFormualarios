import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleAnalytics/api/administrador.controller.analytics.php`;

interface Resumen {
  total: number;
  unicos: number;
  promDuracion: number;
  promScroll: number;
}

interface DiaData { fecha: string; visitas: number; unicos: number }
interface PaginaData { pagina: string; visitas: number; unicos: number }
interface ChartItem { label: string; total: number }
interface SeccionData { seccion: string; vistas: number }
interface ClickData { enlace: string; clicks: number }
interface HoraData { hora: number; visitas: number }

interface Visita {
  idVisita: number;
  pagina: string;
  ip: string;
  navegador: string;
  dispositivo: string;
  sistemaOperativo: string;
  duracionSegundos: number;
  scrollMaxPorcentaje: number;
  fechaVisita: string;
}

type Periodo = '7' | '15' | '30' | '90';

// ============================================================
//  STAT CARD
// ============================================================
function StatCard({ icon, label, value, color, t }: {
  icon: string; label: string; value: string | number; color: string;
  t: ReturnType<typeof useDashboardTheme>;
}) {
  return (
    <Card sx={{
      p: 3, flex: '1 1 200px', minWidth: 200,
      bgcolor: t.bgCard, border: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center', gap: 2,
    }}>
      <Box sx={{
        width: 52, height: 52, borderRadius: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: color, flexShrink: 0,
      }}>
        <Iconify icon={icon} width={26} sx={{ color: '#fff' }} />
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: t.textPrimary, lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: t.textSecondary }}>{label}</Typography>
      </Box>
    </Card>
  );
}

// ============================================================
//  BAR (CSS)
// ============================================================
function Bar({ label, value, max, color, t }: {
  label: string; value: number; max: number; color: string;
  t: ReturnType<typeof useDashboardTheme>;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ color: t.textPrimary, fontWeight: 500 }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: t.textSecondary }}>{value}</Typography>
      </Box>
      <Box sx={{ height: 8, borderRadius: 1, bgcolor: t.bgCardAlt, overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 1, transition: 'width 0.5s ease' }} />
      </Box>
    </Box>
  );
}

// ============================================================
//  MINI PIE (CSS circles)
// ============================================================
function PieList({ items, colors, t }: {
  items: ChartItem[]; colors: string[];
  t: ReturnType<typeof useDashboardTheme>;
}) {
  const total = items.reduce((s, i) => s + Number(i.total), 0);
  return (
    <Box>
      {items.map((it, idx) => {
        const pct = total > 0 ? ((Number(it.total) / total) * 100).toFixed(1) : '0';
        return (
          <Box key={it.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.2 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colors[idx % colors.length], flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flex: 1, color: t.textPrimary }}>{it.label}</Typography>
            <Chip label={`${pct}%`} size="small" sx={{ fontWeight: 600, bgcolor: t.bgCardAlt, color: t.textPrimary }} />
            <Typography variant="body2" sx={{ color: t.textSecondary, minWidth: 30, textAlign: 'right' }}>{it.total}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ============================================================
//  TIME CHART (CSS bars for hours)
// ============================================================
function HoursChart({ data, t }: { data: HoraData[]; t: ReturnType<typeof useDashboardTheme> }) {
  const map = new Map(data.map(d => [Number(d.hora), Number(d.visitas)]));
  const max = Math.max(1, ...data.map(d => Number(d.visitas)));
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.3, height: 120 }}>
      {Array.from({ length: 24 }, (_, h) => {
        const v = map.get(h) || 0;
        const pct = (v / max) * 100;
        return (
          <Box key={h} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{
              width: '100%', minHeight: 2,
              height: `${pct}%`,
              bgcolor: t.primary,
              borderRadius: '2px 2px 0 0',
              transition: 'height 0.4s ease',
              '&:hover': { bgcolor: t.primaryHover },
            }}
              title={`${h}:00 — ${v} visitas`}
            />
            {h % 4 === 0 && (
              <Typography variant="caption" sx={{ color: t.textMuted, fontSize: 9, mt: 0.3 }}>
                {h}h
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ============================================================
//  VISITS SPARKLINE (CSS bars per day)
// ============================================================
function DailyChart({ data, t }: { data: DiaData[]; t: ReturnType<typeof useDashboardTheme> }) {
  if (!data.length) return <Typography variant="body2" sx={{ color: t.textMuted }}>Sin datos</Typography>;
  const max = Math.max(1, ...data.map(d => Number(d.visitas)));
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 140 }}>
      {data.map((d) => {
        const pct = (Number(d.visitas) / max) * 100;
        return (
          <Box key={d.fecha} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                width: '100%', minHeight: 3,
                height: `${pct}%`,
                bgcolor: t.primary,
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.4s ease',
                '&:hover': { bgcolor: t.primaryHover },
              }}
              title={`${d.fecha}: ${d.visitas} visitas (${d.unicos} unicos)`}
            />
            {data.length <= 15 && (
              <Typography variant="caption" sx={{ color: t.textMuted, fontSize: 9, mt: 0.3, writingMode: 'vertical-rl', transform: 'rotate(180deg)', maxHeight: 50 }}>
                {d.fecha.slice(5)}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ============================================================
//  MAIN VIEW
// ============================================================
export function AnalyticsView() {
  const t = useDashboardTheme();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('30');

  const [resumen, setResumen] = useState<Resumen>({ total: 0, unicos: 0, promDuracion: 0, promScroll: 0 });
  const [porDia, setPorDia] = useState<DiaData[]>([]);
  const [porPagina, setPorPagina] = useState<PaginaData[]>([]);
  const [navegadores, setNavegadores] = useState<ChartItem[]>([]);
  const [dispositivos, setDispositivos] = useState<ChartItem[]>([]);
  const [sistemas, setSistemas] = useState<ChartItem[]>([]);
  const [secciones, setSecciones] = useState<SeccionData[]>([]);
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [porHora, setPorHora] = useState<HoraData[]>([]);

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [visitasTotal, setVisitasTotal] = useState(0);
  const [visitasPage, setVisitasPage] = useState(0);
  const [visitasPerPage, setVisitasPerPage] = useState(10);
  const [loadingVisitas, setLoadingVisitas] = useState(false);

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      const hasta = new Date().toISOString().slice(0, 10);
      const desdeDate = new Date();
      desdeDate.setDate(desdeDate.getDate() - Number(periodo));
      const desde = desdeDate.toISOString().slice(0, 10);

      const d: any = await apiFetch(`${API}?vista=resumen&desde=${desde}&hasta=${hasta}`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (d.success && d.data) {
        const r = d.data;
        setResumen({
          total: Number(r.resumen?.total || 0),
          unicos: Number(r.resumen?.unicos || 0),
          promDuracion: Number(r.resumen?.promDuracion || 0),
          promScroll: Number(r.resumen?.promScroll || 0),
        });
        setPorDia(r.porDia || []);
        setPorPagina(r.porPagina || []);
        setNavegadores((r.navegadores || []).map((n: any) => ({ label: n.navegador, total: Number(n.total) })));
        setDispositivos((r.dispositivos || []).map((n: any) => ({ label: n.dispositivo, total: Number(n.total) })));
        setSistemas((r.sistemas || []).map((n: any) => ({ label: n.sistemaOperativo, total: Number(n.total) })));
        setSecciones(r.secciones || []);
        setClicks(r.clicks || []);
        setPorHora(r.porHora || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [periodo]);

  const fetchVisitas = useCallback(async () => {
    setLoadingVisitas(true);
    try {
      const d: any = await apiFetch(`${API}?vista=recientes&limit=${visitasPerPage}&offset=${visitasPage * visitasPerPage}`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      if (d.success && d.data) {
        setVisitas(d.data.visitas || []);
        setVisitasTotal(d.data.total || 0);
      }
    } catch { /* ignore */ }
    setLoadingVisitas(false);
  }, [visitasPage, visitasPerPage]);

  useEffect(() => { fetchResumen(); }, [fetchResumen]);
  useEffect(() => { fetchVisitas(); }, [fetchVisitas]);

  const COLORS = ['#1976d2', '#43a047', '#e65100', '#8e24aa', '#00838f', '#c62828', '#f9a825', '#5c6bc0'];

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${Math.round(sec)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  const deviceIcon = (dev: string) => {
    if (dev === 'Movil') return 'mdi:cellphone';
    if (dev === 'Tablet') return 'mdi:tablet';
    return 'mdi:monitor';
  };

  return (
    <Container maxWidth="xl" sx={{ pb: 5 }}>
      <ModuloHeader titulo="Analiticas" subtitulo="Estadisticas de visitantes y comportamiento" />

      {/* Period selector */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel sx={{ color: t.textSecondary }}>Periodo</InputLabel>
          <Select
            value={periodo}
            label="Periodo"
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
            sx={{ bgcolor: t.bgCard, color: t.textPrimary }}
          >
            <MenuItem value="7">Ultimos 7 dias</MenuItem>
            <MenuItem value="15">Ultimos 15 dias</MenuItem>
            <MenuItem value="30">Ultimos 30 dias</MenuItem>
            <MenuItem value="90">Ultimos 90 dias</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <StatCard icon="mdi:eye-outline" label="Visitas totales" value={resumen.total} color="#1976d2" t={t} />
            <StatCard icon="mdi:account-group-outline" label="Visitantes unicos" value={resumen.unicos} color="#43a047" t={t} />
            <StatCard icon="mdi:clock-outline" label="Duracion promedio" value={formatDuration(resumen.promDuracion)} color="#e65100" t={t} />
            <StatCard icon="mdi:arrow-collapse-down" label="Scroll promedio" value={`${Math.round(resumen.promScroll)}%`} color="#8e24aa" t={t} />
          </Box>

          {/* Daily chart */}
          <Card sx={{ p: 3, mb: 3, bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
            <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
              <Iconify icon="mdi:chart-bar" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
              Visitas por dia
            </Typography>
            <DailyChart data={porDia} t={t} />
          </Card>

          {/* Row: Pages + Hours */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Card sx={{ p: 3, flex: '1 1 400px', bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
                <Iconify icon="mdi:file-document-outline" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Paginas mas visitadas
              </Typography>
              {porPagina.length === 0 ? (
                <Typography variant="body2" sx={{ color: t.textMuted }}>Sin datos</Typography>
              ) : (
                porPagina.map((p) => (
                  <Bar key={p.pagina} label={p.pagina} value={Number(p.visitas)} max={Number(porPagina[0]?.visitas || 1)} color="#1976d2" t={t} />
                ))
              )}
            </Card>

            <Card sx={{ p: 3, flex: '1 1 400px', bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
                <Iconify icon="mdi:clock-outline" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Visitas por hora del dia
              </Typography>
              <HoursChart data={porHora} t={t} />
            </Card>
          </Box>

          {/* Row: Sections + Clicks */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Card sx={{ p: 3, flex: '1 1 400px', bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
                <Iconify icon="mdi:eye-outline" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Secciones mas vistas
              </Typography>
              {secciones.length === 0 ? (
                <Typography variant="body2" sx={{ color: t.textMuted }}>Sin datos aun</Typography>
              ) : (
                secciones.map((s) => (
                  <Bar key={s.seccion} label={s.seccion} value={Number(s.vistas)} max={Number(secciones[0]?.vistas || 1)} color="#43a047" t={t} />
                ))
              )}
            </Card>

            <Card sx={{ p: 3, flex: '1 1 400px', bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
                <Iconify icon="mdi:cursor-default-click-outline" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Links mas clickeados
              </Typography>
              {clicks.length === 0 ? (
                <Typography variant="body2" sx={{ color: t.textMuted }}>Sin datos aun</Typography>
              ) : (
                clicks.map((c) => (
                  <Bar key={c.enlace} label={c.enlace.length > 60 ? `${c.enlace.slice(0, 57)}...` : c.enlace} value={Number(c.clicks)} max={Number(clicks[0]?.clicks || 1)} color="#e65100" t={t} />
                ))
              )}
            </Card>
          </Box>

          {/* Row: Browsers + Devices + OS */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Card sx={{ p: 3, flex: '1 1 260px', bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
                <Iconify icon="mdi:web" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Navegadores
              </Typography>
              <PieList items={navegadores} colors={COLORS} t={t} />
            </Card>

            <Card sx={{ p: 3, flex: '1 1 260px', bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
                <Iconify icon="mdi:devices" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Dispositivos
              </Typography>
              <PieList items={dispositivos} colors={['#1976d2', '#43a047', '#e65100']} t={t} />
            </Card>

            <Card sx={{ p: 3, flex: '1 1 260px', bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, mb: 2, fontWeight: 600 }}>
                <Iconify icon="mdi:laptop" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Sistemas operativos
              </Typography>
              <PieList items={sistemas} colors={COLORS} t={t} />
            </Card>
          </Box>

          {/* Recent visitors table */}
          <Card sx={{ bgcolor: t.bgCard, border: `1px solid ${t.border}` }}>
            <Box sx={{ px: 3, pt: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ color: t.textPrimary, fontWeight: 600 }}>
                <Iconify icon="mdi:account-clock-outline" width={20} sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
                Visitantes recientes
              </Typography>
              <IconButton onClick={fetchVisitas} size="small">
                <Iconify icon="mdi:refresh" width={20} sx={{ color: t.textSecondary }} />
              </IconButton>
            </Box>

            {loadingVisitas && <LinearProgress />}

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {['Fecha', 'Pagina', 'IP', 'Navegador', 'Dispositivo', 'SO', 'Duracion', 'Scroll'].map((h) => (
                      <TableCell key={h} sx={{ bgcolor: t.bgTableHeader, color: '#fff', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visitas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ color: t.textMuted, textAlign: 'center', py: 4 }}>
                        No hay visitas registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    visitas.map((v, idx) => (
                      <TableRow key={v.idVisita} sx={{ bgcolor: idx % 2 === 0 ? t.bgTableRow : t.bgTableRowAlt, '&:hover': { bgcolor: t.bgTableRowHover } }}>
                        <TableCell sx={{ color: t.textPrimary, fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(v.fechaVisita)}</TableCell>
                        <TableCell sx={{ color: t.textPrimary, fontSize: 12 }}>
                          <Chip label={v.pagina} size="small" sx={{ fontWeight: 500, bgcolor: t.primaryLight, color: t.primary }} />
                        </TableCell>
                        <TableCell sx={{ color: t.textSecondary, fontSize: 12, fontFamily: 'monospace' }}>{v.ip}</TableCell>
                        <TableCell sx={{ color: t.textPrimary, fontSize: 12 }}>{v.navegador}</TableCell>
                        <TableCell sx={{ color: t.textPrimary, fontSize: 12 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Iconify icon={deviceIcon(v.dispositivo)} width={16} sx={{ color: t.textSecondary }} />
                            {v.dispositivo}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: t.textPrimary, fontSize: 12 }}>{v.sistemaOperativo}</TableCell>
                        <TableCell sx={{ color: t.textPrimary, fontSize: 12, whiteSpace: 'nowrap' }}>{formatDuration(Number(v.duracionSegundos))}</TableCell>
                        <TableCell sx={{ color: t.textPrimary, fontSize: 12 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Number(v.scrollMaxPorcentaje)}
                              sx={{ flex: 1, height: 6, borderRadius: 1, bgcolor: t.bgCardAlt, '& .MuiLinearProgress-bar': { bgcolor: t.primary } }}
                            />
                            <Typography variant="caption" sx={{ color: t.textSecondary }}>{v.scrollMaxPorcentaje}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={visitasTotal}
              page={visitasPage}
              onPageChange={(_, p) => setVisitasPage(p)}
              rowsPerPage={visitasPerPage}
              onRowsPerPageChange={(e) => { setVisitasPerPage(parseInt(e.target.value, 10)); setVisitasPage(0); }}
              rowsPerPageOptions={[10, 25, 50]}
              labelRowsPerPage="Filas:"
              sx={{ color: t.textSecondary, borderTop: `1px solid ${t.border}` }}
            />
          </Card>
        </>
      )}
    </Container>
  );
}
