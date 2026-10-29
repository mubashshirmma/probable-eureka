import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use the same PORT as the Express server (from .env), so the two always match.
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT || '8787';

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
    },
    server: {
      // Forward API calls to the Express server (npm run server) during development.
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
          // Generation can take a while with PDFs and photos.
          timeout: 200000,
          proxyTimeout: 200000,
        },
      },
    },
  };
});
