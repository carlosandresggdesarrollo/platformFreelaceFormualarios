import { useState } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const API_IA = `${CONFIG.apiBase}/Modules/ModuleCuestionarios/api/administrador.controller.cuestionarios.ia.php`;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreado: (idCuestionario: number) => void;
}

export function DialogGenerarIA({ open, onClose, onCreado }: Props) {
  const theme = useDashboardTheme();
  const [tema, setTema] = useState('');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [numOpciones, setNumOpciones] = useState(4);
  const [instrucciones, setInstrucciones] = useState('');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const generar = async () => {
    if (!tema.trim()) return;
    setGenerando(true);
    setError('');
    try {
      const d = await apiFetch<any>(API_IA, {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema, numPreguntas, numOpciones, instrucciones }),
      });
      if (d.success && d.idCuestionario) {
        setTema('');
        setInstrucciones('');
        setNumPreguntas(10);
        setNumOpciones(4);
        onCreado(d.idCuestionario);
      } else {
        setError(d.error || 'Error al generar cuestionario');
      }
    } catch {
      setError('Error de conexion con el servidor');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Dialog open={open} onClose={generando ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="mdi:robot-outline" width={24} sx={{ color: theme.accent }} />
        Generar Cuestionario con IA
      </DialogTitle>
      <DialogContent>
        {generando ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Iconify icon="mdi:robot-happy-outline" width={48} sx={{ color: theme.accent, mb: 2, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <Typography variant="h6" sx={{ mb: 1, color: theme.textPrimary }}>
              Generando cuestionario...
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textMuted, mb: 3 }}>
              La IA esta creando {numPreguntas} preguntas con {numOpciones} opciones cada una
            </Typography>
            <LinearProgress sx={{ borderRadius: 1 }} />
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
          </Box>
        ) : (
          <>
            <TextField
              autoFocus fullWidth label="Tema del cuestionario" placeholder="Ej: Encuesta de satisfaccion"
              value={tema} onChange={(e) => setTema(e.target.value)}
              sx={{ mt: 1, mb: 3 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, color: theme.textSecondary }}>
              Numero de preguntas: {numPreguntas}
            </Typography>
            <Slider
              value={numPreguntas} onChange={(_, v) => setNumPreguntas(v as number)}
              min={5} max={30} step={1} marks={[{ value: 5, label: '5' }, { value: 10, label: '10' }, { value: 20, label: '20' }, { value: 30, label: '30' }]}
              sx={{ mb: 3, color: theme.primary }}
            />

            <Typography variant="subtitle2" sx={{ mb: 1, color: theme.textSecondary }}>
              Opciones por pregunta: {numOpciones}
            </Typography>
            <Slider
              value={numOpciones} onChange={(_, v) => setNumOpciones(v as number)}
              min={2} max={5} step={1} marks={[{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' }]}
              sx={{ mb: 3, color: theme.primary }}
            />

            <TextField
              fullWidth label="Instrucciones adicionales (opcional)" multiline rows={2}
              placeholder="Ej: Enfocate en preguntas de nivel intermedio sobre el tema principal"
              value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)}
            />

            {error && (
              <Typography variant="body2" sx={{ color: theme.error, mt: 2 }}>{error}</Typography>
            )}
          </>
        )}
      </DialogContent>
      {!generando && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained" onClick={generar} disabled={!tema.trim()}
            startIcon={<Iconify icon="mdi:creation" width={18} />}
            sx={{ bgcolor: theme.accent, '&:hover': { bgcolor: theme.accentHover } }}
          >
            Generar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
