'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const markets = ['XAUUSD', 'BTCUSDT', 'EURUSD', 'GBPJPY', 'US30', 'NAS100'];
const timeframes = ['1H', '15M', '5M', '1M'];

export default function IntelligenceOnboarding() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(['XAUUSD']);
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>(['1H', '5M', '1M']);
  const [biasMethod, setBiasMethod] = useState('Top down analysis');
  const [entryMethod, setEntryMethod] = useState('HTF bias → POI → LTF execution');
  const [risk, setRisk] = useState('Fixed risk with a hard stop');
  const [management, setManagement] = useState('Protect capital and manage toward the planned target');
  const [invalidation, setInvalidation] = useState('Invalidate when the HTF structure or execution thesis breaks');
  const [news, setNews] = useState('Check major news before execution');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggle(value: string, current: string[], set: (v: string[]) => void) {
    set(current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          tradingProfile: {
            markets: selectedMarkets,
            timeframes: selectedTimeframes,
            biasMethod,
            entryMethod,
            riskRules: { summary: risk },
            managementRules: { summary: management },
            invalidationRules: { summary: invalidation },
            newsRules: { summary: news },
            notes,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save your Trading DNA.');
      router.push('/intelligence/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your Trading DNA.');
      setSaving(false);
    }
  }

  const fieldStyle = { width: '100%', padding: '13px 14px', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, background: 'rgba(255,255,255,.035)', color: 'inherit', outline: 'none' };

  return (
    <main style={{ minHeight: '100vh', padding: '42px 20px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ font: '10px DM Mono, monospace', letterSpacing: '.2em', opacity: .5 }}>KYOX / TRADING DNA</div>
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', lineHeight: .95, margin: '18px 0 14px' }}>TEACH KYOX<br />HOW YOU TRADE.</h1>
        <p style={{ maxWidth: 650, color: '#8993a1', lineHeight: 1.7 }}>This is your starting model. KYOX observes these rules first, then learns from your real decisions and corrections.</p>

        <section style={{ marginTop: 42, display: 'grid', gap: 24 }}>
          <label>NAME<input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="What should KYOX call you?" style={{ ...fieldStyle, marginTop: 8 }} /></label>

          <div>
            <div style={{ fontSize: 11, letterSpacing: '.12em', opacity: .55, marginBottom: 10 }}>MARKETS</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{markets.map(item => <button key={item} type="button" onClick={() => toggle(item, selectedMarkets, setSelectedMarkets)} style={{ padding: '10px 13px', borderRadius: 999, border: '1px solid rgba(255,255,255,.1)', background: selectedMarkets.includes(item) ? 'rgba(255,255,255,.14)' : 'transparent', color: 'inherit' }}>{item}</button>)}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: '.12em', opacity: .55, marginBottom: 10 }}>TIMEFRAMES</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{timeframes.map(item => <button key={item} type="button" onClick={() => toggle(item, selectedTimeframes, setSelectedTimeframes)} style={{ padding: '10px 13px', borderRadius: 999, border: '1px solid rgba(255,255,255,.1)', background: selectedTimeframes.includes(item) ? 'rgba(255,255,255,.14)' : 'transparent', color: 'inherit' }}>{item}</button>)}</div>
          </div>

          {[
            ['BIAS METHOD', biasMethod, setBiasMethod],
            ['ENTRY METHOD', entryMethod, setEntryMethod],
            ['RISK RULES', risk, setRisk],
            ['MANAGEMENT RULES', management, setManagement],
            ['INVALIDATION RULES', invalidation, setInvalidation],
            ['NEWS RULES', news, setNews],
          ].map(([label, value, setter]) => (
            <label key={label as string}>{label as string}<input value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)} style={{ ...fieldStyle, marginTop: 8 }} /></label>
          ))}

          <label>NOTES<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything KYOX should understand about how you make decisions?" rows={5} style={{ ...fieldStyle, marginTop: 8, resize: 'vertical' }} /></label>

          {error && <div style={{ color: '#ff9e9e', fontSize: 12 }}>{error}</div>}
          <button type="button" onClick={save} disabled={saving || selectedMarkets.length === 0 || selectedTimeframes.length === 0} style={{ padding: '15px 18px', border: 0, borderRadius: 10, background: '#eef2f7', color: '#030405', fontWeight: 800, letterSpacing: '.1em' }}>
            {saving ? 'SAVING TRADING DNA...' : 'SAVE AND ENTER INTELLIGENCE'}
          </button>
        </section>
      </div>
    </main>
  );
}
