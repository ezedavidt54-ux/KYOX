'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, BarChart3, CheckCircle2, Droplets, ExternalLink, Filter, Layers3, RefreshCw, Search, ShieldCheck, Star, Waves } from 'lucide-react';
import { formatUnits, type Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { ROBINHOOD_CHAIN_ID, USDC_ROBINHOOD, WETH_ROBINHOOD } from '@/lib/swap';

const FACTORY = '0x8bceAA40B9acDFAedF85adf4Ff01F5aD6517937F' as Address;
const EXPLORER = 'https://robinhoodchain.blockscout.com';
const MAX_PAIRS = 36;

const factoryAbi = [
  { type: 'function', name: 'allPairsLength', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allPairs', stateMutability: 'view', inputs: [{ name: '', type: 'uint256' }], outputs: [{ type: 'address' }] },
] as const;

const pairAbi = [
  { type: 'function', name: 'token0', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'token1', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'getReserves', stateMutability: 'view', inputs: [], outputs: [{ name: 'reserve0', type: 'uint112' }, { name: 'reserve1', type: 'uint112' }, { name: 'blockTimestampLast', type: 'uint32' }] },
] as const;

const tokenAbi = [
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const;

type Pair = {
  address: Address;
  token0: Address;
  token1: Address;
  symbol0: string;
  symbol1: string;
  decimals0: number;
  decimals1: number;
  reserve0: bigint;
  reserve1: bigint;
};

type StockToken = {
  symbol: string;
  name: string;
  address: Address;
  logoUrl?: string;
  status: string;
  allDay?: string | null;
  price?: number;
  bid?: number;
  ask?: number;
  volume?: number;
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatAmount(value: bigint, decimals: number, digits = 4) {
  const number = Number(formatUnits(value, decimals));
  if (!Number.isFinite(number)) return '—';
  return number.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function formatUsd(value: number | null) {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function MarketsDashboard() {
  const publicClient = usePublicClient({ chainId: ROBINHOOD_CHAIN_ID });
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [stockTokens, setStockTokens] = useState<StockToken[]>([]);
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [pairCount, setPairCount] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'CORE' | 'RWA'>('ALL');
  const [selected, setSelected] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const loadMarkets = useCallback(async () => {
    if (!publicClient) return;
    setRefreshing(true);
    try {
      const [count, latestBlock] = await Promise.all([
        publicClient.readContract({ address: FACTORY, abi: factoryAbi, functionName: 'allPairsLength' }),
        publicClient.getBlockNumber(),
      ]);
      const total = Number(count);
      setPairCount(total);
      setBlockNumber(latestBlock);
      const start = Math.max(0, total - MAX_PAIRS);
      const indexes = Array.from({ length: Math.min(MAX_PAIRS, total) }, (_, i) => BigInt(start + i));
      if (!indexes.length) {
        setPairs([]);
        setLastUpdated(new Date());
        return;
      }

      const addressResults = await publicClient.multicall({
        contracts: indexes.map((index) => ({ address: FACTORY, abi: factoryAbi, functionName: 'allPairs', args: [index] })),
        allowFailure: true,
      });
      const pairAddresses = addressResults.flatMap((item) => item.status === 'success' ? [item.result as Address] : []);
      if (!pairAddresses.length) throw new Error('No pair addresses returned from the factory');

      const pairReads = await publicClient.multicall({
        contracts: pairAddresses.flatMap((address) => [
          { address, abi: pairAbi, functionName: 'token0' },
          { address, abi: pairAbi, functionName: 'token1' },
          { address, abi: pairAbi, functionName: 'getReserves' },
        ]),
        allowFailure: true,
      });

      const raw = pairAddresses.flatMap((address, i) => {
        const token0Read = pairReads[i * 3];
        const token1Read = pairReads[i * 3 + 1];
        const reservesRead = pairReads[i * 3 + 2];
        if (token0Read.status !== 'success' || token1Read.status !== 'success' || reservesRead.status !== 'success') return [];
        const reserves = reservesRead.result as readonly [bigint, bigint, number];
        return [{ address, token0: token0Read.result as Address, token1: token1Read.result as Address, reserve0: reserves[0], reserve1: reserves[1] }];
      });

      const uniqueTokens = Array.from(new Set(raw.flatMap((item) => [item.token0, item.token1])));
      const tokenReads = await publicClient.multicall({
        contracts: uniqueTokens.flatMap((address) => [
          { address, abi: tokenAbi, functionName: 'symbol' },
          { address, abi: tokenAbi, functionName: 'decimals' },
        ]),
        allowFailure: true,
      });
      const metadata = new Map<string, { symbol: string; decimals: number }>();
      uniqueTokens.forEach((address, i) => {
        const symbolRead = tokenReads[i * 2];
        const decimalsRead = tokenReads[i * 2 + 1];
        metadata.set(address.toLowerCase(), {
          symbol: symbolRead.status === 'success' ? String(symbolRead.result) : shortAddress(address),
          decimals: decimalsRead.status === 'success' ? Number(decimalsRead.result) : 18,
        });
      });

      setPairs(raw.map((item) => {
        const a = metadata.get(item.token0.toLowerCase()) ?? { symbol: shortAddress(item.token0), decimals: 18 };
        const b = metadata.get(item.token1.toLowerCase()) ?? { symbol: shortAddress(item.token1), decimals: 18 };
        return { ...item, symbol0: a.symbol, symbol1: b.symbol, decimals0: a.decimals, decimals1: b.decimals };
      }).reverse());
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read Robinhood Chain markets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [publicClient]);

  const loadStockTokens = useCallback(async () => {
    setStockLoading(true);
    try {
      const response = await fetch('https://api.robinhood.com/rhj/assets', { cache: 'no-store' });
      if (!response.ok) throw new Error('Stock token API unavailable');
      const data = await response.json() as { assets?: Array<{ tokenSymbol: string; tokenName: string; deployments?: Array<{ contractAddress: string; chainId: number }>; logoUrl?: string; status: string; tradingCapabilities?: { allDayTradability?: string | null } }> };
      const assets = (data.assets ?? []).flatMap((asset) => {
        const deployment = asset.deployments?.find((item) => item.chainId === ROBINHOOD_CHAIN_ID);
        return deployment ? [{ symbol: asset.tokenSymbol, name: asset.tokenName, address: deployment.contractAddress as Address, logoUrl: asset.logoUrl, status: asset.status, allDay: asset.tradingCapabilities?.allDayTradability }] : [];
      }).filter((asset) => asset.status === 'ASSET_STATUS_ACTIVE').slice(0, 12);
      const priced = await Promise.all(assets.slice(0, 8).map(async (asset) => {
        try {
          const priceResponse = await fetch(`https://api.robinhood.com/rhj/prices/${encodeURIComponent(asset.symbol)}`, { cache: 'no-store' });
          if (!priceResponse.ok) return asset;
          const priceData = await priceResponse.json() as { quotes?: Array<{ bid: string; ask: string; dailyTradingVolume: string }> };
          const quote = priceData.quotes?.[0];
          if (!quote) return asset;
          const bid = Number(quote.bid);
          const ask = Number(quote.ask);
          return { ...asset, bid, ask, price: (bid + ask) / 2, volume: Number(quote.dailyTradingVolume) };
        } catch {
          return asset;
        }
      }));
      setStockTokens([...priced, ...assets.slice(8)]);
    } catch {
      setStockTokens([]);
    } finally {
      setStockLoading(false);
    }
  }, []);

  useEffect(() => { void loadMarkets(); }, [loadMarkets]);
  useEffect(() => { void loadStockTokens(); }, [loadStockTokens]);
  useEffect(() => {
    const timer = window.setInterval(() => { void loadMarkets(); }, 15_000);
    return () => window.clearInterval(timer);
  }, [loadMarkets]);

  const ethUsd = useMemo(() => {
    const ethPair = pairs.find((pair) => {
      const symbols = [pair.symbol0.toUpperCase(), pair.symbol1.toUpperCase()];
      return symbols.includes('WETH') && symbols.includes('USDC');
    });
    if (!ethPair) return null;
    const ethIs0 = ethPair.symbol0.toUpperCase() === 'WETH';
    const ethReserve = Number(formatUnits(ethIs0 ? ethPair.reserve0 : ethPair.reserve1, ethIs0 ? ethPair.decimals0 : ethPair.decimals1));
    const usdReserve = Number(formatUnits(ethIs0 ? ethPair.reserve1 : ethPair.reserve0, ethIs0 ? ethPair.decimals1 : ethPair.decimals0));
    return ethReserve > 0 ? usdReserve / ethReserve : null;
  }, [pairs]);

  const filteredPairs = useMemo(() => pairs.filter((pair) => {
    const haystack = `${pair.symbol0} ${pair.symbol1} ${pair.address}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (filter === 'CORE') return [pair.symbol0, pair.symbol1].some((symbol) => ['WETH', 'USDC', 'USDT', 'USDG'].includes(symbol.toUpperCase()));
    if (filter === 'RWA') return ![pair.symbol0, pair.symbol1].some((symbol) => ['WETH', 'USDC', 'USDT', 'USDG'].includes(symbol.toUpperCase()));
    return true;
  }), [pairs, query, filter]);

  const getPairPrice = (pair: Pair) => {
    const r0 = Number(formatUnits(pair.reserve0, pair.decimals0));
    const r1 = Number(formatUnits(pair.reserve1, pair.decimals1));
    return r0 > 0 ? r1 / r0 : null;
  };

  const getLiquidityUsd = (pair: Pair) => {
    const s0 = pair.symbol0.toUpperCase();
    const s1 = pair.symbol1.toUpperCase();
    const r0 = Number(formatUnits(pair.reserve0, pair.decimals0));
    const r1 = Number(formatUnits(pair.reserve1, pair.decimals1));
    if (ethUsd && s0 === 'WETH') return r0 * ethUsd * 2;
    if (ethUsd && s1 === 'WETH') return r1 * ethUsd * 2;
    if (s0 === 'USDC' || s0 === 'USDG' || s0 === 'USDT') return r0 * 2;
    if (s1 === 'USDC' || s1 === 'USDG' || s1 === 'USDT') return r1 * 2;
    return null;
  };

  const livePairCount = pairCount ?? pairs.length;
  const corePairs = pairs.filter((pair) => [pair.symbol0, pair.symbol1].some((symbol) => ['WETH', 'USDC', 'USDG', 'USDT'].includes(symbol.toUpperCase()))).length;
  const watched = (address: string) => watchlist.includes(address.toLowerCase());

  return (
    <div className="markets-page">
      <style jsx>{`
        .markets-page{margin-top:34px}.market-hero{display:grid;grid-template-columns:1.4fr .6fr;gap:16px}.market-panel{border:1px solid rgba(255,255,255,.09);border-radius:20px;background:linear-gradient(145deg,rgba(13,16,21,.9),rgba(6,8,11,.78));box-shadow:0 24px 80px rgba(0,0,0,.24)}.hero-panel{padding:28px}.hero-panel h2{font-size:clamp(28px,4vw,52px);line-height:.98;letter-spacing:-.06em;margin:0;max-width:700px}.hero-panel p{color:#798391;line-height:1.7;max-width:690px;margin:16px 0 0;font-size:13px}.live-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}.live-chip{display:inline-flex;align-items:center;gap:7px;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:#9da7b4;background:rgba(255,255,255,.025);font:9px 'DM Mono',monospace;letter-spacing:.08em}.live-dot{width:6px;height:6px;border-radius:50%;background:#9ff6c4;box-shadow:0 0 9px #9ff6c4}.network-panel{padding:24px;display:grid;align-content:space-between;min-height:190px}.network-label{font:9px 'DM Mono',monospace;color:#687381;letter-spacing:.18em}.network-name{font-size:23px;font-weight:800;letter-spacing:-.04em;margin-top:7px}.network-value{font:11px 'DM Mono',monospace;color:#aeb7c3;margin-top:8px}.network-actions{display:flex;gap:8px;margin-top:22px}.mini-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:rgba(255,255,255,.035);color:#c7ced7;font:9px 'DM Mono',monospace;letter-spacing:.06em;text-decoration:none}.mini-btn:hover{background:rgba(255,255,255,.08);color:#fff}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}.metric{padding:18px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.018)}.metric span{display:block;color:#606a77;font:8px 'DM Mono',monospace;letter-spacing:.16em}.metric strong{display:block;margin-top:9px;font:600 19px 'DM Mono',monospace;letter-spacing:-.04em}.metric small{display:block;margin-top:5px;color:#56606c;font:8px 'DM Mono',monospace}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:42px;margin-bottom:12px}.section-title{font-size:17px;font-weight:800;letter-spacing:-.03em}.section-title span{display:block;color:#687381;font:9px 'DM Mono',monospace;letter-spacing:.16em;text-transform:uppercase;margin-bottom:7px}.toolbar-right{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.search{display:flex;align-items:center;gap:8px;padding:9px 11px;border:1px solid rgba(255,255,255,.09);border-radius:10px;background:rgba(255,255,255,.025);min-width:190px}.search input{width:100%;border:0;outline:0;background:transparent;color:#e8edf4;font:10px 'DM Mono',monospace}.search input::placeholder{color:#56606b}.filter-btn{padding:9px 11px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:transparent;color:#697481;font:9px 'DM Mono',monospace}.filter-btn.active,.filter-btn:hover{color:#fff;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}.table{overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(6,8,11,.72)}.table-head,.market-row{display:grid;grid-template-columns:2fr 1.15fr 1.1fr 1.05fr .7fr 34px;align-items:center;gap:12px}.table-head{padding:12px 15px;border-bottom:1px solid rgba(255,255,255,.07);color:#56616e;font:8px 'DM Mono',monospace;letter-spacing:.13em;text-transform:uppercase}.market-row{padding:14px 15px;border-bottom:1px solid rgba(255,255,255,.055);cursor:pointer;transition:background .15s}.market-row:last-child{border-bottom:0}.market-row:hover{background:rgba(255,255,255,.028)}.pair-name{display:flex;align-items:center;gap:10px;min-width:0}.pair-icons{display:flex}.coin{display:grid;place-items:center;width:29px;height:29px;border:1px solid rgba(255,255,255,.1);border-radius:50%;background:linear-gradient(145deg,#1a2028,#090b0e);font:8px 'DM Mono',monospace;color:#dce3ec}.coin+ .coin{margin-left:-8px}.pair-copy{min-width:0}.pair-copy strong{display:block;font-size:11px}.pair-copy small{display:block;color:#59636f;font:8px 'DM Mono',monospace;margin-top:4px}.cell{font:10px 'DM Mono',monospace;color:#aeb7c2}.cell strong{display:block;color:#e2e7ee;font-weight:500}.cell small{display:block;color:#58626f;font-size:8px;margin-top:4px}.status{display:inline-flex;align-items:center;gap:5px;color:#9ff6c4;font:8px 'DM Mono',monospace}.status i{width:5px;height:5px;border-radius:50%;background:#9ff6c4}.star{display:grid;place-items:center;width:28px;height:28px;border:0;background:transparent;color:#4d5763}.star.active,.star:hover{color:#fff}.details{grid-column:1/-1;padding:14px 0 2px;margin-top:2px;border-top:1px solid rgba(255,255,255,.06);display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.detail-box{padding:11px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.02)}.detail-box span{display:block;color:#56606c;font:7px 'DM Mono',monospace;letter-spacing:.12em}.detail-box strong{display:block;margin-top:5px;font:9px 'DM Mono',monospace;color:#cfd6df;word-break:break-all}.empty{padding:50px 20px;text-align:center;color:#5c6672;font:10px 'DM Mono',monospace}.token-section{margin-top:42px}.token-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.token-card{padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(7,9,12,.68)}.token-top{display:flex;justify-content:space-between;gap:10px}.token-symbol{display:flex;align-items:center;gap:9px}.token-logo{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.1);object-fit:cover;background:#101419}.token-symbol strong{display:block;font-size:11px}.token-symbol small{display:block;color:#5e6874;font:8px 'DM Mono',monospace;margin-top:3px}.token-price{margin-top:16px;font:600 20px 'DM Mono',monospace}.token-meta{display:flex;justify-content:space-between;margin-top:8px;color:#5e6874;font:8px 'DM Mono',monospace}.venue-section{margin:42px 0 80px}.venue-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.venue{padding:18px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.018)}.venue-top{display:flex;justify-content:space-between;align-items:center}.venue h3{margin:12px 0 7px;font-size:12px}.venue p{margin:0;color:#687381;font-size:10px;line-height:1.6}.venue-badge{color:#9ff6c4;font:8px 'DM Mono',monospace;letter-spacing:.08em}.data-note{margin-top:13px;color:#555f6b;font:8px 'DM Mono',monospace;line-height:1.7}.refreshing{animation:spin .9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:900px){.market-hero{grid-template-columns:1fr}.metric-grid{grid-template-columns:repeat(2,1fr)}.token-grid,.venue-grid{grid-template-columns:repeat(2,1fr)}.table-head{display:none}.market-row{grid-template-columns:1fr auto;padding:16px}.market-row>.cell:nth-child(2),.market-row>.cell:nth-child(3),.market-row>.cell:nth-child(4),.market-row>.cell:nth-child(5){display:none}.details{grid-template-columns:1fr 1fr}.toolbar{align-items:flex-start;flex-direction:column}.toolbar-right{width:100%;justify-content:flex-start}.search{flex:1;min-width:0;width:100%}}
        @media(max-width:560px){.hero-panel,.network-panel{padding:20px}.metric-grid{grid-template-columns:1fr 1fr}.token-grid,.venue-grid{grid-template-columns:1fr}.details{grid-template-columns:1fr}.live-row{gap:6px}.network-actions{flex-wrap:wrap}}
      `}</style>

      <div className="market-hero">
        <section className="market-panel hero-panel">
          <div className="eyebrow">KYOX / MARKET INTELLIGENCE</div>
          <h2>Every market. One onchain surface.</h2>
          <p>Discover live token pairs, liquidity, prices, Robinhood Stock Tokens and execution venues across Robinhood Chain. KYOX reads the chain directly instead of presenting a static market catalogue.</p>
          <div className="live-row">
            <span className="live-chip"><i className="live-dot" /> ONCHAIN DATA</span>
            <span className="live-chip"><Waves size={11} /> UNISWAP V2</span>
            <span className="live-chip"><ShieldCheck size={11} /> ROBINHOOD CHAIN</span>
            <span className="live-chip"><Activity size={11} /> AUTO REFRESH 15S</span>
          </div>
        </section>
        <aside className="market-panel network-panel">
          <div>
            <div className="network-label">NETWORK STATUS</div>
            <div className="network-name">Robinhood Chain</div>
            <div className="network-value">CHAIN 4663 · {blockNumber ? `BLOCK ${blockNumber.toString()}` : 'CONNECTING'}</div>
          </div>
          <div className="network-actions">
            <button className="mini-btn" onClick={() => void loadMarkets()}><RefreshCw size={11} className={refreshing ? 'refreshing' : ''} /> REFRESH</button>
            <a className="mini-btn" href={EXPLORER} target="_blank" rel="noreferrer"><ExternalLink size={11} /> EXPLORER</a>
          </div>
        </aside>
      </div>

      <div className="metric-grid">
        <div className="metric"><span>PAIRS DISCOVERED</span><strong>{livePairCount ?? '—'}</strong><small>UNISWAP V2 FACTORY</small></div>
        <div className="metric"><span>CORE MARKETS</span><strong>{corePairs}</strong><small>ETH / STABLECOIN ROUTES</small></div>
        <div className="metric"><span>STOCK TOKENS</span><strong>{stockLoading ? '…' : stockTokens.length || '—'}</strong><small>ROBINHOOD CHAIN REGISTRY</small></div>
        <div className="metric"><span>ETH / USD</span><strong>{ethUsd ? `$${ethUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}</strong><small>ONCHAIN POOL IMPLIED PRICE</small></div>
      </div>

      <div className="toolbar">
        <div className="section-title"><span>MARKET DISCOVERY</span>Live token pairs</div>
        <div className="toolbar-right">
          <label className="search"><Search size={12} color="#65707c" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pair or address" /></label>
          <button className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}><Filter size={10} /> ALL</button>
          <button className={`filter-btn ${filter === 'CORE' ? 'active' : ''}`} onClick={() => setFilter('CORE')}>CORE</button>
          <button className={`filter-btn ${filter === 'RWA' ? 'active' : ''}`} onClick={() => setFilter('RWA')}>OTHER</button>
        </div>
      </div>

      <section className="table">
        <div className="table-head"><span>MARKET</span><span>PRICE</span><span>LIQUIDITY</span><span>RESERVES</span><span>VENUE</span><span /></div>
        {loading && <div className="empty">READING THE ROBINHOOD CHAIN MARKET REGISTRY…</div>}
        {!loading && error && <div className="empty">{error}<div className="data-note">The network itself may still be live. Use REFRESH to retry the public RPC.</div></div>}
        {!loading && !error && filteredPairs.length === 0 && <div className="empty">NO MARKETS MATCH YOUR SEARCH.</div>}
        {!loading && !error && filteredPairs.map((pair) => {
          const price = getPairPrice(pair);
          const liquidity = getLiquidityUsd(pair);
          const isSelected = selected === pair.address;
          return (
            <div key={pair.address} className="market-row" onClick={() => setSelected(isSelected ? null : pair.address)}>
              <div className="pair-name">
                <div className="pair-icons"><span className="coin">{pair.symbol0.slice(0, 2)}</span><span className="coin">{pair.symbol1.slice(0, 2)}</span></div>
                <div className="pair-copy"><strong>{pair.symbol0} / {pair.symbol1}</strong><small>{shortAddress(pair.address)} · V2 POOL</small></div>
              </div>
              <div className="cell"><strong>{price === null ? '—' : price < 0.000001 ? price.toExponential(2) : price.toLocaleString(undefined, { maximumFractionDigits: 6 })}</strong><small>{pair.symbol1} per {pair.symbol0}</small></div>
              <div className="cell"><strong>{formatUsd(liquidity)}</strong><small>{liquidity ? 'EST. FROM POOL RESERVES' : 'USD ROUTE NEEDED'}</small></div>
              <div className="cell"><strong>{formatAmount(pair.reserve0, pair.decimals0, 3)} {pair.symbol0}</strong><small>{formatAmount(pair.reserve1, pair.decimals1, 3)} {pair.symbol1}</small></div>
              <div><span className="status"><i /> LIVE</span></div>
              <button className={`star ${watched(pair.address) ? 'active' : ''}`} onClick={(event) => { event.stopPropagation(); setWatchlist((current) => current.includes(pair.address.toLowerCase()) ? current.filter((item) => item !== pair.address.toLowerCase()) : [...current, pair.address.toLowerCase()]); }} aria-label="Watch market"><Star size={13} fill={watched(pair.address) ? 'currentColor' : 'none'} /></button>
              {isSelected && <div className="details">
                <div className="detail-box"><span>POOL CONTRACT</span><strong>{pair.address}</strong></div>
                <div className="detail-box"><span>TOKEN 0</span><strong>{pair.token0}</strong></div>
                <div className="detail-box"><span>TOKEN 1</span><strong>{pair.token1}</strong></div>
                <div className="detail-box"><span>RESERVE 0</span><strong>{formatAmount(pair.reserve0, pair.decimals0, 8)} {pair.symbol0}</strong></div>
                <div className="detail-box"><span>RESERVE 1</span><strong>{formatAmount(pair.reserve1, pair.decimals1, 8)} {pair.symbol1}</strong></div>
                <div className="detail-box"><span>EXPLORER</span><strong><a href={`${EXPLORER}/address/${pair.address}`} target="_blank" rel="noreferrer" style={{color:'#dbe4ee',textDecoration:'none'}}>VIEW CONTRACT <ArrowUpRight size={10} /></a></strong></div>
              </div>}
            </div>
          );
        })}
      </section>
      <div className="data-note">Direct pool reads expose current reserves and implied price. USD liquidity is estimated only where a stablecoin or WETH route makes the calculation defensible. KYOX does not label missing 24h volume as zero. {lastUpdated ? `Last chain refresh ${lastUpdated.toLocaleTimeString()}.` : ''}</div>

      <section className="token-section">
        <div className="toolbar"><div className="section-title"><span>REAL WORLD ASSETS</span>Robinhood Stock Tokens</div><a className="mini-btn" href="https://docs.robinhood.com/chain/contracts/" target="_blank" rel="noreferrer">TOKEN REGISTRY <ArrowUpRight size={11} /></a></div>
        <div className="token-grid">
          {stockLoading && <div className="empty" style={{gridColumn:'1/-1'}}>LOADING ROBINHOOD STOCK TOKEN REGISTRY…</div>}
          {!stockLoading && !stockTokens.length && <div className="empty" style={{gridColumn:'1/-1'}}>STOCK TOKEN DATA IS TEMPORARILY UNAVAILABLE.</div>}
          {!stockLoading && stockTokens.map((token) => (
            <article className="token-card" key={token.address}>
              <div className="token-top"><div className="token-symbol">{token.logoUrl ? <img className="token-logo" src={token.logoUrl} alt="" /> : <span className="token-logo" />}<div><strong>{token.symbol}</strong><small>{token.name.replace(' • Robinhood Token','')}</small></div></div><CheckCircle2 size={13} color="#9ff6c4" /></div>
              <div className="token-price">{token.price ? `$${token.price.toLocaleString(undefined,{maximumFractionDigits:2})}` : 'PRICE —'}</div>
              <div className="token-meta"><span>{token.allDay === 'tradable' ? '24/5' : 'SESSION BASED'}</span><span>{token.volume ? `${formatUsd(token.volume)} VOL` : 'VOLUME —'}</span></div>
              <div className="data-note">{shortAddress(token.address)}</div>
            </article>
          ))}
        </div>
        <div className="data-note">Robinhood's official Stock Token API provides asset metadata, chain deployments and live bid/ask data. The price shown here is the midpoint of the current bid and ask when a quote is available. citeturn5view0</div>
      </section>

      <section className="venue-section">
        <div className="toolbar"><div className="section-title"><span>EXECUTION SURFACE</span>Market infrastructure</div></div>
        <div className="venue-grid">
          <article className="venue"><div className="venue-top"><Layers3 size={15} /><span className="venue-badge">ONCHAIN</span></div><h3>Uniswap V2</h3><p>Current KYOX pool discovery and reserve reads. The canonical V2 factory and router are already wired into the trading surface.</p></article>
          <article className="venue"><div className="venue-top"><BarChart3 size={15} /><span className="venue-badge">DEPLOYED</span></div><h3>Uniswap V3 / V4</h3><p>Concentrated and singleton liquidity infrastructure is deployed on Robinhood Chain and should become the next depth source for KYOX routing.</p></article>
          <article className="venue"><div className="venue-top"><Activity size={15} /><span className="venue-badge">EXECUTION</span></div><h3>UniswapX</h3><p>Gasless order settlement infrastructure is deployed for Robinhood Chain. KYOX can surface it as an execution venue once quote and fill telemetry is indexed.</p></article>
          <article className="venue"><div className="venue-top"><Droplets size={15} /><span className="venue-badge">ECOSYSTEM</span></div><h3>Rialto · Morpho · Perps</h3><p>Robinhood Chain's ecosystem also includes Rialto, Morpho, Lighter and Arcus. KYOX should expose these as separate market classes rather than mixing spot pools with derivatives or lending.</p></article>
        </div>
        <div className="data-note">Official Robinhood documentation describes Uniswap as the public DEX, Rialto as a PropAMM / aggregator, Morpho as lending, and Lighter and Arcus as perpetuals infrastructure. citeturn1search3 Uniswap's deployment records confirm V4 PoolManager and other contracts on chain 4663. citeturn2search2</div>
      </section>
    </div>
  );
}
