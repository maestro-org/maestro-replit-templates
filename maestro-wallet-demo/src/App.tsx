import React, { useState } from 'react'
import './App.css'
import { NetworkProvider } from './context/NetworkContext'
import { WalletProvider, useWallet } from './context/WalletContext'
import { WalletMonitoringProvider } from './context/WalletMonitoringContext'
import NetworkToggle from './components/NetworkToggle'
import WalletInput from './components/WalletInput'
import Dashboard from './components/Dashboard'
import WalletMonitoring from './components/WalletMonitoring'

type TabType = 'insights' | 'monitoring'

const AppContent: React.FC = () => {
  const { setCurrentAddress, setIsLoading, setError, isLoading, currentAddress } = useWallet()
  const [activeTab, setActiveTab] = useState<TabType>('insights')

  const handleAddressSubmit = async (address: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      setCurrentAddress(address)
      // API calls will be handled by individual components
    } catch (err) {
      setError('Failed to analyze wallet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Maestro Bitcoin Wallet Demo</h1>
          <p className="header-subtitle">Explore our Bitcoin analytics and event monitoring APIs</p>
          <NetworkToggle />
        </div>
      </header>
      
      <div className="main-content">
        <WalletInput 
          onAddressSubmit={handleAddressSubmit} 
          isLoading={isLoading}
        />
        
        {currentAddress && (
          <div className="current-wallet">
            <p>Analyzing: <code>{currentAddress}</code></p>
          </div>
        )}
        
        {!currentAddress && (
          <div className="intro-section">
            <h2>Bitcoin Wallet Analytics & Monitoring</h2>
            <p className="intro-text">
              Enter a Bitcoin address to explore our powerful analytics and real-time monitoring capabilities:
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <h3>📊 Wallet Insights</h3>
                <p>View balance history, transaction activity, and detailed analytics</p>
              </div>
              <div className="feature-card">
                <h3>🔔 Event Monitoring</h3>
                <p>Set up real-time webhooks for balance changes and transactions</p>
              </div>
            </div>
          </div>
        )}
        
        {currentAddress && (
          <>
            <nav className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                📊 Wallet Insights
              </button>
              <button 
                className={`tab-button ${activeTab === 'monitoring' ? 'active' : ''}`}
                onClick={() => setActiveTab('monitoring')}
              >
                🔔 Event Monitoring
              </button>
            </nav>
            
            <div className="tab-content">
              {activeTab === 'insights' && <Dashboard />}
              {activeTab === 'monitoring' && <WalletMonitoring />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <NetworkProvider>
      <WalletProvider>
        <WalletMonitoringProvider>
          <AppContent />
        </WalletMonitoringProvider>
      </WalletProvider>
    </NetworkProvider>
  )
}

export default App