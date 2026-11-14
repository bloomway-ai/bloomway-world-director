import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

/** GitHub Pages project site needs a repo subpath; Vercel/local use `/`. */
const base = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@core': path.resolve(dir, '../../packages/core/src'),
      '@edit': path.resolve(dir, '../../packages/core/src/edit'),
    },
  },
});
