import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.php`;

interface FormularioAuditor {
  idCuestionario: number;
  titulo: string;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
  totalPreguntas: number;
  totalRespuestas: number;
  totalVisitas: number;
  clienteNombre: string;
  clienteApellidos: string;
  clienteEmail: string;
}

export function AuditorDashboardView() {
  const theme = useDashboardTheme();

  const [formularios, setFormularios] = useState<FormularioAuditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const token = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const d = await apiFetch<any>(`${API}?vista=todos`, { headers });
      if (d.success) setFormularios(d.formularios || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = formularios.filter((f) => {
    if (!filtro) return true;
    const q = filtro.toLowerCase();
    const nombre = `${f.clienteNombre || ''} ${f.clienteApellidos || ''}`.toLowerCase();
    return f.titulo.toLowerCase().includes(q) ||
      nombre.includes(q) ||
      (f.clienteEmail || '').toLowerCase().includes(q);
  });

  const totalClientes = new Set(formularios.map(f => f.clienteEmail)).size;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      <ModuloHeader titulo="Panel de Auditoria" subtitulo="Vista de solo lectura" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mt: 3, mb: 3 }}>
        {[
          { label: 'Clientes', value: totalClientes, icon: 'mdi:account-group-outline', color: theme.primary },
          { label: 'Formularios', value: formularios.length, icon: 'mdi:clipboard-list-outline', color: '#2196F3' },
          { label: 'Publicados', value: formularios.filter(f => f.estado === 'publicado').length, icon: 'mdi:check-circle-outline', color: '#4CAF50' },
          { label: 'Total respuestas', value: formularios.reduce((s, f) => s + Number(f.totalRespuestas || 0), 0), icon: 'mdi:message-reply-text-outline', color: '#FF9800' },
        ].map((s) => (
          <Card key={s.label} sx={{ p: 2, borderRadius: 2, textAlign: 'center', background: theme.bgCard, boxShadow: theme.shadow }}>
            <Iconify icon={s.icon} width={28} sx={{ color: s.color, mb: 0.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>{s.value}</Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>{s.label}</Typography>
          </Card>
        ))}
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Buscar por titulo o cliente..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" width={20} sx={{ color: theme.textMuted }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {filtered.length === 0 ? (
        <Card sx={{ p: 5, textAlign: 'center', background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
          <Iconify icon="mdi:clipboard-text-off-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
          <Typography sx={{ color: theme.textSecondary }}>
            {filtro ? 'No se encontraron formularios' : 'No hay formularios registrados'}
          </Typography>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Formulario</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Preguntas</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Visitas</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Respuestas</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.idCuestionario} hover sx={{ '&:hover': { bgcolor: theme.bgTableRowHover } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                        {`${f.clienteNombre || ''} ${f.clienteApellidos || ''}`.trim() || 'Sin nombre'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.textSecondary }}>{f.clienteEmail}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>{f.titulo}</Typography>
                      {f.descripcion && (
                        <Typography variant="caption" sx={{ color: theme.textSecondary }}>{f.descripcion.substring(0, 50)}</Typography>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}
    </Box>
  );
}
