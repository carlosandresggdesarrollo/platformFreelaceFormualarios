import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
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

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.php`;

interface Opcion { idOpcion?: number; texto: string; esCorrecta: boolean }
interface Pregunta { idPregunta: number; textoPregunta: string; orden: number; tipo?: string; opciones: { idOpcion: number; textoOpcion: string; esCorrecta: string; orden: number }[] }
interface Formulario { idCuestionario: number; titulo: string; descripcion: string; estado: string; compartirToken: string; slug: string; preguntas: Pregunta[] }

export function FormularioEditorView() {
  const { id } = useParams();
  const router = useRouter();
  const theme = useDashboardTheme();

  const [form, setForm] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [publicado, setPublicado] = useState(false);

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
        setForm(d.formulario);
        setTitulo(d.formulario.titulo);
        setDescripcion(d.formulario.descripcion || '');
        setPublicado(d.formulario.estado === 'publicado');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchForm(); }, [fetchForm]);

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
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
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
    } catch (e) {
      console.error(e);
    } finally {
      setAddingPregunta(false);
    }
  };

  const handleDeletePregunta = async (idPregunta: number) => {
    try {
      await apiFetch<any>(API, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ accion: 'eliminar_pregunta', idPregunta }),
      });
      fetchForm();
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = () => {
    if (!form) return;
    const slugPart = form.slug ? `/${form.slug}` : '';
    const url = `${window.location.origin}${CONFIG.basePath}/form/${form.compartirToken}${slugPart}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

      <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3, flexWrap: 'wrap' }}>
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

      {/* Info del formulario */}
      <Card sx={{ p: 3, mb: 3, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2 }}>
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

      {/* Preguntas existentes */}
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

      {/* Agregar pregunta */}
      <Card sx={{ p: 3, mt: 2, background: theme.bgCard, boxShadow: theme.shadow, borderRadius: 2, border: `2px dashed ${theme.border}` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
          Agregar pregunta
        </Typography>
        <TextField fullWidth label="Texto de la pregunta" value={newPregunta}
          onChange={(e) => setNewPregunta(e.target.value)} sx={{ mb: 2 }} />

        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textSecondary, mb: 1 }}>
          Opciones de respuesta
        </Typography>
        {newOpciones.map((o, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TextField fullWidth size="small" placeholder={`Opcion ${i + 1}`} value={o.texto}
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
    </Box>
  );
}
