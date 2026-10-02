import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { useDashboardTheme } from 'src/hooks/use-dashboard-theme';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { ModuloHeader } from 'src/components/modulo-header/modulo-header';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// ----------------------------------------------------------------------

interface PlanVendido {
  nombrePlan: string;
  cantidadVendida: number;
  totalVentas: number;
}

interface VentaMes {
  mes: number;
  nombreMes: string;
  cantidadVentas: number;
  totalVentas: number;
}

interface TopCliente {
  idCliente: number;
  nombre: string;
  email: string;
  plan: string;
  mensajes: number;
  instancias: number;
  totalCompras: number;
}

interface DashboardStats {
  clientesActivos: number;
  nuevosClientesAnio: number;
  mensajesTotales: number;
  instanciasActivas: number;
  ingresosAnio: number;
  facturasPendientes: number;
  montoPendiente: number;
  membresiasPorPlan: Array<{ label: string; value: number }>;
  topClientes: TopCliente[];
  mensajesPorDia: Array<{ fecha: string; mensajes: number }>;
  totalPlanes: number;
  planesMasVendidosAnio: PlanVendido[];
  ventasPorMes: VentaMes[];
  totalVentasRealizadas: number;
  anioSeleccionado: number;
  aniosDisponibles: number[];
}

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const themeColors = useDashboardTheme();
  const [loading, setLoading] = useState(true);
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(new Date().getFullYear());
  const [stats, setStats] = useState<DashboardStats>({
    clientesActivos: 0,
    nuevosClientesAnio: 0,
    mensajesTotales: 0,
    instanciasActivas: 0,
    ingresosAnio: 0,
    facturasPendientes: 0,
    montoPendiente: 0,
    membresiasPorPlan: [],
    topClientes: [],
    mensajesPorDia: [],
    totalPlanes: 0,
    planesMasVendidosAnio: [],
    ventasPorMes: [],
    totalVentasRealizadas: 0,
    anioSeleccionado: new Date().getFullYear(),
    aniosDisponibles: [new Date().getFullYear()]
  });

  const fetchStats = useCallback(async (anio: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuleAdminDashboard/api/admin.controller.stats.php?anio=${anio}`);
      const result = await response.json();
      console.log(result)
      if (result.message === 'Good') {
        setStats({
          clientesActivos: result.clientesActivos || 0,
          nuevosClientesAnio: result.nuevosClientesAnio || 0,
          mensajesTotales: result.mensajesTotales || 0,
          instanciasActivas: result.instanciasActivas || 0,
          ingresosAnio: result.ingresosAnio || 0,
          facturasPendientes: result.facturasPendientes || 0,
          montoPendiente: result.montoPendiente || 0,
          membresiasPorPlan: result.membresiasPorPlan || [],
          topClientes: result.topClientes || [],
          mensajesPorDia: result.mensajesPorDia || [],
          totalPlanes: result.totalPlanes || 0,
          planesMasVendidosAnio: result.planesMasVendidosAnio || [],
          ventasPorMes: result.ventasPorMes || [],
          totalVentasRealizadas: result.totalVentasRealizadas || 0,
          anioSeleccionado: result.anioSeleccionado || new Date().getFullYear(),
          aniosDisponibles: result.aniosDisponibles || [new Date().getFullYear()]
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(anioSeleccionado);
  }, [anioSeleccionado, fetchStats]);

  const handleAnioChange = (event: any) => {
    const nuevoAnio = Number(event.target.value);
    setAnioSeleccionado(nuevoAnio);
  };

  // Prepare chart data for messages by day
  const mensajesChartData = {
    categories: stats.mensajesPorDia.map(d => {
      const date = new Date(d.fecha);
      return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
    }),
    series: [
      { name: 'Mensajes', data: stats.mensajesPorDia.map(d => d.mensajes) }
    ]
  };

  // Prepare chart data for sales by month
  const ventasChartData = {
    categories: stats.ventasPorMes.map(v => v.nombreMes),
    series: [
      { name: 'Ventas', data: stats.ventasPorMes.map(v => v.cantidadVentas) },
      { name: 'Ingresos ($)', data: stats.ventasPorMes.map(v => v.totalVentas) }
    ]
  };

  // Calculate max for progress bars
  const maxVentasAnio = Math.max(...stats.planesMasVendidosAnio.map(p => p.cantidadVendida), 1);

  if (loading) {
    return (
      <DashboardContent maxWidth={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} sx={{ bgcolor: themeColors.bgPage, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      {/* Header with Year Selector */}
      <ModuloHeader titulo="Dashboard" subtitulo="Panel de Administración - Estadísticas de Ventas" />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: { xs: 3, md: 5 }, flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="anio-select-label" sx={{ color: themeColors.textSecondary }}>Año</InputLabel>
          <Select
            labelId="anio-select-label"
            id="anio-select"
            value={anioSeleccionado}
            label="Año"
            onChange={handleAnioChange}
            sx={{
              bgcolor: themeColors.bgCard,
              color: themeColors.textPrimary,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: themeColors.border,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: themeColors.primary,
              },
              '& .MuiSelect-select': {
                fontWeight: 600,
                fontSize: '1.1rem'
              },
              '& .MuiSvgIcon-root': {
                color: themeColors.textSecondary,
              }
            }}
          >
            {stats.aniosDisponibles.map((anio) => (
              <MenuItem key={anio} value={anio}>
                {anio}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title={`Ventas ${anioSeleccionado}`}
            percent={0}
            total={stats.totalVentasRealizadas}
            icon={<img alt="Ventas" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: [''],
              series: [stats.totalVentasRealizadas],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title={`Ingresos ${anioSeleccionado}`}
            percent={0}
            total={stats.ingresosAnio}
            color="secondary"
            icon={<img alt="Ingresos" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: [''],
              series: [stats.ingresosAnio],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title={`Nuevos Clientes ${anioSeleccionado}`}
            percent={0}
            total={stats.nuevosClientesAnio}
            color="warning"
            icon={<img alt="Nuevos Clientes" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: [''],
              series: [stats.nuevosClientesAnio],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Clientes Activos"
            percent={0}
            total={stats.clientesActivos}
            color="error"
            icon={<img alt="Clientes" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: [''],
              series: [stats.clientesActivos],
            }}
          />
        </Grid>

        {/* Sales by Month Chart */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title={`Ventas por Mes - ${anioSeleccionado}`}
            subheader={`Total del año: $${stats.ingresosAnio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            chart={ventasChartData.categories.length > 0 ? ventasChartData : {
              categories: ['Sin datos'],
              series: [{ name: 'Ventas', data: [0] }]
            }}
          />
        </Grid>

        {/* Distribution by Plan Chart */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title={`Distribución por Plan - ${anioSeleccionado}`}
            chart={{
              series: stats.membresiasPorPlan.length > 0
                ? stats.membresiasPorPlan
                : [{ label: 'Sin datos', value: 1 }],
            }}
          />
        </Grid>

        {/* Top Selling Plans - Year */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', bgcolor: themeColors.bgCard, boxShadow: themeColors.shadow }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Iconify icon={"solar:medal-ribbon-bold" as any} width={24} sx={{ color: themeColors.isDark ? '#58a6ff' : '#9c27b0' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.textPrimary }}>
                  Planes Más Vendidos - {anioSeleccionado}
                </Typography>
              </Box>

              {stats.planesMasVendidosAnio.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: themeColors.textSecondary }}>Sin ventas en {anioSeleccionado}</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {stats.planesMasVendidosAnio.map((plan, index) => (
                    <Box key={plan.nombrePlan}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {index < 3 && (
                            <Iconify
                              icon={"solar:medal-ribbon-bold" as any}
                              width={20}
                              sx={{
                                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                              }}
                            />
                          )}
                          <Typography sx={{ fontWeight: 500, color: themeColors.textPrimary }}>{plan.nombrePlan}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontWeight: 600, color: themeColors.isDark ? '#58a6ff' : '#9c27b0' }}>
                            {plan.cantidadVendida} vendidos
                          </Typography>
                          <Typography variant="caption" sx={{ color: themeColors.textSecondary }}>
                            ${plan.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(plan.cantidadVendida / maxVentasAnio) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: themeColors.isDark ? 'rgba(56, 139, 253, 0.15)' : '#f3e5f5',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: themeColors.isDark
                              ? (index === 0 ? '#58a6ff' : index === 1 ? '#79c0ff' : '#56d364')
                              : (index === 0 ? '#9c27b0' : index === 1 ? '#7b1fa2' : '#4a148c')
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Billing Summary Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', bgcolor: themeColors.bgCard, boxShadow: themeColors.shadow }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: themeColors.textPrimary }}>
                Resumen General - {anioSeleccionado}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: themeColors.isDark ? 'rgba(33, 150, 243, 0.15)' : '#e3f2fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon={"solar:calendar-mark-bold" as any} width={28} sx={{ color: '#2196F3' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                      Ingresos del Año
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196F3' }}>
                      ${stats.ingresosAnio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: themeColors.isDark ? 'rgba(76, 175, 80, 0.15)' : '#e8f5e9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon={"solar:bag-check-bold" as any} width={28} sx={{ color: '#4caf50' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                      Total Ventas
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {stats.totalVentasRealizadas}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: themeColors.isDark ? 'rgba(255, 152, 0, 0.15)' : '#fff3e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon={"solar:bill-list-bold" as any} width={28} sx={{ color: '#ff9800' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                      Facturas Pendientes
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800' }}>
                      {stats.facturasPendientes}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      bgcolor: themeColors.isDark ? 'rgba(244, 67, 54, 0.15)' : '#ffebee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Iconify icon={"solar:clock-circle-bold" as any} width={28} sx={{ color: '#f44336' }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                      Monto Pendiente
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#f44336' }}>
                      ${stats.montoPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ pt: 2, borderTop: `1px solid ${themeColors.border}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: themeColors.textSecondary }}>Total Planes Disponibles</Typography>
                  <Typography sx={{ fontWeight: 600, color: themeColors.textPrimary }}>{stats.totalPlanes}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: themeColors.textSecondary }}>Clientes Activos</Typography>
                  <Typography sx={{ fontWeight: 600, color: themeColors.textPrimary }}>{stats.clientesActivos}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: themeColors.textSecondary }}>Nuevos Clientes ({anioSeleccionado})</Typography>
                  <Typography sx={{ fontWeight: 600, color: themeColors.isDark ? '#58a6ff' : '#25D366' }}>
                    +{stats.nuevosClientesAnio}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: themeColors.textSecondary }}>Mensajes ({anioSeleccionado})</Typography>
                  <Typography sx={{ fontWeight: 600, color: themeColors.textPrimary }}>
                    {stats.mensajesTotales.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Clients Table */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ bgcolor: themeColors.bgCard, boxShadow: themeColors.shadow }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon={"solar:users-group-rounded-bold" as any} width={24} sx={{ color: themeColors.isDark ? '#58a6ff' : '#25D366' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: themeColors.textPrimary }}>
                  Mejores Clientes - {anioSeleccionado} (por Compras)
                </Typography>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: themeColors.bgTableHeader }}>
                      <TableCell sx={{ fontWeight: 600, color: themeColors.isDark ? '#fff' : '#333' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: themeColors.isDark ? '#fff' : '#333' }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: themeColors.isDark ? '#fff' : '#333' }}>Último Plan</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: themeColors.isDark ? '#fff' : '#333' }} align="center">Mensajes</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: themeColors.isDark ? '#fff' : '#333' }} align="right">Total Compras</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.topClientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, bgcolor: themeColors.bgTableRow }}>
                          <Typography sx={{ color: themeColors.textSecondary }}>No hay datos para {anioSeleccionado}</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.topClientes.map((cliente, index) => (
                        <TableRow
                          key={cliente.idCliente}
                          hover
                          sx={{
                            bgcolor: themeColors.bgTableRow,
                            '&:hover': { bgcolor: themeColors.bgTableRowHover }
                          }}
                        >
                          <TableCell sx={{ color: themeColors.textPrimary }}>
                            {index < 3 ? (
                              <Iconify
                                icon={"solar:medal-ribbon-bold" as any}
                                width={24}
                                sx={{
                                  color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                                }}
                              />
                            ) : (
                              index + 1
                            )}
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography sx={{ fontWeight: 500, color: themeColors.textPrimary }}>{cliente.nombre}</Typography>
                              <Typography variant="body2" sx={{ color: themeColors.textSecondary }}>
                                {cliente.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={cliente.plan}
                              size="small"
                              sx={{
                                bgcolor: themeColors.isDark ? '#58a6ff' : '#25D366',
                                color: themeColors.isDark ? '#0a192f' : 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography sx={{ fontWeight: 600, color: '#2196F3' }}>
                              {cliente.mensajes.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontWeight: 700, color: '#4caf50' }}>
                              ${cliente.totalCompras.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Messages by Day Chart - Only show for current year */}
        {stats.mensajesPorDia.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <AnalyticsWebsiteVisits
              title="Mensajes de los Últimos 7 Días"
              subheader={`Total del año: ${stats.mensajesTotales.toLocaleString()} mensajes`}
              chart={mensajesChartData.categories.length > 0 ? mensajesChartData : {
                categories: ['Sin datos'],
                series: [{ name: 'Mensajes', data: [0] }]
              }}
            />
          </Grid>
        )}
      </Grid>
    </DashboardContent>
  );
}
