import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
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

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.carruseles.php`;

interface CarruselItem {
  idItem: number;
  idCarrusel: number;
  imagen: string | null;
  icono: string | null;
  titulo: string;
  descripcion: string | null;
  link: string | null;
  orden: number;
  activo: number | string;
}

interface Carrusel {
  idCarrusel: number;
  nombre: string;
  velocidad: number;
  items: CarruselItem[];
}

const FORM_ITEM = { titulo: '', descripcion: '', link: '', icono: '' };

export function HomeCarruselesView() {
  const theme = useDashboardTheme();
  const [carruseles, setCarruseles] = useState<Carrusel[]>([]);
  const [tabActivo, setTabActivo] = useState(0);
  const [openItem, setOpenItem] = useState(false);
  const [editandoItem, setEditandoItem] = useState<CarruselItem | null>(null);
  const [formItem, setFormItem] = useState(FORM_ITEM);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success) setCarruseles(d.carruseles);
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const carruselActual = carruseles[tabActivo] || null;

  const abrirCrearItem = () => {
    setEditandoItem(null);
    setFormItem(FORM_ITEM);
    setArchivoImagen(null);
    setPreviewImagen(null);
    setOpenItem(true);
  };

  const abrirEditarItem = (item: CarruselItem) => {
    setEditandoItem(item);
    setFormItem({
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      link: item.link || '',
      icono: item.icono || '',
    });
    setArchivoImagen(null);
    setPreviewImagen(item.imagen || null);
    setOpenItem(true);
  };

  const handleImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoImagen(file);
    setPreviewImagen(URL.createObjectURL(file));
  };

  const guardarItem = async () => {
    if (!formItem.titulo.trim() || !carruselActual) return;
    setGuardando(true);
    try {
      const fd = new FormData();

      if (editandoItem) {
        fd.append('accion', 'actualizar_item');
        fd.append('idItem', String(editandoItem.idItem));
        fd.append('activo', String(editandoItem.activo));
        fd.append('orden', String(editandoItem.orden));
      }

      fd.append('idCarrusel', String(carruselActual.idCarrusel));
      fd.append('titulo', formItem.titulo);
      fd.append('descripcion', formItem.descripcion);
      fd.append('link', formItem.link || '');
      fd.append('icono', formItem.icono || '');
      fd.append('orden', String(editandoItem?.orden ?? (carruselActual.items.length + 1)));
      if (archivoImagen) fd.append('imagen', archivoImagen);

      const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });

      if (d.success) {
        setOpenItem(false);
        setMensaje({ tipo: 'success', texto: editandoItem ? 'Item actualizado' : 'Item creado' });
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

  const eliminarItem = async (id: number) => {
    if (!window.confirm('Eliminar este item?')) return;
    await apiFetch(API, {
      method: 'DELETE',
      headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `idItem=${id}`,
    });
    cargar();
  };

  const toggleItem = async (id: number) => {
    const fd = new FormData();
    fd.append('accion', 'toggle');
    fd.append('idItem', String(id));
    await apiFetch(API, { method: 'POST', headers: auth, body: fd });
    cargar();
  };

  const cambiarVelocidad = async (vel: number) => {
    if (!carruselActual) return;
    const fd = new FormData();
    fd.append('accion', 'velocidad');
    fd.append('idCarrusel', String(carruselActual.idCarrusel));
    fd.append('velocidad', String(vel));
    const d = await apiFetch<any>(API, { method: 'POST', headers: auth, body: fd });
    if (d.success) {
      setCarruseles((prev) =>
        prev.map((c, i) => (i === tabActivo ? { ...c, velocidad: vel } : c))
      );
    }
  };

  const moverItem = async (index: number, dir: -1 | 1) => {
    if (!carruselActual) return;
    const newItems = [...carruselActual.items];
    const target = index + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];

    const updated = carruseles.map((c, i) => (i === tabActivo ? { ...c, items: newItems } : c));
    setCarruseles(updated);

    const fd = new FormData();
    fd.append('accion', 'reordenar');
    fd.append('ids', JSON.stringify(newItems.map((it) => it.idItem)));
    await apiFetch(API, { method: 'POST', headers: auth, body: fd });
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader titulo="Carruseles del Home" subtitulo="Gestiona el contenido de los 3 carruseles">
        <Button variant="contained" startIcon={<Iconify icon="mdi:plus" />} onClick={abrirCrearItem} disabled={!carruselActual}>
          Nuevo item
        </Button>
      </ModuloHeader>

      {mensaje && (
        <Alert severity={mensaje.tipo} onClose={() => setMensaje(null)} sx={{ mt: 2 }}>
          {mensaje.texto}
        </Alert>
      )}

      {carruseles.length > 0 && (
        <Box sx={{ mt: 2, borderBottom: 1, borderColor: theme.border }}>
          <Tabs
            value={tabActivo}
            onChange={(_, v) => setTabActivo(v)}
            textColor="inherit"
            sx={{ '& .MuiTab-root': { color: theme.textSecondary }, '& .Mui-selected': { color: theme.primary } }}
          >
            {carruseles.map((c) => (
              <Tab key={c.idCarrusel} label={c.nombre} />
            ))}
          </Tabs>
        </Box>
      )}

      {carruselActual && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Card sx={{ p: 2.5, bgcolor: theme.bgCard, border: `1px solid ${theme.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Iconify icon="mdi:animation-play" width={22} sx={{ color: theme.primary }} />
              <Typography variant="subtitle2" sx={{ color: theme.textPrimary, minWidth: 160 }}>
                Velocidad de desplazamiento: <strong>{carruselActual.velocidad === 0 ? 'Detenido' : carruselActual.velocidad}</strong>
              </Typography>
              <Slider
                value={carruselActual.velocidad}
                min={0} max={10} step={1}
                onChange={(_, v) => {
                  setCarruseles((prev) =>
                    prev.map((c, i) => (i === tabActivo ? { ...c, velocidad: v as number } : c))
                  );
                }}
                onChangeCommitted={(_, v) => cambiarVelocidad(v as number)}
                marks={[{ value: 0, label: 'Off' }, { value: 5, label: '5' }, { value: 10, label: '10' }]}
                sx={{ flex: 1, color: theme.primary, mx: 2 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: theme.textMuted, mt: 0.5, display: 'block' }}>
              0 = sin movimiento. 1-10 = velocidad del carrusel automatico (tipo marquesina).
            </Typography>
          </Card>

          {carruselActual.items.length === 0 && (
            <Card sx={{ p: 4, textAlign: 'center', bgcolor: theme.bgCard }}>
              <Iconify icon="mdi:image-multiple-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
              <Typography sx={{ color: theme.textSecondary }}>Este carrusel no tiene items.</Typography>
            </Card>
          )}

          {carruselActual.items.map((item, idx) => {
            const activo = Number(item.activo) === 1;
            return (
              <Card
                key={item.idItem}
                sx={{
                  p: 2, bgcolor: theme.bgCard,
                  border: `1px solid ${theme.border}`,
                  opacity: activo ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', gap: 2,
                }}
              >
                {/* Flechas */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <IconButton size="small" disabled={idx === 0} onClick={() => moverItem(idx, -1)} sx={{ color: theme.textSecondary }}>
                    <Iconify icon="mdi:chevron-up" width={18} />
                  </IconButton>
                  <IconButton size="small" disabled={idx === carruselActual.items.length - 1} onClick={() => moverItem(idx, 1)} sx={{ color: theme.textSecondary }}>
                    <Iconify icon="mdi:chevron-down" width={18} />
                  </IconButton>
                </Box>

                {/* Thumbnail */}
                <Box
                  sx={{
                    width: 56, height: 56, borderRadius: 1, flexShrink: 0,
                    bgcolor: `${theme.primary}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.imagen ? (
                    <Box component="img" src={item.imagen} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Iconify icon={(item.icono || 'mdi:image') as any} width={28} sx={{ color: theme.primary }} />
                  )}
                </Box>

                {/* Contenido */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap sx={{ color: theme.textPrimary }}>{item.titulo}</Typography>
                  <Typography variant="caption" noWrap sx={{ color: theme.textSecondary }}>
                    {item.descripcion || 'Sin descripcion'}
                  </Typography>
                </Box>

                {/* Activo */}
                <Chip
                  label={activo ? 'Activo' : 'Inactivo'}
                  size="small"
                  color={activo ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ minWidth: 70 }}
                />

                {/* Acciones */}
                <Tooltip title={activo ? 'Desactivar' : 'Activar'}>
                  <Switch checked={activo} size="small" onChange={() => toggleItem(item.idItem)} />
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => abrirEditarItem(item)} sx={{ color: theme.primary }}>
                    <Iconify icon="mdi:pencil-outline" width={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => eliminarItem(item.idItem)} sx={{ color: theme.error }}>
                    <Iconify icon="mdi:trash-can-outline" width={18} />
                  </IconButton>
                </Tooltip>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Dialog crear/editar item */}
      <Dialog open={openItem} onClose={() => setOpenItem(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editandoItem ? 'Editar item' : 'Nuevo item del carrusel'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Titulo" fullWidth value={formItem.titulo} onChange={(e) => setFormItem({ ...formItem, titulo: e.target.value })} />
            <TextField label="Descripcion" fullWidth multiline minRows={2} value={formItem.descripcion} onChange={(e) => setFormItem({ ...formItem, descripcion: e.target.value })} />
            <TextField label="Link (opcional)" fullWidth value={formItem.link} onChange={(e) => setFormItem({ ...formItem, link: e.target.value })} />
            <TextField
              label="Icono Iconify (ej: mdi:star)"
              fullWidth
              value={formItem.icono}
              onChange={(e) => setFormItem({ ...formItem, icono: e.target.value })}
              helperText="Se usa si no se sube imagen"
            />

            <Box>
              <Button variant="outlined" component="label" startIcon={<Iconify icon="mdi:cloud-upload-outline" />}>
                Subir imagen
                <input type="file" hidden accept="image/*" onChange={handleImagen} />
              </Button>
              {archivoImagen && (
                <Typography variant="caption" sx={{ ml: 2 }}>{archivoImagen.name}</Typography>
              )}
            </Box>

            {previewImagen && (
              <Box component="img" src={previewImagen} alt="Preview" sx={{ maxHeight: 150, objectFit: 'contain', borderRadius: 1 }} />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItem(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarItem} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
