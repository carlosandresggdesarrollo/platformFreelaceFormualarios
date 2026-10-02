import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { apiGet } from 'src/utils/api';

// ----------------------------------------------------------------------

export interface ValorLista {
  id: number; // lista existente (0 si ninguna)
  nuevo: string; // nombre de lista nueva (vacío si no aplica)
}

interface Props {
  /** Endpoint GET que devuelve la lista (relativo, sin CONFIG.apiUrl). */
  endpoint: string;
  /** Clave del array en la respuesta: 'grupos' | 'playlists'. */
  arrayKey: string;
  /** Clave del id en cada item: 'idGrupo' | 'idPlaylist'. */
  idKey: string;
  /** Etiqueta del selector. */
  label: string;
  value: ValorLista;
  onChange: (v: ValorLista) => void;
}

const NUEVA = '__nueva__';

export function SelectorLista({ endpoint, arrayKey, idKey, label, value, onChange }: Props) {
  const [listas, setListas] = useState<{ id: number; nombre: string }[]>([]);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const d: any = await apiGet(endpoint);
      const arr = (d?.[arrayKey] || []) as any[];
      setListas(arr.map((x) => ({ id: Number(x[idKey]), nombre: x.nombre })));
    } catch {
      /* sin conexión */
    }
  }, [endpoint, arrayKey, idKey]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const selectValue = value.id > 0 ? String(value.id) : creando ? NUEVA : '';

  return (
    <Stack spacing={1.5}>
      <TextField
        select
        label={label}
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') {
            setCreando(false);
            onChange({ id: 0, nuevo: '' });
          } else if (v === NUEVA) {
            setCreando(true);
            onChange({ id: 0, nuevo: value.nuevo });
          } else {
            setCreando(false);
            onChange({ id: Number(v), nuevo: '' });
          }
        }}
        fullWidth
      >
        <MenuItem value="">— Ninguna —</MenuItem>
        {listas.map((l) => (
          <MenuItem key={l.id} value={String(l.id)}>
            {l.nombre}
          </MenuItem>
        ))}
        <MenuItem value={NUEVA}>➕ Crear nueva lista…</MenuItem>
      </TextField>

      {creando && (
        <TextField
          label="Nombre de la nueva lista"
          value={value.nuevo}
          onChange={(e) => onChange({ id: 0, nuevo: e.target.value })}
          fullWidth
          autoFocus
        />
      )}
    </Stack>
  );
}
