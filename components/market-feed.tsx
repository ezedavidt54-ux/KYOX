'use client';

import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { usePublicClient } from 'wagmi';
import { ROBINHOOD_CHAIN_ID, USDC_ROBINHOOD, UNISWAP_V2_ROUTER_ROBINHOOD, WETH_ROBINHOOD, routerAbi } from '@/lib/swap';

export function MarketFeed() {
  const publicClient = usePublicClient({ chainId: ROBINHOOD_CHAIN_ID });
  const [price, setPrice] = useState<string | null>(null);
  const [status, setStatus] = useState('CONNECTING TO MARKET');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!publicClient) return;
      try {
        const amounts = await publicClient.readContract({
          address: UNISWAP_V2_ROUTER_ROBINHOOD,
          abi: routerAbi,
          functionName: 'getAmountsOut',
          args: [1_000_000_000_000_000_000n, [WETH_ROBINHOOD, USDC_ROBINHOOD]],
        });
        if (!cancelled) {
          setPrice(formatUnits(amounts[amounts.length - 1], 18));
          setStatus('LIVE ON CHAIN');
        }
      } catch {
        if (!cancelled) {
          setPrice(null);
          setStatus('NO LIQUIDITY ROUTE');
        }
      }
    };

    void load();
    const refresh = window.setInterval(() => { void load(); }, 10_000);
    return () => { cancelled = true; window.clearInterval(refresh); };
  }, [publicClient]);

  return (
    <>
      <div className="pair">ETH / USDC</div>
      <div className="price">{price ? `$${Number(price).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}</div>
      <div className="change" style={{ color: status === 'LIVE ON CHAIN' ? '#9ff6c4' : '#6d7784' }}>{status}</div>
    </>
  );
}
