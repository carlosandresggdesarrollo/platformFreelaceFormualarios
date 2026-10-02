import { useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemButton from '@mui/material/ListItemButton';

import { useRouter, usePathname } from 'src/routes/hooks';

// ============================================================
// IMPORTAR CONFIGURACIONES DE MENÚ POR ROL
// ============================================================
import { navDataAdmin } from './config/nav-config-admin';
import { navDataCliente } from './config/nav-config-cliente';
import { navDataAuditor } from './config/nav-config-auditor';

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

export type TipoUsuario = 'ADMINISTRADOR' | 'CLIENTE' | 'AUDITOR';

// ============================================================
// FUNCIÓN PARA OBTENER MENÚ SEGÚN TIPO DE USUARIO
// ============================================================

export const getNavDataByRole = (tipoUsuario: TipoUsuario): NavItem[] => {
  switch (tipoUsuario) {
    case 'ADMINISTRADOR': return navDataAdmin;
    case 'CLIENTE': return navDataCliente;
    case 'AUDITOR': return navDataAuditor;
    default: return [];
  }
};

// ============================================================
// EXPORTAR CONFIGURACIONES (para uso directo si es necesario)
// ============================================================

export { navDataAdmin, navDataCliente, navDataAuditor };

// ============================================================
// CONFIGURACIÓN POR DEFECTO (ADMINISTRADOR - mantener compatibilidad)
// ============================================================

export const navData = navDataAdmin;

// ============================================================
// COMPONENTE DE ITEM DEL MENÚ
// ============================================================

type NavItemProps = {
  item: NavItem;
  depth?: number;
};

function NavItemComponent({ item, depth = 0 }: NavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Colores fijos para el sidebar navy (texto claro, realce azul en activo)
  const colors = {
    text: '#94A3B8',
    textActive: '#60A5FA',
    textSecondary: '#8B95A5',
    bgActive: 'rgba(96, 165, 250, 0.14)',
    bgHoverActive: 'rgba(96, 165, 250, 0.22)',
    bgHover: 'rgba(255, 255, 255, 0.05)',
    expandIcon: '#64748B',
  };

  const hasChildren = item.children && item.children.length > 0;

  // Verificar si está activo (ruta exacta o es padre de la ruta actual)
  const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
  const isChildActive = hasChildren && item.children!.some(
    child => pathname === child.path || pathname.startsWith(child.path + '/')
  );

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else {
      router.push(item.path);
    }
  };

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{
          minHeight: 48,
          borderRadius: 2,
          mb: 0.5,
          typography: 'body2',
          color: colors.text,
          fontWeight: 500,
          pl: depth === 0 ? 2 : 2 + depth * 2,
          transition: 'all 0.2s ease',
          ...((isActive || isChildActive) && {
            color: colors.textActive,
            fontWeight: 600,
            bgcolor: colors.bgActive,
            '&:hover': {
              bgcolor: colors.bgHoverActive,
            },
          }),
          ...(!isActive && !isChildActive && {
            '&:hover': {
              bgcolor: colors.bgHover,
            },
          }),
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: 1.5,
            width: 24,
            height: 24,
            color: (isActive || isChildActive) ? colors.textActive : colors.textSecondary,
            transition: 'color 0.2s ease',
          }}
        >
          {item.icon}
        </ListItemIcon>

        <ListItemText
          disableTypography
          primary={item.title}
          sx={{
            flex: 1,
            fontSize: '0.95rem',
          }}
        />

        {item.info && item.info}

        {hasChildren && (
          <Box sx={{ ml: 1, width: 20, height: 20, color: (isActive || isChildActive) ? colors.textActive : colors.expandIcon, transition: 'color 0.2s ease' }}>
            {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </Box>
        )}
      </ListItemButton>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <NavItemComponent key={child.title} item={child} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL DE NAVEGACIÓN
// ============================================================

type NavSectionProps = {
  data: NavItem[];
};

export function NavSection({ data }: NavSectionProps) {
  return (
    <List disablePadding sx={{ px: 1.5, pt: 1 }}>
      {data.map((item) => (
        <NavItemComponent key={item.title} item={item} />
      ))}
    </List>
  );
}
