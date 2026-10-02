import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Ruta relativa (mismo origen): funciona en dev y en producción bajo HTTPS sin Mixed Content.
const API_URL = `${CONFIG.apiBase}/Modules/ConfirmacionCorreo/api`;


export function ConfirmarCorreoView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [confirmado, setConfirmado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [usuario, setUsuario] = useState<{ nombre: string; email: string } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const confirmarCorreo = async () => {
      if (!token) {
        setError(true);
        setMensaje('Token no proporcionado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/administrador.controller.confirmar.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        console.log('Respuesta confirmación:', data);

        if (data.message === 'Good') {
          setConfirmado(data.confirmado);
          setMensaje(data.texto || '');
          if (data.usuario) {
            setUsuario({
              nombre: `${data.usuario.nombre} ${data.usuario.apellidos}`,
              email: data.usuario.email
            });
          }
        } else {
          setError(true);
          setMensaje(data.error || 'Error al confirmar el correo');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(true);
        setMensaje('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    confirmarCorreo();
  }, [token]);

  const handleIniciarSesion = () => {
    navigate('/sign-in');
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
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 4,
            p: 5,
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <CircularProgress size={60} sx={{ color: '#667eea', mb: 3 }} />
          <Typography variant="h6">Confirmando tu correo...</Typography>
        </Box>
      </Box>
    );
  }

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
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 4,
          p: 5,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          animation: 'fadeIn 0.6s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Icono */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: error
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : confirmado
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: confirmado ? 'bounce 0.6s ease' : 'none',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          <Iconify
            icon={
              error
                ? "solar:close-circle-bold" as any
                : confirmado
                  ? "solar:check-circle-bold" as any
                  : "solar:danger-triangle-bold" as any
            }
            width={50}
            sx={{ color: 'white' }}
          />
        </Box>

        {/* Título */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
          {error
            ? 'Error de Confirmación'
            : confirmado
              ? '¡Correo Confirmado!'
              : 'Atención'}
        </Typography>

        {/* Usuario */}
        {usuario && !error && (
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#667eea' }}>
              {usuario.nombre}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {usuario.email}
            </Typography>
          </Box>
        )}

        {/* Mensaje */}
        <Typography
          variant="body1"
          sx={{
            color: '#666',
            mb: 4,
            lineHeight: 1.8,
            px: 2,
          }}
        >
          {mensaje}
        </Typography>

        {/* Botones */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleIniciarSesion}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
              },
            }}
          >
            Iniciar Sesión
          </Button>

          <Button
            variant="text"
            onClick={() => navigate('/')}
            sx={{
              color: '#666',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            Volver al Inicio
          </Button>
        </Box>

        {/* Nota */}
        {confirmado && !error && (
          <Typography
            variant="caption"
            sx={{
              color: '#aaa',
              mt: 4,
              display: 'block',
            }}
          >
            Recuerda completar tu registro después de iniciar sesión.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
