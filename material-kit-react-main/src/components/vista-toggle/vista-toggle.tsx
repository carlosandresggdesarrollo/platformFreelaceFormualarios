import type { VistaLista } from 'src/hooks/use-vista-lista';

import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Props {
  value: VistaLista;
  onChange: (vista: VistaLista) => void;
}

export function VistaToggle({ value, onChange }: Props) {
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={value}
      onChange={(_, v) => {
        if (v) onChange(v);
      }}
    >
      <Tooltip title="Ver como tarjetas">
        <ToggleButton value="tarjetas">
          <Iconify icon={'mdi:view-grid-outline' as any} width={20} />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Ver como tabla">
        <ToggleButton value="tabla">
          <Iconify icon={'mdi:table' as any} width={20} />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}
