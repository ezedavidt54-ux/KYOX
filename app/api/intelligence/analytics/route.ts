import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const [decisions, trades, feedback] = await Promise.all([
    prisma.tradeDecision.findMany({
      where: { userId: session.user.id },
      orderBy: { decidedAt: 'desc' },
    }),
    prisma.trade.findMany({
      where: { userId: session.user.id },
      include: { decision: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.agentFeedback.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const linkedTrades = trades.filter((trade) => trade.decisionId);
  const closedTrades = linkedTrades.filter((trade) => trade.closedAt);
  const wins = closedTrades.filter((trade) => (trade.pnl ?? 0) > 0);
  const losses = closedTrades.filter((trade) => (trade.pnl ?? 0) < 0);
  const breakeven = closedTrades.filter((trade) => (trade.pnl ?? 0) === 0);
  const pnlValues = closedTrades.map((trade) => trade.pnl ?? 0);
  const totalPnl = pnlValues.reduce((sum, pnl) => sum + pnl, 0);
  const averagePnl = closedTrades.length ? totalPnl / closedTrades.length : 0;

  const directional = closedTrades.filter(
    (trade) => trade.decision && ['BUY', 'SELL'].includes(trade.decision.action),
  );
  const directionMatches = directional.filter(
    (trade) => trade.decision?.action === trade.side,
  );
  const decisionAccuracy = directional.length ? directionMatches.length / directional.length : null;

  const confidenceBuckets = [
    { label: '70 to 79%', min: 0.7, max: 0.8 },
    { label: '80 to 89%', min: 0.8, max: 0.9 },
    { label: '90 to 100%', min: 0.9, max: 1.01 },
  ].map((bucket) => {
    const bucketTrades = closedTrades.filter((trade) => {
      const confidence = trade.decision?.confidence;
      return confidence !== null && confidence !== undefined && confidence >= bucket.min && confidence < bucket.max;
    });
    const bucketWins = bucketTrades.filter((trade) => (trade.pnl ?? 0) > 0).length;
    return {
      label: bucket.label,
      count: bucketTrades.length,
      winRate: bucketTrades.length ? round(bucketWins / bucketTrades.length * 100) : null,
    };
  });

  const assetMap = new Map<string, { trades: number; wins: number; pnl: number }>();
  for (const trade of closedTrades) {
    const current = assetMap.get(trade.asset) ?? { trades: 0, wins: 0, pnl: 0 };
    current.trades += 1;
    if ((trade.pnl ?? 0) > 0) current.wins += 1;
    current.pnl += trade.pnl ?? 0;
    assetMap.set(trade.asset, current);
  }

  const assetBreakdown = [...assetMap.entries()]
    .map(([asset, value]) => ({
      asset,
      trades: value.trades,
      winRate: round(value.wins / value.trades * 100),
      pnl: round(value.pnl),
    }))
    .sort((a, b) => b.trades - a.trades);

  return NextResponse.json({
    decisions: {
      total: decisions.length,
      linked: linkedTrades.length,
      directionalClosed: directional.length,
      accuracy: decisionAccuracy === null ? null : round(decisionAccuracy * 100),
    },
    outcomes: {
      closed: closedTrades.length,
      wins: wins.length,
      losses: losses.length,
      breakeven: breakeven.length,
      winRate: closedTrades.length ? round(wins.length / closedTrades.length * 100) : null,
      totalPnl: round(totalPnl),
      averagePnl: round(averagePnl),
    },
    confidence: confidenceBuckets,
    assets: assetBreakdown,
    feedback: feedback.map((item) => ({
      id: item.id,
      rating: item.rating,
      correction: item.correction,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}
