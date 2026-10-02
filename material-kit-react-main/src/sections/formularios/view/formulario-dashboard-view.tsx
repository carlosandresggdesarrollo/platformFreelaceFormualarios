import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme as useMuiTheme } from '@mui/material/styles';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { apiFetch } from 'src/utils/api';
import { getAccessToken } from 'src/utils/auth';
import { generateGeneralPDF, generateGeneralExcel } from 'src/utils/report-generators';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

const API = `${CONFIG.apiBase}/Modules/ModuleFormularios/api/administrador.controller.formularios.php`;

interface DashboardData {
  totalFormularios: number;
  totalVisitas: number;
  visitantesUnicos: number;
  totalRespuestas: number;
  visitasPorDia: { fecha: string; visitas: number }[];
  formularios: { idCuestionario: number; titulo: string; estado: string; visitas: number; visitasUnicas: number; respuestas: number; compartirToken: string }[];
  navegadores: { navegador: string; total: number }[];
  dispositivos: { dispositivo: string; total: number }[];
}

export function FormularioDashboardView() {
  const theme = useDashboardTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const d = await apiFetch<any>(`${API}?vista=dashboard`, { headers });
        if (d.success) setData(d.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: theme.primary }} />
      </Box>
    );
  }

  if (!data) return null;

  const summaryStats = [
    { label: 'Formularios', value: data.totalFormularios, icon: 'mdi:clipboard-list-outline', color: theme.primary },
    { label: 'Visitas totales', value: data.totalVisitas, icon: 'mdi:eye-outline', color: '#2196F3' },
    { label: 'Visitantes unicos', value: data.visitantesUnicos, icon: 'mdi:account-multiple-outline', color: '#FF9800' },
    { label: 'Respuestas', value: data.totalRespuestas, icon: 'mdi:message-reply-text-outline', color: '#4CAF50' },
  ];

  const handleDownloadPDF = () => {
    generateGeneralPDF(
      { totalFormularios: data.totalFormularios, totalVisitas: data.totalVisitas, visitantesUnicos: data.visitantesUnicos, totalRespuestas: data.totalRespuestas },
      data.formularios
    );
    setMenuAnchor(null);
  };

  const handleDownloadExcel = () => {
    generateGeneralExcel(
      { totalFormularios: data.totalFormularios, totalVisitas: data.totalVisitas, visitantesUnicos: data.visitantesUnicos, totalRespuestas: data.totalRespuestas },
      data.formularios
    );
    setMenuAnchor(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" size="small"
          startIcon={<Iconify icon="mdi:download" />}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ borderColor: theme.primary, color: theme.primary }}>
          Descargar reporte
        </Button>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={handleDownloadPDF}>
            <Iconify icon="mdi:file-pdf-box" width={20} sx={{ mr: 1, color: '#F44336' }} /> PDF
          </MenuItem>
          <MenuItem onClick={handleDownloadExcel}>
            <Iconify icon="mdi:file-excel" width={20} sx={{ mr: 1, color: '#4CAF50' }} /> Excel
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {summaryStats.map((s) => (
          <Card key={s.label} sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', background: theme.bgCard, boxShadow: theme.shadow }}>
            <Iconify icon={s.icon} width={32} sx={{ color: s.color, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.textPrimary }}>{s.value}</Typography>
            <Typography variant="caption" sx={{ color: theme.textSecondary }}>{s.label}</Typography>
          </Card>
        ))}
      </Box>

      {data.formularios.length > 0 && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden', background: theme.bgCard, boxShadow: theme.shadow }}>
          <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.border}` }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.textPrimary }}>
              Mis formularios
            </Typography>
          </Box>

          {isMobile ? (
            <Box sx={{ p: 1.5 }}>
              {data.formularios.map((f) => (
                <Box key={f.idCuestionario} sx={{ p: 1.5, mb: 1, borderRadius: 1.5, border: `1px solid ${theme.border}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textPrimary, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.titulo}
                    </Typography>
                    <Chip label={f.estado} size="small" sx={{
                      ml: 1, fontSize: 11, height: 20, fontWeight: 600, flexShrink: 0,
                      bgcolor: f.estado === 'publicado' ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                      color: f.estado === 'publicado' ? '#4CAF50' : '#FF9800',
                    }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#2196F3' }}>{f.visitas}</Typography>
                      <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: 10 }}>Visitas</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#FF9800' }}>{f.visitasUnicas}</Typography>
                      <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: 10 }}>Unicas</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#4CAF50' }}>{f.respuestas}</Typography>
                      <Typography variant="caption" sx={{ color: theme.textSecondary, fontSize: 10 }}>Respuestas</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: theme.bgTableHeader }}>
                    {['Titulo', 'Estado', 'Visitas', 'Unicas', 'Respuestas'].map((h) => (
                      <Box component="th" key={h} sx={{ p: 1.5, textAlign: 'left', fontWeight: 600, color: theme.textPrimary, fontSize: 14 }}>{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {data.formularios.map((f) => (
                    <Box component="tr" key={f.idCuestionario} sx={{ '&:hover': { bgcolor: theme.bgTableRowHover } }}>
                      <Box component="td" sx={{ p: 1.5, color: theme.textPrimary, fontWeight: 600 }}>{f.titulo}</Box>
                      <Box component="td" sx={{ p: 1.5 }}>
                        <Box component="span" sx={{
                          px: 1, py: 0.3, borderRadius: 1, fontSize: 12, fontWeight: 600,
                          bgcolor: f.estado === 'publicado' ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                          color: f.estado === 'publicado' ? '#4CAF50' : '#FF9800',
                        }}>{f.estado}</Box>
                      </Box>
                      <Box component="td" sx={{ p: 1.5, color: theme.textSecondary }}>{f.visitas}</Box>
                      <Box component="td" sx={{ p: 1.5, color: theme.textSecondary }}>{f.visitasUnicas}</Box>
                      <Box component="td" sx={{ p: 1.5, color: theme.textSecondary }}>{f.respuestas}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
