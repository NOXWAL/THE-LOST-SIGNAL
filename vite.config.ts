import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/THE-LOST-SIGNAL/',
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@player': resolve(__dirname, 'src/player'),
      '@world': resolve(__dirname, 'src/world'),
      '@missions': resolve(__dirname, 'src/missions'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@types': resolve(__dirname, 'src/types')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
