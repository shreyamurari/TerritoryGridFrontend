/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: true,
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL,
          ws: true,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
