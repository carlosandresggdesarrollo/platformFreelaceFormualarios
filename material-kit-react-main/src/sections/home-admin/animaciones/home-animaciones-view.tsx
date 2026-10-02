import type { AnimationName } from 'src/sections/inicio/animations';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

import { ANIMATION_META, ANIMATION_NAMES, BackgroundAnimation } from 'src/sections/inicio/animations';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.config.php`;

export function HomeAnimacionesView() {
  const theme = useDashboardTheme();
  const [animActual, setAnimActual] = useState<AnimationName>('minimalista');
  const [animSeleccionada, setAnimSeleccionada] = useState<AnimationName>('minimalista');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success && d.config?.animacionFondo) {
        const a = d.config.animacionFondo as AnimationName;
        setAnimActual(a);
        setAnimSeleccionada(a);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const fd = new FormData();
      fd.append('animacionFondo', animSeleccionada);
      const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
      if (d.success) {
        setAnimActual(animSeleccionada);
        setMensaje({ tipo: 'success', texto: 'Animacion aplicada correctamente' });
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error al guardar' });
      }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: `Error de red: ${err?.message || err}` });
    } finally {
      setGuardando(false);
    }
  };

  const changed = animSeleccionada !== animActual;

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader
        titulo="Animaciones de Fondo"
        subtitulo="Selecciona una animacion decorativa para el fondo de la landing page"
      />

      <Stack spacing={2} sx={{ mt: 2 }}>
        {mensaje && (
          <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)}>
            {mensaje.texto}
          </Alert>
        )}

        <Grid container spacing={2}>
          {ANIMATION_NAMES.map((name) => {
            const meta = ANIMATION_META[name];
            const isSelected = animSeleccionada === name;
            const isCurrent = animActual === name;

            return (
              <Grid key={name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  onClick={() => setAnimSeleccionada(name)}
                  sx={{
                    p: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: theme.bgCard,
                    border: `2px solid ${isSelected ? theme.primary : theme.border}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.primary,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 20px ${theme.primary}30`,
                    },
                  }}
                >
                  {/* Mini preview area */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 120,
                      overflow: 'hidden',
                      bgcolor: `${theme.primary}08`,
                      '--landing-primary': theme.primary,
                      '--landing-accent': theme.accent || theme.primary,
                      '--landing-circle1': `${theme.primary}40`,
                      '--landing-circle2': `${theme.accent || theme.primary}30`,
                    }}
                  >
                    <Box sx={{ transform: 'scale(0.5)', transformOrigin: 'center center', width: '200%', height: '200%', position: 'absolute', top: '-50%', left: '-50%' }}>
                      <BackgroundAnimation animation={name} />
                    </Box>
                  </Box>

                  {/* Info */}
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Iconify icon={meta.icon as any} width={20} sx={{ color: isSelected ? theme.primary : theme.textSecondary }} />
                      <Typography variant="subtitle2" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                        {meta.label}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: theme.textMuted }}>
                      {meta.description}
                    </Typography>
                    {isCurrent && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ color: theme.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Iconify icon="mdi:check-circle" width={14} /> Activa
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Action bar */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 1 }}>
          {changed && (
            <Button
              variant="outlined"
              onClick={() => setAnimSeleccionada(animActual)}
              sx={{ color: theme.textPrimary, borderColor: theme.border }}
            >
              Cancelar
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            disabled={!changed || guardando}
            onClick={guardar}
            startIcon={<Iconify icon="mdi:content-save-outline" />}
            sx={{ bgcolor: theme.primary, '&:hover': { bgcolor: `${theme.primary}dd` } }}
          >
            {guardando ? 'Guardando...' : 'Aplicar Animacion'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
