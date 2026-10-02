import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

import { DialogGenerarIA } from '../components/dialog-generar-ia';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.cuestionarios.php`;

interface Cuestionario {
  idCuestionario: number;
  titulo: string;
  descripcion: string;
  estado: 'borrador' | 'publicado' | 'cerrado';
  totalPreguntas: number;
  totalRespuestas: number;
  fechaCreacion: string;
}

const estadoColor: Record<string, 'default' | 'success' | 'error'> = {
  borrador: 'default',
  publicado: 'success',
  cerrado: 'error',
};

export function CuestionariosListadoView() {
  const theme = useDashboardTheme();
  const router = useRouter();
  const [cuestionarios, setCuestionarios] = useState<Cuestionario[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [crearOpen, setCrearOpen] = useState(false);
  const [iaOpen, setIaOpen] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoDesc, setNuevoDesc] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Cuestionario | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    try {
      const d = await apiFetch<any>(API, { headers: auth });
      if (d.success !== false && Array.isArray(d.cuestionarios)) {
        setCuestionarios(d.cuestionarios);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = async () => {
    if (!nuevoTitulo.trim()) return;
    try {
      const d = await apiFetch<any>(API, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nuevoTitulo, descripcion: nuevoDesc }),
      });
      if (d.success) {
        setCrearOpen(false);
        setNuevoTitulo('');
        setNuevoDesc('');
        router.push(`/cuestionarios/editar/${d.idCuestionario}`);
      } else {
        setMensaje({ tipo: 'error', texto: d.error || 'Error al crear' });
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexion' });
    }
  };

  const cambiarEstado = async (c: Cuestionario, nuevoEstado: string) => {
    try {
      const d = await apiFetch<any>(API, {
        method: 'PUT',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.idCuestionario, titulo: c.titulo, descripcion: c.descripcion, estado: nuevoEstado }),
      });
      if (d.success) {
        setMensaje({ tipo: 'success', texto: `Cuestionario ${nuevoEstado}` });
        cargar();
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar' });
    }
  };

  const eliminar = async () => {
    if (!confirmDelete) return;
    try {
      const d = await apiFetch<any>(API, {
        method: 'DELETE',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete.idCuestionario }),
      });
      if (d.success) {
        setMensaje({ tipo: 'success', texto: 'Cuestionario eliminado' });
        setConfirmDelete(null);
        cargar();
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar' });
    }
  };

  return (
    <Box>
      <ModuloHeader titulo="Cuestionarios" subtitulo="Crea y administra cuestionarios con opciones de respuesta" />

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mt: 2, borderRadius: 2 }} onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2 }}>
        <Button
          variant="contained" onClick={() => setCrearOpen(true)}
          startIcon={<Iconify icon="mdi:plus" width={18} />}
          sx={{ bgcolor: theme.primary, fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: theme.primaryHover } }}
        >
          Crear Cuestionario
        </Button>
        <Button
          variant="outlined" onClick={() => setIaOpen(true)}
          startIcon={<Iconify icon="mdi:robot-outline" width={18} />}
          sx={{ borderColor: theme.accent, color: theme.accent, fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: theme.accentHover, borderColor: theme.accent } }}
        >
          Generar con IA
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadow, background: theme.bgCard }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                <TableCell sx={{ fontWeight: 700, color: theme.textPrimary }}>Titulo</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.textPrimary, width: 100 }}>Preguntas</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.textPrimary, width: 100 }}>Respuestas</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.textPrimary, width: 140 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.textPrimary, width: 140 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700, color: theme.textPrimary, width: 160 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cuestionarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: theme.textMuted }}>
                    No hay cuestionarios aun. Crea uno manualmente o genera con IA.
                  </TableCell>
                </TableRow>
              )}
              {cuestionarios.map((c) => (
                <TableRow key={c.idCuestionario} sx={{ '&:hover': { bgcolor: theme.bgTableRowHover } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                        {c.titulo}
                      </Typography>
                      {c.descripcion && (
                        <Typography variant="caption" sx={{ color: theme.textMuted, display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.descripcion}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: theme.textPrimary, textAlign: 'center' }}>{c.totalPreguntas}</TableCell>
                  <TableCell sx={{ color: theme.textPrimary, textAlign: 'center' }}>{c.totalRespuestas}</TableCell>
                  <TableCell>
                    <Chip label={c.estado} size="small" color={estadoColor[c.estado] || 'default'} sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell sx={{ color: theme.textSecondary, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(c.fechaCreacion).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" title="Editar preguntas" onClick={() => router.push(`/cuestionarios/editar/${c.idCuestionario}`)}>
                        <Iconify icon="mdi:pencil-outline" width={18} sx={{ color: theme.primary }} />
                      </IconButton>
                      <IconButton size="small" title="Estadisticas" onClick={() => router.push(`/cuestionarios/stats/${c.idCuestionario}`)}>
                        <Iconify icon="mdi:chart-bar" width={18} sx={{ color: theme.info }} />
                      </IconButton>
                      {c.estado === 'borrador' && (
                        <IconButton size="small" title="Publicar" onClick={() => cambiarEstado(c, 'publicado')}>
                          <Iconify icon="mdi:publish" width={18} sx={{ color: theme.success }} />
                        </IconButton>
                      )}
                      {c.estado === 'publicado' && (
                        <IconButton size="small" title="Cerrar" onClick={() => cambiarEstado(c, 'cerrado')}>
                          <Iconify icon="mdi:lock-outline" width={18} sx={{ color: theme.warning }} />
                        </IconButton>
                      )}
                      <IconButton size="small" title="Eliminar" onClick={() => setConfirmDelete(c)}>
                        <Iconify icon="mdi:delete-outline" width={18} sx={{ color: theme.error }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog crear manual */}
      <Dialog open={crearOpen} onClose={() => setCrearOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Cuestionario</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth label="Titulo" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth label="Descripcion (opcional)" value={nuevoDesc} onChange={(e) => setNuevoDesc(e.target.value)}
            multiline rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCrearOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={crear} disabled={!nuevoTitulo.trim()}
            sx={{ bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover } }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog generar con IA */}
      <DialogGenerarIA
        open={iaOpen}
        onClose={() => setIaOpen(false)}
        onCreado={(id) => {
          setIaOpen(false);
          setMensaje({ tipo: 'success', texto: 'Cuestionario generado con IA exitosamente' });
          cargar();
          router.push(`/cuestionarios/editar/${id}`);
        }}
      />

      {/* Dialog confirmar eliminacion */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar Cuestionario</DialogTitle>
        <DialogContent>
          <Typography>
            Estas seguro de eliminar &quot;{confirmDelete?.titulo}&quot;? Se eliminaran todas las preguntas y respuestas asociadas.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={eliminar}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
