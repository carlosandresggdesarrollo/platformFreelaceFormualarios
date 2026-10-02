import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { getAccessToken } from 'src/utils/auth';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

// ----------------------------------------------------------------------

const API = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.audit.php`;

interface LogEntry {
  idLog: number;
  idUsuario: number;
  nombreUsuario: string;
  accion: string;
  entidad: string;
  idEntidad: number | null;
  detalle: string | null;
  fecha: string;
}

const COLORES_ACCION: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  CREAR: 'success',
  ACTUALIZAR: 'info',
  ELIMINAR: 'error',
  TOGGLE: 'warning',
  REORDENAR: 'default',
};

function colorAccion(accion: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
  const key = Object.keys(COLORES_ACCION).find((k) => accion.startsWith(k));
  return key ? COLORES_ACCION[key] : 'default';
}

export function HomeAuditView() {
  const theme = useDashboardTheme();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(0);
  const LIMIT = 25;

  const auth = { Authorization: `Bearer ${getAccessToken()}` };

  const cargar = useCallback(async (offset: number) => {
    try {
      const r = await fetch(`${API}?limit=${LIMIT}&offset=${offset}`, { headers: auth });
      const d = await r.json();
      if (d.success) {
        setLogs(d.logs);
        setTotal(d.total);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { cargar(pagina * LIMIT); }, [cargar, pagina]);

  const totalPaginas = Math.ceil(total / LIMIT);

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
      <ModuloHeader titulo="Auditoria del Home" subtitulo={`${total} registros en total`} />

      <Card sx={{ mt: 2, bgcolor: theme.bgCard, border: `1px solid ${theme.border}` }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: theme.textSecondary, fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ color: theme.textSecondary, fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ color: theme.textSecondary, fontWeight: 600 }}>Accion</TableCell>
                <TableCell sx={{ color: theme.textSecondary, fontWeight: 600 }}>Entidad</TableCell>
                <TableCell sx={{ color: theme.textSecondary, fontWeight: 600 }}>Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: theme.textSecondary }}>
                    No hay registros de auditoria.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.idLog} hover>
                  <TableCell sx={{ color: theme.textPrimary, whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(log.fecha).toLocaleString('es-MX')}
                  </TableCell>
                  <TableCell sx={{ color: theme.textPrimary }}>{log.nombreUsuario}</TableCell>
                  <TableCell>
                    <Chip label={log.accion} size="small" color={colorAccion(log.accion)} variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ color: theme.textSecondary }}>
                    {log.entidad}
                    {log.idEntidad ? ` #${log.idEntidad}` : ''}
                  </TableCell>
                  <TableCell sx={{ color: theme.textSecondary, maxWidth: 300, fontSize: '0.75rem' }}>
                    <Typography variant="caption" noWrap title={log.detalle || ''}>
                      {log.detalle || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPaginas > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, py: 2 }}>
            <Button size="small" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}
              startIcon={<Iconify icon="mdi:chevron-left" />}>
              Anterior
            </Button>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              {pagina + 1} / {totalPaginas}
            </Typography>
            <Button size="small" disabled={pagina >= totalPaginas - 1} onClick={() => setPagina((p) => p + 1)}
              endIcon={<Iconify icon="mdi:chevron-right" />}>
              Siguiente
            </Button>
          </Box>
        )}
      </Card>
    </Container>
  );
}
