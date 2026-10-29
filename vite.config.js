import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward API calls to the Express server (npm run server) during development.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        // Generation can take a while with PDFs and photos.
        timeout: 200000,
        proxyTimeout: 200000,
      },
    },
  },
});
