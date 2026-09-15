'use client';

export default function MarketsPage() {
  return (
    <main className="terminal-page">
      <section className="terminal-section">
        <div className="section-kicker">KYOX / MARKETS</div>
        <h1>Markets</h1>
        <p>Explore available onchain markets and token pairs on Robinhood Chain.</p>
        <div className="terminal-grid">
          <div className="terminal-card"><span>NETWORK</span><strong>ROBINHOOD CHAIN</strong></div>
          <div className="terminal-card"><span>CHAIN ID</span><strong>4663</strong></div>
          <div className="terminal-card"><span>STATUS</span><strong>LIVE</strong></div>
        </div>
      </section>
    </main>
  );
}
