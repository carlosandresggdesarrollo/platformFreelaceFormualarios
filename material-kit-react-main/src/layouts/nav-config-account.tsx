import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Perfil',
    href: '/perfil',
    icon: <Iconify width={22} icon={"solar:user-circle-bold-duotone" as any} />,
  },
];
