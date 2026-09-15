import { PageShell } from '@/components/page-shell';

export default function MarketsPage() {
  return <PageShell kicker="KYOX / MARKETS" title="Markets" description="Explore available onchain markets and token pairs on Robinhood Chain."><div className="stats"><div className="stat"><span>NETWORK</span><strong>ROBINHOOD</strong></div><div className="stat"><span>CHAIN ID</span><strong>4663</strong></div><div className="stat"><span>STATUS</span><strong>LIVE</strong></div></div></PageShell>;
}
