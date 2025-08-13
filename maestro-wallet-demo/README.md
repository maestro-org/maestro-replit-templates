# Bitcoin Wallet Insights Dashboard

A comprehensive Bitcoin wallet analytics dashboard powered by Maestro's APIs. This application provides detailed insights into Bitcoin addresses including balance tracking, metaprotocol activity (Runes, Inscriptions), historical data, and mempool-aware transaction monitoring.

## Features

- **Real-time Balance Tracking**: View current balance, total transactions, and USD valuation
- **Network Toggle**: Switch between Bitcoin mainnet and testnet
- **Metaprotocol Support**: Monitor Runes, Inscriptions, and Ordinals activity
- **Historical Analytics**: Interactive charts showing balance changes over time
- **Mempool Awareness**: Track pending transactions and current network status
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Maestro API keys for mainnet and testnet
4. Start the development server:
   ```bash
   npm run dev
   ```

### Replit Deployment

This project is configured for easy deployment on Replit:

1. Import this repository to Replit
2. Set up environment variables in Replit's Secrets tab:
   - `VITE_MAESTRO_MAINNET_API_KEY`: Your mainnet API key
   - `VITE_MAESTRO_TESTNET_API_KEY`: Your testnet API key
3. Run the project - it will automatically start

### Environment Variables

```env
# Maestro API Configuration
VITE_MAESTRO_MAINNET_API_KEY=your_mainnet_api_key_here
VITE_MAESTRO_TESTNET_API_KEY=your_testnet_api_key_here

# Base URLs (optional, defaults provided)
VITE_MAESTRO_MAINNET_URL=https://xbt-mainnet.gomaestro-api.org/v0
VITE_MAESTRO_TESTNET_URL=https://xbt-testnet.gomaestro-api.org/v0

# Default network
VITE_DEFAULT_NETWORK=mainnet
```

## API Endpoints Used

The application integrates with Maestro's Bitcoin Wallet API endpoints:

- **Address Statistics**: `/wallet/addresses/{address}/statistics`
- **Rune Activity**: `/wallet/addresses/{address}/runes/activity`  
- **Inscription Activity**: `/wallet/addresses/{address}/inscriptions/activity`
- **Metaprotocol Activity**: `/wallet/addresses/{address}/activity/metaprotocols`
- **Satoshi Activity**: `/wallet/addresses/{address}/activity`
- **Historical Balance**: `/wallet/addresses/{address}/balance/historical`

## Architecture

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Pure CSS with responsive design
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard layout
│   ├── WalletInput.tsx  # Address input component
│   ├── NetworkToggle.tsx # Network switcher
│   └── BalanceChart.tsx # Historical balance chart
├── context/             # React context providers
│   ├── NetworkContext.tsx # Network state management
│   └── WalletContext.tsx  # Wallet state management
├── hooks/               # Custom React hooks
│   └── useMaestroApi.ts # API integration hook
├── services/            # External service integrations
│   └── maestroApi.ts    # Maestro API client
├── types/               # TypeScript type definitions
│   └── api.ts          # API response types
└── config/              # Configuration files
    └── api.ts          # API configuration
```

## Usage

1. Enter a Bitcoin address in the input field
2. Use the network toggle to switch between mainnet/testnet
3. View comprehensive analytics including:
   - Current balance and transaction statistics
   - Pending/mempool activity
   - Metaprotocol activity (Runes, Inscriptions, Ordinals)
   - Interactive historical balance chart
   - Network status and fee estimates

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

The application is designed to be extensible. To add new API endpoints or features:

1. Update types in `src/types/api.ts`
2. Add new service methods in `src/services/maestroApi.ts`
3. Create new components in `src/components/`
4. Update the dashboard layout as needed

## License

MIT License - feel free to use this project as a starting point for your own Bitcoin analytics applications.