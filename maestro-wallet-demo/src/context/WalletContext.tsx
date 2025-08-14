import React, { createContext, useContext, useState, ReactNode } from 'react'

interface WalletContextType {
  currentAddress: string | null
  isLoading: boolean
  error: string | null
  setCurrentAddress: (address: string | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <WalletContext.Provider value={{
      currentAddress,
      isLoading,
      error,
      setCurrentAddress,
      setIsLoading,
      setError
    }}>
      {children}
    </WalletContext.Provider>
  )
}