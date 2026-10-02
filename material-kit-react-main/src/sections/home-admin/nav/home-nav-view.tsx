import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
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

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.nav.php`;

interface NavItem {
  idNav: number;
  texto: string;
  link: string;
  orden: number;
}

const FORM_INICIAL = { texto: '', link: '#', orden: 0 };

export function HomeNavView() {
  const theme = useDashboardTheme();
  const [items, setItems] = useState<NavItem[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editando, setEditando] = useState<NavItem | null>(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success) setItems(d.items);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirCrear = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, orden: items.length + 1 });
    setOpenDialog(true);
  };

  const abrirEditar = (item: NavItem) => {
    setEditando(item);
    setForm({ texto: item.texto, link: item.link, orden: item.orden });
    setOpenDialog(true);
  };

  const guardar = async () => {
    if (!form.texto.trim()) return;
    setGuardando(true);
    try {
      if (editando) {
        const body = new URLSearchParams({
          idNav: String(editando.idNav),
          texto: form.texto,
          link: form.link,
          orden: String(form.orden),
        });
        const d = await apiFetch<any>(API, { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        if (!d.success) { setMensaje({ tipo: 'error', texto: d.error }); return; }
      } else {
        const fd = new FormData();
        fd.append('texto', form.texto);
        fd.append('link', form.link);
        fd.append('orden', String(form.orden));
        const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
        if (!d.success) { setMensaje({ tipo: 'error', texto: d.error }); return; }
      }
      setOpenDialog(false);
      setMensaje({ tipo: 'success', texto: editando ? 'Item actualizado' : 'Item creado' });
      cargar();
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de red' });
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!window.confirm('Eliminar este item de navegacion?')) return;
    await apiFetch(API, {
      method: 'DELETE',
      headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `idNav=${id}`,
    });
    cargar();
  };

  const mover = async (index: number, dir: -1 | 1) => {
    const newItems = [...items];
    const target = index + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setItems(newItems);

    const fd = new FormData();
    fd.append('accion', 'reordenar');
    fd.append('ids', JSON.stringify(newItems.map((i) => i.idNav)));
    await apiFetch(API, { method: 'POST', headers: auth, body: fd });
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader titulo="Navegacion del Home" subtitulo="Items del menu publico">
        <Button variant="contained" startIcon={<Iconify icon="mdi:plus" />} onClick={abrirCrear}>
          Nuevo item
        </Button>
      </ModuloHeader>

      {mensaje && (
        <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)} sx={{ mt: 2 }}>
          {mensaje.texto}
        </Alert>
      )}

      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {items.length === 0 && (
          <Card sx={{ p: 4, textAlign: 'center', bgcolor: theme.bgCard }}>
            <Typography sx={{ color: theme.textSecondary }}>No hay items de navegacion.</Typography>
          </Card>
        )}
        {items.map((item, idx) => (
          <Card
            key={item.idNav}
            sx={{
              p: 2, bgcolor: theme.bgCard,
              border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <IconButton size="small" disabled={idx === 0} onClick={() => mover(idx, -1)} sx={{ color: theme.textSecondary }}>
                <Iconify icon="mdi:chevron-up" width={18} />
              </IconButton>
              <IconButton size="small" disabled={idx === items.length - 1} onClick={() => mover(idx, 1)} sx={{ color: theme.textSecondary }}>
                <Iconify icon="mdi:chevron-down" width={18} />
              </IconButton>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: theme.textPrimary }}>{item.texto}</Typography>
              <Typography variant="caption" sx={{ color: theme.textSecondary }}>{item.link}</Typography>
            </Box>

            <Tooltip title="Editar">
              <IconButton size="small" onClick={() => abrirEditar(item)} sx={{ color: theme.primary }}>
                <Iconify icon="mdi:pencil-outline" width={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton size="small" onClick={() => eliminar(item.idNav)} sx={{ color: theme.error }}>
                <Iconify icon="mdi:trash-can-outline" width={18} />
              </IconButton>
            </Tooltip>
          </Card>
        ))}
      </Stack>

      {/* Dialog crear/editar */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editando ? 'Editar item' : 'Nuevo item de navegacion'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Texto" fullWidth value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} />
            <TextField label="Link" fullWidth value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
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
