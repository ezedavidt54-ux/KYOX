import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Activity } from 'lucide-react';
import { BlackHoleHeroSection } from '@/components/ui/blackhole-hero-section';
import { WalletConnect } from '@/components/wallet-connect';
import { SwapPanel } from '@/components/swap-panel';

const stats = [
  ['TVL', '—'],
  ['24H VOLUME', '—'],
  ['LIQUIDITY', '—'],
  ['ACTIVE TRADERS', '—'],
];

const pages = [
  { href: '/markets', label: 'Markets', text: 'Explore onchain markets and trading pairs.' },
  { href: '/portfolio', label: 'Portfolio', text: 'View wallet balances and positions.' },
  { href: '/activity', label: 'Activity', text: 'Track swaps and wallet transactions.' },
  { href: '/liquidity', label: 'Liquidity', text: 'Manage liquidity and pool positions.' },
  { href: '/docs', label: 'Documentation', text: 'Learn how KYOX works on Robinhood Chain.' },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="navbar">
        <Link href="/" className="brand">
          <span className="brand-mark" />
          <span className="brand-name">KYOX</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/markets">Markets</Link>
          <Link href="#swap">Swap</Link>
          <Link href="/liquidity">Liquidity</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/activity">Activity</Link>
        </nav>
        <div className="nav-meta">
          <span className="network-pill" style={{ display: 'inline-flex' }}>ROBINHOOD CHAIN</span>
          <WalletConnect />
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid" />
        <BlackHoleHeroSection />
        <div className="hero-content">
          <div className="eyebrow">KYOX / ON CHAIN TERMINAL</div>
          <h1>ENTER <span>THE UNKNOWN</span></h1>
          <p className="hero-copy">
            A new interface for on chain markets. Trade, route liquidity and read the market from one cinematic command surface.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href="#swap">Open terminal <ArrowUpRight size={14} /></a>
            <Link className="secondary-cta" href="/markets">Explore markets <ChevronDown size={14} /></Link>
          </div>
        </div>
        <div className="hero-index"><strong>01</strong> / 04 &nbsp; SYSTEM ONLINE</div>
      </section>

      <section className="command-deck" id="swap" aria-label="KYOX trading terminal">
        <div className="deck-head">
          <div className="deck-title"><span className="live">●</span> KYOX TERMINAL / LIVE</div>
          <div className="deck-tabs">
            <button className="active">Spot</button>
            <Link href="/markets">Limit</Link>
            <Link href="/activity">Route</Link>
          </div>
        </div>
        <div className="deck-body">
          <div className="market-panel" id="markets">
            <div className="market-top">
              <div>
                <div className="pair">ETH / USDC</div>
                <div className="price">—</div>
              </div>
              <div className="change">LIVE FEED PENDING</div>
            </div>
            <div className="chart">
              <div className="chart-grid" />
              <div className="chart-empty-state">MARKET DATA CONNECTION PENDING</div>
            </div>
          </div>
          <SwapPanel />
        </div>
      </section>

      <section className="stats" id="analytics">
        {stats.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      <section aria-label="KYOX pages" style={{ width: 'min(1160px, 90vw)', margin: '0 auto 70px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {pages.map((page) => (
          <Link key={page.href} href={page.href} style={{ display: 'block', padding: 20, minHeight: 125, border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, background: 'rgba(255,255,255,.025)', color: '#fff', textDecoration: 'none' }}>
            <div style={{ color: '#7f8996', font: '9px DM Mono, monospace', letterSpacing: '.15em', textTransform: 'uppercase' }}>KYOX / PAGE</div>
            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700 }}>{page.label}</div>
            <div style={{ marginTop: 8, color: '#697381', fontSize: 11, lineHeight: 1.6 }}>{page.text}</div>
          </Link>
        ))}
      </section>

      <section id="liquidity" className="footer">
        <span>KYOX / ENTER THE UNKNOWN</span>
        <span><Activity size={11} /> SYSTEM STATUS: FOUNDATION ONLINE</span>
      </section>
    </main>
  );
}
