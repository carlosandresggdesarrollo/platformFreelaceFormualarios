import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { Navigate, Outlet } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingGate, LoadingFallback } from 'src/components/loading-fallback/loading-fallback';

// ----------------------------------------------------------------------

export const DashboardPage      = lazy(() => import('src/pages/dashboard'));
export const SignInPage         = lazy(() => import('src/pages/sign-in'));
export const Page404            = lazy(() => import('src/pages/page-not-found'));

export const DomicilioPage      = lazy(() => import('src/pages/domicilio'));
export const RecuperarPasswordPage = lazy(() => import('src/pages/recuperar-password'));
export const VerificacionPendientePage = lazy(() => import('src/pages/verificacion-pendiente'));
export const ConfirmarCorreoPage = lazy(() => import('src/pages/confirmar-correo'));

export const UsuariosPage           = lazy(() => import('src/pages/usuarios/usuarios'));
export const UsuariosCrearPage      = lazy(() => import('src/pages/usuarios/crear'));
export const UsuariosEditarPage     = lazy(() => import('src/pages/usuarios/editar'));

export const InicioPage             = lazy(() => import('src/pages/inicio'));

// ----------------------------------------------------------------------
// HOME ADMIN
// ----------------------------------------------------------------------
export const HomeAdminConfigPage      = lazy(() => import('src/pages/home-admin/config'));
export const HomeAdminTemasPage       = lazy(() => import('src/pages/home-admin/temas'));
export const HomeAdminNavPage         = lazy(() => import('src/pages/home-admin/nav'));
export const HomeAdminCarruselesPage  = lazy(() => import('src/pages/home-admin/carruseles'));
export const HomeAdminAuditPage       = lazy(() => import('src/pages/home-admin/audit'));
export const HomeAdminAnimacionesPage = lazy(() => import('src/pages/home-admin/animaciones'));
export const HomeAdminLoadersPage     = lazy(() => import('src/pages/home-admin/loaders'));
export const HomeAdminRedesPage       = lazy(() => import('src/pages/home-admin/redes'));
export const HomeAdminModalPage       = lazy(() => import('src/pages/home-admin/modal'));

// ----------------------------------------------------------------------
// ANALYTICS
// ----------------------------------------------------------------------
export const AnalyticsPage            = lazy(() => import('src/pages/analytics'));

// ----------------------------------------------------------------------
// LOGO ADMIN
// ----------------------------------------------------------------------
export const LogoAdminPage            = lazy(() => import('src/pages/logo-admin'));

// ----------------------------------------------------------------------
// AUTH
// ----------------------------------------------------------------------
export const SignUpPage2              = lazy(() => import('src/pages/sign-up'));

// ----------------------------------------------------------------------
// CLIENTES
// ----------------------------------------------------------------------
export const ClientesPage             = lazy(() => import('src/pages/clientes'));
export const ClienteDashboardPage     = lazy(() => import('src/pages/cliente-dashboard'));
export const ClienteCuestionarioDetallePage = lazy(() => import('src/pages/cliente/cuestionario-detalle'));

// ----------------------------------------------------------------------
// PERFIL
// ----------------------------------------------------------------------
export const PerfilPage                 = lazy(() => import('src/pages/perfil/perfil'));

// ----------------------------------------------------------------------
// CUESTIONARIOS
// ----------------------------------------------------------------------
export const CuestionariosPage            = lazy(() => import('src/pages/cuestionarios'));
export const CuestionarioEditorPage       = lazy(() => import('src/pages/cuestionarios/editor'));
export const CuestionarioStatsPage        = lazy(() => import('src/pages/cuestionarios/stats'));
export const QuizListPage                 = lazy(() => import('src/pages/quiz'));
export const QuizResponderPage            = lazy(() => import('src/pages/quiz-responder'));

// ----------------------------------------------------------------------
// AUDITOR
// ----------------------------------------------------------------------
export const AuditorDashboardPage         = lazy(() => import('src/pages/auditor-dashboard'));

// ----------------------------------------------------------------------
// FORMULARIOS (CLIENTE)
// ----------------------------------------------------------------------
export const FormulariosListadoPage       = lazy(() => import('src/pages/formularios/listado'));
export const FormulariosEditorPage        = lazy(() => import('src/pages/formularios/editor'));
export const FormulariosStatsPage         = lazy(() => import('src/pages/formularios/stats'));

// ----------------------------------------------------------------------
// FORMULARIOS (ADMIN - supervision)
// ----------------------------------------------------------------------
export const FormulariosAdminPage         = lazy(() => import('src/pages/formularios-admin'));
export const FormulariosAdminStatsPage    = lazy(() => import('src/pages/formularios-admin-stats'));

// ----------------------------------------------------------------------
// FORMULARIO PUBLICO
// ----------------------------------------------------------------------
export const FormularioPublicoPage        = lazy(() => import('src/pages/formulario-publico'));


const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);
export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: (
      <LoadingGate>
        <InicioPage />
      </LoadingGate>
    ),
  },
  {
    element: (
      <DashboardLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },

      { path: 'usuarios', element: <UsuariosPage /> },
      { path: 'usuarios/crear', element: <UsuariosCrearPage /> },
      { path: 'usuarios/editar/:id', element: <UsuariosEditarPage /> },

      // HOME ADMIN
      { path: 'home-admin/config', element: <HomeAdminConfigPage /> },
      { path: 'home-admin/temas', element: <HomeAdminTemasPage /> },
      { path: 'home-admin/nav', element: <HomeAdminNavPage /> },
      { path: 'home-admin/carruseles', element: <HomeAdminCarruselesPage /> },
      { path: 'home-admin/audit', element: <HomeAdminAuditPage /> },
      { path: 'home-admin/animaciones', element: <HomeAdminAnimacionesPage /> },
      { path: 'home-admin/loaders', element: <HomeAdminLoadersPage /> },
      { path: 'home-admin/redes', element: <HomeAdminRedesPage /> },
      { path: 'modal-bienvenida', element: <HomeAdminModalPage /> },

      // LOGO
      { path: 'logo', element: <LogoAdminPage /> },

      // CLIENTES (admin view)
      { path: 'clientes', element: <ClientesPage /> },

      // PERFIL
      { path: 'perfil', element: <PerfilPage /> },

      // CUESTIONARIOS (admin)
      { path: 'cuestionarios', element: <CuestionariosPage /> },
      { path: 'cuestionarios/crear', element: <CuestionarioEditorPage /> },
      { path: 'cuestionarios/editar/:id', element: <CuestionarioEditorPage /> },
      { path: 'cuestionarios/stats/:id', element: <CuestionarioStatsPage /> },

      // ANALYTICS
      { path: 'analiticas', element: <AnalyticsPage /> },

      // FORMULARIOS ADMIN (supervision)
      { path: 'admin/formularios', element: <FormulariosAdminPage /> },
      { path: 'admin/formularios/stats/:id', element: <FormulariosAdminStatsPage /> },

      // CLIENTE
      { path: 'cliente/cuestionarios', element: <ClienteDashboardPage /> },
      { path: 'cliente/cuestionario/:idSesion', element: <ClienteCuestionarioDetallePage /> },

      // FORMULARIOS (CLIENTE)
      { path: 'formularios', element: <FormulariosListadoPage /> },
      { path: 'formularios/editar/:id', element: <FormulariosEditorPage /> },
      { path: 'formularios/stats/:id', element: <FormulariosStatsPage /> },

      // AUDITOR
      { path: 'auditor/dashboard', element: <AuditorDashboardPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <LoadingGate>
        <SignInPage />
      </LoadingGate>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <LoadingGate>
        <SignUpPage2 />
      </LoadingGate>
    ),
  },
  {
    path: 'domicilio',
    element: <DomicilioPage />,
  },
  {
    path: 'recuperar-password/:token',
    element: <RecuperarPasswordPage />,
  },
  {
    path: 'verificacion-pendiente',
    element: <VerificacionPendientePage />,
  },
  {
    path: 'confirmar-correo/:token',
    element: <ConfirmarCorreoPage />,
  },
  // CUESTIONARIOS (publico, sin login)
  {
    path: 'quiz',
    element: (
      <LoadingGate>
        <QuizListPage />
      </LoadingGate>
    ),
  },
  {
    path: 'quiz/:id',
    element: (
      <LoadingGate>
        <QuizResponderPage />
      </LoadingGate>
    ),
  },
  // FORMULARIO PUBLICO (link directo, slug opcional)
  {
    path: 'form/:token/:slug?',
    element: <FormularioPublicoPage />,
  },
  {
    path: '404',
    element: <Page404 />,
  },
  {
    path: 'inicio',
    element: <Navigate to="/" replace />,
  },
  { path: '*', element: <Page404 /> },
];
