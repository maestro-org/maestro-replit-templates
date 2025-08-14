import React, { useState } from 'react'
import { Search } from 'lucide-react'

interface WalletInputProps {
  onAddressSubmit: (address: string) => void
  isLoading?: boolean
}

const WalletInput: React.FC<WalletInputProps> = ({ onAddressSubmit, isLoading = false }) => {
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const validateBitcoinAddress = (addr: string): boolean => {
    // Basic Bitcoin address validation
    if (!addr || addr.length < 26 || addr.length > 62) return false
    
    // Check for common Bitcoin address formats
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy (P2PKH, P2SH)
      /^bc1[a-z0-9]{39,59}$/, // Bech32 (P2WPKH, P2WSH)
      /^tb1[a-z0-9]{39,59}$/, // Testnet Bech32
      /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Testnet Legacy
    ]
    
    return patterns.some(pattern => pattern.test(addr))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const trimmedAddress = address.trim()
    
    if (!trimmedAddress) {
      setError('Please enter a Bitcoin address')
      return
    }
    
    if (!validateBitcoinAddress(trimmedAddress)) {
      setError('Please enter a valid Bitcoin address')
      return
    }
    
    onAddressSubmit(trimmedAddress)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
    if (error) setError('')
  }

  return (
    <div className="wallet-input-container">
      <form onSubmit={handleSubmit} className="wallet-input-form">
        <div className="input-group">
          <input
            type="text"
            value={address}
            onChange={handleInputChange}
            placeholder="Enter Bitcoin address (e.g., bc1q... or 1A1z...)"
            className={`wallet-input ${error ? 'error' : ''}`}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isLoading || !address.trim()}
          >
            <Search size={20} />
            {isLoading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  )
}

export default WalletInput