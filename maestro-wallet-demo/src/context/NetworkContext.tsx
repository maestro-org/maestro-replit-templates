import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Network, getApiConfig, ApiConfig, DEFAULT_NETWORK } from '../config/api'

interface NetworkContextType {
  network: Network
  apiConfig: ApiConfig
  toggleNetwork: () => void
  setNetwork: (network: Network) => void
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}

interface NetworkProviderProps {
  children: ReactNode
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [network, setNetworkState] = useState<Network>(DEFAULT_NETWORK)
  const [apiConfig, setApiConfig] = useState<ApiConfig>(getApiConfig(DEFAULT_NETWORK))

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork)
    setApiConfig(getApiConfig(newNetwork))
  }

  const toggleNetwork = () => {
    const newNetwork = network === 'mainnet' ? 'testnet' : 'mainnet'
    setNetwork(newNetwork)
  }

  return (
    <NetworkContext.Provider value={{
      network,
      apiConfig,
      toggleNetwork,
      setNetwork
    }}>
      {children}
    </NetworkContext.Provider>
  )
}