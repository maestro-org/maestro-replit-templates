import { getApiHeaders, getEventManagerConfig } from '../config/api'
import { Network } from '../config/api'

export interface Filter {
  key: 'sender' | 'receiver' | 'sender_or_receiver' | 'transaction_id' | 'total_input_volume' | 'fee' | 'size' | 'weight'
  operator: '=' | '>' | '>=' | '<' | '<='
  value: string
}

export interface CreateTriggerRequest {
  name: string
  chain: 'bitcoin'
  network: Network
  type: 'transaction'
  webhook_url: string
  filters: Filter[]
  confirmations?: number
}

export interface UpdateTriggerRequest {
  name: string
  chain: 'bitcoin'
  network: Network
  type: 'transaction'
  webhook_url: string
  filters: Filter[]
  confirmations?: number
  status?: 'active' | 'paused'
}

export interface Trigger {
  id: string
  name: string
  chain: 'bitcoin'
  network: Network
  type: 'transaction'
  webhook_url: string
  filters: Filter[]
  status: 'active' | 'paused'
  event_count: number | string
  confirmations: number
}

export interface EventLog {
  id: string
  trigger_id: string
  payload: any
  response: string
  response_status: number
  status: string
}

export class EventManagerApi {
  private baseUrl: string
  private apiKey: string

  constructor(network: Network, apiKey: string) {
    const config = getEventManagerConfig(network)
    this.baseUrl = config.baseUrl
    this.apiKey = apiKey
  }

  private getHeaders() {
    return getApiHeaders(this.apiKey)
  }

  async createTrigger(request: CreateTriggerRequest): Promise<Trigger> {
    const response = await fetch(`${this.baseUrl}/triggers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create trigger: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return result.data
  }

  async listTriggers(): Promise<Trigger[]> {
    const response = await fetch(`${this.baseUrl}/triggers`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to list triggers: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return Array.isArray(result.data) ? result.data : []
  }

  async getTrigger(id: string): Promise<Trigger> {
    const response = await fetch(`${this.baseUrl}/triggers/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get trigger: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return result.data
  }

  async updateTrigger(id: string, updates: UpdateTriggerRequest): Promise<Trigger> {
    const response = await fetch(`${this.baseUrl}/triggers/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to update trigger: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return result.data
  }

  async deleteTrigger(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/triggers/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete trigger: ${response.status} ${errorText}`)
    }
  }

  async listEventLogs(params?: {
    page?: number
    limit?: number
    trigger_id?: string
    chain?: string
    network?: string
  }): Promise<EventLog[]> {
    const searchParams = new URLSearchParams()
    // Ensure page is always at least 1
    const page = params?.page && params.page >= 1 ? params.page : 1
    searchParams.append('page', page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.trigger_id) searchParams.append('trigger_id', params.trigger_id)
    if (params?.chain) searchParams.append('chain', params.chain)
    if (params?.network) searchParams.append('network', params.network)

    const url = `${this.baseUrl}/logs${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to list event logs: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return Array.isArray(result.data) ? result.data : []
  }

  async getEventLog(id: string): Promise<EventLog> {
    const response = await fetch(`${this.baseUrl}/logs/${id}`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to get event log: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return result.data
  }
}

export const createWalletBalanceMonitoringTrigger = (
  address: string,
  network: Network,
  webhookUrl: string,
  confirmations: number = 1
): CreateTriggerRequest => {
  return {
    name: `Balance Monitor - ${address.slice(0, 8)}...${address.slice(-8)}`,
    chain: 'bitcoin',
    network,
    type: 'transaction',
    webhook_url: webhookUrl,
    filters: [
      {
        key: 'sender_or_receiver',
        operator: '=',
        value: address
      }
    ],
    confirmations
  }
}