/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://anusha267.github.io/bookenzy-ui/ so assets need that base path.
export default defineConfig({
  base: '/bookenzy-ui/',
  plugins: [react()],
  build: { outDir: 'build' },
  server: { port: 3000 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
  },
});
