/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAESTRO_MAINNET_API_KEY: string
  readonly VITE_MAESTRO_TESTNET_API_KEY: string
  readonly VITE_MAESTRO_MAINNET_URL: string
  readonly VITE_MAESTRO_TESTNET_URL: string
  readonly VITE_DEFAULT_NETWORK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}