import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildLearningMemory } from '@/lib/intelligence/learning';

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const agentId = typeof body.agentId === 'string' ? body.agentId : undefined;
    const agent = await prisma.tradingAgent.findFirst({
      where: { userId: session.user.id, ...(agentId ? { id: agentId } : {}) },
      orderBy: { createdAt: 'asc' },
    });

    if (!agent) return NextResponse.json({ error: 'Trading intelligence agent not found.' }, { status: 404 });
    if (agent.mode === 'PAUSED') {
      return NextResponse.json({ error: 'Learning is disabled while the intelligence is paused.' }, { status: 422 });
    }

    const [profile, observations, decisions, feedback, trades] = await Promise.all([
      prisma.tradingProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.agentObservation.findMany({ where: { agentId: agent.id }, orderBy: { observedAt: 'desc' }, take: 200 }),
      prisma.tradeDecision.findMany({ where: { agentId: agent.id }, orderBy: { decidedAt: 'desc' }, take: 200 }),
      prisma.agentFeedback.findMany({ where: { agentId: agent.id }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.trade.findMany({ where: { agentId: agent.id }, orderBy: { createdAt: 'desc' }, take: 200 }),
    ]);

    const memory = buildLearningMemory({
      mode: agent.mode,
      profile,
      observations,
      decisions,
      feedback,
      trades,
    });

    const updatedAgent = await prisma.tradingAgent.update({
      where: { id: agent.id },
      data: {
        memorySummary: JSON.stringify(memory),
        systemVersion: 'foundation-2',
      },
      select: { id: true, mode: true, systemVersion: true, memorySummary: true, updatedAt: true },
    });

    return NextResponse.json({ memory, agent: updatedAgent });
  } catch (error) {
    console.error('KYOX learning pass failed:', error);
    return NextResponse.json({ error: 'Unable to run learning pass.' }, { status: 500 });
  }
}
