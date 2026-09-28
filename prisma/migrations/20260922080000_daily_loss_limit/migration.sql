-- Add deterministic daily loss enforcement inputs
ALTER TABLE "TradingAgent" ADD COLUMN "riskCapital" DOUBLE PRECISION;

CREATE INDEX "Trade_agentId_closedAt_idx" ON "Trade"("agentId", "closedAt");
