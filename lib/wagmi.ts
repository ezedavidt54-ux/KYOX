import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  base as baseWallet,
  binanceWallet,
  injectedWallet,
  metaMaskWallet,
  phantomWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { arbitrum, base, mainnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'KYOX',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [arbitrum, base, mainnet],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, baseWallet, binanceWallet, phantomWallet, rainbowWallet],
    },
    {
      groupName: 'More ways to connect',
      wallets: [walletConnectWallet, injectedWallet],
    },
  ],
  ssr: true,
});
