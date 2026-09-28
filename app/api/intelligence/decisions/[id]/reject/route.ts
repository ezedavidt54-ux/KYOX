import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 1000) : '';

  const decision = await prisma.tradeDecision.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!decision) return NextResponse.json({ error: 'Decision not found.' }, { status: 404 });
  if (decision.status !== 'PROPOSED') {
    return NextResponse.json({ error: 'Only proposed decisions can be rejected.' }, { status: 409 });
  }

  const updated = await prisma.tradeDecision.update({
    where: { id },
    data: {
      status: 'REJECTED',
      reasoning: {
        ...(decision.reasoning && typeof decision.reasoning === 'object' && !Array.isArray(decision.reasoning)
          ? decision.reasoning
          : {}),
        lifecycle: {
          state: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'USER',
          reason: reason || null,
        },
      },
    },
  });

  return NextResponse.json({ decision: updated });
}
