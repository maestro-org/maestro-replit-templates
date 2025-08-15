import React from 'react'
import { RuneBalance } from '../types/api'

interface RuneBalanceCardProps {
  rune: RuneBalance
}

const RuneBalanceCard: React.FC<RuneBalanceCardProps> = ({ rune }) => {
  // Format the rune amount based on divisibility
  const formatRuneAmount = (amount: string, divisibility: number): string => {
    try {
      const num = BigInt(amount)
      const divisor = BigInt(10 ** divisibility)
      const integerPart = num / divisor
      const fractionalPart = num % divisor
      
      if (fractionalPart === 0n) {
        return integerPart.toString()
      }
      
      const fractionalStr = fractionalPart.toString().padStart(divisibility, '0').replace(/0+$/, '')
      return `${integerPart}.${fractionalStr}`
    } catch (error) {
      console.error('Error formatting rune amount:', error)
      return amount // Return original amount as fallback
    }
  }

  // Format rune name with spacers if available
  const formatRuneName = (name: string, spacers?: number): string => {
    if (!spacers || spacers === 0) return name
    
    // Convert spacers number to binary and insert • where there's a 1
    const binary = spacers.toString(2).padStart(name.length - 1, '0')
    let formatted = name[0]
    
    for (let i = 1; i < name.length; i++) {
      if (binary[i - 1] === '1') {
        formatted += '•'
      }
      formatted += name[i]
    }
    
    return formatted
  }

  const formattedAmount = formatRuneAmount(rune.balance, rune.divisibility)
  const formattedName = formatRuneName(rune.rune_name, rune.spacers)

  return (
    <div className="rune-balance-card">
      <div className="rune-header">
        <div className="rune-symbol">{rune.rune_symbol}</div>
        <div className="rune-amount">{formattedAmount}</div>
      </div>
      <div className="rune-details">
        <div className="rune-name" title={`Rune ID: ${rune.rune_id}`}>
          {formattedName}
        </div>
        {rune.usd_balance && parseFloat(rune.usd_balance) > 0 && (
          <div className="rune-usd-value">${rune.usd_balance}</div>
        )}
      </div>
    </div>
  )
}

export default RuneBalanceCard
