import type { AgentMode } from '@/app/generated/prisma/client';

type LearningInput = {
  mode: AgentMode;
  profile: {
    markets: string[];
    timeframes: string[];
    biasMethod: string | null;
    entryMethod: string | null;
    riskRules: unknown;
    managementRules: unknown;
    invalidationRules: unknown;
    newsRules: unknown;
  } | null;
  observations: Array<{
    asset: string;
    timeframe: string | null;
    expectedAction: string | null;
    actualAction: string | null;
    detectedSetup: unknown;
  }>;
  decisions: Array<{
    asset: string;
    action: string;
    status: string;
    confidence: number | null;
    proposedRisk: number | null;
  }>;
  feedback: Array<{
    rating: number | null;
    correction: string | null;
  }>;
  trades: Array<{
    asset: string;
    side: string;
    pnl: number | null;
    riskAmount: number | null;
  }>;
};

function pct(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function topValues(values: string[], limit = 3) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([value]) => value);
}

export function buildLearningMemory(input: LearningInput) {
  const observationMatches = input.observations.filter(
    (x) => x.expectedAction && x.actualAction,
  );
  const matched = observationMatches.filter((x) => x.expectedAction === x.actualAction).length;
  const wins = input.trades.filter((x) => (x.pnl ?? 0) > 0).length;
  const losses = input.trades.filter((x) => (x.pnl ?? 0) < 0).length;
  const totalPnl = input.trades.reduce((sum, x) => sum + (x.pnl ?? 0), 0);
  const rated = input.feedback.filter((x) => x.rating !== null);
  const averageRating = rated.length
    ? Math.round((rated.reduce((sum, x) => sum + (x.rating ?? 0), 0) / rated.length) * 10) / 10
    : null;
  const corrections = input.feedback.map((x) => x.correction?.trim()).filter(Boolean).slice(0, 5);

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    mode: input.mode,
    profile: input.profile
      ? {
          markets: input.profile.markets,
          timeframes: input.profile.timeframes,
          biasMethod: input.profile.biasMethod,
          entryMethod: input.profile.entryMethod,
          riskRules: input.profile.riskRules,
          managementRules: input.profile.managementRules,
          invalidationRules: input.profile.invalidationRules,
          newsRules: input.profile.newsRules,
        }
      : null,
    observedPattern: {
      observations: input.observations.length,
      decisionAccuracy: observationMatches.length ? pct(matched, observationMatches.length) : null,
      commonAssets: topValues(input.observations.map((x) => x.asset)),
      commonTimeframes: topValues(input.observations.map((x) => x.timeframe).filter((x): x is string => Boolean(x))),
    },
    decisionPattern: {
      decisions: input.decisions.length,
      proposed: input.decisions.filter((x) => x.status === 'PROPOSED').length,
      rejected: input.decisions.filter((x) => x.status === 'REJECTED').length,
      averageConfidence: input.decisions.length
        ? Math.round(
            (input.decisions.reduce((sum, x) => sum + (x.confidence ?? 0), 0) / input.decisions.length) * 100,
          ) / 100
        : null,
      commonActions: topValues(input.decisions.map((x) => x.action)),
    },
    outcomePattern: {
      trades: input.trades.length,
      wins,
      losses,
      winRate: input.trades.length ? pct(wins, input.trades.length) : null,
      totalPnl: Math.round(totalPnl * 100) / 100,
      riskedTrades: input.trades.filter((x) => (x.riskAmount ?? 0) > 0).length,
    },
    feedbackPattern: {
      feedbackCount: input.feedback.length,
      averageRating,
      recentCorrections: corrections,
    },
  };
}
