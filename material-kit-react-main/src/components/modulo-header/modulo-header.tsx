import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------
// Barra-panel superior de cada módulo, en el navy del menú lateral.
// Título a la izquierda + breadcrumb "Inicio / <título>" a la derecha.
// Acepta children opcionales (acciones) que se muestran a la derecha.
// ----------------------------------------------------------------------

interface Props {
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}

export function ModuloHeader({ titulo, subtitulo, children }: Props) {
  const router = useRouter();

  return (
    <Box
      sx={{
        background: 'linear-gradient(90deg, #111A2E 0%, #0B1120 100%)',
        color: '#ffffff',
        borderRadius: 2,
        px: 3,
        py: 2.5,
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {titulo}
        </Typography>
        {subtitulo && (
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
            {subtitulo}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {children}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <Link
            component="button"
            underline="hover"
            onClick={() => router.push('/')}
            sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, '&:hover': { color: '#fff' } }}
          >
            Inicio
          </Link>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>/</Typography>
          <Typography sx={{ color: '#fff', fontStyle: 'italic', fontSize: 14 }}>{titulo}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
