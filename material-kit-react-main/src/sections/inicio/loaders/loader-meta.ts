export type LoaderName =
  | 'pulso-logo'
  | 'reloj'
  | 'nube'
  | 'puntos'
  | 'espiral'
  | 'adn'
  | 'escritura'
  | 'latido'
  | 'ola'
  | 'cubo-3d'
  | 'orbita'
  | 'reloj-arena'
  | 'brujula'
  | 'ondas-agua'
  | 'atomo'
  | 'engranajes'
  | 'barra-neon'
  | 'metamorfosis'
  | 'respiracion';

export interface LoaderMeta {
  label: string;
  description: string;
  icon: string;
}

export const LOADER_META: Record<LoaderName, LoaderMeta> = {
  'pulso-logo':      { label: 'Pulso Logo',          description: 'Logo pulsando con gradiente',             icon: 'mdi:heart-pulse' },
  'reloj':           { label: 'Reloj',                description: 'Reloj analogico con manecillas',          icon: 'mdi:clock-outline' },
  'nube':            { label: 'Nube',                 description: 'Nube con gotas de lluvia',                icon: 'mdi:weather-rainy' },
  'puntos':          { label: 'Puntos',               description: 'Puntos rebotando en secuencia',           icon: 'mdi:dots-horizontal' },
  'espiral':  { label: 'Espiral',              description: 'Espiral girando con gradiente',           icon: 'mdi:loading' },
  'adn':             { label: 'ADN',                  description: 'Doble helice de ADN animada',             icon: 'mdi:dna' },
  'escritura':       { label: 'Escritura',            description: 'Maquina de escribir con cursor',          icon: 'mdi:typewriter' },
  'latido':          { label: 'Latido',               description: 'Linea de electrocardiograma',             icon: 'mdi:heart-outline' },
  'ola':             { label: 'Ola',                  description: 'Olas de oceano en capas',                 icon: 'mdi:waves' },
  'cubo-3d':         { label: 'Cubo 3D',              description: 'Cubo rotando en 3 dimensiones',           icon: 'mdi:cube-outline' },
  'orbita':          { label: 'Orbita',               description: 'Circulos orbitando como planetas',        icon: 'mdi:orbit' },
  'reloj-arena':     { label: 'Reloj de Arena',       description: 'Reloj de arena con particulas',           icon: 'mdi:timer-sand' },
  'brujula':         { label: 'Brujula',              description: 'Brujula con aguja giratoria',             icon: 'mdi:compass-outline' },
  'ondas-agua':      { label: 'Ondas de Agua',        description: 'Ondas concentricas tipo gota',            icon: 'mdi:water-outline' },
  'atomo':           { label: 'Atomo',                description: 'Atomo con electrones orbitando',          icon: 'mdi:atom' },
  'engranajes':      { label: 'Engranajes',           description: 'Engranajes girando sincronizados',        icon: 'mdi:cog-outline' },
  'barra-neon':      { label: 'Barra Neon',           description: 'Barra de progreso con efecto neon',       icon: 'mdi:chart-timeline' },
  'metamorfosis':    { label: 'Metamorfosis',         description: 'Forma que muta entre geometrias',         icon: 'mdi:shape-outline' },
  'respiracion':     { label: 'Respiracion',          description: 'Circulo que respira con gradiente',        icon: 'mdi:meditation' },
};

export const LOADER_NAMES = Object.keys(LOADER_META) as LoaderName[];
