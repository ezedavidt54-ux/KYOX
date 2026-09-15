'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, LogOut, Search, Wallet, X } from 'lucide-react';
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
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
import { robinhoodChain } from '@/lib/wagmi';

const walletDefinitions = [metaMaskWallet, baseWallet, binanceWallet, phantomWallet, rainbowWallet, okxWallet, trustWallet, rabbyWallet, bitgetWallet, bybitWallet, uniswapWallet, zerionWallet, walletConnectWallet, injectedWallet];

const fallbackIcons: Record<string, string> = {
  MetaMask: 'https://cdn.simpleicons.org/metamask',
  Base: 'https://cdn.simpleicons.org/coinbase',
  'Binance Web3 Wallet': 'https://cdn.simpleicons.org/binance',
  Phantom: 'https://cdn.simpleicons.org/phantom',
  Rainbow: 'https://cdn.simpleicons.org/rainbow',
  'OKX Wallet': 'https://cdn.simpleicons.org/okx',
  'Trust Wallet': 'https://cdn.simpleicons.org/trustwallet',
  'Rabby Wallet': 'https://cdn.simpleicons.org/rabby',
  Bitget: 'https://cdn.simpleicons.org/bitget',
  'Bybit Wallet': 'https://cdn.simpleicons.org/bybit',
  'Uniswap Wallet': 'https://cdn.simpleicons.org/uniswap',
  Zerion: 'https://cdn.simpleicons.org/zerion',
  WalletConnect: 'https://cdn.simpleicons.org/walletconnect',
};

const walletDescriptions: Record<string, string> = {
  MetaMask: 'Browser and mobile wallet',
  Base: 'Coinbase smart wallet',
  'Binance Web3 Wallet': 'Binance self custody wallet',
  Phantom: 'Multichain wallet for mobile and web',
  Rainbow: 'Beautiful multichain wallet',
  'OKX Wallet': 'Multichain Web3 wallet',
  'Trust Wallet': 'Mobile first self custody wallet',
  'Rabby Wallet': 'Security focused EVM wallet',
  Bitget: 'Multichain trading wallet',
  'Bybit Wallet': 'Web3 wallet from Bybit',
  'Uniswap Wallet': 'Wallet from Uniswap',
  Zerion: 'Portfolio and self custody wallet',
  WalletConnect: 'Connect any compatible wallet',
};

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function walletIcon(name: string, connectorIcon?: string) {
  return connectorIcon ?? fallbackIcons[name];
}

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connectAsync, connectors, isPending, error: connectionError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});
  const [connectError, setConnectError] = useState('');

  const wallets = useMemo(() => {
    const unique = new Map<string, (typeof connectors)[number]>();
    for (const connector of connectors) {
      if (!unique.has(connector.name)) unique.set(connector.name, connector);
    }
    return [...unique.values()];
  }, [connectors]);

  const filteredWallets = wallets.filter((wallet) => wallet.name.toLowerCase().includes(search.trim().toLowerCase()));

  const openWalletSelector = useCallback(() => {
    setSearch('');
    setConnectError('');
    setOpen(true);
  }, []);

  useEffect(() => {
    const openWallet = () => openWalletSelector();
    window.addEventListener('kyox:open-wallet', openWallet);
    return () => window.removeEventListener('kyox:open-wallet', openWallet);
  }, [openWalletSelector]);

  const connectWallet = async (connector: (typeof connectors)[number]) => {
    setConnectError('');
    try {
      await connectAsync({ connector });
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Wallet connection failed';
      setConnectError(message.length > 100 ? `${message.slice(0, 97)}...` : message);
    }
  };

  if (!isConnected || !address) {
    return (
      <>
        <button className="wallet-button" onClick={openWalletSelector} type="button">
          <span className="wallet-orbit"><Wallet size={15} /></span>
          CONNECT WALLET
        </button>
        {open && (
          <div className="wallet-modal-backdrop" onMouseDown={() => setOpen(false)}>
            <div className="wallet-modal" onMouseDown={(event) => event.stopPropagation()}>
              <div className="wallet-modal-glow" />
              <div className="wallet-modal-head">
                <div>
                  <span className="wallet-modal-kicker">KYOX ACCESS / 01</span>
                  <h2>ENTER THE NETWORK</h2>
                  <p>Connect to Robinhood Chain. Your keys never leave your wallet.</p>
                </div>
                <button className="modal-close" aria-label="Close wallet selector" onClick={() => setOpen(false)} type="button"><X size={18} /></button>
              </div>
              <div className="wallet-search">
                <Search size={15} />
                <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search wallet" aria-label="Search wallets" />
              </div>
              <div className="wallet-list">
                {filteredWallets.map((connector, index) => {
                  const icon = walletIcon(connector.name, connector.icon);
                  const failed = failedIcons[connector.name];
                  return (
                    <button className="wallet-option" key={connector.uid} disabled={isPending} onClick={() => void connectWallet(connector)} type="button">
                      <span className="wallet-option-icon">
                        {icon && !failed ? <img src={icon} alt="" onError={() => setFailedIcons((state) => ({ ...state, [connector.name]: true }))} /> : <span className="wallet-letter">{connector.name.charAt(0)}</span>}
                      </span>
                      <span className="wallet-option-copy">
                        <strong>{connector.name}</strong>
                        <small>{walletDescriptions[connector.name] ?? 'Secure non custodial connection'}</small>
                      </span>
                      <span className="wallet-option-index">{String(index + 1).padStart(2, '0')}</span>
                    </button>
                  );
                })}
                {!filteredWallets.length && <div className="wallet-empty">No compatible wallet found.</div>}
              </div>
              {(connectError || connectionError) && <div className="wallet-connect-error">{connectError || connectionError?.message}</div>}
              <div className="wallet-modal-foot"><span>SECURE</span><span>•</span><span>NON CUSTODIAL</span><span>•</span><span>{wallets.length} AVAILABLE</span></div>
            </div>
          </div>
        )}
      </>
    );
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const explorer = chain?.blockExplorers?.default?.url ?? robinhoodChain.blockExplorers.default.url;
  const wrongNetwork = chain?.id !== robinhoodChain.id;

  return (
    <div className="wallet-connected">
      <div className="wallet-status-dot" />
      <div className="wallet-copy"><strong>{shortAddress(address)}</strong><span>{chain?.name ?? 'Unknown network'}</span></div>
      <span className="wallet-balance">{balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}</span>
      {wrongNetwork && <button className="network-switch" type="button" disabled={isSwitching} onClick={() => void switchChainAsync({ chainId: robinhoodChain.id })}>{isSwitching ? 'SWITCHING...' : 'SWITCH TO ROBINHOOD'}</button>}
      <button aria-label="Copy wallet address" className="icon-button" onClick={copyAddress} type="button">{copied ? <Check size={15} /> : <Copy size={15} />}</button>
      {explorer && <a aria-label="Open wallet on explorer" className="icon-button" href={`${explorer}/address/${address}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /></a>}
      <button aria-label="Disconnect wallet" className="icon-button danger" onClick={() => disconnect()} type="button"><LogOut size={15} /></button>
    </div>
  );
}
