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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars = Array.from({ length: 720 }, () => ({
      radius: 0.2 + Math.random() * 1.65,
      depth: 0.12 + Math.random() * 0.88,
      angle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.7,
    }));
    const sparks = Array.from({ length: 34 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.23 + Math.random() * 0.26,
      speed: 0.15 + Math.random() * 0.45,
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
      frame += reducedMotion ? 0.0015 : 0.008;
      ctx.clearRect(0, 0, width, height);
      const cx = width * (width < 700 ? 0.67 : 0.69);
      const cy = height * 0.47;
      const scale = Math.min(width, height);

      const aura = ctx.createRadialGradient(cx, cy, scale * .03, cx, cy, scale * .68);
      aura.addColorStop(0, 'rgba(150,216,255,.15)');
      aura.addColorStop(.2, 'rgba(91,157,255,.095)');
      aura.addColorStop(.45, 'rgba(118,82,255,.05)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const orbit = scale * (.18 + star.depth * .78);
        const angle = star.angle + frame * (.04 + star.depth * .28) + Math.sin(frame * .7 + star.drift) * .008;
        const x = cx + Math.cos(angle) * orbit;
        const y = cy + Math.sin(angle) * orbit * .58;
        if (x < -10 || x > width + 10 || y < -10 || y > height + 10) continue;
        const twinkle = .5 + .5 * Math.sin(frame * 2.4 + star.phase);
        const alpha = (.07 + star.depth * .48) * twinkle;
        ctx.fillStyle = `rgba(205,229,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, star.radius * (.45 + star.depth), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-.16 + frame * .055);
      const disk = ctx.createRadialGradient(0, 0, scale * .035, 0, 0, scale * .42);
      disk.addColorStop(0, 'rgba(0,0,0,1)');
      disk.addColorStop(.14, 'rgba(255,255,255,.28)');
      disk.addColorStop(.25, 'rgba(100,218,255,.48)');
      disk.addColorStop(.38, 'rgba(154,109,255,.3)');
      disk.addColorStop(.53, 'rgba(67,154,255,.16)');
      disk.addColorStop(.72, 'rgba(77,84,174,.07)');
      disk.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = disk;
      ctx.scale(1, .22);
      ctx.beginPath();
      ctx.arc(0, 0, scale * .43, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      for (const spark of sparks) {
        const angle = spark.angle + frame * spark.speed;
        const radius = scale * (spark.radius + Math.sin(frame * 1.7 + spark.phase) * .012);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * .24;
        const length = scale * (.012 + .025 * Math.sin(spark.phase) ** 2);
        ctx.strokeStyle = `rgba(167,222,255,${.08 + .18 * Math.abs(Math.sin(frame + spark.phase))})`;
        ctx.lineWidth = Math.max(.6, scale * .0015);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(angle) * length, y - Math.sin(angle) * length * .24);
        ctx.stroke();
      }
      ctx.restore();

      const ring = ctx.createRadialGradient(cx, cy, scale * .085, cx, cy, scale * .27);
      ring.addColorStop(0, 'rgba(0,0,0,1)');
      ring.addColorStop(.45, 'rgba(0,0,0,.995)');
      ring.addColorStop(.58, 'rgba(7,12,20,.9)');
      ring.addColorStop(.67, 'rgba(118,202,255,.22)');
      ring.addColorStop(.8, 'rgba(141,102,255,.08)');
      ring.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * .27, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frame * .045);
      ctx.scale(1, .27);
      ctx.strokeStyle = 'rgba(193,229,255,.48)';
      ctx.lineWidth = Math.max(1.1, scale * .004);
      ctx.shadowBlur = scale * .05;
      ctx.shadowColor = 'rgba(95,188,255,.95)';
      ctx.beginPath();
      ctx.arc(0, 0, scale * .2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const flare = .5 + .5 * Math.sin(frame * .9);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frame * .12);
      ctx.strokeStyle = `rgba(207,235,255,${.035 + flare * .045})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, scale * (.33 + flare * .025), scale * (.105 + flare * .015), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const lens = ctx.createRadialGradient(cx, cy, scale * .21, cx, cy, scale * .48);
      lens.addColorStop(0, 'rgba(75,146,255,.09)');
      lens.addColorStop(.42, 'rgba(139,102,255,.035)');
      lens.addColorStop(.72, 'rgba(80,183,255,.018)');
      lens.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lens;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * .48, 0, Math.PI * 2);
      ctx.fill();

      const vignette = ctx.createRadialGradient(width / 2, height / 2, scale * .18, width / 2, height / 2, scale * .82);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(2,5,9,.5)');
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
