-- Persist every risk authorization decision for auditability
CREATE TABLE "RiskDecisionLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "agentId" TEXT NOT NULL,
  "mode" "AgentMode" NOT NULL,
  "action" "DecisionAction" NOT NULL,
  "asset" TEXT NOT NULL,
  "protocol" TEXT,
  "confidence" DOUBLE PRECISION,
  "proposedRisk" DOUBLE PRECISION,
  "allowed" BOOLEAN NOT NULL,
  "reasons" TEXT[] NOT NULL,
  "maxRiskPerTrade" DOUBLE PRECISION NOT NULL,
  "maxDailyLoss" DOUBLE PRECISION NOT NULL,
  "riskCapital" DOUBLE PRECISION,
  "dailyLossLimit" DOUBLE PRECISION,
  "realizedDailyLoss" DOUBLE PRECISION NOT NULL,
  "projectedDailyLoss" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RiskDecisionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RiskDecisionLog_agentId_createdAt_idx" ON "RiskDecisionLog"("agentId", "createdAt");
CREATE INDEX "RiskDecisionLog_userId_createdAt_idx" ON "RiskDecisionLog"("userId", "createdAt");
CREATE INDEX "RiskDecisionLog_allowed_createdAt_idx" ON "RiskDecisionLog"("allowed", "createdAt");

ALTER TABLE "RiskDecisionLog"
  ADD CONSTRAINT "RiskDecisionLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RiskDecisionLog"
  ADD CONSTRAINT "RiskDecisionLog_agentId_fkey"
  FOREIGN KEY ("agentId") REFERENCES "TradingAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
