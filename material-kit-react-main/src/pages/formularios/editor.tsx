import Container from '@mui/material/Container';

import { FormularioEditorView } from 'src/sections/formularios/view';

export default function Page() {
  return (
    <>
      <title>Editor de Formulario</title>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <FormularioEditorView />
      </Container>
    </>
  );
}
