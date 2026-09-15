import Link from 'next/link';
import type { ReactNode } from 'react';
import { WalletConnect } from '@/components/wallet-connect';

export function PageShell({ kicker, title, description, children }: { kicker: string; title: string; description: string; children: ReactNode }) {
  return (
    <main className="site-shell" style={{ minHeight: '100vh', paddingTop: 110 }}>
      <header className="navbar">
        <Link href="/" className="brand"><span className="brand-mark" /><span className="brand-name">KYOX</span></Link>
        <nav className="nav-links" aria-label="Page navigation">
          <Link href="/markets">Markets</Link><Link href="/portfolio">Portfolio</Link><Link href="/activity">Activity</Link><Link href="/liquidity">Liquidity</Link><Link href="/docs">Docs</Link>
        </nav>
        <div className="nav-meta"><span className="network-pill" style={{ display: 'inline-flex' }}>ROBINHOOD CHAIN</span><WalletConnect /></div>
      </header>
      <section style={{ width: 'min(1160px, 90vw)', margin: '0 auto 80px' }}>
        <div className="eyebrow">{kicker}</div>
        <h1 style={{ margin: 0, fontSize: 'clamp(48px, 7vw, 92px)', letterSpacing: '-.06em' }}>{title}</h1>
        <p style={{ maxWidth: 620, color: '#7c8491', lineHeight: 1.8, marginTop: 18 }}>{description}</p>
        {children}
      </section>
    </main>
  );
}
