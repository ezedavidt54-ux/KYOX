import { NextResponse } from 'next/server';

export const revalidate = 15;

export async function GET() {
  try {
    const searchResponse = await fetch('https://api.dexscreener.com/latest/dex/search/?q=WETH%20USDC%20Arbitrum', {
      next: { revalidate: 15 },
    });
    if (!searchResponse.ok) throw new Error('Market search failed');

    const searchData = await searchResponse.json();
    const pairs = Array.isArray(searchData.pairs) ? searchData.pairs : [];
    const pair = pairs
      .filter((item: { chainId?: string; baseToken?: { symbol?: string }; quoteToken?: { symbol?: string }; liquidity?: { usd?: number } }) =>
        item.chainId === 'arbitrum' &&
        ((item.baseToken?.symbol === 'WETH' && item.quoteToken?.symbol === 'USDC') ||
          (item.baseToken?.symbol === 'USDC' && item.quoteToken?.symbol === 'WETH')),
      )
      .sort((a: { liquidity?: { usd?: number } }, b: { liquidity?: { usd?: number } }) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

    if (!pair?.pairAddress) throw new Error('Arbitrum ETH USDC market unavailable');

    const poolResponse = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/arbitrum/pools/${pair.pairAddress}/ohlcv/minute?aggregate=15&limit=80`,
      { next: { revalidate: 15 } },
    );

    let candles: number[][] = [];
    if (poolResponse.ok) {
      const poolData = await poolResponse.json();
      candles = poolData?.data?.attributes?.ohlcv_list ?? [];
    }

    return NextResponse.json({
      pair: 'ETH / USDC',
      price: Number(pair.priceUsd ?? 0),
      change24h: Number(pair.priceChange?.h24 ?? 0),
      volume24h: Number(pair.volume?.h24 ?? 0),
      liquidity: Number(pair.liquidity?.usd ?? 0),
      swaps24h: Number(pair.txns?.h24?.buys ?? 0) + Number(pair.txns?.h24?.sells ?? 0),
      candles: candles.map((candle) => Number(candle[4])).filter(Number.isFinite).slice(-80),
      source: 'DexScreener / GeckoTerminal',
      updatedAt: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load market data' },
      { status: 503 },
    );
  }
}
