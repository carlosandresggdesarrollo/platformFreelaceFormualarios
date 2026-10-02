import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

interface MusicPlayerProps {
  apiUrl: string;
  autoPlay?: boolean;
}

export function MusicPlayer({ apiUrl, autoPlay = true }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(25);
  const [config, setConfig] = useState<{ activo: boolean; url: string; volumen: number; titulo: string } | null>(null);
  const autoPlayAttempted = useRef(false);

  useEffect(() => {
    fetch(`${apiUrl}?accion=musica`).then((r) => r.json()).then((d) => {
      if (d.success && d.musica) setConfig(d.musica);
    }).catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    if (!config?.activo || !config.url) return undefined;
    setVolume(config.volumen);
    const audio = new Audio(config.url);
    audio.loop = true;
    audio.volume = config.volumen / 100;
    audioRef.current = audio;

    if (autoPlay && !autoPlayAttempted.current) {
      autoPlayAttempted.current = true;
      audio.play().then(() => setPlaying(true)).catch(() => {
        const startOnInteraction = () => {
          audio.play().then(() => setPlaying(true)).catch(() => {});
          document.removeEventListener('click', startOnInteraction);
          document.removeEventListener('keydown', startOnInteraction);
        };
        document.addEventListener('click', startOnInteraction, { once: true });
        document.addEventListener('keydown', startOnInteraction, { once: true });
      });
    }

    return () => { audio.pause(); audio.src = ''; };
  }, [config, autoPlay]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  if (!config?.activo || !config.url) return null;

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play().catch(() => {}); }
    setPlaying(!playing);
  };

  return (
    <Box sx={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 1200,
      display: 'flex', alignItems: 'center', gap: 1,
      bgcolor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
      borderRadius: 3, px: 2, py: 1, border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <IconButton onClick={toggle} size="small" sx={{ color: '#fff' }}>
        <Iconify icon={playing ? 'mdi:pause-circle' : 'mdi:play-circle'} width={28} />
      </IconButton>
      {config.titulo && (
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {config.titulo}
        </Typography>
      )}
      <Slider
        value={volume} onChange={(_, v) => setVolume(v as number)}
        min={0} max={100} size="small"
        sx={{ width: 70, color: '#fff', '& .MuiSlider-thumb': { width: 12, height: 12 } }}
      />
      <Iconify icon="mdi:volume-high" width={16} sx={{ color: 'rgba(255,255,255,0.5)' }} />
    </Box>
  );
}
