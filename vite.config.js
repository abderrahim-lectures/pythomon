import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  server: {
    proxy: {
      '/api/opencode': {
        target: 'https://opencode.ai/inference/openai/v1',
        changeOrigin: true,
        rewrite: function (path) { return path.replace(/^\/api\/opencode/, ''); },
        headers: { Authorization: 'Bearer public' }
      }
    }
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 4096
  }
});
