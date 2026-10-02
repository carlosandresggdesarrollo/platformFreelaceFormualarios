import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.config.php`;

interface HomeConfig {
  tituloPrincipal: string;
  subtitulo: string;
  imagenFondo: string | null;
  registroActivo?: number;
  nombreSitio?: string;
}

export function HomeConfigView() {
  const theme = useDashboardTheme();
  const [config, setConfig] = useState<HomeConfig>({ tituloPrincipal: '', subtitulo: '', imagenFondo: null });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [toggling, setToggling] = useState(false);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success && d.config) setConfig(d.config);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivo(file);
    setPreview(URL.createObjectURL(file));
  };

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const fd = new FormData();
      fd.append('tituloPrincipal', config.tituloPrincipal);
      fd.append('subtitulo', config.subtitulo);
      if (config.nombreSitio) fd.append('nombreSitio', config.nombreSitio);
      if (archivo) fd.append('imagenFondo', archivo);

      const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
      if (d.success) {
        setMensaje({ tipo: 'success', texto: 'Configuracion guardada correctamente' });
        setArchivo(null);
        cargar();
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error al guardar' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de red' });
    } finally {
      setGuardando(false);
    }
  };

  const imagenActual = preview || config.imagenFondo;

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader titulo="Configuracion del Home" subtitulo="Titulo principal e imagen de fondo del hero" />

      <Card sx={{ p: 3, mt: 2, bgcolor: theme.bgCard, border: `1px solid ${theme.border}` }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: theme.textSecondary, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="mdi:web" width={18} /> Nombre del sitio
            </Typography>
            <TextField
              fullWidth
              placeholder="Formularios Web"
              helperText="Este nombre aparece en el sidebar, login, pestanas del navegador y chat"
              value={config.nombreSitio || ''}
              onChange={(e) => setConfig({ ...config, nombreSitio: e.target.value })}
              InputLabelProps={{ sx: { color: theme.textSecondary } }}
              InputProps={{ sx: { color: theme.textPrimary, fontWeight: 600, fontSize: '1.1rem' } }}
            />
          </Box>

          <TextField
            label="Titulo principal"
            fullWidth
            value={config.tituloPrincipal}
            onChange={(e) => setConfig({ ...config, tituloPrincipal: e.target.value })}
            InputLabelProps={{ sx: { color: theme.textSecondary } }}
            InputProps={{ sx: { color: theme.textPrimary } }}
          />

          <TextField
            label="Subtitulo"
            fullWidth
            value={config.subtitulo}
            onChange={(e) => setConfig({ ...config, subtitulo: e.target.value })}
            InputLabelProps={{ sx: { color: theme.textSecondary } }}
            InputProps={{ sx: { color: theme.textPrimary } }}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ color: theme.textSecondary, mb: 1 }}>
              Imagen de fondo
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Iconify icon="mdi:cloud-upload-outline" />}
              sx={{ color: theme.textPrimary, borderColor: theme.border }}
            >
              Seleccionar imagen
              <input type="file" hidden accept="image/*" onChange={handleArchivo} />
            </Button>
            {archivo && (
              <Typography variant="caption" sx={{ ml: 2, color: theme.textSecondary }}>
                {archivo.name}
              </Typography>
            )}
          </Box>

          {imagenActual && (
            <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', maxHeight: 300 }}>
              <Box
                component="img"
                src={imagenActual}
                alt="Preview"
                sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 2 }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute', bottom: 8, left: 8,
                  bgcolor: 'rgba(0,0,0,0.6)', color: '#fff',
                  px: 1, py: 0.5, borderRadius: 1,
                }}
              >
                Vista previa
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              p: 2, borderRadius: 2, bgcolor: theme.bgCard, border: `1px solid ${theme.border}`,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                Registro de usuarios
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                {Number(config.registroActivo) === 1
                  ? 'Los visitantes pueden crear cuenta desde el landing y el login'
                  : 'El botón de "Registrarse" y "Crear cuenta" están ocultos'}
              </Typography>
            </Box>
            <Switch
              checked={Number(config.registroActivo) === 1}
              disabled={toggling}
              onChange={async () => {
                setToggling(true);
                try {
                  const d = await apiFetch<any>(API, {
                    method: 'PUT',
                    headers: { ...auth, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accion: 'toggleRegistro' }),
                  });
                  if (d.success) {
                    setConfig({ ...config, registroActivo: d.registroActivo });
                    setMensaje({ tipo: 'success', texto: d.registroActivo ? 'Registro activado' : 'Registro desactivado' });
                  }
                } catch { /* ignore */ }
                setToggling(false);
              }}
              color="success"
            />
          </Box>

          {mensaje && (
            <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)}>
              {mensaje.texto}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={guardar}
              disabled={guardando}
              startIcon={<Iconify icon="mdi:content-save-outline" />}
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Box>
        </Stack>
      </Card>
    </Container>
  );
}
