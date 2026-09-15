import Link from 'next/link';
import { ArrowUpRight, Activity, ChevronDown, Radio, ShieldCheck } from 'lucide-react';
import { BlackHoleHeroSection } from '@/components/ui/blackhole-hero-section';
import { LiveMarket } from '@/components/live-market';
import { WalletConnect } from '@/components/wallet-connect';
import { SwapPanel } from '@/components/swap-panel';

export default function Home() {
  return (
    <main className="site-shell">
      <header className="navbar">
        <Link href="/" className="brand">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">KYOX</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="#markets">Markets</Link>
          <Link href="#swap">Swap</Link>
          <Link href="#liquidity">Liquidity</Link>
          <Link href="#analytics">Analytics</Link>
        </nav>
        <div className="nav-meta">
          <span className="network-pill"><span /> ARBITRUM ONE</span>
          <WalletConnect />
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-scanline" />
        <BlackHoleHeroSection />
        <div className="hero-orbital-label">KYOX / GATEWAY 001</div>
        <div className="hero-content">
          <div className="eyebrow"><span className="eyebrow-dot" /> ON CHAIN TERMINAL / ARBITRUM</div>
          <h1>ENTER <span>THE UNKNOWN</span></h1>
          <p className="hero-copy">A cinematic command surface for discovering markets, routing liquidity and executing on chain.</p>
          <div className="hero-actions">
            <a className="primary-cta" href="#swap">Open terminal <ArrowUpRight size={14} /></a>
            <a className="secondary-cta" href="#markets">View live market <ChevronDown size={14} /></a>
          </div>
          <div className="hero-trust"><ShieldCheck size={13} /> NON CUSTODIAL <span /> REAL ON CHAIN EXECUTION <span /> ARBITRUM ONE</div>
        </div>
        <div className="hero-index"><strong>01</strong><span> / 04</span><br />SYSTEM ONLINE</div>
      </section>

      <section className="command-deck" id="swap" aria-label="KYOX trading terminal">
        <div className="deck-head">
          <div className="deck-title"><span className="live-pulse" /> KYOX TERMINAL <span className="muted-slash">/</span> LIVE MARKET</div>
          <div className="deck-tabs"><button className="active">Spot</button><button>Limit</button><button>Route</button></div>
        </div>
        <div className="deck-body">
          <div className="market-panel" id="markets">
            <div className="market-kicker"><Radio size={11} /> LIVE MARKET DATA</div>
            <LiveMarket />
          </div>
          <SwapPanel />
        </div>
      </section>

      <section className="feature-strip" id="analytics">
        <div><span>01</span><strong>READ THE MARKET</strong><p>Live liquidity, price action and execution context from the chain.</p></div>
        <div><span>02</span><strong>ROUTE WITH PRECISION</strong><p>Quotes and transactions are resolved against on chain liquidity.</p></div>
        <div><span>03</span><strong>KEEP CONTROL</strong><p>Your wallet signs every transaction. KYOX never takes custody.</p></div>
      </section>

      <section id="liquidity" className="footer">
        <span>KYOX / ENTER THE UNKNOWN</span>
        <span><Activity size={11} /> SYSTEM STATUS: FOUNDATION ONLINE</span>
      </section>
    </main>
  );
}
