import React from 'react'
import { useNetwork } from '../context/NetworkContext'

const NetworkToggle: React.FC = () => {
  const { network, toggleNetwork } = useNetwork()

  return (
    <div className="network-toggle">
      <span className="network-label">Network:</span>
      <button 
        onClick={toggleNetwork}
        className={`network-button ${network}`}
        title={`Switch to ${network === 'mainnet' ? 'testnet' : 'mainnet'}`}
      >
        {network === 'mainnet' ? '🟠 Mainnet' : '🔵 Testnet'}
      </button>
    </div>
  )
}

export default NetworkToggle