import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useLocale } from '../i18n';
import type { LogoCandidateItem } from '../types/brand';

export interface IntroSplashProps {
  isOpen: boolean;
  onDismiss: () => void;
  selectedCandidate?: LogoCandidateItem | null;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  hue: string;
  life: number;
  maxLife: number;
}

const DIAL_TICKS = Array.from({ length: 60 }, (_, i) => i);
const SLICE_REPEAT_INDICES = [0, 1, 2, 3, 4] as const;
const SLICE_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export function IntroSplash({
  isOpen,
  onDismiss,
  selectedCandidate,
}: IntroSplashProps): React.ReactElement | null {
  const { locale, t } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 4200);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [isOpen, onDismiss]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let rafId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const palette = ['#D49B54', '#C84B27', '#F3ECE0', '#E06440'];
    const spawnParticle = (startBottom: boolean): EmberParticle => {
      const cx = width * 0.5;
      const cy = height * 0.44;
      const spreadX = Math.min(width * 0.45, 260);
      return {
        x: cx + (Math.random() - 0.5) * spreadX * 2,
        y: startBottom
          ? cy + 40 + Math.random() * 170
          : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -(0.55 + Math.random() * 1.45),
        radius: 1 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.65,
        hue: palette[Math.floor(Math.random() * palette.length)],
        life: 0,
        maxLife: 90 + Math.random() * 130,
      };
    };

    const particles: EmberParticle[] = Array.from({ length: 44 }, () =>
      spawnParticle(false)
    );

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / Math.max(1, width) - 0.5) * 24;
      pointerRef.current.y = (e.clientY / Math.max(1, height) - 0.5) * 24;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const spotX = width * 0.5 + pointerRef.current.x * 0.6;
      const spotY = height * 0.4 + pointerRef.current.y * 0.6;
      const grad = ctx.createRadialGradient(spotX, spotY, 12, spotX, spotY, 310);
      grad.addColorStop(0, 'rgba(212, 155, 84, 0.16)');
      grad.addColorStop(0.55, 'rgba(200, 75, 39, 0.08)');
      grad.addColorStop(1, 'rgba(11, 10, 9, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.life += 1;
        p.x +=
          p.vx +
          Math.sin(p.life * 0.04 + i) * 0.22 +
          pointerRef.current.x * 0.015;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        const fade =
          progress < 0.2
            ? progress / 0.2
            : Math.max(0, 1 - (progress - 0.2) / 0.8);

        if (p.life >= p.maxLife || p.y < -20) {
          particles[i] = spawnParticle(true);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = p.alpha * fade;
        ctx.fill();
      }
      ctx.restore();

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="intro-splash"
      data-splash="true"
      role="region"
      aria-label={t.introSplash.ariaLabel}
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0B0A09]/96 px-5 py-6 text-center text-[#F3ECE0] backdrop-blur-2xl cursor-pointer select-none"
    >
      {/* 60 FPS Ember Sparks Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center space-y-4 sm:space-y-5">
        {/* Dual Counter-Rotating Rings + Central Rotating Döner */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 360 360"
            className="h-56 w-56 sm:h-72 sm:w-72 overflow-visible drop-shadow-[0_0_40px_rgba(212,155,84,0.2)]"
            role="img"
            aria-label="DCC Kinetic Döner Rotisserie Emblem"
          >
            <defs>
              <path
                id="dcc-outer-ring-text-path"
                d="M 180,180 m -140,0 a 140,140 0 1,1 280,0 a 140,140 0 1,1 -280,0"
              />

              <clipPath id="dcc-spit-silhouette">
                <path d="M 141,106 Q 180,92 219,106 L 214,158 L 204,220 Q 180,250 156,220 L 146,158 Z" />
              </clipPath>

              <radialGradient id="dcc-ember-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C84B27" stopOpacity="0.46" />
                <stop offset="48%" stopColor="#D49B54" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0B0A09" stopOpacity="0" />
              </radialGradient>

              <linearGradient
                id="dcc-brass-rod"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#8F6327" />
                <stop offset="42%" stopColor="#F3ECE0" />
                <stop offset="72%" stopColor="#D49B54" />
                <stop offset="100%" stopColor="#6D4817" />
              </linearGradient>

              <linearGradient
                id="dcc-spit-cylinder"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#1B0A05" stopOpacity="0.82" />
                <stop offset="28%" stopColor="#D49B54" stopOpacity="0.16" />
                <stop offset="52%" stopColor="#F3ECE0" stopOpacity="0.26" />
                <stop offset="78%" stopColor="#8C3616" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#140704" stopOpacity="0.88" />
              </linearGradient>

              <linearGradient
                id="dcc-yaprak-base"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6E2E14" />
                <stop offset="45%" stopColor="#A64B21" />
                <stop offset="85%" stopColor="#5C220F" />
                <stop offset="100%" stopColor="#351108" />
              </linearGradient>

              <linearGradient
                id="dcc-blade-grad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#F3ECE0" stopOpacity="0" />
                <stop offset="50%" stopColor="#F3ECE0" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#D49B54" stopOpacity="0" />
              </linearGradient>
            </defs>

            <circle
              cx="180"
              cy="176"
              r="116"
              fill="url(#dcc-ember-halo)"
              className="dcc-anim-ember-breathe"
            />

            {/* OUTER RING — Rotates Clockwise */}
            <g className="dcc-anim-orbit-cw">
              <circle
                cx="180"
                cy="180"
                r="160"
                fill="none"
                stroke="#D49B54"
                strokeOpacity="0.24"
                strokeWidth="1"
              />
              <circle
                cx="180"
                cy="180"
                r="160"
                fill="none"
                stroke="#D49B54"
                strokeWidth="2"
                strokeDasharray="110 140 55 190"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />
              <circle
                cx="180"
                cy="180"
                r="152"
                fill="none"
                stroke="#C8BFB0"
                strokeWidth="1.2"
                strokeDasharray="42 210 30 220"
                strokeLinecap="round"
                strokeOpacity="0.45"
              />

              {DIAL_TICKS.map((tick) => {
                const angle = (tick * 6 * Math.PI) / 180;
                const isMajor = tick % 5 === 0;
                const rInner = isMajor ? 148 : 152;
                const rOuter = 156;
                const x1 = 180 + Math.cos(angle) * rInner;
                const y1 = 180 + Math.sin(angle) * rInner;
                const x2 = 180 + Math.cos(angle) * rOuter;
                const y2 = 180 + Math.sin(angle) * rOuter;
                return (
                  <line
                    key={tick}
                    x1={x1.toFixed(2)}
                    y1={y1.toFixed(2)}
                    x2={x2.toFixed(2)}
                    y2={y2.toFixed(2)}
                    stroke={isMajor ? '#D49B54' : '#9A9082'}
                    strokeOpacity={isMajor ? 0.85 : 0.35}
                    strokeWidth={isMajor ? 1.6 : 0.8}
                  />
                );
              })}

              <text
                fill="#E5B06B"
                fontSize="10.2"
                fontWeight="600"
                letterSpacing="3.3px"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <textPath href="#dcc-outer-ring-text-path" startOffset="0%">
                  • DCC DÖNER CATERING CLUB • BERLIN • EMBER-CUT HOSPITALITY • EST. 2026
                </textPath>
              </text>
            </g>

            {/* INNER RING — Rotates Counter-Clockwise */}
            <g className="dcc-anim-orbit-ccw">
              <circle
                cx="180"
                cy="180"
                r="112"
                fill="none"
                stroke="#9A9082"
                strokeOpacity="0.22"
                strokeWidth="1"
              />
              <circle
                cx="180"
                cy="180"
                r="112"
                fill="none"
                stroke="#E06440"
                strokeWidth="2.2"
                strokeDasharray="72 60 18 60"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />
              <circle
                cx="180"
                cy="180"
                r="102"
                fill="none"
                stroke="#D49B54"
                strokeWidth="1.2"
                strokeDasharray="48 90 22 75"
                strokeLinecap="round"
                strokeOpacity="0.55"
              />

              <circle cx="180" cy="68" r="3.4" fill="#D49B54" />
              <circle cx="292" cy="180" r="3" fill="#F3ECE0" />
              <circle cx="180" cy="292" r="3.4" fill="#E06440" />
              <circle cx="68" cy="180" r="3" fill="#D49B54" />
            </g>

            {/* CENTRAL ROTATING DÖNER */}
            <g>
              <rect
                x="177.5"
                y="72"
                width="5"
                height="208"
                rx="2.5"
                fill="url(#dcc-brass-rod)"
              />
              <path
                d="M 166,86 L 172,73 L 180,79 L 188,73 L 194,86 Z"
                fill="url(#dcc-brass-rod)"
              />
              <rect
                x="164"
                y="93"
                width="32"
                height="5"
                rx="2.5"
                fill="url(#dcc-brass-rod)"
              />

              <g clipPath="url(#dcc-spit-silhouette)">
                <rect
                  x="130"
                  y="90"
                  width="100"
                  height="165"
                  fill="url(#dcc-yaprak-base)"
                />

                <g className="dcc-anim-spit-layers">
                  {SLICE_REPEAT_INDICES.map((rep) => {
                    const baseX = 110 + rep * 80;
                    return (
                      <g key={rep}>
                        {SLICE_ROWS.map((row) => {
                          const y = 96 + row * 17;
                          const isLight = row % 2 === 0;
                          return (
                            <path
                              key={row}
                              d={`M ${baseX},${y + 3} Q ${baseX + 40},${y + 13} ${baseX + 80},${y + 3} L ${baseX + 80},${y + 11} Q ${baseX + 40},${y + 21} ${baseX},${y + 11} Z`}
                              fill={isLight ? '#D48A45' : '#3E160A'}
                              fillOpacity={isLight ? 0.58 : 0.72}
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </g>

                <path
                  d="M 142,115 Q 180,124 218,113 M 144,132 Q 180,141 216,130 M 147,150 Q 180,159 213,148 M 150,168 Q 180,177 210,166 M 153,186 Q 180,195 207,184 M 156,204 Q 180,213 204,202"
                  fill="none"
                  stroke="#F3ECE0"
                  strokeOpacity="0.28"
                  strokeWidth="1.1"
                />

                <rect
                  x="136"
                  y="90"
                  width="88"
                  height="165"
                  fill="url(#dcc-spit-cylinder)"
                />

                <g className="dcc-anim-blade-glint">
                  <path
                    d="M 192,126 L 214,198 L 207,202 L 188,128 Z"
                    fill="url(#dcc-blade-grad)"
                  />
                </g>
              </g>

              <path
                d="M 141,106 Q 180,92 219,106 L 214,158 L 204,220 Q 180,250 156,220 L 146,158 Z"
                fill="none"
                stroke="#D49B54"
                strokeOpacity="0.65"
                strokeWidth="1.2"
              />

              <ellipse
                cx="180"
                cy="259"
                rx="38"
                ry="6"
                fill="#1D1A16"
                stroke="url(#dcc-brass-rod)"
                strokeWidth="1.6"
              />
              <path
                d="M 155,258 Q 168,252 180,256 Q 192,251 205,258 Q 180,263 155,258 Z"
                fill="#C86F32"
                fillOpacity="0.85"
              />
              <ellipse
                cx="180"
                cy="279"
                rx="14"
                ry="3"
                fill="url(#dcc-brass-rod)"
                fillOpacity="0.8"
              />
            </g>
          </svg>
        </div>

        {selectedCandidate && (
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D49B54]/40 bg-[#141210]/90 px-3.5 py-1.5 backdrop-blur-md">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-7 w-12 rounded-md object-cover border border-white/15"
            />
            <span className="font-mono text-[11px] text-[#E5B06B]">
              #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
          </div>
        )}

        <div className="space-y-2.5">
          <p className="dcc-anim-reveal-1 inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#D49B54]">
            <Sparkles className="h-3.5 w-3.5 text-[#E06440]" />
            <span>{t.introSplash.eyebrow}</span>
          </p>

          <h2 className="dcc-anim-reveal-2 font-monument text-3xl sm:text-5xl font-bold tracking-tight text-[#F3ECE0]">
            {t.introSplash.title}
          </h2>

          <p className="dcc-anim-reveal-3 mx-auto max-w-lg font-serif italic text-base sm:text-xl text-[#C8BFB0]">
            {t.introSplash.subtitle}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3 pt-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="dcc-anim-progress h-full w-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #D49B54 0%, #E06440 60%, #F3ECE0 100%)',
              }}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#D49B54] px-7 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest text-[#0B0A09] shadow-lg transition hover:bg-[#E5B06B] cursor-pointer"
            >
              {t.introSplash.skipButton}
            </button>
            <span className="font-mono text-[11px] text-[#9A9082]">
              {t.introSplash.skipHint}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
