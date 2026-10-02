import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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

import { useRouter } from 'src/routes/hooks';

import { useAnalytics } from 'src/hooks/use-analytics';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { LandingFooter } from 'src/components/landing-footer';

import { useLandingTheme } from 'src/sections/inicio/themes';

// ----------------------------------------------------------------------

const API_PUBLIC = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.publico.php`;
const API_QUIZ = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.cuestionarios.publico.php`;

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

interface Opcion {
  idOpcion: number;
  textoOpcion: string;
  orden: number;
}

interface Pregunta {
  idPregunta: number;
  textoPregunta: string;
  orden: number;
  tipoPregunta: 'opcion_multiple' | 'abierta';
  opciones: Opcion[];
}

interface QuizData {
  idCuestionario: number;
  titulo: string;
  descripcion: string;
  preguntas: Pregunta[];
}

type Step = 'info' | 'quiz' | 'result';

export function CuestionarioResponderView() {
  const router = useRouter();
  const { id } = useParams();
  useAnalytics(`/quiz/${id}`);
  const [tema, setTema] = useState('corporativo');
  const [logo, setLogo] = useState('');
  const [redes, setRedes] = useState<{ nombre: string; icono: string; url: string }[]>([]);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [step, setStep] = useState<Step>('info');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [respuestasTexto, setRespuestasTexto] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ total: number; correctas: number } | null>(null);
  const [error, setError] = useState('');

  const themeVars = useLandingTheme(tema);

  useEffect(() => {
    fetch(API_PUBLIC)
      .then((r) => r.json())
      .then((d) => {
        if (d.success !== false) {
          if (d.config?.tema) setTema(d.config.tema);
          if (d.config?.logo) setLogo(d.config.logo);
          if (Array.isArray(d.redes)) setRedes(d.redes);
        }
      })
      .catch(() => {});

    if (id) {
      fetch(`${API_QUIZ}?id=${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success !== false && d.cuestionario) {
            setQuiz(d.cuestionario);
          } else {
            setError('Cuestionario no encontrado');
          }
        })
        .catch(() => setError('Error de conexion'));
    }
  }, [id]);

  const seleccionarOpcion = (idPregunta: number, idOpcion: number) => {
    setRespuestas({ ...respuestas, [idPregunta]: idOpcion });
  };

  const enviar = async () => {
    if (!quiz) return;
    setEnviando(true);
    try {
      const r = await fetch(API_QUIZ, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCuestionario: quiz.idCuestionario,
          nombre: nombre || null,
          email: email || null,
          respuestas,
          respuestasTexto,
        }),
      });
      const d = await r.json();
      if (d.success) {
        setResultado(d.resultado || { total: quiz.preguntas.length, correctas: 0 });
        setStep('result');
      } else {
        setError(d.error || 'Error al enviar respuestas');
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setEnviando(false);
    }
  };

  const keyframes = `
    @keyframes fadeIn { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes fadeInDown { 0%{opacity:0;transform:translateY(-20px)} 100%{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
  `;

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'var(--landing-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} style={themeVars}>
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Iconify icon="mdi:alert-circle-outline" width={48} sx={{ color: '#e53935', mb: 1 }} />
          <Typography variant="h6">{error}</Typography>
          <Button onClick={() => router.push('/quiz')} sx={{ mt: 2 }}>Volver</Button>
        </Card>
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'var(--landing-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} style={themeVars}>
        <Typography sx={{ color: 'var(--landing-text)', opacity: 0.5 }}>Cargando...</Typography>
      </Box>
    );
  }

  const preguntaActual = quiz.preguntas[currentQ];
  const totalPreguntas = quiz.preguntas.length;
  const preguntaRespondida = (p: Pregunta) =>
    p.tipoPregunta === 'abierta'
      ? (respuestasTexto[p.idPregunta] || '').trim().length > 0
      : respuestas[p.idPregunta] !== undefined;
  const todasRespondidas = quiz.preguntas.every(preguntaRespondida);
  const totalRespondidas = quiz.preguntas.filter(preguntaRespondida).length;
  const progreso = (totalRespondidas / totalPreguntas) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'var(--landing-bg)', display: 'flex', flexDirection: 'column' }} style={themeVars}>
      <style>{keyframes}</style>

      {/* Navbar */}
      <Box sx={{
        py: 1.5, px: { xs: 2, md: 6 },
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--landing-navbar-bg)', backdropFilter: 'blur(10px)',
        boxShadow: 'var(--landing-navbar-shadow)',
      }}>
        <Box component="img" src={logo || `${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" sx={{ height: 40, cursor: 'pointer' }} onClick={() => router.push('/')} />
        <Button variant="text" onClick={() => router.push('/quiz')} startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
          sx={{ color: 'var(--landing-text)', textTransform: 'none' }}
        >
          Volver
        </Button>
      </Box>

      <Container maxWidth="sm" sx={{ pt: 4, pb: 8, flex: 1 }}>
        {/* STEP: Info */}
        {step === 'info' && (
          <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
            <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, textAlign: 'center', background: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <Iconify icon="mdi:clipboard-check-outline" width={56} sx={{ color: 'var(--landing-primary)', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--landing-text)', mb: 1 }}>
                {quiz.titulo}
              </Typography>
              {quiz.descripcion && (
                <Typography sx={{ color: 'var(--landing-text)', opacity: 0.7, mb: 3 }}>
                  {quiz.descripcion}
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--landing-primary)' }}>{totalPreguntas}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--landing-text)', opacity: 0.6 }}>Preguntas</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" sx={{ color: 'var(--landing-text)', mb: 2, textAlign: 'left' }}>
                Datos del participante (opcional):
              </Typography>
              <TextField
                fullWidth size="small" label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
                sx={{ mb: 2, ...inputSx }}
              />
              <TextField
                fullWidth size="small" label="Correo electronico" value={email} onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 3, ...inputSx }}
              />

              <Button
                variant="contained" fullWidth size="large" onClick={() => setStep('quiz')}
                endIcon={<Iconify icon="mdi:arrow-right" width={20} />}
                sx={{
                  bgcolor: 'var(--landing-primary)', textTransform: 'none', fontWeight: 700, fontSize: '1.1rem',
                  py: 1.5, borderRadius: 2,
                  '&:hover': { bgcolor: 'var(--landing-primary-hover, var(--landing-primary))' },
                }}
              >
                Comenzar
              </Button>
            </Card>
          </Box>
        )}

        {/* STEP: Quiz questions */}
        {step === 'quiz' && preguntaActual && (
          <Box sx={{ animation: 'fadeIn 0.4s ease-out' }} key={currentQ}>
            {/* Progress */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'var(--landing-text)', opacity: 0.6, fontWeight: 600 }}>
                  Pregunta {currentQ + 1} de {totalPreguntas}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--landing-text)', opacity: 0.6 }}>
                  {Math.round(progreso)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate" value={progreso}
                sx={{
                  height: 6, borderRadius: 3,
                  bgcolor: 'var(--landing-circle1, rgba(0,0,0,0.08))',
                  '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'var(--landing-primary)' },
                }}
              />
            </Box>

            <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, background: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--landing-text)', mb: 3, lineHeight: 1.4 }}>
                {preguntaActual.textoPregunta}
              </Typography>

              {preguntaActual.tipoPregunta === 'abierta' ? (
                <TextField
                  fullWidth multiline rows={4}
                  placeholder="Escribe tu respuesta aqui..."
                  value={respuestasTexto[preguntaActual.idPregunta] || ''}
                  onChange={(e) => setRespuestasTexto({ ...respuestasTexto, [preguntaActual.idPregunta]: e.target.value })}
                  sx={inputSx}
                />
              ) : (
                <RadioGroup
                  value={respuestas[preguntaActual.idPregunta] ?? ''}
                  onChange={(e) => seleccionarOpcion(preguntaActual.idPregunta, parseInt(e.target.value, 10))}
                >
                  {preguntaActual.opciones.map((o, oIdx) => {
                    const isSelected = respuestas[preguntaActual.idPregunta] === o.idOpcion;
                    return (
                      <Box
                        key={o.idOpcion}
                        sx={{
                          mb: 1.5, p: 1.5, borderRadius: 2, cursor: 'pointer',
                          border: isSelected ? '2px solid var(--landing-primary)' : '1px solid rgba(0,0,0,0.12)',
                          bgcolor: isSelected ? 'var(--landing-circle1, rgba(0,0,0,0.03))' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: 'var(--landing-circle1, rgba(0,0,0,0.03))' },
                          animation: `fadeIn 0.3s ease-out ${0.05 * oIdx}s both`,
                        }}
                        onClick={() => seleccionarOpcion(preguntaActual.idPregunta, o.idOpcion)}
                      >
                        <FormControlLabel
                          value={o.idOpcion}
                          control={<Radio size="small" sx={{ color: 'var(--landing-primary)', '&.Mui-checked': { color: 'var(--landing-primary)' } }} />}
                          label={
                            <Typography variant="body1" sx={{ color: 'var(--landing-text)', fontWeight: isSelected ? 600 : 400 }}>
                              {o.textoOpcion}
                            </Typography>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </Box>
                    );
                  })}
                </RadioGroup>
              )}
            </Card>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
              <Button
                variant="outlined" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
                sx={{ borderColor: 'var(--landing-btn-outline-border)', color: 'var(--landing-btn-outline-color)', textTransform: 'none' }}
              >
                Anterior
              </Button>

              {currentQ < totalPreguntas - 1 ? (
                <Button
                  variant="contained" onClick={() => setCurrentQ(currentQ + 1)}
                  endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
                  disabled={!preguntaRespondida(preguntaActual)}
                  sx={{ bgcolor: 'var(--landing-primary)', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'var(--landing-primary-hover, var(--landing-primary))' } }}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="contained" onClick={enviar} disabled={!todasRespondidas || enviando}
                  endIcon={<Iconify icon="mdi:check" width={18} />}
                  sx={{ bgcolor: 'var(--landing-accent, var(--landing-primary))', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'var(--landing-accent-hover, var(--landing-primary))' } }}
                >
                  {enviando ? 'Enviando...' : 'Enviar Respuestas'}
                </Button>
              )}
            </Box>

            {/* Question dots */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 3, flexWrap: 'wrap' }}>
              {quiz.preguntas.map((p, i) => (
                <Box
                  key={p.idPregunta}
                  onClick={() => setCurrentQ(i)}
                  sx={{
                    width: 12, height: 12, borderRadius: '50%', cursor: 'pointer',
                    bgcolor: i === currentQ
                      ? 'var(--landing-primary)'
                      : preguntaRespondida(p)
                        ? 'var(--landing-accent, var(--landing-primary))'
                        : 'var(--landing-circle1, rgba(0,0,0,0.15))',
                    transition: 'all 0.2s ease',
                    transform: i === currentQ ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* STEP: Result */}
        {step === 'result' && resultado && (
          <Box sx={{ animation: 'scaleIn 0.5s ease-out', textAlign: 'center' }}>
            <Card sx={{ p: { xs: 4, md: 5 }, borderRadius: 3, background: 'var(--landing-hero-card-bg, rgba(255,255,255,0.95))', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <Iconify
                icon={resultado.correctas >= resultado.total * 0.7 ? 'mdi:trophy-outline' : 'mdi:clipboard-check-outline'}
                width={72}
                sx={{ color: 'var(--landing-primary)', mb: 2 }}
              />
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--landing-text)', mb: 1 }}>
                Cuestionario Completado
              </Typography>
              <Typography sx={{ color: 'var(--landing-text)', opacity: 0.7, mb: 3 }}>
                {quiz.titulo}
              </Typography>

              <Box sx={{
                p: 3, borderRadius: 3, mb: 3,
                bgcolor: 'var(--landing-circle1, rgba(0,0,0,0.04))',
              }}>
                <Typography variant="h2" sx={{ fontWeight: 800, color: 'var(--landing-primary)' }}>
                  {resultado.correctas}/{resultado.total}
                </Typography>
                <Typography variant="body1" sx={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                  Respuestas correctas ({Math.round((resultado.correctas / resultado.total) * 100)}%)
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={(resultado.correctas / resultado.total) * 100}
                sx={{
                  height: 10, borderRadius: 5, mb: 4,
                  bgcolor: 'var(--landing-circle1, rgba(0,0,0,0.08))',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    bgcolor: resultado.correctas >= resultado.total * 0.7 ? '#4caf50' : resultado.correctas >= resultado.total * 0.4 ? '#ff9800' : '#e53935',
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => router.push('/quiz')}
                  startIcon={<Iconify icon="mdi:arrow-left" width={18} />}
                  sx={{ borderColor: 'var(--landing-btn-outline-border)', color: 'var(--landing-btn-outline-color)', textTransform: 'none' }}
                >
                  Ver mas cuestionarios
                </Button>
                <Button variant="contained" onClick={() => { setRespuestas({}); setRespuestasTexto({}); setCurrentQ(0); setResultado(null); setStep('info'); }}
                  startIcon={<Iconify icon="mdi:refresh" width={18} />}
                  sx={{ bgcolor: 'var(--landing-primary)', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'var(--landing-primary-hover, var(--landing-primary))' } }}
                >
                  Intentar de nuevo
                </Button>
              </Box>
            </Card>
          </Box>
        )}
      </Container>

      <LandingFooter redes={redes} />
    </Box>
  );
}
