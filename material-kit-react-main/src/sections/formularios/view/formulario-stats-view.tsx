import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

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

  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

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

      <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3 }}>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={() => router.push(adminMode ? '/admin/formularios' : '/formularios')}
          sx={{ borderColor: theme.border, color: theme.textSecondary }}>
          Volver
        </Button>
        <Chip icon={<Iconify icon="mdi:refresh" width={16} />}
          label="Actualizacion en tiempo real"
          size="small" sx={{ bgcolor: 'rgba(76,175,80,0.12)', color: '#4CAF50', fontWeight: 600 }} />
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
          <Box sx={{ p: 2.5 }}>
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
                          }}>
                            {o.textoOpcion} {Number(o.esCorrecta) === 1 && '(correcta)'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.textSecondary }}>
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

      {/* Recent visitors */}
      {data.visitasRecientes.length > 0 && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.border}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
              Visitantes recientes
            </Typography>
          </Box>
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
        </Card>
      )}
    </Box>
  );
}
