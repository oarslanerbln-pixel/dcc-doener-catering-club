import React, { useEffect, useRef, useState } from 'react';
import type { HeroBgStyle } from './HeroBgPresets';

export type { HeroBgStyle };

export interface Hero3DCanvasProps {
  bgStyle: HeroBgStyle;
  pointerTargetRef: React.RefObject<{ nx: number; ny: number }>;
  heroContainerRef?: React.RefObject<HTMLElement | null>;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  isEmerald: boolean;
}

interface GyroParticle {
  x: number;
  y: number;
  z: number;
  vy: number;
  size: number;
  isEmerald: boolean;
}

const VERT_SHADER = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.04 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float field(vec2 p, float t, vec2 m) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + t * 0.14 + m * 0.25),
    fbm(p + vec2(5.2, 1.3) - t * 0.11 - m * 0.20)
  );
  vec2 r = vec2(
    fbm(p + 2.35 * q + vec2(1.7, 9.2) + t * 0.09),
    fbm(p + 2.35 * q + vec2(8.3, 2.8) - t * 0.08)
  );
  return fbm(p + 1.85 * r);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  vec2 p = uv * 1.45;
  float t = u_time;

  float f = field(p, t, u_mouse);
  float eps = 0.015;
  float fx = field(p + vec2(eps, 0.0), t, u_mouse);
  float fy = field(p + vec2(0.0, eps), t, u_mouse);

  vec3 n = normalize(vec3((f - fx) * 14.0, (f - fy) * 14.0, 1.0));
  vec3 viewDir = normalize(vec3(u_mouse * 0.22 - uv * 0.18, 1.0));
  float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);

  vec3 obsidian = vec3(0.0235, 0.0235, 0.0235);
  vec3 charcoal = vec3(0.058, 0.066, 0.062);
  vec3 gold = vec3(0.831, 0.659, 0.325);
  vec3 champagne = vec3(0.961, 0.863, 0.608);
  vec3 emerald = vec3(0.169, 0.769, 0.541);

  float ridge = smoothstep(0.46, 0.78, f);
  float filmMix = clamp(sin(f * 8.0 + t * 0.45) * 0.5 + 0.5, 0.0, 1.0);
  vec3 rimColor = mix(gold, emerald, filmMix * 0.72);
  rimColor = mix(rimColor, champagne, fresnel * 0.45);

  vec3 col = mix(obsidian, charcoal, smoothstep(0.2, 0.75, f));
  col += rimColor * (fresnel * 0.42 + ridge * 0.11);

  // Restrained center vignette so bold white Montserrat H1 keeps maximum contrast
  float centerDist = length(uv * vec2(0.75, 1.05));
  float vignette = smoothstep(0.18, 0.92, centerDist);
  col = mix(obsidian * 0.92, col, 0.38 + 0.62 * vignette);

  // Subtle top/bottom obsidian fade
  float edgeFade = smoothstep(0.0, 0.22, v_uv.y) * smoothstep(1.0, 0.76, v_uv.y);
  col *= (0.45 + 0.55 * edgeFade);

  fragColor = vec4(col, 0.96);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function curlVelocity(x: number, y: number, t: number): { vx: number; vy: number } {
  const s = 0.0042;
  const px = x * s;
  const py = y * s;
  const eps = 0.01;
  const psi = (ax: number, ay: number) =>
    Math.sin(ax * 2.1 + t * 0.55) * Math.cos(ay * 1.9 - t * 0.42) +
    0.55 * Math.sin((ax + ay) * 3.1 - t * 0.7);
  const dPsiDy = (psi(px, py + eps) - psi(px, py - eps)) / (2 * eps);
  const dPsiDx = (psi(px + eps, py) - psi(px - eps, py)) / (2 * eps);
  return { vx: dPsiDy * 0.72, vy: -dPsiDx * 0.72 - 0.52 };
}

export function Hero3DCanvas({
  bgStyle,
  pointerTargetRef,
  heroContainerRef,
}: Hero3DCanvasProps): React.ReactElement {
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  const smoothPointerRef = useRef({ nx: 0, ny: 0 });
  const lastCssPointerRef = useRef({ nx: 99, ny: 99 });

  const useWebGL2 = bgStyle === 'obsidian-shader' && !webglUnsupported;

  // WebGL2 Liquid Obsidian Domain-Warped Shader Loop
  useEffect(() => {
    if (!useWebGL2) return;
    const canvas = webglCanvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });

    if (!gl || gl.isContextLost()) {
      setWebglUnsupported(true);
      return;
    }

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SHADER);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SHADER);
    if (!vert || !frag) {
      if (vert) gl.deleteShader(vert);
      if (frag) gl.deleteShader(frag);
      setWebglUnsupported(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      setWebglUnsupported(true);
      return;
    }

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      setWebglUnsupported(true);
      return;
    }

    const posBuffer = gl.createBuffer();
    if (!posBuffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      setWebglUnsupported(true);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_pos');
    const resLoc = gl.getUniformLocation(program, 'u_res');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    gl.useProgram(program);
    if (posLoc >= 0) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let width = 1;
    let height = 1;
    let rafId = 0;
    let inView = true;
    let time = 1.8;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Smooth liquid obsidian shader needs no supersampling; 0.75x scale cuts GPU load by >44-85%
      const scale = Math.min(window.devicePixelRatio || 1, 1) * 0.75;
      width = Math.max(1, Math.round(rect.width * scale));
      height = Math.max(1, Math.round(rect.height * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    resize();
    window.addEventListener('resize', resize);
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => resize())
        : null;
    ro?.observe(canvas);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnsupported(true);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);

    const syncPointer = () => {
      const target = pointerTargetRef.current;
      const smooth = smoothPointerRef.current;
      smooth.nx += (target.nx - smooth.nx) * 0.1;
      smooth.ny += (target.ny - smooth.ny) * 0.1;

      const heroEl = heroContainerRef?.current;
      if (
        heroEl &&
        (Math.abs(smooth.nx - lastCssPointerRef.current.nx) > 0.002 ||
          Math.abs(smooth.ny - lastCssPointerRef.current.ny) > 0.002)
      ) {
        lastCssPointerRef.current = { nx: smooth.nx, ny: smooth.ny };
        heroEl.style.setProperty('--hero-mx', smooth.nx.toFixed(3));
        heroEl.style.setProperty('--hero-my', smooth.ny.toFixed(3));
      }
    };

    const draw = () => {
      syncPointer();
      gl.useProgram(program);
      gl.uniform2f(resLoc, width, height);
      gl.uniform1f(timeLoc, time);
      gl.uniform2f(
        mouseLoc,
        smoothPointerRef.current.nx,
        -smoothPointerRef.current.ny
      );
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    let io: IntersectionObserver | null = null;
    let lastTs = 0;
    const isTabVisible = () =>
      typeof document === 'undefined' || document.visibilityState === 'visible';
    const onVisibilityChange = () => {
      if (isTabVisible() && inView && !rafId && !reducedMotion) {
        lastTs = 0;
        rafId = window.requestAnimationFrame(loop);
      }
    };
    const loop = (ts: number) => {
      if (!inView || !isTabVisible()) {
        rafId = 0;
        lastTs = 0;
        return;
      }
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 1 / 60;
      lastTs = ts;
      time += dt * 0.84;
      draw();
      rafId = window.requestAnimationFrame(loop);
    };

    if (reducedMotion) {
      draw();
    } else {
      document.addEventListener('visibilitychange', onVisibilityChange);
      rafId = window.requestAnimationFrame(loop);

      io =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(
              (entries) => {
                inView = entries[0]?.isIntersecting ?? true;
                if (inView && isTabVisible() && !rafId) {
                  lastTs = 0;
                  rafId = window.requestAnimationFrame(loop);
                }
              },
              { threshold: 0.01 }
            )
          : null;
      io?.observe(canvas);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      io?.disconnect();
      ro?.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      if (rafId) window.cancelAnimationFrame(rafId);
      gl.deleteBuffer(posBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      queueMicrotask(() => {
        if (!canvas.isConnected) {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      });
    };
  }, [useWebGL2, pointerTargetRef, heroContainerRef]);

  // Canvas 2D Engine (Gyro Rotisserie, Ember Flow, Stage Architecture, & Obsidian Fallback)
  useEffect(() => {
    if (useWebGL2) return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const gyroParticles: GyroParticle[] = Array.from({ length: 42 }, (_, i) => ({
      x: (((i * 73) % 100) / 100 - 0.5) * 920,
      y: (((i * 41) % 100) / 100 - 0.5) * 520,
      z: ((i * 29) % 240) - 120,
      vy: 0.22 + (i % 5) * 0.08,
      size: 1.1 + (i % 3) * 0.65,
      isEmerald: i % 2 === 0,
    }));

    const embers: EmberParticle[] = Array.from({ length: 84 }, (_, i) => ({
      x: (((i * 53) % 100) / 100 - 0.5) * 1180,
      y: (((i * 37) % 100) / 100 - 0.5) * 640,
      vx: 0,
      vy: -0.4,
      life: (i * 11) % 140,
      maxLife: 120 + (i % 5) * 24,
      size: 1.1 + (i % 4) * 0.5,
      isEmerald: i % 3 === 0,
    }));

    let width = 1;
    let height = 1;
    let rafId = 0;
    let time = 1.8;
    let inView = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => resize())
        : null;
    ro?.observe(canvas);

    const project = (x: number, y: number, z: number) => {
      const fov = 520;
      const scale = fov / (fov + z + 260);
      return {
        sx: width / 2 + x * scale,
        sy: height * 0.46 + y * scale,
        scale,
      };
    };

    const drawRing = (
      radius: number,
      rx: number,
      ry: number,
      stroke: string,
      lineWidth: number,
      withTicks = false
    ) => {
      const segments = 72;
      ctx.beginPath();
      for (let i = 0; i <= segments; i += 1) {
        const theta = (i / segments) * Math.PI * 2;
        const px = Math.cos(theta) * radius;
        const py = Math.sin(theta) * radius;

        const y1 = py * Math.cos(rx);
        const z1 = py * Math.sin(rx);
        const x2 = px * Math.cos(ry) + z1 * Math.sin(ry);
        const z2 = -px * Math.sin(ry) + z1 * Math.cos(ry);

        const { sx, sy } = project(x2, y1, z2);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      if (withTicks) {
        ctx.beginPath();
        for (let i = 0; i < 12; i += 1) {
          const theta = (i / 12) * Math.PI * 2;
          const rIn = radius - 6;
          const rOut = radius + 6;
          const p0x = Math.cos(theta) * rIn;
          const p0y = Math.sin(theta) * rIn;
          const p1x = Math.cos(theta) * rOut;
          const p1y = Math.sin(theta) * rOut;

          const y01 = p0y * Math.cos(rx);
          const z01 = p0y * Math.sin(rx);
          const x02 = p0x * Math.cos(ry) + z01 * Math.sin(ry);
          const z02 = -p0x * Math.sin(ry) + z01 * Math.cos(ry);

          const y11 = p1y * Math.cos(rx);
          const z11 = p1y * Math.sin(rx);
          const x12 = p1x * Math.cos(ry) + z11 * Math.sin(ry);
          const z12 = -p1x * Math.sin(ry) + z11 * Math.cos(ry);

          const a = project(x02, y01, z02);
          const b = project(x12, y11, z12);
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
        }
        ctx.strokeStyle = 'rgba(212, 168, 83, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawGyroRotisserie = (mx: number, my: number) => {
      const baseR = Math.min(width * 0.34, 340);
      const rotX = 0.22 + my * 0.3;
      const rotY = time * 0.38 + mx * 0.55;

      // 3 Bauhaus Gyroscopic Orbital Rings
      drawRing(
        baseR,
        0.92 + Math.sin(time * 0.4) * 0.12 + my * 0.24,
        time * 0.22 + mx * 0.32,
        'rgba(212, 168, 83, 0.28)',
        1.3,
        true
      );
      drawRing(
        baseR * 0.82,
        1.18 + Math.cos(time * 0.35) * 0.14 - my * 0.24,
        -time * 0.18 + mx * 0.38,
        'rgba(43, 196, 138, 0.26)',
        1.15
      );
      drawRing(
        baseR * 1.14,
        0.78 + my * 0.18,
        time * 0.11 - mx * 0.25,
        'rgba(255, 255, 255, 0.10)',
        0.85
      );

      // Central 3D Vertical Döner Spindle + 4 Sculpted Elliptical Wireframe Tiers
      const spindleTop = project(0, -148, 0);
      const spindleBot = project(0, 148, 0);
      ctx.beginPath();
      ctx.moveTo(spindleTop.sx, spindleTop.sy);
      ctx.lineTo(spindleBot.sx, spindleBot.sy);
      ctx.strokeStyle = 'rgba(245, 220, 155, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const tiers = [
        { y: -92, rx: 108, rz: 108, col: 'rgba(245, 220, 155, 0.22)' },
        { y: -38, rx: 92, rz: 92, col: 'rgba(212, 168, 83, 0.24)' },
        { y: 16, rx: 72, rz: 72, col: 'rgba(43, 196, 138, 0.22)' },
        { y: 68, rx: 48, rz: 48, col: 'rgba(43, 196, 138, 0.26)' },
      ];

      for (const tier of tiers) {
        const segs = 24;
        ctx.beginPath();
        for (let i = 0; i <= segs; i += 1) {
          const a = (i / segs) * Math.PI * 2 + rotY;
          const x = Math.cos(a) * tier.rx;
          const z = Math.sin(a) * tier.rz;
          const y1 = tier.y * Math.cos(rotX) - z * Math.sin(rotX);
          const z1 = tier.y * Math.sin(rotX) + z * Math.cos(rotX);
          const p = project(x, y1, z1);
          if (i === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.strokeStyle = tier.col;
        ctx.lineWidth = 1.05;
        ctx.stroke();
      }

      // 8 Longitudinal Wireframe Ribs
      for (let r = 0; r < 8; r += 1) {
        const a = (r / 8) * Math.PI * 2 + rotY;
        ctx.beginPath();
        tiers.forEach((tier, idx) => {
          const x = Math.cos(a) * tier.rx;
          const z = Math.sin(a) * tier.rz;
          const y1 = tier.y * Math.cos(rotX) - z * Math.sin(rotX);
          const z1 = tier.y * Math.sin(rotX) + z * Math.cos(rotX);
          const p = project(x, y1, z1);
          if (idx === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        });
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Restrained Ambient Depth Particles
      for (const p of gyroParticles) {
        if (!reducedMotion) {
          p.y -= p.vy;
          if (p.y < -280) p.y = 280;
        }
        const px = p.x + mx * (p.z * 0.16);
        const py = p.y + my * (p.z * 0.12);
        const proj = project(px, py, p.z);
        const alpha = Math.max(0.08, Math.min(0.55, proj.scale * 0.55));
        ctx.beginPath();
        ctx.arc(proj.sx, proj.sy, Math.max(0.8, p.size * proj.scale), 0, Math.PI * 2);
        ctx.fillStyle = p.isEmerald
          ? `rgba(43, 196, 138, ${alpha})`
          : `rgba(212, 168, 83, ${alpha})`;
        ctx.fill();
      }
    };

    const drawEmberFlow = (mx: number, my: number) => {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const bgGlow = ctx.createRadialGradient(
        cx + mx * 70,
        cy + my * 50,
        10,
        cx,
        cy,
        Math.max(width, height) * 0.65
      );
      bgGlow.addColorStop(0, 'rgba(212, 168, 83, 0.08)');
      bgGlow.addColorStop(0.45, 'rgba(43, 196, 138, 0.05)');
      bgGlow.addColorStop(1, 'rgba(6, 6, 6, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (const p of embers) {
        const vel = curlVelocity(p.x, p.y, time);
        const swirlX = mx * 0.85;
        const swirlY = my * 0.45;
        const vx = vel.vx + swirlX;
        const vy = vel.vy + swirlY;

        if (!reducedMotion) {
          p.vx = vx;
          p.vy = vy;
          p.x += vx * 1.45;
          p.y += vy * 1.45;
          p.life += 1;
          if (
            p.life > p.maxLife ||
            p.y < -height * 0.62 ||
            p.y > height * 0.62 ||
            p.x < -width * 0.62 ||
            p.x > width * 0.62
          ) {
            p.x = (((p.maxLife * 37 + time * 190) % 100) / 100 - 0.5) * width * 0.96;
            p.y = height * 0.52;
            p.life = 0;
          }
        }

        const lifeRatio = Math.sin((p.life / p.maxLife) * Math.PI);
        const sx = cx + p.x;
        const sy = cy + p.y;
        const trailX = sx - vx * 11;
        const trailY = sy - vy * 11;

        const alpha = Math.max(0.06, Math.min(0.68, lifeRatio * 0.68));
        ctx.beginPath();
        ctx.moveTo(trailX, trailY);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = p.isEmerald
          ? `rgba(43, 196, 138, ${alpha})`
          : `rgba(212, 168, 83, ${alpha})`;
        ctx.lineWidth = p.size;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = p.isEmerald
          ? `rgba(120, 232, 188, ${alpha * 0.9})`
          : `rgba(245, 220, 155, ${alpha * 0.9})`;
        ctx.fill();
      }
      ctx.restore();
    };

    const drawStageArchitecture = (mx: number, my: number) => {
      const cols = 12;
      const padX = Math.max(24, width * 0.055);
      const gridW = width - padX * 2;
      const colW = gridW / cols;
      const shiftX = mx * -14;
      const shiftY = my * -9;

      // Swiss 12-Column Hairline Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= cols; i += 1) {
        const x = padX + i * colW + shiftX * 0.35;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      // Golden-Ratio Horizontal Guides
      const ratios = [0.18, 0.382, 0.618, 0.82];
      for (const r of ratios) {
        const y = height * r + shiftY * 0.45;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Architectural Framing Brackets (Sharp Corner Marks, No Closed Box Border)
      const insetX = Math.max(28, width * 0.08) + shiftX;
      const insetY = Math.max(32, height * 0.12) + shiftY;
      const bw = 28;
      ctx.strokeStyle = 'rgba(212, 168, 83, 0.42)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Top-left
      ctx.moveTo(insetX, insetY + bw);
      ctx.lineTo(insetX, insetY);
      ctx.lineTo(insetX + bw, insetY);
      // Top-right
      ctx.moveTo(width - insetX - bw, insetY);
      ctx.lineTo(width - insetX, insetY);
      ctx.lineTo(width - insetX, insetY + bw);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(43, 196, 138, 0.42)';
      ctx.beginPath();
      // Bottom-left
      ctx.moveTo(insetX, height - insetY - bw);
      ctx.lineTo(insetX, height - insetY);
      ctx.lineTo(insetX + bw, height - insetY);
      // Bottom-right
      ctx.moveTo(width - insetX - bw, height - insetY);
      ctx.lineTo(width - insetX, height - insetY);
      ctx.lineTo(width - insetX, height - insetY - bw);
      ctx.stroke();

      // Center Horizon Optical Accent
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.8);
      const grad = ctx.createLinearGradient(padX, 0, width - padX, 0);
      grad.addColorStop(0, 'rgba(212, 168, 83, 0)');
      grad.addColorStop(0.35, `rgba(212, 168, 83, ${0.14 + pulse * 0.08})`);
      grad.addColorStop(0.65, `rgba(43, 196, 138, ${0.14 + pulse * 0.08})`);
      grad.addColorStop(1, 'rgba(43, 196, 138, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(padX, height * 0.5 + shiftY * 0.6);
      ctx.lineTo(width - padX, height * 0.5 + shiftY * 0.6);
      ctx.stroke();
    };

    const drawObsidianFallback = (mx: number, my: number) => {
      const cx = width * 0.5 + mx * 50;
      const cy = height * 0.44 + my * 35;
      const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(width, height) * 0.6);
      g.addColorStop(0, 'rgba(212, 168, 83, 0.14)');
      g.addColorStop(0.45, 'rgba(43, 196, 138, 0.09)');
      g.addColorStop(1, 'rgba(6, 6, 6, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 6; i += 1) {
        const yBase = height * (0.24 + i * 0.1);
        ctx.beginPath();
        for (let x = 0; x <= width; x += 24) {
          const n =
            Math.sin(x * 0.004 + time * 0.7 + i * 0.9) * 32 +
            Math.cos(x * 0.008 - time * 0.45 + mx * 2.0) * 16;
          const y = yBase + n + my * 18;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle =
          i % 2 === 0 ? 'rgba(212, 168, 83, 0.18)' : 'rgba(43, 196, 138, 0.16)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    };

    const syncPointer = () => {
      const target = pointerTargetRef.current;
      const smooth = smoothPointerRef.current;
      smooth.nx += (target.nx - smooth.nx) * 0.1;
      smooth.ny += (target.ny - smooth.ny) * 0.1;

      const heroEl = heroContainerRef?.current;
      if (
        heroEl &&
        (Math.abs(smooth.nx - lastCssPointerRef.current.nx) > 0.002 ||
          Math.abs(smooth.ny - lastCssPointerRef.current.ny) > 0.002)
      ) {
        lastCssPointerRef.current = { nx: smooth.nx, ny: smooth.ny };
        heroEl.style.setProperty('--hero-mx', smooth.nx.toFixed(3));
        heroEl.style.setProperty('--hero-my', smooth.ny.toFixed(3));
      }
    };

    const renderFrame = () => {
      syncPointer();
      ctx.clearRect(0, 0, width, height);
      const mx = smoothPointerRef.current.nx;
      const my = smoothPointerRef.current.ny;

      if (bgStyle === 'gyro-rotisserie') {
        drawGyroRotisserie(mx, my);
      } else if (bgStyle === 'ember-flow') {
        drawEmberFlow(mx, my);
      } else if (bgStyle === 'stage-architecture') {
        drawStageArchitecture(mx, my);
      } else {
        drawObsidianFallback(mx, my);
      }
    };

    let io: IntersectionObserver | null = null;
    let lastTs = 0;
    const isTabVisible = () =>
      typeof document === 'undefined' || document.visibilityState === 'visible';
    const onVisibilityChange = () => {
      if (isTabVisible() && inView && !rafId && !reducedMotion) {
        lastTs = 0;
        rafId = window.requestAnimationFrame(loop);
      }
    };
    const loop = (ts: number) => {
      if (!inView || !isTabVisible()) {
        rafId = 0;
        lastTs = 0;
        return;
      }
      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 1 / 60;
      lastTs = ts;
      time += dt * 0.84;
      renderFrame();
      rafId = window.requestAnimationFrame(loop);
    };

    if (reducedMotion) {
      renderFrame();
    } else {
      document.addEventListener('visibilitychange', onVisibilityChange);
      rafId = window.requestAnimationFrame(loop);

      io =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(
              (entries) => {
                inView = entries[0]?.isIntersecting ?? true;
                if (inView && isTabVisible() && !rafId) {
                  lastTs = 0;
                  rafId = window.requestAnimationFrame(loop);
                }
              },
              { threshold: 0.01 }
            )
          : null;
      io?.observe(canvas);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      io?.disconnect();
      ro?.disconnect();
      window.removeEventListener('resize', resize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [useWebGL2, bgStyle, pointerTargetRef, heroContainerRef]);

  return useWebGL2 ? (
    <canvas
      key="webgl2"
      ref={webglCanvasRef}
      aria-hidden="true"
      data-hero-engine="webgl2"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  ) : (
    <canvas
      key="canvas2d"
      ref={canvas2dRef}
      aria-hidden="true"
      data-hero-engine="canvas2d"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
