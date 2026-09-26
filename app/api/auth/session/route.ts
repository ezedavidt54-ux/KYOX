import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      displayName: session.user.displayName,
      wallets: session.user.wallets,
      tradingProfile: session.user.tradingProfile,
      agents: session.user.agents,
    },
    expiresAt: session.expiresAt,
  });
}
