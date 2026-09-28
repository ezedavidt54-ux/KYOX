import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const displayName =
      typeof body.displayName === 'string' ? body.displayName.trim().slice(0, 80) : undefined;

    const profile = body.tradingProfile;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(displayName !== undefined ? { displayName: displayName || null } : {}),
        ...(profile
          ? {
              tradingProfile: {
                upsert: {
                  create: {
                    markets: Array.isArray(profile.markets) ? profile.markets : [],
                    timeframes: Array.isArray(profile.timeframes) ? profile.timeframes : [],
                    biasMethod: typeof profile.biasMethod === 'string' ? profile.biasMethod : null,
                    entryMethod: typeof profile.entryMethod === 'string' ? profile.entryMethod : null,
                    riskRules: profile.riskRules ?? null,
                    managementRules: profile.managementRules ?? null,
                    invalidationRules: profile.invalidationRules ?? null,
                    newsRules: profile.newsRules ?? null,
                    notes: typeof profile.notes === 'string' ? profile.notes : null,
                  },
                  update: {
                    markets: Array.isArray(profile.markets) ? profile.markets : undefined,
                    timeframes: Array.isArray(profile.timeframes) ? profile.timeframes : undefined,
                    biasMethod: typeof profile.biasMethod === 'string' ? profile.biasMethod : undefined,
                    entryMethod: typeof profile.entryMethod === 'string' ? profile.entryMethod : undefined,
                    riskRules: profile.riskRules ?? undefined,
                    managementRules: profile.managementRules ?? undefined,
                    invalidationRules: profile.invalidationRules ?? undefined,
                    newsRules: profile.newsRules ?? undefined,
                    notes: typeof profile.notes === 'string' ? profile.notes : undefined,
                    version: { increment: 1 },
                  },
                },
              },
            }
          : {}),
      },
      include: {
        wallets: true,
        tradingProfile: true,
        agents: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('KYOX profile update failed:', error);
    return NextResponse.json({ error: 'Unable to update the KYOX profile.' }, { status: 500 });
  }
}
