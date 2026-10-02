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
import Pagination from '@mui/material/Pagination';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

const ADMIN_API = `${CONFIG.apiBase}/Modules/ModuleClienteDashboard/api/administrador.controller.admin.clientes.php`;

interface Cliente {
  idUsuario: number;
  fechaCreacion: string;
  nombre: string;
  apellidos: string;
  email: string;
  usuario: string;
  tipoUsuario: string;
  estatus: string;
  totalLogins: string;
  ultimoLogin: string | null;
}

interface LoginHistorial {
  ip: string;
  navegador: string;
  dispositivo: string;
  sistemaOperativo: string;
  fechaLogin: string;
}

export function ClientesViewListado() {
  const theme = useDashboardTheme();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [allClientes, setAllClientes] = useState<Cliente[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 20;

  const [operacionModal, setOperacionModal] = useState(false);
  const [operacionTipo, setOperacionTipo] = useState('');
  const [operacionCliente, setOperacionCliente] = useState<Cliente | null>(null);
  const [isOperando, setIsOperando] = useState(false);

  const [historialModal, setHistorialModal] = useState(false);
  const [historialCliente, setHistorialCliente] = useState<Cliente | null>(null);
  const [historialData, setHistorialData] = useState<LoginHistorial[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [messageModal, setMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [messageText, setMessageText] = useState('');

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const result = await apiFetch(`${ADMIN_API}?vista=lista`, { headers });

      if (result.success) {
        const lista: Cliente[] = (result as any).clientes || [];
        setAllClientes(lista);
        setClientes(lista);
        setResumen((result as any).resumen || null);
      } else {
        setClientes([]);
        setAllClientes([]);
      }
    } catch {
      setClientes([]);
      setAllClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistorial = async (idUsuario: number) => {
    setLoadingHistorial(true);
    try {
      const token = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await apiFetch(`${ADMIN_API}?vista=historial&id=${idUsuario}`, { headers });
      if (res.success) setHistorialData((res as any).historial || []);
    } catch {
      setHistorialData([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const cambiarEstatus = async (id: number, estatus: string) => {
    const formData = new FormData();
    formData.append('idUsuario', String(id));
    formData.append('estatus', estatus);
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.estatus.php`, {
        method: 'POST', body: formData,
      });
      return await response.json();
    } catch {
      return { message: 'Error' };
    }
  };

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleSearch = () => {
    setPaginaActual(1);
    if (!searchTerm.trim()) {
      setClientes(allClientes);
      return;
    }
    const term = searchTerm.toLowerCase();
    setClientes(allClientes.filter((c) =>
      `${c.nombre} ${c.apellidos}`.toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.usuario || '').toLowerCase().includes(term)
    ));
  };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const handleOpenOperacion = (cliente: Cliente, tipo: string) => {
    setOperacionCliente(cliente); setOperacionTipo(tipo); setOperacionModal(true);
  };

  const handleOpenHistorial = (cliente: Cliente) => {
    setHistorialCliente(cliente);
    setHistorialModal(true);
    fetchHistorial(cliente.idUsuario);
  };

  const handleConfirmOperacion = async () => {
    if (!operacionCliente) return;
    setIsOperando(true);
    const nuevoEstatus = operacionTipo === 'activar' ? 'ACTIVO' : 'INACTIVO';
    const result = await cambiarEstatus(operacionCliente.idUsuario, nuevoEstatus);
    setOperacionModal(false);
    setIsOperando(false);
    if (result.message === 'Good') {
      setMessageType('success');
      setMessageText(`Cliente ${operacionTipo === 'activar' ? 'activado' : 'inactivado'} correctamente`);
      fetchClientes();
    } else {
      setMessageType('error');
      setMessageText('Error al cambiar el estatus');
    }
    setMessageModal(true);
  };

  const totalPages = Math.ceil(clientes.length / registrosPorPagina);
  const clientesPagina = clientes.slice((paginaActual - 1) * registrosPorPagina, paginaActual * registrosPorPagina);

  const getEstatusColor = (estatus: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    switch (estatus?.toUpperCase()) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'error';
      case 'CONFIRMADA': return 'info';
      case 'PENDIENTE': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <ModuloHeader titulo="Clientes" subtitulo="Usuarios registrados como clientes en la plataforma" />

      {/* Search */}
      <Card sx={{ p: 2, mb: 3, mt: 3, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField fullWidth size="small" placeholder="Buscar por nombre, apellido o correo..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: <Iconify icon="mdi:magnify" width={20} sx={{ color: theme.textMuted, mr: 1 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5, bgcolor: theme.bgInput,
                '& fieldset': { borderColor: theme.border },
                '&:hover fieldset': { borderColor: theme.primary },
              },
            }}
          />
          <Button variant="contained" onClick={handleSearch} sx={{
            px: 3, borderRadius: 1.5, bgcolor: theme.primary, fontWeight: 600,
            '&:hover': { bgcolor: theme.primaryHover },
          }}>
            Buscar
          </Button>
        </Box>
      </Card>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: clientes.length, icon: 'mdi:account-group', color: theme.primary },
          { label: 'Activos', count: clientes.filter((c) => c.estatus?.toUpperCase() === 'ACTIVO').length, icon: 'mdi:check-circle', color: '#4CAF50' },
          { label: 'Inactivos', count: clientes.filter((c) => c.estatus?.toUpperCase() === 'INACTIVO').length, icon: 'mdi:close-circle', color: '#F44336' },
          { label: 'Logins hoy', count: resumen?.hoy ?? '-', icon: 'mdi:login-variant', color: '#9333ea' },
          { label: 'Logins semana', count: resumen?.semana ?? '-', icon: 'mdi:calendar-week', color: '#2196F3' },
          { label: 'Logins total', count: resumen?.total ?? '-', icon: 'mdi:chart-line', color: '#FF9800' },
        ].map((stat) => (
          <Card key={stat.label} sx={{
            flex: '1 1 130px', p: 2, borderRadius: 2, textAlign: 'center',
            background: theme.bgCard, boxShadow: theme.shadow,
          }}>
            <Iconify icon={stat.icon} width={28} sx={{ color: stat.color, mb: 0.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>{stat.count}</Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>{stat.label}</Typography>
          </Card>
        ))}
      </Box>

      {/* Table */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: theme.primary }} />
          </Box>
        ) : clientes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Iconify icon="mdi:account-off-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
            <Typography sx={{ color: theme.textSecondary }}>No se encontraron clientes</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Correo</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Estatus</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Logins</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Ultimo acceso</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientesPagina.map((cliente) => {
                    const estatusUpper = cliente.estatus?.toUpperCase() || '';
                    return (
                      <TableRow key={cliente.idUsuario} hover sx={{
                        '&:hover': { bgcolor: theme.bgTableRowHover },
                        transition: 'background 0.15s',
                      }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                            {cliente.nombre} {cliente.apellidos}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                            @{cliente.usuario}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: theme.textPrimary }}>{cliente.email}</TableCell>
                        <TableCell>
                          <Chip label={estatusUpper} color={getEstatusColor(estatusUpper)}
                            size="small" sx={{ fontWeight: 600, minWidth: 90 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.primary }}>
                            {cliente.totalLogins || '0'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ color: theme.textSecondary, whiteSpace: 'nowrap' }}>
                          {cliente.ultimoLogin
                            ? new Date(cliente.ultimoLogin).toLocaleString('es-MX')
                            : 'Nunca'
                          }
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleOpenHistorial(cliente)}
                              sx={{ color: '#2196F3', '&:hover': { bgcolor: 'rgba(33,150,243,0.1)' } }}
                              title="Ver historial de sesiones">
                              <Iconify icon="mdi:history" width={20} />
                            </IconButton>
                            {estatusUpper !== 'ACTIVO' && (
                              <IconButton size="small" onClick={() => handleOpenOperacion(cliente, 'activar')}
                                sx={{ color: '#4CAF50', '&:hover': { bgcolor: 'rgba(76,175,80,0.1)' } }}
                                title="Activar cliente">
                                <Iconify icon="mdi:check-circle-outline" width={20} />
                              </IconButton>
                            )}
                            {estatusUpper === 'ACTIVO' && (
                              <IconButton size="small" onClick={() => handleOpenOperacion(cliente, 'inactivar')}
                                sx={{ color: '#F44336', '&:hover': { bgcolor: 'rgba(244,67,54,0.1)' } }}
                                title="Inactivar cliente">
                                <Iconify icon="mdi:close-circle-outline" width={20} />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Pagination count={totalPages} page={paginaActual}
                  onChange={(_, p) => setPaginaActual(p)}
                  color="primary" />
              </Box>
            )}
          </>
        )}
      </Card>

      {/* Login History Modal */}
      <Dialog open={historialModal} onClose={() => setHistorialModal(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgCard } }}>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Iconify icon="mdi:history" width={28} sx={{ color: theme.primary }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
                Historial de sesiones
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                {historialCliente ? `${historialCliente.nombre} ${historialCliente.apellidos}` : ''}
              </Typography>
            </Box>
          </Box>

          {loadingHistorial ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} sx={{ color: theme.primary }} />
            </Box>
          ) : historialData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ color: theme.textSecondary }}>Sin registros de sesion</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>IP</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Navegador</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Dispositivo</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>S.O.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historialData.map((h, i) => (
                    <TableRow key={i} sx={{ '&:hover': { bgcolor: theme.bgTableRowHover } }}>
                      <TableCell sx={{ color: theme.textPrimary, whiteSpace: 'nowrap' }}>
                        {new Date(h.fechaLogin).toLocaleString('es-MX')}
                      </TableCell>
                      <TableCell>
                        <Chip label={h.ip || 'N/A'} size="small"
                          sx={{ fontFamily: 'monospace', fontWeight: 600, bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3' }} />
                      </TableCell>
                      <TableCell sx={{ color: theme.textSecondary }}>{h.navegador || '-'}</TableCell>
                      <TableCell sx={{ color: theme.textSecondary }}>{h.dispositivo || '-'}</TableCell>
                      <TableCell sx={{ color: theme.textSecondary }}>{h.sistemaOperativo || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button onClick={() => setHistorialModal(false)} sx={{ color: theme.textSecondary }}>Cerrar</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Confirm operation modal */}
      <Dialog open={operacionModal} onClose={() => setOperacionModal(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgCard } }}>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 2,
            bgcolor: operacionTipo === 'activar' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Iconify
              icon={operacionTipo === 'activar' ? 'mdi:check-circle-outline' : 'mdi:close-circle-outline'}
              width={32} sx={{ color: operacionTipo === 'activar' ? '#4CAF50' : '#F44336' }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.textPrimary }}>
            {operacionTipo === 'activar' ? 'Activar' : 'Inactivar'} cliente
          </Typography>
          <Typography sx={{ color: theme.textSecondary, mb: 3 }}>
            {operacionCliente ? `${operacionCliente.nombre} ${operacionCliente.apellidos}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => setOperacionModal(false)} disabled={isOperando}
              sx={{ borderRadius: 2, fontWeight: 600, borderColor: theme.border, color: theme.textSecondary }}>
              Cancelar
            </Button>
            <Button fullWidth variant="contained" onClick={handleConfirmOperacion} disabled={isOperando}
              sx={{
                borderRadius: 2, fontWeight: 600,
                bgcolor: operacionTipo === 'activar' ? '#4CAF50' : '#F44336',
                '&:hover': { bgcolor: operacionTipo === 'activar' ? '#388E3C' : '#D32F2F' },
              }}>
              {isOperando ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Confirmar'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Message modal */}
      <Dialog open={messageModal} onClose={() => setMessageModal(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgCard } }}>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 2,
            bgcolor: messageType === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Iconify
              icon={messageType === 'success' ? 'mdi:check-circle-outline' : 'mdi:alert-circle-outline'}
              width={32} sx={{ color: messageType === 'success' ? '#4CAF50' : '#F44336' }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: theme.textPrimary }}>
            {messageType === 'success' ? 'Exito' : 'Error'}
          </Typography>
          <Typography sx={{ color: theme.textSecondary, mb: 3 }}>{messageText}</Typography>
          <Button fullWidth variant="contained" onClick={() => setMessageModal(false)}
            sx={{ borderRadius: 2, fontWeight: 600, bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover } }}>
            Aceptar
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
