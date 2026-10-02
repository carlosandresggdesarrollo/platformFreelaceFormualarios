// ----------------------------------------------------------------------

export type AnimationName =
  | 'minimalista'
  | 'particulas'
  | 'ondas'
  | 'burbujas'
  | 'gradiente'
  | 'pulso'
  | 'diagonales'
  | 'estrellas'
  | 'geometria'
  | 'red'
  | 'aurora'
  | 'confeti'
  | 'hexagonos'
  | 'concentricas'
  | 'copos'
  | 'plasma'
  | 'rayos'
  | 'espiral'
  | 'cubos'
  | 'sonido';

// ----------------------------------------------------------------------

export const ANIMATION_META: Record<AnimationName, { label: string; description: string; icon: string }> = {
  minimalista: {
    label: 'Minimalista',
    description: 'Dos circulos flotantes suaves',
    icon: 'mdi:circle-outline',
  },
  particulas: {
    label: 'Particulas Flotantes',
    description: 'Puntos pequenos subiendo lentamente',
    icon: 'mdi:dots-hexagon',
  },
  ondas: {
    label: 'Ondas Suaves',
    description: 'Lineas sinusoidales en movimiento',
    icon: 'mdi:wave',
  },
  burbujas: {
    label: 'Burbujas',
    description: 'Circulos translucidos ascendiendo',
    icon: 'mdi:circle-multiple-outline',
  },
  gradiente: {
    label: 'Gradiente Animado',
    description: 'Fondo con gradiente que cambia lento',
    icon: 'mdi:gradient-horizontal',
  },
  pulso: {
    label: 'Circulos Pulsantes',
    description: 'Circulos concentricos expandiendose',
    icon: 'mdi:radio-tower',
  },
  diagonales: {
    label: 'Lineas Diagonales',
    description: 'Lineas diagonales desplazandose',
    icon: 'mdi:slash-forward',
  },
  estrellas: {
    label: 'Estrellas Centelleantes',
    description: 'Puntos de luz parpadeando',
    icon: 'mdi:star-four-points-outline',
  },
  geometria: {
    label: 'Geometria Flotante',
    description: 'Formas geometricas flotando',
    icon: 'mdi:shape-outline',
  },
  red: {
    label: 'Conexiones de Red',
    description: 'Puntos conectados con lineas',
    icon: 'mdi:lan',
  },
  aurora: {
    label: 'Aurora Boreal',
    description: 'Ondas de color tipo aurora',
    icon: 'mdi:weather-night',
  },
  confeti: {
    label: 'Lluvia de Confeti',
    description: 'Confeti cayendo suavemente',
    icon: 'mdi:party-popper',
  },
  hexagonos: {
    label: 'Hexagonos',
    description: 'Patron hexagonal con pulso suave',
    icon: 'mdi:hexagon-multiple-outline',
  },
  concentricas: {
    label: 'Ondas Concentricas',
    description: 'Ondas ripple desde el centro',
    icon: 'mdi:bullseye',
  },
  copos: {
    label: 'Copos de Nieve',
    description: 'Particulas tipo nieve cayendo',
    icon: 'mdi:snowflake',
  },
  plasma: {
    label: 'Plasma',
    description: 'Formas organicas blob en movimiento',
    icon: 'mdi:blob-outline',
  },
  rayos: {
    label: 'Rayos de Luz',
    description: 'Haces de luz desde las esquinas',
    icon: 'mdi:flashlight',
  },
  espiral: {
    label: 'Espiral Galaxia',
    description: 'Rotacion espiral lenta',
    icon: 'mdi:rotate-right',
  },
  cubos: {
    label: 'Cubos 3D',
    description: 'Cubos isometricos flotando',
    icon: 'mdi:cube-outline',
  },
  sonido: {
    label: 'Onda de Sonido',
    description: 'Barras tipo ecualizador',
    icon: 'mdi:waveform',
  },
};

export const ANIMATION_NAMES = Object.keys(ANIMATION_META) as AnimationName[];
