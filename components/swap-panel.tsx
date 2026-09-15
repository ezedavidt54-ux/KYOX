'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, LoaderCircle, Wallet } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { type Address } from 'viem';

const USDG_ROBINHOOD = '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168' as Address;

export function SwapPanel() {
  const { address, isConnected, chainId } = useAccount();
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({ address });
  const { data: usdgBalance, isLoading: usdgLoading } = useBalance({ address, token: USDG_ROBINHOOD });
  const [amount, setAmount] = useState('');
  const [flipped, setFlipped] = useState(false);

  const fromSymbol = flipped ? 'USDG' : 'ETH';
  const fromBalance = flipped ? usdgBalance : nativeBalance;
  const connectedToRobinhood = chainId === 4663;

  const balanceLabel = useMemo(() => {
    if (!isConnected) return 'CONNECT WALLET TO VIEW BALANCE';
    if (!connectedToRobinhood) return 'SWITCH WALLET TO ROBINHOOD CHAIN';
    if (nativeLoading || usdgLoading) return 'READING WALLET BALANCES...';
    return `BALANCE ${Number(fromBalance?.formatted ?? 0).toFixed(4)} ${fromSymbol}`;
  }, [connectedToRobinhood, fromBalance?.formatted, fromSymbol, isConnected, nativeLoading, usdgLoading]);

  const setMax = () => {
    if (!fromBalance) return;
    const value = Number(fromBalance.formatted);
    const reserve = fromSymbol === 'ETH' ? 0.001 : 0;
    setAmount(Number.isFinite(value) ? Math.max(value - reserve, 0).toFixed(6) : '');
  };

  const changeAmount = (value: string) => {
    if (value === '' || /^\d*(\.\d*)?$/.test(value)) {
      const [, decimals = ''] = value.split('.');
      if (decimals.length <= 6) setAmount(value);
    }
  };

  const requestWallet = () => window.dispatchEvent(new Event('kyox:open-wallet'));

  return (
    <div className="swap-panel">
      <div className="swap-title">EXECUTE SWAP <span style={{ color: '#6d7784', font: '9px DM Mono, monospace' }}>ROBINHOOD / UNISWAP V4</span></div>
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
          <button type="button" onClick={setMax} disabled={!isConnected || !connectedToRobinhood} style={{ padding: '5px 8px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, background: 'rgba(255,255,255,.04)', color: '#9aa4b1', font: '9px DM Mono, monospace' }}>MAX</button>
        </div>
        <div className="balance">{balanceLabel}</div>
        <div className="swap-divider" />
        <div className="swap-row">
          <span className="swap-label">YOU RECEIVE</span>
          <div className="token"><span className="token-dot" /> {flipped ? 'ETH' : 'USDG'} <ChevronDown size={12} /></div>
        </div>
        <div className="amount" style={{ color: '#6d7784', fontSize: 22 }}>{amount ? 'ROUTER QUOTE PENDING' : '0.00'}</div>
        <div className="balance">ROBINHOOD CHAIN ROUTING</div>
      </div>
      {!isConnected ? (
        <button className="swap-submit" type="button" onClick={requestWallet}><Wallet size={13} /> CONNECT WALLET TO TRADE</button>
      ) : !connectedToRobinhood ? (
        <button className="swap-submit" type="button" disabled><Wallet size={13} /> SWITCH TO ROBINHOOD CHAIN</button>
      ) : (
        <button className="swap-submit" type="button" disabled>
          <LoaderCircle size={13} /> ROUTING ENGINE INITIALIZING
        </button>
      )}
      <div style={{ marginTop: 10, color: '#5f6c7b', font: '8px DM Mono, monospace', lineHeight: 1.7, textAlign: 'center', minHeight: 13 }}>
        KYOX is replacing the previous Arbitrum V2 route with Robinhood Chain Uniswap V4 routing. No fake quote or transaction is shown.
      </div>
    </div>
  );
}
