import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';

import { CONFIG } from 'src/config-global';

const API_PUBLIC = `${CONFIG.apiBase}/Modules/ModuleHome/api/administrador.controller.publico.php`;

const SiteNameContext = createContext<string>('Formularios Web');

let cachedName: string | null = null;

export function SiteNameProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState(cachedName || 'Formularios Web');

  useEffect(() => {
    if (cachedName) return;
    fetch(API_PUBLIC)
      .then((r) => r.json())
      .then((d) => {
        const n = d?.config?.nombreSitio || 'Formularios Web';
        cachedName = n;
        setName(n);
      })
      .catch(() => {});
  }, []);

  return <SiteNameContext.Provider value={name}>{children}</SiteNameContext.Provider>;
}

export function useSiteName(): string {
  return useContext(SiteNameContext);
}
