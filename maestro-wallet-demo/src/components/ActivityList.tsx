import React from 'react'
import { ExternalLink, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext'
import { getMaestroExplorerTxUrl } from '../utils/explorer'

interface ActivityListProps {
  satoshiActivity?: any[]
  runeActivity?: any[]
  inscriptionActivity?: any[]
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  satoshiActivity = [], 
  runeActivity = [], 
  inscriptionActivity = [] 
}) => {
  const { network } = useNetwork()

  // Combine all activities and sort by most recent
  const allActivities = [
    ...satoshiActivity.map(activity => ({ ...activity, type: 'satoshi' })),
    ...runeActivity.map(activity => ({ ...activity, type: 'rune' })),
    ...inscriptionActivity.map(activity => ({ ...activity, type: 'inscription' }))
  ].sort((a, b) => b.height - a.height).slice(0, 10)

  const getActivityIcon = (activity: any) => {
    if (activity.type === 'satoshi' && activity.sat_activity) {
      switch (activity.sat_activity.kind) {
        case 'increase': return <TrendingUp className="activity-icon increase" size={16} />
        case 'decrease': return <TrendingDown className="activity-icon decrease" size={16} />
        case 'self_transfer': return <ArrowRightLeft className="activity-icon transfer" size={16} />
        default: return <ArrowRightLeft className="activity-icon" size={16} />
      }
    }
    return <ArrowRightLeft className="activity-icon" size={16} />
  }

  const getActivityDescription = (activity: any) => {
    if (activity.type === 'satoshi' && activity.sat_activity) {
      const amount = (parseInt(activity.sat_activity.amount) / 100000000).toFixed(8)
      const kind = activity.sat_activity.kind
      return `${kind === 'increase' ? '+' : kind === 'decrease' ? '-' : ''}${amount} BTC`
    } else if (activity.type === 'rune' && activity.rune_activity) {
      const runes = activity.rune_activity
      if (runes.increased_balances?.length > 0) {
        return `Received ${runes.increased_balances.length} rune(s)`
      } else if (runes.decreased_balances?.length > 0) {
        return `Sent ${runes.decreased_balances.length} rune(s)`
      }
      return 'Rune activity'
    } else if (activity.type === 'inscription' && activity.inscription_activity) {
      const inscriptions = activity.inscription_activity
      if (inscriptions.received?.length > 0) {
        return `Received ${inscriptions.received.length} inscription(s)`
      } else if (inscriptions.sent?.length > 0) {
        return `Sent ${inscriptions.sent.length} inscription(s)`
      }
      return 'Inscription activity'
    }
    return 'Activity'
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  return (
    <div className="activity-list">
      <h3>Recent Activity</h3>
      {allActivities.length > 0 ? (
        <div className="activity-items">
          {allActivities.map((activity, index) => (
            <div key={`${activity.tx_hash}-${index}`} className="activity-item-card">
              <div className="activity-main">
                <div className="activity-info">
                  {getActivityIcon(activity)}
                  <div className="activity-details">
                    <div className="activity-description">
                      {getActivityDescription(activity)}
                    </div>
                    <div className="activity-meta">
                      <span className="activity-hash">
                        {truncateHash(activity.tx_hash)}
                      </span>
                      <span className="activity-status">
                        {activity.mempool ? (
                          <span className="mempool-badge">Mempool</span>
                        ) : (
                          <span className="confirmed-badge">{activity.confirmations} conf</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.open(getMaestroExplorerTxUrl(activity.tx_hash, network), '_blank')}
                  className="view-tx-button"
                  title="View on Maestro Explorer"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              <div className="activity-type-badge">
                {activity.type}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-activity">No recent activity</div>
      )}
    </div>
  )
}

export default ActivityList