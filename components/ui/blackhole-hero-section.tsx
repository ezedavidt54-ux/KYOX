'use client';

import { useEffect, useState } from 'react';

const observations = [
  {
    pair: 'BTC / USDC',
    title: 'LIQUIDITY SWEEP DETECTED',
    detail: 'Price reclaimed the prior range low.',
    metric: '92% MATCH',
  },
  {
    pair: 'ETH / USDC',
    title: 'TRADING DNA UPDATED',
    detail: 'Liquidity plus structure remains a preferred setup.',
    metric: '94% MATCH',
  },
  {
    pair: 'RWA / USD',
    title: 'MARKET CONTEXT CAPTURED',
    detail: 'On chain activity aligned with the active watchlist.',
    metric: '88% MATCH',
  },
  {
    pair: 'KYOX / USER',
    title: 'DECISION PATTERN LEARNED',
    detail: 'Risk and execution behaviour added to the profile.',
    metric: '96% MATCH',
  },
];

const stages = ['OBSERVE', 'SHADOW', 'PAPER', 'AUTONOMOUS'];

export function BlackHoleHeroSection() {
  const [activeObservation, setActiveObservation] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveObservation((current) => (current + 1) % observations.length);
      setActiveStage((current) => (current + 1) % stages.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  const observation = observations[activeObservation];

  return (
    <div className="kx-intelligence-hero" aria-label="KYOX intelligence engine animation">
      <div className="kx-intelligence-grid" />
      <div className="kx-intelligence-noise" />

      <div className="kx-intelligence-orbit kx-intelligence-orbit-a" />
      <div className="kx-intelligence-orbit kx-intelligence-orbit-b" />
      <div className="kx-intelligence-orbit kx-intelligence-orbit-c" />

      <div className="kx-signal kx-signal-one"><span>BTC / USDC</span><b>LIQUIDITY</b></div>
      <div className="kx-signal kx-signal-two"><span>ETH / USDC</span><b>STRUCTURE</b></div>
      <div className="kx-signal kx-signal-three"><span>RWA</span><b>FLOW</b></div>
      <div className="kx-signal kx-signal-four"><span>USER</span><b>TRADING DNA</b></div>

      <div className="kx-intelligence-core">
        <div className="kx-core-rings" />
        <div className="kx-core-pulse" />
        <div className="kx-core-mark">KX</div>
        <div className="kx-core-label">INTELLIGENCE CORE</div>
        <div className="kx-core-status"><span /> LEARNING LIVE</div>
      </div>

      <div className="kx-intelligence-card" aria-live="polite">
        <div className="kx-intelligence-card-top">
          <span>{observation.pair}</span>
          <span>{observation.metric}</span>
        </div>
        <strong>{observation.title}</strong>
        <p>{observation.detail}</p>
        <div className="kx-intelligence-card-line"><i /><span>PERSONAL INTELLIGENCE</span></div>
      </div>

      <div className="kx-intelligence-flow">
        {stages.map((stage, index) => (
          <div className={`kx-flow-stage ${activeStage === index ? 'active' : ''}`} key={stage}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{stage}</strong>
          </div>
        ))}
      </div>

      <div className="kx-intelligence-caption">
        <span>MARKET SIGNALS</span>
        <span>→</span>
        <span>TRADING DNA</span>
        <span>→</span>
        <span>DECISION MEMORY</span>
      </div>
    </div>
  );
}
