import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkDecisionRisk } from '@/lib/intelligence/risk';

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    const decisionId = typeof body.decisionId === 'string' ? body.decisionId : '';
    const entryPrice = finiteNumber(body.entryPrice);
    const quantity = finiteNumber(body.quantity);

    if (!decisionId) return NextResponse.json({ error: 'A decisionId is required.' }, { status: 400 });
    if (entryPrice === undefined || entryPrice <= 0) {
      return NextResponse.json({ error: 'A positive entryPrice is required.' }, { status: 400 });
    }
    if (quantity === undefined || quantity <= 0) {
      return NextResponse.json({ error: 'A positive quantity is required.' }, { status: 400 });
    }

    const decision = await prisma.tradeDecision.findFirst({
      where: { id: decisionId, userId: session.user.id },
      include: { agent: true },
    });

    if (!decision) return NextResponse.json({ error: 'Decision not found.' }, { status: 404 });
    if (!decision.agent) return NextResponse.json({ error: 'Decision is not linked to an agent.' }, { status: 400 });
    if (decision.agent.mode !== 'PAPER') {
      return NextResponse.json({ error: 'Paper execution requires PAPER agent mode.' }, { status: 409 });
    }
    if (decision.status !== 'PROPOSED') {
      return NextResponse.json({ error: 'Only proposed decisions can enter paper execution.' }, { status: 409 });
    }

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const losingTrades = await prisma.trade.findMany({
      where: {
        agentId: decision.agent.id,
        closedAt: { gte: startOfDay },
        pnl: { lt: 0 },
      },
      select: { pnl: true },
    });

    const realizedDailyLoss = losingTrades.reduce((sum, trade) => sum + Math.abs(trade.pnl ?? 0), 0);
    const riskResult = checkDecisionRisk({
      mode: decision.agent.mode,
      enabled: decision.agent.enabled,
      action: decision.action,
      asset: decision.asset,
      confidence: decision.confidence,
      confidenceFloor: decision.agent.confidenceFloor,
      proposedRisk: decision.proposedRisk,
      maxRiskPerTrade: decision.agent.maxRiskPerTrade,
      maxDailyLoss: decision.agent.maxDailyLoss,
      riskCapital: decision.agent.riskCapital,
      realizedDailyLoss,
      allowedAssets: decision.agent.allowedAssets,
      allowedProtocols: decision.agent.allowedProtocols,
    });

    await prisma.riskDecisionLog.create({
      data: {
        userId: session.user.id,
        agentId: decision.agent.id,
        mode: decision.agent.mode,
        action: decision.action,
        asset: decision.asset,
        confidence: decision.confidence,
        proposedRisk: decision.proposedRisk,
        allowed: riskResult.allowed,
        reasons: riskResult.reasons,
        maxRiskPerTrade: decision.agent.maxRiskPerTrade,
        maxDailyLoss: decision.agent.maxDailyLoss,
        riskCapital: decision.agent.riskCapital,
        dailyLossLimit: riskResult.limits.dailyLoss,
        realizedDailyLoss,
        projectedDailyLoss: riskResult.projectedDailyLoss,
      },
    });

    if (!riskResult.allowed) {
      return NextResponse.json({ error: 'Paper execution blocked by risk gate.', risk: riskResult }, { status: 422 });
    }

    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        agentId: decision.agent.id,
        decisionId: decision.id,
        source: 'AGENT',
        chainId: 0,
        asset: decision.asset,
        side: decision.action as 'BUY' | 'SELL',
        entryPrice,
        quantity,
        stopLoss: decision.proposedStop ?? undefined,
        takeProfit: decision.proposedTarget ?? undefined,
        riskAmount: decision.proposedRisk ?? undefined,
        openedAt: new Date(),
        metadata: {
          executionMode: 'PAPER',
          simulated: true,
          engine: 'deterministic-paper-1',
          noWalletSigning: true,
          noOnchainTransaction: true,
        },
      },
      include: { decision: true },
    });

    await prisma.tradeDecision.update({
      where: { id: decision.id },
      data: {
        status: 'EXECUTED',
        reasoning: {
          ...(decision.reasoning && typeof decision.reasoning === 'object' && !Array.isArray(decision.reasoning)
            ? decision.reasoning
            : {}),
          paperExecution: {
            engine: 'deterministic-paper-1',
            entryPrice,
            quantity,
            simulated: true,
          },
        },
      },
    });

    return NextResponse.json({
      trade,
      risk: riskResult,
      execution: {
        mode: 'PAPER',
        simulated: true,
        walletSigning: false,
        onchainTransaction: false,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('KYOX paper execution failed:', error);
    return NextResponse.json({ error: 'Unable to create paper trade.' }, { status: 500 });
  }
}
