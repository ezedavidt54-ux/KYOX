import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildAgentDecision } from '@/lib/intelligence/decision';
import { getModePolicy } from '@/lib/intelligence/mode';
import type { AgentDecision } from '@/lib/intelligence/types';

function numberOrUndefined(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseMemory(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.asset !== 'string') {
    return NextResponse.json({ error: 'asset is required.' }, { status: 400 });
  }

  const agent = body.agentId
    ? await prisma.tradingAgent.findFirst({ where: { id: body.agentId, userId: session.user.id } })
    : await prisma.tradingAgent.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: 'asc' } });

  if (!agent) return NextResponse.json({ error: 'Trading agent not found.' }, { status: 404 });

  const policy = getModePolicy(agent.mode);
  if (!policy.canPropose) {
    return NextResponse.json(
      { error: `The ${agent.mode} mode does not allow trade proposals.` },
      { status: 422 },
    );
  }

  const [profile, observations] = await Promise.all([
    prisma.tradingProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.agentObservation.findMany({
      where: { agentId: agent.id },
      orderBy: { observedAt: 'desc' },
      take: 50,
    }),
  ]);

  const latestObservation = observations.find(
    (observation) => observation.asset.toUpperCase() === body.asset.trim().toUpperCase(),
  );

  const requestedAction =
    typeof body.action === 'string' ? body.action.toUpperCase() : latestObservation?.expectedAction ?? 'WAIT';

  const decision = buildAgentDecision({
    mode: agent.mode,
    profile,
    memory: parseMemory(agent.memorySummary),
    asset: body.asset,
    timeframe: typeof body.timeframe === 'string' ? body.timeframe : latestObservation?.timeframe,
    expectedAction: requestedAction as AgentDecision['action'],
    setup:
      typeof body.setup === 'string'
        ? body.setup
        : latestObservation?.detectedSetup
          ? JSON.stringify(latestObservation.detectedSetup)
          : null,
    marketSnapshot:
      body.marketSnapshot && typeof body.marketSnapshot === 'object'
        ? body.marketSnapshot
        : latestObservation?.marketSnapshot,
    entry: numberOrUndefined(body.entry),
    stop: numberOrUndefined(body.stop),
    target: numberOrUndefined(body.target),
    risk: numberOrUndefined(body.risk),
  });

  const created = await prisma.tradeDecision.create({
    data: {
      userId: session.user.id,
      agentId: agent.id,
      action: decision.action,
      status: 'PROPOSED',
      asset: decision.asset,
      thesis: decision.thesis,
      confidence: decision.confidence,
      proposedEntry: decision.proposedEntry,
      proposedStop: decision.proposedStop,
      proposedTarget: decision.proposedTarget,
      proposedRisk: decision.proposedRisk,
      marketSnapshot:
        body.marketSnapshot && typeof body.marketSnapshot === 'object'
          ? body.marketSnapshot
          : latestObservation?.marketSnapshot ?? undefined,
      reasoning: {
        engine: 'deterministic-foundation-1',
        mode: agent.mode,
        sourceObservationId: latestObservation?.id ?? null,
        memoryVersion: parseMemory(agent.memorySummary)?.version ?? null,
      },
    },
  });

  return NextResponse.json({
    decision: created,
    execution: {
      allowed: false,
      reason: 'Decision proposal created. No trade execution or wallet signing occurs in this layer.',
    },
  }, { status: 201 });
}
