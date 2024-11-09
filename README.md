# Builders Workshop UI

A Next.js application with RainbowKit wallet integration and ZeroDev Smart Accounts.

## Features

- 🔐 Account Abstraction with ZeroDev SDK
- 🌈 RainbowKit for wallet connections
- ⚡ Viem for Ethereum interactions
- 🔄 ERC-4337 support
- ⚛️ Next.js for the frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
- Copy `.env.local.example` to `.env.local`
- Set `NEXT_PUBLIC_BUNDLER_RPC_URL` from your ZeroDev dashboard
- Set `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` from WalletConnect Cloud
- Configure `NEXT_PUBLIC_ENABLE_TESTNETS` based on your needs

3. Update the configuration:
- In `src/wagmi.ts`, replace `YOUR_PROJECT_ID` with your WalletConnect Project ID

4. Run the development server:
```bash
npm run dev
```

## Smart Account Integration

This project uses ZeroDev's SDK to enable smart accounts with the following features:

- Kernel v3.1 smart accounts
- ERC-4337 account abstraction
- ECDSA validator for signature validation
- Automatic account creation upon wallet connection

## Usage

The `useSmartAccount` hook provides access to the smart account functionality:

```typescript
const { smartAccount, kernelClient, isLoading, error } = useSmartAccount();
```

- `smartAccount`: The created Kernel smart account instance
- `kernelClient`: The client for interacting with the smart account
- `isLoading`: Loading state during account setup
- `error`: Any errors that occurred during setup

## Environment Variables

- `NEXT_PUBLIC_BUNDLER_RPC_URL`: Your ZeroDev bundler RPC URL (required)
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect Project ID (required)
- `NEXT_PUBLIC_ENABLE_TESTNETS`: Enable testnet chains (optional, defaults to false)

## Architecture

The integration is structured as follows:

1. **Wallet Connection**: RainbowKit handles the initial wallet connection
2. **Smart Account Creation**: The `useSmartAccount` hook creates a Kernel smart account when a wallet connects
3. **Transaction Handling**: Use the `kernelClient` to send transactions through the smart account

## Networks

By default, the application supports:
- Arbitrum (mainnet)
- Sepolia (testnet, when enabled)

Additional networks can be added by modifying the chains configuration in `src/wagmi.ts`.

## Development

To modify the smart account integration:

1. Update the `useSmartAccount` hook in `src/hooks/use-smart-account.ts`
2. Modify the network configuration in `src/wagmi.ts`
3. Adjust environment variables in `.env.local`

## Resources

- [ZeroDev Documentation](https://docs.zerodev.app/)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)
- [Viem Documentation](https://viem.sh/)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
