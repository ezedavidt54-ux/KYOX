'use client';

import { useState } from 'react';

type Props = {
  systemVersion: string;
  memorySummary: string | null;
};

export default function IntelligenceLearningPass({ systemVersion, memorySummary }: Props) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ observations: number; decisions: number; trades: number; feedbackCount: number } | null>(null);
  const [error, setError] = useState('');

  async function runLearning() {
    setRunning(true);
    setError('');
    try {
      const response = await fetch('/api/intelligence/learn', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Learning pass failed.');
      setResult({
        observations: body.memory.observedPattern.observations,
        decisions: body.memory.decisionPattern.decisions,
        trades: body.memory.outcomePattern.trades,
        feedbackCount: body.memory.feedbackPattern.feedbackCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Learning pass failed.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section style={{ marginTop: 12, padding: 24, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, background: 'rgba(255,255,255,.025)' }}>
      <div style={{ font: '9px DM Mono, monospace', letterSpacing: '.15em', opacity: .5 }}>PERSONAL MEMORY</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
        <div>
          <strong style={{ font: '16px DM Mono, monospace' }}>{systemVersion}</strong>
          <p style={{ margin: '8px 0 0', color: '#8993a1', fontSize: 11, lineHeight: 1.6, maxWidth: 680 }}>
            Run a deterministic learning pass to compress your recorded observations, decisions, feedback and trade outcomes into the intelligence memory layer. No trade execution is performed.
          </p>
        </div>
        <button onClick={runLearning} disabled={running} style={{ padding: '11px 15px', border: '1px solid rgba(255,255,255,.14)', borderRadius: 9, background: 'transparent', color: 'inherit', cursor: running ? 'wait' : 'pointer', font: '10px DM Mono, monospace' }}>
          {running ? 'LEARNING...' : 'RUN LEARNING PASS'}
        </button>
      </div>
      {result && <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 8 }}>
        <Metric label="OBSERVED" value={result.observations} />
        <Metric label="DECISIONS" value={result.decisions} />
        <Metric label="TRADES" value={result.trades} />
        <Metric label="FEEDBACK" value={result.feedbackCount} />
      </div>}
      {memorySummary && !result && <p style={{ marginTop: 14, color: '#58616c', fontSize: 10 }}>Existing learned memory is available. Run another pass to refresh it.</p>}
      {error && <p style={{ marginTop: 14, color: '#b88', fontSize: 11 }}>{error}</p>}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div style={{ padding: 12, border: '1px solid rgba(255,255,255,.06)', borderRadius: 8 }}><div style={{ font: '9px DM Mono, monospace', opacity: .5 }}>{label}</div><strong style={{ display: 'block', marginTop: 7, font: '15px DM Mono, monospace' }}>{value}</strong></div>;
}
