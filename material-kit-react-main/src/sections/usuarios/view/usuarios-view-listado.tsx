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

import { useRouter } from 'src/routes/hooks';

import { useVistaLista } from 'src/hooks/use-vista-lista';
import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { VistaToggle } from 'src/components/vista-toggle/vista-toggle';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

interface Usuario {
  idUsuario: number;
  fechaCreacion: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipoUsuario: string;
  estatus: string;
}

interface OrdenamientoState {
  campo: string;
  direccion: 'ASC' | 'DESC' | '';
}

// ----------------------------------------------------------------------

export function UsuariosViewListado() {
  const router = useRouter();
  const theme = useDashboardTheme();
  const [vista, setVista] = useVistaLista('usuarios');

  // Estados principales
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const registrosPorPagina = 20;

  // Ordenamiento
  const [ordenamiento, setOrdenamiento] = useState<OrdenamientoState>({
    campo: '',
    direccion: '',
  });

  // Modal eliminar
  const [deleteModal, setDeleteModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal operación (activar/inactivar)
  const [operacionModal, setOperacionModal] = useState(false);
  const [operacionTipo, setOperacionTipo] = useState('');
  const [operacionUsuario, setOperacionUsuario] = useState<Usuario | null>(null);
  const [isOperando, setIsOperando] = useState(false);

  // Modal ayuda
  const [helpModal, setHelpModal] = useState(false);

  // Mensajes
  const [messageModal, setMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success');
  const [messageText, setMessageText] = useState('');

  // ----------------------------------------------------------------------
  // API CALLS
  // ----------------------------------------------------------------------

  const fetchUsuarios = useCallback(async (
    busqueda: string = '',
    pagina: number = 1,
    orden: OrdenamientoState = { campo: '', direccion: '' }
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Busqueda', busqueda);
      formData.append('Hoja', String(pagina - 1));
      formData.append('Ordenamiento', orden.campo);
      formData.append('ASC_DESC', orden.direccion);

      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.select.full.php`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.message === 'Good') {
        setUsuarios(result.information || []);
        setTotalRegistros(result.totalRegistro || 0);
      } else {
        console.error('Error en consulta:', result);
        setUsuarios([]);
        setMessageType('error');
        setMessageText('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo.');
        setMessageModal(true);
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      setUsuarios([]);
      setMessageType('error');
      setMessageText('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo.');
      setMessageModal(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUsuario = async (id: number) => {
    const formData = new FormData();
    formData.append('eliminar-id-administrador', String(id));
    
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.delete.php`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting usuario:', error);
      return { message: 'Error' };
    }
  };

  const cambiarEstatus = async (id: number, estatus: string) => {
    const formData = new FormData();
    formData.append('idUsuario', String(id));
    formData.append('estatus', estatus);
    
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.estatus.php`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error cambiando estatus:', error);
      return { message: 'Error' };
    }
  };

  // ----------------------------------------------------------------------
  // EFFECTS
  // ----------------------------------------------------------------------

  useEffect(() => {
    fetchUsuarios('', 1, { campo: '', direccion: '' });
  }, [fetchUsuarios]);

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  const handleSearch = () => {
    setPaginaActual(1);
    fetchUsuarios(searchTerm, 1, ordenamiento);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOrdenamiento = (campo: string) => {
    let nuevoOrden: OrdenamientoState;
    
    if (ordenamiento.campo !== campo) {
      nuevoOrden = { campo, direccion: 'ASC' };
    } else if (ordenamiento.direccion === 'ASC') {
      nuevoOrden = { campo, direccion: 'DESC' };
    } else if (ordenamiento.direccion === 'DESC') {
      nuevoOrden = { campo: '', direccion: '' };
    } else {
      nuevoOrden = { campo, direccion: 'ASC' };
    }
    
    setOrdenamiento(nuevoOrden);
    fetchUsuarios(searchTerm, paginaActual, nuevoOrden);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setPaginaActual(page);
    fetchUsuarios(searchTerm, page, ordenamiento);
  };

  // Navegación
  const handleCreate = () => {
    router.push('/usuarios/crear');
  };

  const handleEdit = (usuario: Usuario) => {
    router.push(`/usuarios/editar/${usuario.idUsuario}`);
  };

  // Eliminar
  const handleDeleteClick = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!usuarioToDelete) return;

    setIsDeleting(true);
    const result = await deleteUsuario(usuarioToDelete.idUsuario);
    setIsDeleting(false);

    if (result.message === 'Good') {
      setDeleteModal(false);
      setUsuarioToDelete(null);
      setMessageType('success');
      setMessageText('¡Operación exitosa!');
      setMessageModal(true);
      fetchUsuarios(searchTerm, paginaActual, ordenamiento);
    } else {
      setMessageType('error');
      setMessageText('¡Ups! Algo salió mal al eliminar. Intenta de nuevo.');
      setMessageModal(true);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal(false);
    setUsuarioToDelete(null);
  };

  // Operaciones de estatus
  const handleActivar = (usuario: Usuario) => {
    setOperacionUsuario(usuario);
    setOperacionTipo('ACTIVO');
    setOperacionModal(true);
  };

  const handleInactivar = (usuario: Usuario) => {
    setOperacionUsuario(usuario);
    setOperacionTipo('INACTIVO');
    setOperacionModal(true);
  };

  const handleConfirmOperacion = async () => {
    if (!operacionUsuario) return;

    setIsOperando(true);
    const result = await cambiarEstatus(operacionUsuario.idUsuario, operacionTipo);
    setIsOperando(false);

    if (result.message === 'Good') {
      setOperacionModal(false);
      setOperacionUsuario(null);
      setMessageType('success');
      setMessageText('¡Perfecto! Operación realizada correctamente.');
      setMessageModal(true);
      fetchUsuarios(searchTerm, paginaActual, ordenamiento);
    } else {
      setMessageType('error');
      setMessageText('¡Ups! Algo salió mal. Intenta de nuevo.');
      setMessageModal(true);
    }
  };

  const handleCancelOperacion = () => {
    setOperacionModal(false);
    setOperacionUsuario(null);
  };

  // ----------------------------------------------------------------------
  // RENDER HELPERS
  // ----------------------------------------------------------------------

  const getOrdenIcon = (campo: string) => {
    if (ordenamiento.campo !== campo) return null;
    return ordenamiento.direccion === 'ASC' ? '↑' : '↓';
  };

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case 'ACTIVO':
        return 'success';
      case 'INACTIVO':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '';
    const partes = fecha.split(' ');
    if (partes.length < 2) return fecha;
    const fechaPart = partes[0].split('-');
    const horaPart = partes[1].split(':');
    return `${fechaPart[2]}/${fechaPart[1]}/${fechaPart[0]} ${horaPart[0]}:${horaPart[1]}`;
  };

  const renderAcciones = (usuario: Usuario) => {
    const acciones = [];

    // Editar siempre disponible
    acciones.push(
      <IconButton
        key="edit"
        onClick={() => handleEdit(usuario)}
        sx={{
          bgcolor: theme.primary,
          color: theme.textOnPrimary,
          width: 44,
          height: 44,
          mr: 1,
          transition: 'background-color 0.3s ease',
          '&:hover': {
            bgcolor: theme.primaryHover,
          },
        }}
      >
        <Iconify icon={"mdi:pencil" as any} width={20} />
      </IconButton>
    );

    // Eliminar
    acciones.push(
      <IconButton
        key="eliminar"
        onClick={() => handleDeleteClick(usuario)}
        sx={{
          bgcolor: theme.primary,
          color: theme.textOnPrimary,
          width: 44,
          height: 44,
          transition: 'background-color 0.3s ease',
          '&:hover': {
            bgcolor: theme.primaryHover,
          },
        }}
      >
        <Iconify icon={"mdi:delete" as any} width={20} />
      </IconButton>
    );

    return acciones;
  };

  const getOperacionTexto = () => {
    switch (operacionTipo) {
      case 'ACTIVO':
        return '¿Estás seguro de activar usuario?';
      case 'INACTIVO':
        return '¿Estás seguro de inactivar usuario?';
      default:
        return '';
    }
  };

  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------

  return (
    <Box
      sx={{
        bgcolor: theme.bgPage,
        minHeight: '100vh',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: theme.bgOverlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} sx={{ color: theme.primary }} />
        </Box>
      )}

      {/* Header */}
      <Box sx={{ px: 3, pt: 3 }}>
        <ModuloHeader titulo="Usuarios" />
      </Box>

      {/* Header con botones */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          gap: 2,
        }}
      >
        {/* Botón Crear */}
        <Button
          variant="contained"
          startIcon={<Iconify icon={"mdi:plus" as any} />}
          onClick={handleCreate}
          sx={{
            bgcolor: theme.primary,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            transition: 'background-color 0.3s ease',
            '&:hover': {
              bgcolor: theme.primaryHover,
            },
          }}
        >
          Crear
        </Button>

        {/* Buscador */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.bgInput,
                transition: 'background-color 0.3s ease',
                '& fieldset': {
                  borderColor: theme.border,
                },
                '&:hover fieldset': {
                  borderColor: theme.primary,
                },
              },
              '& .MuiOutlinedInput-input': {
                color: theme.textPrimary,
              },
            }}
          />
          <IconButton
            onClick={handleSearch}
            sx={{
              bgcolor: theme.primary,
              color: theme.textOnPrimary,
              transition: 'background-color 0.3s ease',
              '&:hover': {
                bgcolor: theme.primaryHover,
              },
            }}
          >
            <Iconify icon={"mdi:magnify" as any} />
          </IconButton>
          <VistaToggle value={vista} onChange={setVista} />
        </Box>
      </Box>

      {/* Vista de Tarjetas */}
      {vista === 'tarjetas' && (
        <Box sx={{ px: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {usuarios.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: theme.textSecondary }}>No se encontraron registros</Typography>
            </Box>
          ) : (
            usuarios.map((usuario) => (
              <Card
                key={usuario.idUsuario}
                sx={{
                  flex: { xs: '1 1 100%', sm: '0 0 320px' },
                  maxWidth: { xs: '100%', sm: 320 },
                  bgcolor: theme.bgCard,
                  borderRadius: 2,
                  p: 2.5,
                  border: '1px solid',
                  borderColor: theme.border,
                  borderLeft: '4px solid #111A2E',
                  boxShadow: theme.shadow,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadowLight, borderLeftColor: theme.primary },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1.5 }}>
                  {usuario.nombre} {usuario.apellidos}
                </Typography>

                <Typography variant="caption" sx={{ color: theme.textMuted, display: 'block' }}>
                  Correo Electrónico
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: theme.textPrimary, mb: 1.5 }}>
                  {usuario.email}
                </Typography>

                <Typography variant="caption" sx={{ color: theme.textMuted, display: 'block' }}>
                  Tipo de socio
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textPrimary, mb: 1.5 }}>
                  {usuario.tipoUsuario}
                </Typography>

                <Typography variant="caption" sx={{ color: theme.textMuted, display: 'block' }}>
                  Fecha/Hora
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textPrimary, mb: 1.5 }}>
                  {formatFecha(usuario.fechaCreacion)}
                </Typography>

                <Chip
                  label={usuario.estatus}
                  color={getEstatusColor(usuario.estatus)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />

                <Box
                  sx={{
                    borderTop: `1px dashed ${theme.border}`,
                    mt: 2,
                    pt: 1.5,
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  {renderAcciones(usuario)}
                </Box>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Vista de Tabla */}
      {vista === 'tabla' && (
      <Box
        sx={{
          mx: 3,
          bgcolor: theme.bgCard,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.shadow,
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
              <TableCell
                sx={{
                  bgcolor: `${theme.bgTableHeader} !important`,
                  fontWeight: 600,
                  color: `${theme.textOnPrimary} !important`,
                  cursor: 'pointer',
                  borderTopLeftRadius: 12,
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() => handleOrdenamiento('fechaCreacion')}
              >
                Fecha {getOrdenIcon('fechaCreacion')}
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: `${theme.bgTableHeader} !important`,
                  fontWeight: 600,
                  color: `${theme.textOnPrimary} !important`,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() => handleOrdenamiento('nombre')}
              >
                Nombre {getOrdenIcon('nombre')}
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: `${theme.bgTableHeader} !important`,
                  fontWeight: 600,
                  color: `${theme.textOnPrimary} !important`,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() => handleOrdenamiento('apellidos')}
              >
                Apellidos {getOrdenIcon('apellidos')}
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: `${theme.bgTableHeader} !important`,
                  fontWeight: 600,
                  color: `${theme.textOnPrimary} !important`,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() => handleOrdenamiento('email')}
              >
                Correo electrónico {getOrdenIcon('email')}
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: `${theme.bgTableHeader} !important`,
                  fontWeight: 600,
                  color: `${theme.textOnPrimary} !important`,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() => handleOrdenamiento('tipoUsuario')}
              >
                Tipo de socio {getOrdenIcon('tipoUsuario')}
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: `${theme.bgTableHeader} !important`,
                  fontWeight: 600,
                  color: `${theme.textOnPrimary} !important`,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={() => handleOrdenamiento('estatus')}
              >
                Estatus {getOrdenIcon('estatus')}
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: `${theme.bgTableHeader} !important`, fontWeight: 600, color: `${theme.textOnPrimary} !important`, borderTopRightRadius: 12, transition: 'background-color 0.3s ease' }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, bgcolor: theme.bgCard, color: theme.textSecondary }}>
                  <Typography sx={{ color: theme.textSecondary }}>
                    No se encontraron registros
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario, index) => (
                <TableRow
                  key={usuario.idUsuario}
                  sx={{
                    bgcolor: index % 2 === 0 ? theme.bgTableRow : theme.bgTableRowAlt,
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      bgcolor: theme.bgTableRowHover,
                    },
                  }}
                >
                  <TableCell sx={{ color: theme.textPrimary, borderColor: theme.borderLight }}>{formatFecha(usuario.fechaCreacion)}</TableCell>
                  <TableCell sx={{ color: theme.textPrimary, borderColor: theme.borderLight }}>{usuario.nombre}</TableCell>
                  <TableCell sx={{ color: theme.textPrimary, borderColor: theme.borderLight }}>{usuario.apellidos}</TableCell>
                  <TableCell sx={{ color: theme.textPrimary, borderColor: theme.borderLight }}>{usuario.email}</TableCell>
                  <TableCell sx={{ color: theme.textPrimary, borderColor: theme.borderLight }}>{usuario.tipoUsuario}</TableCell>
                  <TableCell sx={{ borderColor: theme.borderLight }}>
                    <Chip
                      label={usuario.estatus}
                      color={getEstatusColor(usuario.estatus)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ borderColor: theme.borderLight }}>
                    {renderAcciones(usuario)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, pb: 3 }}>
          <Pagination
            count={totalPaginas}
            page={paginaActual}
            onChange={handlePageChange}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.textPrimary,
                borderColor: theme.border,
                '&:hover': {
                  bgcolor: theme.bgCardAlt,
                },
                '&.Mui-selected': {
                  bgcolor: theme.primary,
                  color: theme.textOnPrimary,
                  '&:hover': {
                    bgcolor: theme.primaryHover,
                  },
                },
              },
            }}
          />
        </Box>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Dialog
        open={deleteModal}
        onClose={isDeleting ? undefined : handleCancelDelete}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: theme.bgModal,
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                '0%': { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
                '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
              },
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {isDeleting ? (
            <Box sx={{ py: 3 }}>
              <CircularProgress size={60} sx={{ color: theme.error, mb: 3 }} />
              <Typography variant="h6" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                Eliminando usuario...
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: theme.errorLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <Iconify icon={"solar:trash-bin-trash-bold" as any} width={40} sx={{ color: theme.error }} />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: theme.textPrimary }}>
                ¿Eliminar Usuario?
              </Typography>

              <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 1 }}>
                ¿Estás seguro de que deseas eliminar el usuario
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: theme.error, mb: 3 }}>
                {`"${usuarioToDelete?.nombre ?? ''} ${usuarioToDelete?.apellidos ?? ''}"`}?
              </Typography>

              <Typography variant="body2" sx={{ color: theme.textMuted, mb: 4 }}>
                Esta acción no se puede deshacer
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelDelete}
                  fullWidth
                  sx={{
                    borderColor: theme.border,
                    color: theme.textSecondary,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: theme.textMuted,
                      bgcolor: theme.bgCardAlt,
                    },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirmDelete}
                  fullWidth
                  sx={{
                    bgcolor: theme.error,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#d32f2f',
                    },
                  }}
                >
                  Eliminar
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Operación */}
      <Dialog
        open={operacionModal}
        onClose={isOperando ? undefined : handleCancelOperacion}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: theme.bgModal,
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {isOperando ? (
            <Box sx={{ py: 3 }}>
              <CircularProgress size={60} sx={{ color: theme.isDark ? theme.accent : '#9333ea', mb: 3 }} />
              <Typography variant="h6" sx={{ color: theme.textSecondary, fontWeight: 500 }}>
                Procesando...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.textPrimary }}>
                {getOperacionTexto()}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelOperacion}
                  fullWidth
                  sx={{
                    borderColor: theme.border,
                    color: theme.textSecondary,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: theme.textMuted,
                      bgcolor: theme.bgCardAlt,
                    },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleConfirmOperacion}
                  fullWidth
                  sx={{
                    bgcolor: theme.isDark ? theme.accent : '#9333ea',
                    color: theme.isDark ? '#0a192f' : 'white',
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: theme.isDark ? theme.accentHover : '#7928ca',
                    },
                  }}
                >
                  Confirmar
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Botón flotante de ayuda */}
      <Box
        onClick={() => setHelpModal(true)}
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: theme.helpBg,
          border: `3px solid ${theme.helpBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: theme.shadowLight,
          transition: 'all 0.3s ease',
          zIndex: 1000,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <Iconify icon={"mdi:help" as any} width={32} sx={{ color: theme.helpIcon }} />
      </Box>

      {/* Modal de Ayuda */}
      <Dialog
        open={helpModal}
        onClose={() => setHelpModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: theme.bgModal,
            },
          },
        }}
      >
        <Box
          sx={{
            background: theme.isDark
              ? 'linear-gradient(135deg, #0d7377 0%, #14a3a8 100%)'
              : 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Iconify icon="material-symbols:help" width={40} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Ayuda sobre el Módulo de Usuarios
          </Typography>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.textPrimary }}>
            ¿Qué es un Usuario en el sistema?
          </Typography>
          <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 3, lineHeight: 1.8 }}>
            Un usuario es cualquier persona registrada que tiene acceso a la plataforma, ya sea como
            administrador, auditor u otro rol definido en el sistema.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.textPrimary }}>
            ¿Para qué sirve administrar Usuarios?
          </Typography>
          <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 3, lineHeight: 1.8 }}>
            Administrar usuarios permite controlar quién puede ingresar a la plataforma, asignar
            roles, gestionar permisos, y administrar el acceso a los diferentes módulos y servicios
            disponibles.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.textPrimary }}>
            ¿Qué información se necesita para crear un Usuario?
          </Typography>
          <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 3, lineHeight: 1.8 }}>
            Es necesario registrar un nombre de usuario único, una contraseña segura, nombre completo,
            correo electrónico y definir el tipo de usuario o rol que tendrá dentro del sistema.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            startIcon={<Iconify icon={"solar:play-circle-bold" as any} width={24} />}
            onClick={() => router.push('/ayuda/video-usuarios')}
            sx={{
              bgcolor: theme.isDark ? '#14a3a8' : '#00bcd4',
              py: 2,
              fontWeight: 600,
              borderRadius: 2,
              mb: 2,
              '&:hover': {
                bgcolor: theme.isDark ? '#0d7377' : '#0097a7',
              },
            }}
          >
            Ver video explicativo
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={() => setHelpModal(false)}
            sx={{
              bgcolor: theme.success,
              py: 2,
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            Entendido
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modal de Mensajes */}
      <Dialog
        open={messageModal}
        onClose={() => setMessageModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: theme.bgModal,
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: messageType === 'success'
                ? theme.successLight
                : messageType === 'error'
                  ? theme.errorLight
                  : theme.warningLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Iconify
              icon={
  (messageType === 'success'
    ? 'solar:check-circle-bold'
    : messageType === 'error'
      ? 'solar:close-circle-bold'
      : 'solar:danger-triangle-bold') as any
}
              width={40}
              sx={{
                color: messageType === 'success'
                  ? theme.success
                  : messageType === 'error'
                    ? theme.error
                    : theme.warning
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: theme.textPrimary }}>
            {messageType === 'success' ? '¡Éxito!' : messageType === 'error' ? 'Error' : 'Advertencia'}
          </Typography>

          <Typography variant="body1" sx={{ color: theme.textSecondary, mb: 4 }}>
            {messageText}
          </Typography>

          <Button
            variant="contained"
            onClick={() => setMessageModal(false)}
            fullWidth
            sx={{
              bgcolor: messageType === 'success'
                ? theme.success
                : messageType === 'error'
                  ? theme.error
                  : theme.warning,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                bgcolor: messageType === 'success'
                  ? '#388e3c'
                  : messageType === 'error'
                    ? '#d32f2f'
                    : '#f57c00',
              },
            }}
          >
            Entendido
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}