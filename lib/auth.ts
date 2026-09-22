import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { createPublicClient, http, type Address, type Hex } from 'viem';
import { arbitrum, base, mainnet } from 'viem/chains';
import { robinhoodChain } from '@/lib/robinhood';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'kyox_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const NONCE_TTL_MS = 10 * 60 * 1000;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function normalizeAddress(address: string) {
  return address.toLowerCase();
}

export function getSupportedChain(chainId: number) {
  if (chainId === robinhoodChain.id) return robinhoodChain;
  if (chainId === arbitrum.id) return arbitrum;
  if (chainId === base.id) return base;
  if (chainId === mainnet.id) return mainnet;
  return null;
}

function getPublicClient(chainId: number) {
  const chain = getSupportedChain(chainId);
  if (!chain) return null;
  return createPublicClient({ chain, transport: http() });
}

export async function createAuthChallenge(
  address: string,
  chainId: number,
  origin: string,
) {
  const normalizedAddress = normalizeAddress(address);
  const nonce = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS);

  const message = [
    'KYOX wants you to sign in with your Ethereum account:',
    normalizedAddress,
    '',
    'Sign in to KYOX to access your Personal Autonomous Trading Intelligence.',
    '',
    `URI: ${origin}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
    `Expiration Time: ${expiresAt.toISOString()}`,
  ].join('\n');

  await prisma.authNonce.create({
    data: {
      nonce,
      address: normalizedAddress,
      chainId,
      message,
      expiresAt,
    },
  });

  return { nonce, message, expiresAt };
}

export async function verifyAuthChallenge(
  address: string,
  chainId: number,
  nonce: string,
  signature: Hex,
) {
  const normalizedAddress = normalizeAddress(address);
  const challenge = await prisma.authNonce.findUnique({ where: { nonce } });

  if (!challenge) throw new Error('Authentication challenge not found.');
  if (challenge.expiresAt.getTime() < Date.now()) {
    await prisma.authNonce.delete({ where: { id: challenge.id } }).catch(() => undefined);
    throw new Error('Authentication challenge expired.');
  }
  if (challenge.address !== normalizedAddress || challenge.chainId !== chainId) {
    throw new Error('Authentication challenge does not match this wallet.');
  }

  const publicClient = getPublicClient(chainId);
  if (!publicClient) throw new Error('Unsupported chain.');

  const valid = await publicClient.verifyMessage({
    address: normalizedAddress as Address,
    message: challenge.message,
    signature,
  });

  if (!valid) throw new Error('Invalid wallet signature.');

  await prisma.authNonce.delete({ where: { id: challenge.id } });

  const user = await prisma.user.upsert({
    where: {
      wallets: {
        address: normalizedAddress,
        chainId,
      },
    },
    update: {},
    create: {
      wallets: {
        create: {
          address: normalizedAddress,
          chainId,
          isPrimary: true,
        },
      },
      tradingProfile: {
        create: {},
      },
      agents: {
        create: {
          name: 'My KYOX Intelligence',
          mode: 'OBSERVE',
          enabled: false,
        },
      },
    },
    include: {
      wallets: true,
      tradingProfile: true,
      agents: true,
    },
  });

  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });

  return user;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          wallets: true,
          tradingProfile: true,
          agents: true,
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session;
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}
