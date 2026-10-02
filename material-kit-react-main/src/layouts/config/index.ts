// ============================================================
// EXPORTACIONES DE CONFIGURACIÓN DE MENÚS
// ============================================================

export { navDataAdmin } from './nav-config-admin';
export type { NavItem } from './nav-config-admin';

// ============================================================
// TIPOS DE USUARIO
// ============================================================

export type TipoUsuario = 'ADMINISTRADOR';

// ============================================================
// FUNCIÓN PARA OBTENER MENÚ SEGÚN TIPO DE USUARIO
// ============================================================

import { navDataAdmin } from './nav-config-admin';

import type { NavItem } from './nav-config-admin';

export const getNavDataByRole = (tipoUsuario: TipoUsuario): NavItem[] =>
  tipoUsuario === 'ADMINISTRADOR' ? navDataAdmin : [];
