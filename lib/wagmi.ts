import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, base, mainnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'KYOX',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [arbitrum, base, mainnet],
  ssr: true,
});
