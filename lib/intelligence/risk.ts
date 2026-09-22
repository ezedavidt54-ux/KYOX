import { getModePolicy, type IntelligenceMode, type ModePolicy } from '@/lib/intelligence/mode';

export type RiskDecisionInput = {
  mode: IntelligenceMode;
  enabled: boolean;
  action: "BUY" | "SELL" | "HOLD" | "WAIT" | "REJECT";
  asset: string;
  confidence: number;
  confidenceFloor: number;
  proposedRisk?: number;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  riskCapital?: number | null;
  realizedDailyLoss: number;
  allowedAssets: string[];
  allowedProtocols: string[];
  protocol?: string;
};

export type RiskCheckResult = {
  allowed: boolean;
  reasons: string[];
  mode: ModePolicy;
  limits: {
    maxRiskPerTrade: number;
    maxDailyLoss: number;
    riskCapital: number | null;
    dailyLossLimit: number | null;
    realizedDailyLoss: number;
    projectedDailyLoss: number | null;
  };
};

export function checkDecisionRisk(input: RiskDecisionInput): RiskCheckResult {
  const reasons: string[] = [];
  const asset = input.asset.trim().toUpperCase();
  const isTradeAction = input.action === "BUY" || input.action === "SELL";
  const mode = getModePolicy(input.mode);

  if (!input.enabled) reasons.push("Agent is disabled.");
  if (input.mode === "PAUSED") reasons.push("Agent is paused.");
  if (input.mode === "OBSERVE") reasons.push("Observe mode cannot authorize a proposed trade.");
  if (isTradeAction && !mode.canExecute) reasons.push("Current mode cannot authorize live trade execution.");
  if (input.action === "HOLD" || input.action === "WAIT" || input.action === "REJECT") {
    reasons.push("Decision action does not authorize trade execution.");
  }
  if (!asset) reasons.push("Asset is required.");
  if (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1) {
    reasons.push("Confidence must be between 0 and 1.");
  }
  if (!Number.isFinite(input.confidenceFloor) || input.confidenceFloor < 0 || input.confidenceFloor > 1) {
    reasons.push("confidenceFloor must be between 0 and 1.");
  } else if (Number.isFinite(input.confidence) && input.confidence < input.confidenceFloor) {
    reasons.push("Confidence is below the agent confidence floor.");
  }
  if (!Number.isFinite(input.maxRiskPerTrade) || input.maxRiskPerTrade < 0) {
    reasons.push("maxRiskPerTrade must be a nonnegative ratio.");
  }
  if (input.proposedRisk !== undefined) {
    if (!Number.isFinite(input.proposedRisk) || input.proposedRisk < 0) {
      reasons.push("proposedRisk must be a nonnegative ratio.");
    } else if (input.proposedRisk > input.maxRiskPerTrade) {
      reasons.push("Proposed risk exceeds the agent per trade risk limit.");
    }
  } else if (isTradeAction) {
    reasons.push("proposedRisk is required for a trade authorization check.");
  }
  if (input.allowedAssets.length > 0 && !input.allowedAssets.map((x) => x.toUpperCase()).includes(asset)) {
    reasons.push("Asset is not in the agent allowlist.");
  }
  if (input.protocol && input.allowedProtocols.length > 0 && !input.allowedProtocols.includes(input.protocol)) {
    reasons.push("Protocol is not in the agent allowlist.");
  }
  if (!Number.isFinite(input.maxDailyLoss) || input.maxDailyLoss < 0) {
    reasons.push("maxDailyLoss must be a nonnegative ratio.");
  }

  const hasValidRiskCapital =
    input.riskCapital !== null &&
    input.riskCapital !== undefined &&
    Number.isFinite(input.riskCapital) &&
    input.riskCapital > 0;

  const dailyLossLimit = hasValidRiskCapital
    ? (input.riskCapital as number) * input.maxDailyLoss
    : null;

  if (input.maxDailyLoss > 0 && !hasValidRiskCapital) {
    reasons.push("Risk capital must be configured before enforcing a percentage daily loss limit.");
  }

  if (!Number.isFinite(input.realizedDailyLoss) || input.realizedDailyLoss < 0) {
    reasons.push("realizedDailyLoss must be a nonnegative amount.");
  }

  const proposedLoss =
    input.proposedRisk !== undefined && hasValidRiskCapital
      ? input.proposedRisk * (input.riskCapital as number)
      : 0;
  const projectedDailyLoss = dailyLossLimit === null
    ? null
    : input.realizedDailyLoss + proposedLoss;

  if (dailyLossLimit !== null && input.realizedDailyLoss >= dailyLossLimit) {
    reasons.push("Daily loss limit has already been reached.");
  } else if (dailyLossLimit !== null && projectedDailyLoss !== null && projectedDailyLoss > dailyLossLimit) {
    reasons.push("This trade would exceed the agent daily loss limit.");
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    mode,
    limits: {
      maxRiskPerTrade: input.maxRiskPerTrade,
      maxDailyLoss: input.maxDailyLoss,
      riskCapital: hasValidRiskCapital ? (input.riskCapital as number) : null,
      dailyLossLimit,
      realizedDailyLoss: input.realizedDailyLoss,
      projectedDailyLoss,
    },
  };
}
