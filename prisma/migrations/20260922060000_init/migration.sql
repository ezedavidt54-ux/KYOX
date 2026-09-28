-- CreateEnum
CREATE TYPE "AgentMode" AS ENUM ('OBSERVE', 'SHADOW', 'PAPER', 'AUTONOMOUS', 'PAUSED');

-- CreateEnum
CREATE TYPE "TradeSource" AS ENUM ('MANUAL', 'IMPORTED', 'AGENT');

-- CreateEnum
CREATE TYPE "DecisionAction" AS ENUM ('BUY', 'SELL', 'HOLD', 'WAIT', 'REJECT');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PROPOSED', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthNonce" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthNonce_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TradingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "markets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "timeframes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "biasMethod" TEXT,
    "entryMethod" TEXT,
    "riskRules" JSONB,
    "managementRules" JSONB,
    "invalidationRules" JSONB,
    "newsRules" JSONB,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TradingProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TradingAgent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "AgentMode" NOT NULL DEFAULT 'OBSERVE',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "systemVersion" TEXT NOT NULL DEFAULT 'foundation-1',
    "confidenceFloor" DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    "maxRiskPerTrade" DOUBLE PRECISION NOT NULL DEFAULT 0.005,
    "maxDailyLoss" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "allowedAssets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "allowedProtocols" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "memorySummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TradingAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,
    "source" "TradeSource" NOT NULL,
    "chainId" INTEGER NOT NULL,
    "asset" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION,
    "exitPrice" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "riskAmount" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TradeDecision" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "action" "DecisionAction" NOT NULL,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PROPOSED',
    "asset" TEXT NOT NULL,
    "thesis" TEXT,
    "confidence" DOUBLE PRECISION,
    "proposedEntry" DOUBLE PRECISION,
    "proposedStop" DOUBLE PRECISION,
    "proposedTarget" DOUBLE PRECISION,
    "proposedRisk" DOUBLE PRECISION,
    "marketSnapshot" JSONB,
    "reasoning" JSONB,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "TradeDecision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentObservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "timeframe" TEXT,
    "marketSnapshot" JSONB NOT NULL,
    "detectedSetup" JSONB,
    "expectedAction" "DecisionAction",
    "actualAction" "DecisionAction",
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentObservation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "decisionId" TEXT,
    "rating" INTEGER,
    "correction" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_chainId_key" ON "Wallet"("address", "chainId");
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");
CREATE UNIQUE INDEX "AuthNonce_nonce_key" ON "AuthNonce"("nonce");
CREATE INDEX "AuthNonce_address_chainId_idx" ON "AuthNonce"("address", "chainId");
CREATE INDEX "AuthNonce_expiresAt_idx" ON "AuthNonce"("expiresAt");
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE UNIQUE INDEX "TradingProfile_userId_key" ON "TradingProfile"("userId");
CREATE INDEX "TradingAgent_userId_idx" ON "TradingAgent"("userId");
CREATE INDEX "Trade_userId_createdAt_idx" ON "Trade"("userId", "createdAt");
CREATE INDEX "Trade_agentId_createdAt_idx" ON "Trade"("agentId", "createdAt");
CREATE INDEX "TradeDecision_agentId_decidedAt_idx" ON "TradeDecision"("agentId", "decidedAt");
CREATE INDEX "TradeDecision_userId_decidedAt_idx" ON "TradeDecision"("userId", "decidedAt");
CREATE INDEX "AgentObservation_agentId_observedAt_idx" ON "AgentObservation"("agentId", "observedAt");
CREATE INDEX "AgentFeedback_agentId_createdAt_idx" ON "AgentFeedback"("agentId", "createdAt");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TradingProfile" ADD CONSTRAINT "TradingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TradingAgent" ADD CONSTRAINT "TradingAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "TradingAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TradeDecision" ADD CONSTRAINT "TradeDecision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TradeDecision" ADD CONSTRAINT "TradeDecision_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "TradingAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentObservation" ADD CONSTRAINT "AgentObservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentObservation" ADD CONSTRAINT "AgentObservation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "TradingAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentFeedback" ADD CONSTRAINT "AgentFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentFeedback" ADD CONSTRAINT "AgentFeedback_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "TradingAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
