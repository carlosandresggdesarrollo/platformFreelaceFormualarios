import 'src/global.css';

import { useEffect, useRef } from 'react';

import { usePathname } from 'src/routes/hooks';

import { SiteNameProvider, useSiteName } from 'src/hooks/use-site-name';

import { ThemeProvider } from 'src/theme/theme-provider';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <SiteNameProvider>
      <ThemeProvider>
        <SiteTitleSuffix />
        {children}
      </ThemeProvider>
    </SiteNameProvider>
  );
}

function SiteTitleSuffix() {
  const siteName = useSiteName();
  const prev = useRef('');

  useEffect(() => {
    const suffix = ` | ${siteName}`;

    const apply = () => {
      const base = document.title.endsWith(suffix)
        ? document.title.slice(0, -suffix.length)
        : document.title;
      if (base && base !== prev.current) {
        prev.current = base;
        document.title = `${base}${suffix}`;
      }
    };

    const timer = setTimeout(apply, 0);

    const obs = new MutationObserver(() => {
      apply();
    });

    const el = document.querySelector('title');
    if (el) obs.observe(el, { childList: true, characterData: true, subtree: true });

    return () => {
      clearTimeout(timer);
      obs.disconnect();
    };
  }, [siteName]);

  return null;
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
