'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, LogOut, Search, Wallet, X } from 'lucide-react';
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { ROBINHOOD_CHAIN_ID } from '@/lib/robinhood';

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function connectionErrorMessage(error: Error) {
  const message = error.message || 'Wallet connection failed.';
  if (message.toLowerCase().includes('user rejected') || message.toLowerCase().includes('user denied')) {
    return 'Connection request was cancelled in your wallet.';
  }
  if (message.toLowerCase().includes('project id')) {
    return 'WalletConnect needs a valid project ID before this wallet can connect.';
  }
  return message.length > 140 ? `${message.slice(0, 137)}...` : message;
}

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [connectionError, setConnectionError] = useState('');

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
    setConnectionError('');
    setOpen(true);
  }, []);

  const selectWallet = useCallback((connector: (typeof connectors)[number]) => {
    setConnectionError('');
    connect(
      { connector },
      {
        onSuccess: () => setOpen(false),
        onError: (error) => setConnectionError(connectionErrorMessage(error)),
      },
    );
  }, [connect, connectors]);

  useEffect(() => {
    const openWallet = () => openWalletSelector();
    window.addEventListener('kyox:open-wallet', openWallet);
    return () => window.removeEventListener('kyox:open-wallet', openWallet);
  }, [openWalletSelector]);

  if (!isConnected || !address) {
    return (
      <>
        <button className="wallet-button" onClick={openWalletSelector}>
          <span className="wallet-orbit"><Wallet size={16} /></span>
          CONNECT WALLET
        </button>
        {open && (
          <div className="wallet-modal-backdrop" onMouseDown={() => setOpen(false)}>
            <div className="wallet-modal" onMouseDown={(event) => event.stopPropagation()}>
              <div className="wallet-modal-head">
                <div>
                  <span className="wallet-modal-kicker">KYOX ACCESS</span>
                  <h2>CONNECT WALLET</h2>
                  <p>Choose your preferred provider to proceed.</p>
                </div>
                <button className="modal-close" aria-label="Close wallet selector" onClick={() => setOpen(false)}><X size={18} /></button>
              </div>
              <div className="wallet-search">
                <Search size={15} />
                <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search wallets" aria-label="Search wallets" />
              </div>
              {connectionError && <div className="wallet-error" role="alert">{connectionError}</div>}
              <div className="wallet-list">
                {filteredWallets.map((connector) => (
                  <button className="wallet-option" key={connector.uid} disabled={isPending} onClick={() => selectWallet(connector)}>
                    <span className="wallet-option-icon">
                      {connector.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={connector.icon} alt="" />
                      ) : <Wallet size={20} />}
                    </span>
                    <span className="wallet-option-copy">
                      <strong>{connector.name}</strong>
                      <small>{connector.name === 'WalletConnect' ? 'Connect any compatible mobile wallet' : 'Secure non custodial connection'}</small>
                    </span>
                    <span className="wallet-option-arrow">↗</span>
                  </button>
                ))}
                {!filteredWallets.length && <div className="wallet-empty">No compatible wallet found.</div>}
              </div>
              <div className="wallet-modal-foot"><span>SECURE CONNECTION</span><span>•</span><span>NON CUSTODIAL</span><span>•</span><span>{wallets.length} OPTIONS</span></div>
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

  const explorer = chain?.blockExplorers?.default?.url;
  const wrongNetwork = chain?.id !== ROBINHOOD_CHAIN_ID;

  return (
    <div className="wallet-connected">
      <div className="wallet-status-dot" />
      <div className="wallet-copy"><strong>{shortAddress(address)}</strong><span>{chain?.name ?? 'Unknown network'}</span></div>
      <span className="wallet-balance">{balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}</span>
      {wrongNetwork && (
        <button className="network-switch" type="button" disabled={isSwitching} onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })}>
          {isSwitching ? 'SWITCHING...' : 'SWITCH TO ROBINHOOD'}
        </button>
      )}
      <button aria-label="Copy wallet address" className="icon-button" onClick={copyAddress}><Copy size={15} /></button>
      {explorer && <a aria-label="Open wallet on explorer" className="icon-button" href={`${explorer}/address/${address}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /></a>}
      <button aria-label="Disconnect wallet" className="icon-button danger" onClick={() => disconnect()}><LogOut size={15} /></button>
      {copied && <span className="copy-toast">COPIED</span>}
    </div>
  );
}
