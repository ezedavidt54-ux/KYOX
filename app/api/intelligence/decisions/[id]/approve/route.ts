import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { id } = await context.params;
  const decision = await prisma.tradeDecision.findFirst({
    where: { id, userId: session.user.id },
    include: { agent: true },
  });

  if (!decision) return NextResponse.json({ error: 'Decision not found.' }, { status: 404 });
  if (decision.status !== 'PROPOSED') {
    return NextResponse.json({ error: 'Only proposed decisions can be approved.' }, { status: 409 });
  }
  if (decision.expiresAt && decision.expiresAt <= new Date()) {
    await prisma.tradeDecision.update({ where: { id }, data: { status: 'EXPIRED' } });
    return NextResponse.json({ error: 'Decision has expired.' }, { status: 409 });
  }
  if (decision.agent.mode !== 'PAPER') {
    return NextResponse.json(
      { error: 'Approval is currently limited to PAPER mode. Live execution is not enabled by this lifecycle layer.' },
      { status: 409 },
    );
  }

  const updated = await prisma.tradeDecision.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reasoning: {
        ...(decision.reasoning && typeof decision.reasoning === 'object' && !Array.isArray(decision.reasoning)
          ? decision.reasoning
          : {}),
        lifecycle: {
          state: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: 'USER',
        },
      },
    },
  });

  return NextResponse.json({ decision: updated });
}
