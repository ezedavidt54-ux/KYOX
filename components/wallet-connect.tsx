'use client';

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { Copy, LogOut, Wallet, ExternalLink } from 'lucide-react';
import { useState } from 'react';

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnect() {
  const { openConnectModal } = useConnectModal();
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  if (!isConnected || !address) {
    return (
      <button className="wallet-button" onClick={() => openConnectModal?.()}>
        <span className="wallet-orbit"><Wallet size={16} /></span>
        CONNECT WALLET
      </button>
    );
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

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
      <button aria-label="Copy wallet address" className="icon-button" onClick={copyAddress}>
        <Copy size={15} />
      </button>
      <a
        aria-label="Open wallet on explorer"
        className="icon-button"
        href={`https://arbiscan.io/address/${address}`}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} />
      </a>
      <button aria-label="Disconnect wallet" className="icon-button danger" onClick={() => disconnect()}>
        <LogOut size={15} />
      </button>
      {copied && <span className="copy-toast">COPIED</span>}
    </div>
  );
}
