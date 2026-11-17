import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Puerto fijo: la guía del profe usa 5174 (tiene que coincidir con allow_origins de la API).
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
})
