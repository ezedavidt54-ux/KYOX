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
          <span className="network-pill"><span /> ROBINHOOD CHAIN</span>
          <WalletConnect />
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-scanline" />
        <div className="hero-ambient hero-ambient-one" />
        <div className="hero-ambient hero-ambient-two" />
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <BlackHoleHeroSection />
        <div className="hero-orbital-label">KYOX / GATEWAY 001</div>
        <div className="hero-content">
          <div className="eyebrow"><span className="eyebrow-dot" /> ON CHAIN TERMINAL / ROBINHOOD</div>
          <h1>ENTER <span>THE UNKNOWN</span></h1>
          <p className="hero-copy">A cinematic command surface for discovering markets, routing liquidity and executing on Robinhood Chain.</p>
          <div className="hero-actions">
            <a className="primary-cta" href="#swap">Open terminal <ArrowUpRight size={14} /></a>
            <a className="secondary-cta" href="#markets">View live market <ChevronDown size={14} /></a>
          </div>
          <div className="hero-trust"><ShieldCheck size={13} /> NON CUSTODIAL <span /> REAL ON CHAIN EXECUTION <span /> ROBINHOOD CHAIN</div>
        </div>
        <div className="hero-index"><strong>01</strong><span> / 04</span><br />SYSTEM ONLINE</div>
        <div className="hero-hud hero-hud-top">CHAIN / 4663 <span>●</span></div>
        <div className="hero-hud hero-hud-bottom">SIGNAL LOCKED / <strong>LIVE</strong></div>
      </section>

      <section className="command-deck" id="swap" aria-label="KYOX trading terminal">
        <div className="deck-head">
          <div className="deck-title"><span className="live-pulse" /> KYOX TERMINAL <span className="muted-slash">/</span> ROBINHOOD LIVE</div>
          <div className="deck-tabs"><button className="active">Spot</button><button>Limit</button><button>Route</button></div>
        </div>
        <div className="deck-body">
          <div className="market-panel" id="markets">
            <div className="market-kicker"><Radio size={11} /> LIVE MARKET DATA / CHAIN 4663</div>
            <LiveMarket />
          </div>
          <SwapPanel />
        </div>
      </section>

      <section className="feature-strip" id="analytics">
        <div><span>01</span><strong>READ THE MARKET</strong><p>Live liquidity, price action and execution context from Robinhood Chain.</p></div>
        <div><span>02</span><strong>ROUTE WITH PRECISION</strong><p>Quotes and transactions are resolved against verified on chain liquidity.</p></div>
        <div><span>03</span><strong>KEEP CONTROL</strong><p>Your wallet signs every transaction. KYOX never takes custody.</p></div>
      </section>

      <section id="liquidity" className="footer">
        <span>KYOX / ENTER THE UNKNOWN</span>
        <span><Activity size={11} /> SYSTEM STATUS: ROBINHOOD ONLINE</span>
      </section>

      <style jsx global>{`
        html, body { overflow-x: hidden; width: 100%; }
        .site-shell { width: 100%; max-width: 100vw; overflow-x: clip; }
        .navbar { width: 100%; max-width: 100vw; }
        .nav-meta { min-width: 0; max-width: 70%; }
        .hero { overflow: hidden; }
        .hero-ambient { position: absolute; border-radius: 999px; pointer-events: none; filter: blur(1px); opacity: .6; z-index: 2; }
        .hero-ambient-one { width: 180px; height: 180px; right: 19%; top: 19%; border: 1px solid rgba(151,211,255,.12); box-shadow: 0 0 80px rgba(102,174,255,.08); animation: kyox-float 7s ease-in-out infinite; }
        .hero-ambient-two { width: 90px; height: 90px; right: 10%; bottom: 24%; border: 1px solid rgba(170,126,255,.16); box-shadow: 0 0 55px rgba(150,108,255,.12); animation: kyox-float 5s ease-in-out infinite reverse; }
        .hero-orbit { position: absolute; z-index: 2; pointer-events: none; border: 1px solid rgba(178,218,255,.08); border-radius: 50%; }
        .hero-orbit-one { width: 420px; height: 150px; right: 4%; top: 34%; transform: rotate(-14deg); animation: kyox-orbit 18s linear infinite; }
        .hero-orbit-two { width: 300px; height: 105px; right: 12%; top: 41%; transform: rotate(11deg); border-color: rgba(153,119,255,.08); animation: kyox-orbit 13s linear infinite reverse; }
        .hero-hud { position: absolute; z-index: 4; color: rgba(179,205,232,.45); font: 8px 'DM Mono', monospace; letter-spacing: .14em; pointer-events: none; }
        .hero-hud span { color: #76f2b1; animation: pulse 1.4s infinite; }
        .hero-hud strong { color: #76f2b1; }
        .hero-hud-top { top: 108px; right: clamp(20px, 7vw, 110px); }
        .hero-hud-bottom { bottom: 118px; right: clamp(20px, 7vw, 110px); }
        .wallet-connect-error { margin: 0 18px 13px; padding: 10px 12px; border: 1px solid rgba(255,126,142,.18); border-radius: 9px; color: #ffadb7; background: rgba(255,75,98,.055); font: 8px 'DM Mono', monospace; line-height: 1.55; }
        @keyframes kyox-float { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(0,-14px,0) scale(1.04); } }
        @keyframes kyox-orbit { from { rotate: 0deg; } to { rotate: 360deg; } }
        @media (max-width: 820px) {
          .nav-meta { max-width: none; flex: 0 1 auto; }
          .wallet-button { max-width: 154px; white-space: nowrap; }
          .hero-hud-top { top: 82px; right: 16px; }
          .hero-hud-bottom { bottom: 25px; right: 16px; }
          .hero-orbit-one { width: 300px; height: 110px; right: -80px; top: 29%; }
          .hero-orbit-two { width: 230px; height: 85px; right: -35px; top: 38%; }
          .hero-ambient-one { right: 6%; top: 19%; width: 125px; height: 125px; }
          .hero-ambient-two { right: 1%; bottom: 30%; width: 70px; height: 70px; }
          .command-deck { max-width: calc(100vw - 12px); }
          .deck-tabs { flex-shrink: 0; }
          .wallet-modal-backdrop { overscroll-behavior: contain; }
        }
        @media (max-width: 430px) {
          .brand-name { letter-spacing: .18em; }
          .nav-meta { gap: 4px; }
          .wallet-button { padding-left: 8px; padding-right: 8px; }
          .hero-hud { font-size: 7px; }
          .hero-orbital-label { display: none; }
          .hero-ambient-one { right: -15px; }
          .hero-ambient-two { right: 18px; }
          .command-deck { max-width: calc(100vw - 10px); }
          .deck-head { gap: 8px; }
          .deck-title { min-width: 0; font-size: 8px; }
          .deck-tabs { gap: 9px; }
        }
      `}</style>
    </main>
  );
}
