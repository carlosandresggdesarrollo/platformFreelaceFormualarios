import type { LandingThemeName } from 'src/sections/inicio/themes';

import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

import { THEME_META } from 'src/sections/inicio/themes';

import { FormularioPreview } from './formulario-preview';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.php`;
const API_UPLOAD = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.upload.php`;

interface Opcion { idOpcion?: number; texto: string; esCorrecta: boolean }
interface Pregunta { idPregunta: number; textoPregunta: string; orden: number; tipo?: string; opciones: { idOpcion: number; textoOpcion: string; esCorrecta: string; orden: number }[] }
interface Formulario {
  idCuestionario: number; titulo: string; descripcion: string; estado: string;
  compartirToken: string; slug: string; preguntas: Pregunta[];
  tema: string | null; colorPrimario: string | null; colorFondo: string | null;
  imagenFondo: string | null; musicaUrl: string | null; musicaTipo: string | null;
  opacidadFondo: number | null;
}

function HelpTip({ text }: { text: string }) {
  return (
    <Tooltip title={text} arrow placement="top">
      <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
        <Iconify icon="mdi:help-circle-outline" width={18} />
      </IconButton>
    </Tooltip>
  );
}

export function FormularioEditorView() {
  const { id } = useParams();
  const router = useRouter();
  const theme = useDashboardTheme();

  const [form, setForm] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [publicado, setPublicado] = useState(false);

  // Personalization state
  const [pTema, setPTema] = useState<string | null>(null);
  const [pColorPrimario, setPColorPrimario] = useState<string | null>(null);
  const [pColorFondo, setPColorFondo] = useState<string | null>(null);
  const [pImagenFondo, setPImagenFondo] = useState<string | null>(null);
  const [pMusicaUrl, setPMusicaUrl] = useState<string | null>(null);
  const [pMusicaTipo, setPMusicaTipo] = useState<string | null>(null);
  const [pOpacidad, setPOpacidad] = useState(40);
  const [savingPersonalizacion, setSavingPersonalizacion] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [personalizeMsg, setPersonalizeMsg] = useState('');

  // Config state
  const [crearParticipante, setCrearParticipante] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Music link input
  const [musicLinkInput, setMusicLinkInput] = useState('');
  const [musicSourceType, setMusicSourceType] = useState<'archivo' | 'youtube' | 'url'>('archivo');

  // Question state
  const [newPregunta, setNewPregunta] = useState('');
  const [newOpciones, setNewOpciones] = useState<Opcion[]>([
    { texto: '', esCorrecta: false },
    { texto: '', esCorrecta: false },
  ]);
  const [addingPregunta, setAddingPregunta] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const headers = useCallback(() => {
    const h: any = { 'Content-Type': 'application/json' };
    const t = getAccessToken();
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
  }, []);

  const fetchForm = useCallback(async () => {
    if (!id) return;
    try {
      const t = getAccessToken();
      const h: any = {};
      if (t) h.Authorization = `Bearer ${t}`;
      const d = await apiFetch<any>(`${API}?vista=formulario&id=${id}`, { headers: h });
      if (d.success && d.formulario) {
        const f = d.formulario;
        setForm(f);
        setTitulo(f.titulo);
        setDescripcion(f.descripcion || '');
        setPublicado(f.estado === 'publicado');
        setPTema(f.tema || null);
        setPColorPrimario(f.colorPrimario || null);
        setPColorFondo(f.colorFondo || null);
        setPImagenFondo(f.imagenFondo || null);
        setPMusicaUrl(f.musicaUrl || null);
        setPMusicaTipo(f.musicaTipo || null);
        setPOpacidad(f.opacidadFondo ?? 40);
        setCrearParticipante(Number(f.crearParticipante) === 1);
        if (f.musicaTipo && f.musicaTipo !== 'archivo') {
          setMusicSourceType(f.musicaTipo);
          setMusicLinkInput(f.musicaUrl || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchForm(); }, [fetchForm]);

  // ================================================================
  //  Content handlers
  // ================================================================

  const handleSave = async () => {
    if (!form || !titulo.trim()) return;
    setSaving(true);
    try {
      await apiFetch<any>(API, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          accion: 'actualizar',
          idCuestionario: form.idCuestionario,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          estado: publicado ? 'publicado' : 'borrador',
        }),
      });
      fetchForm();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleAddPregunta = async () => {
    if (!form || !newPregunta.trim()) return;
    const opcionesValidas = newOpciones.filter(o => o.texto.trim());
    if (opcionesValidas.length < 2) return;
    setAddingPregunta(true);
    try {
      await apiFetch<any>(API, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          accion: 'agregar_pregunta',
          idCuestionario: form.idCuestionario,
          texto: newPregunta.trim(),
          orden: (form.preguntas?.length || 0) + 1,
          opciones: opcionesValidas.map(o => ({ texto: o.texto.trim(), esCorrecta: o.esCorrecta })),
        }),
      });
      setNewPregunta('');
      setNewOpciones([{ texto: '', esCorrecta: false }, { texto: '', esCorrecta: false }]);
      fetchForm();
    } catch (e) { console.error(e); }
    finally { setAddingPregunta(false); }
  };

  const handleDeletePregunta = async (idPregunta: number) => {
    try {
      await apiFetch<any>(API, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ accion: 'eliminar_pregunta', idPregunta }),
      });
      fetchForm();
    } catch (e) { console.error(e); }
  };

  const copyLink = () => {
    if (!form) return;
    const slugPart = form.slug ? `/${form.slug}` : '';
    const url = `${window.location.origin}${CONFIG.basePath}/form/${form.compartirToken}${slugPart}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ================================================================
  //  Personalization handlers
  // ================================================================

  const savePersonalizacion = async (campos: Record<string, any>) => {
    if (!form) return;
    setSavingPersonalizacion(true);
    setPersonalizeMsg('');
    try {
      await apiFetch<any>(API, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ accion: 'personalizar', idCuestionario: form.idCuestionario, ...campos }),
      });
      setPersonalizeMsg('Guardado');
      setTimeout(() => setPersonalizeMsg(''), 2000);
    } catch (e) { console.error(e); }
    finally { setSavingPersonalizacion(false); }
  };

  const handleTemaChange = (t: string | null) => {
    setPTema(t);
    savePersonalizacion({ tema: t });
  };

  const handleColorChange = (field: 'colorPrimario' | 'colorFondo', value: string | null) => {
    if (field === 'colorPrimario') setPColorPrimario(value);
    else setPColorFondo(value);
    savePersonalizacion({ [field]: value });
  };

  const handleOpacidadChange = (_: any, v: number | number[]) => {
    setPOpacidad(v as number);
  };
  const handleOpacidadCommit = (_: any, v: number | number[]) => {
    savePersonalizacion({ opacidadFondo: v as number });
  };

  const handleFileUpload = async (file: File, tipo: 'imagen' | 'audio') => {
    if (!form) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      fd.append('idCuestionario', String(form.idCuestionario));
      fd.append('tipo', tipo);

      const t = getAccessToken();
      const r = await fetch(API_UPLOAD, {
        method: 'POST',
        headers: t ? { Authorization: `Bearer ${t}` } : {},
        body: fd,
      });
      const d = await r.json();
      if (d.success) {
        if (tipo === 'imagen') setPImagenFondo(d.path);
        else { setPMusicaUrl(d.path); setPMusicaTipo('archivo'); }
        setPersonalizeMsg('Archivo subido');
        setTimeout(() => setPersonalizeMsg(''), 2000);
      } else {
        setPersonalizeMsg(d.error || 'Error al subir');
        setTimeout(() => setPersonalizeMsg(''), 4000);
      }
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const handleRemoveImage = () => {
    setPImagenFondo(null);
    savePersonalizacion({ imagenFondo: null });
  };

  const handleRemoveMusic = () => {
    setPMusicaUrl(null);
    setPMusicaTipo(null);
    setMusicLinkInput('');
    savePersonalizacion({ musicaUrl: null, musicaTipo: null });
  };

  const handleMusicLink = () => {
    if (!musicLinkInput.trim()) return;
    setPMusicaUrl(musicLinkInput.trim());
    setPMusicaTipo(musicSourceType);
    savePersonalizacion({ musicaUrl: musicLinkInput.trim(), musicaTipo: musicSourceType });
  };

  // ================================================================
  //  Render
  // ================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography>Formulario no encontrado</Typography>
        <Button onClick={() => router.push('/formularios')} sx={{ mt: 2 }}>Volver</Button>
      </Box>
    );
  }

  return (
    <Box>
      <ModuloHeader titulo="Editor de formulario" subtitulo={form.titulo} />

      <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2, flexWrap: 'wrap' }}>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={() => router.push('/formularios')}
          sx={{ borderColor: theme.border, color: theme.textSecondary }}>
          Volver
        </Button>
        <Button variant="contained" startIcon={<Iconify icon="mdi:content-save" />}
          onClick={handleSave} disabled={saving}
          sx={{ bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover } }}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button variant="outlined" startIcon={<Iconify icon={copiedLink ? 'mdi:check' : 'mdi:link-variant'} />}
          onClick={copyLink}
          sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}>
          {copiedLink ? 'Copiado!' : 'Copiar link'}
        </Button>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:chart-bar" />}
          onClick={() => router.push(`/formularios/stats/${form.idCuestionario}`)}
          sx={{ borderColor: '#2196F3', color: '#2196F3' }}>
          Estadisticas
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
        variant="scrollable" scrollButtons="auto"
        sx={{ mb: 3, borderBottom: `1px solid ${theme.border}` }}>
        <Tab icon={<Iconify icon="mdi:text-box-edit-outline" width={20} />} iconPosition="start" label="Contenido" />
        <Tab icon={<Iconify icon="mdi:palette-outline" width={20} />} iconPosition="start" label="Apariencia" />
        <Tab icon={<Iconify icon="mdi:eye-outline" width={20} />} iconPosition="start" label="Vista Previa" />
        <Tab icon={<Iconify icon="mdi:cog-outline" width={20} />} iconPosition="start" label="Configuracion" />
      </Tabs>

      {/* ====== TAB 0: Contenido ====== */}
      {activeTab === 0 && (
        <>
          <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
            <TextField fullWidth label="Titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              multiline rows={2} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={<Switch checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />}
                label={publicado ? 'Publicado' : 'Borrador'}
              />
              <Chip label={form.estado} size="small" sx={{
                fontWeight: 600,
                bgcolor: form.estado === 'publicado' ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                color: form.estado === 'publicado' ? '#4CAF50' : '#FF9800',
              }} />
            </Box>
          </Card>

          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
            Preguntas ({form.preguntas?.length || 0})
          </Typography>

          {form.preguntas?.map((p, i) => (
            <Card key={p.idPregunta} sx={{ p: 2.5, mb: 2, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 1 }}>
                    {i + 1}. {p.textoPregunta}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {p.opciones.map((o) => (
                      <Chip key={o.idOpcion} label={o.textoOpcion} size="small"
                        icon={Number(o.esCorrecta) === 1 ? <Iconify icon="mdi:check-circle" width={16} /> : undefined}
                        sx={{
                          bgcolor: Number(o.esCorrecta) === 1 ? 'rgba(76,175,80,0.12)' : 'rgba(0,0,0,0.06)',
                          color: Number(o.esCorrecta) === 1 ? '#4CAF50' : theme.textSecondary,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                <IconButton size="small" onClick={() => handleDeletePregunta(p.idPregunta)} sx={{ color: '#F44336' }}>
                  <Iconify icon="mdi:delete-outline" width={20} />
                </IconButton>
              </Box>
            </Card>
          ))}

          <Card sx={{ p: { xs: 2, sm: 3 }, mt: 2, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2, border: `2px dashed ${theme.border}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
              Agregar pregunta
            </Typography>
            <TextField fullWidth label="Texto de la pregunta" value={newPregunta}
              onChange={(e) => setNewPregunta(e.target.value)} sx={{ mb: 2 }} />

            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textSecondary, mb: 1 }}>
              Opciones de respuesta
            </Typography>
            {newOpciones.map((o, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <TextField fullWidth size="small" placeholder={`Opcion ${i + 1}`} value={o.texto}
                  sx={{ flex: 1, minWidth: 120 }}
                  onChange={(e) => {
                    const copy = [...newOpciones];
                    copy[i] = { ...copy[i], texto: e.target.value };
                    setNewOpciones(copy);
                  }} />
                <FormControlLabel
                  control={<Switch size="small" checked={o.esCorrecta}
                    onChange={(e) => {
                      const copy = [...newOpciones];
                      copy[i] = { ...copy[i], esCorrecta: e.target.checked };
                      setNewOpciones(copy);
                    }} />}
                  label="Correcta"
                  sx={{ whiteSpace: 'nowrap', '& .MuiTypography-root': { fontSize: 12 } }}
                />
                {newOpciones.length > 2 && (
                  <IconButton size="small" onClick={() => setNewOpciones(newOpciones.filter((_, j) => j !== i))}>
                    <Iconify icon="mdi:close" width={18} />
                  </IconButton>
                )}
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button size="small" startIcon={<Iconify icon="mdi:plus" />}
                onClick={() => setNewOpciones([...newOpciones, { texto: '', esCorrecta: false }])}
                sx={{ color: theme.textSecondary }}>
                Agregar opcion
              </Button>
              <Button variant="contained" size="small" onClick={handleAddPregunta}
                disabled={addingPregunta || !newPregunta.trim() || newOpciones.filter(o => o.texto.trim()).length < 2}
                startIcon={<Iconify icon="mdi:check" />}
                sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}>
                {addingPregunta ? 'Agregando...' : 'Agregar pregunta'}
              </Button>
            </Box>
          </Card>
        </>
      )}

      {/* ====== TAB 1: Apariencia ====== */}
      {activeTab === 1 && (
        <Box>
          <Alert severity="info" icon={<Iconify icon="mdi:lightbulb-outline" width={22} />} sx={{ mb: 3, borderRadius: 2 }}>
            Personaliza como se ve y se siente tu formulario. Los cambios se guardan automaticamente y puedes ver el resultado en la pestana <strong>Vista Previa</strong>.
          </Alert>

          {personalizeMsg && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{personalizeMsg}</Alert>
          )}

          {/* Tema base */}
          <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="mdi:palette" width={22} sx={{ color: theme.primary, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary }}>
                Tema base
              </Typography>
              <HelpTip text="Elige una paleta de colores base para tu formulario. Puedes personalizar los colores despues." />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Sin tema (global) */}
              <Box
                onClick={() => handleTemaChange(null)}
                sx={{
                  cursor: 'pointer', borderRadius: 2, p: 1.5, border: 2,
                  width: { xs: 'calc(50% - 8px)', sm: 130 },
                  borderColor: !pTema ? theme.primary : theme.border,
                  bgcolor: !pTema ? `${theme.primary}11` : 'transparent',
                  textAlign: 'center', transition: 'all 0.2s',
                  '&:hover': { borderColor: theme.primary },
                }}
              >
                <Iconify icon="mdi:earth" width={28} sx={{ color: theme.textSecondary, mb: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>Global</Typography>
                <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: 10 }}>Usa el tema de la plataforma</Typography>
              </Box>

              {(Object.entries(THEME_META) as [LandingThemeName, typeof THEME_META[LandingThemeName]][]).map(([key, meta]) => (
                <Box
                  key={key}
                  onClick={() => handleTemaChange(key)}
                  sx={{
                    cursor: 'pointer', borderRadius: 2, p: 1.5, border: 2,
                    width: { xs: 'calc(50% - 8px)', sm: 130 },
                    borderColor: pTema === key ? theme.primary : theme.border,
                    bgcolor: pTema === key ? `${theme.primary}11` : 'transparent',
                    textAlign: 'center', transition: 'all 0.2s',
                    '&:hover': { borderColor: theme.primary },
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mb: 0.5 }}>
                    {meta.previewColors.map((c, ci) => (
                      <Box key={ci} sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{meta.label}</Typography>
                  <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: 10 }}>{meta.description}</Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Colores personalizados */}
          <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="mdi:format-color-fill" width={22} sx={{ color: theme.primary, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary }}>
                Colores personalizados
              </Typography>
              <HelpTip text="Estos colores sobrescriben los del tema base. Dejalo vacio para usar los colores del tema." />
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: theme.textSecondary }}>
                  Color primario
                  <HelpTip text="Se usa en botones, barras de progreso y elementos destacados." />
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="input"
                    type="color"
                    value={pColorPrimario || '#0277BD'}
                    onChange={(e: any) => setPColorPrimario(e.target.value)}
                    onBlur={() => handleColorChange('colorPrimario', pColorPrimario)}
                    sx={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 1, p: 0 }}
                  />
                  <Typography variant="caption" sx={{ color: theme.textSecondary, fontFamily: 'monospace' }}>
                    {pColorPrimario || 'Sin personalizar'}
                  </Typography>
                  {pColorPrimario && (
                    <IconButton size="small" onClick={() => handleColorChange('colorPrimario', null)}>
                      <Iconify icon="mdi:close" width={16} />
                    </IconButton>
                  )}
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: theme.textSecondary }}>
                  Color de fondo
                  <HelpTip text="Color base de la pagina. Si agregas una imagen de fondo, este color se vera detras." />
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="input"
                    type="color"
                    value={pColorFondo || '#EDF4F8'}
                    onChange={(e: any) => setPColorFondo(e.target.value)}
                    onBlur={() => handleColorChange('colorFondo', pColorFondo)}
                    sx={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 1, p: 0 }}
                  />
                  <Typography variant="caption" sx={{ color: theme.textSecondary, fontFamily: 'monospace' }}>
                    {pColorFondo || 'Sin personalizar'}
                  </Typography>
                  {pColorFondo && (
                    <IconButton size="small" onClick={() => handleColorChange('colorFondo', null)}>
                      <Iconify icon="mdi:close" width={16} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>
          </Card>

          {/* Imagen de fondo */}
          <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="mdi:image-outline" width={22} sx={{ color: theme.primary, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary }}>
                Imagen de fondo
              </Typography>
              <HelpTip text="Sube una imagen que aparecera como fondo de tu formulario. Formatos: JPG, PNG, WebP, GIF. Max 5 MB." />
            </Box>

            {pImagenFondo ? (
              <Box>
                <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <Box component="img" src={pImagenFondo} alt="Fondo" sx={{ width: '100%', height: 200, objectFit: 'cover' }} />
                  <Box sx={{ position: 'absolute', inset: 0, bgcolor: `rgba(0,0,0,${pOpacidad / 100})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>Opacidad: {pOpacidad}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textSecondary, minWidth: 80 }}>
                    Opacidad
                    <HelpTip text="Controla que tanto se oscurece la imagen para que el texto sea legible." />
                  </Typography>
                  <Slider value={pOpacidad} onChange={handleOpacidadChange} onChangeCommitted={handleOpacidadCommit}
                    min={0} max={100} size="small" sx={{ maxWidth: 250 }} />
                  <Typography variant="caption" sx={{ color: theme.textSecondary, minWidth: 35 }}>{pOpacidad}%</Typography>
                </Box>
                <Button variant="outlined" color="error" size="small" startIcon={<Iconify icon="mdi:delete-outline" />}
                  onClick={handleRemoveImage}>
                  Quitar imagen
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3, border: `2px dashed ${theme.border}`, borderRadius: 2 }}>
                <Iconify icon="mdi:cloud-upload-outline" width={40} sx={{ color: theme.textSecondary, opacity: 0.5, mb: 1 }} />
                <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
                  Sube una imagen para que aparezca como fondo de tu formulario
                </Typography>
                <Button variant="contained" component="label" startIcon={<Iconify icon="mdi:upload" />}
                  disabled={uploading}
                  sx={{ bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover } }}>
                  {uploading ? 'Subiendo...' : 'Subir imagen'}
                  <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'imagen'); }} />
                </Button>
              </Box>
            )}
          </Card>

          {/* Musica de fondo */}
          <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Iconify icon="mdi:music-note" width={22} sx={{ color: theme.primary, mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary }}>
                Musica de fondo
              </Typography>
              <HelpTip text="Agrega musica ambiental que sonara cuando alguien resuelva tu formulario. El visitante puede pausarla en cualquier momento." />
            </Box>

            {pMusicaUrl ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 2, mb: 2 }}>
                  <Iconify icon={pMusicaTipo === 'youtube' ? 'mdi:youtube' : 'mdi:file-music'} width={32}
                    sx={{ color: pMusicaTipo === 'youtube' ? '#FF0000' : theme.primary }} />
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary }}>
                      {pMusicaTipo === 'youtube' ? 'Video de YouTube' : pMusicaTipo === 'url' ? 'URL de audio' : 'Archivo MP3'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.textSecondary, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pMusicaUrl}
                    </Typography>
                  </Box>
                  {pMusicaTipo === 'archivo' && (
                    <audio controls src={pMusicaUrl} style={{ height: 32, maxWidth: 200 }}>
                      <track kind="captions" />
                    </audio>
                  )}
                </Box>
                <Button variant="outlined" color="error" size="small" startIcon={<Iconify icon="mdi:delete-outline" />}
                  onClick={handleRemoveMusic}>
                  Quitar musica
                </Button>
              </Box>
            ) : (
              <Box>
                <RadioGroup row value={musicSourceType} onChange={(e) => setMusicSourceType(e.target.value as any)}
                  sx={{ mb: 2, gap: 1 }}>
                  <FormControlLabel value="archivo" control={<Radio size="small" />}
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Iconify icon="mdi:file-music" width={18} /> Subir MP3</Box>} />
                  <FormControlLabel value="youtube" control={<Radio size="small" />}
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Iconify icon="mdi:youtube" width={18} /> Link de YouTube</Box>} />
                  <FormControlLabel value="url" control={<Radio size="small" />}
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Iconify icon="mdi:link-variant" width={18} /> URL de audio</Box>} />
                </RadioGroup>

                {musicSourceType === 'archivo' ? (
                  <Box sx={{ textAlign: 'center', py: 3, border: `2px dashed ${theme.border}`, borderRadius: 2 }}>
                    <Iconify icon="mdi:music-note-plus" width={40} sx={{ color: theme.textSecondary, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
                      Formatos: MP3, OGG, WAV. Max 15 MB.
                    </Typography>
                    <Button variant="contained" component="label" startIcon={<Iconify icon="mdi:upload" />}
                      disabled={uploading}
                      sx={{ bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover } }}>
                      {uploading ? 'Subiendo...' : 'Subir audio'}
                      <input type="file" hidden accept="audio/mpeg,audio/mp3,audio/ogg,audio/wav,.mp3,.ogg,.wav"
                        onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'audio'); }} />
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth size="small"
                      placeholder={musicSourceType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://ejemplo.com/audio.mp3'}
                      value={musicLinkInput}
                      onChange={(e) => setMusicLinkInput(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleMusicLink} disabled={!musicLinkInput.trim()}
                      sx={{ bgcolor: theme.primary, '&:hover': { bgcolor: theme.primaryHover }, whiteSpace: 'nowrap' }}>
                      Guardar
                    </Button>
                  </Box>
                )}

                {musicSourceType === 'youtube' && (
                  <Typography variant="caption" sx={{ color: theme.textSecondary, mt: 1, display: 'block' }}>
                    <Iconify icon="mdi:information-outline" width={14} sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Pega el enlace completo del video de YouTube. Solo se reproducira el audio.
                  </Typography>
                )}
              </Box>
            )}
          </Card>
        </Box>
      )}

      {/* ====== TAB 2: Vista Previa ====== */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="outlined" size="small" startIcon={<Iconify icon="mdi:open-in-new" />}
              onClick={() => {
                const slugPart = form.slug ? `/${form.slug}` : '';
                window.open(`${window.location.origin}${CONFIG.basePath}/form/${form.compartirToken}${slugPart}`, '_blank');
              }}
              sx={{ borderColor: theme.primary, color: theme.primary }}>
              Abrir en nueva pestana
            </Button>
          </Box>

          <Card sx={{ overflow: 'hidden', borderRadius: 3, boxShadow: theme.shadow }}>
            <FormularioPreview
              titulo={titulo}
              descripcion={descripcion}
              tema={pTema}
              colorPrimario={pColorPrimario}
              colorFondo={pColorFondo}
              imagenFondo={pImagenFondo}
              opacidadFondo={pOpacidad}
              musicaUrl={pMusicaUrl}
              musicaTipo={pMusicaTipo}
              preguntas={(form.preguntas || []).map(p => ({
                idPregunta: p.idPregunta,
                textoPregunta: p.textoPregunta,
                opciones: p.opciones.map(o => ({ idOpcion: o.idOpcion, textoOpcion: o.textoOpcion })),
              }))}
            />
          </Card>
        </Box>
      )}

      {/* ====== TAB 3: Configuracion ====== */}
      {activeTab === 3 && (
        <Card sx={{ p: { xs: 2, sm: 3 }, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:cog-outline" width={24} />
            Configuracion del formulario
          </Typography>

          <Box sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${theme.border}`, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 0.5 }}>
                  Crear usuario participante
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Cuando alguien responda el formulario, se creara automaticamente un usuario con rol PARTICIPANTE vinculado a tu cuenta.
                  Solo tu podras ver estos usuarios.
                </Typography>
              </Box>
              <Switch
                checked={crearParticipante}
                disabled={savingConfig}
                onChange={async (e) => {
                  const val = e.target.checked;
                  setCrearParticipante(val);
                  setSavingConfig(true);
                  try {
                    await apiFetch(API, {
                      method: 'POST',
                      headers: headers(),
                      body: JSON.stringify({ accion: 'toggle_participante', idCuestionario: form.idCuestionario, crearParticipante: val }),
                    });
                  } catch { setCrearParticipante(!val); }
                  setSavingConfig(false);
                }}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4CAF50' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#4CAF50' } }}
              />
            </Box>
          </Box>

          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Los datos demograficos (sexo, edad, ubicacion) siempre se recopilan en el formulario publico.
            Solo tu como cliente puedes ver esta informacion en las estadisticas.
          </Alert>
        </Card>
      )}
    </Box>
  );
}
