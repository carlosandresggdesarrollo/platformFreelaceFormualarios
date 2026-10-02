import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Ruta relativa (mismo origen): funciona en dev y en producción bajo HTTPS sin Mixed Content.
const API_URL = `${CONFIG.apiBase}/Modules/ModuleActualizarContrasena/api`;

export function RecuperarPasswordView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [userData, setUserData] = useState<{ nombre: string; email: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [updating, setUpdating] = useState(false);

  // Verificar token al cargar
  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setError('Token no proporcionado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/administrador.controller.verificar.token.php?token=${token}`);
        const data = await response.json();
        console.log(data)
        if (data.message === 'Good' && data.valido) {
          setValidToken(true);
          setUserData({
            nombre: `${data.nombre} ${data.apellido}`,
            email: data.email
          });
        } else {
          setError(data.error || 'El enlace ha expirado o no es válido');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    verificarToken();
  }, [token]);

  // Validar contraseña
  const validatePassword = useCallback((pass: string) => {
    if (pass.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'La contraseña debe tener al menos una mayúscula';
    }
    if (!/[a-z]/.test(pass)) {
      return 'La contraseña debe tener al menos una minúscula';
    }
    if (!/[0-9]/.test(pass)) {
      return 'La contraseña debe tener al menos un número';
    }
    return '';
  }, []);

  // Manejar cambio de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      setPasswordError(validatePassword(newPassword));
    } else {
      setPasswordError('');
    }
  };

  // Enviar nueva contraseña
  const handleSubmit = async () => {
    const validationError = validatePassword(password);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setUpdating(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/administrador.controller.actualizar.contrasena.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          contrasena: password
        })
      });

      const data = await response.json();

      if (data.message === 'Good' && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setUpdating(false);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#E8F4F8',
        }}
      >
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ color: '#667eea' }} />
          <Typography sx={{ mt: 2 }}>Verificando enlace...</Typography>
        </Card>
      </Box>
    );
  }

  // Token inválido o expirado
  if (!validToken) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#E8F4F8',
          p: 2,
        }}
      >
        <Card sx={{ p: 4, maxWidth: 450, textAlign: 'center', borderRadius: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Iconify icon={"solar:close-circle-bold" as any} width={40} sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Enlace no válido
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {error || 'El enlace de recuperación ha expirado o ya fue utilizado. Por favor solicita uno nuevo.'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/sign-in')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Volver al inicio de sesión
          </Button>
        </Card>
      </Box>
    );
  }

  // Contraseña actualizada exitosamente
  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#E8F4F8',
          p: 2,
        }}
      >
        <Card sx={{ p: 4, maxWidth: 450, textAlign: 'center', borderRadius: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Iconify icon={"solar:check-circle-bold" as any} width={40} sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            ¡Contraseña actualizada!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/sign-in')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
              },
            }}
          >
            Iniciar sesión
          </Button>
        </Card>
      </Box>
    );
  }

  // Formulario para nueva contraseña
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#E8F4F8',
        p: 2,
      }}
    >
      <Card sx={{ p: 4, maxWidth: 450, width: '100%', borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Iconify icon={"solar:key-bold" as any}  width={40} sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Nueva Contraseña
          </Typography>
          {userData && (
            <Typography variant="body2" color="text.secondary">
              {userData.nombre} ({userData.email})
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ingresa tu nueva contraseña. Debe cumplir con los siguientes requisitos:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" color={password.length >= 8 ? 'success.main' : 'text.secondary'}>
              • Mínimo 8 caracteres {password.length >= 8 && '✓'}
            </Typography>
            <Typography variant="body2" color={/[A-Z]/.test(password) ? 'success.main' : 'text.secondary'}>
              • Al menos una mayúscula {/[A-Z]/.test(password) && '✓'}
            </Typography>
            <Typography variant="body2" color={/[a-z]/.test(password) ? 'success.main' : 'text.secondary'}>
              • Al menos una minúscula {/[a-z]/.test(password) && '✓'}
            </Typography>
            <Typography variant="body2" color={/[0-9]/.test(password) ? 'success.main' : 'text.secondary'}>
              • Al menos un número {/[0-9]/.test(password) && '✓'}
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Nueva contraseña"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          error={!!passwordError}
          helperText={passwordError}
          disabled={updating}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirmar contraseña"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword !== '' && password !== confirmPassword}
          helperText={confirmPassword !== '' && password !== confirmPassword ? 'Las contraseñas no coinciden' : ''}
          disabled={updating}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  <Iconify icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handleSubmit}
          disabled={updating || !password || !confirmPassword || password !== confirmPassword || !!passwordError}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
            },
            '&.Mui-disabled': {
              background: '#e0e0e0',
            },
          }}
        >
          {updating ? <CircularProgress size={24} color="inherit" /> : 'Actualizar contraseña'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="text"
            onClick={() => navigate('/sign-in')}
            sx={{ color: 'text.secondary' }}
          >
            Volver al inicio de sesión
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
