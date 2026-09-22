export type IntelligenceMode = 'OBSERVE' | 'SHADOW' | 'PAPER' | 'AUTONOMOUS' | 'PAUSED';

export type ModePolicy = {
  canObserve: boolean;
  canPropose: boolean;
  canPaperTrade: boolean;
  canExecute: boolean;
};

const POLICIES: Record<IntelligenceMode, ModePolicy> = {
  OBSERVE: {
    canObserve: true,
    canPropose: false,
    canPaperTrade: false,
    canExecute: false,
  },
  SHADOW: {
    canObserve: true,
    canPropose: true,
    canPaperTrade: false,
    canExecute: false,
  },
  PAPER: {
    canObserve: true,
    canPropose: true,
    canPaperTrade: true,
    canExecute: false,
  },
  AUTONOMOUS: {
    canObserve: true,
    canPropose: true,
    canPaperTrade: true,
    canExecute: true,
  },
  PAUSED: {
    canObserve: false,
    canPropose: false,
    canPaperTrade: false,
    canExecute: false,
  },
};

export function getModePolicy(mode: IntelligenceMode): ModePolicy {
  return POLICIES[mode];
}
