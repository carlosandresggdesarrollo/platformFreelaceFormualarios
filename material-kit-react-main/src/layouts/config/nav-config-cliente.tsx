import { Iconify } from 'src/components/iconify';

import type { NavItem } from './nav-config-admin';

// ============================================================
// FUNCIÓN PARA ICONOS
// ============================================================

const menuIcon = (iconName: string) => (
  <Iconify icon={iconName as any} width={22} />
);

// ============================================================
// MENÚ CLIENTE
// ============================================================

export const navDataCliente: NavItem[] = [
  {
    title: 'Mi Dashboard',
    path: '/dashboard',
    icon: menuIcon('mdi:view-dashboard-outline'),
  },
  {
    title: 'Mis Formularios',
    path: '/formularios',
    icon: menuIcon('mdi:clipboard-list-outline'),
  },
  {
    title: 'Mis Cuestionarios',
    path: '/cliente/cuestionarios',
    icon: menuIcon('mdi:clipboard-check-outline'),
  },
  {
    title: 'Mi Perfil',
    path: '/perfil',
    icon: menuIcon('mdi:card-account-details-outline'),
  },
];
