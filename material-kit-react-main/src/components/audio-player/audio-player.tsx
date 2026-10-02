import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface AudioPlayerProps {
  url: string;
  tipo: 'archivo' | 'youtube' | 'url';
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function AudioPlayer({ url, tipo }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytRef = useRef<HTMLIFrameElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [showVolume, setShowVolume] = useState(false);
  const [userActivated, setUserActivated] = useState(false);

  const isYouTube = tipo === 'youtube';
  const videoId = isYouTube ? extractYouTubeId(url) : null;

  const createAudio = useCallback(() => {
    if (audioRef.current) return;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume / 100;
    audio.addEventListener('ended', () => { audio.currentTime = 0; audio.play().catch(() => {}); });
    audioRef.current = audio;
  }, [url, volume]);

  useEffect(() => () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
    }, [url]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
    if (isYouTube && ytRef.current?.contentWindow) {
      ytRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [volume] }), '*'
      );
    }
  }, [volume, isYouTube]);

  const handleActivate = () => {
    setUserActivated(true);
    if (isYouTube && videoId) {
      setPlaying(true);
    } else {
      createAudio();
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const toggle = () => {
    if (!userActivated) { handleActivate(); return; }

    if (isYouTube && ytRef.current?.contentWindow) {
      const func = playing ? 'pauseVideo' : 'playVideo';
      ytRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
      setPlaying(!playing);
      return;
    }

    if (!audioRef.current) createAudio();
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  if (!url) return null;

  return (
    <>
      {isYouTube && videoId && userActivated && (
        <iframe
          ref={ytRef}
          title="bg-music"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&enablejsapi=1&origin=${window.location.origin}`}
          allow="autoplay"
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        />
      )}

      <Box
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        sx={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1200,
          display: 'flex', alignItems: 'center', gap: 1,
        }}
      >
        {showVolume && userActivated && (
          <Box sx={{
            bgcolor: 'rgba(0,0,0,0.8)', borderRadius: 2, px: 1.5, py: 0.5,
            display: 'flex', alignItems: 'center', gap: 1,
            animation: 'fadeInRight 0.2s ease-out',
          }}>
            <Iconify icon="mdi:volume-low" width={16} sx={{ color: 'rgba(255,255,255,0.6)' }} />
            <Slider
              value={volume} onChange={(_, v) => setVolume(v as number)}
              min={0} max={100} size="small"
              sx={{ width: 80, color: '#fff', '& .MuiSlider-thumb': { width: 12, height: 12 } }}
            />
          </Box>
        )}

        <Tooltip title={userActivated ? (playing ? 'Pausar musica' : 'Reproducir musica') : 'Activar musica'} placement="left">
          <Fab
            size="small"
            onClick={toggle}
            sx={{
              bgcolor: playing ? 'var(--landing-primary, #6C63FF)' : 'rgba(0,0,0,0.7)',
              color: '#fff',
              '&:hover': { bgcolor: playing ? 'var(--landing-primary-hover, #5A52E0)' : 'rgba(0,0,0,0.85)' },
              animation: playing ? 'pulse-music 2s ease-in-out infinite' : 'none',
              boxShadow: playing ? '0 0 20px var(--landing-primary, rgba(108,99,255,0.4))' : 'none',
            }}
          >
            <Iconify icon={playing ? 'mdi:music-note' : 'mdi:music-note-off'} width={22} />
          </Fab>
        </Tooltip>
      </Box>

      <style>{`
        @keyframes pulse-music { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        @keyframes fadeInRight { 0%{opacity:0;transform:translateX(10px)} 100%{opacity:1;transform:translateX(0)} }
      `}</style>
    </>
  );
}
