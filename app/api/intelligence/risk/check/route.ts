import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkDecisionRisk } from '@/lib/intelligence/risk';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const logs = await prisma.riskDecisionLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.asset !== 'string' || typeof body.action !== 'string') {
    return NextResponse.json({ error: 'asset and action are required.' }, { status: 400 });
  }

  const agent = body.agentId
    ? await prisma.tradingAgent.findFirst({ where: { id: body.agentId, userId: session.user.id } })
    : await prisma.tradingAgent.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: 'asc' } });

  if (!agent) return NextResponse.json({ error: 'Trading agent not found.' }, { status: 404 });

  const startOfUtcDay = new Date();
  startOfUtcDay.setUTCHours(0, 0, 0, 0);

  const realizedLossAggregate = await prisma.trade.aggregate({
    _sum: { pnl: true },
    where: {
      agentId: agent.id,
      closedAt: { gte: startOfUtcDay },
      pnl: { lt: 0 },
    },
  });

  const realizedDailyLoss = Math.max(0, -(realizedLossAggregate._sum.pnl ?? 0));
  const proposedRisk =
    body.proposedRisk === undefined || body.proposedRisk === null
      ? undefined
      : Number(body.proposedRisk);

  const result = checkDecisionRisk({
    mode: agent.mode,
    enabled: agent.enabled,
    action: body.action,
    asset: body.asset,
    confidence: Number(body.confidence),
    confidenceFloor: agent.confidenceFloor,
    proposedRisk,
    maxRiskPerTrade: agent.maxRiskPerTrade,
    maxDailyLoss: agent.maxDailyLoss,
    riskCapital: agent.riskCapital,
    realizedDailyLoss,
    allowedAssets: agent.allowedAssets,
    allowedProtocols: agent.allowedProtocols,
    protocol: typeof body.protocol === 'string' ? body.protocol : undefined,
  });

  try {
    await prisma.riskDecisionLog.create({
      data: {
        userId: session.user.id,
        agentId: agent.id,
        mode: agent.mode,
        action: body.action,
        asset: body.asset.trim().toUpperCase(),
        protocol: typeof body.protocol === 'string' ? body.protocol : undefined,
        confidence: Number.isFinite(Number(body.confidence)) ? Number(body.confidence) : undefined,
        proposedRisk,
        allowed: result.allowed,
        reasons: result.reasons,
        maxRiskPerTrade: result.limits.maxRiskPerTrade,
        maxDailyLoss: result.limits.maxDailyLoss,
        riskCapital: result.limits.riskCapital,
        dailyLossLimit: result.limits.dailyLossLimit,
        realizedDailyLoss: result.limits.realizedDailyLoss,
        projectedDailyLoss: result.limits.projectedDailyLoss,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Risk decision could not be recorded. Authorization was not returned.' },
      { status: 500 },
    );
  }

  return NextResponse.json(result, { status: result.allowed ? 200 : 422 });
}
