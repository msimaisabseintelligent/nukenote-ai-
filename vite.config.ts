import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded relatively (fixes blank screen on subpath deployments)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});