import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: '/csi-vegas/',
  resolve: {
    alias: {
      // Framer marketplace modules import `framer` — map to Unframer’s bundled runtime.
      framer: path.resolve(__dirname, 'node_modules/unframer/dist/framer.js'),
    },
  },
  optimizeDeps: {
    include: ['three', 'framer-motion'],
  },
  build: {
    target: 'esnext'
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})
