import Container from '@mui/material/Container';

import { FormulariosListadoView } from 'src/sections/formularios/view';

export default function Page() {
  return (
    <>
      <title>Mis Formularios</title>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <FormulariosListadoView />
      </Container>
    </>
  );
}
