import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { createAuthChallenge, getSupportedChain } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = typeof body.address === 'string' ? body.address : '';
    const chainId = Number(body.chainId);

    if (!isAddress(address) || !Number.isInteger(chainId) || !getSupportedChain(chainId)) {
      return NextResponse.json({ error: 'Invalid wallet or unsupported chain.' }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const challenge = await createAuthChallenge(address, chainId, origin);

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('KYOX auth nonce error', error);
    return NextResponse.json({ error: 'Unable to create authentication challenge.' }, { status: 500 });
  }
}
