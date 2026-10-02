import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export function VerificacionPendienteView() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    // Obtener el email del usuario del localStorage
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        setUserEmail(usuario.email || '');
      } catch (e) {
        console.error('Error parsing usuario:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('JSON_INFORMACION');
    router.push('/sign-in');
  };

  const handleResendEmail = async () => {
    if (!userEmail) return;

    setResending(true);
    setResendSuccess(false);

    try {
      // Aquí puedes agregar la lógica para reenviar el correo de verificación
      // Ruta relativa (mismo origen): funciona bajo HTTPS sin Mixed Content.
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleActualizarContrasena/api/administrador.controller.reenviar.verificacion.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      if (data.message === 'Good') {
        setResendSuccess(true);
      }
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setResending(false);
    }
  };

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
        {/* Icono de email */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(102, 126, 234, 0.4)' },
              '70%': { boxShadow: '0 0 0 20px rgba(102, 126, 234, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(102, 126, 234, 0)' },
            },
          }}
        >
          <Iconify icon={"solar:letter-bold" as any} width={50} sx={{ color: 'white' }} />
        </Box>

        {/* Título */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
          Verifica tu correo electrónico
        </Typography>

        {/* Descripción */}
        <Typography variant="body1" sx={{ color: '#666', mb: 3, lineHeight: 1.7 }}>
          Hemos enviado un correo de verificación a:
        </Typography>

        {/* Email */}
        <Box
          sx={{
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 600 }}>
            {userEmail || 'tu correo electrónico'}
          </Typography>
        </Box>

        {/* Instrucciones */}
        <Typography variant="body2" sx={{ color: '#888', mb: 4, lineHeight: 1.8 }}>
          Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación
          para activar tu cuenta. Si no encuentras el correo, revisa tu carpeta de spam.
        </Typography>

        {/* Mensaje de éxito al reenviar */}
        {resendSuccess && (
          <Box
            sx={{
              bgcolor: 'rgba(76, 175, 80, 0.1)',
              borderRadius: 2,
              p: 2,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Iconify icon={"solar:check-circle-bold" as any} sx={{ color: '#4caf50' }} />
            <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
              Correo reenviado exitosamente
            </Typography>
          </Box>
        )}

        {/* Botones */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleResendEmail}
            disabled={resending || !userEmail}
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
            {resending ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Reenviar correo de verificación'
            )}
          </Button>

          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#764ba2',
                bgcolor: 'rgba(102, 126, 234, 0.05)',
              },
            }}
          >
            Volver al inicio de sesión
          </Button>
        </Box>

        {/* Nota de soporte */}
        <Typography variant="caption" sx={{ color: '#aaa', mt: 4, display: 'block' }}>
          ¿Problemas para verificar tu cuenta? Contacta a soporte técnico.
        </Typography>
      </Box>
    </Box>
  );
}
