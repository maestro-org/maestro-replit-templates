import { useState, useEffect, useMemo } from 'react'
import { MaestroApiService } from '../services/maestroApi'
import { useNetwork } from '../context/NetworkContext'
import { useWallet } from '../context/WalletContext'

const detectAddressNetwork = (address: string): 'mainnet' | 'testnet' | 'unknown' => {
  if (/^(bc1|1|3)/.test(address)) return 'mainnet'
  if (/^(tb1|[mn2])/.test(address)) return 'testnet'
  return 'unknown'
}

export const useMaestroApi = () => {
  const { apiConfig, network } = useNetwork()
  const { currentAddress } = useWallet()
  const [walletData, setWalletData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [networkMismatch, setNetworkMismatch] = useState<string | null>(null)

  const apiService = useMemo(() => new MaestroApiService(apiConfig), [apiConfig])

  const fetchWalletInsights = async (address: string) => {
    setLoading(true)
    setError(null)
    setNetworkMismatch(null)
    setWalletData(null)

    const addressNetwork = detectAddressNetwork(address)
    if (addressNetwork !== 'unknown' && addressNetwork !== network) {
      setNetworkMismatch(`This appears to be a ${addressNetwork} address, but you're currently on ${network}. Some data may not be available.`)
    }

    try {
      const insights = await apiService.getWalletInsights(address)
      setWalletData(insights)
      
      if (insights.errors && insights.errors.length > 0) {
        console.warn('Some API calls failed:', insights.errors)
        // Don't set as an error - data is still partially available
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet data'
      setError(errorMessage)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentAddress) {
      fetchWalletInsights(currentAddress)
    } else {
      setWalletData(null)
      setError(null)
      setNetworkMismatch(null)
    }
  }, [currentAddress, apiService])

  return {
    walletData,
    loading,
    error,
    networkMismatch,
    fetchWalletInsights,
    apiService
  }
}