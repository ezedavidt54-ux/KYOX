'use client';

export default function DocsPage() {
  return (
    <main className="terminal-page">
      <section className="terminal-section">
        <div className="section-kicker">KYOX / DOCUMENTATION</div>
        <h1>Documentation</h1>
        <p>Guides for connecting a wallet, using KYOX and interacting with Robinhood Chain.</p>
        <div className="terminal-grid">
          <div className="terminal-card"><span>NETWORK</span><strong>ROBINHOOD CHAIN</strong></div>
          <div className="terminal-card"><span>CHAIN ID</span><strong>4663</strong></div>
          <div className="terminal-card"><span>GAS</span><strong>ETH</strong></div>
        </div>
      </section>
    </main>
  );
}
