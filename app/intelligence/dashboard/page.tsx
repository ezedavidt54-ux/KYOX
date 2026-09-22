import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

export default async function IntelligenceDashboard() {
  const session = await getCurrentSession();
  if (!session) redirect('/intelligence');

  const profile = session.user.tradingProfile;
  const agent = session.user.agents[0];

  return (
    <main style={{ minHeight: '100vh', padding: '42px 20px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/" style={{ opacity: .55, textDecoration: 'none', color: 'inherit' }}>KYOX</Link>
        <div style={{ marginTop: 70, display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ font: '10px DM Mono, monospace', letterSpacing: '.2em', opacity: .5 }}>PERSONAL AUTONOMOUS TRADING INTELLIGENCE</div>
            <h1 style={{ fontSize: 'clamp(42px, 7vw, 78px)', lineHeight: .95, margin: '16px 0 10px' }}>{session.user.displayName || 'YOUR INTELLIGENCE'}</h1>
            <p style={{ color: '#8993a1', maxWidth: 620 }}>Your intelligence is initialized in Observe mode. It can learn your process before it is ever allowed to execute.</p>
          </div>
          <Link href="/intelligence/onboarding" style={{ padding: '12px 16px', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, color: 'inherit', textDecoration: 'none', fontSize: 11 }}>EDIT TRADING DNA</Link>
        </div>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginTop: 42 }}>
          <Card title="MODE" value={agent?.mode || 'OBSERVE'} />
          <Card title="STATUS" value={agent?.enabled ? 'ACTIVE' : 'READY'} />
          <Card title="DNA VERSION" value={String(profile?.version || 1)} />
          <Card title="CONFIDENCE FLOOR" value={(agent ? Math.round(agent.confidenceFloor * 100) : 70) + '%'} />
        </section>

        <section style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Panel title="MARKETS">{profile?.markets?.length ? profile.markets.join(' · ') : 'Not configured'}</Panel>
          <Panel title="TIMEFRAMES">{profile?.timeframes?.length ? profile.timeframes.join(' · ') : 'Not configured'}</Panel>
          <Panel title="BIAS METHOD">{profile?.biasMethod || 'Not configured'}</Panel>
          <Panel title="ENTRY METHOD">{profile?.entryMethod || 'Not configured'}</Panel>
        </section>

        <section style={{ marginTop: 12, padding: 24, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, background: 'rgba(255,255,255,.025)' }}>
          <div style={{ font: '10px DM Mono, monospace', letterSpacing: '.15em', opacity: .5 }}>TRAINING LOOP</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10, marginTop: 18 }}>
            {['Observe decisions', 'Learn patterns', 'Propose in Shadow', 'Paper test', 'Autonomous with limits'].map((item, i) => <div key={item} style={{ padding: 15, border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, opacity: i === 0 ? 1 : .42 }}><span style={{ font: '10px DM Mono, monospace' }}>0{i + 1}</span><div style={{ marginTop: 8, fontSize: 12 }}>{item}</div></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return <div style={{ padding: 22, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, background: 'rgba(255,255,255,.025)' }}><div style={{ font: '9px DM Mono, monospace', opacity: .5, letterSpacing: '.14em' }}>{title}</div><strong style={{ display: 'block', marginTop: 9, font: '18px DM Mono, monospace' }}>{value}</strong></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ padding: 22, border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, background: 'rgba(255,255,255,.025)' }}><div style={{ font: '9px DM Mono, monospace', opacity: .5, letterSpacing: '.14em' }}>{title}</div><div style={{ marginTop: 12, color: '#c8d0da', lineHeight: 1.6 }}>{children}</div></div>;
}
