import { Network } from '../config/api'

/**
 * Utility functions for generating Maestro Explorer URLs
 */

const MAESTRO_EXPLORER_BASE_URL = 'https://explorer.gomaestro.org/bitcoin'

/**
 * Generate a Maestro Explorer URL for a Bitcoin transaction
 * @param txHash - Transaction hash
 * @param network - Network (mainnet or testnet)
 * @returns Complete URL to view the transaction on Maestro Explorer
 */
export const getMaestroExplorerTxUrl = (txHash: string, network: Network): string => {
  return `${MAESTRO_EXPLORER_BASE_URL}/${network}/transactions/${txHash}`
}

/**
 * Generate a Maestro Explorer URL for a Bitcoin address
 * @param address - Bitcoin address
 * @param network - Network (mainnet or testnet)
 * @returns Complete URL to view the address on Maestro Explorer
 */
export const getMaestroExplorerAddressUrl = (address: string, network: Network): string => {
  return `${MAESTRO_EXPLORER_BASE_URL}/${network}/address/${address}`
}

/**
 * Generate a Maestro Explorer URL for a Bitcoin block
 * @param blockHeight - Block height or block hash
 * @param network - Network (mainnet or testnet)
 * @returns Complete URL to view the block on Maestro Explorer
 */
export const getMaestroExplorerBlockUrl = (blockHeight: string | number, network: Network): string => {
  return `${MAESTRO_EXPLORER_BASE_URL}/${network}/block/${blockHeight}`
}

/**
 * Generate a Maestro Explorer URL for an inscription
 * @param inscriptionId - Inscription ID
 * @param network - Network (mainnet or testnet)
 * @returns Complete URL to view the inscription on Maestro Explorer
 */
export const getMaestroExplorerInscriptionUrl = (inscriptionId: string, network: Network): string => {
  return `${MAESTRO_EXPLORER_BASE_URL}/${network}/inscription/${inscriptionId}`
}

/**
 * Generate a Maestro Explorer URL for a rune
 * @param runeId - Rune ID
 * @param network - Network (mainnet or testnet)
 * @returns Complete URL to view the rune on Maestro Explorer
 */
export const getMaestroExplorerRuneUrl = (runeId: string, network: Network): string => {
  return `${MAESTRO_EXPLORER_BASE_URL}/${network}/rune/${runeId}`
}
