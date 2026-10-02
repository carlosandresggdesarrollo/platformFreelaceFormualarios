import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------
// Recuerda si una lista de registros se ve como "tarjetas" o "tabla".
// La preferencia se guarda por módulo en localStorage. Por defecto: tarjetas.
// ----------------------------------------------------------------------

export type VistaLista = 'tarjetas' | 'tabla';

export function useVistaLista(clave: string, inicial: VistaLista = 'tarjetas') {
  const storageKey = `vista-lista:${clave}`;

  const [vista, setVistaState] = useState<VistaLista>(() => {
    if (typeof window === 'undefined') return inicial;
    const guardada = window.localStorage.getItem(storageKey);
    return guardada === 'tabla' || guardada === 'tarjetas' ? guardada : inicial;
  });

  const setVista = useCallback(
    (nueva: VistaLista) => {
      setVistaState(nueva);
      try {
        window.localStorage.setItem(storageKey, nueva);
      } catch {
        /* noop */
      }
    },
    [storageKey]
  );

  return [vista, setVista] as const;
}
