import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: ['.replit.dev']
  },
  // Environment variables are automatically loaded by Vite
  // No need for manual process.env handling - Vite will handle this
})