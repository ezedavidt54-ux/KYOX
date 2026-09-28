import { PageShell } from '@/components/page-shell';
import { MarketsDashboard } from '@/components/markets-dashboard';

export default function MarketsPage() {
  return (
    <PageShell
      kicker="KYOX / MARKETS"
      title="Markets"
      description="A live market intelligence surface for Robinhood Chain. Discover onchain liquidity, token pairs, Stock Tokens and execution infrastructure from one place."
    >
      <MarketsDashboard />
    </PageShell>
  );
}
