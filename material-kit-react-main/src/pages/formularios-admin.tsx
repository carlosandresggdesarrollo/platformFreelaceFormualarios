import Container from '@mui/material/Container';

import { FormulariosAdminView } from 'src/sections/formularios-admin/view';

export default function Page() {
  return (
    <>
      <title>Formularios - Supervision</title>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <FormulariosAdminView />
      </Container>
    </>
  );
}
