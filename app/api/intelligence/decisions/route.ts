import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getModePolicy, type IntelligenceMode } from '@/lib/intelligence/mode';

const actions = new Set(['BUY', 'SELL', 'HOLD', 'WAIT', 'REJECT']);
const statuses = new Set(['PROPOSED', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED']);

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function jsonObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
}

async function resolveAgent(userId: string, agentId?: unknown) {
  if (typeof agentId === 'string' && agentId) {
    return prisma.tradingAgent.findFirst({ where: { id: agentId, userId } });
  }
  return prisma.tradingAgent.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const decisions = await prisma.tradeDecision.findMany({
    where: { userId: session.user.id },
    orderBy: { decidedAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ decisions });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    const asset = typeof body.asset === 'string' ? body.asset.trim().toUpperCase() : '';
    const action = typeof body.action === 'string' ? body.action.trim().toUpperCase() : '';
    const status = body.status === undefined ? 'PROPOSED' : String(body.status).trim().toUpperCase();

    if (!asset || asset.length > 40) {
      return NextResponse.json({ error: 'A valid asset is required.' }, { status: 400 });
    }
    if (!actions.has(action)) return NextResponse.json({ error: 'Invalid decision action.' }, { status: 400 });
    if (!statuses.has(status)) return NextResponse.json({ error: 'Invalid decision status.' }, { status: 400 });

    const confidence = finiteNumber(body.confidence);
    const proposedRisk = finiteNumber(body.proposedRisk);
    if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
      return NextResponse.json({ error: 'Confidence must be between 0 and 1.' }, { status: 400 });
    }
    if (proposedRisk !== undefined && proposedRisk < 0) {
      return NextResponse.json({ error: 'Risk cannot be negative.' }, { status: 400 });
    }

    const agent = await resolveAgent(session.user.id, body.agentId);
    if (!agent) return NextResponse.json({ error: 'Trading intelligence agent not found.' }, { status: 404 });

    const mode = agent.mode as IntelligenceMode;
    const policy = getModePolicy(mode);
    if (!policy.canPropose) {
      return NextResponse.json({ error: `Decision proposals are disabled in ${mode} mode.` }, { status: 422 });
    }
    if (status === 'EXECUTED') {
      return NextResponse.json({ error: 'Executed decisions must be created by a recorded trade outcome.' }, { status: 422 });
    }
    if (status === 'APPROVED' && !policy.canExecute && mode !== 'PAPER') {
      return NextResponse.json({ error: `Live approval is disabled in ${mode} mode.` }, { status: 422 });
    }

    const decision = await prisma.tradeDecision.create({
      data: {
        userId: session.user.id,
        agentId: agent.id,
        action: action as 'BUY' | 'SELL' | 'HOLD' | 'WAIT' | 'REJECT',
        status: status as 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'EXPIRED',
        asset,
        thesis: typeof body.thesis === 'string' ? body.thesis.trim().slice(0, 5000) : null,
        confidence,
        proposedEntry: finiteNumber(body.proposedEntry),
        proposedStop: finiteNumber(body.proposedStop),
        proposedTarget: finiteNumber(body.proposedTarget),
        proposedRisk,
        marketSnapshot: jsonObject(body.marketSnapshot),
        reasoning: jsonObject(body.reasoning),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    return NextResponse.json({ decision }, { status: 201 });
  } catch (error) {
    console.error('KYOX decision recording failed:', error);
    return NextResponse.json({ error: 'Unable to record decision.' }, { status: 500 });
  }
}
