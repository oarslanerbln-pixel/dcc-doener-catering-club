import React, { useEffect, useRef } from 'react';

export interface Hero3DCanvasProps {
  mouseX: number;
  mouseY: number;
}

interface DepthParticle {
  x: number;
  y: number;
  z: number;
  vy: number;
  size: number;
  isEmerald: boolean;
}

export function Hero3DCanvas({
  mouseX,
  mouseY,
}: Hero3DCanvasProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: mouseX, y: mouseY });

  useEffect(() => {
    mouseRef.current = { x: mouseX, y: mouseY };
  }, [mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const particles: DepthParticle[] = Array.from({ length: 48 }, (_, i) => ({
      x: (((i * 73) % 100) / 100 - 0.5) * 900,
      y: (((i * 41) % 100) / 100 - 0.5) * 520,
      z: ((i * 29) % 240) - 120,
      vy: 0.22 + ((i % 5) * 0.08),
      size: 1.2 + (i % 3) * 0.75,
      isEmerald: i % 2 === 0,
    }));

    let width = 0;
    let height = 0;
    let rafId = 0;
    let time = 0;
    let inView = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const project = (x: number, y: number, z: number) => {
      const fov = 520;
      const scale = fov / (fov + z + 260);
      return {
        sx: width / 2 + x * scale,
        sy: height * 0.44 + y * scale,
        scale,
      };
    };

    const drawRing = (
      radius: number,
      rx: number,
      ry: number,
      stroke: string,
      lineWidth: number
    ) => {
      const segments = 72;
      ctx.beginPath();
      for (let i = 0; i <= segments; i += 1) {
        const theta = (i / segments) * Math.PI * 2;
        const px = Math.cos(theta) * radius;
        const py = Math.sin(theta) * radius;
        const pz = 0;

        // Rotate around X then Y
        const y1 = py * Math.cos(rx) - pz * Math.sin(rx);
        const z1 = py * Math.sin(rx) + pz * Math.cos(rx);
        const x2 = px * Math.cos(ry) + z1 * Math.sin(ry);
        const z2 = -px * Math.sin(ry) + z1 * Math.cos(ry);

        const { sx, sy } = project(x2, y1, z2);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x * 0.28;
      const my = mouseRef.current.y * 0.22;

      const baseR = Math.min(width * 0.34, 340);
      drawRing(
        baseR,
        0.92 + Math.sin(time * 0.4) * 0.12 + my,
        time * 0.22 + mx,
        'rgba(212, 168, 83, 0.24)',
        1.25
      );
      drawRing(
        baseR * 0.82,
        1.18 + Math.cos(time * 0.35) * 0.14 - my,
        -time * 0.18 + mx * 1.1,
        'rgba(43, 196, 138, 0.22)',
        1.15
      );
      drawRing(
        baseR * 1.14,
        0.78 + my * 0.6,
        time * 0.11 - mx * 0.8,
        'rgba(255, 255, 255, 0.08)',
        0.8
      );

      for (const p of particles) {
        if (!reducedMotion) {
          p.y -= p.vy;
          if (p.y < -280) p.y = 280;
        }
        const px = p.x + mouseRef.current.x * (p.z * 0.15);
        const py = p.y + mouseRef.current.y * (p.z * 0.12);
        const { sx, sy, scale } = project(px, py, p.z);
        const alpha = Math.max(0.08, Math.min(0.65, scale * 0.65));

        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.8, p.size * scale), 0, Math.PI * 2);
        ctx.fillStyle = p.isEmerald
          ? `rgba(43, 196, 138, ${alpha})`
          : `rgba(212, 168, 83, ${alpha})`;
        ctx.fill();
      }
    };

    if (reducedMotion) {
      renderFrame();
    } else {
      const loop = () => {
        if (!inView) {
          rafId = 0;
          return;
        }
        time += 0.014;
        renderFrame();
        rafId = window.requestAnimationFrame(loop);
      };
      rafId = window.requestAnimationFrame(loop);

      const io =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(
              (entries) => {
                inView = entries[0]?.isIntersecting ?? true;
                if (inView && !rafId) {
                  rafId = window.requestAnimationFrame(loop);
                }
              },
              { threshold: 0.01 }
            )
          : null;
      io?.observe(canvas);

      return () => {
        io?.disconnect();
        window.removeEventListener('resize', resize);
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
