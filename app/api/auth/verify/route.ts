import { NextResponse } from 'next/server';
import { isAddress, type Hex } from 'viem';
import { verifyAuthChallenge } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = typeof body.address === 'string' ? body.address : '';
    const chainId = Number(body.chainId);
    const nonce = typeof body.nonce === 'string' ? body.nonce : '';
    const signature = typeof body.signature === 'string' ? body.signature : '';

    if (
      !isAddress(address) ||
      !Number.isInteger(chainId) ||
      !nonce ||
      !/^0x[0-9a-fA-F]+$/.test(signature)
    ) {
      return NextResponse.json({ error: 'Invalid authentication payload.' }, { status: 400 });
    }

    const user = await verifyAuthChallenge(
      address,
      chainId,
      nonce,
      signature as Hex,
    );

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        wallets: user.wallets,
        tradingProfile: user.tradingProfile,
        agents: user.agents,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed.';
    const status = /invalid|expired|not found|does not match|unsupported/i.test(message) ? 401 : 500;
    console.error('KYOX auth verification error', error);
    return NextResponse.json({ error: message }, { status });
  }
}
