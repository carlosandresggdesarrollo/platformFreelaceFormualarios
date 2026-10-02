import type { LandingThemeName } from 'src/sections/inicio/themes';

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

import { THEME_META, LANDING_THEMES } from 'src/sections/inicio/themes';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.config.php`;

export function HomeTemasView() {
  const theme = useDashboardTheme();
  const [temaActual, setTemaActual] = useState<LandingThemeName>('corporativo');
  const [temaSeleccionado, setTemaSeleccionado] = useState<LandingThemeName>('corporativo');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success && d.config?.tema) {
        const t = d.config.tema as LandingThemeName;
        setTemaActual(t);
        setTemaSeleccionado(t);
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
      fd.append('tema', temaSeleccionado);
      // Send current config values to avoid overwriting
      const dGet = await apiFetch<any>(API, { headers: auth });
      if (dGet.success && dGet.config) {
        fd.append('tituloPrincipal', dGet.config.tituloPrincipal || '');
        fd.append('subtitulo', dGet.config.subtitulo || '');
      }

      const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
      if (d.success) {
        setTemaActual(temaSeleccionado);
        setMensaje({ tipo: 'success', texto: `Tema "${THEME_META[temaSeleccionado].label}" aplicado correctamente` });
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error al guardar' });
      }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: `Error de red: ${err?.message || err}` });
    } finally {
      setGuardando(false);
    }
  };

  const themeNames = Object.keys(THEME_META) as LandingThemeName[];
  const hasChanges = temaSeleccionado !== temaActual;

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader
        titulo="Temas de la Pagina de Inicio"
        subtitulo="Selecciona una plantilla visual para cambiar la apariencia de tu landing page"
      />

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {themeNames.map((name) => {
          const meta = THEME_META[name];
          const vars = LANDING_THEMES[name] as Record<string, string>;
          const isSelected = temaSeleccionado === name;
          const isCurrent = temaActual === name;

          return (
            <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                onClick={() => setTemaSeleccionado(name)}
                sx={{
                  cursor: 'pointer',
                  border: isSelected ? '3px solid' : `1px solid ${theme.border}`,
                  borderColor: isSelected ? 'primary.main' : theme.border,
                  bgcolor: theme.bgCard,
                  transition: 'all 0.25s ease',
                  overflow: 'hidden',
                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)', boxShadow: 4 },
                }}
              >
                {/* Preview mini landing */}
                <Box sx={{ height: 180, position: 'relative', overflow: 'hidden', bgcolor: vars['--landing-bg'] }}>
                  {/* Mini navbar */}
                  <Box sx={{ height: 28, bgcolor: vars['--landing-navbar-bg'], display: 'flex', alignItems: 'center', px: 1.5, gap: 0.5, borderBottom: `1px solid ${vars['--landing-navbar-bg']}` }}>
                    <Box sx={{ width: 30, height: 8, borderRadius: 1, bgcolor: vars['--landing-primary'] }} />
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                      <Box sx={{ width: 20, height: 6, borderRadius: 0.5, bgcolor: vars['--landing-btn-outline-border'], opacity: 0.6 }} />
                      <Box sx={{ width: 24, height: 6, borderRadius: 0.5, bgcolor: vars['--landing-accent'] }} />
                    </Box>
                  </Box>

                  {/* Mini hero */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, px: 2, py: 1.5 }}>
                    <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: vars['--landing-hero-card-bg'], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: vars['--landing-bg'], opacity: 0.5 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ height: 8, borderRadius: 1, mb: 0.5, background: `linear-gradient(135deg, ${vars['--landing-hero-gradient-start']}, ${vars['--landing-hero-gradient-end']})`, width: '80%' }} />
                      <Box sx={{ height: 5, borderRadius: 1, bgcolor: vars['--landing-hero-subtitle'], width: '50%', opacity: 0.7 }} />
                      <Box sx={{ mt: 1, width: 35, height: 8, borderRadius: 1, bgcolor: vars['--landing-primary'] }} />
                    </Box>
                  </Box>

                  {/* Mini cards */}
                  <Box sx={{ display: 'flex', gap: 0.5, px: 2, justifyContent: 'center' }}>
                    {[1, 2, 3].map((i) => (
                      <Box key={i} sx={{ width: 40, height: 35, borderRadius: 1, bgcolor: vars['--landing-card-bg'], boxShadow: `0 1px 4px rgba(0,0,0,0.08)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: vars['--landing-icon-bg'] }} />
                        <Box sx={{ width: 20, height: 3, borderRadius: 0.5, bgcolor: vars['--landing-heading'], opacity: 0.4 }} />
                      </Box>
                    ))}
                  </Box>

                  {/* Mini footer */}
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, bgcolor: vars['--landing-footer-bg'] }} />

                  {/* Active badge */}
                  {isCurrent && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'success.main', color: 'white', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.6rem', fontWeight: 700 }}>
                      ACTIVO
                    </Box>
                  )}
                </Box>

                {/* Info */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {meta.previewColors.map((color, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 20, height: 20, borderRadius: '50%',
                          bgcolor: color,
                          border: '2px solid',
                          borderColor: color === '#0F1117' ? 'grey.400' : 'transparent',
                        }}
                      />
                    ))}
                    {isSelected && (
                      <Iconify icon="mdi:check-circle" width={22} sx={{ color: 'primary.main', ml: 'auto' }} />
                    )}
                  </Box>
                  <Typography variant="subtitle1" sx={{ color: theme.textPrimary, fontWeight: 700, mt: 1 }}>
                    {meta.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                    {meta.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Footer actions */}
      <Card sx={{ p: 2, mt: 3, bgcolor: theme.bgCard, border: `1px solid ${theme.border}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            {hasChanges ? (
              <Typography variant="body2" sx={{ color: 'warning.main' }}>
                Has seleccionado &quot;{THEME_META[temaSeleccionado].label}&quot; — guarda para aplicar el cambio
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Tema actual: {THEME_META[temaActual].label}
              </Typography>
            )}
          </Box>

          {mensaje && (
            <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)} sx={{ flex: 1 }}>
              {mensaje.texto}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={guardar}
            disabled={guardando || !hasChanges}
            startIcon={<Iconify icon="mdi:palette-outline" />}
          >
            {guardando ? 'Aplicando...' : 'Aplicar Tema'}
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
