import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Menu } from 'lucide-react';
import { BlackHoleHeroSection } from '@/components/ui/blackhole-hero-section';
import { WalletConnect } from '@/components/wallet-connect';
import { SwapPanel } from '@/components/swap-panel';
import { MarketFeed } from '@/components/market-feed';

const stages = [
  ['01', 'Observe', "KYOX watches how each trader analyses the market and makes decisions."],
  ['02', 'Shadow', 'The personal intelligence proposes decisions without taking control.'],
  ['03', 'Paper', 'The intelligence tests its learned process against live market conditions.'],
  ['04', 'Autonomous', "Execution becomes possible only within the user's explicit limits."],
];

const surfaces = [
  ['Wallet', 'Identity and capital'],
  ['Markets', 'Live market context'],
  ['Trading DNA', 'Your personal method'],
  ['Intelligence', 'Decision memory'],
  ['Shadow', 'Compare decisions'],
  ['Paper', 'Simulated execution'],
];

export default function Home() {
  return (
    <main className="kx-home">
      <header className="kx-nav">
        <Link href="/" className="kx-brand" aria-label="KYOX home"><span className="kx-brand-mark" /><span>KYOX</span></Link>
        <nav className="kx-navlinks" aria-label="Primary navigation">
          <Link href="/markets">Markets</Link>
          <Link href="/intelligence">Intelligence</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/activity">Activity</Link>
        </nav>
        <div className="kx-navright">
          <span className="kx-network">ROBINHOOD CHAIN</span>
          <WalletConnect />
          <Link href="/intelligence" className="kx-menu" aria-label="Open KYOX intelligence"><Menu size={17} /></Link>
        </div>
      </header>

      <section className="kx-hero">
        <BlackHoleHeroSection />
        <div className="kx-hero-copy">
          <div className="kx-kicker">KYOX / PERSONAL ON CHAIN INTELLIGENCE</div>
          <h1>THE INTELLIGENCE<br /><span>BEHIND YOUR TRADING.</span></h1>
          <p>KYOX learns how you analyse markets, make decisions, manage risk and execute. One personal intelligence layer for your entire on chain trading process.</p>
          <div className="kx-actions">
            <Link href="/intelligence" className="kx-primary">Build your intelligence <ArrowUpRight size={14} /></Link>
            <Link href="#terminal" className="kx-secondary">Explore KYOX <ArrowDown size={14} /></Link>
          </div>
        </div>
        <div className="kx-hero-meta">
          <div className="kx-meta-item"><span>PHASE</span><strong>03 / INTELLIGENCE</strong></div>
          <div className="kx-meta-item"><span>MODE</span><strong>LEARNING</strong></div>
          <div className="kx-meta-item"><span>CHAIN</span><strong>ROBINHOOD</strong></div>
        </div>
      </section>

      <section className="kx-section kx-center">
        <div className="kx-section-kicker">THE PROBLEM</div>
        <h2>YOUR TRADING PROCESS WAS NEVER BUILT <span>AS ONE SYSTEM.</span></h2>
        <p className="kx-lede">Charts, wallets, execution, notes and decisions live in separate places. KYOX brings the pieces together so your trading process can become a persistent intelligence.</p>
        <div className="kx-visual">
          <div className="kx-visual-inner">
            <div className="kx-orbit">
              {surfaces.map(([title, text]) => <div className="kx-chip" key={title}>{title} <span>·</span> {text}</div>)}
            </div>
          </div>
        </div>
      </section>

      <div className="kx-divider" />

      <section className="kx-section" id="terminal">
        <div className="kx-section-kicker">THE TERMINAL</div>
        <h2>ONE ENVIRONMENT.<br /><span>YOUR MARKET. YOUR INTELLIGENCE.</span></h2>
        <p className="kx-lede" style={{ marginLeft: 0, marginRight: 0 }}>The existing KYOX trading surface stays intact. The homepage now makes the product visible instead of hiding the real interface behind empty space.</p>
        <div className="kx-terminal" style={{ marginTop: 42 }}>
          <div className="kx-terminal-head">
            <div className="kx-terminal-title"><span className="kx-live" /> KYOX TERMINAL / LIVE</div>
            <div className="kx-terminal-links"><Link href="/markets">Markets</Link><Link href="/activity">Activity</Link><Link href="/portfolio">Portfolio</Link></div>
          </div>
          <div className="kx-terminal-body">
            <div className="kx-market">
              <MarketFeed />
              <div className="kx-chart"><div className="kx-chart-line" /></div>
            </div>
            <div className="kx-swap"><SwapPanel /></div>
          </div>
        </div>
      </section>

      <section className="kx-section kx-center">
        <div className="kx-section-kicker">THE INTELLIGENCE LOOP</div>
        <h2>IT LEARNS <span>BEFORE IT ACTS.</span></h2>
        <p className="kx-lede">KYOX is being built as a progression from observation to controlled autonomy, with the trader remaining in charge of the rules.</p>
        <div className="kx-stages">
          {stages.map(([number, title, text], index) => <article className={`kx-stage ${index === 0 ? 'active' : ''}`} key={number}><div className="kx-stage-num">{number} / 04</div><strong>{title}</strong><p>{text}</p></article>)}
        </div>
      </section>

      <section className="kx-cta">
        <div className="kx-section-kicker">KYOX / NEXT</div>
        <h2>BUILD THE SYSTEM<br />THAT LEARNS YOU.</h2>
        <p>Your wallet becomes the identity. Your trading process becomes the data. Your intelligence becomes the interface.</p>
        <Link href="/intelligence" className="kx-primary">Start personal intelligence <ArrowUpRight size={14} /></Link>
      </section>

      <footer className="kx-footer"><span>KYOX / ENTER THE UNKNOWN</span><span>FOUNDATION ONLINE / ROBINHOOD CHAIN</span></footer>
    </main>
  );
}
