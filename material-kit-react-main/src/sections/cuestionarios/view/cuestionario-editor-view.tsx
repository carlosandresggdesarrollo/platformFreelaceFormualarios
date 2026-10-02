import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API_CUESTIONARIOS = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.cuestionarios.php`;
const API_PREGUNTAS = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.preguntas.php`;

interface Opcion {
  idOpcion?: number;
  textoOpcion: string;
  esCorrecta: boolean;
  orden: number;
}

interface Pregunta {
  idPregunta?: number;
  textoPregunta: string;
  orden: number;
  tipoPregunta: 'opcion_multiple' | 'abierta';
  opciones: Opcion[];
}

export function CuestionarioEditorView() {
  const theme = useDashboardTheme();
  const router = useRouter();
  const { id } = useParams();
  const isEditing = !!id;

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('borrador');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [expanded, setExpanded] = useState<number | false>(0);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async () => {
    if (!id) return;
    try {
      const d = await apiFetch<any>(`${API_CUESTIONARIOS}?id=${id}`, { headers: auth });
      if (d.success !== false && d.cuestionario) {
        const c = d.cuestionario;
        setTitulo(c.titulo);
        setDescripcion(c.descripcion || '');
        setEstado(c.estado);
        setPreguntas(
          (c.preguntas || []).map((p: any) => ({
            idPregunta: p.idPregunta,
            textoPregunta: p.textoPregunta,
            orden: p.orden,
            tipoPregunta: p.tipoPregunta || 'opcion_multiple',
            opciones: (p.opciones || []).map((o: any) => ({
              idOpcion: o.idOpcion,
              textoOpcion: o.textoOpcion,
              esCorrecta: !!parseInt(o.esCorrecta, 10),
              orden: o.orden,
            })),
          }))
        );
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const agregarPregunta = (tipo: 'opcion_multiple' | 'abierta' = 'opcion_multiple') => {
    const nueva: Pregunta = {
      textoPregunta: '',
      orden: preguntas.length,
      tipoPregunta: tipo,
      opciones: tipo === 'abierta' ? [] : [
        { textoOpcion: '', esCorrecta: true, orden: 0 },
        { textoOpcion: '', esCorrecta: false, orden: 1 },
        { textoOpcion: '', esCorrecta: false, orden: 2 },
        { textoOpcion: '', esCorrecta: false, orden: 3 },
      ],
    };
    setPreguntas([...preguntas, nueva]);
    setExpanded(preguntas.length);
  };

  const toggleTipoPregunta = (idx: number) => {
    setPreguntas(preguntas.map((p, i) => {
      if (i !== idx) return p;
      const nuevoTipo = p.tipoPregunta === 'abierta' ? 'opcion_multiple' : 'abierta';
      return {
        ...p,
        tipoPregunta: nuevoTipo,
        opciones: nuevoTipo === 'abierta' ? [] : [
          { textoOpcion: '', esCorrecta: true, orden: 0 },
          { textoOpcion: '', esCorrecta: false, orden: 1 },
        ],
      };
    }));
  };

  const eliminarPregunta = (idx: number) => {
    setPreguntas(preguntas.filter((_, i) => i !== idx).map((p, i) => ({ ...p, orden: i })));
    if (expanded === idx) setExpanded(false);
  };

  const actualizarPregunta = (idx: number, field: string, value: string) => {
    setPreguntas(preguntas.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const actualizarOpcion = (pIdx: number, oIdx: number, field: string, value: string | boolean) => {
    setPreguntas(
      preguntas.map((p, pi) => {
        if (pi !== pIdx) return p;
        return {
          ...p,
          opciones: p.opciones.map((o, oi) => {
            if (field === 'esCorrecta') {
              return { ...o, esCorrecta: oi === oIdx };
            }
            return oi === oIdx ? { ...o, [field]: value } : o;
          }),
        };
      })
    );
  };

  const agregarOpcion = (pIdx: number) => {
    setPreguntas(
      preguntas.map((p, i) => {
        if (i !== pIdx || p.opciones.length >= 5) return p;
        return { ...p, opciones: [...p.opciones, { textoOpcion: '', esCorrecta: false, orden: p.opciones.length }] };
      })
    );
  };

  const eliminarOpcion = (pIdx: number, oIdx: number) => {
    setPreguntas(
      preguntas.map((p, i) => {
        if (i !== pIdx || p.opciones.length <= 2) return p;
        const nuevas = p.opciones.filter((_, oi) => oi !== oIdx).map((o, oi) => ({ ...o, orden: oi }));
        if (!nuevas.some((o) => o.esCorrecta) && nuevas.length > 0) {
          nuevas[0].esCorrecta = true;
        }
        return { ...p, opciones: nuevas };
      })
    );
  };

  const moverPregunta = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= preguntas.length) return;
    const arr = [...preguntas];
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setPreguntas(arr.map((p, i) => ({ ...p, orden: i })));
    setExpanded(target);
  };

  const guardar = async () => {
    if (!titulo.trim()) {
      setMensaje({ tipo: 'error', texto: 'El titulo es obligatorio' });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      let cuestionarioId = id ? parseInt(id, 10) : 0;

      if (isEditing) {
        await apiFetch<any>(API_CUESTIONARIOS, {
          method: 'PUT',
          headers: { ...auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cuestionarioId, titulo, descripcion, estado }),
        });
      } else {
        const d = await apiFetch<any>(API_CUESTIONARIOS, {
          method: 'POST',
          headers: { ...auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo, descripcion }),
        });
        if (!d.success) throw new Error(d.error);
        cuestionarioId = d.idCuestionario;
      }

      // Save each pregunta
      for (const p of preguntas) {
        const opcData = p.tipoPregunta === 'abierta' ? [] : p.opciones.map((o) => ({ texto: o.textoOpcion, esCorrecta: o.esCorrecta }));
        if (p.idPregunta) {
          await apiFetch<any>(API_PREGUNTAS, {
            method: 'PUT',
            headers: { ...auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ idPregunta: p.idPregunta, texto: p.textoPregunta, opciones: opcData, tipo: p.tipoPregunta }),
          });
        } else {
          await apiFetch<any>(API_PREGUNTAS, {
            method: 'POST',
            headers: { ...auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ idCuestionario: cuestionarioId, texto: p.textoPregunta, orden: p.orden, opciones: opcData, tipo: p.tipoPregunta }),
          });
        }
      }

      setMensaje({ tipo: 'success', texto: 'Cuestionario guardado exitosamente' });
      if (!isEditing) {
        router.push(`/cuestionarios/editar/${cuestionarioId}`);
      } else {
        cargar();
      }
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e.message || 'Error al guardar' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box>
      <ModuloHeader titulo={isEditing ? 'Editar Cuestionario' : 'Nuevo Cuestionario'} subtitulo="Configura las preguntas y opciones de respuesta" />

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mt: 2, borderRadius: 2 }} onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Header info */}
      <Card sx={{ p: 3, mt: 3, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <TextField
            fullWidth label="Titulo del cuestionario" value={titulo} onChange={(e) => setTitulo(e.target.value)}
            sx={{ flex: 2 }}
          />
          <TextField
            fullWidth label="Descripcion (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
            multiline rows={1} sx={{ flex: 3 }}
          />
        </Box>
        {isEditing && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: theme.textMuted }}>Estado:</Typography>
            <Chip label={estado} size="small" color={estado === 'publicado' ? 'success' : estado === 'cerrado' ? 'error' : 'default'} sx={{ textTransform: 'capitalize' }} />
          </Box>
        )}
      </Card>

      {/* Preguntas */}
      <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
          Preguntas ({preguntas.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined" onClick={() => agregarPregunta('opcion_multiple')}
            startIcon={<Iconify icon="mdi:format-list-checks" width={18} />}
            sx={{ borderColor: theme.primary, color: theme.primary, '&:hover': { bgcolor: theme.primaryLight } }}
          >
            Opcion Multiple
          </Button>
          <Button
            variant="outlined" onClick={() => agregarPregunta('abierta')}
            startIcon={<Iconify icon="mdi:text-long" width={18} />}
            sx={{ borderColor: theme.accent, color: theme.accent, '&:hover': { bgcolor: theme.primaryLight } }}
          >
            Pregunta Abierta
          </Button>
        </Box>
      </Box>

      {preguntas.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow }}>
          <Iconify icon="mdi:clipboard-text-outline" width={48} sx={{ color: theme.textMuted, mb: 1 }} />
          <Typography sx={{ color: theme.textMuted }}>No hay preguntas. Agrega una para comenzar.</Typography>
        </Card>
      )}

      {preguntas.map((p, pIdx) => (
        <Accordion
          key={pIdx} expanded={expanded === pIdx} onChange={(_, isExpanded) => setExpanded(isExpanded ? pIdx : false)}
          sx={{ mb: 1, borderRadius: '8px !important', overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadowLight, '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" width={24} />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, mr: 1 }}>
              <Chip label={pIdx + 1} size="small" sx={{ fontWeight: 700, minWidth: 32, bgcolor: theme.primaryLight, color: theme.primary }} />
              <Typography variant="subtitle2" sx={{ color: theme.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.textoPregunta || '(Sin texto)'}
              </Typography>
              <Chip
                label={p.tipoPregunta === 'abierta' ? 'Abierta' : `${p.opciones.length} opciones`}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  bgcolor: p.tipoPregunta === 'abierta' ? (theme.isDark ? 'rgba(255,152,0,0.15)' : 'rgba(255,152,0,0.1)') : 'transparent',
                  color: p.tipoPregunta === 'abierta' ? '#FF9800' : theme.textMuted,
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FormControlLabel
                control={<Switch size="small" checked={p.tipoPregunta === 'abierta'} onChange={() => toggleTipoPregunta(pIdx)} />}
                label={<Typography variant="body2" sx={{ color: theme.textSecondary }}>{p.tipoPregunta === 'abierta' ? 'Pregunta abierta (texto libre)' : 'Opcion multiple'}</Typography>}
              />
            </Box>

            <TextField
              fullWidth label="Texto de la pregunta" value={p.textoPregunta}
              onChange={(e) => actualizarPregunta(pIdx, 'textoPregunta', e.target.value)}
              multiline rows={2} sx={{ mb: 2 }}
            />

            {p.tipoPregunta === 'abierta' ? (
              <Box sx={{ p: 2, borderRadius: 2, border: `1px dashed ${theme.border}`, textAlign: 'center' }}>
                <Iconify icon="mdi:text-long" width={32} sx={{ color: theme.textMuted, mb: 1 }} />
                <Typography variant="body2" sx={{ color: theme.textMuted }}>
                  El participante escribira su respuesta en un campo de texto libre
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.textSecondary }}>
                  Opciones (marca la correcta):
                </Typography>

                <RadioGroup value={p.opciones.findIndex((o) => o.esCorrecta)} onChange={(e) => actualizarOpcion(pIdx, parseInt(e.target.value, 10), 'esCorrecta', true)}>
                  {p.opciones.map((o, oIdx) => (
                    <Box key={oIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <FormControlLabel
                        value={oIdx} control={<Radio size="small" />}
                        label="" sx={{ mr: 0 }}
                      />
                      <TextField
                        fullWidth size="small" placeholder={`Opcion ${String.fromCharCode(65 + oIdx)}`}
                        value={o.textoOpcion}
                        onChange={(e) => actualizarOpcion(pIdx, oIdx, 'textoOpcion', e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: o.esCorrecta ? (theme.isDark ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.05)') : 'transparent',
                          },
                        }}
                      />
                      {p.opciones.length > 2 && (
                        <IconButton size="small" onClick={() => eliminarOpcion(pIdx, oIdx)}>
                          <Iconify icon="mdi:close" width={16} sx={{ color: theme.error }} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </RadioGroup>

                {p.opciones.length < 5 && (
                  <Button
                    size="small" onClick={() => agregarOpcion(pIdx)}
                    startIcon={<Iconify icon="mdi:plus" width={16} />}
                    sx={{ mt: 1, color: theme.textMuted }}
                  >
                    Agregar opcion
                  </Button>
                )}
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <IconButton size="small" disabled={pIdx === 0} onClick={() => moverPregunta(pIdx, -1)} title="Subir">
                <Iconify icon="mdi:arrow-up" width={18} />
              </IconButton>
              <IconButton size="small" disabled={pIdx === preguntas.length - 1} onClick={() => moverPregunta(pIdx, 1)} title="Bajar">
                <Iconify icon="mdi:arrow-down" width={18} />
              </IconButton>
              <IconButton size="small" onClick={() => eliminarPregunta(pIdx)} title="Eliminar pregunta">
                <Iconify icon="mdi:delete-outline" width={18} sx={{ color: theme.error }} />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Botones finales */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => router.push('/cuestionarios')}
          sx={{ borderColor: theme.border, color: theme.textSecondary }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained" onClick={guardar} disabled={guardando}
          startIcon={<Iconify icon="mdi:content-save-outline" width={18} />}
          sx={{ bgcolor: theme.primary, fontWeight: 600, '&:hover': { bgcolor: theme.primaryHover } }}
        >
          {guardando ? 'Guardando...' : 'Guardar Cuestionario'}
        </Button>
      </Box>
    </Box>
  );
}
