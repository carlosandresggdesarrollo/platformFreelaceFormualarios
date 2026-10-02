import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.modal.php`;

interface ModalConfig {
  idConfig: number;
  activo: number | string;
  textoAgradecimiento: string | null;
  textoTerapeutas: string | null;
  textoColaboradores: string | null;
  textoCursos: string | null;
}

interface Contacto {
  idContacto: number;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  telefono: string | null;
  email: string | null;
  enlace: string | null;
  enlaceTexto: string | null;
  orden: number;
  activo: number | string;
}

const CONTACT_DEFAULT = { nombre: '', descripcion: '', telefono: '', email: '', enlace: '', enlaceTexto: '' };

const TIPO_LABELS: Record<string, { label: string; icon: string }> = {
  terapeuta: { label: 'Terapeutas', icon: 'mdi:stethoscope' },
  colaborador: { label: 'Colaboradores', icon: 'mdi:account-group-outline' },
  curso: { label: 'Cursos / Enlaces', icon: 'mdi:school-outline' },
};

export function HomeModalView() {
  const theme = useDashboardTheme();
  const [config, setConfig] = useState<ModalConfig | null>(null);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [tab, setTab] = useState(0);

  // Edit config
  const [configForm, setConfigForm] = useState({
    textoAgradecimiento: '',
    textoTerapeutas: '',
    textoColaboradores: '',
    textoCursos: '',
  });

  // Dialog contacto
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contacto | null>(null);
  const [contactForm, setContactForm] = useState(CONTACT_DEFAULT);
  const [contactTipo, setContactTipo] = useState('colaborador');

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const load = useCallback(async () => {
    try {
      const token = getAccessToken();
      const d: any = await apiFetch(API, { headers: { Authorization: `Bearer ${token}` } });
      if (d.success) {
        setConfig(d.config);
        setContactos(d.contactos || []);
        if (d.config) {
          setConfigForm({
            textoAgradecimiento: d.config.textoAgradecimiento || '',
            textoTerapeutas: d.config.textoTerapeutas || '',
            textoColaboradores: d.config.textoColaboradores || '',
            textoCursos: d.config.textoCursos || '',
          });
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggleActive = async () => {
    if (!config) return;
    const newVal = Number(config.activo) === 1 ? 0 : 1;
    const fd = new FormData();
    fd.append('accion', 'actualizar_config');
    fd.append('activo', String(newVal));
    fd.append('textoAgradecimiento', configForm.textoAgradecimiento);
    fd.append('textoTerapeutas', configForm.textoTerapeutas);
    fd.append('textoColaboradores', configForm.textoColaboradores);
    fd.append('textoCursos', configForm.textoCursos);
    const token = getAccessToken();
    const d: any = await apiFetch(API, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    if (d.success) {
      setConfig({ ...config, activo: newVal });
      showMsg(newVal ? 'Modal activado' : 'Modal desactivado');
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    const fd = new FormData();
    fd.append('accion', 'actualizar_config');
    fd.append('activo', String(Number(config.activo)));
    fd.append('textoAgradecimiento', configForm.textoAgradecimiento);
    fd.append('textoTerapeutas', configForm.textoTerapeutas);
    fd.append('textoColaboradores', configForm.textoColaboradores);
    fd.append('textoCursos', configForm.textoCursos);
    const token = getAccessToken();
    const d: any = await apiFetch(API, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    if (d.success) showMsg('Textos guardados');
    else showMsg('Error al guardar', 'error');
  };

  const openCreateDialog = (tipo: string) => {
    setEditingContact(null);
    setContactForm(CONTACT_DEFAULT);
    setContactTipo(tipo);
    setDialogOpen(true);
  };

  const openEditDialog = (c: Contacto) => {
    setEditingContact(c);
    setContactForm({
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      telefono: c.telefono || '',
      email: c.email || '',
      enlace: c.enlace || '',
      enlaceTexto: c.enlaceTexto || '',
    });
    setContactTipo(c.tipo);
    setDialogOpen(true);
  };

  const handleSaveContact = async () => {
    const fd = new FormData();
    const token = getAccessToken();

    if (editingContact) {
      fd.append('accion', 'actualizar_contacto');
      fd.append('idContacto', String(editingContact.idContacto));
    } else {
      fd.append('accion', 'crear_contacto');
      fd.append('tipo', contactTipo);
      const filtered = contactos.filter((c) => c.tipo === contactTipo);
      fd.append('orden', String(filtered.length + 1));
    }
    fd.append('nombre', contactForm.nombre);
    fd.append('descripcion', contactForm.descripcion);
    fd.append('telefono', contactForm.telefono);
    fd.append('email', contactForm.email);
    fd.append('enlace', contactForm.enlace);
    fd.append('enlaceTexto', contactForm.enlaceTexto);

    const d: any = await apiFetch(API, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    if (d.success) {
      showMsg(editingContact ? 'Contacto actualizado' : 'Contacto creado');
      setDialogOpen(false);
      load();
    } else {
      showMsg('Error', 'error');
    }
  };

  const handleToggleContact = async (id: number) => {
    const fd = new FormData();
    fd.append('accion', 'toggle_contacto');
    fd.append('idContacto', String(id));
    const token = getAccessToken();
    await apiFetch(API, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    load();
  };

  const handleDeleteContact = async (id: number) => {
    const token = getAccessToken();
    await apiFetch(API, { method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: `idContacto=${id}` });
    showMsg('Contacto eliminado');
    load();
  };

  const handleReorder = async (tipo: string, idx: number, dir: -1 | 1) => {
    const filtered = contactos.filter((c) => c.tipo === tipo).sort((a, b) => a.orden - b.orden);
    const ni = idx + dir;
    if (ni < 0 || ni >= filtered.length) return;
    [filtered[idx], filtered[ni]] = [filtered[ni], filtered[idx]];
    const ids = filtered.map((c) => c.idContacto);
    const fd = new FormData();
    fd.append('accion', 'reordenar');
    fd.append('ids', JSON.stringify(ids));
    const token = getAccessToken();
    await apiFetch(API, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    load();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  const tipoKeys = ['terapeuta', 'colaborador', 'curso'] as const;
  const currentTipo = tipoKeys[tab] || 'terapeuta';
  const filteredContacts = contactos.filter((c) => c.tipo === currentTipo).sort((a, b) => a.orden - b.orden);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} style={theme}>
      <ModuloHeader
        titulo="Modal de Bienvenida"
        subtitulo="Configura el modal que aparece al entrar a la pagina, despues de la animacion de carga."
      />

      {msg && <Alert severity={msgType} sx={{ mb: 2 }}>{msg}</Alert>}

      {/* Toggle activo/inactivo */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:message-text-outline" width={24} />
            <Typography variant="h6">Estado del Modal</Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={Number(config?.activo) === 1}
                onChange={handleToggleActive}
                color="primary"
              />
            }
            label={Number(config?.activo) === 1 ? 'Activo' : 'Inactivo'}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {Number(config?.activo) === 1
            ? 'El modal se mostrara al visitante despues de la animacion de carga.'
            : 'El modal esta desactivado. Los visitantes veran directamente la pagina.'}
        </Typography>
      </Card>

      {/* Textos de secciones */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          <Iconify icon="mdi:text-box-outline" width={22} sx={{ mr: 1, verticalAlign: 'middle' }} />
          Textos de las Secciones
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Si dejas un texto vacio, esa seccion no aparecera en el modal.
        </Typography>

        <Stack spacing={3}>
          <TextField
            label="Texto de Agradecimiento"
            multiline
            rows={3}
            fullWidth
            value={configForm.textoAgradecimiento}
            onChange={(e) => setConfigForm({ ...configForm, textoAgradecimiento: e.target.value })}
          />
          <TextField
            label="Texto de Terapeutas"
            multiline
            rows={2}
            fullWidth
            value={configForm.textoTerapeutas}
            onChange={(e) => setConfigForm({ ...configForm, textoTerapeutas: e.target.value })}
          />
          <TextField
            label="Texto de Colaboradores"
            multiline
            rows={2}
            fullWidth
            value={configForm.textoColaboradores}
            onChange={(e) => setConfigForm({ ...configForm, textoColaboradores: e.target.value })}
          />
          <TextField
            label="Texto de Cursos / Enlaces"
            multiline
            rows={2}
            fullWidth
            value={configForm.textoCursos}
            onChange={(e) => setConfigForm({ ...configForm, textoCursos: e.target.value })}
          />
          <Box sx={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={handleSaveConfig} startIcon={<Iconify icon="mdi:content-save" />}>
              Guardar Textos
            </Button>
          </Box>
        </Stack>
      </Card>

      {/* Contactos por tipo (tabs) */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          <Iconify icon="mdi:account-multiple-outline" width={22} sx={{ mr: 1, verticalAlign: 'middle' }} />
          Contactos
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          {tipoKeys.map((t) => (
            <Tab
              key={t}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon={TIPO_LABELS[t].icon as any} width={18} />
                  {TIPO_LABELS[t].label}
                  <Chip label={contactos.filter((c) => c.tipo === t).length} size="small" sx={{ ml: 0.5, height: 20 }} />
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => openCreateDialog(currentTipo)}
          >
            Agregar {TIPO_LABELS[currentTipo].label.slice(0, -1) || 'contacto'}
          </Button>
        </Box>

        {filteredContacts.length === 0 ? (
          <Alert severity="info">No hay {TIPO_LABELS[currentTipo].label.toLowerCase()} registrados.</Alert>
        ) : (
          <Stack spacing={2}>
            {filteredContacts.map((c, idx) => (
              <Card
                key={c.idContacto}
                variant="outlined"
                sx={{
                  p: 2,
                  opacity: Number(c.activo) === 1 ? 1 : 0.5,
                  transition: 'opacity 0.3s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.nombre}</Typography>
                      <Chip
                        label={Number(c.activo) === 1 ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={Number(c.activo) === 1 ? 'success' : 'default'}
                      />
                    </Box>
                    {c.descripcion && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {c.descripcion}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                      {c.telefono && (
                        <Typography variant="caption" color="text.secondary">
                          <Iconify icon="mdi:phone" width={14} sx={{ mr: 0.3, verticalAlign: 'middle' }} />
                          {c.telefono}
                        </Typography>
                      )}
                      {c.email && (
                        <Typography variant="caption" color="text.secondary">
                          <Iconify icon="mdi:email-outline" width={14} sx={{ mr: 0.3, verticalAlign: 'middle' }} />
                          {c.email}
                        </Typography>
                      )}
                      {c.enlace && (
                        <Typography variant="caption" color="primary">
                          <Iconify icon="mdi:open-in-new" width={14} sx={{ mr: 0.3, verticalAlign: 'middle' }} />
                          {c.enlaceTexto || c.enlace}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Subir">
                      <span>
                        <IconButton size="small" disabled={idx === 0} onClick={() => handleReorder(currentTipo, idx, -1)}>
                          <Iconify icon="mdi:chevron-up" width={20} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Bajar">
                      <span>
                        <IconButton size="small" disabled={idx === filteredContacts.length - 1} onClick={() => handleReorder(currentTipo, idx, 1)}>
                          <Iconify icon="mdi:chevron-down" width={20} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={Number(c.activo) === 1 ? 'Desactivar' : 'Activar'}>
                      <IconButton size="small" onClick={() => handleToggleContact(c.idContacto)}>
                        <Iconify icon={Number(c.activo) === 1 ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} width={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => openEditDialog(c)}>
                        <Iconify icon="mdi:pencil-outline" width={20} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => handleDeleteContact(c.idContacto)}>
                        <Iconify icon="mdi:delete-outline" width={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        )}
      </Card>

      {/* Dialog crear/editar contacto */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingContact ? `Editar: ${editingContact.nombre}` : `Nuevo ${TIPO_LABELS[contactTipo]?.label.slice(0, -1) || 'contacto'}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!editingContact && (
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select value={contactTipo} label="Tipo" onChange={(e) => setContactTipo(e.target.value)}>
                  <MenuItem value="terapeuta">Terapeuta</MenuItem>
                  <MenuItem value="colaborador">Colaborador</MenuItem>
                  <MenuItem value="curso">Curso / Enlace</MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              label="Nombre *"
              fullWidth
              value={contactForm.nombre}
              onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
            />
            <TextField
              label="Descripcion"
              fullWidth
              multiline
              rows={3}
              value={contactForm.descripcion}
              onChange={(e) => setContactForm({ ...contactForm, descripcion: e.target.value })}
            />
            <TextField
              label="Telefono"
              fullWidth
              value={contactForm.telefono}
              onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              value={contactForm.email}
              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
            />
            <TextField
              label="Enlace (URL)"
              fullWidth
              value={contactForm.enlace}
              onChange={(e) => setContactForm({ ...contactForm, enlace: e.target.value })}
              placeholder="https://..."
            />
            <TextField
              label="Texto del enlace"
              fullWidth
              value={contactForm.enlaceTexto}
              onChange={(e) => setContactForm({ ...contactForm, enlaceTexto: e.target.value })}
              placeholder="Visitar pagina..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveContact} disabled={!contactForm.nombre.trim()}>
            {editingContact ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
