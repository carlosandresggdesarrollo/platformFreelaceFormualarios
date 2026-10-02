import type { LoaderName } from 'src/sections/inicio/loaders';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';
import { cacheLoaderPreference } from 'src/components/loading-fallback/loading-fallback';

import { LOADER_META, LOADER_NAMES, LoadingScreen } from 'src/sections/inicio/loaders';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.config.php`;

const COLOR_PRESETS = [
  { label: 'Por defecto', value: '' },
  { label: 'Azul', value: '#2196F3' },
  { label: 'Verde', value: '#4CAF50' },
  { label: 'Rojo', value: '#E53935' },
  { label: 'Naranja', value: '#FF9800' },
  { label: 'Morado', value: '#9C27B0' },
  { label: 'Turquesa', value: '#00BCD4' },
  { label: 'Rosa', value: '#E91E63' },
  { label: 'Dorado', value: '#FFB300' },
];

export function HomeLoadersView() {
  const theme = useDashboardTheme();
  const [loaderActual, setLoaderActual] = useState<LoaderName>('pulso-logo');
  const [loaderSeleccionado, setLoaderSeleccionado] = useState<LoaderName>('pulso-logo');
  const [duracion, setDuracion] = useState(2);
  const [duracionActual, setDuracionActual] = useState(2);
  const [color, setColor] = useState('');
  const [colorActual, setColorActual] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [previewing, setPreviewing] = useState<LoaderName | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const hayCambios = loaderSeleccionado !== loaderActual || duracion !== duracionActual || color !== colorActual;

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success && d.config) {
        const l = (d.config.animacionCarga || 'pulso-logo') as LoaderName;
        setLoaderActual(l);
        setLoaderSeleccionado(l);
        const dur = parseInt(d.config.animacionDuracion, 10) || 2;
        setDuracion(dur);
        setDuracionActual(dur);
        const col = d.config.animacionColor || '';
        setColor(col);
        setColorActual(col);
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
      fd.append('animacionCarga', loaderSeleccionado);
      fd.append('animacionDuracion', String(duracion));
      fd.append('animacionColor', color);
      const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
      if (d.success) {
        setLoaderActual(loaderSeleccionado);
        setDuracionActual(duracion);
        setColorActual(color);
        cacheLoaderPreference(loaderSeleccionado, undefined, duracion, color || undefined);
        setMensaje({ tipo: 'success', texto: 'Animacion de carga actualizada correctamente' });
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error al guardar' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexion' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box>
      <ModuloHeader
        titulo="Animaciones de Carga"
        subtitulo="Selecciona la animacion que se muestra mientras cargan las paginas"
      />

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mt: 2, borderRadius: 2 }} onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Configuracion: duracion y color */}
      <Card sx={{ p: 3, mt: 3, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
          Configuracion
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 1 }}>
              Duracion de la animacion: <strong>{duracion}s</strong>
            </Typography>
            <Slider
              value={duracion} min={1} max={10} step={1}
              onChange={(_, v) => setDuracion(v as number)}
              marks={[{ value: 1, label: '1s' }, { value: 5, label: '5s' }, { value: 10, label: '10s' }]}
              sx={{ color: theme.primary }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 1 }}>
              Color principal
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map((cp) => (
                <Box
                  key={cp.value}
                  onClick={() => setColor(cp.value)}
                  title={cp.label}
                  sx={{
                    width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                    border: color === cp.value ? `3px solid ${theme.primary}` : `2px solid ${theme.border}`,
                    bgcolor: cp.value || (theme.isDark ? '#555' : '#ddd'),
                    transition: 'all 0.2s ease',
                    transform: color === cp.value ? 'scale(1.15)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {!cp.value && <Iconify icon="mdi:auto-fix" width={16} sx={{ color: theme.textMuted }} />}
                </Box>
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                <input
                  type="color"
                  value={color || '#4CAF50'}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: 32, height: 32, border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none' }}
                />
                <Typography variant="caption" sx={{ color: theme.textMuted }}>Custom</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Typography variant="body2" sx={{ color: theme.textSecondary }}>
          Selecciona una animacion y presiona &quot;Aplicar&quot; para guardar
        </Typography>
        <Button
          variant="contained" onClick={guardar} disabled={guardando || !hayCambios}
          startIcon={<Iconify icon="mdi:check" width={18} />}
          sx={{
            bgcolor: theme.primary, fontWeight: 600, borderRadius: 2, px: 3,
            '&:hover': { bgcolor: theme.primaryHover },
            '&.Mui-disabled': { bgcolor: theme.border },
          }}
        >
          {guardando ? 'Guardando...' : 'Aplicar Animacion'}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {LOADER_NAMES.map((name) => {
          const meta = LOADER_META[name];
          const isSelected = loaderSeleccionado === name;
          const isCurrent = loaderActual === name;

          return (
            <Grid key={name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                onClick={() => setLoaderSeleccionado(name)}
                sx={{
                  cursor: 'pointer', borderRadius: 2, overflow: 'hidden',
                  transition: 'all 0.3s ease', position: 'relative',
                  border: isSelected ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`,
                  transform: isSelected ? 'scale(1.02)' : 'none',
                  boxShadow: isSelected ? `0 0 20px ${theme.primaryLight}` : theme.shadow,
                  background: theme.bgCard,
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 4px 20px ${theme.primaryLight}`,
                  },
                }}
              >
                {/* Mini preview area */}
                <Box sx={{
                  height: 140, position: 'relative', overflow: 'hidden',
                  bgcolor: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Box sx={{
                    transform: 'scale(0.35)', transformOrigin: 'center',
                    width: 400, height: 300, position: 'relative',
                    pointerEvents: 'none',
                  }}>
                    <LoadingScreen loader={name} />
                  </Box>

                  {/* Preview fullscreen button */}
                  <Box
                    onClick={(e) => { e.stopPropagation(); setPreviewing(name); setTimeout(() => setPreviewing(null), 3000); }}
                    sx={{
                      position: 'absolute', top: 8, right: 8, cursor: 'pointer',
                      width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <Iconify icon="mdi:fullscreen" width={16} sx={{ color: '#fff' }} />
                  </Box>
                </Box>

                {/* Info */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Iconify icon={meta.icon} width={20} sx={{ color: isSelected ? theme.primary : theme.textMuted }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {meta.label}
                    </Typography>
                    {isCurrent && (
                      <Box sx={{
                        ml: 'auto', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.7rem', fontWeight: 700,
                        bgcolor: theme.primaryLight, color: theme.primary,
                      }}>
                        Activa
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                    {meta.description}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Fullscreen preview overlay */}
      {previewing && (
        <Box
          onClick={() => setPreviewing(null)}
          sx={{
            position: 'fixed', inset: 0, zIndex: 99999, cursor: 'pointer',
            '--landing-bg': '#1a1a2e',
            '--landing-primary': '#60A5FA',
            '--landing-accent': '#a78bfa',
            '--landing-text': '#E6EDF3',
            '--landing-circle1': 'rgba(96,165,250,0.15)',
            '--landing-circle2': 'rgba(167,139,250,0.15)',
          }}
        >
          <LoadingScreen loader={previewing} />
          <Box sx={{
            position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', px: 3, py: 1, borderRadius: 2, fontSize: '0.85rem',
          }}>
            Click para cerrar (se cierra en 3s)
          </Box>
        </Box>
      )}
    </Box>
  );
}
