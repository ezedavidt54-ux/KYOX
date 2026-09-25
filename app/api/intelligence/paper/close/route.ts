import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    const tradeId = typeof body.tradeId === 'string' ? body.tradeId : '';
    const exitPrice = finiteNumber(body.exitPrice);

    if (!tradeId) return NextResponse.json({ error: 'A tradeId is required.' }, { status: 400 });
    if (exitPrice === undefined || exitPrice <= 0) {
      return NextResponse.json({ error: 'A positive exitPrice is required.' }, { status: 400 });
    }

    const trade = await prisma.trade.findFirst({
      where: { id: tradeId, userId: session.user.id, source: 'AGENT' },
      include: { agent: true, decision: true },
    });

    if (!trade) return NextResponse.json({ error: 'Paper trade not found.' }, { status: 404 });
    if (!trade.agent || trade.agent.mode !== 'PAPER') {
      return NextResponse.json({ error: 'Paper trade must belong to a PAPER agent.' }, { status: 409 });
    }
    if (trade.metadata && typeof trade.metadata === 'object' && !Array.isArray(trade.metadata)) {
      const metadata = trade.metadata as Record<string, unknown>;
      if (metadata.executionMode !== 'PAPER') {
        return NextResponse.json({ error: 'Trade is not a paper execution.' }, { status: 409 });
      }
    } else {
      return NextResponse.json({ error: 'Trade is missing paper execution metadata.' }, { status: 409 });
    }
    if (trade.closedAt) return NextResponse.json({ error: 'Paper trade is already closed.' }, { status: 409 });
    if (trade.entryPrice === null || trade.quantity === null) {
      return NextResponse.json({ error: 'Paper trade is missing entry price or quantity.' }, { status: 409 });
    }
    if (trade.side !== 'BUY' && trade.side !== 'SELL') {
      return NextResponse.json({ error: 'Paper trade has an invalid side.' }, { status: 409 });
    }

    const pnl = trade.side === 'BUY'
      ? (exitPrice - trade.entryPrice) * trade.quantity
      : (trade.entryPrice - exitPrice) * trade.quantity;
    const closedAt = new Date();

    const updatedTrade = await prisma.trade.update({
      where: { id: trade.id },
      data: {
        exitPrice,
        pnl,
        closedAt,
        metadata: {
          ...(trade.metadata && typeof trade.metadata === 'object' && !Array.isArray(trade.metadata)
            ? trade.metadata
            : {}),
          paperClose: {
            engine: 'deterministic-paper-1',
            exitPrice,
            pnl,
            closedAt: closedAt.toISOString(),
          },
        },
      },
      include: { decision: true },
    });

    return NextResponse.json({
      trade: updatedTrade,
      execution: {
        mode: 'PAPER',
        simulated: true,
        walletSigning: false,
        onchainTransaction: false,
      },
    });
  } catch (error) {
    console.error('KYOX paper close failed:', error);
    return NextResponse.json({ error: 'Unable to close paper trade.' }, { status: 500 });
  }
}
