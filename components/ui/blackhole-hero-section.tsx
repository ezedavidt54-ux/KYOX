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
    const stars = Array.from({ length: 560 }, () => ({
      radius: 0.25 + Math.random() * 1.5,
      depth: 0.15 + Math.random() * 0.85,
      angle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
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
      frame += 0.008;
      ctx.clearRect(0, 0, width, height);
      const cx = width * (width < 700 ? 0.67 : 0.69);
      const cy = height * 0.47;
      const scale = Math.min(width, height);

      const aura = ctx.createRadialGradient(cx, cy, scale * .03, cx, cy, scale * .6);
      aura.addColorStop(0, 'rgba(135,196,255,.11)');
      aura.addColorStop(.25, 'rgba(96,123,255,.07)');
      aura.addColorStop(.55, 'rgba(93,72,185,.035)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const orbit = scale * (.22 + star.depth * .7);
        const angle = star.angle + frame * (.06 + star.depth * .22);
        const x = cx + Math.cos(angle) * orbit;
        const y = cy + Math.sin(angle) * orbit * .58;
        if (x < 0 || x > width || y < 0 || y > height) continue;
        const twinkle = .55 + .45 * Math.sin(frame * 2 + star.phase);
        const alpha = (.08 + star.depth * .42) * twinkle;
        ctx.fillStyle = `rgba(195,222,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, star.radius * star.depth, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-.16 + frame * .035);
      const disk = ctx.createRadialGradient(0, 0, scale * .045, 0, 0, scale * .38);
      disk.addColorStop(0, 'rgba(0,0,0,1)');
      disk.addColorStop(.16, 'rgba(246,249,255,.22)');
      disk.addColorStop(.29, 'rgba(108,211,255,.38)');
      disk.addColorStop(.42, 'rgba(151,113,255,.22)');
      disk.addColorStop(.56, 'rgba(74,150,255,.13)');
      disk.addColorStop(.74, 'rgba(75,83,164,.06)');
      disk.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = disk;
      ctx.scale(1, .23);
      ctx.beginPath();
      ctx.arc(0, 0, scale * .4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const ring = ctx.createRadialGradient(cx, cy, scale * .09, cx, cy, scale * .25);
      ring.addColorStop(0, 'rgba(0,0,0,1)');
      ring.addColorStop(.46, 'rgba(0,0,0,.99)');
      ring.addColorStop(.6, 'rgba(9,14,22,.8)');
      ring.addColorStop(.7, 'rgba(119,193,255,.18)');
      ring.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * .25, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frame * .03);
      ctx.scale(1, .27);
      ctx.strokeStyle = 'rgba(182,222,255,.38)';
      ctx.lineWidth = Math.max(1.2, scale * .004);
      ctx.shadowBlur = scale * .04;
      ctx.shadowColor = 'rgba(95,188,255,.85)';
      ctx.beginPath();
      ctx.arc(0, 0, scale * .19, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const lens = ctx.createRadialGradient(cx, cy, scale * .22, cx, cy, scale * .42);
      lens.addColorStop(0, 'rgba(75,146,255,.07)');
      lens.addColorStop(.42, 'rgba(139,102,255,.025)');
      lens.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lens;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * .42, 0, Math.PI * 2);
      ctx.fill();

      const vignette = ctx.createRadialGradient(width / 2, height / 2, scale * .2, width / 2, height / 2, scale * .78);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(2,5,9,.55)');
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
