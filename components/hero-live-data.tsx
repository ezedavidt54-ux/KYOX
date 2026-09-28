'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { MarketFeed } from '@/components/market-feed';
import { ROBINHOOD_CHAIN_ID } from '@/lib/robinhood';

export function HeroLiveData() {
  const publicClient = usePublicClient({ chainId: ROBINHOOD_CHAIN_ID });
  const [block, setBlock] = useState<bigint | null>(null);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!publicClient) return;
      try {
        const nextBlock = await publicClient.getBlockNumber();
        if (!cancelled) {
          setBlock(nextBlock);
          setUpdated(true);
        }
      } catch {
        if (!cancelled) setUpdated(false);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [publicClient]);

  return (
    <aside className="kx-hero-live" aria-label="Live KYOX market data">
      <div className="kx-hero-live-head">
        <div><span className="kx-live" /> LIVE MARKET DATA</div>
        <span>{updated ? '10S REFRESH' : 'CONNECTING'}</span>
      </div>
      <div className="kx-hero-live-main">
        <div>
          <span className="kx-live-label">ETH / USDC</span>
          <strong><MarketFeed /></strong>
        </div>
        <div className="kx-hero-live-block">
          <span className="kx-live-label">CHAIN</span>
          <strong>ROBINHOOD</strong>
          <small>{block ? `BLOCK ${block.toString()}` : 'BLOCK —'}</small>
        </div>
      </div>
      <div className="kx-hero-live-foot">
        <span>ON CHAIN</span><span>•</span><span>ROBINHOOD CHAIN</span><span>•</span><span>REAL DATA</span>
      </div>
    </aside>
  );
}
