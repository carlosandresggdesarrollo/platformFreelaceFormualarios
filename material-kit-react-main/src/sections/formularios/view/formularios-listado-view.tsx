import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.php`;

interface Formulario {
  idCuestionario: number;
  titulo: string;
  descripcion: string;
  estado: string;
  compartirToken: string;
  slug: string;
  fechaCreacion: string;
  totalPreguntas: number;
  totalRespuestas: number;
  totalVisitas: number;
}

export function FormulariosListadoView() {
  const theme = useDashboardTheme();
  const router = useRouter();

  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [crearOpen, setCrearOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const d = await apiFetch<any>(`${API}?vista=formularios`, { headers });
      if (d.success) setFormularios(d.formularios || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCrear = async () => {
    if (!titulo.trim()) return;
    setCreating(true);
    try {
      const token = getAccessToken();
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const d = await apiFetch<any>(API, {
        method: 'POST',
        headers,
        body: JSON.stringify({ accion: 'crear', titulo: titulo.trim(), descripcion: descripcion.trim() }),
      });
      if (d.success && d.data?.idCuestionario) {
        setCrearOpen(false);
        setTitulo('');
        setDescripcion('');
        router.push(`/formularios/editar/${d.data.idCuestionario}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      const token = getAccessToken();
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      await apiFetch<any>(API, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ idCuestionario: id }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = (compartirToken: string, slug?: string) => {
    const slugPart = slug ? `/${slug}` : '';
    const url = `${window.location.origin}${CONFIG.basePath}/form/${compartirToken}${slugPart}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(compartirToken);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      <ModuloHeader titulo="Mis Formularios" subtitulo="Crea, edita y comparte tus formularios" />

      <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3 }}>
        <Button variant="contained" startIcon={<Iconify icon="mdi:plus" />}
          onClick={() => setCrearOpen(true)}
          sx={{ bgcolor: theme.primary, fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: theme.primaryHover } }}>
          Nuevo formulario
        </Button>
      </Box>

      {formularios.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
          <Iconify icon="mdi:clipboard-text-off-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
          <Typography sx={{ color: theme.textSecondary }}>Aun no tienes formularios</Typography>
          <Button variant="outlined" sx={{ mt: 2, borderColor: theme.primary, color: theme.primary }}
            onClick={() => setCrearOpen(true)}>
            Crear mi primer formulario
          </Button>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Titulo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Preguntas</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Visitas</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Respuestas</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formularios.map((f) => (
                  <TableRow key={f.idCuestionario} hover sx={{ '&:hover': { bgcolor: theme.bgTableRowHover } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>{f.titulo}</Typography>
                      {f.descripcion && (
                        <Typography variant="caption" sx={{ color: theme.textSecondary }}>{f.descripcion.substring(0, 60)}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={f.estado} size="small" sx={{
                        fontWeight: 600,
                        bgcolor: f.estado === 'publicado' ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                        color: f.estado === 'publicado' ? '#4CAF50' : '#FF9800',
                      }} />
                    </TableCell>
                    <TableCell align="center" sx={{ color: theme.textSecondary }}>{f.totalPreguntas}</TableCell>
                    <TableCell align="center" sx={{ color: theme.textSecondary }}>{f.totalVisitas}</TableCell>
                    <TableCell align="center" sx={{ color: theme.textSecondary }}>{f.totalRespuestas}</TableCell>
                    <TableCell sx={{ color: theme.textSecondary, whiteSpace: 'nowrap' }}>
                      {new Date(f.fechaCreacion).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton size="small" onClick={() => router.push(`/formularios/editar/${f.idCuestionario}`)}
                          sx={{ color: theme.primary }}>
                          <Iconify icon="mdi:pencil-outline" width={20} />
                        </IconButton>
                        <IconButton size="small" onClick={() => router.push(`/formularios/stats/${f.idCuestionario}`)}
                          sx={{ color: '#2196F3' }}>
                          <Iconify icon="mdi:chart-bar" width={20} />
                        </IconButton>
                        <IconButton size="small" onClick={() => copyLink(f.compartirToken, f.slug)}
                          sx={{ color: copiedToken === f.compartirToken ? '#4CAF50' : theme.textSecondary }}>
                          <Iconify icon={copiedToken === f.compartirToken ? 'mdi:check' : 'mdi:link-variant'} width={20} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEliminar(f.idCuestionario)}
                          sx={{ color: '#F44336' }}>
                          <Iconify icon="mdi:delete-outline" width={20} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

      <Dialog open={crearOpen} onClose={() => setCrearOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Nuevo formulario</Typography>
          <TextField fullWidth label="Titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)}
            sx={{ mb: 2 }} autoFocus />
          <TextField fullWidth label="Descripcion (opcional)" value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)} multiline rows={2} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setCrearOpen(false)} sx={{ color: theme.textSecondary }}>Cancelar</Button>
            <Button variant="contained" onClick={handleCrear} disabled={creating || !titulo.trim()}
              sx={{ bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover } }}>
              {creating ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Crear'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
