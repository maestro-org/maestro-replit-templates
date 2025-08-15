# Bitcoin Wallet Insights Dashboard

A comprehensive Bitcoin wallet analytics dashboard powered by Maestro's APIs. This application provides detailed insights into Bitcoin addresses including balance tracking, metaprotocol activity (Runes, Inscriptions), historical data, mempool-aware transaction monitoring, and real-time wallet monitoring via the Event Manager.

## Features

### Core Analytics
- **Real-time Balance Tracking**: View current balance, total transactions, and USD valuation
- **Network Toggle**: Switch between Bitcoin mainnet and testnet
- **Metaprotocol Support**: Monitor Runes, Inscriptions, and Ordinals activity
- **Historical Analytics**: Interactive charts showing balance changes over time
- **Mempool Awareness**: Track pending transactions and current network status

### Event Manager Integration
- **Real-time Wallet Monitoring**: Set up automated triggers to monitor wallet activity
- **Webhook Notifications**: Receive instant notifications when wallet balances change
- **Custom Filters**: Configure monitoring based on transaction amounts, sender/receiver addresses
- **Trigger Management**: Create, pause, resume, and delete monitoring triggers
- **Event Logs**: View detailed logs of all triggered events and webhook responses
- **Confirmation Settings**: Set custom confirmation requirements for trigger activation

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Easy Deployment**: One-click deployment on Replit with automatic environment setup

## Quick Start

### Get Your Maestro API Keys

Before deploying, you'll need API keys from Maestro:

1. **Sign up** at [gomaestro.org](https://gomaestro.org)
2. **Create a project** and generate API keys for:
   - Bitcoin Mainnet (required)
   - Bitcoin Testnet (optional, for testing)
3. **Enable Event Manager** access in your project settings if you plan to use monitoring features

### Replit Deployment (Recommended)

Deploy this application instantly on Replit with zero configuration:

[![Run on Replit](https://replit.com/badge/github/maestro-org/maestro-replit-templates)](https://replit.com/@maestro-org/maestro-wallet-demo)

1. **Fork Repository to Replit**
   - Click the "Run on Replit" badge above
   - Or go to [replit.com](https://replit.com) and import this repository

2. **Configure API Keys**
   - In your Replit project, go to the "Secrets" tab (lock icon in sidebar)
   - Add the following secrets:
     ```
     MAESTRO_MAINNET_API_KEY=your_mainnet_api_key_here
     MAESTRO_TESTNET_API_KEY=your_testnet_api_key_here
     ```
   - Optional secrets with defaults:
     ```
     MAESTRO_MAINNET_URL=https://xbt-mainnet.gomaestro-api.org/v0
     MAESTRO_TESTNET_URL=https://xbt-testnet.gomaestro-api.org/v0
     DEFAULT_NETWORK=mainnet
     ```

3. **Run the Application**
   - Click the "Run" button - the app will automatically install dependencies and start
   - The app will be available at your Replit URL (typically `https://your-repl-name.your-username.repl.co`)

### Local Development

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

### Manual Replit Setup

If you prefer to set up Replit manually:

1. Import this repository to Replit
2. The `.replit` file is already configured to:
   - Install Node.js 20 with web capabilities
   - Run the `start.sh` script which handles environment setup
   - Expose the app on port 5000
3. Set up secrets as described in the Replit Deployment section above
4. The application will automatically start when you run the project

### Environment Variables

**For Local Development (.env file):**
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

**For Replit Deployment (use Secrets tab):**
- `MAESTRO_MAINNET_API_KEY`: Your mainnet API key
- `MAESTRO_TESTNET_API_KEY`: Your testnet API key  
- `MAESTRO_MAINNET_URL`: (optional) Mainnet base URL
- `MAESTRO_TESTNET_URL`: (optional) Testnet base URL
- `DEFAULT_NETWORK`: (optional) Default network (mainnet/testnet)

## API Endpoints Used

The application integrates with multiple Maestro API services:

### Bitcoin Wallet API
- **Address Statistics**: `/wallet/addresses/{address}/statistics`
- **Rune Activity**: `/wallet/addresses/{address}/runes/activity`  
- **Inscription Activity**: `/wallet/addresses/{address}/inscriptions/activity`
- **Metaprotocol Activity**: `/wallet/addresses/{address}/activity/metaprotocols`
- **Satoshi Activity**: `/wallet/addresses/{address}/activity`
- **Historical Balance**: `/wallet/addresses/{address}/balance/historical`

### Event Manager API
- **Create Trigger**: `POST /eventmanager/triggers`
- **List Triggers**: `GET /eventmanager/triggers`
- **Get Trigger**: `GET /eventmanager/triggers/{id}`
- **Update Trigger**: `PUT /eventmanager/triggers/{id}`
- **Delete Trigger**: `DELETE /eventmanager/triggers/{id}`
- **Get Event Logs**: `GET /eventmanager/triggers/{id}/events`

## Architecture

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Pure CSS with responsive design
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API
- **State Management**: React Context API
- **Real-time Monitoring**: Maestro Event Manager webhooks

## Project Structure

```
src/
├── components/                    # React components
│   ├── Dashboard.tsx             # Main dashboard layout
│   ├── WalletInput.tsx          # Address input component
│   ├── NetworkToggle.tsx        # Network switcher
│   ├── BalanceChart.tsx         # Historical balance chart
│   └── WalletMonitoring.tsx     # Event Manager monitoring interface
├── context/                      # React context providers
│   ├── NetworkContext.tsx       # Network state management
│   ├── WalletContext.tsx        # Wallet state management
│   └── WalletMonitoringContext.tsx # Event monitoring state
├── hooks/                        # Custom React hooks
│   └── useMaestroApi.ts         # API integration hook
├── services/                     # External service integrations
│   ├── maestroApi.ts            # Maestro Wallet API client
│   └── eventManagerApi.ts       # Event Manager API client
├── types/                        # TypeScript type definitions
│   └── api.ts                   # API response types
├── config/                       # Configuration files
│   └── api.ts                   # API configuration
└── App.tsx                      # Main application component
```

## Usage

### Basic Wallet Analytics

1. Enter a Bitcoin address in the input field
2. Use the network toggle to switch between mainnet/testnet
3. View comprehensive analytics including:
   - Current balance and transaction statistics
   - Pending/mempool activity
   - Metaprotocol activity (Runes, Inscriptions, Ordinals)
   - Interactive historical balance chart
   - Network status and fee estimates

### Event Manager - Wallet Monitoring

The Event Manager feature allows you to set up real-time monitoring for Bitcoin wallets:

#### Setting Up Wallet Monitoring

1. **Navigate to the Monitoring Tab**
   - After entering a wallet address, click the "Monitoring" tab
   - This section provides access to all Event Manager features

2. **Create a New Trigger**
   - Click the "+" button to create a new monitoring trigger
   - Configure the webhook URL (use [webhook.site](https://webhook.site) for testing)
   - Set confirmation requirements (1-6 confirmations)
   - The trigger will monitor balance changes for the current wallet

3. **Manage Existing Triggers**
   - View all active and paused triggers
   - Pause/resume triggers as needed
   - Delete triggers that are no longer needed
   - View trigger statistics including event count

#### Understanding Event Filters

The application automatically creates triggers with smart filtering:

- **Balance Change Detection**: Monitors transactions where the wallet is sender or receiver
- **Custom Confirmations**: Set how many confirmations are required before triggering
- **Network Specific**: Triggers are created per network (mainnet/testnet)

#### Event Logs and Webhooks

1. **View Event History**
   - Click "View Events" on any trigger to see the event log
   - Each event shows the transaction payload sent to your webhook
   - Monitor webhook response status and timing

2. **Webhook Integration**
   - Events are sent as POST requests to your webhook URL
   - Payload includes full transaction details
   - Response status is logged for debugging

#### Use Cases

- **Portfolio Monitoring**: Track balance changes across multiple wallets
- **Payment Processing**: Receive notifications when payments are received
- **Security Alerts**: Monitor for unexpected outgoing transactions
- **Analytics**: Collect real-time data for analysis and reporting

#### Testing with Webhook.site

For testing and development:

1. Go to [webhook.site](https://webhook.site) and copy your unique URL
2. Use this URL when creating triggers
3. Send test transactions to your monitored address
4. View real-time webhook deliveries on webhook.site
5. Examine the full transaction payload and timing

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

The application is designed to be extensible. To add new API endpoints or features:

1. **Add API Types**: Update types in `src/types/api.ts`
2. **Create Service Methods**: Add new service methods in `src/services/maestroApi.ts` or `src/services/eventManagerApi.ts`
3. **Build Components**: Create new components in `src/components/`
4. **Update Context**: Add state management in appropriate context providers
5. **Update Dashboard**: Modify the dashboard layout as needed

### Event Manager Development

To extend Event Manager functionality:

1. **Custom Filters**: Modify the `createWalletBalanceMonitoringTrigger` function in `eventManagerApi.ts`
2. **New Trigger Types**: Add support for different trigger types beyond transaction monitoring
3. **Enhanced UI**: Extend `WalletMonitoring.tsx` for more sophisticated monitoring interfaces
4. **Webhook Processing**: Add webhook endpoint handling for incoming events

## Troubleshooting

### Replit Deployment Issues

- **Environment Variables Not Loading**: Ensure secrets are set in the Secrets tab, not as environment variables
- **App Not Starting**: Check that `start.sh` has execute permissions (handled automatically by `.replit`)
- **API Errors**: Verify API keys are correct and have appropriate permissions

### Event Manager Issues

- **Triggers Not Creating**: Verify API keys have Event Manager permissions
- **Webhooks Not Firing**: Check webhook URL is accessible and accepts POST requests
- **Missing Events**: Ensure confirmation requirements match your testing scenario

### Local Development Issues

- **Environment Variables**: Ensure `.env` file exists and contains all required variables
- **API Connectivity**: Verify network connectivity and API endpoint accessibility
- **Build Errors**: Run `npm run build` to identify TypeScript or build configuration issues

## Replit Configuration

This project includes several files for seamless Replit deployment:

### `.replit` File
Configures the Replit environment with:
- **Modules**: Node.js 20, web capabilities, and Nix package manager
- **Run Command**: Executes `start.sh` script with proper environment setup
- **Build Command**: Runs `npm run build` for production builds
- **Port Configuration**: Exposes the app on port 5000
- **Workflows**: Defines run button behavior and parallel task execution

### `start.sh` Script
Environment setup script that:
- Maps Replit secrets to Vite environment variables
- Provides fallback values for missing configuration
- Installs dependencies and starts the development server
- Handles both Replit secrets and local `.env` files seamlessly

### Key Benefits
- **Zero Configuration**: Works immediately after importing to Replit
- **Environment Isolation**: Proper separation of secrets and build configuration
- **Automatic Setup**: No manual dependency installation or environment configuration required
- **Production Ready**: Includes build commands for deployment

## License

MIT License - feel free to use this project as a starting point for your own Bitcoin analytics applications.