'use client';

import { ArrowDownUp, ChevronDown, LoaderCircle, Wallet } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useMemo, useState } from 'react';

const MAX_DECIMALS = 6;

export function SwapPanel() {
  const { address, isConnected } = useAccount();
  const { data: nativeBalance, isLoading } = useBalance({ address });
  const [amount, setAmount] = useState('');
  const [flipped, setFlipped] = useState(false);

  const fromSymbol = flipped ? 'USDC' : 'ETH';
  const toSymbol = flipped ? 'ETH' : 'USDC';
  const nativeFormatted = nativeBalance?.formatted ?? '0';
  const nativeSymbol = nativeBalance?.symbol ?? 'ETH';

  const balanceLabel = useMemo(() => {
    if (!isConnected) return 'CONNECT WALLET TO VIEW BALANCE';
    if (isLoading) return 'READING WALLET BALANCE...';
    return `BALANCE ${Number(nativeFormatted).toFixed(4)} ${nativeSymbol}`;
  }, [isConnected, isLoading, nativeFormatted, nativeSymbol]);

  const setMax = () => {
    if (!nativeBalance) return;
    const value = Number(nativeBalance.formatted);
    setAmount(Number.isFinite(value) ? Math.max(value - 0.001, 0).toFixed(6) : '');
  };

  const changeAmount = (value: string) => {
    if (value === '' || /^\d*(\.\d*)?$/.test(value)) {
      const [, decimals = ''] = value.split('.');
      if (decimals.length <= MAX_DECIMALS) setAmount(value);
    }
  };

  const requestWallet = () => window.dispatchEvent(new Event('kyox:open-wallet'));

  return (
    <div className="swap-panel">
      <div className="swap-title">EXECUTE SWAP</div>
      <div className="swap-box">
        <div className="swap-row">
          <span className="swap-label">YOU PAY</span>
          <button className="token" type="button" onClick={() => setFlipped((value) => !value)}>
            <span className="token-dot" /> {fromSymbol} <ChevronDown size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <input
            style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: '#fff', font: '500 30px DM Mono, monospace' }}
            inputMode="decimal"
            value={amount}
            onChange={(event) => changeAmount(event.target.value)}
            placeholder="0.00"
            aria-label={`Amount of ${fromSymbol} to swap`}
          />
          <button type="button" onClick={setMax} disabled={!isConnected || fromSymbol !== nativeSymbol} style={{ padding: '5px 8px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, background: 'rgba(255,255,255,.04)', color: '#9aa4b1', font: '9px DM Mono, monospace' }}>MAX</button>
        </div>
        <div className="balance">{balanceLabel}</div>
        <button type="button" aria-label="Reverse swap pair" onClick={() => setFlipped((value) => !value)} style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, margin: '14px auto -2px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, background: '#0b0e12', color: '#aab4c0' }}>
          <ArrowDownUp size={14} />
        </button>
        <div className="swap-divider" />
        <div className="swap-row">
          <span className="swap-label">YOU RECEIVE</span>
          <div className="token"><span className="token-dot" /> {toSymbol} <ChevronDown size={12} /></div>
        </div>
        <div className="amount" style={{ color: amount ? '#6d7784' : '#fff', fontSize: 22 }}>{amount ? 'QUOTE PENDING' : '0.00'}</div>
        <div className="balance">LIVE ROUTER QUOTE WILL APPEAR HERE</div>
      </div>
      {!isConnected ? (
        <button className="swap-submit" type="button" onClick={requestWallet}><Wallet size={13} /> CONNECT WALLET TO TRADE</button>
      ) : (
        <button className="swap-submit" type="button" disabled><LoaderCircle size={13} /> ROUTER AWAITING DEPLOYMENT</button>
      )}
      <div style={{ marginTop: 10, color: '#4f5966', font: '8px DM Mono, monospace', lineHeight: 1.7, textAlign: 'center' }}>
        KYOX will only submit transactions after an on chain routing contract and live quote source are configured.
      </div>
    </div>
  );
}
