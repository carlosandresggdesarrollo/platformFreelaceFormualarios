import Container from '@mui/material/Container';

import { FormularioAnalyticsView } from 'src/sections/formularios/view';

export default function Page() {
  return (
    <>
      <title>Analítica de Formulario</title>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <FormularioAnalyticsView />
      </Container>
    </>
  );
}
