import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Dominio oficial geostrike.app en Vercel
  server: {
    host: true,
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
