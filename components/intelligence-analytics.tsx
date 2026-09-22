'use client';

import { useEffect, useState } from 'react';

type Analytics = {
  decisions: { total: number; linked: number; directionalClosed: number; accuracy: number | null };
  outcomes: { closed: number; wins: number; losses: number; breakeven: number; winRate: number | null; totalPnl: number; averagePnl: number };
  confidence: { label: string; count: number; winRate: number | null }[];
  assets: { asset: string; trades: number; winRate: number; pnl: number }[];
  feedback: { id: string; rating: number | null; correction: string | null; createdAt: string }[];
};

export default function IntelligenceAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/intelligence/analytics')
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Unable to load analytics.');
        return body as Analytics;
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load analytics.'));
  }, []);

  if (error) return <section style={panel}><div style={kicker}>LEARNING PERFORMANCE</div><p style={{ color: '#8993a1', fontSize: 12 }}>{error}</p></section>;
  if (!data) return <section style={panel}><div style={kicker}>LEARNING PERFORMANCE</div><p style={{ color: '#58616c', fontSize: 12 }}>Loading outcome data...</p></section>;

  return <section style={{ marginTop: 12 }}>
    <div style={panel}>
      <div style={kicker}>LEARNING PERFORMANCE</div>
      <p style={{ color: '#8993a1', fontSize: 12, lineHeight: 1.6, maxWidth: 700 }}>
        Outcome data is calculated from trades linked to recorded decisions. Directional accuracy measures whether BUY or SELL decisions matched the recorded trade side. It is separate from profitability.
      </p>
      <div style={metricGrid}>
        <Metric title="DECISIONS" value={String(data.decisions.total)} />
        <Metric title="LINKED TRADES" value={String(data.decisions.linked)} />
        <Metric title="CLOSED TRADES" value={String(data.outcomes.closed)} />
        <Metric title="WIN RATE" value={data.outcomes.winRate === null ? 'N/A' : data.outcomes.winRate + '%'} />
        <Metric title="TOTAL PNL" value={formatNumber(data.outcomes.totalPnl)} />
        <Metric title="AVG PNL" value={formatNumber(data.outcomes.averagePnl)} />
        <Metric title="DIRECTIONAL ACCURACY" value={data.decisions.accuracy === null ? 'N/A' : data.decisions.accuracy + '%'} />
        <Metric title="FEEDBACK ENTRIES" value={String(data.feedback.length)} />
      </div>
    </div>

    <div style={splitGrid}>
      <div style={panel}>
        <div style={kicker}>CONFIDENCE CALIBRATION</div>
        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          {data.confidence.map((bucket) => (
            <div key={bucket.label} style={row}>
              <span>{bucket.label}</span>
              <span>{bucket.count ? bucket.count + ' trades · ' + bucket.winRate + '% win rate' : 'No linked outcomes'}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={panel}>
        <div style={kicker}>OUTCOME MIX</div>
        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          <div style={row}><span>Wins</span><span>{data.outcomes.wins}</span></div>
          <div style={row}><span>Losses</span><span>{data.outcomes.losses}</span></div>
          <div style={row}><span>Breakeven</span><span>{data.outcomes.breakeven}</span></div>
        </div>
      </div>
    </div>

    {data.assets.length > 0 && <div style={{ ...panel, marginTop: 12 }}>
      <div style={kicker}>ASSET BREAKDOWN</div>
      <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
        {data.assets.slice(0, 8).map((asset) => (
          <div key={asset.asset} style={row}>
            <span>{asset.asset}</span>
            <span>{asset.trades} trades · {asset.winRate}% win rate · {formatNumber(asset.pnl)} PnL</span>
          </div>
        ))}
      </div>
    </div>}

    <div style={{ ...panel, marginTop: 12 }}>
      <div style={kicker}>RECENT LESSONS</div>
      {data.feedback.length ? (
        <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
          {data.feedback.map((item) => (
            <div key={item.id} style={lesson}>
              <strong>{item.rating ?? 'N/A'}/5</strong>
              <span>{item.correction || 'No written correction.'}</span>
            </div>
          ))}
        </div>
      ) : <p style={{ color: '#58616c', fontSize: 11, marginTop: 14 }}>No feedback lessons recorded yet.</p>}
    </div>
  </section>;
}

function Metric({ title, value }: { title: string; value: string }) {
  return <div style={{ padding: 16, border: '1px solid rgba(255,255,255,.06)', borderRadius: 9 }}>
    <div style={kicker}>{title}</div>
    <strong style={{ display: 'block', marginTop: 8, font: '17px DM Mono, monospace' }}>{value}</strong>
  </div>;
}

function formatNumber(value: number) {
  return value > 0 ? '+' + value : String(value);
}

const panel = { padding: 24, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, background: 'rgba(255,255,255,.025)' };
const kicker = { font: '9px DM Mono, monospace', letterSpacing: '.15em', opacity: .5 };
const metricGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 9, marginTop: 18 };
const splitGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 };
const row = { display: 'flex', justifyContent: 'space-between', gap: 14, padding: '11px 12px', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: '#aeb7c2', font: '10px DM Mono, monospace' };
const lesson = { display: 'grid', gridTemplateColumns: '50px 1fr', gap: 12, padding: '12px', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: '#aeb7c2', fontSize: 11, lineHeight: 1.5 };
