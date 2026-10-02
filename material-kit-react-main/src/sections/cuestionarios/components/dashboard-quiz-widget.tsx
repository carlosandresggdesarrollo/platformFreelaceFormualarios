import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const API_STATS = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.cuestionarios.stats.php`;

interface TopQuiz {
  idCuestionario: number;
  titulo: string;
  estado: string;
  totalPreguntas: number;
  totalParticipaciones: number;
}

interface DashboardStats {
  totalCuestionarios: number;
  totalPublicados: number;
  totalParticipaciones: number;
  participacionesRecientes: number;
  topCuestionarios: TopQuiz[];
  participacionesPorDia: { fecha: string; total: number }[];
}

export function DashboardQuizWidget() {
  const theme = useDashboardTheme();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = { Authorization: `Bearer ${getAccessToken()}` };
    apiFetch<any>(API_STATS, { headers: auth })
      .then((d) => {
        if (d.success) setStats(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card sx={{ p: 3, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
        <LinearProgress sx={{ borderRadius: 1 }} />
      </Card>
    );
  }

  if (!stats) return null;

  const maxParticipaciones = Math.max(...stats.topCuestionarios.map((q) => Number(q.totalParticipaciones)), 1);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:clipboard-list-outline" width={24} sx={{ color: theme.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
            Cuestionarios
          </Typography>
        </Box>
        <Button
          size="small" onClick={() => router.push('/cuestionarios')}
          endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
          sx={{ color: theme.primary, textTransform: 'none' }}
        >
          Ver todos
        </Button>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: stats.totalCuestionarios, icon: 'mdi:clipboard-text-outline', color: theme.primary },
          { label: 'Publicados', value: stats.totalPublicados, icon: 'mdi:check-circle-outline', color: theme.success },
          { label: 'Participaciones', value: stats.totalParticipaciones, icon: 'mdi:account-group-outline', color: theme.info },
          { label: 'Ultimos 7 dias', value: stats.participacionesRecientes, icon: 'mdi:trending-up', color: theme.accent },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{
              p: 2, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadowLight,
              textAlign: 'center', transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadow },
            }}>
              <Iconify icon={s.icon} width={28} sx={{ color: s.color, mb: 0.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textPrimary }}>
                {s.value}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.textMuted }}>
                {s.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Top quizzes */}
      {stats.topCuestionarios.length > 0 && (
        <Card sx={{ p: 3, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
            Cuestionarios mas populares
          </Typography>
          {stats.topCuestionarios.map((q, idx) => (
            <Box
              key={q.idCuestionario}
              onClick={() => router.push(`/cuestionarios/stats/${q.idCuestionario}`)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 2, p: 1.5, mb: 1,
                borderRadius: 1.5, cursor: 'pointer', transition: 'background 0.2s',
                '&:hover': { bgcolor: theme.bgTableRowHover },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, color: theme.primary, minWidth: 28, textAlign: 'center' }}>
                {idx + 1}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.titulo}
                  </Typography>
                  <Chip
                    label={q.estado} size="small"
                    sx={{
                      fontSize: '0.65rem', height: 20,
                      bgcolor: q.estado === 'publicado' ? 'rgba(76,175,80,0.1)' : q.estado === 'cerrado' ? 'rgba(229,57,53,0.1)' : 'rgba(158,158,158,0.1)',
                      color: q.estado === 'publicado' ? theme.success : q.estado === 'cerrado' ? theme.error : theme.textMuted,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(Number(q.totalParticipaciones) / maxParticipaciones) * 100}
                      sx={{
                        height: 6, borderRadius: 3,
                        bgcolor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: theme.primary },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.textMuted, minWidth: 60, textAlign: 'right' }}>
                    {q.totalParticipaciones} resp. &middot; {q.totalPreguntas} preg.
                  </Typography>
                </Box>
              </Box>
              <Iconify icon="mdi:chevron-right" width={20} sx={{ color: theme.textMuted }} />
            </Box>
          ))}
        </Card>
      )}

      {stats.topCuestionarios.length === 0 && (
        <Card sx={{ p: 4, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow, textAlign: 'center' }}>
          <Iconify icon="mdi:clipboard-text-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
          <Typography sx={{ color: theme.textMuted }}>
            No hay cuestionarios aun. Crea tu primero.
          </Typography>
          <Button
            variant="contained" onClick={() => router.push('/cuestionarios/crear')}
            startIcon={<Iconify icon="mdi:plus" width={18} />}
            sx={{ mt: 2, bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover } }}
          >
            Crear Cuestionario
          </Button>
        </Card>
      )}
    </Box>
  );
}
