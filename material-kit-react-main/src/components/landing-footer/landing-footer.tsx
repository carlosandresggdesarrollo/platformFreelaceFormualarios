import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

interface RedSocial {
  nombre: string;
  icono: string;
  url: string;
}

interface LandingFooterProps {
  redes?: RedSocial[];
  id?: string;
}

export function LandingFooter({ redes = [], id }: LandingFooterProps) {
  return (
    <Box id={id} sx={{ py: { xs: 4, md: 5 }, bgcolor: 'var(--landing-footer-bg)' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          {redes.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {redes.map((red) => (
                <Box
                  key={red.nombre}
                  component="a"
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', bgcolor: 'var(--landing-footer-icon-bg)', color: 'var(--landing-footer-text)',
                    transition: 'all 0.3s ease', textDecoration: 'none',
                    '&:hover': { bgcolor: 'var(--landing-footer-icon-bg-hover)', transform: 'translateY(-4px)' },
                  }}
                >
                  <Iconify icon={red.icono as any} width={22} />
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'var(--landing-footer-text)' }}>
              &copy; {new Date().getFullYear()} Todos los derechos reservados.
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--landing-footer-text)', mt: 0.5 }}>
              Desarrollado por Carlos Andres Gonzalez Gomez.
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--landing-footer-text)', opacity: 0.7, mt: 0.5, display: 'block' }}>
              Esta pagina es sin fines de lucro. Un apoyo a la comunidad.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
