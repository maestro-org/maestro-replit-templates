import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      allowedHosts: ['.replit.dev']
    },
    define: {
      // Expose Replit secrets as VITE_ environment variables for the client
      'import.meta.env.VITE_MAESTRO_MAINNET_API_KEY': JSON.stringify(process.env.MAESTRO_MAINNET_API_KEY || process.env.VITE_MAESTRO_MAINNET_API_KEY || ''),
      'import.meta.env.VITE_MAESTRO_TESTNET_API_KEY': JSON.stringify(process.env.MAESTRO_TESTNET_API_KEY || process.env.VITE_MAESTRO_TESTNET_API_KEY || ''),
      'import.meta.env.VITE_MAESTRO_MAINNET_URL': JSON.stringify(process.env.MAESTRO_MAINNET_URL || process.env.VITE_MAESTRO_MAINNET_URL || 'https://xbt-mainnet.gomaestro-api.org/v0'),
      'import.meta.env.VITE_MAESTRO_TESTNET_URL': JSON.stringify(process.env.MAESTRO_TESTNET_URL || process.env.VITE_MAESTRO_TESTNET_URL || 'https://xbt-testnet.gomaestro-api.org/v0'),
      'import.meta.env.VITE_DEFAULT_NETWORK': JSON.stringify(process.env.DEFAULT_NETWORK || process.env.VITE_DEFAULT_NETWORK || 'mainnet'),
    }
  }
})