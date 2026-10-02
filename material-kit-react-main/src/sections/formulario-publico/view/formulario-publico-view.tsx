import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { LandingFooter } from 'src/components/landing-footer';

import { useLandingTheme } from 'src/sections/inicio/themes';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.publico.php`;
const API_PUBLIC = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.publico.php`;

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    bgcolor: 'var(--landing-bg-alt)',
    color: 'var(--landing-text)',
    transition: 'all 0.3s ease',
    '& fieldset': { borderColor: 'var(--landing-text-muted)' },
    '&:hover fieldset': { borderColor: 'var(--landing-primary)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--landing-primary)', borderWidth: 2 },
  },
  '& .MuiOutlinedInput-input': {
    color: 'var(--landing-text)',
    '&::placeholder': { color: 'var(--landing-text-muted)', opacity: 1 },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--landing-text-muted)',
    '&.Mui-focused': { color: 'var(--landing-primary)' },
  },
  '& .MuiFormHelperText-root': {
    color: 'var(--landing-text-muted)',
  },
};

interface Opcion { idOpcion: number; textoOpcion: string; orden: number }
interface Pregunta { idPregunta: number; textoPregunta: string; orden: number; opciones: Opcion[] }
interface Formulario { idCuestionario: number; titulo: string; descripcion: string; slug?: string; preguntas: Pregunta[] }

export function FormularioPublicoView() {
  const params = useParams();
  const navigate = useNavigate();
  const token = params.token || '';
  const urlSlug = params.slug || '';

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Formulario | null>(null);
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState<{ correctas: number; total: number } | null>(null);
  const [tema, setTema] = useState('');

  const idVisita = useRef(0);
  const startTime = useRef(Date.now());

  useLandingTheme(tema);

  useEffect(() => {
    fetch(API_PUBLIC).then(r => r.json()).then(d => {
      if (d.config?.tema) setTema(d.config.tema);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) { setError('Token no proporcionado'); setLoading(false); return; }
    fetch(`${API}?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.formulario) {
          setForm(d.formulario);
          if (d.idVisita) idVisita.current = d.idVisita;
          if (d.formulario.slug && !urlSlug) {
            navigate(`${CONFIG.basePath}/form/${token}/${d.formulario.slug}`, { replace: true });
          }
        } else {
          setError(d.error || 'Formulario no encontrado');
        }
      })
      .catch(() => setError('Error de conexion'))
      .finally(() => setLoading(false));
  }, [token, urlSlug, navigate]);

  const sendVisitUpdate = useCallback(() => {
    if (!idVisita.current) return;
    const blob = new Blob([JSON.stringify({
      accion: 'actualizar_visita',
      idVisita: idVisita.current,
      duracion: Math.round((Date.now() - startTime.current) / 1000),
      scrollMax: Math.min(100, Math.round((window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * 100)),
    })], { type: 'application/json' });
    navigator.sendBeacon?.(API, blob);
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', sendVisitUpdate);
    return () => {
      window.removeEventListener('beforeunload', sendVisitUpdate);
      sendVisitUpdate();
    };
  }, [sendVisitUpdate]);

  const handleSelect = (idPregunta: number, idOpcion: number) => {
    setRespuestas(prev => ({ ...prev, [idPregunta]: idOpcion }));
  };

  const handleSubmit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'responder',
          idCuestionario: form.idCuestionario,
          nombre: nombre || null,
          email: email || null,
          respuestas,
        }),
      });
      const d = await r.json();
      if (d.success) {
        setResultado(d.resultado);
        setStep(form.preguntas.length + 1);
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const totalPreguntas = form?.preguntas.length || 0;
  const currentPregunta = step > 0 && step <= totalPreguntas ? form!.preguntas[step - 1] : null;
  const allAnswered = form ? form.preguntas.every(p => respuestas[p.idPregunta] !== undefined) : false;

  const keyframes = `
    @keyframes fadeInUp { 0%{opacity:0;transform:translateY(30px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes fadeInDown { 0%{opacity:0;transform:translateY(-20px)} 100%{opacity:1;transform:translateY(0)} }
  `;

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'var(--landing-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'var(--landing-primary)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'var(--landing-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <Iconify icon="mdi:alert-circle-outline" width={64} sx={{ color: '#ef5350' }} />
        <Typography variant="h5" sx={{ color: 'var(--landing-text)' }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      <style>{keyframes}</style>

      {/* Header */}
      <Box sx={{ py: 1.5, px: { xs: 2, md: 6 }, display: 'flex', alignItems: 'center', bgcolor: 'var(--landing-bg-alt)', borderBottom: '1px solid var(--landing-text-muted)' }}>
        <Box component="img" src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" sx={{ height: 36 }} />
      </Box>

      <Container maxWidth="sm" sx={{ pt: 5, pb: 8 }}>
        {/* Progress */}
        {step > 0 && step <= totalPreguntas && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'var(--landing-text-muted)' }}>
                Pregunta {step} de {totalPreguntas}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--landing-text-muted)' }}>
                {Math.round((step / totalPreguntas) * 100)}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={(step / totalPreguntas) * 100}
              sx={{ height: 6, borderRadius: 1, bgcolor: 'var(--landing-circle1, rgba(0,0,0,0.08))', '& .MuiLinearProgress-bar': { bgcolor: 'var(--landing-primary)' } }} />
          </Box>
        )}

        {/* Intro */}
        {step === 0 && form && (
          <Card sx={{
            p: 4, bgcolor: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))', border: '1px solid var(--landing-text-muted)',
            borderRadius: 3, animation: 'fadeInUp 0.6s ease-out', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Iconify icon="mdi:clipboard-text-outline" width={48} sx={{ color: 'var(--landing-primary)', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--landing-text)', mb: 1 }}>
                {form.titulo}
              </Typography>
              {form.descripcion && (
                <Typography variant="body1" sx={{ color: 'var(--landing-text-muted)' }}>
                  {form.descripcion}
                </Typography>
              )}
              <Typography variant="caption" sx={{ color: 'var(--landing-text-muted)', mt: 1, display: 'block' }}>
                {totalPreguntas} preguntas
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField fullWidth label="Tu nombre (opcional)" value={nombre} onChange={(e) => setNombre(e.target.value)}
                sx={{ mb: 2, ...inputSx }} />
              <TextField fullWidth label="Tu email (opcional)" value={email} onChange={(e) => setEmail(e.target.value)}
                sx={inputSx} />
            </Box>

            <Button fullWidth variant="contained" onClick={() => setStep(1)}
              endIcon={<Iconify icon="mdi:arrow-right" width={20} />}
              sx={{
                py: 1.5, bgcolor: 'var(--landing-primary)', fontWeight: 600, fontSize: 16, textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: 'var(--landing-primary-hover, var(--landing-primary))' },
              }}>
              Comenzar
            </Button>
          </Card>
        )}

        {/* Question */}
        {currentPregunta && (
          <Card key={currentPregunta.idPregunta} sx={{
            p: 4, bgcolor: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))', border: '1px solid var(--landing-text-muted)',
            borderRadius: 3, animation: 'fadeInUp 0.4s ease-out', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--landing-text)', mb: 3 }}>
              {currentPregunta.textoPregunta}
            </Typography>

            <RadioGroup
              value={respuestas[currentPregunta.idPregunta] ?? ''}
              onChange={(e) => handleSelect(currentPregunta.idPregunta, Number(e.target.value))}
            >
              {currentPregunta.opciones.map((o) => (
                <FormControlLabel
                  key={o.idOpcion}
                  value={o.idOpcion}
                  control={<Radio sx={{ color: 'var(--landing-text-muted)', '&.Mui-checked': { color: 'var(--landing-primary)' } }} />}
                  label={o.textoOpcion}
                  sx={{
                    mb: 1, mx: 0, p: 1.5, borderRadius: 2,
                    border: `1px solid ${respuestas[currentPregunta.idPregunta] === o.idOpcion ? 'var(--landing-primary)' : 'var(--landing-text-muted)'}`,
                    bgcolor: respuestas[currentPregunta.idPregunta] === o.idOpcion ? 'var(--landing-bg-alt)' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'var(--landing-bg-alt)' },
                    '& .MuiFormControlLabel-label': { color: 'var(--landing-text)', width: '100%' },
                  }}
                />
              ))}
            </RadioGroup>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={() => setStep(s => s - 1)}
                startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
                sx={{ color: 'var(--landing-text-muted)', textTransform: 'none' }}>
                Anterior
              </Button>
              {step < totalPreguntas ? (
                <Button variant="contained" onClick={() => setStep(s => s + 1)}
                  disabled={respuestas[currentPregunta.idPregunta] === undefined}
                  endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
                  sx={{ bgcolor: 'var(--landing-primary)', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'var(--landing-primary-hover, var(--landing-primary))' } }}>
                  Siguiente
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  endIcon={submitting ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Iconify icon="mdi:check" width={18} />}
                  sx={{ bgcolor: '#43a047', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#388e3c' } }}>
                  Enviar respuestas
                </Button>
              )}
            </Box>
          </Card>
        )}

        {/* Result */}
        {step === totalPreguntas + 1 && resultado && (
          <Card sx={{
            p: 5, bgcolor: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))', border: '1px solid var(--landing-text-muted)',
            borderRadius: 3, textAlign: 'center', animation: 'fadeInUp 0.6s ease-out', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <Iconify icon="mdi:check-circle-outline" width={72} sx={{ color: '#43a047', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--landing-text)', mb: 1 }}>
              Completado!
            </Typography>
            {resultado.total > 0 && (
              <Typography variant="h5" sx={{ color: 'var(--landing-primary)', mb: 1 }}>
                {resultado.correctas} de {resultado.total} correctas
              </Typography>
            )}
            <Typography variant="body1" sx={{ color: 'var(--landing-text-muted)' }}>
              Gracias por participar
            </Typography>
          </Card>
        )}
      </Container>

      <LandingFooter />
    </Box>
  );
}
