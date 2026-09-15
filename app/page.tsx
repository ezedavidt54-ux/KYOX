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

export default function Home() {
  return (
    <main className="site-shell">
      <header className="navbar">
        <Link href="/" className="brand">
          <span className="brand-mark" />
          <span className="brand-name">KYOX</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="#markets">Markets</Link>
          <Link href="#swap">Swap</Link>
          <Link href="#liquidity">Liquidity</Link>
          <Link href="#analytics">Analytics</Link>
        </nav>
        <div className="nav-meta">
          <span className="network-pill">ARBITRUM ONE</span>
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
            <a className="secondary-cta" href="#markets">Explore markets <ChevronDown size={14} /></a>
          </div>
        </div>
        <div className="hero-index"><strong>01</strong> / 04 &nbsp; SYSTEM ONLINE</div>
      </section>

      <section className="command-deck" id="swap" aria-label="KYOX trading terminal">
        <div className="deck-head">
          <div className="deck-title"><span className="live">●</span> KYOX TERMINAL / LIVE</div>
          <div className="deck-tabs">
            <button className="active">Spot</button>
            <button>Limit</button>
            <button>Route</button>
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

      <section id="liquidity" className="footer">
        <span>KYOX / ENTER THE UNKNOWN</span>
        <span><Activity size={11} /> SYSTEM STATUS: FOUNDATION ONLINE</span>
      </section>
    </main>
  );
}
