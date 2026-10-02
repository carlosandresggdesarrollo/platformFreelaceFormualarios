import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';

import { useSiteName } from 'src/hooks/use-site-name';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { NavSection, type NavItem } from '../nav-config-dashboard';

import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 0,
        px: 0,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        // Sidebar navy (look del panel de referencia), contenido se mantiene claro
        background: 'linear-gradient(180deg, #0B1120 0%, #111A2E 100%)',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: '1px solid rgba(148, 163, 184, 0.08)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 0,
          px: 0,
          overflow: 'unset',
          background: 'linear-gradient(180deg, #0B1120 0%, #111A2E 100%)',
          width: 'var(--layout-nav-mobile-width)',
          transition: 'background-color 0.3s ease',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, workspaces, sx }: NavContentProps) {
  const pathname = usePathname();
  const siteName = useSiteName();

  // Colores fijos para el sidebar navy
  const colors = {
    textPrimary: '#E6EDF3',
    textSecondary: '#8B95A5',
    iconBg: 'rgba(96, 165, 250, 0.12)',
    iconColor: '#60A5FA',
  };

  // Obtener tipo de usuario
  const [userType, setUserType] = useState('');

  useEffect(() => {
    try {
      const jsonInfo = localStorage.getItem('JSON_INFORMACION');
      if (jsonInfo) {
        const decodedInfo = atob(jsonInfo);
        const userInfo = JSON.parse(decodedInfo);
        setUserType(userInfo.tipoUsuario || 'Administrador');
      }
    } catch (e) {
      setUserType('Administrador');
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo y título */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.35rem', color: colors.textPrimary, lineHeight: 1.2, transition: 'color 0.3s ease' }}>
              {siteName}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', letterSpacing: 1.5, color: colors.textSecondary, transition: 'color 0.3s ease' }}>
              Conócete más
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tipo de usuario */}
      <Box sx={{ px: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon={"mdi:account-outline" as any} width={20} sx={{ color: colors.textSecondary, transition: 'color 0.3s ease' }} />
          <Typography sx={{ fontSize: '0.9rem', color: colors.textSecondary, transition: 'color 0.3s ease' }}>
            {userType}
          </Typography>
        </Box>
      </Box>

      {slots?.topArea}

      {/* Menú de navegación */}
      <Scrollbar fillContent>
        <NavSection data={data} />
      </Scrollbar>

      {slots?.bottomArea}
    </Box>
  );
}