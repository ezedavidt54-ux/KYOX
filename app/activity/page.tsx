'use client';

export default function ActivityPage() {
  return (
    <main className="terminal-page">
      <section className="terminal-section">
        <div className="section-kicker">KYOX / ACTIVITY</div>
        <h1>Activity</h1>
        <p>Review wallet transactions and swap activity on Robinhood Chain.</p>
        <div className="terminal-grid">
          <div className="terminal-card"><span>NETWORK</span><strong>ROBINHOOD CHAIN</strong></div>
          <div className="terminal-card"><span>EXPLORER</span><strong>BLOCKSCOUT</strong></div>
          <div className="terminal-card"><span>ACTIVITY</span><strong>CONNECT TO VIEW</strong></div>
        </div>
      </section>
    </main>
  );
}
