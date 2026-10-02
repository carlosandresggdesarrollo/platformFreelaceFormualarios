import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
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
const API_URL = `${CONFIG.apiBase}/manejoJWT/api`;
const API_RECUPERAR_URL = `${CONFIG.apiBase}/Modules/ModuleActualizarContrasena/api`;

const keyframes = `
  @keyframes fadeInDown { 0%{opacity:0;transform:translateY(-30px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes fadeInUp { 0%{opacity:0;transform:translateY(40px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes bounceIn { 0%{opacity:0;transform:scale(0.3)} 50%{transform:scale(1.05)} 70%{transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
  @keyframes scaleIn { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
  @keyframes slideUp { 0%{opacity:0;transform:translateY(60px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
  @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 var(--landing-accent-pulse,rgba(0,0,0,0.2))} 50%{box-shadow:0 0 20px 5px var(--landing-accent-pulse-soft,rgba(0,0,0,0.1))} }
`;

const cleanImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return url;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).pathname;
    }
    return url;
  } catch {
    return url;
  }
};

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

export function SignInView() {
  const router = useRouter();
  const siteName = useSiteName();
  useAnalytics('/sign-in');
  const [isLoaded, setIsLoaded] = useState(false);
  const [tema, setTema] = useState<string>('corporativo');
  const [logo, setLogo] = useState<string | null>(null);
  const [redes, setRedes] = useState<{ nombre: string; icono: string; url: string }[]>([]);
  const [registroActivo, setRegistroActivo] = useState(true);
  const themeVars = useLandingTheme(tema);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const [formData, setFormData] = useState({ usuario: '', password: '' });

  const [cambioPassOpen, setCambioPassOpen] = useState(false);
  const [nuevaPass, setNuevaPass] = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');
  const [cambioPassError, setCambioPassError] = useState('');
  const [cambioPassLoading, setCambioPassLoading] = useState(false);
  const [showNuevaPass, setShowNuevaPass] = useState(false);

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
          if (d.config?.registroActivo !== undefined) setRegistroActivo(String(d.config.registroActivo) !== '0');
          cacheLoaderPreference(d.config?.animacionCarga || 'pulso-logo', d.config?.tema);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSignIn = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formData.usuario.trim()) { setError('El usuario es requerido'); return; }
      if (!formData.password.trim()) { setError('La contraseña es requerida'); return; }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_URL}/login.controller.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ usuario: formData.usuario, password: formData.password }),
        });

        const data = await response.json();

        if (data.message === 'Good') {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          const usuarioLimpio = { ...data.usuario, imagen: cleanImageUrl(data.usuario.imagen) };
          localStorage.setItem('usuario', JSON.stringify(usuarioLimpio));

          const estatus = data.usuario.estatus || 'ACTIVO';
          localStorage.setItem(
            'JSON_INFORMACION',
            btoa(JSON.stringify({
              idUsuario: data.usuario.id,
              tipoUsuario: data.usuario.tipo,
              estatus,
              sesion: data.accessToken,
            }))
          );

          if (data.usuario.requiereCambioPass === 1 || data.usuario.requiereCambioPass === '1') {
            setCambioPassOpen(true);
            return;
          }

          const estatusUpper = estatus.toUpperCase();
          if (estatusUpper === 'PENDIENTE') router.push('/verificacion-pendiente');
          else if (estatusUpper === 'CONFIRMADA') router.push('/domicilio');
          else router.push('/dashboard');
        } else {
          switch (data.message) {
            case 'CREDENCIALES_INVALIDAS': setError('Usuario o contraseña incorrectos'); break;
            case 'CAMPOS_REQUERIDOS': setError('Todos los campos son requeridos'); break;
            case 'USUARIO_INACTIVO': setError('Tu cuenta está inactiva. Contacta al administrador'); break;
            default: setError(data.error || 'Error al iniciar sesión');
          }
        }
      } catch {
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    },
    [formData, router]
  );

  const handleForgotPassword = useCallback(async () => {
    if (!forgotEmail.trim()) { setForgotError('El correo electrónico es requerido'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Ingresa un correo electrónico válido');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      const response = await fetch(
        `${API_RECUPERAR_URL}/administrador.controller.enviar.correo.php`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: forgotEmail }) }
      );
      const data = await response.json();
      if (data.message === 'Good') setForgotSuccess(true);
      else setForgotError(data.error || 'No se pudo enviar el correo de recuperación');
    } catch {
      setForgotError('Error de conexión con el servidor');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail]);

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess(false);
  };

  const handleCambioPass = useCallback(async () => {
    if (!nuevaPass.trim()) { setCambioPassError('La nueva contraseña es requerida'); return; }
    if (nuevaPass.length < 6) { setCambioPassError('Mínimo 6 caracteres'); return; }
    if (nuevaPass !== confirmarPass) { setCambioPassError('Las contraseñas no coinciden'); return; }

    setCambioPassLoading(true);
    setCambioPassError('');
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const r = await fetch(`${CONFIG.apiBase}/Modules/ModulePerfil/api/administrador.controller.cambiopass.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUsuario: usuario.id, nuevaContrasena: nuevaPass }),
      });
      const d = await r.json();
      if (d.success) {
        setCambioPassOpen(false);
        router.push('/dashboard');
      } else {
        setCambioPassError(d.error || 'Error al cambiar contraseña');
      }
    } catch {
      setCambioPassError('Error de conexión');
    }
    setCambioPassLoading(false);
  }, [nuevaPass, confirmarPass, router]);

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
        <Box sx={{
          position: 'absolute', top: '50%', left: '65%',
          width: 150, height: 150,
          borderRadius: '50%', bgcolor: 'var(--landing-circle1)', opacity: 0.5,
          animation: 'float 18s ease-in-out infinite', animationDelay: '6s',
          display: { xs: 'none', md: 'block' },
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
            <Box component="img" src={logo} alt="Logo" sx={{ height: { xs: 35, sm: 40 }, objectFit: 'contain', transition: 'all 0.3s ease', '&:hover': { opacity: 0.85, transform: 'scale(1.05)' } }} />
          ) : (
            <Box sx={{
              width: 40, height: 40, borderRadius: 1,
              bgcolor: 'var(--landing-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
              '&:hover': { opacity: 0.85, transform: 'scale(1.05)' },
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
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'var(--landing-btn-outline-hover-bg)',
              borderColor: 'var(--landing-btn-outline-border)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Inicio
        </Button>
      </Box>

      {/* Centered login card */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        px: { xs: 2, sm: 4 }, pt: { xs: 10, md: 8 }, pb: { xs: 4, md: 4 },
      }}>
        <Box sx={{
          width: '100%', maxWidth: 420,
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
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%', bgcolor: 'var(--landing-icon-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 3,
                animation: isLoaded ? 'bounceIn 0.6s ease-out forwards, pulse 3s ease-in-out 1.5s infinite' : 'none',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}>
                <Iconify icon="mdi:account-circle-outline" width={45} sx={{ color: 'var(--landing-icon-color)' }} />
              </Box>

              <Typography variant="h4" sx={{
                fontWeight: 700, color: 'var(--landing-heading)', mb: 1,
                animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none',
                animationDelay: '0.5s', opacity: isLoaded ? 1 : 0,
              }}>
                Iniciar Sesión
              </Typography>

              <Box sx={{
                width: 80, height: 3, borderRadius: 2, mx: 'auto', mb: 2,
                background: 'linear-gradient(90deg, var(--landing-primary), var(--landing-accent))',
                animation: isLoaded ? 'scaleIn 0.5s ease-out forwards' : 'none',
                animationDelay: '0.6s', opacity: isLoaded ? 1 : 0,
              }} />

              <Typography sx={{
                color: 'var(--landing-text-secondary)', fontSize: '0.95rem',
                animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none',
                animationDelay: '0.7s', opacity: isLoaded ? 1 : 0,
              }}>
                Ingresa tus credenciales para continuar
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, animation: 'fadeInUp 0.3s ease-out' }}
                onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSignIn}>
              <TextField
                fullWidth name="usuario" placeholder="Usuario"
                value={formData.usuario} onChange={handleChange} disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:account-outline" width={22} sx={{ color: 'var(--landing-primary)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2.5, ...inputSx }}
              />

              <TextField
                fullWidth name="password" placeholder="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange} disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:lock-outline" width={22} sx={{ color: 'var(--landing-primary)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end" disabled={loading}
                        sx={{
                          color: showPassword ? 'var(--landing-primary)' : 'var(--landing-text-muted)',
                          '&:hover': { bgcolor: 'var(--landing-icon-bg)' },
                        }}
                      >
                        <Iconify icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} width={22} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3, ...inputSx }}
              />

              <Box sx={{
                display: 'flex', flexDirection: 'column', gap: 2, mb: 3,
                animation: isLoaded ? 'slideUp 0.6s ease-out forwards' : 'none',
                animationDelay: '0.9s', opacity: isLoaded ? 1 : 0,
              }}>
                <Button fullWidth size="large" type="submit" disabled={loading} sx={{
                  py: 1.5, borderRadius: 2, fontSize: '0.95rem', fontWeight: 600,
                  bgcolor: 'var(--landing-primary)', color: '#fff',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'var(--landing-primary-hover)',
                    transform: 'translateY(-3px)',
                    boxShadow: 'var(--landing-primary-shadow)',
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&.Mui-disabled': { bgcolor: 'var(--landing-text-muted)', color: '#fff' },
                }}>
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Ingresar'}
                </Button>
              </Box>

              <Box sx={{
                textAlign: 'center',
                animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none',
                animationDelay: '1s', opacity: isLoaded ? 1 : 0,
              }}>
                <Link
                  component="button" type="button" variant="body2"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{
                    color: 'var(--landing-text-secondary)', textDecoration: 'none',
                    cursor: 'pointer', border: 'none', background: 'none',
                    transition: 'all 0.3s ease', fontWeight: 500,
                    '&:hover': { color: 'var(--landing-primary)' },
                  }}
                >
                  ¿Se te olvidó tu contraseña?
                </Link>
                {registroActivo && (
                  <Typography variant="body2" sx={{ mt: 1.5, color: 'var(--landing-text-secondary)' }}>
                    ¿No tienes cuenta?{' '}
                    <Link
                      component="button" type="button" variant="body2"
                      onClick={() => router.push('/sign-up')}
                      sx={{
                        color: 'var(--landing-primary)', textDecoration: 'none',
                        cursor: 'pointer', border: 'none', background: 'none',
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Crear cuenta
                    </Link>
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <LandingFooter redes={redes} />

      {/* Forgot password dialog */}
      <Dialog
        open={forgotPasswordOpen} onClose={handleCloseForgotPassword}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1, overflow: 'visible', animation: 'scaleIn 0.3s ease-out', bgcolor: 'var(--landing-card-bg)' },
          style: themeVars,
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          {!forgotSuccess ? (
            <>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box sx={{
                  width: 90, height: 90, borderRadius: '50%', bgcolor: 'var(--landing-icon-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                }}>
                  <Iconify icon="solar:lock-keyhole-bold" width={45} sx={{ color: 'var(--landing-icon-color)' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'var(--landing-heading)' }}>
                  Recuperar Contraseña
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary)' }}>
                  Ingresa tu correo electrónico y te enviaremos las instrucciones.
                </Typography>
              </Box>

              {forgotError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }} onClose={() => setForgotError('')}>
                  {forgotError}
                </Alert>
              )}

              <TextField
                fullWidth label="Correo electrónico" placeholder="ejemplo@correo.com"
                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading} sx={{ mb: 3, ...inputSx }}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button fullWidth variant="outlined" onClick={handleCloseForgotPassword} disabled={forgotLoading} sx={{
                  py: 1.5, borderRadius: 2, fontWeight: 600,
                  borderColor: 'var(--landing-text-muted)', color: 'var(--landing-text-secondary)',
                  '&:hover': { borderColor: 'var(--landing-text)', bgcolor: 'var(--landing-btn-outline-hover-bg)' },
                }}>
                  Cancelar
                </Button>
                <Button fullWidth variant="contained" onClick={handleForgotPassword} disabled={forgotLoading} sx={{
                  py: 1.5, borderRadius: 2, fontWeight: 600,
                  bgcolor: 'var(--landing-primary)', color: '#fff',
                  '&:hover': { bgcolor: 'var(--landing-primary-hover)' },
                }}>
                  {forgotLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Enviar'}
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{
                width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(76,175,80,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
              }}>
                <Iconify icon="solar:check-circle-bold" width={45} sx={{ color: '#4CAF50' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'var(--landing-heading)' }}>
                ¡Correo enviado!
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary)', mb: 3 }}>
                Hemos enviado las instrucciones a{' '}
                <strong style={{ color: 'var(--landing-primary)' }}>{forgotEmail}</strong>.
              </Typography>
              <Button fullWidth variant="contained" onClick={handleCloseForgotPassword} sx={{
                py: 1.5, borderRadius: 2, fontWeight: 600,
                bgcolor: 'var(--landing-primary)', color: '#fff',
                '&:hover': { bgcolor: 'var(--landing-primary-hover)' },
              }}>
                Volver al inicio de sesión
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Forced password change dialog */}
      <Dialog
        open={cambioPassOpen} onClose={() => {}}
        maxWidth="sm" fullWidth disableEscapeKeyDown
        PaperProps={{
          sx: { borderRadius: 3, p: 1, overflow: 'visible', animation: 'scaleIn 0.3s ease-out', bgcolor: 'var(--landing-card-bg)' },
          style: themeVars,
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(255,152,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
            }}>
              <Iconify icon="mdi:lock-reset" width={45} sx={{ color: '#ff9800' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'var(--landing-heading)' }}>
              Cambio de contraseña obligatorio
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary)' }}>
              Por seguridad, debes establecer una nueva contraseña antes de continuar.
            </Typography>
          </Box>

          {cambioPassError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }} onClose={() => setCambioPassError('')}>
              {cambioPassError}
            </Alert>
          )}

          <TextField
            fullWidth label="Nueva contraseña" type={showNuevaPass ? 'text' : 'password'}
            value={nuevaPass} onChange={(e) => setNuevaPass(e.target.value)}
            disabled={cambioPassLoading} sx={{ mb: 2, ...inputSx }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNuevaPass(!showNuevaPass)} edge="end" sx={{ color: 'var(--landing-text-muted)' }}>
                      <Iconify icon={showNuevaPass ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            fullWidth label="Confirmar contraseña" type="password"
            value={confirmarPass} onChange={(e) => setConfirmarPass(e.target.value)}
            disabled={cambioPassLoading} sx={{ mb: 3, ...inputSx }}
          />

          <Button fullWidth variant="contained" onClick={handleCambioPass} disabled={cambioPassLoading} sx={{
            py: 1.5, borderRadius: 2, fontWeight: 600,
            bgcolor: 'var(--landing-primary)', color: '#fff',
            '&:hover': { bgcolor: 'var(--landing-primary-hover)' },
          }}>
            {cambioPassLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Cambiar contraseña'}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
