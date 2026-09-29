import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.API_PROXY_TARGET || 'https://tech360-fanhub.runasp.net';
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return {
    base: process.env.GITHUB_ACTIONS && repository ? `/${repository}/` : '/',
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target, changeOrigin: true, secure: true },
        '/health': { target, changeOrigin: true, secure: true },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/react') || id.includes('/node_modules/scheduler/')) {
              return 'react-vendor';
            }
          },
        },
      },
    },
  };
});
