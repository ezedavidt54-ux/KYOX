'use client';

import { useEffect, useRef } from 'react';

export function BlackHoleHeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const stars = Array.from({ length: 420 }, (_, i) => ({
      seed: i * 1.618,
      radius: 0.2 + Math.random() * 1.4,
      depth: 0.15 + Math.random() * 0.85,
      angle: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frame += 0.005;
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.67;
      const cy = height * 0.5;
      const scale = Math.min(width, height);

      const background = ctx.createRadialGradient(cx, cy, scale * 0.03, cx, cy, scale * 0.62);
      background.addColorStop(0, 'rgba(255,255,255,0.025)');
      background.addColorStop(0.32, 'rgba(60,75,105,0.018)');
      background.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const orbit = scale * (0.22 + star.depth * 0.62);
        const angle = star.angle + frame * (0.08 + star.depth * 0.15);
        const x = cx + Math.cos(angle) * orbit;
        const y = cy + Math.sin(angle) * orbit * 0.62;
        if (x < 0 || x > width || y < 0 || y > height) continue;
        const alpha = 0.08 + star.depth * 0.4;
        ctx.fillStyle = `rgba(210,220,235,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, star.radius * star.depth, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.18 + Math.sin(frame * 0.3) * 0.012);

      const disk = ctx.createRadialGradient(0, 0, scale * 0.065, 0, 0, scale * 0.29);
      disk.addColorStop(0, 'rgba(0,0,0,0.98)');
      disk.addColorStop(0.22, 'rgba(255,255,255,0.035)');
      disk.addColorStop(0.38, 'rgba(226,236,255,0.16)');
      disk.addColorStop(0.5, 'rgba(115,139,190,0.1)');
      disk.addColorStop(0.68, 'rgba(75,95,140,0.055)');
      disk.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = disk;
      ctx.scale(1, 0.25);
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const glow = ctx.createRadialGradient(cx, cy, scale * 0.06, cx, cy, scale * 0.22);
      glow.addColorStop(0, 'rgba(0,0,0,1)');
      glow.addColorStop(0.45, 'rgba(0,0,0,0.98)');
      glow.addColorStop(0.68, 'rgba(0,0,0,0.7)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.22, 0, Math.PI * 2);
      ctx.fill();

      const ring = ctx.createEllipse ? undefined : undefined;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.28);
      ctx.strokeStyle = 'rgba(219,228,245,0.18)';
      ctx.lineWidth = Math.max(1, scale * 0.004);
      ctx.shadowBlur = scale * 0.025;
      ctx.shadowColor = 'rgba(190,205,235,0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.17, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const vignette = ctx.createRadialGradient(width / 2, height / 2, scale * 0.18, width / 2, height / 2, scale * 0.72);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="black-hole-canvas" aria-hidden="true" />;
}
