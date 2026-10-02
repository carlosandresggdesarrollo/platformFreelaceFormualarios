import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Función para obtener información del usuario del localStorage
const getUserInfo = () => {
  try {
    const jsonInformacion = localStorage.getItem('JSON_INFORMACION');
    if (!jsonInformacion) {
      console.log('No hay JSON_INFORMACION en localStorage');
      return null;
    }

    // Decodificar de base64
    const decodedJson = atob(jsonInformacion);
    const userInfo = JSON.parse(decodedJson);

    console.log('Usuario logueado:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    return null;
  }
};

// Función para limpiar URLs de imágenes (quitar puerto si existe)
const cleanImageUrl = (url: string): string => {
  if (!url) return `${CONFIG.apiBase}/Modules/ModulesImage/usuarios.png`;

  try {
    // Si es una URL absoluta con protocolo
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      // Retornar solo el pathname (ruta relativa sin host ni puerto)
      return urlObj.pathname;
    }
    // Si ya es una ruta relativa, devolverla tal cual
    return url;
  } catch {
    // Si hay error parseando la URL, devolverla tal cual
    return url;
  }
};

// Función para actualizar la imagen del usuario en localStorage
const updateUserImageInStorage = (newImageUrl: string) => {
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      usuario.imagen = cleanImageUrl(newImageUrl);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      // Disparar evento para que otros componentes se actualicen
      window.dispatchEvent(new Event('storage'));
    }
  } catch (error) {
    console.error('Error updating user image in storage:', error);
  }
};

// ----------------------------------------------------------------------

export function PerfilView() {
  const router = useRouter();
  const themeColors = useDashboardTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del formulario
  const [idSeleccion, setIdSeleccion] = useState('');
  const [usuario, setUsuario] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [imagen, setImagen] = useState(`${CONFIG.apiBase}/Modules/ModulesImage/usuarios.png`);

  // Errores
  const [nombreError, setNombreError] = useState(false);
  const [apellidosError, setApellidosError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Mensajes
  const [messageModal, setMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success');
  const [messageText, setMessageText] = useState('');

  // Modal de cambio de contraseña
  const [passwordModal, setPasswordModal] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ----------------------------------------------------------------------
  // API CALLS
  // ----------------------------------------------------------------------

  const fetchPerfil = async () => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();
      const idUsuario = userInfo?.idUsuario || '';

      const formData = new FormData();
      formData.append('idUsuario', idUsuario);

      const response = await fetch(`${CONFIG.apiBase}/Modules/ModulePerfil/api/administrador.controller.select.full.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Perfil Response:', result);

      if (result.message === 'Good' && result.information?.length > 0) {
        const perfilData = result.information[0];
        setIdSeleccion(perfilData.idUsuario || '');
        setUsuario(perfilData.usuario || '');
        setNombre(perfilData.nombre || '');
        setApellidos(perfilData.apellidos || '');
        setEmail(perfilData.email || '');
        setTipoUsuario(perfilData.tipoUsuario || '');
        setImagen(cleanImageUrl(perfilData.imagen));
      } else {
        setMessageType('error');
        setMessageText('No se pudo cargar la información del perfil.');
        setMessageModal(true);
      }
    } catch (error) {
      console.error('Error fetching perfil:', error);
      setMessageType('error');
      setMessageText('Algo salió mal al cargar los datos.');
      setMessageModal(true);
    } finally {
      setLoading(false);
    }
  };

  const updatePerfil = async () => {
    const userInfo = getUserInfo();
    const idUsuario = userInfo?.idUsuario || '';

    const formData = new FormData();
    formData.append('txt_idSeleccion', idUsuario);
    formData.append('txt_nombre', nombre);
    formData.append('txt_apellido', apellidos);
    formData.append('txt_email', email);
    formData.append('txt_imagen', imagen);

    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModulePerfil/api/administrador.controller.update.php`, {
        method: 'POST',
        body: formData,
      });
      console.log(response)
      return await response.json();
    } catch (error) {
      console.error('Error updating perfil:', error);
      return { message: 'Error' };
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('imagen', file);

    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModulePerfil/api/administrador.controller.imagen.php`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      return { message: 'Error' };
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    const userInfo = getUserInfo();
    const idUsuario = userInfo?.idUsuario || '';

    const formData = new FormData();
    formData.append('txt_idUsuario', idUsuario);
    formData.append('txt_contrasenaActual', currentPass);
    formData.append('txt_contrasenaNueva', newPass);

    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModulePerfil/api/administrador.controller.password.php`, {
        method: 'POST',
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Error changing password:', error);
      return { message: 'Error' };
    }
  };

  // ----------------------------------------------------------------------
  // EFFECTS
  // ----------------------------------------------------------------------

  useEffect(() => {
    fetchPerfil();
  }, []);

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  const validarContrasena = (pass: string) => {
    const tieneMayusculas = /[A-Z]/.test(pass);
    const tieneMinusculas = /[a-z]/.test(pass);
    const tieneNumeros = /\d/.test(pass);
    return tieneMayusculas && tieneMinusculas && tieneNumeros;
  };

  const limpiarCaracteresEspeciales = (texto: string) => texto.replace(/['"`]/g, '');

  const handleSave = async () => {
    // Limpiar caracteres especiales
    const nombreLimpio = limpiarCaracteresEspeciales(nombre);
    const apellidosLimpio = limpiarCaracteresEspeciales(apellidos);
    const emailLimpio = limpiarCaracteresEspeciales(email);

    setNombre(nombreLimpio);
    setApellidos(apellidosLimpio);
    setEmail(emailLimpio);

    // Reset errores
    setNombreError(false);
    setApellidosError(false);
    setEmailError(false);

    // Validación campos obligatorios
    let hasError = false;

    if (!nombreLimpio) {
      setNombreError(true);
      hasError = true;
    }
    if (!apellidosLimpio) {
      setApellidosError(true);
      hasError = true;
    }
    if (!emailLimpio) {
      setEmailError(true);
      hasError = true;
    }

    if (hasError) {
      setMessageType('warning');
      setMessageText('Por favor, llena todos los campos obligatorios antes de continuar.');
      setMessageModal(true);
      return;
    }

    if (Number(idSeleccion) <= 0) {
      setMessageType('error');
      setMessageText('No se pudo identificar el usuario.');
      setMessageModal(true);
      return;
    }

    setIsSaving(true);

    const result = await updatePerfil();

    setIsSaving(false);
    console.log(result)
    if (result.message === 'Good') {
      setMessageType('success');
      setMessageText('Los datos de tu perfil fueron guardados correctamente.');
      setMessageModal(true);
    } else if (result.message === 'EMAIL REPETIDO') {
      setMessageType('warning');
      setMessageText('Ese correo ya está registrado. Intenta con uno diferente.');
      setMessageModal(true);
    } else {
      setMessageType('error');
      setMessageText('Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo en unos segundos.');
      setMessageModal(true);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'png' && extension !== 'jpg' && extension !== 'jpeg') {
      setMessageType('warning');
      setMessageText('Por favor, sube una imagen en formato PNG o JPG.');
      setMessageModal(true);
      return;
    }

    setIsUploadingImage(true);
    const result = await uploadImage(file);
    setIsUploadingImage(false);

    if (result.message === 'Good' && result.direccion) {
      const cleanedUrl = cleanImageUrl(result.direccion);
      setImagen(cleanedUrl);
      // Actualizar la imagen en localStorage para que se refleje en el header
      updateUserImageInStorage(cleanedUrl);
    } else {
      setMessageType('warning');
      setMessageText('Tuvimos un error al cargar la imagen. Verifica que el archivo sea válido.');
      setMessageModal(true);
    }

    // Limpiar el input para permitir subir la misma imagen otra vez
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = () => {
    setImagen(`${CONFIG.apiBase}/Modules/ModulesImage/usuarios.png`);
  };

  const handleMessageClose = () => {
    setMessageModal(false);
  };

  const handleOpenPasswordModal = () => {
    setContrasenaActual('');
    setContrasenaNueva('');
    setContrasenaConfirmar('');
    setPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModal(false);
    setContrasenaActual('');
    setContrasenaNueva('');
    setContrasenaConfirmar('');
  };

  const handleChangePassword = async () => {
    // Validaciones
    if (!contrasenaActual || !contrasenaNueva || !contrasenaConfirmar) {
      setMessageType('warning');
      setMessageText('Por favor, llena todos los campos.');
      setMessageModal(true);
      return;
    }

    if (contrasenaNueva !== contrasenaConfirmar) {
      setMessageType('warning');
      setMessageText('Las contraseñas nuevas no coinciden.');
      setMessageModal(true);
      return;
    }

    if (contrasenaNueva.length < 8 || contrasenaNueva.length > 100) {
      setMessageType('warning');
      setMessageText('La nueva contraseña debe tener entre 8 y 100 caracteres.');
      setMessageModal(true);
      return;
    }

    if (!validarContrasena(contrasenaNueva)) {
      setMessageType('warning');
      setMessageText('La nueva contraseña debe incluir al menos una letra mayúscula, una minúscula y un número.');
      setMessageModal(true);
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword(contrasenaActual, contrasenaNueva);
    setIsChangingPassword(false);

    if (result.message === 'Good') {
      setPasswordModal(false);
      setMessageType('success');
      setMessageText('Tu contraseña ha sido actualizada correctamente.');
      setMessageModal(true);
    } else if (result.message === 'CONTRASEÑA INCORRECTA') {
      setMessageType('error');
      setMessageText('La contraseña actual es incorrecta.');
      setMessageModal(true);
    } else {
      setMessageType('error');
      setMessageText('Ocurrió un error al cambiar la contraseña. Intenta de nuevo.');
      setMessageModal(true);
    }
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: themeColors.bgPage,
        minHeight: '100vh',
        animation: 'fadeIn 0.6s ease-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Loading overlay */}
      {(loading || isSaving || isUploadingImage) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Header azul con breadcrumb */}
      <Box
        sx={{
          bgcolor: themeColors.bgHeader,
          borderRadius: 1,
          px: 3,
          py: 2,
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" sx={{ color: themeColors.textOnPrimary, fontWeight: 600 }}>
          Perfil
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: themeColors.breadcrumbInactive,
              cursor: 'pointer',
              '&:hover': { color: themeColors.textOnPrimary }
            }}
            onClick={() => router.push('/')}
          >
            Inicio
          </Typography>
          <Typography variant="body2" sx={{ color: themeColors.breadcrumbSeparator }}>/</Typography>
          <Typography variant="body2" sx={{ color: themeColors.textOnPrimary }}>
            Perfil
          </Typography>
        </Box>
      </Box>

      {/* Botones superiores */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={<Iconify icon={"eva:save-fill" as any} />}
          sx={{
            bgcolor: '#1976D2',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 1,
            '&:hover': {
              bgcolor: '#1565C0',
            },
          }}
        >
          Guardar
        </Button>
        {/* Botón Domicilio - solo para clientes */}
        {tipoUsuario.toLowerCase() === 'cliente' && (
          <Button
            variant="contained"
            onClick={() => router.push('/domicilio')}
            startIcon={<Iconify icon={"solar:home-2-bold" as any} />}
            sx={{
              bgcolor: '#0097A7',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 1,
              '&:hover': {
                bgcolor: '#00838F',
              },
            }}
          >
            Domicilio
          </Button>
        )}
      </Box>

      {/* Formulario */}
      <Box
        sx={{
          bgcolor: themeColors.bgCard,
          borderRadius: 2,
          p: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Imagen de perfil */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#1976D2',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                },
              }}
              onClick={handleImageClick}
            >
              {imagen && (
                <img
                  src={imagen}
                  alt="Perfil"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `${CONFIG.apiBase}/Modules/ModulesImage/usuarios.png`;
                  }}
                />
              )}
            </Box>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/png,image/jpg,image/jpeg"
              style={{ display: 'none' }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleImageClick}
                startIcon={<Iconify icon={"solar:arrow-left-bold" as any} width={18} />}
              >
                Cargar
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={handleDeleteImage}
                startIcon={<Iconify icon={"solar:trash-bin-trash-bold" as any} width={18} />}
              >
                Eliminar
              </Button>
            </Box>
          </Box>

          {/* Campos del formulario */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
            {/* Usuario (solo lectura) */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: themeColors.textPrimary }}>
                Usuario
              </Typography>
              <TextField
                fullWidth
                placeholder="Usuario"
                value={usuario}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: themeColors.bgCardAlt,
                  },
                }}
              />
            </Box>

            {/* Contraseña */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: themeColors.textPrimary }}>
                Contraseña
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="••••••••"
                  value="••••••••"
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: themeColors.bgCardAlt,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleOpenPasswordModal}
                  startIcon={<Iconify
                            icon={"solar:lock-password-bold" as any}
                            sx={{ width: 20, height: 20 }}
                          />}
                  sx={{
                    bgcolor: '#1976D2',
                    minWidth: 180,
                    py: 1.8,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: '#1565C0',
                    },
                  }}
                >
                  Cambiar
                </Button>
              </Box>
            </Box>

            {/* Nombre */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: themeColors.textPrimary }}>
                Nombre <span style={{ color: '#E91E63' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setNombreError(false);
                }}
                error={nombreError}
                helperText={nombreError ? 'Este campo es obligatorio' : ''}
                inputProps={{ maxLength: 195 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 2px 12px rgba(25, 118, 210, 0.3)',
                    },
                  },
                }}
              />
            </Box>

            {/* Apellidos */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: themeColors.textPrimary }}>
                Apellido <span style={{ color: '#E91E63' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Apellidos"
                value={apellidos}
                onChange={(e) => {
                  setApellidos(e.target.value);
                  setApellidosError(false);
                }}
                error={apellidosError}
                helperText={apellidosError ? 'Este campo es obligatorio' : ''}
                inputProps={{ maxLength: 195 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 2px 12px rgba(25, 118, 210, 0.3)',
                    },
                  },
                }}
              />
            </Box>

            {/* Email */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: themeColors.textPrimary }}>
                Correo electrónico <span style={{ color: '#E91E63' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                error={emailError}
                helperText={emailError ? 'Este campo es obligatorio' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 2px 12px rgba(25, 118, 210, 0.3)',
                    },
                  },
                }}
              />
            </Box>

            {/* Tipo de usuario (solo lectura) */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: themeColors.textPrimary }}>
                Tipo de usuario
              </Typography>
              <TextField
                fullWidth
                placeholder="Tipo de usuario"
                value={tipoUsuario}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: themeColors.bgCardAlt,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modal de Mensajes */}
      <Dialog
        open={messageModal}
        onClose={handleMessageClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: themeColors.bgModal,
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
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: messageType === 'success'
                ? 'rgba(76, 175, 80, 0.1)'
                : messageType === 'error'
                  ? 'rgba(244, 67, 54, 0.1)'
                  : 'rgba(255, 152, 0, 0.1)',
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
                  ? '#4caf50'
                  : messageType === 'error'
                    ? '#f44336'
                    : '#ff9800'
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: themeColors.textPrimary }}>
            {messageType === 'success' ? 'Perfecto' : messageType === 'error' ? 'Error' : 'Advertencia'}
          </Typography>

          <Typography variant="body1" sx={{ color: themeColors.textSecondary, mb: 4 }}>
            {messageText}
          </Typography>

          <Button
            variant="contained"
            onClick={handleMessageClose}
            fullWidth
            sx={{
              bgcolor: messageType === 'success'
                ? '#4caf50'
                : messageType === 'error'
                  ? '#f44336'
                  : '#ff9800',
              py: 1.5,
              fontSize: '1rem',
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

      {/* Modal de Cambio de Contraseña */}
      <Dialog
        open={passwordModal}
        onClose={handleClosePasswordModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: themeColors.bgModal,
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                '0%': { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
                '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
              },
            },
          },
        }}
      >
        <DialogContent sx={{ py: 4, px: 3 }}>
          {isChangingPassword && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: themeColors.overlayBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Iconify icon={"solar:lock-password-bold" as any} width={30} sx={{ color: '#1976D2' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: themeColors.textPrimary }}>
              Cambiar Contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: themeColors.textSecondary, mt: 1 }}>
              Ingresa tu contraseña actual y la nueva contraseña
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              type="password"
              label="Contraseña Actual"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Nueva Contraseña"
              value={contrasenaNueva}
              onChange={(e) => setContrasenaNueva(e.target.value)}
              helperText="Mínimo 8 caracteres, incluir mayúscula, minúscula y número"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirmar Nueva Contraseña"
              value={contrasenaConfirmar}
              onChange={(e) => setContrasenaConfirmar(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleClosePasswordModal}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                borderColor: themeColors.borderColor,
                color: themeColors.textSecondary,
                '&:hover': {
                  borderColor: themeColors.borderColorHover,
                  bgcolor: themeColors.bgCardAlt,
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              fullWidth
              disabled={isChangingPassword}
              sx={{
                py: 1.5,
                borderRadius: 1,
                bgcolor: '#1976D2',
                '&:hover': {
                  bgcolor: '#1565C0',
                },
              }}
            >
              Cambiar Contraseña
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
