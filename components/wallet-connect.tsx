'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, LogOut, Search, Wallet, X } from 'lucide-react';
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { arbitrum } from 'wagmi/chains';

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const wallets = useMemo(() => {
    const unique = new Map<string, (typeof connectors)[number]>();
    for (const connector of connectors) {
      if (!unique.has(connector.name)) unique.set(connector.name, connector);
    }
    return [...unique.values()];
  }, [connectors]);

  const filteredWallets = wallets.filter((wallet) =>
    wallet.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  useEffect(() => {
    const openWallet = () => setOpen(true);
    window.addEventListener('kyox:open-wallet', openWallet);
    return () => window.removeEventListener('kyox:open-wallet', openWallet);
  }, []);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  if (!isConnected || !address) {
    return (
      <>
        <button className="wallet-button" onClick={() => setOpen(true)}>
          <span className="wallet-orbit"><Wallet size={16} /></span>
          CONNECT WALLET
        </button>

        {open && (
          <div className="wallet-modal-backdrop" onMouseDown={() => setOpen(false)}>
            <div className="wallet-modal" onMouseDown={(event) => event.stopPropagation()}>
              <div className="wallet-modal-head">
                <div>
                  <span className="wallet-modal-kicker">KYOX ACCESS</span>
                  <h2>CONNECT TO KYOX</h2>
                  <p>Choose your preferred wallet to enter the exchange.</p>
                </div>
                <button className="modal-close" aria-label="Close wallet selector" onClick={() => setOpen(false)}><X size={18} /></button>
              </div>

              <div className="wallet-search">
                <Search size={15} />
                <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search wallets" aria-label="Search wallets" />
              </div>

              <div className="wallet-list">
                {filteredWallets.map((connector) => (
                  <button className="wallet-option" key={connector.uid} disabled={isPending} onClick={() => connect({ connector }, { onSuccess: () => setOpen(false) })}>
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
  const wrongNetwork = chain?.id !== arbitrum.id;

  return (
    <div className="wallet-connected">
      <div className="wallet-status-dot" />
      <div className="wallet-copy"><strong>{shortAddress(address)}</strong><span>{chain?.name ?? 'Unknown network'}</span></div>
      <span className="wallet-balance">{balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '...'}</span>
      {wrongNetwork && (
        <button className="network-switch" type="button" disabled={isSwitching} onClick={() => switchChain({ chainId: arbitrum.id })}>
          {isSwitching ? 'SWITCHING...' : 'SWITCH TO ARBITRUM'}
        </button>
      )}
      <button aria-label="Copy wallet address" className="icon-button" onClick={copyAddress}><Copy size={15} /></button>
      {explorer && <a aria-label="Open wallet on explorer" className="icon-button" href={`${explorer}/address/${address}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /></a>}
      <button aria-label="Disconnect wallet" className="icon-button danger" onClick={() => disconnect()}><LogOut size={15} /></button>
      {copied && <span className="copy-toast">COPIED</span>}
    </div>
  );
}
