import { useState, useEffect } from 'react';

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
import { getAccessToken, getUsuario } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

const API = `${CONFIG.apiBase}/Modules/ModuleClienteDashboard/api/administrador.controller.cliente.php`;

interface Cuestionario {
  idSesion: number;
  idCuestionario: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  totalPreguntas: number;
  correctas: number;
}

export function ClienteDashboardView() {
  const theme = useDashboardTheme();
  const router = useRouter();
  const usuario = getUsuario();

  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const d = await apiFetch<any>(`${API}?vista=cuestionarios`, { headers });
        if (d.success) setCuestionarios(d.cuestionarios || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  const totalResueltos = cuestionarios.length;
  const totalCorrectas = cuestionarios.reduce((s, c) => s + Number(c.correctas), 0);
  const totalPreguntas = cuestionarios.reduce((s, c) => s + Number(c.totalPreguntas), 0);
  const promedio = totalPreguntas > 0 ? Math.round((totalCorrectas / totalPreguntas) * 100) : 0;

  return (
    <Box>
      <ModuloHeader titulo={`Hola, ${usuario?.nombre || 'Cliente'}`} subtitulo="Tu panel personal" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 3, mb: 3 }}>
        {[
          { label: 'Cuestionarios', value: totalResueltos, icon: 'mdi:clipboard-check-outline', color: theme.primary },
          { label: 'Respuestas correctas', value: totalCorrectas, icon: 'mdi:check-circle-outline', color: '#4CAF50' },
          { label: 'Promedio general', value: `${promedio}%`, icon: 'mdi:percent-outline', color: '#FF9800' },
        ].map((stat) => (
          <Card key={stat.label} sx={{
            p: 2.5, borderRadius: 2, textAlign: 'center',
            background: theme.bgCard, boxShadow: theme.shadow,
          }}>
            <Iconify icon={stat.icon} width={32} sx={{ color: stat.color, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>{stat.label}</Typography>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<Iconify icon="mdi:clipboard-list-outline" />}
          onClick={() => router.push('/quiz')}
          sx={{ bgcolor: theme.primary, fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: theme.primaryHover } }}>
          Resolver cuestionarios
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow, mb: 3 }}>
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.border}` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
            Mis cuestionarios resueltos
          </Typography>
        </Box>

        {cuestionarios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Iconify icon="mdi:clipboard-text-off-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
            <Typography sx={{ color: theme.textSecondary }}>Aun no has resuelto ningun cuestionario</Typography>
            <Button variant="outlined" sx={{ mt: 2, borderColor: theme.primary, color: theme.primary }}
              onClick={() => router.push('/quiz')}>
              Explorar cuestionarios
            </Button>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Cuestionario</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Resultado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Progreso</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cuestionarios.map((c) => {
                  const pct = Number(c.totalPreguntas) > 0 ? Math.round((Number(c.correctas) / Number(c.totalPreguntas)) * 100) : 0;
                  return (
                    <TableRow key={c.idSesion} hover sx={{ '&:hover': { bgcolor: theme.bgTableRowHover } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>{c.titulo}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: theme.textSecondary, whiteSpace: 'nowrap' }}>
                        {new Date(c.fechaInicio).toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${c.correctas} / ${c.totalPreguntas}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: pct >= 70 ? 'rgba(76,175,80,0.15)' : pct >= 40 ? 'rgba(255,152,0,0.15)' : 'rgba(244,67,54,0.15)',
                            color: pct >= 70 ? '#4CAF50' : pct >= 40 ? '#FF9800' : '#F44336',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={pct}
                            sx={{
                              flex: 1, height: 8, borderRadius: 4,
                              bgcolor: theme.border,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: pct >= 70 ? '#4CAF50' : pct >= 40 ? '#FF9800' : '#F44336',
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ color: theme.textSecondary, fontWeight: 600 }}>{pct}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined"
                          onClick={() => router.push(`/cliente/cuestionario/${c.idSesion}`)}
                          sx={{ borderColor: theme.primary, color: theme.primary, fontWeight: 600, borderRadius: 1.5 }}>
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  );
}
