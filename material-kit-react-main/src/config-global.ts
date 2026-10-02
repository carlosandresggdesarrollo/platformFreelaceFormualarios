import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  apiUrl: string;
  basePath: string;
  apiBase: string;
};

const basePath = import.meta.env.VITE_BASE_PATH || '/formularios';

export const CONFIG: ConfigValue = {
  appName: 'Formularios Web',
  appVersion: packageJson.version,
  apiUrl: '',
  basePath,
  apiBase: `${basePath}/administrador`,
};
