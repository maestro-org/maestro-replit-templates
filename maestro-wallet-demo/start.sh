#!/bin/bash

# Script to set up environment variables from Replit secrets
# This runs before the main application starts

echo "Setting up environment variables from Replit secrets..."

# Export Replit secrets as VITE_ prefixed environment variables
export VITE_MAESTRO_MAINNET_API_KEY="${MAESTRO_MAINNET_API_KEY:-${VITE_MAESTRO_MAINNET_API_KEY}}"
export VITE_MAESTRO_TESTNET_API_KEY="${MAESTRO_TESTNET_API_KEY:-${VITE_MAESTRO_TESTNET_API_KEY}}"
export VITE_MAESTRO_MAINNET_URL="${MAESTRO_MAINNET_URL:-${VITE_MAESTRO_MAINNET_URL:-https://xbt-mainnet.gomaestro-api.org/v0}}"
export VITE_MAESTRO_TESTNET_URL="${MAESTRO_TESTNET_URL:-${VITE_MAESTRO_TESTNET_URL:-https://xbt-testnet.gomaestro-api.org/v0}}"
export VITE_DEFAULT_NETWORK="${DEFAULT_NETWORK:-${VITE_DEFAULT_NETWORK:-mainnet}}"

echo "Environment setup complete"

# Run the main application
npm install && npm run dev
