import Container from '@mui/material/Container';

import { AuditorDashboardView } from 'src/sections/auditor/view';

export default function Page() {
  return (
    <>
      <title>Auditoria</title>
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 4 }}>
        <AuditorDashboardView />
      </Container>
    </>
  );
}
