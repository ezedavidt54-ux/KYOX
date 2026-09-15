'use client';

import { useEffect, useMemo, useState } from 'react';

interface MarketData {
  pair: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  swaps24h: number;
  candles: number[];
  updatedAt: number;
}

function money(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function price(value: number) {
  return value >= 1000 ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${value.toFixed(4)}`;
}

export function LiveMarket() {
  const [data, setData] = useState<MarketData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/market', { cache: 'no-store' });
        if (!response.ok) throw new Error('market unavailable');
        const next = await response.json();
        if (!cancelled) {
          setData(next);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    void load();
    const interval = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const points = useMemo(() => {
    if (!data?.candles.length) return '';
    const min = Math.min(...data.candles);
    const max = Math.max(...data.candles);
    const span = max - min || 1;
    return data.candles
      .map((value, index) => `${(index / Math.max(data.candles.length - 1, 1)) * 100},${92 - ((value - min) / span) * 76}`)
      .join(' ');
  }, [data]);

  return (
    <>
      <div className="market-top">
        <div>
          <div className="pair">ETH / USDC <span className="market-chain">ARBITRUM</span></div>
          <div className="price">{data ? price(data.price) : 'LOADING'}</div>
        </div>
        <div className={data && data.change24h >= 0 ? 'change positive' : 'change negative'}>
          {data ? `${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}% 24H` : error ? 'DATA OFFLINE' : 'SYNCING'}
        </div>
      </div>
      <div className="chart">
        <div className="chart-grid" />
        {points ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Live ETH USDC price chart">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
          </svg>
        ) : (
          <div className="chart-empty-state">{error ? 'MARKET DATA TEMPORARILY UNAVAILABLE' : 'CONNECTING TO LIVE MARKET'}</div>
        )}
        <div className="chart-live"><span /> LIVE / 15 SEC</div>
      </div>
      <div className="market-metrics">
        <div><span>24H VOLUME</span><strong>{data ? money(data.volume24h) : '...'}</strong></div>
        <div><span>LIQUIDITY</span><strong>{data ? money(data.liquidity) : '...'}</strong></div>
        <div><span>24H SWAPS</span><strong>{data ? data.swaps24h.toLocaleString() : '...'}</strong></div>
      </div>
    </>
  );
}
