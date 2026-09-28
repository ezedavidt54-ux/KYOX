'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function IntelligenceAuth() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<'idle' | 'signing' | 'ready' | 'error'>('idle');

  async function authenticate() {
    if (!address || !isConnected) return;

    setStatus('signing');

    try {
      const nonceResponse = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, chainId }),
      });

      const challenge = await nonceResponse.json();
      if (!nonceResponse.ok) throw new Error(challenge.error ?? 'Unable to start authentication.');

      const signature = await signMessageAsync({ message: challenge.message });

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          chainId,
          nonce: challenge.nonce,
          signature,
        }),
      });

      if (!verifyResponse.ok) {
        const result = await verifyResponse.json();
        throw new Error(result.error ?? 'Authentication failed.');
      }

      setStatus('ready');
      router.push('/intelligence/onboarding');
      router.refresh();
    } catch (error) {
      console.error('KYOX authentication failed', error);
      setStatus('error');
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <ConnectButton />
      {isConnected && (
        <button
          type="button"
          onClick={authenticate}
          disabled={status === 'signing'}
          style={{
            border: '1px solid rgba(255,255,255,.16)',
            borderRadius: 999,
            padding: '12px 18px',
            background: status === 'ready' ? 'rgba(110,231,183,.12)' : 'rgba(255,255,255,.06)',
            color: 'inherit',
            cursor: status === 'signing' ? 'wait' : 'pointer',
          }}
        >
          {status === 'signing'
            ? 'SIGNING...'
            : status === 'ready'
              ? 'INTELLIGENCE INITIALIZED'
              : status === 'error'
                ? 'TRY AGAIN'
                : 'INITIALIZE INTELLIGENCE'}
        </button>
      )}
    </div>
  );
}
