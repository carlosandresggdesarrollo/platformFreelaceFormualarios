import type React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useSiteName } from 'src/hooks/use-site-name';

import type { LoaderName } from './loader-meta';

// ---------------------------------------------------------------------------
// Shared wrapper -- full-screen centered, themed background
// ---------------------------------------------------------------------------
function LoaderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--landing-bg, #f5f5f5)',
        color: 'var(--landing-text, #333)',
      }}
    >
      {children}
    </Box>
  );
}

function LoadingText() {
  return (
    <Typography
      sx={{
        mt: 3,
        fontSize: '0.85rem',
        letterSpacing: 2,
        opacity: 0.5,
        color: 'var(--landing-text, #666)',
        fontWeight: 300,
      }}
    >
      Cargando...
    </Typography>
  );
}

// ============================= 1. pulso-logo ==============================
function PulsoLogo() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes pulso-logo-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 var(--landing-primary, #4caf50); }
          50% { transform: scale(1.12); box-shadow: 0 0 40px 10px var(--landing-accent, #81c784); }
        }
        @keyframes pulso-logo-border {
          0% { border-color: var(--landing-primary, #4caf50); }
          50% { border-color: var(--landing-accent, #81c784); }
          100% { border-color: var(--landing-primary, #4caf50); }
        }
        @keyframes pulso-logo-leaf {
          0%, 100% { transform: rotate(-10deg) scale(1); }
          50% { transform: rotate(10deg) scale(1.1); }
        }
      `}</style>
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '4px solid var(--landing-primary, #4caf50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulso-logo-breathe 2.4s ease-in-out infinite, pulso-logo-border 2.4s ease-in-out infinite',
          background: 'radial-gradient(circle, var(--landing-circle1, rgba(76,175,80,0.1)), var(--landing-circle2, rgba(129,199,132,0.05)))',
        }}
      >
        <Box
          component="span"
          sx={{ fontSize: 48, animation: 'pulso-logo-leaf 2.4s ease-in-out infinite', display: 'inline-block' }}
        >
          🍃
        </Box>
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 2. reloj ===================================
function Reloj() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes reloj-second { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes reloj-minute { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes reloj-hour   { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes reloj-tick { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
      `}</style>
      <Box sx={{ position: 'relative', width: 120, height: 120 }}>
        {/* Face */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid var(--landing-primary, #4caf50)',
            background: 'var(--landing-bg, #f5f5f5)',
          }}
        />
        {/* Hour marks */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: i % 3 === 0 ? 3 : 1.5,
              height: i % 3 === 0 ? 12 : 8,
              bgcolor: 'var(--landing-text, #333)',
              borderRadius: 1,
              transformOrigin: '50% 0%',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-46px)`,
              opacity: i % 3 === 0 ? 0.9 : 0.4,
            }}
          />
        ))}
        {/* Hour hand */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 4,
            height: 28,
            bgcolor: 'var(--landing-text, #333)',
            borderRadius: 2,
            transformOrigin: '50% 100%',
            transform: 'translate(-50%, -100%)',
            animation: 'reloj-hour 43200s linear infinite',
          }}
        />
        {/* Minute hand */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 3,
            height: 38,
            bgcolor: 'var(--landing-primary, #4caf50)',
            borderRadius: 2,
            transformOrigin: '50% 100%',
            transform: 'translate(-50%, -100%)',
            animation: 'reloj-minute 3600s linear infinite',
          }}
        />
        {/* Second hand */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 1.5,
            height: 44,
            bgcolor: 'var(--landing-accent, #e53935)',
            borderRadius: 2,
            transformOrigin: '50% 100%',
            transform: 'translate(-50%, -100%)',
            animation: 'reloj-second 4s linear infinite',
          }}
        />
        {/* Center dot */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'var(--landing-accent, #e53935)',
            transform: 'translate(-50%, -50%)',
            animation: 'reloj-tick 1s ease-in-out infinite',
          }}
        />
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 3. nube ====================================
function Nube() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes nube-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes nube-drop {
          0% { transform: translateY(0); opacity: 1; }
          80% { opacity: 0.6; }
          100% { transform: translateY(60px); opacity: 0; }
        }
      `}</style>
      <Box sx={{ position: 'relative', width: 160, height: 140 }}>
        {/* Cloud body */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 20,
            width: 120,
            height: 50,
            borderRadius: '50px',
            bgcolor: 'var(--landing-primary, #4caf50)',
            opacity: 0.25,
            animation: 'nube-float 3s ease-in-out infinite',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -25,
              left: 20,
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: 'inherit',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -18,
              left: 55,
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'inherit',
            },
          }}
        />
        {/* Raindrops */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: 58,
              left: 35 + i * 22,
              width: 3,
              height: 14,
              borderRadius: '0 0 3px 3px',
              bgcolor: 'var(--landing-accent, #81c784)',
              opacity: 0.7,
              animation: `nube-drop 1.2s ease-in ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 4. puntos ==================================
function Puntos() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes puntos-bounce {
          0%, 80%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-28px) scale(1.15); }
        }
      `}</style>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: 'var(--landing-primary, #4caf50)',
              animation: `puntos-bounce 1.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) ${i * 0.16}s infinite`,
              boxShadow: '0 4px 12px var(--landing-circle1, rgba(76,175,80,0.3))',
            }}
          />
        ))}
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 5. espiral =================================
function Espiral() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes espiral-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes espiral-dash {
          0% { stroke-dashoffset: 300; }
          50% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 300; }
        }
      `}</style>
      <Box
        sx={{
          width: 100,
          height: 100,
          animation: 'espiral-rotate 2s linear infinite',
        }}
      >
        <svg viewBox="0 0 100 100" width="100" height="100">
          <defs>
            <linearGradient id="espiral-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--landing-primary, #4caf50)" />
              <stop offset="100%" stopColor="var(--landing-accent, #81c784)" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#espiral-grad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="300"
            style={{ animation: 'espiral-dash 2s ease-in-out infinite' }}
          />
        </svg>
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 6. adn =====================================
function Adn() {
  const count = 10;
  return (
    <LoaderWrapper>
      <style>{`
        ${Array.from({ length: count })
          .map(
            (_, i) => `
          @keyframes adn-dot-a-${i} {
            0%, 100% { transform: translateY(${Math.sin((i / count) * Math.PI * 2) * 20}px); }
            50% { transform: translateY(${Math.sin((i / count) * Math.PI * 2 + Math.PI) * 20}px); }
          }
          @keyframes adn-dot-b-${i} {
            0%, 100% { transform: translateY(${Math.sin((i / count) * Math.PI * 2 + Math.PI) * 20}px); }
            50% { transform: translateY(${Math.sin((i / count) * Math.PI * 2) * 20}px); }
          }
        `
          )
          .join('')}
      `}</style>
      <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center', height: 80 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', height: 80 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'var(--landing-primary, #4caf50)',
                position: 'absolute',
                top: '50%',
                animation: `adn-dot-a-${i} 2s ease-in-out infinite`,
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'var(--landing-accent, #81c784)',
                position: 'absolute',
                top: '50%',
                animation: `adn-dot-b-${i} 2s ease-in-out infinite`,
              }}
            />
            {/* Connecting bar */}
            <Box
              sx={{
                width: 1,
                height: 40,
                bgcolor: 'var(--landing-text, #333)',
                opacity: 0.15,
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          </Box>
        ))}
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 7. escritura ===============================
function Escritura() {
  const text = `${useSiteName()}...`;
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes escritura-type {
          0% { width: 0; }
          70% { width: ${text.length}ch; }
          85% { width: ${text.length}ch; }
          100% { width: 0; }
        }
        @keyframes escritura-blink {
          0%, 100% { border-right-color: transparent; }
          50% { border-right-color: var(--landing-primary, #4caf50); }
        }
      `}</style>
      <Box
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '1.6rem',
          fontWeight: 600,
          color: 'var(--landing-primary, #4caf50)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          borderRight: '3px solid var(--landing-primary, #4caf50)',
          animation: `escritura-type 4s steps(${text.length}) infinite, escritura-blink 0.7s step-end infinite`,
          pr: 0.5,
        }}
      >
        {text}
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 8. latido ==================================
function Latido() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes latido-line {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes latido-heart {
          0%, 100% { transform: scale(1); }
          10% { transform: scale(1.2); }
          20% { transform: scale(1); }
          30% { transform: scale(1.15); }
          40% { transform: scale(1); }
        }
      `}</style>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box component="span" sx={{ fontSize: 36, animation: 'latido-heart 1.5s ease-in-out infinite', display: 'inline-block' }}>
          ❤️
        </Box>
        <svg width="200" height="60" viewBox="0 0 200 60">
          <polyline
            points="0,30 30,30 40,30 50,10 60,50 70,20 80,40 90,30 120,30 130,30 140,10 150,50 160,20 170,40 180,30 200,30"
            fill="none"
            stroke="var(--landing-primary, #4caf50)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="600"
            style={{ animation: 'latido-line 2s linear infinite' }}
          />
        </svg>
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 9. ola =====================================
function Ola() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes ola-wave1 { 0% { transform: translateX(0); } 100% { transform: translateX(-200px); } }
        @keyframes ola-wave2 { 0% { transform: translateX(0); } 100% { transform: translateX(-200px); } }
        @keyframes ola-wave3 { 0% { transform: translateX(0); } 100% { transform: translateX(-200px); } }
      `}</style>
      <Box sx={{ width: 200, height: 100, overflow: 'hidden', borderRadius: 2, position: 'relative' }}>
        {[
          { anim: 'ola-wave1', dur: '3s', opacity: 0.3, bottom: 0, color: 'var(--landing-primary, #4caf50)' },
          { anim: 'ola-wave2', dur: '4s', opacity: 0.2, bottom: 10, color: 'var(--landing-accent, #81c784)' },
          { anim: 'ola-wave3', dur: '5s', opacity: 0.15, bottom: 20, color: 'var(--landing-circle1, rgba(76,175,80,0.5))' },
        ].map((wave, idx) => (
          <Box key={idx} sx={{ position: 'absolute', bottom: wave.bottom, left: 0, width: 400, height: 60, opacity: wave.opacity, animation: `${wave.anim} ${wave.dur} linear infinite` }}>
            <svg width="400" height="60" viewBox="0 0 400 60">
              <path
                d="M0,30 C50,10 100,50 150,30 C200,10 250,50 300,30 C350,10 400,50 400,30 L400,60 L0,60 Z"
                fill={wave.color}
              />
            </svg>
          </Box>
        ))}
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 10. cubo-3d ================================
function Cubo3d() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes cubo3d-rotate {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          33% { transform: rotateX(180deg) rotateY(90deg) rotateZ(0deg); }
          66% { transform: rotateX(270deg) rotateY(180deg) rotateZ(90deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(0deg); }
        }
      `}</style>
      <Box sx={{ perspective: 400, width: 80, height: 80 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            position: 'relative',
            transformStyle: 'preserve-3d',
            animation: 'cubo3d-rotate 4s ease-in-out infinite',
          }}
        >
          {/* 6 faces */}
          {[
            { transform: 'translateZ(40px)', bg: 'var(--landing-primary, rgba(76,175,80,0.5))' },
            { transform: 'rotateY(180deg) translateZ(40px)', bg: 'var(--landing-accent, rgba(129,199,132,0.5))' },
            { transform: 'rotateY(90deg) translateZ(40px)', bg: 'var(--landing-circle1, rgba(76,175,80,0.35))' },
            { transform: 'rotateY(-90deg) translateZ(40px)', bg: 'var(--landing-circle2, rgba(129,199,132,0.35))' },
            { transform: 'rotateX(90deg) translateZ(40px)', bg: 'var(--landing-primary, rgba(76,175,80,0.25))' },
            { transform: 'rotateX(-90deg) translateZ(40px)', bg: 'var(--landing-accent, rgba(129,199,132,0.25))' },
          ].map((face, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 80,
                height: 80,
                border: '2px solid var(--landing-primary, #4caf50)',
                opacity: 0.7,
                bgcolor: face.bg,
                transform: face.transform,
                backfaceVisibility: 'visible',
              }}
            />
          ))}
        </Box>
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 11. orbita =================================
function Orbita() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes orbita-spin1 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes orbita-spin2 { 0% { transform: rotate(120deg); } 100% { transform: rotate(480deg); } }
        @keyframes orbita-spin3 { 0% { transform: rotate(240deg); } 100% { transform: rotate(600deg); } }
        @keyframes orbita-glow {
          0%, 100% { box-shadow: 0 0 8px var(--landing-primary, #4caf50); }
          50% { box-shadow: 0 0 20px var(--landing-accent, #81c784); }
        }
      `}</style>
      <Box sx={{ position: 'relative', width: 140, height: 140 }}>
        {/* Central sun */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: 'var(--landing-primary, #4caf50)',
            transform: 'translate(-50%, -50%)',
            animation: 'orbita-glow 2s ease-in-out infinite',
          }}
        />
        {/* Orbits */}
        {[
          { size: 80, dur: '2s', anim: 'orbita-spin1', dotColor: 'var(--landing-primary, #4caf50)', dotSize: 10 },
          { size: 110, dur: '3.2s', anim: 'orbita-spin2', dotColor: 'var(--landing-accent, #81c784)', dotSize: 8 },
          { size: 140, dur: '4.8s', anim: 'orbita-spin3', dotColor: 'var(--landing-circle1, rgba(76,175,80,0.7))', dotSize: 6 },
        ].map((orbit, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: orbit.size,
              height: orbit.size,
              border: '1px solid var(--landing-text, rgba(0,0,0,0.08))',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: orbit.size,
                height: orbit.size,
                transformOrigin: '0 0',
                animation: `${orbit.anim} ${orbit.dur} linear infinite`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -orbit.dotSize / 2,
                  left: orbit.size / 2 - orbit.dotSize / 2,
                  width: orbit.dotSize,
                  height: orbit.dotSize,
                  borderRadius: '50%',
                  bgcolor: orbit.dotColor,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 12. reloj-arena ============================
function RelojArena() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes reloj-arena-flip {
          0%, 45% { transform: rotate(0deg); }
          50%, 95% { transform: rotate(180deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes reloj-arena-sand-top {
          0% { height: 30px; }
          45% { height: 2px; }
          50% { height: 30px; }
          95% { height: 2px; }
          100% { height: 30px; }
        }
        @keyframes reloj-arena-sand-bottom {
          0% { height: 2px; }
          45% { height: 30px; }
          50% { height: 2px; }
          95% { height: 30px; }
          100% { height: 2px; }
        }
        @keyframes reloj-arena-stream {
          0%, 46%, 96%, 100% { opacity: 0; }
          5%, 44% { opacity: 1; }
          51%, 94% { opacity: 1; }
        }
      `}</style>
      <Box
        sx={{
          position: 'relative',
          width: 60,
          height: 100,
          animation: 'reloj-arena-flip 4s ease-in-out infinite',
        }}
      >
        {/* Top glass */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 52,
            height: 42,
            borderRadius: '4px 4px 50% 50%',
            border: '2px solid var(--landing-primary, #4caf50)',
            borderBottom: 'none',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <Box
            sx={{
              width: '70%',
              bgcolor: 'var(--landing-accent, #81c784)',
              borderRadius: '2px 2px 0 0',
              animation: 'reloj-arena-sand-top 4s ease-in-out infinite',
            }}
          />
        </Box>
        {/* Neck */}
        <Box
          sx={{
            position: 'absolute',
            top: 46,
            left: '50%',
            width: 4,
            height: 8,
            bgcolor: 'var(--landing-primary, #4caf50)',
            transform: 'translateX(-50%)',
          }}
        />
        {/* Stream */}
        <Box
          sx={{
            position: 'absolute',
            top: 46,
            left: '50%',
            width: 2,
            height: 8,
            bgcolor: 'var(--landing-accent, #81c784)',
            transform: 'translateX(-50%)',
            animation: 'reloj-arena-stream 4s ease-in-out infinite',
          }}
        />
        {/* Bottom glass */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            width: 52,
            height: 42,
            borderRadius: '50% 50% 4px 4px',
            border: '2px solid var(--landing-primary, #4caf50)',
            borderTop: 'none',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <Box
            sx={{
              width: '70%',
              bgcolor: 'var(--landing-accent, #81c784)',
              borderRadius: '2px 2px 0 0',
              animation: 'reloj-arena-sand-bottom 4s ease-in-out infinite',
            }}
          />
        </Box>
        {/* Frame top/bottom bars */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: 'var(--landing-primary, #4caf50)', borderRadius: 1 }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, bgcolor: 'var(--landing-primary, #4caf50)', borderRadius: 1 }} />
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 13. brujula ================================
function Brujula() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes brujula-needle {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(90deg); }
          50% { transform: rotate(180deg); }
          60% { transform: rotate(160deg); }
          70% { transform: rotate(190deg); }
          80% { transform: rotate(355deg); }
          90% { transform: rotate(365deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes brujula-glow {
          0%, 100% { box-shadow: 0 0 12px var(--landing-circle1, rgba(76,175,80,0.3)); }
          50% { box-shadow: 0 0 28px var(--landing-circle2, rgba(129,199,132,0.4)); }
        }
      `}</style>
      <Box
        sx={{
          position: 'relative',
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '3px solid var(--landing-primary, #4caf50)',
          animation: 'brujula-glow 3s ease-in-out infinite',
        }}
      >
        {/* Cardinal points */}
        {['N', 'E', 'S', 'O'].map((d, i) => (
          <Typography
            key={d}
            sx={{
              position: 'absolute',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: d === 'N' ? 'var(--landing-accent, #e53935)' : 'var(--landing-text, #666)',
              ...(i === 0 && { top: 6, left: '50%', transform: 'translateX(-50%)' }),
              ...(i === 1 && { right: 6, top: '50%', transform: 'translateY(-50%)' }),
              ...(i === 2 && { bottom: 6, left: '50%', transform: 'translateX(-50%)' }),
              ...(i === 3 && { left: 6, top: '50%', transform: 'translateY(-50%)' }),
            }}
          >
            {d}
          </Typography>
        ))}
        {/* Needle */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 4,
            height: 80,
            transform: 'translate(-50%, -50%)',
            transformOrigin: 'center center',
            animation: 'brujula-needle 3s ease-in-out infinite',
          }}
        >
          {/* North half -- red */}
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '38px solid var(--landing-accent, #e53935)',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          {/* South half */}
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '38px solid var(--landing-text, #999)',
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </Box>
        {/* Center pin */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'var(--landing-primary, #4caf50)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
          }}
        />
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 14. ondas-agua =============================
function OndasAgua() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes ondas-agua-ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.7; border-width: 3px; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; border-width: 1px; }
        }
      `}</style>
      <Box sx={{ position: 'relative', width: 160, height: 160 }}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 140,
              height: 140,
              borderRadius: '50%',
              border: '3px solid var(--landing-primary, #4caf50)',
              animation: `ondas-agua-ripple 2.8s ease-out ${i * 0.7}s infinite`,
            }}
          />
        ))}
        {/* Center dot */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: 'var(--landing-accent, #81c784)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 15. atomo ==================================
function Atomo() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes atomo-orbit1 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes atomo-orbit2 { 0% { transform: rotate(60deg) rotateX(70deg) rotate(0deg); } 100% { transform: rotate(60deg) rotateX(70deg) rotate(360deg); } }
        @keyframes atomo-orbit3 { 0% { transform: rotate(-60deg) rotateX(70deg) rotate(0deg); } 100% { transform: rotate(-60deg) rotateX(70deg) rotate(360deg); } }
        @keyframes atomo-nucleus {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 12px var(--landing-primary, #4caf50); }
          50% { transform: translate(-50%, -50%) scale(1.2); box-shadow: 0 0 24px var(--landing-accent, #81c784); }
        }
      `}</style>
      <Box sx={{ position: 'relative', width: 140, height: 140, perspective: 500 }}>
        {/* Nucleus */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: 'var(--landing-primary, #4caf50)',
            animation: 'atomo-nucleus 2s ease-in-out infinite',
            zIndex: 2,
          }}
        />
        {/* 3 orbital rings with electrons */}
        {[
          { anim: 'atomo-orbit1', transform: 'none' },
          { anim: 'atomo-orbit2', transform: 'rotate(60deg) rotateX(70deg)' },
          { anim: 'atomo-orbit3', transform: 'rotate(-60deg) rotateX(70deg)' },
        ].map((orb, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 120,
              height: 120,
              border: '1.5px solid var(--landing-primary, rgba(76,175,80,0.3))',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              transformStyle: 'preserve-3d',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                animation: `${orb.anim} ${2 + i * 0.5}s linear infinite`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  left: '50%',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'var(--landing-accent, #81c784)',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 6px var(--landing-accent, #81c784)',
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 16. engranajes =============================
function Engranajes() {
  const teeth = (count: number, r: number) =>
    Array.from({ length: count })
      .map((_, i) => {
        const angle = (i / count) * 360;
        return `rotate(${angle}deg) translateY(-${r}px)`;
      });

  return (
    <LoaderWrapper>
      <style>{`
        @keyframes engranajes-cw  { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes engranajes-ccw { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
      `}</style>
      <Box sx={{ position: 'relative', width: 160, height: 100 }}>
        {/* Gear 1 - left */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            width: 70,
            height: 70,
            animation: 'engranajes-cw 3s linear infinite',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '3px solid var(--landing-primary, #4caf50)',
              transform: 'translate(-50%, -50%)',
            }}
          />
          {/* Teeth */}
          {teeth(8, 28).map((t, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 8,
                height: 10,
                bgcolor: 'var(--landing-primary, #4caf50)',
                borderRadius: 1,
                transformOrigin: 'center center',
                transform: `translate(-50%, -50%) ${t}`,
              }}
            />
          ))}
          {/* Center hole */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'var(--landing-bg, #f5f5f5)',
              border: '2px solid var(--landing-primary, #4caf50)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </Box>
        {/* Gear 2 - right */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 72,
            width: 55,
            height: 55,
            animation: 'engranajes-ccw 2.35s linear infinite',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '3px solid var(--landing-accent, #81c784)',
              transform: 'translate(-50%, -50%)',
            }}
          />
          {teeth(6, 22).map((t, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 7,
                height: 9,
                bgcolor: 'var(--landing-accent, #81c784)',
                borderRadius: 1,
                transformOrigin: 'center center',
                transform: `translate(-50%, -50%) ${t}`,
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'var(--landing-bg, #f5f5f5)',
              border: '2px solid var(--landing-accent, #81c784)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </Box>
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 17. barra-neon =============================
function BarraNeon() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes barra-neon-fill {
          0% { width: 0%; box-shadow: 0 0 8px var(--landing-primary, #4caf50); }
          50% { box-shadow: 0 0 24px var(--landing-accent, #81c784), 0 0 48px var(--landing-primary, #4caf50); }
          90% { width: 100%; }
          100% { width: 0%; box-shadow: 0 0 8px var(--landing-primary, #4caf50); }
        }
        @keyframes barra-neon-glow {
          0%, 100% { box-shadow: 0 0 6px var(--landing-circle1, rgba(76,175,80,0.2)); }
          50% { box-shadow: 0 0 14px var(--landing-circle2, rgba(129,199,132,0.35)); }
        }
      `}</style>
      <Box
        sx={{
          width: 220,
          height: 8,
          borderRadius: 4,
          bgcolor: 'var(--landing-text, rgba(0,0,0,0.08))',
          overflow: 'hidden',
          animation: 'barra-neon-glow 2s ease-in-out infinite',
        }}
      >
        <Box
          sx={{
            height: '100%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, var(--landing-primary, #4caf50), var(--landing-accent, #81c784))',
            animation: 'barra-neon-fill 2.5s ease-in-out infinite',
          }}
        />
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 18. metamorfosis ===========================
function Metamorfosis() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes metamorfosis-shape {
          0%, 100% { border-radius: 50%; transform: rotate(0deg); }
          25% { border-radius: 10%; transform: rotate(90deg); }
          50% { border-radius: 50% 0 50% 0; transform: rotate(180deg); }
          75% { border-radius: 20% 50% 20% 50%; transform: rotate(270deg); }
        }
        @keyframes metamorfosis-color {
          0%, 100% { background: var(--landing-primary, #4caf50); }
          33% { background: var(--landing-accent, #81c784); }
          66% { background: var(--landing-circle1, rgba(76,175,80,0.7)); }
        }
        @keyframes metamorfosis-shadow {
          0%, 100% { box-shadow: 0 0 0 0 var(--landing-circle2, rgba(129,199,132,0.4)); }
          50% { box-shadow: 0 0 30px 8px var(--landing-circle1, rgba(76,175,80,0.3)); }
        }
      `}</style>
      <Box
        sx={{
          width: 80,
          height: 80,
          animation:
            'metamorfosis-shape 4s ease-in-out infinite, metamorfosis-color 6s ease-in-out infinite, metamorfosis-shadow 3s ease-in-out infinite',
          opacity: 0.85,
        }}
      />
      <LoadingText />
    </LoaderWrapper>
  );
}

// ============================= 19. respiracion ============================
function Respiracion() {
  return (
    <LoaderWrapper>
      <style>{`
        @keyframes respiracion-breathe {
          0%, 100% { transform: scale(0.6); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
        }
        @keyframes respiracion-ring {
          0%, 100% { transform: scale(0.6); opacity: 0.2; }
          50% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
      <Box sx={{ position: 'relative', width: 140, height: 140 }}>
        {/* Outer ring */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--landing-primary, #4caf50)',
            animation: 'respiracion-ring 4s ease-in-out infinite',
          }}
        />
        {/* Main circle */}
        <Box
          sx={{
            position: 'absolute',
            inset: 10,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, var(--landing-accent, #81c784), var(--landing-primary, #4caf50))',
            animation: 'respiracion-breathe 4s ease-in-out infinite',
            boxShadow: '0 0 40px var(--landing-circle1, rgba(76,175,80,0.3))',
          }}
        />
      </Box>
      <LoadingText />
    </LoaderWrapper>
  );
}

// ===========================================================================
// Reduced-motion global style
// ===========================================================================
function ReducedMotionStyle() {
  return (
    <style>{`
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
      }
    `}</style>
  );
}

// ===========================================================================
// Public API
// ===========================================================================

const LOADER_COMPONENTS: Record<LoaderName, () => React.ReactElement> = {
  'pulso-logo': PulsoLogo,
  reloj: Reloj,
  nube: Nube,
  puntos: Puntos,
  espiral: Espiral,
  adn: Adn,
  escritura: Escritura,
  latido: Latido,
  ola: Ola,
  'cubo-3d': Cubo3d,
  orbita: Orbita,
  'reloj-arena': RelojArena,
  brujula: Brujula,
  'ondas-agua': OndasAgua,
  atomo: Atomo,
  engranajes: Engranajes,
  'barra-neon': BarraNeon,
  metamorfosis: Metamorfosis,
  respiracion: Respiracion,
};

export function LoadingScreen({ loader = 'pulso-logo', color }: { loader?: LoaderName; color?: string }) {
  const Component = LOADER_COMPONENTS[loader] || LOADER_COMPONENTS['pulso-logo'];
  const colorStyle = color ? { '--landing-primary': color, '--landing-accent': color } as React.CSSProperties : undefined;
  return (
    <Box style={colorStyle}>
      <ReducedMotionStyle />
      <Component />
    </Box>
  );
}
