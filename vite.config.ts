import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Permite que funcione perfectamente en subrutas de GitHub Pages (ej. /geomundi/)
  server: {
    port: 3000,
    open: false
  }
})
