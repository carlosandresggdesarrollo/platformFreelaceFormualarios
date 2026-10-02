import { Navigate } from 'react-router-dom';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { getTipoUsuario } from 'src/utils/auth';

import { FormularioDashboardView } from 'src/sections/formularios/view';
import { DashboardQuizWidget } from 'src/sections/cuestionarios/components/dashboard-quiz-widget';

// ----------------------------------------------------------------------

export default function Page() {
  const tipo = getTipoUsuario();

  if (tipo === 'CLIENTE') {
    return (
      <>
        <title>Mi Dashboard</title>
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
          <FormularioDashboardView />
        </Container>
      </>
    );
  }

  if (tipo === 'AUDITOR') {
    return <Navigate to="/auditor/dashboard" replace />;
  }

  return (
    <>
      <title>Dashboard</title>

      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Dashboard
        </Typography>
        <DashboardQuizWidget />
      </Container>
    </>
  );
}
