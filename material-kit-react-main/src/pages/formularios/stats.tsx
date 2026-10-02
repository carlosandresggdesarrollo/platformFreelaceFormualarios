import Container from '@mui/material/Container';

import { FormularioStatsView } from 'src/sections/formularios/view';

export default function Page() {
  return (
    <>
      <title>Estadisticas de Formulario</title>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <FormularioStatsView />
      </Container>
    </>
  );
}
