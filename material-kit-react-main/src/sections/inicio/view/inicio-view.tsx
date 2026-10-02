import type { ModalBienvenidaData } from 'src/components/welcome-modal';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { useAnalytics } from 'src/hooks/use-analytics';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { WelcomeModal } from 'src/components/welcome-modal';
import { LandingFooter } from 'src/components/landing-footer';
import { cacheLoaderPreference } from 'src/components/loading-fallback/loading-fallback';

import { useLandingTheme } from '../themes';
import { BackgroundAnimation } from '../animations';

import type { AnimationName } from '../animations';

// ----------------------------------------------------------------------

const API_PUBLIC = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.publico.php`;

const keyframes = `
  @keyframes fadeInDown { 0%{opacity:0;transform:translateY(-30px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes fadeInUp { 0%{opacity:0;transform:translateY(40px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes fadeInLeft { 0%{opacity:0;transform:translateX(-60px)} 100%{opacity:1;transform:translateX(0)} }
  @keyframes fadeInRight { 0%{opacity:0;transform:translateX(60px)} 100%{opacity:1;transform:translateX(0)} }
  @keyframes slideUp { 0%{opacity:0;transform:translateY(60px)} 100%{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
  @keyframes pulse { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 var(--landing-accent-pulse)} 50%{transform:scale(1.02);box-shadow:0 0 20px 5px var(--landing-accent-pulse-soft)} }
  @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
`;

interface NavItem { texto: string; link: string }
interface CarruselItem { imagen: string | null; icono: string | null; titulo: string; descripcion: string | null; link: string | null }
interface Carrusel { idCarrusel: number; nombre: string; velocidad: number; items: CarruselItem[] }
interface Plan { nombre: string; precio: string; mensajes: string; descripcion: string }
interface RedSocial { nombre: string; icono: string; url: string }
interface HomeData {
  config: { tituloPrincipal: string; subtitulo: string; imagenFondo: string | null; tema?: string; logo?: string | null; animacionFondo?: string; animacionDuracion?: number; registroActivo?: string };
  nav: NavItem[];
  carruseles: Carrusel[];
  planes: Plan[];
  redes: RedSocial[];
  modalBienvenida: ModalBienvenidaData | null;
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setIsVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

function ItemCard({ item, delay, visible }: { item: CarruselItem; delay: number; visible: boolean }) {
  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '45%', md: '30%' },
        textAlign: 'center', p: { xs: 2, md: 3 },
        bgcolor: 'var(--landing-card-bg)', borderRadius: 3,
        boxShadow: 'var(--landing-card-shadow)',
        transition: 'all 0.4s ease',
        animation: visible ? `slideUp 0.8s ease-out ${delay}s forwards` : 'none',
        opacity: visible ? 1 : 0,
        '&:hover': { transform: 'translateY(-10px)', boxShadow: 'var(--landing-card-shadow-hover)' },
      }}
    >
      <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', bgcolor: 'var(--landing-icon-bg)', overflow: 'hidden' }}>
        {item.imagen ? (
          <Box component="img" src={item.imagen} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Iconify icon={(item.icono || 'mdi:star') as any} width={44} sx={{ color: 'var(--landing-icon-color)' }} />
        )}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'var(--landing-heading)' }}>{item.titulo}</Typography>
      {item.descripcion && (
        <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary)', lineHeight: 1.7 }}>{item.descripcion}</Typography>
      )}
    </Box>
  );
}

function MarqueeTrack({ items, carruselId, speed }: { items: CarruselItem[]; carruselId: number; speed: number }) {
  const [paused, setPaused] = useState(false);
  const duration = Math.max(10, 60 - speed * 5);
  const doubled = [...items, ...items];

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{ overflow: 'hidden', width: '100%' }}
    >
      <Box
        sx={{
          display: 'flex', gap: 3, width: 'max-content',
          animation: `marquee ${duration}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((item, iIdx) => (
          <Box
            key={`${carruselId}-m-${iIdx}`}
            sx={{
              width: 320, flexShrink: 0,
              textAlign: 'center', p: 3,
              bgcolor: 'var(--landing-card-bg)', borderRadius: 3,
              boxShadow: 'var(--landing-card-shadow)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': { transform: 'translateY(-8px)', boxShadow: 'var(--landing-card-shadow-hover)' },
            }}
          >
            <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', bgcolor: 'var(--landing-icon-bg)', overflow: 'hidden' }}>
              {item.imagen ? (
                <Box component="img" src={item.imagen} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Iconify icon={(item.icono || 'mdi:star') as any} width={44} sx={{ color: 'var(--landing-icon-color)' }} />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'var(--landing-heading)' }}>{item.titulo}</Typography>
            {item.descripcion && (
              <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary)', lineHeight: 1.7 }}>{item.descripcion}</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function CarouselSection({ carrusel, index, sectionId, onVisible }: { carrusel: Carrusel; index: number; sectionId?: string; onVisible?: (name: string) => void }) {
  const { ref, isVisible } = useInView();
  const bgAlt = index % 2 === 0 ? 'var(--landing-bg)' : 'var(--landing-bg-alt)';
  const speed = Number(carrusel.velocidad) || 0;

  useEffect(() => {
    if (isVisible && onVisible) onVisible(carrusel.nombre);
  }, [isVisible, onVisible, carrusel.nombre]);

  if (carrusel.items.length === 0) return null;

  return (
    <Box
      id={sectionId}
      ref={ref}
      sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', py: { xs: 8, md: 10 }, bgcolor: bgAlt }}
    >
      <Box sx={{ width: '100%' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700, color: 'var(--landing-heading)', textAlign: 'center', mb: 6,
              fontSize: { xs: '1.5rem', md: '2rem' },
              animation: isVisible ? 'fadeInDown 0.8s ease-out forwards' : 'none',
              opacity: isVisible ? 1 : 0,
            }}
          >
            {carrusel.nombre}
          </Typography>
        </Container>

        {speed > 0 ? (
          <Box sx={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease', px: 2 }}>
            <MarqueeTrack items={carrusel.items} carruselId={carrusel.idCarrusel} speed={speed} />
          </Box>
        ) : (
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: { xs: 3, md: 4 } }}>
              {carrusel.items.map((item, iIdx) => (
                <ItemCard key={`${carrusel.idCarrusel}-${iIdx}`} item={item} delay={0.1 * (iIdx + 1)} visible={isVisible} />
              ))}
            </Box>
          </Container>
        )}
      </Box>
    </Box>
  );
}

export function InicioView() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { trackSection } = useAnalytics('/');

  const themeVars = useLandingTheme(data?.config?.tema);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);

    fetch(API_PUBLIC)
      .then((r) => r.json())
      .then((d) => {
        if (d.success !== false) {
          setData(d);
          cacheLoaderPreference(d.config?.animacionCarga || 'pulso-logo', d.config?.tema);
        }
      })
      .catch(() => {});

    return () => clearTimeout(timer);
  }, []);

  if (!data) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Typography sx={{ color: '#666' }}>Cargando...</Typography>
      </Box>
    );
  }

  const { config, nav, carruseles, planes, redes, modalBienvenida } = data;
  const registroActivo = String(config.registroActivo) !== '0';
  const logoSrc = config.logo || `${import.meta.env.BASE_URL}images/logo.png`;
  const animacion = (config.animacionFondo || 'minimalista') as AnimationName;
  const loaderDuration = Number(config.animacionDuracion) || 2;
  const modalDelay = (loaderDuration + 1) * 1000;

  return (
    <Box sx={{ bgcolor: 'var(--landing-bg)', overflow: 'hidden' }} style={themeVars}>
      <style>{keyframes}</style>
      <BackgroundAnimation animation={animacion} />
      <WelcomeModal data={modalBienvenida} delayMs={modalDelay} />

      {/* NAVBAR */}
      <Box
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          py: { xs: 1, md: 1.5 }, px: { xs: 2, sm: 4, md: 6 },
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: 'var(--landing-navbar-bg)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'var(--landing-navbar-shadow)',
          animation: isLoaded ? 'fadeInDown 0.8s ease-out forwards' : 'none',
          opacity: isLoaded ? 1 : 0,
        }}
      >
        <Box component="img" src={logoSrc} alt="Logo" sx={{ height: { xs: 35, sm: 40, md: 45 }, cursor: 'pointer' }} />

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
          {nav.map((item) => {
            const isAnchor = item.link.startsWith('#');
            return (
              <Typography
                key={item.texto}
                component="a"
                href={isAnchor ? item.link : undefined}
                onClick={isAnchor ? undefined : (e: React.MouseEvent) => { e.preventDefault(); router.push(item.link); }}
                sx={{ color: 'var(--landing-nav-link)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', '&:hover': { color: 'var(--landing-nav-link-hover)' } }}
              >
                {item.texto}
              </Typography>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/sign-in')}
            sx={{ borderColor: 'var(--landing-btn-outline-border)', color: 'var(--landing-btn-outline-color)', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'var(--landing-btn-outline-hover-bg)', borderColor: 'var(--landing-btn-outline-border)' } }}
          >
            Iniciar Sesion
          </Button>
          {registroActivo && (
            <Button
              variant="contained"
              onClick={() => router.push('/sign-up')}
              sx={{
                bgcolor: 'var(--landing-accent)', textTransform: 'none', fontWeight: 600,
                animation: isLoaded ? 'pulse 2s ease-in-out infinite' : 'none', animationDelay: '1.5s',
                '&:hover': { bgcolor: 'var(--landing-accent-hover)' },
              }}
            >
              Registrarse
            </Button>
          )}
        </Box>
      </Box>

      {/* HERO */}
      <Box id="inicio" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: 10, md: 8 }, position: 'relative' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Box sx={{ animation: isLoaded ? 'fadeInDown 0.8s ease-out forwards' : 'none', opacity: isLoaded ? 1 : 0 }}>
            <Box component="img" src={logoSrc} alt="Logo" sx={{ height: { xs: 60, md: 80 }, mb: 3 }} />
          </Box>
          <Typography variant="h1" sx={{
            fontWeight: 800, mb: 2,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' }, lineHeight: 1.1,
            animation: isLoaded ? 'fadeInUp 0.8s ease-out forwards' : 'none', animationDelay: '0.3s', opacity: isLoaded ? 1 : 0,
            background: 'linear-gradient(135deg, var(--landing-hero-gradient-start) 0%, var(--landing-hero-gradient-end) 100%)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {config.tituloPrincipal}
          </Typography>
          <Typography variant="h3" sx={{
            fontWeight: 700, color: 'var(--landing-hero-subtitle)', mb: 2,
            fontSize: { xs: '1.2rem', md: '1.6rem' },
            animation: isLoaded ? 'fadeInUp 0.8s ease-out forwards' : 'none', animationDelay: '0.5s', opacity: isLoaded ? 1 : 0,
          }}>
            {config.subtitulo}
          </Typography>
          <Box sx={{ animation: isLoaded ? 'fadeInUp 0.8s ease-out forwards' : 'none', animationDelay: '0.7s', opacity: isLoaded ? 1 : 0 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained" size="large"
                onClick={() => router.push('/sign-in')}
                startIcon={<Iconify icon="mdi:login" width={22} />}
                endIcon={<Iconify icon="mdi:arrow-right" width={20} />}
                sx={{
                  px: 4, py: 1.5, bgcolor: 'var(--landing-primary)', textTransform: 'none',
                  fontWeight: 700, fontSize: '1rem', borderRadius: 3,
                  boxShadow: 'var(--landing-primary-shadow)',
                  '&:hover': { bgcolor: 'var(--landing-primary-hover, var(--landing-primary))', transform: 'translateY(-3px)' },
                  transition: 'all 0.3s',
                }}
              >
                Iniciar Sesion
              </Button>
              <Button
                variant="contained" size="large"
                onClick={() => router.push('/sign-up')}
                startIcon={<Iconify icon="mdi:account-plus-outline" width={22} />}
                endIcon={<Iconify icon="mdi:arrow-right" width={20} />}
                sx={{
                  px: 4, py: 1.5, bgcolor: 'var(--landing-accent)', textTransform: 'none',
                  fontWeight: 700, fontSize: '1rem', borderRadius: 3,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  '&:hover': { bgcolor: 'var(--landing-accent-hover)', transform: 'translateY(-3px)' },
                  transition: 'all 0.3s',
                }}
              >
                Registrarse
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CARRUSELES DINAMICOS */}
      {(() => {
        const anchorIds = nav.filter((n) => n.link.startsWith('#')).map((n) => n.link.slice(1)).filter((id) => id !== 'inicio' && id !== 'contacto');
        return carruseles.map((carrusel, cIdx) => (
          <CarouselSection key={carrusel.idCarrusel} carrusel={carrusel} index={cIdx} sectionId={anchorIds[cIdx]} onVisible={trackSection} />
        ));
      })()}

      {/* PLANES */}
      {planes.length > 0 && (
        <Box id="planes" sx={{ py: { xs: 8, md: 10 }, bgcolor: 'var(--landing-plans-bg)' }}>
          <Container maxWidth="lg">
            <Typography variant="h3" sx={{ color: 'var(--landing-plans-heading)', fontWeight: 700, textAlign: 'center', mb: 6, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Nuestros Planes
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
              {planes.map((plan) => (
                <Box
                  key={plan.nombre}
                  sx={{
                    width: { xs: '100%', sm: 280 },
                    bgcolor: 'var(--landing-plan-card-bg)', borderRadius: 3, p: 4, textAlign: 'center',
                    boxShadow: 'var(--landing-plan-card-shadow)',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 'var(--landing-plan-card-shadow-hover)' },
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--landing-plan-name)', mb: 1 }}>{plan.nombre}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'var(--landing-plan-price)', mb: 1 }}>
                    ${Number(plan.precio).toLocaleString()}
                    <Typography component="span" variant="body2" sx={{ color: 'var(--landing-plan-msgs)' }}>/mes</Typography>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--landing-plan-msgs)', mb: 2 }}>
                    {Number(plan.mensajes).toLocaleString()} mensajes
                  </Typography>
                  {plan.descripcion && (
                    <Typography variant="body2" sx={{ color: 'var(--landing-plan-desc)', mb: 3 }}>{plan.descripcion}</Typography>
                  )}
                  <Button variant="outlined" fullWidth sx={{ borderColor: 'var(--landing-btn-outline-border)', color: 'var(--landing-btn-outline-color)', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'var(--landing-btn-outline-hover-bg)', borderColor: 'var(--landing-btn-outline-border)' } }}>
                    Elegir plan
                  </Button>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* FOOTER */}
      <LandingFooter redes={redes} id="contacto" />

    </Box>
  );
}
