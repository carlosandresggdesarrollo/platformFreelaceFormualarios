import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useAnalytics } from 'src/hooks/use-analytics';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { LandingFooter } from 'src/components/landing-footer';

import { useLandingTheme } from 'src/sections/inicio/themes';

// ----------------------------------------------------------------------

const API_PUBLIC = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.publico.php`;
const API_QUIZ = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.cuestionarios.publico.php`;

interface Quiz {
  idCuestionario: number;
  titulo: string;
  descripcion: string;
  totalPreguntas: number;
  fechaCreacion: string;
}

interface RedSocial { nombre: string; icono: string; url: string }

export function CuestionariosPublicoView() {
  const router = useRouter();
  useAnalytics('/quiz');
  const [tema, setTema] = useState('corporativo');
  const [logo, setLogo] = useState('');
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const themeVars = useLandingTheme(tema);

  useEffect(() => {
    fetch(API_PUBLIC)
      .then((r) => r.json())
      .then((d) => {
        if (d.success !== false) {
          if (d.config?.tema) setTema(d.config.tema);
          if (d.config?.logo) setLogo(d.config.logo);
          if (Array.isArray(d.redes)) setRedes(d.redes);
        }
      })
      .catch(() => {});

    fetch(API_QUIZ)
      .then((r) => r.json())
      .then((d) => {
        if (d.success !== false && Array.isArray(d.cuestionarios)) {
          setQuizzes(d.cuestionarios);
        }
      })
      .catch(() => {});
  }, []);

  const keyframes = `
    @keyframes fadeInUp { 0%{opacity:0;transform:translateY(30px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes fadeInDown { 0%{opacity:0;transform:translateY(-20px)} 100%{opacity:1;transform:translateY(0)} }
  `;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--landing-bg)', display: 'flex', flexDirection: 'column' }} style={themeVars}>
      <style>{keyframes}</style>

      {/* Navbar */}
      <Box sx={{
        py: 1.5, px: { xs: 2, md: 6 },
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--landing-navbar-bg)', backdropFilter: 'blur(10px)',
        boxShadow: 'var(--landing-navbar-shadow)',
        animation: 'fadeInDown 0.6s ease-out',
      }}>
        <Box
          component="img"
          src={logo || `${import.meta.env.BASE_URL}images/logo.png`}
          alt="Logo"
          sx={{ height: 40, cursor: 'pointer' }}
          onClick={() => router.push('/')}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined" onClick={() => router.push('/sign-in')}
            sx={{ borderColor: 'var(--landing-btn-outline-border)', color: 'var(--landing-btn-outline-color)', textTransform: 'none', fontWeight: 600 }}
          >
            Iniciar Sesion
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Container maxWidth="md" sx={{ pt: 6, pb: 8, flex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 5, animation: 'fadeInDown 0.8s ease-out' }}>
          <Iconify icon="mdi:clipboard-list-outline" width={48} sx={{ color: 'var(--landing-primary)', mb: 1 }} />
          <Typography variant="h3" sx={{
            fontWeight: 800, color: 'var(--landing-text)',
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}>
            Cuestionarios
          </Typography>
          <Typography sx={{ color: 'var(--landing-text)', opacity: 0.7, mt: 1 }}>
            Pon a prueba tus conocimientos con nuestros cuestionarios interactivos
          </Typography>
        </Box>

        {quizzes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon="mdi:file-question-outline" width={64} sx={{ color: 'var(--landing-text)', opacity: 0.3, mb: 2 }} />
            <Typography sx={{ color: 'var(--landing-text)', opacity: 0.5 }}>
              No hay cuestionarios disponibles por el momento
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {quizzes.map((q, idx) => (
              <Card
                key={q.idCuestionario}
                sx={{
                  p: { xs: 3, md: 4 }, borderRadius: 3,
                  background: 'var(--landing-hero-card-bg, rgba(255,255,255,0.9))',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  animation: `fadeInUp 0.6s ease-out ${0.1 * idx}s both`,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--landing-text)', mb: 0.5 }}>
                      {q.titulo}
                    </Typography>
                    {q.descripcion && (
                      <Typography variant="body2" sx={{ color: 'var(--landing-text)', opacity: 0.7, mb: 1 }}>
                        {q.descripcion}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Iconify icon="mdi:help-circle-outline" width={16} sx={{ color: 'var(--landing-primary)' }} />
                        <Typography variant="caption" sx={{ color: 'var(--landing-text)', opacity: 0.6 }}>
                          {q.totalPreguntas} preguntas
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Button
                    variant="contained" onClick={() => router.push(`/quiz/${q.idCuestionario}`)}
                    endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
                    sx={{
                      bgcolor: 'var(--landing-primary)', textTransform: 'none', fontWeight: 600,
                      px: 4, borderRadius: 2, whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: 'var(--landing-primary-hover, var(--landing-primary))' },
                    }}
                  >
                    Contestar
                  </Button>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      <LandingFooter redes={redes} />
    </Box>
  );
}
