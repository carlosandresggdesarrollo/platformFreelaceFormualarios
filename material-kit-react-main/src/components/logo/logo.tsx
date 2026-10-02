import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

const BASE = import.meta.env.BASE_URL;
const SINGLE_PNG = `${BASE}assets/logo-1.png`;
const SINGLE_WEBP = `${BASE}assets/icons/workspaces/logo-1.webp`;
const FULL_PNG   = `${BASE}assets/logo-full.png`;
const FULL_WEBP  = `${BASE}assets/logo-full.webp`;

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {

  const singleLogo = (
    <picture>
      {/* Fuente WebP si la tienes */}
      <source srcSet={SINGLE_WEBP} type="image/webp" />
      <img
        src={SINGLE_PNG}
        alt="Logo"
        width={512}
        height={512}
        style={{ width: '100%', height: '100%', display: 'block' }}
        loading="eager"
        decoding="async"
      />
    </picture>
  );

  const fullLogo = (
    <picture>
      <source srcSet={FULL_WEBP} type="image/webp" />
      <img
        src={FULL_PNG}
        alt="Logo"
        width={360}
        height={128}
        style={{ width: '100%', height: '100%', display: 'block' }}
        loading="eager"
        decoding="async"
      />
    </picture>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 40,
          height: 40,
          ...(!isSingle && { width: 102, height: 36 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
