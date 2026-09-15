import { NextResponse } from 'next/server';

export const revalidate = 15;

const ROBINHOOD_WETH = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73';

export async function GET() {
  try {
    const searchResponse = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/robinhood/${ROBINHOOD_WETH}`,
      { next: { revalidate: 15 } },
    );
    if (!searchResponse.ok) throw new Error('Robinhood market search failed');

    const searchData = await searchResponse.json();
    const pairs = Array.isArray(searchData) ? searchData : [];
    const pair = pairs
      .filter((item: {
        chainId?: string;
        dexId?: string;
        baseToken?: { symbol?: string };
        quoteToken?: { symbol?: string };
        liquidity?: { usd?: number };
      }) =>
        item.chainId === 'robinhood' &&
        (item.baseToken?.symbol === 'WETH' || item.quoteToken?.symbol === 'WETH') &&
        (item.baseToken?.symbol === 'USDG' || item.quoteToken?.symbol === 'USDG'),
      )
      .sort((a: { liquidity?: { usd?: number } }, b: { liquidity?: { usd?: number } }) =>
        (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
      )[0];

    if (!pair?.pairAddress) throw new Error('Robinhood WETH USDG market unavailable');

    const poolResponse = await fetch(
      `https://api.geckoterminal.com/api/v2/networks/robinhood/pools/${pair.pairAddress}/ohlcv/minute?aggregate=15&limit=80`,
      {
        headers: { Accept: 'application/json;version=20230203' },
        next: { revalidate: 15 },
      },
    );

    let candles: number[][] = [];
    if (poolResponse.ok) {
      const poolData = await poolResponse.json();
      candles = poolData?.data?.attributes?.ohlcv_list ?? [];
    }

    return NextResponse.json({
      pair: 'ETH / USDG',
      price: Number(pair.priceUsd ?? 0),
      change24h: Number(pair.priceChange?.h24 ?? 0),
      volume24h: Number(pair.volume?.h24 ?? 0),
      liquidity: Number(pair.liquidity?.usd ?? 0),
      swaps24h: Number(pair.txns?.h24?.buys ?? 0) + Number(pair.txns?.h24?.sells ?? 0),
      candles: candles.map((candle) => Number(candle[4])).filter(Number.isFinite).slice(-80),
      source: 'DexScreener / GeckoTerminal / Robinhood Chain',
      updatedAt: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load Robinhood market data' },
      { status: 503 },
    );
  }
}
