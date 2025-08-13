import React, { useState, useEffect } from 'react'
import { Bell, BellOff, Plus, Trash2, Play, Pause, RefreshCw, ExternalLink } from 'lucide-react'
import { useWalletMonitoring } from '../context/WalletMonitoringContext'
import { useWallet } from '../context/WalletContext'
import { Trigger, EventLog } from '../services/eventManagerApi'

interface CreateTriggerModalProps {
  isOpen: boolean
  onClose: () => void
  address: string
}

const CreateTriggerModal: React.FC<CreateTriggerModalProps> = ({ isOpen, onClose, address }) => {
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/your-endpoint')
  const [confirmations, setConfirmations] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const { createMonitoringTrigger } = useWalletMonitoring()

  const handleCreate = async () => {
    if (!webhookUrl.trim()) return

    setIsCreating(true)
    try {
      await createMonitoringTrigger(address, webhookUrl.trim(), confirmations)
      onClose()
      setWebhookUrl('https://webhook.site/your-endpoint')
      setConfirmations(1)
    } catch (error) {
      console.error('Failed to create trigger:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Create Wallet Monitor</h3>
        <p>Monitor balance changes for: <code>{address}</code></p>
        
        <div className="form-group">
          <label>Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://your-webhook-endpoint.com"
            className="form-input"
          />
          <small>Where to send notifications when transactions occur</small>
        </div>

        <div className="form-group">
          <label>Confirmations Required</label>
          <input
            type="number"
            min="0"
            max="6"
            value={confirmations}
            onChange={e => setConfirmations(parseInt(e.target.value) || 1)}
            className="form-input"
          />
          <small>Number of confirmations before triggering (0-6)</small>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary" disabled={isCreating}>
            Cancel
          </button>
          <button 
            onClick={handleCreate} 
            className="btn-primary" 
            disabled={isCreating || !webhookUrl.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Monitor'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface TriggerCardProps {
  trigger: Trigger
  onDelete: (id: string) => void
  onToggle: (id: string, status: 'active' | 'paused') => void
  onViewLogs: (triggerId: string) => void
}

const TriggerCard: React.FC<TriggerCardProps> = ({ trigger, onDelete, onToggle, onViewLogs }) => {
  const isActive = trigger.status === 'active'
  const addressFilter = trigger.filters.find(f => 
    f.key === 'sender' || f.key === 'receiver' || f.key === 'sender_or_receiver'
  )

  return (
    <div className={`trigger-card ${isActive ? 'active' : 'paused'}`}>
      <div className="trigger-header">
        <div className="trigger-info">
          <div className="trigger-name">{trigger.name}</div>
          <div className="trigger-address">
            {addressFilter?.value || 'No address filter'}
          </div>
          <div className="trigger-stats">
            {trigger.event_count} events • {trigger.confirmations} confirmations
          </div>
        </div>
        <div className="trigger-status">
          {isActive ? (
            <Bell className="status-icon active" size={16} />
          ) : (
            <BellOff className="status-icon paused" size={16} />
          )}
          <span className={`status-text ${trigger.status}`}>
            {trigger.status}
          </span>
        </div>
      </div>

      <div className="trigger-webhook">
        <span>Webhook: </span>
        <a 
          href={trigger.webhook_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="webhook-link"
        >
          {trigger.webhook_url.replace(/^https?:\/\//, '')}
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="trigger-actions">
        <button
          onClick={() => onToggle(trigger.id, isActive ? 'paused' : 'active')}
          className={`btn-toggle ${isActive ? 'pause' : 'play'}`}
          title={isActive ? 'Pause monitoring' : 'Resume monitoring'}
        >
          {isActive ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={() => onViewLogs(trigger.id)}
          className="btn-logs"
          title="View event logs"
        >
          View Logs
        </button>
        <button
          onClick={() => onDelete(trigger.id)}
          className="btn-delete"
          title="Delete trigger"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

interface EventLogsModalProps {
  isOpen: boolean
  onClose: () => void
  triggerId: string
  logs: EventLog[]
}

const EventLogsModal: React.FC<EventLogsModalProps> = ({ isOpen, onClose, triggerId, logs }) => {
  if (!isOpen) return null

  const triggerLogs = logs.filter(log => log.trigger_id === triggerId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content logs-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Event Logs</h3>
          <button onClick={onClose} className="btn-close">×</button>
        </div>
        
        <div className="logs-container">
          {triggerLogs.length === 0 ? (
            <div className="no-logs">No events logged yet</div>
          ) : (
            triggerLogs.map(log => (
              <div key={log.id} className="log-entry">
                <div className="log-header">
                  <span className={`log-status ${log.status}`}>{log.status}</span>
                  <span className="log-response-status">HTTP {log.response_status}</span>
                </div>
                <div className="log-payload">
                  <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                </div>
                {log.response && (
                  <div className="log-response">
                    <strong>Response:</strong>
                    <div>{log.response}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const WalletMonitoring: React.FC = () => {
  const { currentAddress } = useWallet()
  const {
    triggers,
    eventLogs,
    isMonitoring,
    isLoading,
    error,
    deleteTrigger,
    toggleTrigger,
    refreshTriggers,
    refreshEventLogs,
    getTriggersForAddress
  } = useWalletMonitoring()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [selectedTriggerId, setSelectedTriggerId] = useState<string>('')

  useEffect(() => {
    if (currentAddress) {
      refreshEventLogs()
    }
  }, [currentAddress, refreshEventLogs])

  const handleDelete = async (triggerId: string) => {
    if (confirm('Are you sure you want to delete this monitoring trigger?')) {
      try {
        await deleteTrigger(triggerId)
      } catch (error) {
        console.error('Failed to delete trigger:', error)
      }
    }
  }

  const handleToggle = async (triggerId: string, status: 'active' | 'paused') => {
    try {
      await toggleTrigger(triggerId, status)
    } catch (error) {
      console.error('Failed to toggle trigger:', error)
    }
  }

  const handleViewLogs = async (triggerId: string) => {
    setSelectedTriggerId(triggerId)
    await refreshEventLogs(triggerId)
    setShowLogsModal(true)
  }

  const addressTriggers = currentAddress ? getTriggersForAddress(currentAddress) : []

  if (!currentAddress) {
    return (
      <div className="monitoring-container">
        <div className="monitoring-placeholder">
          <Bell size={48} className="placeholder-icon" />
          <h3>Wallet Monitoring</h3>
          <p>Enter a Bitcoin address to set up monitoring for balance changes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="monitoring-container">
      <div className="monitoring-header">
        <div className="header-info">
          <h2>
            <Bell size={24} />
            Wallet Monitoring
          </h2>
          <p>Monitor real-time balance changes for {currentAddress}</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => refreshTriggers()}
            className="btn-refresh"
            disabled={isLoading}
            title="Refresh triggers"
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            disabled={isLoading}
          >
            <Plus size={16} />
            Create Monitor
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

      <div className="monitoring-status">
        <div className={`status-indicator ${isMonitoring ? 'active' : 'inactive'}`}>
          {isMonitoring ? (
            <>
              <Bell size={16} />
              <span>Monitoring Active</span>
            </>
          ) : (
            <>
              <BellOff size={16} />
              <span>No Active Monitors</span>
            </>
          )}
        </div>
        <div className="trigger-count">
          {addressTriggers.length} trigger{addressTriggers.length !== 1 ? 's' : ''} for this address
        </div>
      </div>

      {addressTriggers.length === 0 && (
        <div className="info-banner">
          <strong>Get Started:</strong> Create your first monitoring trigger to receive real-time webhook notifications when this wallet sends or receives Bitcoin transactions.
        </div>
      )}

      <div className="triggers-list">
        {addressTriggers.length === 0 ? (
          <div className="no-triggers">
            <p>No monitoring triggers set up for this address.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Monitor
            </button>
          </div>
        ) : (
          addressTriggers.map(trigger => (
            <TriggerCard
              key={trigger.id}
              trigger={trigger}
              onDelete={handleDelete}
              onToggle={handleToggle}
              onViewLogs={handleViewLogs}
            />
          ))
        )}
      </div>

      <CreateTriggerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        address={currentAddress}
      />

      <EventLogsModal
        isOpen={showLogsModal}
        onClose={() => setShowLogsModal(false)}
        triggerId={selectedTriggerId}
        logs={eventLogs}
      />
    </div>
  )
}

export default WalletMonitoring