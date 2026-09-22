import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const actions = new Set(['BUY', 'SELL', 'HOLD', 'WAIT', 'REJECT']);

function jsonObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
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

  const observations = await prisma.agentObservation.findMany({
    where: { userId: session.user.id },
    orderBy: { observedAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ observations });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    const asset = typeof body.asset === 'string' ? body.asset.trim().toUpperCase() : '';
    const timeframe = typeof body.timeframe === 'string' ? body.timeframe.trim().toUpperCase() : null;

    if (!asset || asset.length > 40) {
      return NextResponse.json({ error: 'A valid asset is required.' }, { status: 400 });
    }
    if (timeframe && timeframe.length > 20) {
      return NextResponse.json({ error: 'Invalid timeframe.' }, { status: 400 });
    }

    const agent = await resolveAgent(session.user.id, body.agentId);
    if (!agent) return NextResponse.json({ error: 'Trading intelligence agent not found.' }, { status: 404 });

    const expectedAction = body.expectedAction === undefined || body.expectedAction === null
      ? null
      : String(body.expectedAction).toUpperCase();
    const actualAction = body.actualAction === undefined || body.actualAction === null
      ? null
      : String(body.actualAction).toUpperCase();

    if ((expectedAction && !actions.has(expectedAction)) || (actualAction && !actions.has(actualAction))) {
      return NextResponse.json({ error: 'Invalid observation action.' }, { status: 400 });
    }

    const observation = await prisma.agentObservation.create({
      data: {
        userId: session.user.id,
        agentId: agent.id,
        asset,
        timeframe,
        marketSnapshot: jsonObject(body.marketSnapshot),
        detectedSetup: body.detectedSetup === undefined ? undefined : jsonObject(body.detectedSetup),
        expectedAction: expectedAction as 'BUY' | 'SELL' | 'HOLD' | 'WAIT' | 'REJECT' | null,
        actualAction: actualAction as 'BUY' | 'SELL' | 'HOLD' | 'WAIT' | 'REJECT' | null,
      },
    });

    return NextResponse.json({ observation }, { status: 201 });
  } catch (error) {
    console.error('KYOX observation recording failed:', error);
    return NextResponse.json({ error: 'Unable to record observation.' }, { status: 500 });
  }
}
