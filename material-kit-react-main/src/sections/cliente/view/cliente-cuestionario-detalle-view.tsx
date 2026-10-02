import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

const API = `${CONFIG.apiBase}/Modules/ModuleClienteDashboard/api/administrador.controller.cliente.php`;

export function ClienteCuestionarioDetalleView() {
  const theme = useDashboardTheme();
  const router = useRouter();
  const { idSesion } = useParams();

  const [detalle, setDetalle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await apiFetch(`${API}?vista=detalle&idSesion=${idSesion}`, { headers });
        if (res.success) setDetalle(res.detalle);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idSesion]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  if (!detalle) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography sx={{ color: theme.textSecondary }}>No se encontro el cuestionario</Typography>
        <Button sx={{ mt: 2 }} onClick={() => router.push('/dashboard')}>Volver</Button>
      </Box>
    );
  }

  const { sesion, preguntas } = detalle;
  const correctas = preguntas.filter((p: any) => Number(p.esCorrecta) === 1).length;

  return (
    <Box>
      <ModuloHeader titulo={sesion.titulo} subtitulo={sesion.descripcion || 'Detalle de tus respuestas'} />

      <Button variant="outlined" startIcon={<Iconify icon="mdi:arrow-left" />}
        onClick={() => router.push('/dashboard')}
        sx={{ mt: 2, mb: 3, borderColor: theme.border, color: theme.textSecondary, borderRadius: 2 }}>
        Volver
      </Button>

      {/* Summary */}
      <Card sx={{ p: 3, mb: 3, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.primary }}>{correctas}</Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>Correctas</Typography>
          </Box>
          <Typography variant="h4" sx={{ color: theme.textMuted }}>/</Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.textPrimary }}>{preguntas.length}</Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>Total</Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>
              Resuelto el {new Date(sesion.fechaInicio).toLocaleString('es-MX')}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Questions */}
      {preguntas.map((p: any, i: number) => {
        const esCorrecta = Number(p.esCorrecta) === 1;
        return (
          <Card key={p.idPregunta} sx={{
            p: 3, mb: 2, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow,
            borderLeft: `4px solid ${esCorrecta ? '#4CAF50' : '#F44336'}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                bgcolor: esCorrecta ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Iconify
                  icon={esCorrecta ? 'mdi:check' : 'mdi:close'}
                  width={20}
                  sx={{ color: esCorrecta ? '#4CAF50' : '#F44336' }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 1 }}>
                  {i + 1}. {p.textoPregunta}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: esCorrecta ? '#4CAF50' : '#F44336' }}>
                    Tu respuesta: {p.respuestaSeleccionada}
                  </Typography>
                  {!esCorrecta && p.respuestaCorrecta && (
                    <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                      Correcta: {p.respuestaCorrecta}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
