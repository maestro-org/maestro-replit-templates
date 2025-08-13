import axios, { AxiosInstance } from 'axios'
import { ApiConfig, IndexerApiConfig, getApiHeaders, getIndexerApiConfig, ENDPOINTS } from '../config/api'
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
      timeout: 10000
    })

    // Create a separate client for indexer endpoints
    const indexerConfig = getIndexerApiConfig(config.network)
    this.indexerClient = axios.create({
      baseURL: indexerConfig.baseUrl,
      headers: getApiHeaders(indexerConfig.apiKey),
      timeout: 10000
    })
  }

  private buildUrl(endpoint: string, address: string): string {
    return endpoint.replace('{address}', address)
  }

  private buildUrlWithParam(endpoint: string, param: string, value: string): string {
    return endpoint.replace(`{${param}}`, value)
  }

  async getAddressStatistics(address: string): Promise<AddressStatsResponse> {
    const url = this.buildUrl(ENDPOINTS.ADDRESS_STATS, address)
    const response = await this.client.get<AddressStatsResponse>(url)
    return response.data
  }

  async getRuneActivity(address: string, limit?: number): Promise<RuneActivityResponse> {
    const url = this.buildUrl(ENDPOINTS.RUNE_ACTIVITY, address)
    const params = limit ? { limit } : {}
    const response = await this.client.get<RuneActivityResponse>(url, { params })
    return response.data
  }

  async getRuneUtxos(address: string): Promise<RuneUtxosResponse> {
    const url = this.buildUrl(ENDPOINTS.RUNE_UTXOS, address)
    const response = await this.indexerClient.get<RuneUtxosResponse>(url)
    return response.data
  }

  async getRuneInfo(runeId: string): Promise<RuneInfo> {
    const url = this.buildUrlWithParam(ENDPOINTS.RUNE_INFO, 'rune_id', runeId)
    const response = await this.indexerClient.get<RuneInfo>(url)
    return response.data
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
        const currentBalance = balanceMap.get(rune.rune_id) || 0n
        balanceMap.set(rune.rune_id, currentBalance + BigInt(rune.amount))
        runeIds.add(rune.rune_id)
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
      if (result.status === 'fulfilled') {
        runeInfoMap.set(result.value.runeId, result.value.info)
      }
    })

    // Create processed rune balances
    const processedBalances = []
    for (const [runeId, balance] of balanceMap.entries()) {
      const info = runeInfoMap.get(runeId)
      processedBalances.push({
        rune_id: runeId,
        rune_name: info?.name || runeId,
        rune_symbol: info?.symbol || '?',
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
    const params: any = {}
    if (from) params.from = from
    if (to) params.to = to
    const response = await this.client.get<HistoricalBalanceResponse>(url, { params })
    return response.data
  }

  // Helper method to get all wallet insights
  async getWalletInsights(address: string) {
    try {
      const [
        stats,
        runes,
        runeUtxos,
        inscriptions,
        metaprotocols,
        satoshis,
        historicalBalance
      ] = await Promise.allSettled([
        this.getAddressStatistics(address),
        this.getRuneActivity(address, 10),
        this.getRuneUtxos(address),
        this.getInscriptionActivity(address, 10),
        this.getMetaprotocolActivity(address, 10),
        this.getSatoshiActivity(address, 10),
        this.getHistoricalBalance(address)
      ])

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