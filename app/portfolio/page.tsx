'use client';

export default function PortfolioPage() {
  return (
    <main className="terminal-page">
      <section className="terminal-section">
        <div className="section-kicker">KYOX / PORTFOLIO</div>
        <h1>Portfolio</h1>
        <p>Track connected wallet balances and positions on Robinhood Chain.</p>
        <div className="terminal-grid">
          <div className="terminal-card"><span>NETWORK</span><strong>ROBINHOOD CHAIN</strong></div>
          <div className="terminal-card"><span>CHAIN ID</span><strong>4663</strong></div>
          <div className="terminal-card"><span>WALLET</span><strong>CONNECT TO VIEW</strong></div>
        </div>
      </section>
    </main>
  );
}
