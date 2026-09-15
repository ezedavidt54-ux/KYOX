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
import { arbitrum, base, mainnet } from 'wagmi/chains';
import { robinhoodChain } from '@/lib/robinhood';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'KYOX_BUILD_PLACEHOLDER';

export const wagmiConfig = getDefaultConfig({
  appName: 'KYOX',
  projectId: walletConnectProjectId,
  chains: [robinhoodChain, arbitrum, base, mainnet],
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
