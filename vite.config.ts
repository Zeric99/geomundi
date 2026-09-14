import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Permite que funcione perfectamente en subrutas de GitHub Pages (ej. /geomundi/)
  server: {
    port: 3000,
    open: false
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-maps': ['react-simple-maps', 'd3-geo', 'topojson-client'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
