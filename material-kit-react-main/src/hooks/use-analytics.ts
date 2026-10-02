import { useRef, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/config-global';

const TRACKING_URL = `${CONFIG.apiBase}/Modules/ModuleAnalytics/api/administrador.controller.tracking.php`;

function sendTracking(data: Record<string, unknown>) {
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACKING_URL, blob);
    } else {
      fetch(TRACKING_URL, { method: 'POST', body: blob, keepalive: true }).catch(() => {});
    }
  } catch { /* ignore */ }
}

export function useAnalytics(pagina: string) {
  const visitaId = useRef<number>(0);
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const pendingEvents = useRef<Array<{ tipo: string; detalle: string; valor: number }>>([]);
  const sectionsTracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    startTime.current = Date.now();
    maxScroll.current = 0;
    sectionsTracked.current.clear();
    pendingEvents.current = [];

    fetch(TRACKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accion: 'visita',
        pagina,
        referrer: document.referrer || null,
        idioma: navigator.language || null,
        resolucion: `${window.screen.width}x${window.screen.height}`,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.idVisita) visitaId.current = d.idVisita;
      })
      .catch(() => {});

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
        if (pct > maxScroll.current) {
          maxScroll.current = pct;
          const thresholds = [25, 50, 75, 100];
          for (const t of thresholds) {
            if (pct >= t && !sectionsTracked.current.has(`scroll_${t}`)) {
              sectionsTracked.current.add(`scroll_${t}`);
              pendingEvents.current.push({ tipo: 'scroll_depth', detalle: `${t}%`, valor: t });
            }
          }
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const text = link.textContent?.trim().slice(0, 100) || '';
        pendingEvents.current.push({ tipo: 'click', detalle: `${text} → ${href}`, valor: 0 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick, true);

    const flushInterval = setInterval(() => {
      if (visitaId.current && pendingEvents.current.length > 0) {
        const eventos = [...pendingEvents.current];
        pendingEvents.current = [];
        sendTracking({
          accion: 'actualizar',
          idVisita: visitaId.current,
          duracion: Math.round((Date.now() - startTime.current) / 1000),
          scrollMax: maxScroll.current,
          eventos,
        });
      }
    }, 15000);

    const handleUnload = () => {
      if (!visitaId.current) return;
      sendTracking({
        accion: 'actualizar',
        idVisita: visitaId.current,
        duracion: Math.round((Date.now() - startTime.current) / 1000),
        scrollMax: maxScroll.current,
        eventos: pendingEvents.current,
      });
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleUnload);
      clearInterval(flushInterval);
      handleUnload();
    };
  }, [pagina]);

  const trackSection = useCallback((sectionName: string) => {
    if (!sectionsTracked.current.has(`sec_${sectionName}`)) {
      sectionsTracked.current.add(`sec_${sectionName}`);
      pendingEvents.current.push({ tipo: 'seccion_vista', detalle: sectionName, valor: 0 });
    }
  }, []);

  return { trackSection };
}
