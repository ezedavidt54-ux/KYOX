import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Activity, Zap } from 'lucide-react';
import { BlackHoleHeroSection } from '@/components/ui/blackhole-hero-section';
import { WalletConnect } from '@/components/wallet-connect';

const stats = [
  ['TVL', '$12.84M'],
  ['24H VOLUME', '$4.21M'],
  ['LIQUIDITY', '$8.17M'],
  ['ACTIVE TRADERS', '3,842'],
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
                <div className="price">3,942.18</div>
              </div>
              <div className="change">+4.82%</div>
            </div>
            <div className="chart">
              <div className="chart-grid" />
              <svg viewBox="0 0 800 210" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="white" stopOpacity=".13" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 165 L45 158 L78 171 L118 135 L150 146 L194 110 L230 127 L270 92 L310 101 L350 77 L389 89 L430 65 L470 78 L512 54 L554 72 L600 41 L642 56 L685 34 L726 50 L800 18 L800 210 L0 210Z" fill="url(#area)" />
                <path d="M0 165 L45 158 L78 171 L118 135 L150 146 L194 110 L230 127 L270 92 L310 101 L350 77 L389 89 L430 65 L470 78 L512 54 L554 72 L600 41 L642 56 L685 34 L726 50 L800 18" fill="none" stroke="rgba(238,242,247,.8)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
          <div className="swap-panel">
            <div className="swap-title">EXECUTE SWAP</div>
            <div className="swap-box">
              <div className="swap-row"><span className="swap-label">YOU PAY</span><div className="token"><span className="token-dot" /> ETH <ChevronDown size={12} /></div></div>
              <div className="amount">0.00</div>
              <div className="balance">BALANCE 0.0000 ETH</div>
              <div className="swap-divider" />
              <div className="swap-row"><span className="swap-label">YOU RECEIVE</span><div className="token"><span className="token-dot" /> USDC <ChevronDown size={12} /></div></div>
              <div className="amount">0.00</div>
              <div className="balance">ESTIMATED RECEIVE</div>
            </div>
            <button className="swap-submit"><Zap size={13} /> CONNECT WALLET TO TRADE</button>
          </div>
        </div>
      </section>

      <section className="stats" id="analytics">
        {stats.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </section>

      <section id="liquidity" className="footer">
        <span>KYOX / ENTER THE UNKNOWN</span>
        <span><Activity size={11} /> SYSTEM STATUS: OPERATIONAL</span>
      </section>
    </main>
  );
}
