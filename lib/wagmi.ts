import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  base as baseWallet,
  binanceWallet,
  bitgetWallet,
  bybitWallet,
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
  uniswapWallet,
  walletConnectWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { defineChain } from 'viem';

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
    public: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: { name: 'Robinhood Blockscout', url: 'https://robinhoodchain.blockscout.com' },
  },
  sourceId: 1,
});

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'KYOX_BUILD_PLACEHOLDER';

export const wagmiConfig = getDefaultConfig({
  appName: 'KYOX',
  projectId: walletConnectProjectId,
  chains: [robinhoodChain],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, baseWallet, binanceWallet, phantomWallet, rainbowWallet],
    },
    {
      groupName: 'More wallets',
      wallets: [okxWallet, trustWallet, rabbyWallet, bitgetWallet, bybitWallet, uniswapWallet, zerionWallet],
    },
    {
      groupName: 'Universal access',
      wallets: [walletConnectWallet, injectedWallet],
    },
  ],
  ssr: true,
});
