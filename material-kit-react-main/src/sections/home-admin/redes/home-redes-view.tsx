import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.redes.php`;

interface RedSocial {
  idRed: number;
  nombre: string;
  icono: string;
  url: string;
  orden: number;
  activo: number | string;
}

const FORM_DEFAULT = { nombre: '', icono: 'mdi:link', url: '' };

const ICONOS_SUGERIDOS = [
  { label: 'Facebook', value: 'mdi:facebook' },
  { label: 'Instagram', value: 'mdi:instagram' },
  { label: 'TikTok', value: 'ic:baseline-tiktok' },
  { label: 'YouTube', value: 'mdi:youtube' },
  { label: 'Twitter/X', value: 'mdi:twitter' },
  { label: 'LinkedIn', value: 'mdi:linkedin' },
  { label: 'WhatsApp', value: 'mdi:whatsapp' },
  { label: 'Telegram', value: 'mdi:telegram' },
  { label: 'Pinterest', value: 'mdi:pinterest' },
  { label: 'Spotify', value: 'mdi:spotify' },
  { label: 'Enlace', value: 'mdi:link' },
];

export function HomeRedesView() {
  const theme = useDashboardTheme();
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editando, setEditando] = useState<RedSocial | null>(null);
  const [form, setForm] = useState(FORM_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success) setRedes(d.redes);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_DEFAULT);
    setOpenDialog(true);
  };

  const abrirEditar = (red: RedSocial) => {
    setEditando(red);
    setForm({ nombre: red.nombre, icono: red.icono, url: red.url });
    setOpenDialog(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return;
    setGuardando(true);
    try {
      const fd = new FormData();
      if (editando) {
        fd.append('accion', 'actualizar');
        fd.append('idRed', String(editando.idRed));
      }
      fd.append('nombre', form.nombre);
      fd.append('icono', form.icono || 'mdi:link');
      fd.append('url', form.url || '#');
      fd.append('orden', String(editando?.orden ?? (redes.length + 1)));

      const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
      if (d.success) {
        setOpenDialog(false);
        setMensaje({ tipo: 'success', texto: editando ? 'Red actualizada' : 'Red creada' });
        cargar();
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de red' });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('Eliminar esta red social?')) return;
    await apiFetch(API, {
      method: 'DELETE',
      headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `idRed=${id}`,
    });
    cargar();
  };

  const toggle = async (id: number) => {
    const fd = new FormData();
    fd.append('accion', 'toggle');
    fd.append('idRed', String(id));
    await apiFetch(API, { method: 'POST', headers: auth, body: fd });
    cargar();
  };

  const mover = async (index: number, dir: -1 | 1) => {
    const newList = [...redes];
    const target = index + dir;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target], newList[index]];
    setRedes(newList);

    const fd = new FormData();
    fd.append('accion', 'reordenar');
    fd.append('ids', JSON.stringify(newList.map((r) => r.idRed)));
    await apiFetch(API, { method: 'POST', headers: auth, body: fd });
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader titulo="Redes Sociales" subtitulo="Configura los links de redes sociales del footer">
        <Button variant="contained" startIcon={<Iconify icon="mdi:plus" />} onClick={abrirCrear}>
          Nueva red
        </Button>
      </ModuloHeader>

      {mensaje && (
        <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)} sx={{ mt: 2 }}>
          {mensaje.texto}
        </Alert>
      )}

      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {redes.length === 0 && (
          <Card sx={{ p: 4, textAlign: 'center', bgcolor: theme.bgCard }}>
            <Iconify icon="mdi:share-variant-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
            <Typography sx={{ color: theme.textSecondary }}>No hay redes sociales configuradas.</Typography>
          </Card>
        )}

        {redes.map((red, idx) => {
          const activo = Number(red.activo) === 1;
          return (
            <Card
              key={red.idRed}
              sx={{
                p: 2, bgcolor: theme.bgCard,
                border: `1px solid ${theme.border}`,
                opacity: activo ? 1 : 0.5,
                display: 'flex', alignItems: 'center', gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <IconButton size="small" disabled={idx === 0} onClick={() => mover(idx, -1)} sx={{ color: theme.textSecondary }}>
                  <Iconify icon="mdi:chevron-up" width={18} />
                </IconButton>
                <IconButton size="small" disabled={idx === redes.length - 1} onClick={() => mover(idx, 1)} sx={{ color: theme.textSecondary }}>
                  <Iconify icon="mdi:chevron-down" width={18} />
                </IconButton>
              </Box>

              <Box
                sx={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  bgcolor: `${theme.primary}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Iconify icon={red.icono as any} width={26} sx={{ color: theme.primary }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ color: theme.textPrimary }}>{red.nombre}</Typography>
                <Typography variant="caption" noWrap sx={{ color: theme.textSecondary }}>
                  {red.url === '#' ? 'Sin enlace configurado' : red.url}
                </Typography>
              </Box>

              <Chip
                label={activo ? 'Activo' : 'Inactivo'}
                size="small"
                color={activo ? 'success' : 'default'}
                variant="outlined"
                sx={{ minWidth: 70 }}
              />

              <Tooltip title={activo ? 'Desactivar' : 'Activar'}>
                <Switch checked={activo} size="small" onChange={() => toggle(red.idRed)} />
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => abrirEditar(red)} sx={{ color: theme.primary }}>
                  <Iconify icon="mdi:pencil-outline" width={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => eliminar(red.idRed)} sx={{ color: theme.error }}>
                  <Iconify icon="mdi:trash-can-outline" width={18} />
                </IconButton>
              </Tooltip>
            </Card>
          );
        })}
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editando ? 'Editar red social' : 'Nueva red social'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nombre" fullWidth value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextField label="URL" fullWidth value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://facebook.com/tu-pagina" />
            <TextField
              label="Icono Iconify"
              fullWidth
              value={form.icono}
              onChange={(e) => setForm({ ...form, icono: e.target.value })}
              helperText="Ej: mdi:facebook, mdi:instagram, mdi:youtube"
            />

            <Box>
              <Typography variant="caption" sx={{ color: theme.textSecondary, mb: 1, display: 'block' }}>
                Iconos sugeridos:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {ICONOS_SUGERIDOS.map((s) => (
                  <Tooltip key={s.value} title={s.label}>
                    <IconButton
                      size="small"
                      onClick={() => setForm({ ...form, icono: s.value, nombre: form.nombre || s.label })}
                      sx={{
                        border: form.icono === s.value ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`,
                        bgcolor: form.icono === s.value ? `${theme.primary}15` : 'transparent',
                      }}
                    >
                      <Iconify icon={s.value as any} width={22} />
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            {form.icono && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: theme.bgCard, borderRadius: 1, border: `1px solid ${theme.border}` }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: `${theme.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Iconify icon={form.icono as any} width={24} sx={{ color: theme.primary }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2">{form.nombre || 'Red social'}</Typography>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>{form.url || '#'}</Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
