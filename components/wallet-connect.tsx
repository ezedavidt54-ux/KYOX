'use client';

import { useState } from 'react';
import { Copy, ExternalLink, LogOut } from 'lucide-react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { siCoinbase, siMetamask, siPhantom, siTrustwallet } from 'simple-icons';
import { useAccount, useBalance, useDisconnect, useSwitchChain } from 'wagmi';
import { ROBINHOOD_CHAIN_ID } from '@/lib/robinhood';

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletBrandIcon({ path, hex }: { path: string; hex: string }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d={path} fill={`#${hex}`} />
    </svg>
  );
}

const WALLET_OPTION_COUNT = 14;

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const [copied, setCopied] = useState(false);

  if (!isConnected || !address) {
    return (
      <button className="wallet-button" onClick={() => openConnectModal?.()} aria-label="Connect wallet">
        <span className="wallet-button-icons" aria-hidden="true">
          <span className="wallet-button-icon wallet-brand-metamask"><WalletBrandIcon path={siMetamask.path} hex={siMetamask.hex} /></span>
          <span className="wallet-button-icon wallet-brand-trust"><WalletBrandIcon path={siTrustwallet.path} hex={siTrustwallet.hex} /></span>
          <span className="wallet-button-icon wallet-brand-coinbase"><WalletBrandIcon path={siCoinbase.path} hex={siCoinbase.hex} /></span>
          <span className="wallet-button-icon wallet-brand-phantom"><WalletBrandIcon path={siPhantom.path} hex={siPhantom.hex} /></span>
        </span>
        <span>CONNECT</span>
        <span className="wallet-button-count">{WALLET_OPTION_COUNT}</span>
      </button>
    );
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const explorer = chain?.blockExplorers?.default?.url;
  const wrongNetwork = chain?.id !== ROBINHOOD_CHAIN_ID;

  return (
    <div className="wallet-connected">
      <div className="wallet-status-dot" />
      <div className="wallet-copy">
        <strong>{shortAddress(address)}</strong>
        <span>{chain?.name ?? 'Unknown network'}</span>
      </div>
      <span className="wallet-balance">
        {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}
      </span>
      {wrongNetwork && (
        <button
          className="network-switch"
          type="button"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })}
        >
          {isSwitching ? 'SWITCHING...' : 'SWITCH TO ROBINHOOD'}
        </button>
      )}
      <button aria-label="Copy wallet address" className="icon-button" onClick={copyAddress}>
        <Copy size={15} />
      </button>
      {explorer && (
        <a
          aria-label="Open wallet on explorer"
          className="icon-button"
          href={`${explorer}/address/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={15} />
        </a>
      )}
      <button aria-label="Disconnect wallet" className="icon-button danger" onClick={() => disconnect()}>
        <LogOut size={15} />
      </button>
      {copied && <span className="copy-toast">COPIED</span>}
    </div>
  );
}
