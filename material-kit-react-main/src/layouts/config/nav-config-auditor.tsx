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
// MENÚ AUDITOR (solo lectura)
// ============================================================

export const navDataAuditor: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/auditor/dashboard',
    icon: menuIcon('mdi:view-dashboard-outline'),
  },
  {
    title: 'Clientes',
    path: '/clientes',
    icon: menuIcon('mdi:account-group-outline'),
  },
  {
    title: 'Mi Perfil',
    path: '/perfil',
    icon: menuIcon('mdi:account-outline'),
  },
];
