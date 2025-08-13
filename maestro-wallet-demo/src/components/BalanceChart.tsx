import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { HistoricalBalance } from '../types/api'

interface BalanceChartProps {
  data: HistoricalBalance[]
}

const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    ...item,
    btc_balance: parseInt(item.sat_balance) / 100000000,
    usd_balance_num: parseFloat(item.usd_balance),
    date: new Date(item.timestamp).toLocaleDateString()
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{`Date: ${label}`}</p>
          <p className="tooltip-btc">{`BTC: ${data.btc_balance.toFixed(8)}`}</p>
          <p className="tooltip-usd">{`USD: $${data.usd_balance_num.toFixed(2)}`}</p>
          <p className="tooltip-height">{`Block: ${data.height}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="balance-chart-container">
      <h3>Historical Balance</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 40,
            left: 60,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--maestro-border)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--maestro-text-secondary)"
            fontSize={12}
            tick={{ fill: 'var(--maestro-text-secondary)' }}
          />
          <YAxis 
            stroke="var(--maestro-text-secondary)"
            fontSize={12}
            tick={{ fill: 'var(--maestro-text-secondary)' }}
            tickFormatter={(value) => `${value.toFixed(4)} BTC`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="btc_balance" 
            stroke="var(--maestro-purple)" 
            strokeWidth={3}
            dot={{ fill: 'var(--maestro-purple)', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: 'var(--maestro-purple)', strokeWidth: 2, fill: 'var(--maestro-bg-primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BalanceChart