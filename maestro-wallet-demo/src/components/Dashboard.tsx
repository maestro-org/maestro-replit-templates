import React from 'react'
import { useMaestroApi } from '../hooks/useMaestroApi'
import { useWallet } from '../context/WalletContext'
import { Wallet, Activity, TrendingUp, Coins, AlertTriangle } from 'lucide-react'
import { RuneBalance } from '../types/api'
import BalanceChart from './BalanceChart'
import ActivityList from './ActivityList'
import RuneBalanceCard from './RuneBalanceCard'

const Dashboard: React.FC = () => {
  const { currentAddress } = useWallet()
  const { walletData, loading, error, networkMismatch } = useMaestroApi()

  if (!currentAddress) {
    return null
  }

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading wallet insights...</p>
        </div>
      </div>
    )
  }

  if (error && !walletData) {
    return (
      <div className="dashboard error">
        <div className="error-container">
          <h3>Unable to load wallet data</h3>
          <p>{error}</p>
          <p className="error-suggestion">Please check the address and try again, or switch networks if this is a different network address.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {networkMismatch && (
        <div className="network-warning">
          <AlertTriangle size={20} className="warning-icon" />
          <span>{networkMismatch}</span>
        </div>
      )}
      <div className="dashboard-grid">
        <div className="dashboard-section activity-feed-section">
          <div className="section-header">
            <Activity className="section-icon" />
            <h2>Transaction Activity</h2>
          </div>
          <div className="section-content">
            <ActivityList 
              satoshiActivity={walletData?.satoshis?.data}
              runeActivity={walletData?.runes?.data}
              inscriptionActivity={walletData?.inscriptions?.data}
            />
          </div>
        </div>

        <div className="dashboard-section balance-section">
          <div className="section-header">
            <Wallet className="section-icon" />
            <h2>Balance & Statistics</h2>
          </div>
          <div className="section-content">
            {walletData?.stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">
                    {(parseInt(walletData.stats.data.sat_balance) / 100000000).toFixed(8)} BTC
                  </div>
                  <div className="stat-label">Current Balance</div>
                  <div className="stat-usd">${walletData.stats.data.usd_balance}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{walletData.stats.data.total_txs}</div>
                  <div className="stat-label">Total Transactions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {(walletData.stats.data.total_sat_in_inputs / 100000000).toFixed(8)} BTC
                  </div>
                  <div className="stat-label">Total Received</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {((walletData.stats.data.total_sat_in_inputs - parseInt(walletData.stats.data.sat_balance)) / 100000000).toFixed(8)} BTC
                  </div>
                  <div className="stat-label">Total Sent</div>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>Balance data not available</p>
                <p className="data-hint">This address may not have transaction history on the current network, or the data may not be available at this time.</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section activity-section">
          <div className="section-header">
            <Activity className="section-icon" />
            <h2>Recent Activity</h2>
          </div>
          <div className="section-content">
            {walletData?.stats ? (
              <div className="activity-summary">
                <div className="activity-item">
                  <span className="activity-label">Pending Balance:</span>
                  <span className="activity-value">
                    {(parseInt(walletData.stats.data.pending.sat_balance) / 100000000).toFixed(8)} BTC
                  </span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Pending Transactions:</span>
                  <span className="activity-value">{walletData.stats.data.pending.txs}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Total UTXOs:</span>
                  <span className="activity-value">{walletData.stats.data.total_utxos}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Current Block Height:</span>
                  <span className="activity-value">{walletData.stats.indexer_info.chain_tip.block_height}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Total Inscriptions:</span>
                  <span className="activity-value">{walletData.stats.data.total_inscriptions}</span>
                </div>
                <div className="activity-item">
                  <span className="activity-label">Has Runes:</span>
                  <span className="activity-value">{walletData.stats.data.runes ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ) : (
              <div className="no-data">
                <p>Activity data not available</p>
                <p className="data-hint">This address may not have recent activity on the current network.</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section metaprotocol-section">
          <div className="section-header">
            <Coins className="section-icon" />
            <h2>Metaprotocols</h2>
          </div>
          <div className="section-content">
            <div className="metaprotocol-grid">
              <div className="metaprotocol-card runes-card">
                <h3>Runes</h3>
                <div className="metaprotocol-count">
                  {walletData?.runeBalances?.data?.length || 0} runes
                </div>
                <div className="metaprotocol-details">
                  {walletData?.runeBalances?.data && walletData.runeBalances.data.length > 0 ? (
                    <div className="rune-balances-container">
                      <div className="rune-balances-header">
                        <span>Balance Breakdown:</span>
                      </div>
                      <div className="rune-balances-list">
                        {walletData.runeBalances.data.slice(0, 3).map((rune: RuneBalance, index: number) => (
                          <RuneBalanceCard key={rune.rune_id || index} rune={rune} />
                        ))}
                        {walletData.runeBalances.data.length > 3 && (
                          <div className="rune-more-indicator">
                            +{walletData.runeBalances.data.length - 3} more runes
                          </div>
                        )}
                      </div>
                    </div>
                  ) : walletData?.stats?.data?.runes ? (
                    <span className="rune-indicator">✓ Has Runes (details loading...)</span>
                  ) : (
                    <span className="no-runes">No runes found</span>
                  )}
                </div>
              </div>
              <div className="metaprotocol-card">
                <h3>Inscriptions</h3>
                <div className="metaprotocol-count">
                  {walletData?.inscriptions?.data?.length || 0} activities
                </div>
                <div className="metaprotocol-details">
                  <span>Total: {walletData?.stats?.data?.total_inscriptions || 0}</span>
                  {walletData?.stats?.data?.total_inscriptions === 0 && (
                    <span className="no-inscriptions"> • None found</span>
                  )}
                </div>
              </div>
              <div className="metaprotocol-card">
                <h3>Satoshi Activity</h3>
                <div className="metaprotocol-count">
                  {walletData?.satoshis?.data?.length || 0} activities
                </div>
                <div className="metaprotocol-details">
                  {walletData?.satoshis?.data?.length > 0 ? (
                    <span>Recent activity</span>
                  ) : (
                    <span className="no-activity">No recent activity</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section history-section">
          <div className="section-header">
            <TrendingUp className="section-icon" />
            <h2>Historical Data</h2>
          </div>
          <div className="section-content">
            {walletData?.historicalBalance?.data && walletData.historicalBalance.data.length > 0 ? (
              <>
                <BalanceChart data={walletData.historicalBalance.data} />
                <div className="history-summary">
                  <p>Historical balance data points: {walletData.historicalBalance.data.length}</p>
                  <div className="balance-range">
                    <div className="balance-item">
                      <span className="balance-label">Earliest Record:</span>
                      <span className="balance-value">
                        {new Date(walletData.historicalBalance.data[0].timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="balance-item">
                      <span className="balance-label">Latest Record:</span>
                      <span className="balance-value">
                        {new Date(walletData.historicalBalance.data[walletData.historicalBalance.data.length - 1].timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="balance-item">
                      <span className="balance-label">Latest Balance:</span>
                      <span className="balance-value">
                        {(parseInt(walletData.historicalBalance.data[walletData.historicalBalance.data.length - 1].sat_balance) / 100000000).toFixed(8)} BTC
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>Historical data not available</p>
                <p className="data-hint">This address may not have sufficient transaction history, or the historical data may not be available for this network.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard