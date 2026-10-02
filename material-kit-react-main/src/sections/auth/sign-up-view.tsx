import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useSiteName } from 'src/hooks/use-site-name';
import { useAnalytics } from 'src/hooks/use-analytics';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { LandingFooter } from 'src/components/landing-footer';
import { cacheLoaderPreference } from 'src/components/loading-fallback/loading-fallback';

import { useLandingTheme } from 'src/sections/inicio/themes';

// ----------------------------------------------------------------------

const API_PUBLIC = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.publico.php`;
const API_REGISTRO = `${CONFIG.apiBase}/Modules/ModuleRegistro/api/administrador.controller.crear.php`;

const keyframes = `
  @keyframes fadeInDown { 0%{opacity:0;transform:translateY(-30px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes fadeInUp { 0%{opacity:0;transform:translateY(40px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes bounceIn { 0%{opacity:0;transform:scale(0.3)} 50%{transform:scale(1.05)} 70%{transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
  @keyframes scaleIn { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
  @keyframes slideUp { 0%{opacity:0;transform:translateY(60px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 var(--landing-accent-pulse,rgba(0,0,0,0.2))} 50%{box-shadow:0 0 20px 5px var(--landing-accent-pulse-soft,rgba(0,0,0,0.1))} }
`;

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    bgcolor: 'var(--landing-bg-alt)',
    color: 'var(--landing-text)',
    transition: 'all 0.3s ease',
    '& fieldset': { borderColor: 'var(--landing-text-muted)' },
    '&:hover fieldset': { borderColor: 'var(--landing-primary)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--landing-primary)', borderWidth: 2 },
  },
  '& .MuiOutlinedInput-input': {
    color: 'var(--landing-text)',
    '&::placeholder': { color: 'var(--landing-text-muted)', opacity: 1 },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--landing-text-muted)',
    '&.Mui-focused': { color: 'var(--landing-primary)' },
  },
};

export function SignUpView() {
  const router = useRouter();
  const siteName = useSiteName();
  useAnalytics('/sign-up');
  const [isLoaded, setIsLoaded] = useState(false);
  const [tema, setTema] = useState<string>('corporativo');
  const [logo, setLogo] = useState<string | null>(null);
  const [redes, setRedes] = useState<{ nombre: string; icono: string; url: string }[]>([]);
  const themeVars = useLandingTheme(tema);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoRegistro: 'CLIENTE' as const,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(API_PUBLIC)
      .then((r) => r.json())
      .then((d) => {
        if (d.success !== false) {
          if (d.config?.tema) setTema(d.config.tema);
          if (d.config?.logo) setLogo(d.config.logo);
          if (Array.isArray(d.redes)) setRedes(d.redes);
          cacheLoaderPreference(d.config?.animacionCarga || 'pulso-logo', d.config?.tema);
          if (String(d.config?.registroActivo) === '0') router.push('/sign-in');
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSignUp = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formData.nombre.trim()) { setError('El nombre es requerido'); return; }
      if (!formData.apellido.trim()) { setError('El apellido es requerido'); return; }
      if (!formData.usuario.trim()) { setError('El usuario es requerido'); return; }
      if (!formData.email.trim()) { setError('El correo electronico es requerido'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Ingresa un correo electronico valido'); return; }
      if (!formData.password.trim()) { setError('La contrasena es requerida'); return; }
      if (formData.password.length < 6) { setError('La contrasena debe tener al menos 6 caracteres'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Las contrasenas no coinciden'); return; }

      setLoading(true);
      setError('');

      try {
        const fd = new FormData();
        fd.append('txt_usuario', formData.usuario);
        fd.append('txt_contrasena', formData.password);
        fd.append('txt_nombre', formData.nombre);
        fd.append('txt_apellido', formData.apellido);
        fd.append('txt_email', formData.email);
        fd.append('txt_tipo', formData.tipoRegistro);

        const response = await fetch(API_REGISTRO, {
          method: 'POST',
          credentials: 'include',
          body: fd,
        });

        const data = await response.json();

        if (data.message === 'Good') {
          setSuccess(true);
        } else {
          switch (data.message) {
            case 'EMAIL REPETIDO': setError('Este usuario o correo ya esta registrado'); break;
            case 'NO SE PUDO ENVIAR EMAIL': setError('No se pudo enviar el correo de confirmacion. Intenta de nuevo.'); break;
            case 'ERROR DE SISTEMA': setError('Error de sistema. Intenta de nuevo mas tarde.'); break;
            default: setError(data.error || data.Error || 'Error al crear la cuenta');
          }
        }
      } catch {
        setError('Error de conexion con el servidor');
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  if (success) {
    return (
      <Box sx={{ bgcolor: 'var(--landing-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} style={themeVars}>
        <style>{keyframes}</style>
        <Box sx={{
          width: '100%', maxWidth: 420, px: 2,
          animation: 'bounceIn 0.8s ease-out forwards',
        }}>
          <Box sx={{
            bgcolor: 'var(--landing-card-bg)', borderRadius: 3, p: { xs: 3, sm: 4 },
            boxShadow: 'var(--landing-card-shadow)', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, var(--landing-primary), var(--landing-accent))',
            },
          }}>
            <Box sx={{
              width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
            }}>
              <Iconify icon="mdi:check-circle-outline" width={50} sx={{ color: '#4CAF50' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'var(--landing-heading)' }}>
              Cuenta creada
            </Typography>
            <Typography sx={{ color: 'var(--landing-text-secondary)', mb: 1 }}>
              Hemos enviado un correo de confirmacion a:
            </Typography>
            <Typography sx={{ fontWeight: 600, color: 'var(--landing-primary)', mb: 3 }}>
              {formData.email}
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--landing-text-muted)', mb: 3 }}>
              Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </Typography>
            <Button
              fullWidth variant="contained" size="large"
              onClick={() => router.push('/sign-in')}
              sx={{
                py: 1.5, borderRadius: 2, fontWeight: 600,
                bgcolor: 'var(--landing-primary)', color: '#fff',
                '&:hover': { bgcolor: 'var(--landing-primary-hover)' },
              }}
            >
              Ir a Iniciar Sesion
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{ bgcolor: 'var(--landing-bg)', minHeight: '100vh', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}
      style={themeVars}
    >
      <style>{keyframes}</style>

      {/* Decorative background circles */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: { xs: 300, md: 500 }, height: { xs: 300, md: 500 },
          borderRadius: '50%', bgcolor: 'var(--landing-circle1)',
          animation: 'float 20s ease-in-out infinite',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '-10%', left: '-8%',
          width: { xs: 250, md: 400 }, height: { xs: 250, md: 400 },
          borderRadius: '50%', bgcolor: 'var(--landing-circle2)',
          animation: 'float 25s ease-in-out infinite', animationDelay: '3s',
        }} />
      </Box>

      {/* Navbar */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        py: { xs: 1.5, md: 2 }, px: { xs: 2, sm: 4, md: 6 },
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        bgcolor: 'var(--landing-navbar-bg)', backdropFilter: 'blur(10px)',
        boxShadow: 'var(--landing-navbar-shadow)',
        animation: isLoaded ? 'fadeInDown 0.8s ease-out forwards' : 'none',
        opacity: isLoaded ? 1 : 0,
      }}>
        <Box onClick={() => router.push('/')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}>
          {logo ? (
            <Box component="img" src={logo} alt="Logo" sx={{ height: { xs: 35, sm: 40 }, objectFit: 'contain' }} />
          ) : (
            <Box sx={{
              width: 40, height: 40, borderRadius: 1,
              bgcolor: 'var(--landing-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Iconify icon="mdi:leaf" width={24} sx={{ color: '#fff' }} />
            </Box>
          )}
          <Typography sx={{
            fontWeight: 700, fontSize: '1.1rem', color: 'var(--landing-heading)',
            display: { xs: 'none', sm: 'block' },
          }}>
            {siteName.toUpperCase()}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => router.push('/')}
          startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
          sx={{
            color: 'var(--landing-btn-outline-color)',
            borderColor: 'var(--landing-btn-outline-border)',
            px: { xs: 2, sm: 3 }, py: { xs: 0.8, md: 1 },
            borderRadius: 1, textTransform: 'none', fontWeight: 500, fontSize: '0.9rem',
            '&:hover': {
              bgcolor: 'var(--landing-btn-outline-hover-bg)',
              borderColor: 'var(--landing-btn-outline-border)',
            },
          }}
        >
          Inicio
        </Button>
      </Box>

      {/* Centered register card */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        px: { xs: 2, sm: 4 }, pt: { xs: 10, md: 8 }, pb: { xs: 4, md: 4 },
      }}>
        <Box sx={{
          width: '100%', maxWidth: 460,
          animation: isLoaded ? 'bounceIn 0.8s ease-out forwards' : 'none',
          animationDelay: '0.2s', opacity: isLoaded ? 1 : 0,
        }}>
          <Box sx={{
            bgcolor: 'var(--landing-card-bg)', borderRadius: 3, p: { xs: 3, sm: 4 },
            boxShadow: 'var(--landing-card-shadow)',
            transition: 'all 0.4s ease', position: 'relative', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, var(--landing-primary), var(--landing-accent))',
            },
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 'var(--landing-card-shadow-hover)',
            },
          }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%', bgcolor: 'var(--landing-icon-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
                animation: isLoaded ? 'bounceIn 0.6s ease-out forwards' : 'none',
              }}>
                <Iconify icon="mdi:account-plus-outline" width={45} sx={{ color: 'var(--landing-icon-color)' }} />
              </Box>

              <Typography variant="h4" sx={{
                fontWeight: 700, color: 'var(--landing-heading)', mb: 1,
                animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none',
                animationDelay: '0.5s', opacity: isLoaded ? 1 : 0,
              }}>
                Crear Cuenta
              </Typography>

              <Box sx={{
                width: 80, height: 3, borderRadius: 2, mx: 'auto', mb: 1.5,
                background: 'linear-gradient(90deg, var(--landing-primary), var(--landing-accent))',
                animation: isLoaded ? 'scaleIn 0.5s ease-out forwards' : 'none',
                animationDelay: '0.6s', opacity: isLoaded ? 1 : 0,
              }} />

              <Typography sx={{
                color: 'var(--landing-text-secondary)', fontSize: '0.95rem',
                animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none',
                animationDelay: '0.7s', opacity: isLoaded ? 1 : 0,
              }}>
                Completa tus datos para registrarte
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, animation: 'fadeInUp 0.3s ease-out' }}
                onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSignUp}>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  fullWidth name="nombre" placeholder="Nombre"
                  value={formData.nombre} onChange={handleChange} disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="mdi:account-outline" width={20} sx={{ color: 'var(--landing-primary)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />
                <TextField
                  fullWidth name="apellido" placeholder="Apellido"
                  value={formData.apellido} onChange={handleChange} disabled={loading}
                  sx={inputSx}
                />
              </Box>

              <TextField
                fullWidth name="usuario" placeholder="Usuario"
                value={formData.usuario} onChange={handleChange} disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:at" width={20} sx={{ color: 'var(--landing-primary)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, ...inputSx }}
              />

              <TextField
                fullWidth name="email" placeholder="Correo electronico" type="email"
                value={formData.email} onChange={handleChange} disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:email-outline" width={20} sx={{ color: 'var(--landing-primary)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, ...inputSx }}
              />

              <TextField
                fullWidth name="password" placeholder="Contrasena"
                type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange} disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:lock-outline" width={20} sx={{ color: 'var(--landing-primary)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end" disabled={loading}
                        sx={{ color: showPassword ? 'var(--landing-primary)' : 'var(--landing-text-muted)' }}
                      >
                        <Iconify icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} width={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2, ...inputSx }}
              />

              <TextField
                fullWidth name="confirmPassword" placeholder="Confirmar contrasena"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword} onChange={handleChange} disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:lock-check-outline" width={20} sx={{ color: 'var(--landing-primary)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5, ...inputSx }}
              />

              <Button fullWidth size="large" type="submit" disabled={loading} sx={{
                py: 1.5, borderRadius: 2, fontSize: '0.95rem', fontWeight: 600,
                bgcolor: 'var(--landing-primary)', color: '#fff', mb: 2,
                '&:hover': {
                  bgcolor: 'var(--landing-primary-hover)',
                  transform: 'translateY(-3px)',
                  boxShadow: 'var(--landing-primary-shadow)',
                },
                '&.Mui-disabled': { bgcolor: 'var(--landing-text-muted)', color: '#fff' },
              }}>
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Crear Cuenta'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary)' }}>
                  Ya tienes cuenta?{' '}
                  <Link
                    component="button" type="button" variant="body2"
                    onClick={() => router.push('/sign-in')}
                    sx={{
                      color: 'var(--landing-primary)', textDecoration: 'none',
                      cursor: 'pointer', border: 'none', background: 'none',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Iniciar Sesion
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <LandingFooter redes={redes} />
    </Box>
  );
}
