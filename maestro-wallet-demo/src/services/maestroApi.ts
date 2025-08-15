import axios, { AxiosInstance } from 'axios'
import { ApiConfig, getApiHeaders, getIndexerApiConfig, ENDPOINTS } from '../config/api'
import {
  AddressStatsResponse,
  RuneActivityResponse,
  RuneUtxosResponse,
  RuneInfo,
  InscriptionActivityResponse,
  MetaprotocolActivityResponse,
  SatoshiActivityResponse,
  HistoricalBalanceResponse
} from '../types/api'

export class MaestroApiService {
  private client: AxiosInstance
  private indexerClient: AxiosInstance

  constructor(private config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: getApiHeaders(config.apiKey),
      timeout: 30000 // Increased to 30 seconds
    })

    // Create a separate client for indexer endpoints
    const indexerConfig = getIndexerApiConfig(config.network)
    this.indexerClient = axios.create({
      baseURL: indexerConfig.baseUrl,
      headers: getApiHeaders(indexerConfig.apiKey),
      timeout: 30000 // Increased to 30 seconds
    })
  }

  // Get current network configuration
  getNetworkConfig() {
    return this.config
  }

  // Helper method for retrying failed requests
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 2,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn()
      } catch (error: any) {
        lastError = error
        
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status && error.response.status >= 400 && error.response.status < 500) {
          throw error
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))
      }
    }
    
    throw lastError
  }

  private buildUrl(endpoint: string, address: string): string {
    return endpoint.replace('{address}', address)
  }

  private buildUrlWithParam(endpoint: string, param: string, value: string): string {
    return endpoint.replace(`{${param}}`, value)
  }

  async getAddressStatistics(address: string): Promise<AddressStatsResponse> {
    return this.retryRequest(async () => {
      const url = this.buildUrl(ENDPOINTS.ADDRESS_STATS, address)
      const response = await this.client.get<AddressStatsResponse>(url)
      return response.data
    })
  }

  async getRuneActivity(address: string, limit?: number): Promise<RuneActivityResponse> {
    return this.retryRequest(async () => {
      const url = this.buildUrl(ENDPOINTS.RUNE_ACTIVITY, address)
      const params = limit ? { limit } : {}
      const response = await this.client.get<RuneActivityResponse>(url, { params })
      return response.data
    })
  }

  async getRuneUtxos(address: string): Promise<RuneUtxosResponse> {
    const url = this.buildUrl(ENDPOINTS.RUNE_UTXOS, address)
    const response = await this.indexerClient.get<RuneUtxosResponse>(url)
    return response.data
  }

  async getRuneInfo(runeId: string): Promise<RuneInfo> {
    const url = this.buildUrlWithParam(ENDPOINTS.RUNE_INFO, 'rune_id', runeId)
    const response = await this.indexerClient.get<{ data: RuneInfo }>(url)
    return response.data.data // Extract the nested data object
  }

  // Helper method to process rune UTXOs into aggregated balances with metadata
  async processRuneBalances(runeUtxos: RuneUtxosResponse) {
    if (!runeUtxos?.data || runeUtxos.data.length === 0) {
      return []
    }

    // Aggregate balances by rune ID
    const balanceMap = new Map<string, bigint>()
    const runeIds = new Set<string>()

    for (const utxo of runeUtxos.data) {
      for (const rune of utxo.runes) {
        try {
          const currentBalance = balanceMap.get(rune.rune_id) || 0n
          // Convert decimal string to integer by parsing as float and converting to integer
          const amountStr = String(rune.amount)
          const amountFloat = parseFloat(amountStr)
          // Convert to the smallest unit (multiply by 100000000 to handle 8 decimal places)
          // Convert to the smallest unit (multiply by RUNE_DECIMAL_PRECISION to handle 8 decimal places)
          const amountInteger = Math.round(amountFloat * RUNE_DECIMAL_PRECISION)
          balanceMap.set(rune.rune_id, currentBalance + BigInt(amountInteger))
          runeIds.add(rune.rune_id)
        } catch (error) {
          console.error(`Error processing rune ${rune.rune_id} with amount ${rune.amount}:`, error)
          // Continue processing other runes
        }
      }
    }

    // Fetch metadata for all runes
    const runeInfoPromises = Array.from(runeIds).map(async (runeId) => {
      try {
        const info = await this.getRuneInfo(runeId)
        return { runeId, info }
      } catch (error) {
        console.warn(`Failed to fetch info for rune ${runeId}:`, error)
        return { runeId, info: null }
      }
    })

    const runeInfoResults = await Promise.allSettled(runeInfoPromises)
    const runeInfoMap = new Map<string, RuneInfo | null>()

    runeInfoResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        runeInfoMap.set(result.value.runeId, result.value.info)
      }
    })

    // Create processed rune balances
    const processedBalances = []
    for (const [runeId, balance] of balanceMap.entries()) {
      const info = runeInfoMap.get(runeId)
      
      // Use spaced_name for display, fallback to name, then runeId
      const displayName = info?.spaced_name || info?.name || runeId
      
      // Extract symbol directly from the API response
      let symbol = '?'
      if (info?.symbol) {
        symbol = info.symbol
      } else if (displayName && displayName !== runeId) {
        // Use first 3 characters of display name as fallback only if no symbol
        symbol = displayName.substring(0, 3).toUpperCase()
      }
      
      processedBalances.push({
        rune_id: runeId,
        rune_name: displayName,
        rune_symbol: symbol,
        balance: balance.toString(),
        divisibility: info?.divisibility || 0,
        spacers: 0, // This would need to be parsed from spaced_name if needed
        premine: info?.premine,
        height: info?.etching_height,
        usd_balance: undefined // USD pricing would require additional API calls
      })
    }

    return processedBalances
  }

  async getInscriptionActivity(address: string, limit?: number): Promise<InscriptionActivityResponse> {
    const url = this.buildUrl(ENDPOINTS.INSCRIPTION_ACTIVITY, address)
    const params = limit ? { limit } : {}
    const response = await this.client.get<InscriptionActivityResponse>(url, { params })
    return response.data
  }

  async getMetaprotocolActivity(address: string, limit?: number): Promise<MetaprotocolActivityResponse> {
    const url = this.buildUrl(ENDPOINTS.METAPROTOCOL_ACTIVITY, address)
    const params = limit ? { limit } : {}
    const response = await this.client.get<MetaprotocolActivityResponse>(url, { params })
    return response.data
  }

  async getSatoshiActivity(address: string, limit?: number): Promise<SatoshiActivityResponse> {
    const url = this.buildUrl(ENDPOINTS.SATOSHI_ACTIVITY, address)
    const params = limit ? { limit } : {}
    const response = await this.client.get<SatoshiActivityResponse>(url, { params })
    return response.data
  }

  async getHistoricalBalance(address: string, from?: string, to?: string): Promise<HistoricalBalanceResponse> {
    const url = this.buildUrl(ENDPOINTS.HISTORICAL_BALANCE, address)
    const params: any = {
      order: 'desc', // Sort by descending order (newest first)
      height_params: 'false' // Use timestamp parameters instead of block height
    }
    if (from) params.from = from
    if (to) params.to = to
    const response = await this.client.get<HistoricalBalanceResponse>(url, { params })
    return response.data
  }

  // Helper method to get all wallet insights
  async getWalletInsights(address: string): Promise<any> {
    try {
      // Calculate date range for the last 3 days
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      // Convert dates to Unix timestamps (seconds)
      const fromTimestamp = Math.floor(threeDaysAgo.getTime() / 1000).toString();
      const toTimestamp = Math.floor(now.getTime() / 1000).toString();

      const [stats, runes, runeUtxos, inscriptions, metaprotocols, satoshis, historicalBalance] = await Promise.allSettled([
        this.getAddressStatistics(address),
        this.getRuneActivity(address),
        this.getRuneUtxos(address),
        this.getInscriptionActivity(address),
        this.getMetaprotocolActivity(address),
        this.getSatoshiActivity(address),
        this.getHistoricalBalance(address, fromTimestamp, toTimestamp)
      ]);

      // Process rune balances if UTXOs were fetched successfully
      let processedRuneBalances = null
      if (runeUtxos.status === 'fulfilled' && runeUtxos.value) {
        try {
          processedRuneBalances = await this.processRuneBalances(runeUtxos.value)
        } catch (error) {
          console.warn('Failed to process rune balances:', error)
        }
      }

      return {
        stats: stats.status === 'fulfilled' ? stats.value : null,
        runes: runes.status === 'fulfilled' ? runes.value : null,
        runeUtxos: runeUtxos.status === 'fulfilled' ? runeUtxos.value : null,
        runeBalances: processedRuneBalances ? { data: processedRuneBalances } : null,
        inscriptions: inscriptions.status === 'fulfilled' ? inscriptions.value : null,
        metaprotocols: metaprotocols.status === 'fulfilled' ? metaprotocols.value : null,
        satoshis: satoshis.status === 'fulfilled' ? satoshis.value : null,
        historicalBalance: historicalBalance.status === 'fulfilled' ? historicalBalance.value : null,
        errors: [
          stats.status === 'rejected' ? { type: 'stats', error: stats.reason } : null,
          runes.status === 'rejected' ? { type: 'runes', error: runes.reason } : null,
          runeUtxos.status === 'rejected' ? { type: 'runeUtxos', error: runeUtxos.reason } : null,
          inscriptions.status === 'rejected' ? { type: 'inscriptions', error: inscriptions.reason } : null,
          metaprotocols.status === 'rejected' ? { type: 'metaprotocols', error: metaprotocols.reason } : null,
          satoshis.status === 'rejected' ? { type: 'satoshis', error: satoshis.reason } : null,
          historicalBalance.status === 'rejected' ? { type: 'historicalBalance', error: historicalBalance.reason } : null,
        ].filter(Boolean)
      }
    } catch (error) {
      throw new Error(`Failed to fetch wallet insights: ${error}`)
    }
  }
}