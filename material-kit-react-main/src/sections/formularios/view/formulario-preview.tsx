import type { CSSProperties } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

import { useLandingTheme } from 'src/sections/inicio/themes';

// ----------------------------------------------------------------------

interface PreviewPregunta {
  idPregunta: number;
  textoPregunta: string;
  opciones: { idOpcion: number; textoOpcion: string }[];
}

interface FormularioPreviewProps {
  titulo: string;
  descripcion: string;
  tema: string | null;
  colorPrimario: string | null;
  colorFondo: string | null;
  imagenFondo: string | null;
  opacidadFondo: number;
  musicaUrl: string | null;
  musicaTipo: string | null;
  preguntas: PreviewPregunta[];
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    bgcolor: 'var(--landing-bg-alt)',
    color: 'var(--landing-text)',
    '& fieldset': { borderColor: 'var(--landing-text-muted)' },
  },
  '& .MuiInputLabel-root': { color: 'var(--landing-text-muted)' },
};

export function FormularioPreview({
  titulo, descripcion, tema, colorPrimario, colorFondo,
  imagenFondo, opacidadFondo, musicaUrl, musicaTipo, preguntas,
}: FormularioPreviewProps) {
  const baseTheme = useLandingTheme(tema || undefined);

  const themeVars: CSSProperties = { ...baseTheme };
  if (colorPrimario) {
    (themeVars as any)['--landing-primary'] = colorPrimario;
    (themeVars as any)['--landing-primary-hover'] = colorPrimario;
  }
  if (colorFondo) {
    (themeVars as any)['--landing-bg'] = colorFondo;
  }

  const previewPreguntas = preguntas.slice(0, 2);
  const bgImgUrl = imagenFondo
    ? (imagenFondo.startsWith('http') ? imagenFondo : `${window.location.origin}${imagenFondo}`)
    : null;

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', minHeight: 500, bgcolor: 'var(--landing-bg)' }} style={themeVars}>
      {bgImgUrl && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Box component="img" src={bgImgUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: `rgba(0,0,0,${(opacidadFondo ?? 40) / 100})` }} />
        </Box>
      )}

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ py: 1, px: 3, bgcolor: 'var(--landing-bg-alt)', borderBottom: '1px solid var(--landing-text-muted)', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon="mdi:clipboard-text" width={20} sx={{ color: 'var(--landing-primary)' }} />
          <Typography variant="caption" sx={{ color: 'var(--landing-text-muted)' }}>Vista previa</Typography>
          {musicaUrl && (
            <Chip size="small" icon={<Iconify icon="mdi:music-note" width={14} />} label="Con musica"
              sx={{ ml: 'auto', bgcolor: 'var(--landing-bg-alt)', color: 'var(--landing-text-muted)', fontSize: 11 }} />
          )}
        </Box>

        <Container maxWidth="sm" sx={{ pt: 4, pb: 6 }}>
          {/* Intro card */}
          <Card sx={{
            p: 3, mb: 3, bgcolor: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))',
            border: '1px solid var(--landing-text-muted)', borderRadius: 3,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Iconify icon="mdi:clipboard-text-outline" width={40} sx={{ color: 'var(--landing-primary)', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--landing-text)' }}>
                {titulo || 'Titulo del formulario'}
              </Typography>
              {descripcion && (
                <Typography variant="body2" sx={{ color: 'var(--landing-text-muted)', mt: 0.5 }}>
                  {descripcion}
                </Typography>
              )}
            </Box>
            <TextField fullWidth size="small" label="Tu nombre (opcional)" disabled sx={{ mb: 1.5, ...inputSx }} />
            <TextField fullWidth size="small" label="Tu email (opcional)" disabled sx={{ ...inputSx }} />
            <Button fullWidth variant="contained" disabled sx={{
              mt: 2, py: 1, bgcolor: 'var(--landing-primary)', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2,
            }}>
              Comenzar
            </Button>
          </Card>

          {/* Sample questions */}
          {previewPreguntas.length > 0 && (
            <>
              <Box sx={{ mb: 2 }}>
                <LinearProgress variant="determinate" value={50}
                  sx={{ height: 5, borderRadius: 1, bgcolor: 'var(--landing-circle1, rgba(0,0,0,0.08))',
                    '& .MuiLinearProgress-bar': { bgcolor: 'var(--landing-primary)' } }} />
              </Box>

              {previewPreguntas.map((p, i) => (
                <Card key={p.idPregunta} sx={{
                  p: 2.5, mb: 2, bgcolor: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))',
                  border: '1px solid var(--landing-text-muted)', borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)', opacity: i === 1 ? 0.6 : 1,
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--landing-text)', mb: 1.5 }}>
                    {p.textoPregunta}
                  </Typography>
                  <RadioGroup>
                    {p.opciones.slice(0, 3).map((o) => (
                      <FormControlLabel key={o.idOpcion} value={o.idOpcion} disabled
                        control={<Radio size="small" sx={{ color: 'var(--landing-text-muted)' }} />}
                        label={o.textoOpcion}
                        sx={{
                          mx: 0, p: 1, mb: 0.5, borderRadius: 1.5,
                          border: '1px solid var(--landing-text-muted)',
                          '& .MuiFormControlLabel-label': { color: 'var(--landing-text)', fontSize: 14 },
                        }}
                      />
                    ))}
                  </RadioGroup>
                </Card>
              ))}
            </>
          )}

          {preguntas.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'var(--landing-text-muted)' }}>
              <Iconify icon="mdi:text-box-plus-outline" width={48} sx={{ opacity: 0.4, mb: 1 }} />
              <Typography variant="body2">Agrega preguntas para ver la vista previa</Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
