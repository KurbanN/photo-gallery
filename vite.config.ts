import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  /**
   * Базовый путь приложения.
   * - PS.KZ / свой домен в корне: `/` (по умолчанию) — `npm run build:hosting`
   * - GitHub Pages project site: `VITE_BASE_PATH=/photo-gallery/` — `npm run build:pages`
   */
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
    },
  },
});
