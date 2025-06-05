import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/data': 'http://localhost:8000',
      '/predict': 'http://localhost:8000',
      '/api': 'http://localhost:8000'
    },
  },
})
