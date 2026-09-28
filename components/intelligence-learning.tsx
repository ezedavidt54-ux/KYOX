'use client';

import { useState } from 'react';

type Decision = { id: string; asset: string; action: string; status: string; thesis: string | null; confidence: number | null; proposedEntry: number | null; proposedStop: number | null; proposedTarget: number | null; proposedRisk: number | null; decidedAt: string };
type Observation = { id: string; asset: string; timeframe: string | null; expectedAction: string | null; observedAt: string };
type Feedback = { id: string; rating: number | null; correction: string | null; createdAt: string };

export default function IntelligenceLearning({ initialDecisions, initialObservations, initialFeedback }: { initialDecisions: Decision[]; initialObservations: Observation[]; initialFeedback: Feedback[] }) {
  const [tab, setTab] = useState<'observe' | 'decision' | 'feedback'>('observe');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [asset, setAsset] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('5M');
  const [action, setAction] = useState('BUY');
  const [thesis, setThesis] = useState('');
  const [entry, setEntry] = useState('');
  const [stop, setStop] = useState('');
  const [target, setTarget] = useState('');
  const [risk, setRisk] = useState('');
  const [confidence, setConfidence] = useState('0.70');
  const [correction, setCorrection] = useState('');
  const [rating, setRating] = useState('5');

  async function submit() {
    setBusy(true); setMessage('');
    try {
      const endpoint = tab === 'observe' ? '/api/intelligence/observations' : tab === 'decision' ? '/api/intelligence/decisions' : '/api/intelligence/feedback';
      const body = tab === 'observe'
        ? { asset, timeframe, expectedAction: action, marketSnapshot: { source: 'manual_observation' }, detectedSetup: { thesis } }
        : tab === 'decision'
          ? { asset, action, thesis, confidence: Number(confidence), proposedEntry: entry ? Number(entry) : undefined, proposedStop: stop ? Number(stop) : undefined, proposedTarget: target ? Number(target) : undefined, proposedRisk: risk ? Number(risk) : undefined, marketSnapshot: { source: 'manual_decision' } }
          : { rating: Number(rating), correction };
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save.');
      setMessage(tab === 'observe' ? 'Observation recorded.' : tab === 'decision' ? 'Decision recorded.' : 'Feedback recorded.');
      if (tab === 'observe' || tab === 'decision') setThesis('');
      if (tab === 'feedback') setCorrection('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save.');
    } finally { setBusy(false); }
  }

  return <section style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 12 }}>
    <div style={panel}>
      <div style={kicker}>LEARNING INPUT</div>
      <div style={{ display: 'flex', gap: 7, marginTop: 16, flexWrap: 'wrap' }}>
        {(['observe', 'decision', 'feedback'] as const).map(item => <button key={item} onClick={() => setTab(item)} style={{ ...tabButton, opacity: tab === item ? 1 : .48 }}>{item.toUpperCase()}</button>)}
      </div>
      {tab !== 'feedback' ? <>
        <div style={fieldGrid}>
          <Field label="ASSET"><input value={asset} onChange={e => setAsset(e.target.value.toUpperCase())} /></Field>
          <Field label="TIMEFRAME"><input value={timeframe} onChange={e => setTimeframe(e.target.value.toUpperCase())} /></Field>
          <Field label="ACTION"><select value={action} onChange={e => setAction(e.target.value)}>{['BUY','SELL','HOLD','WAIT','REJECT'].map(x => <option key={x}>{x}</option>)}</select></Field>
          {tab === 'decision' && <Field label="CONFIDENCE"><input type="number" min="0" max="1" step="0.01" value={confidence} onChange={e => setConfidence(e.target.value)} /></Field>}
        </div>
        {tab === 'decision' && <div style={fieldGrid}>
          <Field label="ENTRY"><input type="number" value={entry} onChange={e => setEntry(e.target.value)} /></Field>
          <Field label="STOP"><input type="number" value={stop} onChange={e => setStop(e.target.value)} /></Field>
          <Field label="TARGET"><input type="number" value={target} onChange={e => setTarget(e.target.value)} /></Field>
          <Field label="RISK"><input type="number" value={risk} onChange={e => setRisk(e.target.value)} /></Field>
        </div>}
        <Field label={tab === 'observe' ? 'WHAT DID YOU SEE?' : 'TRADING THESIS'}><textarea value={thesis} onChange={e => setThesis(e.target.value)} placeholder="Record the reasoning, setup and context." /></Field>
      </> : <>
        <Field label="RATING"><select value={rating} onChange={e => setRating(e.target.value)}>{[1,2,3,4,5].map(x => <option key={x}>{x}</option>)}</select></Field>
        <Field label="CORRECTION / LESSON"><textarea value={correction} onChange={e => setCorrection(e.target.value)} placeholder="What should your intelligence learn from this?" /></Field>
      </>}
      <button onClick={submit} disabled={busy} style={submitButton}>{busy ? 'SAVING...' : 'RECORD INPUT'}</button>
      {message && <div style={{ marginTop: 12, color: '#9da6b3', font: '10px DM Mono, monospace' }}>{message}</div>}
    </div>
    <div style={panel}>
      <div style={kicker}>RECENT LEARNING DATA</div>
      <DataList title="DECISIONS" items={initialDecisions.map(x => x.asset + ' · ' + x.action + ' · ' + x.status)} empty="No decisions yet." />
      <DataList title="OBSERVATIONS" items={initialObservations.map(x => x.asset + ' · ' + (x.timeframe || 'N/A') + ' · ' + (x.expectedAction || 'WAIT'))} empty="No observations yet." />
      <DataList title="FEEDBACK" items={initialFeedback.map(x => (x.rating ?? 'N/A') + '/5 · ' + (x.correction || 'No correction'))} empty="No feedback yet." />
    </div>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: 'grid', gap: 7, marginTop: 14 }}><span style={kicker}>{label}</span>{children}</label>;
}
function DataList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <div style={{ marginTop: 22 }}><div style={kicker}>{title}</div><div style={{ marginTop: 8, display: 'grid', gap: 7 }}>{items.length ? items.map((x, i) => <div key={i} style={listItem}>{x}</div>) : <div style={{ color: '#58616c', fontSize: 11 }}>{empty}</div>}</div></div>;
}
const panel = { padding: 24, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, background: 'rgba(255,255,255,.025)' };
const kicker = { font: '9px DM Mono, monospace', letterSpacing: '.15em', opacity: .5 };
const tabButton = { padding: '9px 11px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, background: 'rgba(255,255,255,.04)', color: '#e8edf3', font: '9px DM Mono, monospace', letterSpacing: '.1em' };
const fieldGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 };
const submitButton = { width: '100%', marginTop: 18, padding: 13, border: 0, borderRadius: 9, background: '#eef2f7', color: '#030405', font: '10px DM Mono, monospace', fontWeight: 700, letterSpacing: '.12em' };
const listItem = { padding: '10px 11px', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: '#aeb7c2', font: '10px DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
