import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { EventManagerApi, Trigger, EventLog, createWalletBalanceMonitoringTrigger } from '../services/eventManagerApi'
import { useNetwork } from './NetworkContext'
import { getEventManagerConfig } from '../config/api'

interface WalletMonitoringContextType {
  triggers: Trigger[]
  eventLogs: EventLog[]
  isMonitoring: boolean
  isLoading: boolean
  error: string | null
  createMonitoringTrigger: (address: string, webhookUrl: string, confirmations?: number) => Promise<Trigger>
  deleteTrigger: (triggerId: string) => Promise<void>
  toggleTrigger: (triggerId: string, status: 'active' | 'paused') => Promise<void>
  refreshTriggers: () => Promise<void>
  refreshEventLogs: (triggerId?: string) => Promise<void>
  getTriggersForAddress: (address: string) => Trigger[]
}

const WalletMonitoringContext = createContext<WalletMonitoringContextType | undefined>(undefined)

export const useWalletMonitoring = (): WalletMonitoringContextType => {
  const context = useContext(WalletMonitoringContext)
  if (!context) {
    throw new Error('useWalletMonitoring must be used within a WalletMonitoringProvider')
  }
  return context
}

interface WalletMonitoringProviderProps {
  children: ReactNode
}

export const WalletMonitoringProvider: React.FC<WalletMonitoringProviderProps> = ({ children }) => {
  const [triggers, setTriggers] = useState<Trigger[]>([])
  const [eventLogs, setEventLogs] = useState<EventLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { network } = useNetwork()

  const getEventManagerApi = useCallback(() => {
    const config = getEventManagerConfig(network)
    return new EventManagerApi(network, config.apiKey)
  }, [network])

  const createMonitoringTrigger = useCallback(async (
    address: string,
    webhookUrl: string,
    confirmations: number = 1
  ): Promise<Trigger> => {
    setIsLoading(true)
    setError(null)

    try {
      const api = getEventManagerApi()
      const triggerRequest = createWalletBalanceMonitoringTrigger(address, network, webhookUrl, confirmations)
      const newTrigger = await api.createTrigger(triggerRequest)
      
      setTriggers(prev => [...prev, newTrigger])
      return newTrigger
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create monitoring trigger'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [network, getEventManagerApi])

  const deleteTrigger = useCallback(async (triggerId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const api = getEventManagerApi()
      await api.deleteTrigger(triggerId)
      
      setTriggers(prev => prev.filter(trigger => trigger.id !== triggerId))
      setEventLogs(prev => prev.filter(log => log.trigger_id !== triggerId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trigger'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getEventManagerApi])

  const toggleTrigger = useCallback(async (triggerId: string, status: 'active' | 'paused'): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const api = getEventManagerApi()
      
      // First get the current trigger data
      const currentTrigger = await api.getTrigger(triggerId)
      
      // Update with all required fields
      const updatedTrigger = await api.updateTrigger(triggerId, {
        name: currentTrigger.name,
        chain: currentTrigger.chain,
        network: currentTrigger.network,
        type: currentTrigger.type,
        webhook_url: currentTrigger.webhook_url,
        filters: currentTrigger.filters,
        confirmations: currentTrigger.confirmations,
        status
      })
      
      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId ? updatedTrigger : trigger
      ))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trigger'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getEventManagerApi])

  const refreshTriggers = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const api = getEventManagerApi()
      const triggerList = await api.listTriggers()
      setTriggers(Array.isArray(triggerList) ? triggerList : [])
    } catch (err) {
      // Don't show error for 404 when no triggers exist - this is expected
      if (err instanceof Error && err.message.includes('404')) {
        setTriggers([])
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh triggers'
        setError(errorMessage)
        setTriggers([]) // Ensure we always have an array
      }
    } finally {
      setIsLoading(false)
    }
  }, [getEventManagerApi])

  const refreshEventLogs = useCallback(async (triggerId?: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const api = getEventManagerApi()
      const logs = await api.listEventLogs({
        page: 1,
        trigger_id: triggerId,
        limit: 50,
        chain: 'bitcoin',
        network
      })
      setEventLogs(Array.isArray(logs) ? logs : [])
    } catch (err) {
      // Don't show error for 404 when no triggers exist - this is expected
      if (err instanceof Error && err.message.includes('404')) {
        setEventLogs([])
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to refresh event logs'
        setError(errorMessage)
        setEventLogs([]) // Ensure we always have an array
      }
    } finally {
      setIsLoading(false)
    }
  }, [network, getEventManagerApi])

  const getTriggersForAddress = useCallback((address: string): Trigger[] => {
    return (triggers || []).filter(trigger => 
      trigger.filters.some(filter => 
        (filter.key === 'sender' || filter.key === 'receiver' || filter.key === 'sender_or_receiver') &&
        filter.value === address
      )
    )
  }, [triggers])

  useEffect(() => {
    refreshTriggers()
  }, [refreshTriggers])

  const isMonitoring = (triggers || []).some(trigger => trigger.status === 'active')

  const value: WalletMonitoringContextType = {
    triggers,
    eventLogs,
    isMonitoring,
    isLoading,
    error,
    createMonitoringTrigger,
    deleteTrigger,
    toggleTrigger,
    refreshTriggers,
    refreshEventLogs,
    getTriggersForAddress
  }

  return (
    <WalletMonitoringContext.Provider value={value}>
      {children}
    </WalletMonitoringContext.Provider>
  )
}