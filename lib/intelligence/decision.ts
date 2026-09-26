import type { AgentDecision, AgentMode, TradingDNA } from '@/lib/intelligence/types';

type LearningMemory = {
  observedPattern?: {
    decisionAccuracy?: number | null;
    commonAssets?: string[];
    commonTimeframes?: string[];
  };
  decisionPattern?: {
    averageConfidence?: number | null;
    commonActions?: string[];
  };
  feedbackPattern?: {
    averageRating?: number | null;
    recentCorrections?: string[];
  };
};

export type DecisionInput = {
  mode: AgentMode;
  profile: TradingDNA | null;
  memory: LearningMemory | null;
  asset: string;
  timeframe?: string | null;
  expectedAction?: AgentDecision['action'] | null;
  setup?: string | null;
  marketSnapshot?: Record<string, unknown>;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  risk?: number | null;
};

export function buildAgentDecision(input: DecisionInput): AgentDecision {
  const asset = input.asset.trim().toUpperCase();
  const setup = input.setup?.trim();
  const profile = input.profile;
  const memory = input.memory;

  const action =
    input.expectedAction === 'BUY' || input.expectedAction === 'SELL'
      ? input.expectedAction
      : 'WAIT';

  if (action === 'WAIT') {
    return {
      action,
      asset,
      confidence: 0.5,
      thesis: 'No directional setup was supplied. The intelligence remains in wait state.',
    };
  }

  let confidence = 0.5;

  if (profile?.markets?.some((market) => market.toUpperCase() === asset)) confidence += 0.15;
  if (profile?.timeframes?.includes(input.timeframe ?? '')) confidence += 0.05;
  if (setup) confidence += 0.1;

  const accuracy = memory?.observedPattern?.decisionAccuracy;
  if (typeof accuracy === 'number') confidence += Math.min(0.1, Math.max(0, accuracy / 1000));

  const rating = memory?.feedbackPattern?.averageRating;
  if (typeof rating === 'number') confidence += Math.min(0.05, Math.max(0, (rating - 3) / 20));

  confidence = Math.min(0.99, Math.max(0.01, Number(confidence.toFixed(2))));

  const thesisParts = [
    profile?.biasMethod ? `Bias method: ${profile.biasMethod}.` : null,
    profile?.entryMethod ? `Entry method: ${profile.entryMethod}.` : null,
    setup ? `Observed setup: ${setup}.` : null,
    input.timeframe ? `Execution timeframe: ${input.timeframe}.` : null,
  ].filter(Boolean);

  return {
    action,
    asset,
    confidence,
    thesis: thesisParts.join(' ') || `Structured ${action} proposal based on the supplied trading observation.`,
    proposedEntry: input.entry ?? undefined,
    proposedStop: input.stop ?? undefined,
    proposedTarget: input.target ?? undefined,
    proposedRisk: input.risk ?? undefined,
  };
}
