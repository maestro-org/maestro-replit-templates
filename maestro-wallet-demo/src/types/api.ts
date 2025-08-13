// Address Statistics Response
export interface AddressStatsResponse {
  data: {
    sat_balance: string
    usd_balance: string
    total_txs: number
    total_inputs: number
    total_outputs: number
    total_sat_in_inputs: number
    total_sat_in_outputs: number
    total_utxos: number
    total_inscriptions: number
    runes: boolean
    pending: {
      txs: number
      inputs: number
      outputs: number
      sat_in_inputs: number
      sat_in_outputs: number
      utxos: number
      sat_balance: string
      usd_balance: string
    }
  }
  indexer_info: {
    chain_tip: {
      block_hash: string
      block_height: number
    }
    estimated_blocks?: Array<{
      block_height: number
      sats_per_vb: {
        min: number
        median: number
        max: number
      }
    }>
    mempool_timestamp: string
  }
}

// Rune Activity Response
export interface RuneActivityResponse {
  data: RuneActivity[]
  indexer_info: {
    chain_tip: {
      block_hash: string
      block_height: number
    }
    estimated_blocks?: Array<{
      block_height: number
      sats_per_vb: {
        min: number
        median: number
        max: number
      }
    }>
    mempool_timestamp: string
  }
  next_cursor?: string | null
}

export interface RuneActivity {
  height: number
  confirmations: number
  mempool: boolean
  tx_hash: string
  rune_activity: {
    self_transfers: RuneAndAmount[]
    increased_balances: RuneAndAmount[]
    decreased_balances: RuneAndAmount[]
    etched_rune?: {
      rune_id: string
      amount: string
      usd_amount: string
    } | null
    minted?: {
      rune_id: string
      amount: string
      usd_amount: string
    } | null
  }
}

export interface RuneAndAmount {
  rune_id: string
  amount: string
  usd_amount: string
}

// Rune UTXOs Response (from blockchain-indexer-service)
export interface RuneUtxosResponse {
  data: RuneUtxo[]
  last_updated: {
    block_hash: string
    block_height: number
  }
  next_cursor?: string | null
}

export interface RuneUtxo {
  tx_hash: string
  output_index: number
  height: number
  satoshis: string
  runes: RuneAndAmount[]
}

export interface RuneInfo {
  id: string
  name: string
  spaced_name: string
  symbol?: string
  divisibility: number
  etching_tx: string
  etching_height: number
  terms?: {
    amount?: string
    cap?: string
    start_height?: number
    end_height?: number
  }
  premine?: string
}

export interface RuneBalance {
  rune_id: string
  rune_name: string
  rune_symbol: string
  balance: string
  usd_balance?: string
  divisibility: number
  spacers?: number
  premine?: string
  burned?: string
  number?: number
  height?: number
  tx_index?: number
}

// Inscription Activity Response
export interface InscriptionActivityResponse {
  data: InscriptionActivity[]
  indexer_info: {
    chain_tip: {
      block_hash: string
      block_height: number
    }
    estimated_blocks?: Array<{
      block_height: number
      sats_per_vb: {
        min: number
        median: number
        max: number
      }
    }>
    mempool_timestamp: string
  }
  next_cursor?: string | null
}

export interface InscriptionActivity {
  height: number
  confirmations: number
  mempool: boolean
  tx_hash: string
  inscription_activity: {
    received: InscriptionTransfer[]
    sent: InscriptionTransfer[]
    self_transferred: InscriptionTransfer[]
  }
}

export interface InscriptionTransfer {
  inscription_id: string
  from?: {
    address: string
    input_index: number
    sat_offset: number
    script_pubkey: string
  } | null
  to: {
    address: string
    output_index: number
    sat_offset: number
    script_pubkey: string
  }
}

// Metaprotocol Activity Response
export interface MetaprotocolActivityResponse {
  data: {
    metaprotocol_activities: MetaprotocolActivity[]
  }
}

export interface MetaprotocolActivity {
  protocol: string
  operation: string
  data: any
  block_height: number
  tx_hash: string
  timestamp: string
}

// Satoshi Activity Response
export interface SatoshiActivityResponse {
  data: {
    satoshi_activities: SatoshiActivity[]
  }
}

export interface SatoshiActivity {
  sat_ordinal: string
  operation: string
  amount: number
  block_height: number
  tx_hash: string
  timestamp: string
}

// Historical Balance Response
export interface HistoricalBalanceResponse {
  data: HistoricalBalance[]
  last_updated: {
    block_hash: string
    block_height: number
  }
  next_cursor?: string | null
}

export interface HistoricalBalance {
  height: number
  confirmations: number
  unix_timestamp: number
  timestamp: string
  sat_balance: string
  usd_balance: string
}