export type RiskDecisionInput = {
  mode: "OBSERVE" | "SHADOW" | "PAPER" | "AUTONOMOUS" | "PAUSED";
  enabled: boolean;
  action: "BUY" | "SELL" | "HOLD" | "WAIT" | "REJECT";
  asset: string;
  confidence: number;
  confidenceFloor: number;
  proposedRisk?: number;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  allowedAssets: string[];
  allowedProtocols: string[];
  protocol?: string;
};

export type RiskCheckResult = {
  allowed: boolean;
  reasons: string[];
  limits: {
    maxRiskPerTrade: number;
    maxDailyLoss: number;
  };
};

export function checkDecisionRisk(input: RiskDecisionInput): RiskCheckResult {
  const reasons: string[] = [];
  const asset = input.asset.trim().toUpperCase();

  if (!input.enabled) reasons.push("Agent is disabled.");
  if (input.mode === "PAUSED") reasons.push("Agent is paused.");
  if (input.mode === "OBSERVE") reasons.push("Observe mode cannot authorize a proposed trade.");
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

  return {
    allowed: reasons.length === 0,
    reasons,
    limits: {
      maxRiskPerTrade: input.maxRiskPerTrade,
      maxDailyLoss: input.maxDailyLoss,
    },
  };
}
