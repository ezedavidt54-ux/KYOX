-- Link an observed decision to its eventual trade outcome
ALTER TABLE "Trade" ADD COLUMN "decisionId" TEXT;
CREATE UNIQUE INDEX "Trade_decisionId_key" ON "Trade"("decisionId");
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "TradeDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
