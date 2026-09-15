# KYOX

**KYOX — ENTER THE UNKNOWN**

KYOX is a cinematic on chain trading interface built around a dark, data driven terminal experience.

## Current foundation

• Next.js App Router with TypeScript.
• Tailwind CSS v4.
• RainbowKit, wagmi and viem wallet infrastructure.
• Arbitrum, Base and Ethereum network support.
• Custom KYOX wallet control with connection, address, balance, explorer and disconnect states.
• Cinematic animated black hole hero.
• Responsive command deck with market and swap surfaces.

## Wallet setup

Create a WalletConnect Cloud project and place its project ID in `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

The wallet layer is built on RainbowKit and wagmi so KYOX can support injected wallets and a broad wallet ecosystem without replacing the KYOX visual identity with a default wallet UI.

## Development

```bash
npm install
npm run dev
```

## Important

The current swap surface is interface only. It does not execute token swaps yet. Real trading will be added only after the routing, liquidity, token addresses, approvals, slippage handling and transaction flow are implemented and tested on chain.
