'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, ChevronDown, LoaderCircle, Wallet } from 'lucide-react';
import { useAccount, useBalance, usePublicClient, useSwitchChain, useWalletClient } from 'wagmi';
import { formatUnits } from 'viem';
import {
  ROBINHOOD_CHAIN_ID,
  USDC_ROBINHOOD,
  UNISWAP_V2_ROUTER_ROBINHOOD,
  WETH_ROBINHOOD,
  erc20Abi,
  minimumOutput,
  parseSwapAmount,
  routerAbi,
} from '@/lib/swap';

const MAX_DECIMALS = 18;
const SLIPPAGE_BPS = 50;

export function SwapPanel() {
  const { address, chainId, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: ROBINHOOD_CHAIN_ID });
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: nativeBalance, isLoading: nativeLoading } = useBalance({ address, chainId: ROBINHOOD_CHAIN_ID });
  const { data: usdcBalance, isLoading: usdcLoading } = useBalance({ address, chainId: ROBINHOOD_CHAIN_ID, token: USDC_ROBINHOOD });
  const [amount, setAmount] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [quote, setQuote] = useState<bigint | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const fromSymbol = flipped ? 'USDC' : 'ETH';
  const toSymbol = flipped ? 'ETH' : 'USDC';
  const fromBalance = flipped ? usdcBalance : nativeBalance;

  const balanceLabel = useMemo(() => {
    if (!isConnected) return 'CONNECT WALLET TO VIEW BALANCE';
    if (nativeLoading || usdcLoading) return 'READING WALLET BALANCES...';
    return `BALANCE ${Number(fromBalance?.formatted ?? 0).toFixed(4)} ${fromSymbol}`;
  }, [fromBalance?.formatted, fromSymbol, isConnected, nativeLoading, usdcLoading]);

  const setMax = () => {
    if (!fromBalance) return;
    const value = Number(fromBalance.formatted);
    const reserve = fromSymbol === 'ETH' ? 0.001 : 0;
    setAmount(Number.isFinite(value) ? Math.max(value - reserve, 0).toFixed(6) : '');
  };

  const changeAmount = (value: string) => {
    if (value === '' || /^\d*(\.\d*)?$/.test(value)) {
      const [, decimals = ''] = value.split('.');
      if (decimals.length <= MAX_DECIMALS) setAmount(value);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadQuote = async () => {
      setQuote(null);
      setStatus('');
      if (!amount || !isConnected || chainId !== ROBINHOOD_CHAIN_ID || !publicClient) return;
      try {
        setQuoting(true);
        const amountIn = parseSwapAmount(amount, fromSymbol);
        const path = flipped ? [USDC_ROBINHOOD, WETH_ROBINHOOD] : [WETH_ROBINHOOD, USDC_ROBINHOOD];
        const amounts = await publicClient.readContract({
          address: UNISWAP_V2_ROUTER_ROBINHOOD,
          abi: routerAbi,
          functionName: 'getAmountsOut',
          args: [amountIn, path],
        });
        if (!cancelled) setQuote(amounts[amounts.length - 1]);
      } catch {
        if (!cancelled) setStatus('NO ROUTE AVAILABLE FOR THIS SIZE');
      } finally {
        if (!cancelled) setQuoting(false);
      }
    };
    void loadQuote();
    return () => { cancelled = true; };
  }, [amount, chainId, flipped, fromSymbol, isConnected, publicClient]);

  const executeSwap = async () => {
    if (!address || !walletClient || !publicClient || !amount || !quote) return;
    if (chainId !== ROBINHOOD_CHAIN_ID) {
      switchChain({ chainId: ROBINHOOD_CHAIN_ID });
      return;
    }

    try {
      setBusy(true);
      setStatus('PREPARING TRANSACTION...');
      const amountIn = parseSwapAmount(amount, fromSymbol);
      const minOut = minimumOutput(quote, SLIPPAGE_BPS);
      const path = flipped ? [USDC_ROBINHOOD, WETH_ROBINHOOD] as const : [WETH_ROBINHOOD, USDC_ROBINHOOD] as const;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 900);

      if (flipped) {
        const allowance = await publicClient.readContract({ address: USDC_ROBINHOOD, abi: erc20Abi, functionName: 'allowance', args: [address, UNISWAP_V2_ROUTER_ROBINHOOD] });
        if (allowance < amountIn) {
          setStatus('APPROVE USDC IN YOUR WALLET...');
          const approvalHash = await walletClient.writeContract({ address: USDC_ROBINHOOD, abi: erc20Abi, functionName: 'approve', args: [UNISWAP_V2_ROUTER_ROBINHOOD, amountIn], chain: walletClient.chain, account: address });
          await publicClient.waitForTransactionReceipt({ hash: approvalHash });
        }
        setStatus('CONFIRM SWAP IN YOUR WALLET...');
        const hash = await walletClient.writeContract({ address: UNISWAP_V2_ROUTER_ROBINHOOD, abi: routerAbi, functionName: 'swapExactTokensForETH', args: [amountIn, minOut, path, address, deadline], chain: walletClient.chain, account: address });
        setStatus('SWAP SUBMITTED. WAITING FOR CONFIRMATION...');
        await publicClient.waitForTransactionReceipt({ hash });
      } else {
        setStatus('CONFIRM SWAP IN YOUR WALLET...');
        const hash = await walletClient.writeContract({ address: UNISWAP_V2_ROUTER_ROBINHOOD, abi: routerAbi, functionName: 'swapExactETHForTokens', args: [minOut, path, address, deadline], value: amountIn, chain: walletClient.chain, account: address });
        setStatus('SWAP SUBMITTED. WAITING FOR CONFIRMATION...');
        await publicClient.waitForTransactionReceipt({ hash });
      }
      setStatus('SWAP CONFIRMED ON ROBINHOOD CHAIN');
      setAmount('');
      setQuote(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction rejected or failed';
      setStatus(message.length > 72 ? `${message.slice(0, 69)}...` : message);
    } finally {
      setBusy(false);
    }
  };

  const receiveLabel = quote ? formatUnits(quote, 18) : amount && quoting ? 'FETCHING QUOTE...' : amount ? 'NO QUOTE' : '0.00';
  const requestWallet = () => window.dispatchEvent(new Event('kyox:open-wallet'));

  return (
    <div className="swap-panel">
      <div className="swap-title">EXECUTE SWAP <span style={{ color: '#6d7784', font: '9px DM Mono, monospace' }}>ROBINHOOD / UNISWAP V2</span></div>
      <div className="swap-box">
        <div className="swap-row"><span className="swap-label">YOU PAY</span><button className="token" type="button" onClick={() => setFlipped((value) => !value)}><span className="token-dot" /> {fromSymbol} <ChevronDown size={12} /></button></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <input style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', color: '#fff', font: '500 30px DM Mono, monospace' }} inputMode="decimal" value={amount} onChange={(event) => changeAmount(event.target.value)} placeholder="0.00" aria-label={`Amount of ${fromSymbol} to swap`} />
          <button type="button" onClick={setMax} disabled={!isConnected} style={{ padding: '5px 8px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, background: 'rgba(255,255,255,.04)', color: '#9aa4b1', font: '9px DM Mono, monospace' }}>MAX</button>
        </div>
        <div className="balance">{balanceLabel}</div>
        <button type="button" aria-label="Reverse swap pair" onClick={() => setFlipped((value) => !value)} style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, margin: '14px auto -2px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, background: '#0b0e12', color: '#aab4c0' }}><ArrowDownUp size={14} /></button>
        <div className="swap-divider" />
        <div className="swap-row"><span className="swap-label">YOU RECEIVE</span><div className="token"><span className="token-dot" /> {toSymbol} <ChevronDown size={12} /></div></div>
        <div className="amount" style={{ color: quote ? '#fff' : '#6d7784', fontSize: 22 }}>{receiveLabel}</div>
        <div className="balance">{quote ? `${SLIPPAGE_BPS / 100}% MAX SLIPPAGE` : 'LIVE ON CHAIN QUOTE'}</div>
      </div>
      {!isConnected ? (
        <button className="swap-submit" type="button" onClick={requestWallet}><Wallet size={13} /> CONNECT WALLET TO TRADE</button>
      ) : chainId !== ROBINHOOD_CHAIN_ID ? (
        <button className="swap-submit" type="button" onClick={() => switchChain({ chainId: ROBINHOOD_CHAIN_ID })} disabled={switching}><Wallet size={13} /> SWITCH TO ROBINHOOD CHAIN</button>
      ) : (
        <button className="swap-submit" type="button" onClick={executeSwap} disabled={!amount || !quote || busy || quoting}>{busy ? <LoaderCircle size={13} className="spin" /> : <Wallet size={13} />}{busy ? 'PROCESSING...' : quote ? `SWAP ${fromSymbol} FOR ${toSymbol}` : 'ENTER AMOUNT'}</button>
      )}
      <div style={{ marginTop: 10, color: status.includes('CONFIRMED') ? '#9ff6c4' : '#4f5966', font: '8px DM Mono, monospace', lineHeight: 1.7, textAlign: 'center', minHeight: 13 }}>{status || '0.50% slippage protection. Transactions execute on Robinhood Chain.'}</div>
    </div>
  );
}
