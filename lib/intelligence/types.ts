export type AgentMode =
  | "OBSERVE"
  | "SHADOW"
  | "PAPER"
  | "AUTONOMOUS"
  | "PAUSED";

export type TradingDNA = {
  markets: string[];
  timeframes: string[];
  biasMethod?: string;
  entryMethod?: string;
  riskRules?: Record<string, unknown>;
  managementRules?: Record<string, unknown>;
  invalidationRules?: Record<string, unknown>;
  newsRules?: Record<string, unknown>;
  notes?: string;
};

export type AgentDecision = {
  action: "BUY" | "SELL" | "HOLD" | "WAIT" | "REJECT";
  asset: string;
  confidence: number;
  thesis?: string;
  proposedEntry?: number;
  proposedStop?: number;
  proposedTarget?: number;
  proposedRisk?: number;
};
