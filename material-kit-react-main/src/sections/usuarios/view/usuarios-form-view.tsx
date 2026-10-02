import { useParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { useThemeMode } from 'src/theme/theme-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Función para limpiar URLs de imágenes (quitar puerto si existe)
const cleanImageUrl = (url: string): string => {
  if (!url) return `${CONFIG.apiBase}/Modules/ModulesImage/cliente.png`;

  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }
    return url;
  } catch {
    return url;
  }
};

// ----------------------------------------------------------------------

export function UsuariosFormView() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params.id;

  const { mode } = useThemeMode();

  // Colores del tema (GitHub-style dark)
  const colors = {
    bg: mode === 'dark' ? '#0d1117' : '#ffffff',
    paper: mode === 'dark' ? '#161b22' : 'white',
    paperHover: mode === 'dark' ? '#21262d' : '#f5f5f5',
    border: mode === 'dark' ? '#30363d' : 'rgba(0,0,0,0.1)',
    text: mode === 'dark' ? '#e6edf3' : '#333',
    textSecondary: mode === 'dark' ? '#8b949e' : '#666',
    inputBg: mode === 'dark' ? '#21262d' : '#fafafa',
    inputBgHover: mode === 'dark' ? '#30363d' : '#f5f5f5',
    inputBgFocus: mode === 'dark' ? '#161b22' : 'white',
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados del formulario
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('ADMINISTRADOR');
  const [imagen, setImagen] = useState('/assets/images/avatar/avatar-25.webp');

  // Errores
  const [usuarioError, setUsuarioError] = useState(false);
  const [contrasenaError, setContrasenaError] = useState(false);
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
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profesion, setProfesion] = useState('');

  const tiposUsuario = [
    { value: 'ADMINISTRADOR', label: 'ADMINISTRADOR' },
    { value: 'AUDITOR', label: 'AUDITOR' },
  ];

  // ----------------------------------------------------------------------
  // API CALLS
  // ----------------------------------------------------------------------

  const fetchUsuarioById = async (id: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', id);

      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.select.one.php`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.message === 'Good' && result.information?.length > 0) {
        const usuarioData = result.information[0];
        setUsuario(usuarioData.usuario || '');
        setContrasena(usuarioData.contrasena || '');
        setNombre(usuarioData.nombre || '');
        setApellidos(usuarioData.apellidos || '');
        setEmail(usuarioData.email || '');
        setTipoUsuario(usuarioData.tipoUsuario || 'ADMINISTRADOR');
        setProfesion(usuarioData.profesion || '');
        setImagen(cleanImageUrl(usuarioData.imagen));
      } else {
        setMessageType('error');
        setMessageText('No se pudo cargar la información del usuario.');
        setMessageModal(true);
      }
    } catch (error) {
      console.error('Error fetching usuario:', error);
      setMessageType('error');
      setMessageText('¡Ups! Algo salió mal al cargar los datos.');
      setMessageModal(true);
    } finally {
      setLoading(false);
    }
  };

  const createUsuario = async () => {
    const formData = new FormData();
    formData.append('txt_idUsuario', '0');
    formData.append('txt_usuario', usuario);
    formData.append('txt_contrasena', contrasena);
    formData.append('txt_nombre', nombre);
    formData.append('txt_apellidos', apellidos);
    formData.append('txt_email', email);
    formData.append('cb_tipoUsuario', tipoUsuario);
    formData.append('txt_profesion', profesion);
    formData.append('txt_imagen', imagen);

    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.create.php`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating usuario:', error);
      return { message: 'Error' };
    }
  };

  const updateUsuario = async () => {
    const formData = new FormData();
    formData.append('txt_idUsuario', params.id || '');
    formData.append('txt_usuario', usuario); 
    formData.append('txt_nombre', nombre);
    formData.append('txt_apellidos', apellidos);
    formData.append('txt_email', email);
    formData.append('cb_tipoUsuario', tipoUsuario);
    formData.append('txt_profesion', profesion);
    formData.append('txt_imagen', imagen);

    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.update.php`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error updating usuario:', error);
      return { message: 'Error' };
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('imagen', file);
    
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.create.imagen.php`, {
        method: 'POST',
        body: formData,
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      return { message: 'Error' };
    }
  };

  const changePassword = async (newPass: string) => {
    const formData = new FormData();
    formData.append('txt_idUsuario', params.id || '');
    formData.append('txt_contrasenaNueva', newPass);

    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleUsersUsers/api/administrador.controller.password.php`, {
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
    if (isEdit && params.id) {
      fetchUsuarioById(params.id);
    }
  }, [isEdit, params.id]);

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  const validarContrasena = (pass: string) => {
    const tieneMayusculas = /[A-Z]/.test(pass);
    const tieneMinusculas = /[a-z]/.test(pass);
    const tieneNumeros = /\d/.test(pass);
    return tieneMayusculas && tieneMinusculas && tieneNumeros;
  };

const limpiarCaracteresEspeciales = (texto: string) => texto.replace(/['"`]/g, '');;

  const handleSave = async () => {
    // Limpiar caracteres especiales
    const usuarioLimpio = limpiarCaracteresEspeciales(usuario).replace(/ /g, '');
    const nombreLimpio = limpiarCaracteresEspeciales(nombre);
    const apellidosLimpio = limpiarCaracteresEspeciales(apellidos);
    const contrasenaLimpia = limpiarCaracteresEspeciales(contrasena);
    const emailLimpio = limpiarCaracteresEspeciales(email);

    setUsuario(usuarioLimpio);
    setNombre(nombreLimpio);
    setApellidos(apellidosLimpio);
    setContrasena(contrasenaLimpia);
    setEmail(emailLimpio);

    // Reset errores
    setUsuarioError(false);
    setContrasenaError(false);
    setNombreError(false);
    setApellidosError(false);
    setEmailError(false);

    // Validación campos obligatorios
    let hasError = false;

    if (!usuarioLimpio) {
      setUsuarioError(true);
      hasError = true;
    }
    if (!contrasenaLimpia) {
      setContrasenaError(true);
      hasError = true;
    }
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
      setMessageText('¡Favor de capturar los campos obligatorios!');
      setMessageModal(true);
      return;
    }

    // Validación email con @
    if (!emailLimpio.includes('@')) {
      setMessageType('warning');
      setMessageText('¡Correo electrónico no adecuado!');
      setMessageModal(true);
      return;
    }

    // Validación longitud contraseña
    if (contrasenaLimpia.length < 8 || contrasenaLimpia.length > 100) {
      setMessageType('warning');
      setMessageText('¡Contraseña debe de contener más de 8 caracteres y menos de 100!');
      setMessageModal(true);
      return;
    }

    // Validación formato contraseña
    if (!validarContrasena(contrasenaLimpia)) {
      setMessageType('warning');
      setMessageText('¡Contraseña debe de contener al menos una letra mayúscula, una letra minúscula y un número!');
      setMessageModal(true);
      return;
    }

    setIsSaving(true);
    
    const result = isEdit ? await updateUsuario() : await createUsuario();
    
    setIsSaving(false);

    if (result.message === 'Good') {
      setMessageType('success');
      setMessageText('¡Operación exitosa!');
      setMessageModal(true);
    } else if (result.message === 'USUARIO REPETIDO') {
      setMessageType('warning');
      setMessageText('¡El usuario se encuentra en uso!');
      setMessageModal(true);
    } else if (result.message === 'CORREO REPETIDO') {
      setMessageType('warning');
      setMessageText('¡El correo se encuentra en uso!');
      setMessageModal(true);
    } else {
      setMessageType('error');
      setMessageText('¡Ups! Algo salió mal. El sistema no pudo completar la acción. Intenta de nuevo en unos segundos o avísanos si el problema sigue.');
      setMessageModal(true);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const result = await uploadImage(file);
    setIsUploadingImage(false);

    if (result.message === 'Good' && result.direccion) {
      // Actualizar directamente el HTML del div como jQuery
      const divImagen = document.getElementById('update-imagen-perfil-div-administrador');
      if (divImagen) {
        divImagen.innerHTML = `<img class="imagen-fluid img-circle elevation-2" style="width:100%;height:100%;object-fit:cover;" src="${result.direccion}">`;
      }
      // También guardar en estado para el formulario
      setImagen(result.direccion);
    } else {
      setMessageType('warning');
      setMessageText('Ups... no pudimos cargar la imagen. Inténtalo de nuevo.');
      setMessageModal(true);
    }
    
    // Limpiar el input para permitir subir la misma imagen otra vez
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = () => {
    setImagen(`${CONFIG.apiBase}/Modules/ModulesImage/cliente.png`);
  };

  const handleBack = () => {
    router.push('/usuarios');
  };

  const handleMessageClose = () => {
    setMessageModal(false);
    if (messageType === 'success') {
      router.push('/usuarios');
    }
  };

  // Handlers de cambio de contraseña
  const handleOpenPasswordModal = () => {
    setContrasenaNueva('');
    setContrasenaConfirmar('');
    setPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setPasswordModal(false);
    setContrasenaNueva('');
    setContrasenaConfirmar('');
  };

  const handleChangePassword = async () => {
    if (!contrasenaNueva || !contrasenaConfirmar) {
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
    const result = await changePassword(contrasenaNueva);
    setIsChangingPassword(false);

    if (result.message === 'Good') {
      setPasswordModal(false);
      setContrasena(contrasenaNueva);
      setMessageType('success');
      setMessageText('La contraseña ha sido actualizada correctamente.');
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
        bgcolor: colors.bg,
        minHeight: '100vh',
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

      {/* Header */}
      <Box
        sx={{
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          px: 3,
          py: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => router.push('/usuarios')}
        >
          Usuarios
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          /
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {isEdit ? 'Editar' : 'Crear'}
        </Typography>
      </Box>

      {/* Botones superiores */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon={"mdi:content-save" as any} />}
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            bgcolor: '#58a6ff',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#4c9aed',
            },
          }}
        >
          Guardar
        </Button>
        <Button
          variant="contained"
          startIcon={<Iconify icon={"mdi:arrow-left" as any} />}
          onClick={handleBack}
          sx={{
            bgcolor: '#757575',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#616161',
            },
          }}
        >
          Regresar
        </Button>
      </Box>

      {/* Formulario */}
      <Box
        sx={{
          bgcolor: colors.paper,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header del formulario */}
        <Box
          sx={{
            bgcolor: mode === 'dark' ? '#21262d' : '#f6f8fa',
            color: colors.text,
            px: 3,
            py: 2,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Datos del Usuario
          </Typography>
        </Box>

        {/* Contenido del formulario */}
        <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Imagen de perfil */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box
              id="update-imagen-perfil-div-administrador"
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#9333ea',
                  boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)',
                },
              }}
              onClick={handleImageClick}
            >
              {imagen && (
                <img
                  src={imagen}
                  alt="Perfil"
                  className="imagen-fluid img-circle elevation-2"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/avatar/avatar-25.webp';
                  }}
                />
              )}
            </Box>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleImageClick}
                startIcon={<Iconify icon={"solar:cart-3-bold" as any} width={18} />}
              >
                Cambiar
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
            {/* Usuario */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                Usuario <span style={{ color: '#f85149' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                  setUsuarioError(false);
                }}
                error={usuarioError}
                helperText={usuarioError ? 'Este campo es obligatorio' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.inputBg,
                    '&:hover': {
                      bgcolor: colors.inputBgHover,
                    },
                    '&.Mui-focused': {
                      bgcolor: colors.inputBgFocus,
                    },
                  },
                }}
              />
            </Box>

            {/* Contraseña */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                Contraseña {!isEdit && <span style={{ color: '#f85149' }}>*</span>}
              </Typography>
              {isEdit ? (
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
                        bgcolor: colors.inputBgHover,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleOpenPasswordModal}
                    startIcon={<Iconify  icon={"solar:lock-password-bold" as any} width={20} />}
                    sx={{
                      bgcolor: '#9333ea',
                      minWidth: 180,
                      py: 1.8,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#7928ca',
                      },
                    }}
                  >
                    Cambiar
                  </Button>
                </Box>
              ) : (
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Contraseña"
                  value={contrasena}
                  onChange={(e) => {
                    setContrasena(e.target.value);
                    setContrasenaError(false);
                  }}
                  error={contrasenaError}
                  helperText={contrasenaError ? 'Este campo es obligatorio' : 'Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: colors.inputBg,
                      '&:hover': {
                        bgcolor: colors.inputBgHover,
                      },
                      '&.Mui-focused': {
                        bgcolor: colors.inputBgFocus,
                      },
                    },
                  }}
                />
              )}
            </Box>

            {/* Nombre */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                Nombre <span style={{ color: '#f85149' }}>*</span>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.inputBg,
                    '&:hover': {
                      bgcolor: colors.inputBgHover,
                    },
                    '&.Mui-focused': {
                      bgcolor: colors.inputBgFocus,
                    },
                  },
                }}
              />
            </Box>

            {/* Apellidos */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                Apellidos <span style={{ color: '#f85149' }}>*</span>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.inputBg,
                    '&:hover': {
                      bgcolor: colors.inputBgHover,
                    },
                    '&.Mui-focused': {
                      bgcolor: colors.inputBgFocus,
                    },
                  },
                }}
              />
            </Box>

            {/* Email */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                Correo Electrónico <span style={{ color: '#f85149' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                error={emailError}
                helperText={emailError ? 'Este campo es obligatorio' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.inputBg,
                    '&:hover': {
                      bgcolor: colors.inputBgHover,
                    },
                    '&.Mui-focused': {
                      bgcolor: colors.inputBgFocus,
                    },
                  },
                }}
              />
            </Box>

            {/* Tipo de usuario */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                Tipo de usuario <span style={{ color: '#f85149' }}>*</span>
              </Typography>
              <TextField
                select
                fullWidth
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.inputBg,
                    '&:hover': {
                      bgcolor: colors.inputBgHover,
                    },
                    '&.Mui-focused': {
                      bgcolor: colors.inputBgFocus,
                    },
                  },
                }}
              >
                {tiposUsuario.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

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
              borderRadius: 2,
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Header para éxito */}
        {messageType === 'success' && (
          <Box
            sx={{
              bgcolor: mode === 'dark' ? '#21262d' : '#f6f8fa',
              color: colors.text,
              px: 3,
              py: 2,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Operación Exitosa
            </Typography>
          </Box>
        )}
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

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: colors.text }}>
            {messageType === 'success' ? '¡Éxito!' : messageType === 'error' ? 'Error' : 'Advertencia'}
          </Typography>

          <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 4 }}>
            {messageText}
          </Typography>

          <Button
            variant="contained"
            onClick={handleMessageClose}
            fullWidth
            sx={{
              bgcolor: messageType === 'success'
                ? '#58a6ff'
                : messageType === 'error'
                  ? '#f44336'
                  : '#ff9800',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: messageType === 'success'
                  ? '#4c9aed'
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
                bgcolor: 'rgba(255,255,255,0.8)',
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
                bgcolor: 'rgba(147, 51, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Iconify  icon={"solar:lock-password-bold" as any} width={30} sx={{ color: '#9333ea' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
              Cambiar Contraseña
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
              Ingresa la nueva contraseña para el usuario
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                borderColor: '#ccc',
                color: colors.textSecondary,
                '&:hover': {
                  borderColor: '#999',
                  bgcolor: colors.inputBgHover,
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
                borderRadius: 2,
                bgcolor: '#9333ea',
                '&:hover': {
                  bgcolor: '#7928ca',
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
