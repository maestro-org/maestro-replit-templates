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
        
        // Check for timeout errors specifically
        const timeoutErrors = insights.errors.filter((err: any) => 
          err.error?.code === 'ECONNABORTED' || 
          err.error?.message?.includes('timeout') ||
          err.error?.message?.includes('aborted')
        )
        
        if (timeoutErrors.length > 0) {
          setError(`Some data couldn't be loaded due to timeouts. Showing available data. (${timeoutErrors.length} requests timed out)`)
        } else {
          // Don't set as an error - data is still partially available
          console.log('Some API calls failed but continuing with available data')
        }
      }
    } catch (err: any) {
      let errorMessage = 'Failed to fetch wallet data'
      
      // Handle specific error types
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The address may have too much activity to load quickly. Please try again or try a different address.'
      } else if (err?.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (err?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
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