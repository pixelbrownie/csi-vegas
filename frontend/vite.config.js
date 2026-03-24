// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // This tells Vite that the Framer link is an external dependency
      external: [/^https:\/\/framer\.com\/m\/.*/],
    },
  },
})