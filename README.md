# KYOX

**KYOX — ENTER THE UNKNOWN**

KYOX is a cinematic on chain trading interface built around a dark, data driven terminal experience.

## Current foundation

• Next.js App Router with TypeScript.
• Tailwind CSS v4.
• RainbowKit, wagmi and viem wallet infrastructure.
• Robinhood Chain mainnet as the primary network, chain ID 4663.
• Arbitrum, Base and Ethereum remain available in the wallet configuration.
• Custom KYOX wallet control with connection, address, balance, explorer and disconnect states.
• Cinematic animated black hole hero.
• Responsive command deck with market and swap surfaces.
• Dedicated Markets, Portfolio, Activity, Liquidity and Documentation pages.
• Robinhood Chain Uniswap V2 swap foundation for ETH/WETH and USDC routing.

## Robinhood Chain

Robinhood Chain uses chain ID `4663`, ETH as the native gas token, the public RPC `https://rpc.mainnet.chain.robinhood.com` and Robinhood Blockscout as its explorer.

## Wallet setup

Create a WalletConnect Cloud project and place its project ID in `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

The wallet layer is built on RainbowKit and wagmi so KYOX can support injected wallets and a broad wallet ecosystem without replacing the KYOX visual identity with a default wallet UI.

## Development

```bash
npm install
npm run dev
```

## Swap foundation

KYOX currently targets Robinhood Chain's deployed Uniswap V2 Router02 for the existing exact input ETH/USDC swap interface. Quotes, approvals, slippage protection and receipt confirmation are wired in the client, but the swap path still requires full live on chain validation with real Robinhood Chain liquidity before it should be treated as production ready.
