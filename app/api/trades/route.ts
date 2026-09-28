import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const sources = new Set(['MANUAL', 'IMPORTED', 'AGENT']);

function numberOrUndefined(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    include: { decision: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ trades });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    const asset = typeof body.asset === 'string' ? body.asset.trim().toUpperCase() : '';
    const side = typeof body.side === 'string' ? body.side.trim().toUpperCase() : '';
    const source = typeof body.source === 'string' ? body.source.trim().toUpperCase() : 'MANUAL';
    const chainId = Number(body.chainId);

    if (!asset || asset.length > 40) return NextResponse.json({ error: 'A valid asset is required.' }, { status: 400 });
    if (!['BUY', 'SELL'].includes(side)) return NextResponse.json({ error: 'Side must be BUY or SELL.' }, { status: 400 });
    if (!Number.isInteger(chainId) || chainId <= 0) return NextResponse.json({ error: 'A valid chainId is required.' }, { status: 400 });
    if (!sources.has(source)) return NextResponse.json({ error: 'Invalid trade source.' }, { status: 400 });

    let decisionId: string | null = null;
    if (body.decisionId !== undefined && body.decisionId !== null) {
      if (typeof body.decisionId !== 'string') return NextResponse.json({ error: 'Invalid decisionId.' }, { status: 400 });
      const decision = await prisma.tradeDecision.findFirst({
        where: { id: body.decisionId, userId: session.user.id },
        select: { id: true },
      });
      if (!decision) return NextResponse.json({ error: 'Decision not found.' }, { status: 404 });
      decisionId = decision.id;
    }

    let agentId: string | undefined;
    if (typeof body.agentId === 'string') {
      const agent = await prisma.tradingAgent.findFirst({ where: { id: body.agentId, userId: session.user.id }, select: { id: true } });
      if (!agent) return NextResponse.json({ error: 'Trading intelligence agent not found.' }, { status: 404 });
      agentId = agent.id;
    }

    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        agentId,
        decisionId,
        source: source as 'MANUAL' | 'IMPORTED' | 'AGENT',
        chainId,
        asset,
        side,
        entryPrice: numberOrUndefined(body.entryPrice),
        exitPrice: numberOrUndefined(body.exitPrice),
        quantity: numberOrUndefined(body.quantity),
        stopLoss: numberOrUndefined(body.stopLoss),
        takeProfit: numberOrUndefined(body.takeProfit),
        riskAmount: numberOrUndefined(body.riskAmount),
        pnl: numberOrUndefined(body.pnl),
        openedAt: body.openedAt ? new Date(body.openedAt) : undefined,
        closedAt: body.closedAt ? new Date(body.closedAt) : undefined,
        metadata: body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata : undefined,
      },
      include: { decision: true },
    });

    if (decisionId && trade.closedAt) {
      await prisma.tradeDecision.update({
        where: { id: decisionId },
        data: { status: 'EXECUTED' },
      });
    }

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error('KYOX trade recording failed:', error);
    return NextResponse.json({ error: 'Unable to record trade.' }, { status: 500 });
  }
}
