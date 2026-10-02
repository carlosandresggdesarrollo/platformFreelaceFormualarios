import type React from 'react';

import Box from '@mui/material/Box';

import type { AnimationName } from './animation-meta';

// ----------------------------------------------------------------------

const REDUCED_MOTION = `@media (prefers-reduced-motion: reduce) {
  .bg-anim * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}`;

const wrapperSx = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none' as const,
  overflow: 'hidden',
};

// ----------------------------------------------------------------------
// 1. Minimalista
// ----------------------------------------------------------------------

const MINIMALISTA_KF = `
  @keyframes bg-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
`;

function Minimalista() {
  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{MINIMALISTA_KF}{REDUCED_MOTION}</style>
      <Box sx={{ position: 'absolute', top: '15%', left: '8%', width: 80, height: 80, borderRadius: '50%', bgcolor: 'var(--landing-circle1)', animation: 'bg-float 8s ease-in-out infinite' }} />
      <Box sx={{ position: 'absolute', top: '25%', right: '12%', width: 60, height: 60, borderRadius: '50%', bgcolor: 'var(--landing-circle2)', animation: 'bg-float 10s ease-in-out infinite', animationDelay: '2s' }} />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 2. Particulas
// ----------------------------------------------------------------------

const PARTICULAS_KF = `
  @keyframes bg-float-up {
    0% { transform: translateY(100vh) translateX(0); opacity: 0; }
    10% { opacity: var(--p-opacity, 0.2); }
    90% { opacity: var(--p-opacity, 0.2); }
    100% { transform: translateY(-10vh) translateX(var(--p-drift, 20px)); opacity: 0; }
  }
`;

function Particulas() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    key: i,
    left: `${(i * 5.5) % 100}%`,
    size: 3 + (i % 4),
    duration: 12 + (i % 8) * 2,
    delay: (i * 1.3) % 10,
    opacity: 0.12 + (i % 5) * 0.04,
    drift: -30 + (i % 7) * 10,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{PARTICULAS_KF}{REDUCED_MOTION}</style>
      {dots.map((d) => (
        <Box
          key={d.key}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: d.left,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            bgcolor: d.key % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0,
            animation: `bg-float-up ${d.duration}s linear infinite`,
            animationDelay: `${d.delay}s`,
            '--p-opacity': d.opacity,
            '--p-drift': `${d.drift}px`,
          } as any}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 3. Ondas
// ----------------------------------------------------------------------

const ONDAS_KF = `
  @keyframes bg-wave-move { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
`;

function Ondas() {
  const waves = [
    { y: '65%', opacity: 0.08, dur: 20, color: 'var(--landing-primary)' },
    { y: '72%', opacity: 0.06, dur: 25, color: 'var(--landing-accent)' },
    { y: '80%', opacity: 0.05, dur: 18, color: 'var(--landing-circle1)' },
  ];

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{ONDAS_KF}{REDUCED_MOTION}</style>
      {waves.map((w, i) => (
        <Box key={i} sx={{ position: 'absolute', top: w.y, left: 0, width: '200%', height: 120, opacity: w.opacity, animation: `bg-wave-move ${w.dur}s linear infinite` }}>
          <svg width="100%" height="120" viewBox="0 0 2400 120" preserveAspectRatio="none">
            <path
              d="M0,60 C200,10 400,110 600,60 C800,10 1000,110 1200,60 C1400,10 1600,110 1800,60 C2000,10 2200,110 2400,60"
              fill="none"
              stroke={w.color}
              strokeWidth="2"
            />
          </svg>
        </Box>
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 4. Burbujas
// ----------------------------------------------------------------------

const BURBUJAS_KF = `
  @keyframes bg-bubble-rise {
    0% { transform: translateY(100vh) translateX(0) scale(0.4); opacity: 0; }
    10% { opacity: var(--b-opacity, 0.15); }
    80% { opacity: var(--b-opacity, 0.15); }
    100% { transform: translateY(-10vh) translateX(var(--b-drift, 30px)) scale(1); opacity: 0; }
  }
`;

function Burbujas() {
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    key: i,
    left: `${(i * 8.3) % 100}%`,
    size: 12 + (i % 5) * 8,
    duration: 14 + (i % 6) * 2,
    delay: (i * 1.5) % 12,
    opacity: 0.08 + (i % 4) * 0.03,
    drift: -40 + (i % 9) * 10,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{BURBUJAS_KF}{REDUCED_MOTION}</style>
      {bubbles.map((b) => (
        <Box
          key={b.key}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: b.key % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0,
            animation: `bg-bubble-rise ${b.duration}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
            '--b-opacity': b.opacity,
            '--b-drift': `${b.drift}px`,
          } as any}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 5. Gradiente
// ----------------------------------------------------------------------

const GRADIENTE_KF = `
  @keyframes bg-gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

function Gradiente() {
  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{GRADIENTE_KF}{REDUCED_MOTION}</style>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          background: 'linear-gradient(135deg, var(--landing-primary), var(--landing-accent), var(--landing-circle1), var(--landing-circle2))',
          backgroundSize: '400% 400%',
          animation: 'bg-gradient-shift 20s ease infinite',
        }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 6. Pulso
// ----------------------------------------------------------------------

const PULSO_KF = `
  @keyframes bg-pulse-expand {
    0% { transform: translate(-50%,-50%) scale(0.2); opacity: 0.2; }
    100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
  }
`;

function Pulso() {
  const rings = [0, 3, 6, 9];

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{PULSO_KF}{REDUCED_MOTION}</style>
      {rings.map((delay, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '80vmin',
            height: '80vmin',
            borderRadius: '50%',
            border: '1px solid',
            borderColor: i % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0,
            animation: `bg-pulse-expand 12s ease-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 7. Diagonales
// ----------------------------------------------------------------------

const DIAGONALES_KF = `
  @keyframes bg-diagonal-scroll {
    0% { background-position: 0 0; }
    100% { background-position: 60px 60px; }
  }
`;

function Diagonales() {
  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{DIAGONALES_KF}{REDUCED_MOTION}</style>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          background: 'repeating-linear-gradient(45deg, var(--landing-primary) 0px, var(--landing-primary) 1px, transparent 1px, transparent 30px)',
          backgroundSize: '42.43px 42.43px',
          animation: 'bg-diagonal-scroll 15s linear infinite',
        }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------
// 8. Estrellas
// ----------------------------------------------------------------------

const ESTRELLAS_KF = `
  @keyframes bg-twinkle {
    0%, 100% { opacity: 0; transform: scale(0.5); }
    50% { opacity: var(--s-opacity, 0.3); transform: scale(1); }
  }
`;

function Estrellas() {
  const stars = Array.from({ length: 25 }, (_, i) => ({
    key: i,
    top: `${(i * 17 + 3) % 95}%`,
    left: `${(i * 13 + 7) % 97}%`,
    size: 1 + (i % 3),
    duration: 4 + (i % 6) * 2,
    delay: (i * 0.7) % 8,
    opacity: 0.15 + (i % 5) * 0.05,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{ESTRELLAS_KF}{REDUCED_MOTION}</style>
      {stars.map((s) => (
        <Box
          key={s.key}
          sx={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            bgcolor: s.key % 3 === 0 ? 'var(--landing-accent)' : 'var(--landing-primary)',
            opacity: 0,
            animation: `bg-twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
            '--s-opacity': s.opacity,
          } as any}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 9. Geometria
// ----------------------------------------------------------------------

const GEOMETRIA_KF = `
  @keyframes bg-geo-float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-15px) rotate(5deg); }
    50% { transform: translateY(-8px) rotate(-3deg); }
    75% { transform: translateY(-20px) rotate(2deg); }
  }
`;

function Geometria() {
  const shapes: Array<{ top: string; left: string; type: 'circle' | 'square' | 'triangle'; size: number; dur: number; delay: number }> = [
    { top: '10%', left: '5%', type: 'square', size: 20, dur: 12, delay: 0 },
    { top: '30%', left: '85%', type: 'circle', size: 16, dur: 15, delay: 2 },
    { top: '60%', left: '15%', type: 'triangle', size: 18, dur: 10, delay: 1 },
    { top: '20%', left: '50%', type: 'circle', size: 12, dur: 18, delay: 3 },
    { top: '75%', left: '70%', type: 'square', size: 14, dur: 14, delay: 4 },
    { top: '45%', left: '35%', type: 'triangle', size: 22, dur: 16, delay: 2 },
    { top: '85%', left: '90%', type: 'circle', size: 10, dur: 11, delay: 5 },
  ];

  const shapeStyle = (s: typeof shapes[0]) => {
    const base: any = {
      position: 'absolute',
      top: s.top,
      left: s.left,
      opacity: 0.1,
      animation: `bg-geo-float ${s.dur}s ease-in-out infinite`,
      animationDelay: `${s.delay}s`,
    };
    if (s.type === 'circle') {
      return { ...base, width: s.size, height: s.size, borderRadius: '50%', bgcolor: 'var(--landing-primary)' };
    }
    if (s.type === 'square') {
      return { ...base, width: s.size, height: s.size, borderRadius: 2, border: '1.5px solid var(--landing-accent)' };
    }
    // triangle via CSS borders
    return {
      ...base,
      width: 0,
      height: 0,
      borderLeft: `${s.size / 2}px solid transparent`,
      borderRight: `${s.size / 2}px solid transparent`,
      borderBottom: `${s.size}px solid var(--landing-primary)`,
      opacity: 0.08,
    };
  };

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{GEOMETRIA_KF}{REDUCED_MOTION}</style>
      {shapes.map((s, i) => (
        <Box key={i} sx={shapeStyle(s)} />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 10. Red (Network)
// ----------------------------------------------------------------------

const RED_KF = `
  @keyframes bg-net-drift {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(var(--n-dx, 8px), var(--n-dy, -6px)); }
    66% { transform: translate(calc(var(--n-dx, 8px) * -0.5), calc(var(--n-dy, -6px) * -0.5)); }
  }
`;

function Red() {
  const nodes = [
    { cx: 10, cy: 20 }, { cx: 25, cy: 60 }, { cx: 40, cy: 15 },
    { cx: 55, cy: 45 }, { cx: 70, cy: 25 }, { cx: 85, cy: 55 },
    { cx: 15, cy: 80 }, { cx: 45, cy: 75 }, { cx: 65, cy: 70 },
    { cx: 90, cy: 85 }, { cx: 30, cy: 40 }, { cx: 75, cy: 50 },
    { cx: 50, cy: 90 }, { cx: 20, cy: 45 }, { cx: 80, cy: 10 },
  ];

  const edges = [
    [0, 1], [0, 3], [1, 2], [2, 4], [3, 5], [4, 5],
    [1, 6], [3, 7], [5, 8], [7, 9], [6, 7], [8, 9],
    [2, 10], [10, 3], [4, 11], [11, 5], [7, 12], [0, 13],
    [13, 10], [4, 14],
  ];

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{RED_KF}{REDUCED_MOTION}</style>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
        {edges.map(([a, b], i) => (
          <line
            key={`e${i}`}
            x1={nodes[a].cx}
            y1={nodes[a].cy}
            x2={nodes[b].cx}
            y2={nodes[b].cy}
            stroke="var(--landing-primary)"
            strokeWidth="0.15"
            opacity="0.12"
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={`n${i}`}
            cx={n.cx}
            cy={n.cy}
            r="0.5"
            fill="var(--landing-accent)"
            opacity="0.2"
            style={{
              animation: `bg-net-drift ${10 + (i % 5) * 3}s ease-in-out infinite`,
              animationDelay: `${(i * 0.8) % 6}s`,
              '--n-dx': `${-1 + (i % 3)}%`,
              '--n-dy': `${-1 + ((i + 1) % 3)}%`,
            } as any}
          />
        ))}
      </svg>
    </Box>
  );
}

// ----------------------------------------------------------------------
// 11. Aurora
// ----------------------------------------------------------------------

const AURORA_KF = `
  @keyframes bg-aurora-sway {
    0%, 100% { transform: translateX(0) scaleY(1); }
    25% { transform: translateX(5%) scaleY(1.1); }
    50% { transform: translateX(-3%) scaleY(0.9); }
    75% { transform: translateX(4%) scaleY(1.05); }
  }
`;

function Aurora() {
  const bands = [
    { top: '20%', color: 'var(--landing-primary)', blur: 100, opacity: 0.06, dur: 18, delay: 0 },
    { top: '35%', color: 'var(--landing-accent)', blur: 120, opacity: 0.05, dur: 22, delay: 3 },
    { top: '50%', color: 'var(--landing-circle1)', blur: 90, opacity: 0.07, dur: 15, delay: 1 },
    { top: '65%', color: 'var(--landing-circle2)', blur: 110, opacity: 0.04, dur: 20, delay: 5 },
  ];

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{AURORA_KF}{REDUCED_MOTION}</style>
      {bands.map((b, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: b.top,
            left: '-10%',
            width: '120%',
            height: 150,
            bgcolor: b.color,
            filter: `blur(${b.blur}px)`,
            opacity: b.opacity,
            borderRadius: '50%',
            animation: `bg-aurora-sway ${b.dur}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 12. Confeti
// ----------------------------------------------------------------------

const CONFETI_KF = `
  @keyframes bg-confetti-fall {
    0% { transform: translateY(-5vh) rotate(0deg); opacity: 0; }
    10% { opacity: var(--c-opacity, 0.2); }
    90% { opacity: var(--c-opacity, 0.2); }
    100% { transform: translateY(105vh) rotate(var(--c-rot, 360deg)); opacity: 0; }
  }
`;

function Confeti() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    key: i,
    left: `${(i * 5.5) % 98}%`,
    width: 4 + (i % 3),
    height: 2 + (i % 2),
    duration: 10 + (i % 8) * 2,
    delay: (i * 0.9) % 8,
    opacity: 0.12 + (i % 4) * 0.04,
    rotation: 180 + (i % 4) * 90,
    initialRot: (i * 30) % 360,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{CONFETI_KF}{REDUCED_MOTION}</style>
      {pieces.map((p) => (
        <Box
          key={p.key}
          sx={{
            position: 'absolute',
            top: 0,
            left: p.left,
            width: p.width,
            height: p.height,
            borderRadius: 0.5,
            bgcolor: p.key % 3 === 0 ? 'var(--landing-primary)' : p.key % 3 === 1 ? 'var(--landing-accent)' : 'var(--landing-circle1)',
            opacity: 0,
            transform: `rotate(${p.initialRot}deg)`,
            animation: `bg-confetti-fall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            '--c-opacity': p.opacity,
            '--c-rot': `${p.rotation}deg`,
          } as any}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 13. Hexagonos
// ----------------------------------------------------------------------

const HEXAGONOS_KF = `
  @keyframes bg-hex-pulse {
    0%, 100% { opacity: 0.04; transform: scale(1); }
    50% { opacity: 0.1; transform: scale(1.05); }
  }
`;

function Hexagonos() {
  const hexes = Array.from({ length: 12 }, (_, i) => ({
    key: i,
    top: `${10 + Math.floor(i / 4) * 30}%`,
    left: `${5 + (i % 4) * 25 + (Math.floor(i / 4) % 2 === 1 ? 12 : 0)}%`,
    size: 50 + (i % 3) * 10,
    delay: (i * 0.8) % 6,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{HEXAGONOS_KF}{REDUCED_MOTION}</style>
      {hexes.map((h) => (
        <Box
          key={h.key}
          sx={{
            position: 'absolute',
            top: h.top,
            left: h.left,
            width: h.size,
            height: h.size,
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            border: '1px solid',
            borderColor: h.key % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0.04,
            animation: `bg-hex-pulse ${10 + (h.key % 4) * 2}s ease-in-out infinite`,
            animationDelay: `${h.delay}s`,
          }}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 14. Concentricas
// ----------------------------------------------------------------------

const CONCENTRICAS_KF = `
  @keyframes bg-ripple {
    0% { transform: translate(-50%,-50%) scale(0); opacity: 0.15; }
    100% { transform: translate(-50%,-50%) scale(1); opacity: 0; }
  }
`;

function Concentricas() {
  const rings = [0, 2.5, 5, 7.5, 10];

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{CONCENTRICAS_KF}{REDUCED_MOTION}</style>
      {rings.map((delay, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '90vmin',
            height: '90vmin',
            borderRadius: '50%',
            border: '1px solid',
            borderColor: i % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0,
            animation: 'bg-ripple 12s ease-out infinite',
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 15. Copos
// ----------------------------------------------------------------------

const COPOS_KF = `
  @keyframes bg-snow-fall {
    0% { transform: translateY(-5vh) translateX(0); opacity: 0; }
    10% { opacity: var(--sf-opacity, 0.15); }
    90% { opacity: var(--sf-opacity, 0.15); }
    100% { transform: translateY(105vh) translateX(var(--sf-drift, 30px)); opacity: 0; }
  }
`;

function Copos() {
  const flakes = Array.from({ length: 18 }, (_, i) => ({
    key: i,
    left: `${(i * 5.5) % 98}%`,
    size: 2 + (i % 4),
    duration: 12 + (i % 7) * 2,
    delay: (i * 1.1) % 10,
    opacity: 0.1 + (i % 4) * 0.03,
    drift: -40 + (i % 9) * 10,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{COPOS_KF}{REDUCED_MOTION}</style>
      {flakes.map((f) => (
        <Box
          key={f.key}
          sx={{
            position: 'absolute',
            top: 0,
            left: f.left,
            width: f.size,
            height: f.size,
            borderRadius: '50%',
            bgcolor: f.key % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0,
            animation: `bg-snow-fall ${f.duration}s linear infinite`,
            animationDelay: `${f.delay}s`,
            '--sf-opacity': f.opacity,
            '--sf-drift': `${f.drift}px`,
          } as any}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 16. Plasma
// ----------------------------------------------------------------------

const PLASMA_KF = `
  @keyframes bg-plasma-morph {
    0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: translate(0,0) scale(1); }
    25% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: translate(2%,-3%) scale(1.05); }
    50% { border-radius: 50% 60% 30% 60% / 50% 70% 30% 50%; transform: translate(-2%,2%) scale(0.95); }
    75% { border-radius: 30% 50% 70% 40% / 60% 40% 50% 60%; transform: translate(1%,1%) scale(1.02); }
  }
`;

function Plasma() {
  const blobs = [
    { top: '15%', left: '10%', size: 250, color: 'var(--landing-primary)', dur: 18, delay: 0 },
    { top: '50%', left: '60%', size: 300, color: 'var(--landing-accent)', dur: 22, delay: 3 },
    { top: '70%', left: '20%', size: 200, color: 'var(--landing-circle1)', dur: 15, delay: 1 },
    { top: '25%', left: '75%', size: 220, color: 'var(--landing-circle2)', dur: 20, delay: 5 },
  ];

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{PLASMA_KF}{REDUCED_MOTION}</style>
      {blobs.map((b, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            bgcolor: b.color,
            filter: 'blur(80px)',
            opacity: 0.07,
            animation: `bg-plasma-morph ${b.dur}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 17. Rayos
// ----------------------------------------------------------------------

const RAYOS_KF = `
  @keyframes bg-ray-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function Rayos() {
  const beams = [
    { origin: 'top left', angle: 45, color: 'var(--landing-primary)' },
    { origin: 'top right', angle: -45, color: 'var(--landing-accent)' },
    { origin: 'bottom left', angle: -45, color: 'var(--landing-circle1)' },
    { origin: 'bottom right', angle: 45, color: 'var(--landing-circle2)' },
  ];

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{RAYOS_KF}{REDUCED_MOTION}</style>
      {beams.map((b, i) => {
        const isTop = b.origin.includes('top');
        const isLeft = b.origin.includes('left');
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: isTop ? 0 : 'auto',
              bottom: isTop ? 'auto' : 0,
              left: isLeft ? 0 : 'auto',
              right: isLeft ? 'auto' : 0,
              width: '60vmax',
              height: 3,
              background: `linear-gradient(${isLeft ? '90deg' : '270deg'}, ${b.color}, transparent)`,
              opacity: 0.08,
              transformOrigin: `${isLeft ? '0' : '100'}% 50%`,
              animation: `bg-ray-rotate 25s linear infinite`,
              animationDelay: `${i * 2}s`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 18. Espiral
// ----------------------------------------------------------------------

const ESPIRAL_KF = `
  @keyframes bg-spiral-rotate { 0% { transform: translate(-50%,-50%) rotate(0deg); } 100% { transform: translate(-50%,-50%) rotate(360deg); } }
`;

function Espiral() {
  const dots = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * Math.PI * 4;
    const radius = 5 + i * 1.5;
    return {
      key: i,
      cx: 50 + Math.cos(angle) * radius,
      cy: 50 + Math.sin(angle) * radius,
      r: 0.3 + (i % 3) * 0.2,
    };
  });

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{ESPIRAL_KF}{REDUCED_MOTION}</style>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          animation: 'bg-spiral-rotate 60s linear infinite',
          transformOrigin: '50% 50%',
        }}
      >
        {dots.map((d) => (
          <circle
            key={d.key}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={d.key % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)'}
            opacity={0.12 + (d.key % 4) * 0.03}
          />
        ))}
      </svg>
    </Box>
  );
}

// ----------------------------------------------------------------------
// 19. Cubos
// ----------------------------------------------------------------------

const CUBOS_KF = `
  @keyframes bg-cube-float {
    0%, 100% { transform: translateY(0) rotateX(0deg) rotateY(0deg); }
    25% { transform: translateY(-12px) rotateX(5deg) rotateY(10deg); }
    50% { transform: translateY(-6px) rotateX(-3deg) rotateY(-5deg); }
    75% { transform: translateY(-18px) rotateX(4deg) rotateY(8deg); }
  }
`;

function Cubos() {
  const cubes = Array.from({ length: 7 }, (_, i) => ({
    key: i,
    top: `${10 + (i * 13) % 80}%`,
    left: `${5 + (i * 14) % 90}%`,
    size: 20 + (i % 4) * 8,
    dur: 12 + (i % 5) * 3,
    delay: (i * 1.5) % 8,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{CUBOS_KF}{REDUCED_MOTION}</style>
      {cubes.map((c) => (
        <Box
          key={c.key}
          sx={{
            position: 'absolute',
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            border: '1px solid',
            borderColor: c.key % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0.08,
            transformStyle: 'preserve-3d',
            perspective: 200,
            animation: `bg-cube-float ${c.dur}s ease-in-out infinite`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// 20. Sonido
// ----------------------------------------------------------------------

const SONIDO_KF = `
  @keyframes bg-equalizer {
    0%, 100% { transform: scaleY(var(--eq-min, 0.2)); }
    50% { transform: scaleY(var(--eq-max, 0.8)); }
  }
`;

function Sonido() {
  const bars = Array.from({ length: 10 }, (_, i) => ({
    key: i,
    left: `${10 + i * 8}%`,
    width: 3,
    maxH: 0.3 + (i % 4) * 0.15,
    minH: 0.1 + (i % 3) * 0.05,
    dur: 2 + (i % 5) * 0.8,
    delay: (i * 0.3) % 3,
  }));

  return (
    <Box sx={wrapperSx} className="bg-anim">
      <style>{SONIDO_KF}{REDUCED_MOTION}</style>
      {bars.map((b) => (
        <Box
          key={b.key}
          sx={{
            position: 'absolute',
            bottom: '5%',
            left: b.left,
            width: b.width,
            height: '30%',
            bgcolor: b.key % 2 === 0 ? 'var(--landing-primary)' : 'var(--landing-accent)',
            opacity: 0.08,
            borderRadius: 1,
            transformOrigin: 'bottom center',
            animation: `bg-equalizer ${b.dur}s ease-in-out infinite`,
            animationDelay: `${b.delay}s`,
            '--eq-min': b.minH,
            '--eq-max': b.maxH,
          } as any}
        />
      ))}
    </Box>
  );
}

// ----------------------------------------------------------------------
// Component map
// ----------------------------------------------------------------------

const ANIMATION_COMPONENTS: Record<AnimationName, () => React.ReactElement> = {
  minimalista: Minimalista,
  particulas: Particulas,
  ondas: Ondas,
  burbujas: Burbujas,
  gradiente: Gradiente,
  pulso: Pulso,
  diagonales: Diagonales,
  estrellas: Estrellas,
  geometria: Geometria,
  red: Red,
  aurora: Aurora,
  confeti: Confeti,
  hexagonos: Hexagonos,
  concentricas: Concentricas,
  copos: Copos,
  plasma: Plasma,
  rayos: Rayos,
  espiral: Espiral,
  cubos: Cubos,
  sonido: Sonido,
};

// ----------------------------------------------------------------------

interface BackgroundAnimationProps {
  animation: AnimationName;
}

export function BackgroundAnimation({ animation }: BackgroundAnimationProps) {
  const Component = ANIMATION_COMPONENTS[animation];
  if (!Component) return null;
  return <Component />;
}
