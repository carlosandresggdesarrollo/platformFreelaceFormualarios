import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { layoutClasses } from './classes';

// ----------------------------------------------------------------------

export type MainSectionProps = React.ComponentProps<typeof MainRoot>;

export function MainSection({ children, className, sx, ...other }: MainSectionProps) {
  return (
    <MainRoot className={mergeClasses([layoutClasses.main, className])} sx={sx} {...other}>
      {children}
    </MainRoot>
  );
}

// ----------------------------------------------------------------------

const MainRoot = styled('main')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  backgroundColor: theme.vars.palette.background.default,
  transition: 'background-color 0.3s ease',
}));
