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

    const palette = ['#E5A952', '#F06A43', '#F5E2B8', '#34D399'];
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

    const particles: EmberParticle[] = Array.from({ length: 48 }, () =>
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

      // Subtle atmospheric ember spotlight centered behind the rotating spit
      const spotX = width * 0.5 + pointerRef.current.x * 0.6;
      const spotY = height * 0.4 + pointerRef.current.y * 0.6;
      const grad = ctx.createRadialGradient(spotX, spotY, 12, spotX, spotY, 310);
      grad.addColorStop(0, 'rgba(229, 169, 82, 0.14)');
      grad.addColorStop(0.55, 'rgba(240, 106, 67, 0.06)');
      grad.addColorStop(1, 'rgba(9, 10, 15, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.life += 1;
        p.x += p.vx + Math.sin(p.life * 0.04 + i) * 0.22 + pointerRef.current.x * 0.015;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        const fade = progress < 0.2 ? progress / 0.2 : Math.max(0, 1 - (progress - 0.2) / 0.8);

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#07080D]/96 px-5 py-6 text-center text-[#F5F5F7] backdrop-blur-2xl cursor-pointer select-none"
    >
      {/* 60 FPS Ember Sparks Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center space-y-4 sm:space-y-5">
        {/* Dual Counter-Rotating Rings + Central Rotating Döner Spieß */}
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 360 360"
            className="h-56 w-56 sm:h-72 sm:w-72 overflow-visible drop-shadow-[0_0_45px_rgba(229,169,82,0.22)]"
            role="img"
            aria-label="DCC Kinetic Döner Rotisserie Emblem"
          >
            <defs>
              {/* Circular text path for outer clockwise ring */}
              <path
                id="dcc-outer-ring-text-path"
                d="M 180,180 m -140,0 a 140,140 0 1,1 280,0 a 140,140 0 1,1 -280,0"
              />

              {/* Spit Tapered Silhouette Clip */}
              <clipPath id="dcc-spit-silhouette">
                <path d="M 141,106 Q 180,92 219,106 L 214,158 L 204,220 Q 180,250 156,220 L 146,158 Z" />
              </clipPath>

              {/* Warm Ember Radial Halo */}
              <radialGradient id="dcc-ember-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F06A43" stopOpacity="0.48" />
                <stop offset="48%" stopColor="#E5A952" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#07080D" stopOpacity="0" />
              </radialGradient>

              {/* Brushed Brass & Titanium Skewer Gradient */}
              <linearGradient id="dcc-brass-rod" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8F6327" />
                <stop offset="42%" stopColor="#F7E4BA" />
                <stop offset="72%" stopColor="#D49B54" />
                <stop offset="100%" stopColor="#6D4817" />
              </linearGradient>

              {/* Cylindrical 3D Spit Shading */}
              <linearGradient id="dcc-spit-cylinder" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1B0A05" stopOpacity="0.82" />
                <stop offset="28%" stopColor="#F5B567" stopOpacity="0.16" />
                <stop offset="52%" stopColor="#FFF0CF" stopOpacity="0.28" />
                <stop offset="78%" stopColor="#8C3616" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#140704" stopOpacity="0.88" />
              </linearGradient>

              {/* Rich Roasted Yaprak Base */}
              <linearGradient id="dcc-yaprak-base" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6E2E14" />
                <stop offset="45%" stopColor="#A64B21" />
                <stop offset="85%" stopColor="#5C220F" />
                <stop offset="100%" stopColor="#351108" />
              </linearGradient>

              {/* Carving Blade Shimmer */}
              <linearGradient id="dcc-blade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFF2D6" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#E5A952" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Pulsating Ember Core Aura */}
            <circle
              cx="180"
              cy="176"
              r="116"
              fill="url(#dcc-ember-halo)"
              className="dcc-anim-ember-breathe"
            />

            {/* OUTER RING — Rotates Clockwise (CW) */}
            <g className="dcc-anim-orbit-cw">
              <circle
                cx="180"
                cy="180"
                r="160"
                fill="none"
                stroke="#E5A952"
                strokeOpacity="0.24"
                strokeWidth="1"
              />
              <circle
                cx="180"
                cy="180"
                r="160"
                fill="none"
                stroke="#E5A952"
                strokeWidth="2.2"
                strokeDasharray="110 140 55 190"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />
              <circle
                cx="180"
                cy="180"
                r="152"
                fill="none"
                stroke="#34D399"
                strokeWidth="1.5"
                strokeDasharray="42 210 30 220"
                strokeLinecap="round"
                strokeOpacity="0.7"
              />

              {/* Precision 60-Tick Outer Telemetry Dial */}
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
                    stroke={isMajor ? '#E5A952' : '#94A3B8'}
                    strokeOpacity={isMajor ? 0.85 : 0.35}
                    strokeWidth={isMajor ? 1.6 : 0.8}
                  />
                );
              })}

              {/* Curved Typography Ring */}
              <text
                fill="#F2BC6E"
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

            {/* INNER RING — Rotates Counter-Clockwise (CCW) */}
            <g className="dcc-anim-orbit-ccw">
              <circle
                cx="180"
                cy="180"
                r="112"
                fill="none"
                stroke="#94A3B8"
                strokeOpacity="0.22"
                strokeWidth="1"
              />
              <circle
                cx="180"
                cy="180"
                r="112"
                fill="none"
                stroke="#F06A43"
                strokeWidth="2.5"
                strokeDasharray="72 60 18 60"
                strokeLinecap="round"
                strokeOpacity="0.88"
              />
              <circle
                cx="180"
                cy="180"
                r="102"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.4"
                strokeDasharray="48 90 22 75"
                strokeLinecap="round"
                strokeOpacity="0.65"
              />

              {/* Counter-Rotating Orbital Beacons */}
              <circle cx="180" cy="68" r="3.6" fill="#E5A952" />
              <circle cx="292" cy="180" r="3.2" fill="#34D399" />
              <circle cx="180" cy="292" r="3.6" fill="#F06A43" />
              <circle cx="68" cy="180" r="3.2" fill="#38BDF8" />
            </g>

            {/* CENTRAL ROTATING DÖNER SPIESS */}
            <g>
              {/* Back Skewer Rod & Crown Finial */}
              <rect
                x="177.5"
                y="72"
                width="5"
                height="208"
                rx="2.5"
                fill="url(#dcc-brass-rod)"
              />
              {/* Crown Cap */}
              <path
                d="M 166,86 L 172,73 L 180,79 L 188,73 L 194,86 Z"
                fill="url(#dcc-brass-rod)"
              />
              {/* Top Skewer Collar */}
              <rect
                x="164"
                y="93"
                width="32"
                height="5"
                rx="2.5"
                fill="url(#dcc-brass-rod)"
              />

              {/* Tapered Yaprak Meat Cone with Scrolling Curved Rotating Slices */}
              <g clipPath="url(#dcc-spit-silhouette)">
                <rect
                  x="130"
                  y="90"
                  width="100"
                  height="165"
                  fill="url(#dcc-yaprak-base)"
                />

                {/* Seamlessly Scrolling Horizontal Slice Tile (-80px loop) */}
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

                {/* Crisp Vertical Layer Edge Cuts */}
                <path
                  d="M 142,115 Q 180,124 218,113 M 144,132 Q 180,141 216,130 M 147,150 Q 180,159 213,148 M 150,168 Q 180,177 210,166 M 153,186 Q 180,195 207,184 M 156,204 Q 180,213 204,202"
                  fill="none"
                  stroke="#F7D399"
                  strokeOpacity="0.28"
                  strokeWidth="1.1"
                />

                {/* 3D Cylindrical Shading & Grill Specular Highlight */}
                <rect
                  x="136"
                  y="90"
                  width="88"
                  height="165"
                  fill="url(#dcc-spit-cylinder)"
                />

                {/* Animated Carving Blade Glint */}
                <g className="dcc-anim-blade-glint">
                  <path
                    d="M 192,126 L 214,198 L 207,202 L 188,128 Z"
                    fill="url(#dcc-blade-grad)"
                  />
                </g>
              </g>

              {/* Outer Crisp Metallic Spit Contour */}
              <path
                d="M 141,106 Q 180,92 219,106 L 214,158 L 204,220 Q 180,250 156,220 L 146,158 Z"
                fill="none"
                stroke="#E5A952"
                strokeOpacity="0.65"
                strokeWidth="1.2"
              />

              {/* Bottom Stainless/Brass Drip Tray (Tepsi) & Carved Shavings */}
              <ellipse
                cx="180"
                cy="259"
                rx="38"
                ry="6"
                fill="#221912"
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

        {/* Selected Partner Candidate Badge (when testing a logo from LogoStudio) */}
        {selectedCandidate && (
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E5A952]/40 bg-[#12141C]/90 px-3.5 py-1.5 backdrop-blur-md">
            <img
              src={selectedCandidate.image}
              alt={selectedCandidate.titles[locale]}
              className="h-7 w-12 rounded-md object-cover border border-white/15"
            />
            <span className="font-mono text-[11px] text-[#F2BC6E]">
              #{selectedCandidate.number} · {selectedCandidate.titles[locale]}
            </span>
          </div>
        )}

        {/* Kinetic Typography Stack */}
        <div className="space-y-2.5">
          <p className="dcc-anim-reveal-1 inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#E5A952]">
            <Sparkles className="h-3.5 w-3.5 text-[#34D399]" />
            <span>{t.introSplash.eyebrow}</span>
          </p>

          <h2 className="dcc-anim-reveal-2 font-monument text-3xl sm:text-5xl font-bold tracking-tight text-[#F5F5F7]">
            {t.introSplash.title}
          </h2>

          <p className="dcc-anim-reveal-3 mx-auto max-w-lg font-serif italic text-base sm:text-xl text-[#C4C8D4]">
            {t.introSplash.subtitle}
          </p>
        </div>

        {/* Progress Bar + Enter Pill */}
        <div className="w-full max-w-xs space-y-3 pt-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="dcc-anim-progress h-full w-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, #E5A952 0%, #F06A43 55%, #34D399 100%)',
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
              className="inline-flex items-center gap-2 rounded-full bg-[#E5A952] px-7 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest text-[#090A0F] shadow-lg transition hover:bg-[#F2BC6E] cursor-pointer"
            >
              {t.introSplash.skipButton}
            </button>
            <span className="font-mono text-[11px] text-[#8E95A8]">
              {t.introSplash.skipHint}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
