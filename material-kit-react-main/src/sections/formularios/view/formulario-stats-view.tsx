import type { SesionRespuesta } from 'src/utils/report-generators';

import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme as useMuiTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';
import {
  generateIndividualPDF,
  generateIndividualExcel,
  generateQuestionStatsPDF,
  generateQuestionStatsExcel,
} from 'src/utils/report-generators';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.php`;

const POLL_INTERVAL = 8000;

interface StatsData {
  idCuestionario: number;
  titulo: string;
  descripcion: string;
  estado: string;
  compartirToken: string;
  visitaStats: { total: string; unicos: string; promDuracion: string };
  visitasRecientes: { ip: string; navegador: string; dispositivo: string; sistemaOperativo: string; duracionSegundos: string; scrollMaxPorcentaje: string; fechaVisita: string }[];
  totalRespuestas: number;
  preguntas: { idPregunta: number; textoPregunta: string; opciones: { idOpcion: number; textoOpcion: string; esCorrecta: string; selecciones: string }[] }[];
}

export function FormularioStatsView({ adminMode = false }: { adminMode?: boolean } = {}) {
  const { id } = useParams();
  const router = useRouter();
  const theme = useDashboardTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Report state
  const [statsMenuAnchor, setStatsMenuAnchor] = useState<null | HTMLElement>(null);
  const [showResponses, setShowResponses] = useState(false);
  const [sessions, setSessions] = useState<SesionRespuesta[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [visibleSessions, setVisibleSessions] = useState(20);

  const fetchStats = useCallback(async () => {
    if (!id) return;
    try {
      const token = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const vista = adminMode ? 'estadisticas_admin' : 'estadisticas';
      const d = await apiFetch<any>(`${API}?vista=${vista}&id=${id}`, { headers });
      if (d.success) setData(d.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, adminMode]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const fetchSessions = async () => {
    if (!id) return;
    setLoadingSessions(true);
    try {
      const token = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const d = await apiFetch<any>(`${API}?vista=respuestas&id=${id}`, { headers });
      if (d.success) setSessions(d.sesiones || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleShowResponses = () => {
    setShowResponses(true);
    fetchSessions();
  };

  const handleDownloadStatsPDF = () => {
    if (!data) return;
    generateQuestionStatsPDF(data.titulo, data.totalRespuestas, data.preguntas);
    setStatsMenuAnchor(null);
  };

  const handleDownloadStatsExcel = () => {
    if (!data) return;
    generateQuestionStatsExcel(data.titulo, data.totalRespuestas, data.preguntas);
    setStatsMenuAnchor(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography>No se encontraron estadisticas</Typography>
        <Button onClick={() => router.push(adminMode ? '/admin/formularios' : '/formularios')} sx={{ mt: 2 }}>Volver</Button>
      </Box>
    );
  }

  const totalVisitas = Number(data.visitaStats?.total || 0);
  const visitasUnicas = Number(data.visitaStats?.unicos || 0);
  const promDuracion = Math.round(Number(data.visitaStats?.promDuracion || 0));

  return (
    <Box>
      <ModuloHeader titulo="Estadisticas" subtitulo={data.titulo} />

      <Box sx={{ display: 'flex', gap: 1, mt: 3, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={() => router.push(adminMode ? '/admin/formularios' : '/formularios')}
          sx={{ borderColor: theme.border, color: theme.textSecondary }}>
          Volver
        </Button>
        <Chip icon={<Iconify icon="mdi:refresh" width={16} />}
          label="Tiempo real"
          size="small" sx={{ bgcolor: 'rgba(76,175,80,0.12)', color: '#4CAF50', fontWeight: 600 }} />

        <Box sx={{ flex: 1 }} />

        <Button variant="outlined" size="small"
          startIcon={<Iconify icon="mdi:download" />}
          onClick={(e) => setStatsMenuAnchor(e.currentTarget)}
          sx={{ borderColor: theme.primary, color: theme.primary }}>
          Descargar estadisticas
        </Button>
        <Menu anchorEl={statsMenuAnchor} open={Boolean(statsMenuAnchor)} onClose={() => setStatsMenuAnchor(null)}>
          <MenuItem onClick={handleDownloadStatsPDF}>
            <Iconify icon="mdi:file-pdf-box" width={20} sx={{ mr: 1, color: '#F44336' }} /> PDF
          </MenuItem>
          <MenuItem onClick={handleDownloadStatsExcel}>
            <Iconify icon="mdi:file-excel" width={20} sx={{ mr: 1, color: '#4CAF50' }} /> Excel
          </MenuItem>
        </Menu>

        {!showResponses && (
          <Button variant="contained" size="small"
            startIcon={<Iconify icon="mdi:account-multiple" />}
            onClick={handleShowResponses}
            sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}>
            Ver respuestas
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {[
          { label: 'Visitas totales', value: totalVisitas, icon: 'mdi:eye-outline', color: '#2196F3' },
          { label: 'Visitantes unicos', value: visitasUnicas, icon: 'mdi:account-multiple-outline', color: '#FF9800' },
          { label: 'Respuestas', value: data.totalRespuestas, icon: 'mdi:message-reply-text-outline', color: '#4CAF50' },
          { label: 'Duracion prom.', value: `${promDuracion}s`, icon: 'mdi:timer-outline', color: '#9C27B0' },
        ].map((s) => (
          <Card key={s.label} sx={{ p: 2, borderRadius: 2, textAlign: 'center', background: theme.bgCard, boxShadow: theme.shadow }}>
            <Iconify icon={s.icon} width={28} sx={{ color: s.color, mb: 0.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>{s.value}</Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>{s.label}</Typography>
          </Card>
        ))}
      </Box>

      {/* Per-question stats */}
      {data.preguntas.length > 0 && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow, mb: 3 }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.border}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
              Respuestas por pregunta
            </Typography>
          </Box>
          <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            {data.preguntas.map((p, i) => {
              const totalSel = p.opciones.reduce((s, o) => s + Number(o.selecciones), 0);
              return (
                <Box key={p.idPregunta} sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 1 }}>
                    {i + 1}. {p.textoPregunta}
                  </Typography>
                  {p.opciones.map((o) => {
                    const pct = totalSel > 0 ? Math.round((Number(o.selecciones) / totalSel) * 100) : 0;
                    return (
                      <Box key={o.idOpcion} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                          <Typography variant="body2" sx={{
                            color: Number(o.esCorrecta) === 1 ? '#4CAF50' : theme.textSecondary,
                            fontWeight: Number(o.esCorrecta) === 1 ? 600 : 400,
                            flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {o.textoOpcion} {Number(o.esCorrecta) === 1 && '(correcta)'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.textSecondary, ml: 1, whiteSpace: 'nowrap' }}>
                            {o.selecciones} ({pct}%)
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct}
                          sx={{
                            height: 6, borderRadius: 3, bgcolor: theme.border,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: Number(o.esCorrecta) === 1 ? '#4CAF50' : theme.primary,
                              borderRadius: 3,
                            },
                          }} />
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Card>
      )}

      {/* Individual responses section */}
      {showResponses && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow, mb: 3 }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
              Respuestas individuales ({sessions.length})
            </Typography>
            {sessions.length > 0 && (
              <Button size="small" variant="outlined" startIcon={<Iconify icon="mdi:file-excel" />}
                onClick={() => generateIndividualExcel(data.titulo, sessions)}
                sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}>
                Descargar todo (Excel)
              </Button>
            )}
          </Box>
          <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            {loadingSessions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: theme.primary }} />
              </Box>
            ) : sessions.length === 0 ? (
              <Typography variant="body2" sx={{ color: theme.textSecondary, textAlign: 'center', py: 3 }}>
                No hay respuestas aun
              </Typography>
            ) : (
              <>
                {sessions.slice(0, visibleSessions).map((s) => (
                  <Box key={s.idSesion} sx={{
                    p: 2, mb: 1.5, borderRadius: 2, border: `1px solid ${theme.border}`,
                    '&:hover': { bgcolor: theme.bgTableRowHover },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                      <Iconify icon="mdi:account-circle-outline" width={28} sx={{ color: theme.textSecondary, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, minWidth: 120 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                          {s.nombreParticipante || 'Anonimo'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                          {s.emailParticipante || 'Sin email'} — {s.fechaFin ? new Date(s.fechaFin).toLocaleString('es-MX') : ''}
                        </Typography>
                      </Box>
                      <Chip label={`${s.respuestas.length} resp.`} size="small"
                        sx={{ bgcolor: 'rgba(33,150,243,0.12)', color: '#2196F3', fontWeight: 600 }} />
                      <Button size="small" variant="outlined" startIcon={<Iconify icon="mdi:file-pdf-box" />}
                        onClick={() => generateIndividualPDF(data.titulo, s)}
                        sx={{ borderColor: '#F44336', color: '#F44336' }}>
                        PDF
                      </Button>
                    </Box>
                    {(s.sexo || s.edad || s.estado || s.municipio) && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 5 }}>
                        {s.sexo && <Chip label={s.sexo} size="small" icon={<Iconify icon="mdi:gender-male-female" width={14} />}
                          sx={{ fontSize: 11, height: 22, bgcolor: 'rgba(156,39,176,0.1)', color: '#9C27B0' }} />}
                        {s.edad && <Chip label={`${s.edad} anos`} size="small" icon={<Iconify icon="mdi:cake-variant-outline" width={14} />}
                          sx={{ fontSize: 11, height: 22, bgcolor: 'rgba(255,152,0,0.1)', color: '#FF9800' }} />}
                        {s.pais && <Chip label={s.pais} size="small" icon={<Iconify icon="mdi:earth" width={14} />}
                          sx={{ fontSize: 11, height: 22, bgcolor: 'rgba(76,175,80,0.1)', color: '#4CAF50' }} />}
                        {s.estado && <Chip label={s.estado} size="small" icon={<Iconify icon="mdi:map-marker-outline" width={14} />}
                          sx={{ fontSize: 11, height: 22, bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3' }} />}
                        {s.municipio && <Chip label={s.municipio} size="small" icon={<Iconify icon="mdi:city-variant-outline" width={14} />}
                          sx={{ fontSize: 11, height: 22, bgcolor: 'rgba(0,150,136,0.1)', color: '#009688' }} />}
                      </Box>
                    )}
                  </Box>
                ))}
                {sessions.length > visibleSessions && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button size="small" onClick={() => setVisibleSessions((v) => v + 20)}
                      sx={{ color: theme.primary }}>
                      Mostrar mas ({sessions.length - visibleSessions} restantes)
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Card>
      )}

      {/* Recent visitors */}
      {data.visitasRecientes.length > 0 && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.border}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
              Visitantes recientes
            </Typography>
          </Box>
          {isMobile ? (
            <Box sx={{ p: 1.5 }}>
              {data.visitasRecientes.slice(0, 20).map((v, i) => (
                <Box key={i} sx={{ p: 1.5, mb: 1, borderRadius: 1.5, border: `1px solid ${theme.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {v.navegador}
                    </Typography>
                    <Chip label={v.dispositivo} size="small"
                      sx={{ fontSize: 11, height: 20, bgcolor: 'rgba(33,150,243,0.12)', color: '#2196F3' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'block' }}>
                    {v.sistemaOperativo} — {v.duracionSegundos || 0}s — Scroll {v.scrollMaxPorcentaje || 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                    {new Date(v.fechaVisita).toLocaleString('es-MX')}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                    {['Navegador', 'Dispositivo', 'SO', 'Duracion', 'Scroll', 'Fecha'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: theme.textPrimary, fontSize: 13 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.visitasRecientes.slice(0, 20).map((v, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ color: theme.textSecondary, fontSize: 13 }}>{v.navegador}</TableCell>
                      <TableCell sx={{ color: theme.textSecondary, fontSize: 13 }}>{v.dispositivo}</TableCell>
                      <TableCell sx={{ color: theme.textSecondary, fontSize: 13 }}>{v.sistemaOperativo}</TableCell>
                      <TableCell sx={{ color: theme.textSecondary, fontSize: 13 }}>{v.duracionSegundos || 0}s</TableCell>
                      <TableCell sx={{ color: theme.textSecondary, fontSize: 13 }}>{v.scrollMaxPorcentaje || 0}%</TableCell>
                      <TableCell sx={{ color: theme.textSecondary, fontSize: 13, whiteSpace: 'nowrap' }}>
                        {new Date(v.fechaVisita).toLocaleString('es-MX')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
