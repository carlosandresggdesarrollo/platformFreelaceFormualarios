import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.logo.php`;

export function LogoAdminView() {
  const theme = useDashboardTheme();
  const [logoActual, setLogoActual] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success) setLogoActual(d.logo || null);
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

  const subir = async () => {
    if (!archivo) return;
    setGuardando(true);
    setMensaje(null);
    try {
      const fd = new FormData();
      fd.append('logo', archivo);
      const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
      if (d.success) {
        setLogoActual(d.logo);
        setArchivo(null);
        setPreview(null);
        setMensaje({ tipo: 'success', texto: 'Logo actualizado correctamente' });
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error al subir logo' });
      }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: `Error de red: ${err?.message || err}` });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm('¿Eliminar el logo actual? Se usará el logo por defecto.')) return;
    setEliminando(true);
    setMensaje(null);
    try {
      const d = await apiFetch<any>(API, { method: 'DELETE', headers: auth });
      if (d.success) {
        setLogoActual(null);
        setPreview(null);
        setArchivo(null);
        setMensaje({ tipo: 'success', texto: 'Logo eliminado. Se usará el logo por defecto.' });
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error al eliminar' });
      }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: `Error de red: ${err?.message || err}` });
    } finally {
      setEliminando(false);
    }
  };

  const imagenMostrar = preview || logoActual || `${import.meta.env.BASE_URL}images/logo.png`;

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader
        titulo="Logo de la Plataforma"
        subtitulo="Sube o cambia el logo que aparece en la landing page y la pagina de inicio de sesion"
      />

      <Card sx={{ p: 3, mt: 2, bgcolor: theme.bgCard, border: `1px solid ${theme.border}` }}>
        <Stack spacing={3}>
          {/* Preview del logo */}
          <Box>
            <Typography variant="subtitle2" sx={{ color: theme.textSecondary, mb: 2 }}>
              Logo actual
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                borderRadius: 2,
                border: `2px dashed ${theme.border}`,
                bgcolor: `${theme.primary}08`,
                minHeight: 200,
              }}
            >
              <Box
                component="img"
                src={imagenMostrar}
                alt="Logo"
                sx={{
                  maxHeight: 150,
                  maxWidth: '80%',
                  objectFit: 'contain',
                }}
              />
            </Box>
            {!logoActual && !preview && (
              <Typography variant="caption" sx={{ color: theme.textMuted, mt: 1, display: 'block' }}>
                Usando logo por defecto (/images/logo.png)
              </Typography>
            )}
          </Box>

          {/* Botones de accion */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Iconify icon="mdi:cloud-upload-outline" />}
              sx={{ color: theme.textPrimary, borderColor: theme.border }}
            >
              Seleccionar imagen
              <input type="file" hidden accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleArchivo} />
            </Button>

            {archivo && (
              <Typography variant="body2" sx={{ color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="mdi:file-image-outline" width={18} />
                {archivo.name}
              </Typography>
            )}
          </Stack>

          {/* Recomendaciones */}
          <Alert severity="info" variant="outlined">
            Formatos: PNG, JPG, WebP, SVG. Tamaño recomendado: 200x60px o superior. Maximo 5MB.
          </Alert>

          {mensaje && (
            <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)}>
              {mensaje.texto}
            </Alert>
          )}

          {/* Acciones */}
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Box>
              {logoActual && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={eliminar}
                  disabled={eliminando}
                  startIcon={<Iconify icon="mdi:trash-can-outline" />}
                >
                  {eliminando ? 'Eliminando...' : 'Eliminar logo'}
                </Button>
              )}
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={subir}
              disabled={guardando || !archivo}
              startIcon={<Iconify icon="mdi:content-save-outline" />}
            >
              {guardando ? 'Subiendo...' : 'Guardar logo'}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
}
