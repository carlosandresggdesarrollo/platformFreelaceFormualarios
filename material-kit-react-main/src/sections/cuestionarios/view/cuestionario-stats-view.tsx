import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API_STATS = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.cuestionarios.stats.php`;

interface OpcionStat {
  idOpcion: number;
  textoOpcion: string;
  esCorrecta: boolean;
  count: number;
  porcentaje: number;
}

interface RespuestaTexto {
  textoRespuesta: string;
  nombreParticipante: string | null;
  fechaInicio: string;
}

interface PreguntaStat {
  idPregunta: number;
  textoPregunta: string;
  tipoPregunta: 'opcion_multiple' | 'abierta';
  totalRespuestas: number;
  opciones: OpcionStat[];
  respuestasTexto?: RespuestaTexto[];
}

interface Stats {
  cuestionario: {
    idCuestionario: number;
    titulo: string;
    descripcion: string;
    estado: string;
    fechaCreacion: string;
  };
  totalParticipantes: number;
  preguntas: PreguntaStat[];
}

export function CuestionarioStatsView() {
  const theme = useDashboardTheme();
  const { id } = useParams();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    if (!id) return;
    try {
      const d = await apiFetch<any>(`${API_STATS}?id=${id}`, { headers: auth });
      if (d.success !== false) {
        setStats(d);
      } else {
        setError(d.error || 'Error al cargar estadisticas');
      }
    } catch {
      setError('Error de conexion');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (error) {
    return (
      <Box>
        <ModuloHeader titulo="Estadisticas" />
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box>
        <ModuloHeader titulo="Estadisticas" />
        <Box sx={{ mt: 4 }}><LinearProgress /></Box>
      </Box>
    );
  }

  return (
    <Box>
      <ModuloHeader titulo="Estadisticas" subtitulo={stats.cuestionario.titulo} />

      {/* Summary cards */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
        <Card sx={{ p: 3, flex: 1, minWidth: 180, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow, textAlign: 'center' }}>
          <Iconify icon="mdi:account-group-outline" width={32} sx={{ color: theme.primary, mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary }}>{stats.totalParticipantes}</Typography>
          <Typography variant="body2" sx={{ color: theme.textMuted }}>Participantes</Typography>
        </Card>
        <Card sx={{ p: 3, flex: 1, minWidth: 180, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow, textAlign: 'center' }}>
          <Iconify icon="mdi:help-circle-outline" width={32} sx={{ color: theme.info, mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary }}>{stats.preguntas.length}</Typography>
          <Typography variant="body2" sx={{ color: theme.textMuted }}>Preguntas</Typography>
        </Card>
        <Card sx={{ p: 3, flex: 1, minWidth: 180, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow, textAlign: 'center' }}>
          <Iconify icon="mdi:calendar-outline" width={32} sx={{ color: theme.accent, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary }}>
            {new Date(stats.cuestionario.fechaCreacion).toLocaleDateString('es-MX')}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.textMuted }}>Creado</Typography>
        </Card>
      </Box>

      {stats.totalParticipantes === 0 ? (
        <Card sx={{ p: 4, mt: 3, textAlign: 'center', borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
          <Iconify icon="mdi:chart-bar" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
          <Typography sx={{ color: theme.textMuted }}>
            Aun no hay respuestas para este cuestionario.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ mt: 3 }}>
          {stats.preguntas.map((p, pIdx) => (
            <Card key={p.idPregunta} sx={{ p: 3, mb: 2, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadowLight }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%', bgcolor: theme.primaryLight,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: theme.primary,
                }}>
                  {pIdx + 1}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.textPrimary, flex: 1 }}>
                  {p.textoPregunta}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.textMuted }}>
                  {p.totalRespuestas} respuestas
                </Typography>
              </Box>

              {p.tipoPregunta === 'abierta' ? (
                <Box>
                  {(p.respuestasTexto || []).length === 0 ? (
                    <Typography variant="body2" sx={{ color: theme.textMuted, fontStyle: 'italic' }}>
                      Sin respuestas aun
                    </Typography>
                  ) : (
                    (p.respuestasTexto || []).map((rt, rtIdx) => (
                      <Box key={rtIdx} sx={{ p: 1.5, mb: 1, borderRadius: 1.5, bgcolor: theme.bgInput, border: `1px solid ${theme.border}` }}>
                        <Typography variant="body2" sx={{ color: theme.textPrimary, whiteSpace: 'pre-wrap' }}>
                          {rt.textoRespuesta}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: theme.textMuted }}>
                            {rt.nombreParticipante || 'Anonimo'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.textMuted }}>
                            &middot; {new Date(rt.fechaInicio).toLocaleDateString('es-MX')}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              ) : (
                p.opciones.map((o) => (
                  <Box key={o.idOpcion} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {o.esCorrecta && (
                        <Iconify icon="mdi:check-circle" width={18} sx={{ color: theme.success }} />
                      )}
                      <Typography variant="body2" sx={{ flex: 1, color: theme.textPrimary, fontWeight: o.esCorrecta ? 600 : 400 }}>
                        {o.textoOpcion}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textSecondary, minWidth: 50, textAlign: 'right' }}>
                        {o.porcentaje}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.textMuted, minWidth: 30, textAlign: 'right' }}>
                        ({o.count})
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate" value={o.porcentaje}
                      sx={{
                        height: 8, borderRadius: 4,
                        bgcolor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: o.esCorrecta ? theme.success : theme.primary,
                        },
                      }}
                    />
                  </Box>
                ))
              )}
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
