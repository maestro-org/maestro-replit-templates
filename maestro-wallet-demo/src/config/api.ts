export type Network = 'mainnet' | 'testnet'

export interface ApiConfig {
  apiKey: string
  baseUrl: string
  network: Network
}

export interface IndexerApiConfig {
  apiKey: string
  baseUrl: string
  network: Network
}

// Wallet API URLs
const WALLET_MAINNET_URL = import.meta.env.VITE_MAESTRO_WALLET_MAINNET_URL || 'https://xbt-mainnet.gomaestro-api.org/v0'
const WALLET_TESTNET_URL = import.meta.env.VITE_MAESTRO_WALLET_TESTNET_URL || 'https://xbt-testnet.gomaestro-api.org/v0'

// Blockchain Indexer API URLs (same base as wallet but for blockchain-indexer endpoints)
const INDEXER_MAINNET_URL = import.meta.env.VITE_MAESTRO_INDEXER_MAINNET_URL || 'https://xbt-mainnet.gomaestro-api.org/v0'
const INDEXER_TESTNET_URL = import.meta.env.VITE_MAESTRO_INDEXER_TESTNET_URL || 'https://xbt-testnet.gomaestro-api.org/v0'

// Event Manager API URLs - now using the same base URLs as wallet API
const EVENT_MANAGER_MAINNET_URL = `${WALLET_MAINNET_URL}/eventmanager`
const EVENT_MANAGER_TESTNET_URL = `${WALLET_TESTNET_URL}/eventmanager`

const MAINNET_API_KEY = import.meta.env.VITE_MAESTRO_MAINNET_API_KEY || ''
const TESTNET_API_KEY = import.meta.env.VITE_MAESTRO_TESTNET_API_KEY || ''
const DEFAULT_NETWORK = (import.meta.env.VITE_DEFAULT_NETWORK as Network) || 'mainnet'

export const getApiConfig = (network: Network = DEFAULT_NETWORK): ApiConfig => {
  return {
    apiKey: network === 'mainnet' ? MAINNET_API_KEY : TESTNET_API_KEY,
    baseUrl: network === 'mainnet' ? WALLET_MAINNET_URL : WALLET_TESTNET_URL,
    network
  }
}

export const getIndexerApiConfig = (network: Network = DEFAULT_NETWORK): IndexerApiConfig => {
  return {
    apiKey: network === 'mainnet' ? MAINNET_API_KEY : TESTNET_API_KEY,
    baseUrl: network === 'mainnet' ? INDEXER_MAINNET_URL : INDEXER_TESTNET_URL,
    network
  }
}

export const getEventManagerConfig = (network: Network = DEFAULT_NETWORK) => {
  return {
    apiKey: network === 'mainnet' ? MAINNET_API_KEY : TESTNET_API_KEY,
    baseUrl: network === 'mainnet' ? EVENT_MANAGER_MAINNET_URL : EVENT_MANAGER_TESTNET_URL,
    network
  }
}

export const getApiHeaders = (apiKey: string) => ({
  'api-key': apiKey,
  'Content-Type': 'application/json'
})

export const ENDPOINTS = {
  ADDRESS_STATS: '/wallet/addresses/{address}/statistics',
  RUNE_ACTIVITY: '/wallet/addresses/{address}/runes/activity',
  RUNE_UTXOS: '/addresses/{address}/runes/utxos',
  RUNE_INFO: '/assets/runes/{rune_id}',
  INSCRIPTION_ACTIVITY: '/wallet/addresses/{address}/inscriptions/activity',
  METAPROTOCOL_ACTIVITY: '/wallet/addresses/{address}/activity/metaprotocols',
  SATOSHI_ACTIVITY: '/wallet/addresses/{address}/activity',
  HISTORICAL_BALANCE: '/wallet/addresses/{address}/balance/historical'
} as const

export { DEFAULT_NETWORK }