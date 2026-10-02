import { Iconify } from 'src/components/iconify';

// ============================================================
// TIPOS
// ============================================================

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  children?: NavItem[];
};

// ============================================================
// FUNCIÓN PARA ICONOS
// ============================================================

const menuIcon = (iconName: string) => (
  <Iconify icon={iconName as any} width={22} />
);

// ============================================================
// MENÚ ADMINISTRADOR
// ============================================================

export const navDataAdmin: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: menuIcon('mdi:view-dashboard-outline'),
  },
  {
    title: 'Gestion Home',
    path: '/home-admin',
    icon: menuIcon('mdi:home-edit-outline'),
    children: [
      { title: 'Configuracion', path: '/home-admin/config', icon: menuIcon('mdi:cog-outline') },
      { title: 'Temas', path: '/home-admin/temas', icon: menuIcon('mdi:palette-outline') },
      { title: 'Navegacion', path: '/home-admin/nav', icon: menuIcon('mdi:menu') },
      { title: 'Carruseles', path: '/home-admin/carruseles', icon: menuIcon('mdi:view-carousel-outline') },
      { title: 'Animaciones', path: '/home-admin/animaciones', icon: menuIcon('mdi:animation-outline') },
      { title: 'Pantalla de Carga', path: '/home-admin/loaders', icon: menuIcon('mdi:loading') },
      { title: 'Redes Sociales', path: '/home-admin/redes', icon: menuIcon('mdi:share-variant-outline') },
      { title: 'Auditoria', path: '/home-admin/audit', icon: menuIcon('mdi:history') },
    ],
  },
  {
    title: 'Modal Bienvenida',
    path: '/modal-bienvenida',
    icon: menuIcon('mdi:message-text-clock-outline'),
  },
  {
    title: 'Logo',
    path: '/logo',
    icon: menuIcon('mdi:image-edit-outline'),
  },
  {
    title: 'Formularios',
    path: '/admin/formularios',
    icon: menuIcon('mdi:clipboard-list-outline'),
  },
  {
    title: 'Analiticas',
    path: '/analiticas',
    icon: menuIcon('mdi:chart-line'),
  },
  {
    title: 'Usuarios',
    path: '/sistema',
    icon: menuIcon('mdi:account-group-outline'),
    children: [
      { title: 'Administradores', path: '/usuarios', icon: menuIcon('mdi:account-outline') },
      { title: 'Clientes', path: '/clientes', icon: menuIcon('mdi:account-group-outline') },
    ],
  },
];
