import { useState, useEffect, useRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken, getUsuario } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

const API = `${CONFIG.apiBase}/Modules/ModuleClienteDashboard/api/administrador.controller.cliente.php`;

const EMOJIS = ['🧠','💚','🌿','🔥','💧','🌍','⭐','🎯','🧬','💎','🌸','🦋','🍀','🌙','☀️','🎪'];

interface GameCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

type GameState = 'menu' | 'playing' | 'finished';

export function ClienteJuegoView() {
  const theme = useDashboardTheme();
  const usuario = getUsuario();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [timer, setTimer] = useState(0);
  const [pairCount, setPairCount] = useState(8);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [ranking, setRanking] = useState<any[]>([]);
  const [misPuntajes, setMisPuntajes] = useState<any[]>([]);
  const [miPosicion, setMiPosicion] = useState(0);
  const [miMejor, setMiMejor] = useState(0);
  const [loadingRanking, setLoadingRanking] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);

  const loadRanking = useCallback(async () => {
    try {
      const token = getAccessToken();
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await apiFetch(`${API}?vista=ranking`, { headers });
      if (res.success) {
        const data = res as any;
        setRanking(data.ranking || []);
        setMisPuntajes(data.misPuntajes || []);
        setMiPosicion(data.miPosicion || 0);
        setMiMejor(data.miMejorPuntaje || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRanking(false);
    }
  }, []);

  useEffect(() => { loadRanking(); }, [loadRanking]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const startGame = (pairs: number) => {
    setPairCount(pairs);
    const selectedEmojis = EMOJIS.slice(0, pairs);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    setCards(deck);
    setFlippedIds([]);
    setMoves(0);
    setMatchedPairs(0);
    setTimer(0);
    setScore(0);
    setSaved(false);
    setGameState('playing');
  };

  const handleFlip = (id: number) => {
    if (lockRef.current) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    if (flippedIds.length >= 2) return;

    const newCards = [...cards];
    newCards[id] = { ...newCards[id], flipped: true };
    setCards(newCards);

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      lockRef.current = true;

      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) =>
            i === first || i === second ? { ...c, matched: true } : c
          ));
          setMatchedPairs((mp) => {
            const newMp = mp + 1;
            if (newMp === pairCount) {
              if (timerRef.current) clearInterval(timerRef.current);
              setTimer((t) => {
                const finalMoves = moves + 1;
                const timeBonus = Math.max(0, 300 - t * 2);
                const moveBonus = Math.max(0, 200 - (finalMoves - pairCount) * 10);
                const baseScore = pairCount * 100;
                const s = baseScore + timeBonus + moveBonus;
                setScore(s);
                return t;
              });
              setGameState('finished');
            }
            return newMp;
          });
          setFlippedIds([]);
          lockRef.current = false;
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) =>
            i === first || i === second ? { ...c, flipped: false } : c
          ));
          setFlippedIds([]);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  const saveScore = async () => {
    setSaving(true);
    try {
      const token = getAccessToken();
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      await apiFetch(API, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          accion: 'guardar_puntaje',
          puntaje: score,
          movimientos: moves,
          tiempo: timer,
          nivel: pairCount <= 6 ? 'facil' : pairCount <= 10 ? 'normal' : 'dificil',
        }),
      });
      setSaved(true);
      loadRanking();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ================================================================
  //  RENDER
  // ================================================================

  return (
    <Box>
      <ModuloHeader titulo="Juego de Memoria" subtitulo="Encuentra todos los pares y compite en el ranking" />

      {/* MENU */}
      {gameState === 'menu' && (
        <Card sx={{ p: 4, mt: 3, borderRadius: 3, background: theme.bgCard, boxShadow: theme.shadow, textAlign: 'center' }}>
          <Iconify icon="mdi:cards-outline" width={64} sx={{ color: theme.primary, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 1 }}>
            Juego de Memoria
          </Typography>
          <Typography sx={{ color: theme.textSecondary, mb: 3 }}>
            Encuentra todos los pares de cartas. Mientras menos movimientos y menos tiempo, mas puntos ganas.
          </Typography>

          <Typography variant="subtitle2" sx={{ color: theme.textPrimary, mb: 2, fontWeight: 600 }}>
            Selecciona dificultad:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Facil (6 pares)', pairs: 6, color: '#4CAF50' },
              { label: 'Normal (8 pares)', pairs: 8, color: '#2196F3' },
              { label: 'Dificil (12 pares)', pairs: 12, color: '#F44336' },
            ].map((d) => (
              <Button key={d.pairs} variant="contained" onClick={() => startGame(d.pairs)}
                sx={{
                  bgcolor: d.color, fontWeight: 700, px: 4, py: 1.5, borderRadius: 2,
                  fontSize: '1rem', '&:hover': { filter: 'brightness(0.9)', bgcolor: d.color },
                }}>
                {d.label}
              </Button>
            ))}
          </Box>
        </Card>
      )}

      {/* PLAYING */}
      {gameState === 'playing' && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Tiempo', value: formatTime(timer), icon: 'mdi:timer-outline' },
              { label: 'Movimientos', value: moves, icon: 'mdi:gesture-tap' },
              { label: 'Pares', value: `${matchedPairs}/${pairCount}`, icon: 'mdi:cards' },
            ].map((s) => (
              <Card key={s.label} sx={{
                px: 3, py: 1.5, borderRadius: 2, background: theme.bgCard, boxShadow: theme.shadow,
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <Iconify icon={s.icon} width={24} sx={{ color: theme.primary }} />
                <Box>
                  <Typography variant="caption" sx={{ color: theme.textSecondary }}>{s.label}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>{s.value}</Typography>
                </Box>
              </Card>
            ))}
          </Box>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(4, 1fr)',
              md: pairCount <= 8 ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)',
            },
            gap: 1.5,
            maxWidth: 600,
            mx: 'auto',
          }}>
            {cards.map((card) => (
              <Box
                key={card.id}
                onClick={() => handleFlip(card.id)}
                sx={{
                  aspectRatio: '1',
                  borderRadius: 2,
                  cursor: card.matched ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  transform: card.flipped || card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  bgcolor: card.matched
                    ? 'rgba(76,175,80,0.15)'
                    : card.flipped
                      ? theme.bgCard
                      : theme.primary,
                  border: `2px solid ${card.matched ? '#4CAF50' : card.flipped ? theme.border : 'transparent'}`,
                  boxShadow: card.flipped || card.matched ? theme.shadow : '0 4px 12px rgba(0,0,0,0.2)',
                  opacity: card.matched ? 0.6 : 1,
                  userSelect: 'none',
                  '&:hover': {
                    transform: card.matched ? 'none' : card.flipped ? 'none' : 'rotateY(180deg) scale(1.05)',
                    boxShadow: card.matched ? 'none' : '0 6px 16px rgba(0,0,0,0.25)',
                  },
                }}
              >
                {card.flipped || card.matched ? card.emoji : '?'}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* FINISHED */}
      {gameState === 'finished' && (
        <Card sx={{ p: 4, mt: 3, borderRadius: 3, background: theme.bgCard, boxShadow: theme.shadow, textAlign: 'center' }}>
          <Iconify icon="mdi:trophy" width={72} sx={{ color: '#FFD700', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textPrimary, mb: 1 }}>
            Completado!
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, color: theme.primary, mb: 2 }}>
            {score} pts
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>{moves}</Typography>
              <Typography variant="caption" sx={{ color: theme.textSecondary }}>Movimientos</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>{formatTime(timer)}</Typography>
              <Typography variant="caption" sx={{ color: theme.textSecondary }}>Tiempo</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.textPrimary }}>
                {pairCount <= 6 ? 'Facil' : pairCount <= 10 ? 'Normal' : 'Dificil'}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.textSecondary }}>Nivel</Typography>
            </Box>
          </Box>

          {score > miMejor && (
            <Chip label="Nuevo record personal!" sx={{ mb: 2, bgcolor: '#FFD700', color: '#000', fontWeight: 700 }} />
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!saved ? (
              <Button variant="contained" onClick={saveScore} disabled={saving}
                startIcon={saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <Iconify icon="mdi:content-save" />}
                sx={{ bgcolor: '#4CAF50', fontWeight: 700, px: 4, borderRadius: 2, '&:hover': { bgcolor: '#388E3C' } }}>
                Guardar puntaje
              </Button>
            ) : (
              <Chip label="Puntaje guardado" color="success" icon={<Iconify icon="mdi:check" width={18} />} />
            )}
            <Button variant="contained" onClick={() => startGame(pairCount)}
              startIcon={<Iconify icon="mdi:restart" />}
              sx={{ bgcolor: theme.primary, fontWeight: 700, px: 4, borderRadius: 2, '&:hover': { bgcolor: theme.primaryHover } }}>
              Jugar de nuevo
            </Button>
            <Button variant="outlined" onClick={() => setGameState('menu')}
              sx={{ borderColor: theme.border, color: theme.textSecondary, borderRadius: 2 }}>
              Menu
            </Button>
          </Box>
        </Card>
      )}

      {/* RANKING */}
      <Card sx={{ mt: 3, borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow }}>
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Iconify icon="mdi:trophy-outline" width={28} sx={{ color: '#FFD700' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
            Ranking Global
          </Typography>
          {miPosicion > 0 && (
            <Chip label={`Tu posicion: #${miPosicion}`} size="small"
              sx={{ bgcolor: theme.primaryLight, color: theme.primary, fontWeight: 700 }} />
          )}
        </Box>

        {loadingRanking ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: theme.primary }} />
          </Box>
        ) : ranking.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: theme.textSecondary }}>Aun no hay puntajes. Se el primero!</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.bgTableHeader }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary, width: 60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Jugador</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Puntaje</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Movs</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Tiempo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Nivel</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.textPrimary }}>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ranking.map((r: any, i: number) => {
                  const isMe = String(r.idUsuario) === usuario?.id;
                  return (
                    <TableRow key={r.idPuntaje} sx={{
                      bgcolor: isMe ? `${theme.primary}15` : 'transparent',
                      '&:hover': { bgcolor: theme.bgTableRowHover },
                    }}>
                      <TableCell>
                        <Typography variant="body2" sx={{
                          fontWeight: 800,
                          color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : theme.textMuted,
                          fontSize: i < 3 ? '1.1rem' : '0.875rem',
                        }}>
                          {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: isMe ? 700 : 500, color: theme.textPrimary }}>
                          {r.nombre} {r.apellidos} {isMe ? '(tu)' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.primary }}>
                          {r.puntaje}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: theme.textSecondary }}>{r.movimientos}</TableCell>
                      <TableCell sx={{ color: theme.textSecondary }}>{formatTime(Number(r.tiempoSegundos))}</TableCell>
                      <TableCell>
                        <Chip label={r.nivel || 'normal'} size="small" sx={{
                          fontWeight: 600,
                          bgcolor: r.nivel === 'dificil' ? 'rgba(244,67,54,0.1)' : r.nivel === 'facil' ? 'rgba(76,175,80,0.1)' : 'rgba(33,150,243,0.1)',
                          color: r.nivel === 'dificil' ? '#F44336' : r.nivel === 'facil' ? '#4CAF50' : '#2196F3',
                        }} />
                      </TableCell>
                      <TableCell sx={{ color: theme.textSecondary, whiteSpace: 'nowrap' }}>
                        {new Date(r.fechaJuego).toLocaleDateString('es-MX')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </Box>
  );
}
