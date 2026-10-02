import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from 'src/components/iconify';

// ------------------------------------------------------------------

interface Contacto {
  nombre: string;
  descripcion: string | null;
  telefono: string | null;
  email: string | null;
  enlace: string | null;
  enlaceTexto: string | null;
}

export interface ModalBienvenidaData {
  activo: string | number;
  textoAgradecimiento: string | null;
  textoTerapeutas: string | null;
  textoColaboradores: string | null;
  textoCursos: string | null;
  terapeutas: Contacto[];
  colaboradores: Contacto[];
  cursos: Contacto[];
}

interface WelcomeModalProps {
  data: ModalBienvenidaData | null;
  delayMs?: number;
}

function ContactCard({ contacto, icon }: { contacto: Contacto; icon: string }) {
  return (
    <Box
      sx={{
        p: 2, borderRadius: 2,
        bgcolor: 'var(--landing-card-bg, rgba(255,255,255,0.8))',
        boxShadow: 'var(--landing-card-shadow, 0 2px 8px rgba(0,0,0,0.08))',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-2px)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'var(--landing-icon-bg, rgba(27,94,32,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Iconify icon={icon as any} width={20} sx={{ color: 'var(--landing-icon-color, #1B5E20)' }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--landing-heading, #1a1a1a)' }}>
          {contacto.nombre}
        </Typography>
      </Box>

      {contacto.descripcion && (
        <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary, #666)', mb: 1, lineHeight: 1.6 }}>
          {contacto.descripcion}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {contacto.telefono && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="mdi:phone" width={16} sx={{ color: 'var(--landing-accent, #E65100)' }} />
            <Link href={`tel:${contacto.telefono}`} sx={{ fontSize: '0.8rem', color: 'var(--landing-accent, #E65100)' }}>
              {contacto.telefono}
            </Link>
          </Box>
        )}
        {contacto.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="mdi:email-outline" width={16} sx={{ color: 'var(--landing-accent, #E65100)' }} />
            <Link href={`mailto:${contacto.email}`} sx={{ fontSize: '0.8rem', color: 'var(--landing-accent, #E65100)' }}>
              {contacto.email}
            </Link>
          </Box>
        )}
        {contacto.enlace && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify icon="mdi:open-in-new" width={16} sx={{ color: 'var(--landing-accent, #E65100)' }} />
            <Link href={contacto.enlace} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.8rem', color: 'var(--landing-accent, #E65100)' }}>
              {contacto.enlaceTexto || 'Visitar enlace'}
            </Link>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export function WelcomeModal({ data, delayMs = 3000 }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!data) return undefined;
    const timer = setTimeout(() => setOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [data, delayMs]);

  if (!data) return null;

  const hasAgradecimiento = !!data.textoAgradecimiento;
  const hasTerapeutas = !!data.textoTerapeutas && data.terapeutas.length > 0;
  const hasColaboradores = !!data.textoColaboradores && data.colaboradores.length > 0;
  const hasCursos = !!data.textoCursos && data.cursos.length > 0;
  const hasContent = hasAgradecimiento || hasTerapeutas || hasColaboradores || hasCursos;

  if (!hasContent) return null;

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--landing-bg, #FAFBFC)',
          backgroundImage: 'none',
          borderRadius: 3,
          maxHeight: '85vh',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, pb: 0 }}>
        <IconButton onClick={() => setOpen(false)} size="small">
          <Iconify icon="mdi:close" width={22} sx={{ color: 'var(--landing-text-secondary, #666)' }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 0, px: { xs: 2, sm: 4 }, pb: 3 }}>
        {/* Agradecimiento */}
        {hasAgradecimiento && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Iconify icon="mdi:heart-outline" width={40} sx={{ color: 'var(--landing-accent, #E65100)', mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--landing-heading, #1a1a1a)', mb: 2 }}>
              Agradecimiento
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--landing-text-secondary, #666)', lineHeight: 1.8, maxWidth: 600, mx: 'auto' }}>
              {data.textoAgradecimiento}
            </Typography>
          </Box>
        )}

        {/* Terapeutas */}
        {hasTerapeutas && (
          <>
            {hasAgradecimiento && <Divider sx={{ my: 3, borderColor: 'var(--landing-divider, rgba(0,0,0,0.1))' }} />}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon="mdi:stethoscope" width={28} sx={{ color: 'var(--landing-primary, #1B5E20)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--landing-heading, #1a1a1a)' }}>
                  Terapeutas Profesionales
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary, #666)', mb: 2 }}>
                {data.textoTerapeutas}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.terapeutas.map((t) => (
                  <ContactCard key={t.nombre} contacto={t} icon="mdi:account-heart-outline" />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Colaboradores */}
        {hasColaboradores && (
          <>
            {(hasAgradecimiento || hasTerapeutas) && <Divider sx={{ my: 3, borderColor: 'var(--landing-divider, rgba(0,0,0,0.1))' }} />}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon="mdi:account-group-outline" width={28} sx={{ color: 'var(--landing-primary, #1B5E20)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--landing-heading, #1a1a1a)' }}>
                  Colaboradores
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary, #666)', mb: 2 }}>
                {data.textoColaboradores}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.colaboradores.map((c) => (
                  <ContactCard key={c.nombre} contacto={c} icon="mdi:handshake-outline" />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Cursos / Enlaces */}
        {hasCursos && (
          <>
            {(hasAgradecimiento || hasTerapeutas || hasColaboradores) && <Divider sx={{ my: 3, borderColor: 'var(--landing-divider, rgba(0,0,0,0.1))' }} />}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon="mdi:school-outline" width={28} sx={{ color: 'var(--landing-primary, #1B5E20)' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--landing-heading, #1a1a1a)' }}>
                  Cursos y Enlaces
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'var(--landing-text-secondary, #666)', mb: 2 }}>
                {data.textoCursos}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.cursos.map((c) => (
                  <ContactCard key={c.nombre} contacto={c} icon="mdi:book-open-variant" />
                ))}
              </Box>
            </Box>
          </>
        )}

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => setOpen(false)}
            sx={{
              bgcolor: 'var(--landing-primary, #1B5E20)',
              textTransform: 'none',
              fontWeight: 600,
              px: 5, py: 1.2,
              borderRadius: 3,
              '&:hover': { bgcolor: 'var(--landing-primary-hover, #145218)' },
            }}
          >
            Continuar al sitio
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
