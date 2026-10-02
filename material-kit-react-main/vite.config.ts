import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3039;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const basePath = env.VITE_BASE_PATH || '/formularios';

  const PROXY_TARGET = env.VITE_PROXY_TARGET || 'https://carlo-code-dev.com/';

  const USE_POLLING = env.VITE_USE_POLLING === 'true';

  return {
    base: `${basePath}/`,
    plugins: [
      react(),
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
          dev: { logLevel: ['error'] },
        },
        overlay: {
          position: 'tl',
          initialIsOpen: false,
        },
      }),
    ],
    resolve: {
      alias: [
        {
          find: /^src(.+)/,
          replacement: path.resolve(process.cwd(), 'src/$1'),
        },
      ],
    },
    server: {
      port: PORT,
      host: true,
      watch: USE_POLLING ? { usePolling: true } : undefined,
      proxy: {
        [`${basePath}/administrador`]: {
          target: PROXY_TARGET,
          changeOrigin: true,
        },
        '/uploads': {
          target: PROXY_TARGET,
          changeOrigin: true,
        },
        '/temp': {
          target: PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
    preview: { port: PORT, host: true },
  };
});
