import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const feedback = await prisma.agentFeedback.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ feedback });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json();
    const rating = body.rating === undefined || body.rating === null ? null : Number(body.rating);

    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be an integer from 1 to 5.' }, { status: 400 });
    }

    const agent = await resolveAgent(session.user.id, body.agentId);
    if (!agent) return NextResponse.json({ error: 'Trading intelligence agent not found.' }, { status: 404 });

    let decisionId: string | null = null;
    if (body.decisionId !== undefined && body.decisionId !== null) {
      if (typeof body.decisionId !== 'string') {
        return NextResponse.json({ error: 'Invalid decisionId.' }, { status: 400 });
      }
      const decision = await prisma.tradeDecision.findFirst({
        where: { id: body.decisionId, userId: session.user.id, agentId: agent.id },
        select: { id: true },
      });
      if (!decision) return NextResponse.json({ error: 'Decision not found for this intelligence agent.' }, { status: 404 });
      decisionId = decision.id;
    }

    const feedback = await prisma.agentFeedback.create({
      data: {
        userId: session.user.id,
        agentId: agent.id,
        decisionId,
        rating,
        correction: typeof body.correction === 'string' ? body.correction.trim().slice(0, 5000) : null,
        metadata: jsonObject(body.metadata),
      },
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error('KYOX feedback recording failed:', error);
    return NextResponse.json({ error: 'Unable to record feedback.' }, { status: 500 });
  }
}
