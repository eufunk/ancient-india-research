import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// Die Inhalte liegen außerhalb von website/ (../research, ../data).
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  plugins: [react()],
  // Vite 8: CSS ausdrücklich über PostCSS verarbeiten, damit Tailwind (postcss.config.mjs) greift
  css: { transformer: 'postcss' },
  server: {
    host: '127.0.0.1', // nur lokal erreichbar
    port: 5173,
    open: true,
    fs: { allow: [repoRoot] },
  },
  preview: { host: '127.0.0.1', port: 4173 },
  build: { chunkSizeWarningLimit: 1500 },
})
