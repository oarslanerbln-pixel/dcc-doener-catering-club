#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { crc32 } from 'node:zlib';

const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const ROOT = path.resolve(rootIdx !== -1 && args[rootIdx + 1] ? args[rootIdx + 1] : process.cwd());

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const DEMO_LEAK_RE = /\b(?:meva|kahraman|mevadoener|beispielseite)\b|\[demo\]|demo-seite/i;

const LOCKUPS = ['primary', 'stacked', 'seal', 'monogram'];
const COLORWAYS = ['light', 'dark', 'ember', 'mono'];
const MEDIA_FILES = [
  'hero-live-station.png',
  'hero-club-trailer.png',
  'spit-yaprak-beef.png',
  'spit-classic-kalb.png',
  'spit-chicken.png',
  'spit-signature-duo.png',
  'spit-vegan-seitan.png',
  'setup-station.png',
  'setup-trailer.png',
  'setup-buffet.png',
  'gallery-corporate.png',
  'gallery-wedding.png',
  'gallery-festival.png',
  'gallery-vip.png',
];
const FONT_BASENAMES = [
  'SpaceGrotesk-Var',
  'Syne-Var',
  'InstrumentSerif-Regular',
  'InstrumentSerif-Italic',
  'JetBrainsMono-Var',
];

const failures = [];
let passedChecks = 0;

function pass() {
  passedChecks += 1;
}

function fail(category, target, reason) {
  failures.push({ category, target, reason });
}

function rel(absPath) {
  return path.relative(ROOT, absPath).replaceAll('\\', '/');
}

function inspectPng(filePath, { minWidth = 1, minHeight = 1, exactWidth, exactHeight, minBytes = 100 } = {}) {
  const target = rel(filePath);
  if (!existsSync(filePath)) return fail('png', target, 'File does not exist');
  const buf = readFileSync(filePath);
  if (buf.length < minBytes) return fail('png', target, `File too small (${buf.length} bytes < ${minBytes})`);
  if (!buf.subarray(0, 8).equals(PNG_SIG)) return fail('png', target, 'Invalid PNG signature');

  let offset = 8;
  let width = 0;
  let height = 0;
  let sawIhdr = false;
  let sawIend = false;

  while (offset + 12 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString('ascii', offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const crcEnd = dataEnd + 4;
    if (crcEnd > buf.length) return fail('png', target, `Truncated PNG chunk ${type} at offset ${offset}`);

    const actualCrc = buf.readUInt32BE(dataEnd);
    const expectedCrc = crc32(buf.subarray(offset + 4, dataEnd)) >>> 0;
    if (actualCrc !== expectedCrc) return fail('png', target, `CRC32 mismatch in chunk ${type}`);

    if (!sawIhdr) {
      if (type !== 'IHDR' || length !== 13) return fail('png', target, 'First chunk must be 13-byte IHDR');
      width = buf.readUInt32BE(dataStart);
      height = buf.readUInt32BE(dataStart + 4);
      sawIhdr = true;
    }
    if (type === 'IEND') {
      sawIend = true;
      break;
    }
    offset = crcEnd;
  }

  if (!sawIhdr || !sawIend) return fail('png', target, 'Missing IHDR or IEND chunk');
  if (width < minWidth || height < minHeight) {
    return fail('png', target, `Dimensions ${width}x${height} below minimum ${minWidth}x${minHeight}`);
  }
  if (exactWidth !== undefined && exactHeight !== undefined && (width !== exactWidth || height !== exactHeight)) {
    return fail('png', target, `Expected exact ${exactWidth}x${exactHeight}, got ${width}x${height}`);
  }
  pass();
  return { width, height };
}

function inspectWebp(filePath) {
  const target = rel(filePath);
  const buf = readFileSync(filePath);
  if (buf.length < 20) return fail('webp', target, 'File too small for WebP');
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    return fail('webp', target, 'Invalid RIFF/WEBP header');
  }
  const chunk = buf.toString('ascii', 12, 16);
  if (!['VP8 ', 'VP8L', 'VP8X'].includes(chunk)) {
    return fail('webp', target, `Unexpected WebP chunk ${chunk}`);
  }
  pass();
}

function inspectIco(filePath) {
  const target = rel(filePath);
  if (!existsSync(filePath)) return fail('ico', target, 'File does not exist');
  const buf = readFileSync(filePath);
  if (buf.length < 22) return fail('ico', target, 'ICO file too small');
  const reserved = buf.readUInt16LE(0);
  const type = buf.readUInt16LE(2);
  const count = buf.readUInt16LE(4);
  if (reserved !== 0 || type !== 1 || count < 1) {
    return fail('ico', target, `Invalid ICO header (reserved=${reserved}, type=${type}, count=${count})`);
  }
  if (buf.length < 6 + count * 16) return fail('ico', target, 'Truncated ICO directory');

  for (let i = 0; i < count; i += 1) {
    const entry = 6 + i * 16;
    const bytesInRes = buf.readUInt32LE(entry + 8);
    const imgOffset = buf.readUInt32LE(entry + 12);
    if (bytesInRes === 0 || imgOffset + bytesInRes > buf.length) {
      return fail('ico', target, `ICO entry #${i} out of bounds`);
    }
    const slice = buf.subarray(imgOffset, imgOffset + bytesInRes);
    const isPng = slice.length >= 8 && slice.subarray(0, 8).equals(PNG_SIG);
    const isBmp = slice.length >= 4 && slice.readUInt32LE(0) === 40;
    if (!isPng && !isBmp) {
      return fail('ico', target, `ICO entry #${i} payload is neither PNG nor BMP DIB`);
    }
  }
  pass();
}

function inspectSvg(filePath) {
  const target = rel(filePath);
  if (!existsSync(filePath)) return fail('svg', target, 'File does not exist');
  const text = readFileSync(filePath, 'utf8').trim();
  if (text.length < 60) return fail('svg', target, 'SVG file unexpectedly small');
  if (!/^<\?xml[\s\S]*?<svg\b|^<svg\b/i.test(text) || !/<\/svg>\s*$/i.test(text)) {
    return fail('svg', target, 'Malformed SVG root open/close tags');
  }
  const openCount = (text.match(/<svg\b/gi) ?? []).length;
  const closeCount = (text.match(/<\/svg>/gi) ?? []).length;
  if (openCount === 0 || openCount !== closeCount) {
    return fail('svg', target, `Unbalanced <svg> tags (${openCount} open vs ${closeCount} close)`);
  }
  if (!/viewBox\s*=\s*["'][^"']+["']/i.test(text)) {
    return fail('svg', target, 'Missing viewBox attribute');
  }
  if (!/<(path|circle|rect|polygon|polyline|line|ellipse|text|g|use)\b/i.test(text)) {
    return fail('svg', target, 'SVG contains no geometric/text primitives');
  }
  if (/<script\b/i.test(text)) {
    return fail('svg', target, 'Disallowed <script> inside SVG');
  }
  if (DEMO_LEAK_RE.test(text)) {
    return fail('svg', target, 'Found leftover MEVA/Kahraman demo reference inside SVG');
  }
  pass();
}

function inspectFont(baseName) {
  const fontsDir = path.join(ROOT, 'public', 'fonts');
  const candidates = ['.woff2', '.ttf', '.woff'].map((ext) => path.join(fontsDir, `${baseName}${ext}`));
  const found = candidates.filter((p) => existsSync(p));
  if (found.length === 0) {
    return fail('font', `public/fonts/${baseName}.{woff2,ttf}`, 'Missing font file');
  }
  for (const fontPath of found) {
    const target = rel(fontPath);
    const buf = readFileSync(fontPath);
    if (buf.length < 10_000) {
      fail('font', target, `Font unexpectedly small (${buf.length} bytes)`);
      continue;
    }
    const ext = path.extname(fontPath).toLowerCase();
    const magic = buf.toString('ascii', 0, 4);
    if (ext === '.woff2' && magic !== 'wOF2') {
      fail('font', target, `Invalid WOFF2 magic (${magic})`);
      continue;
    }
    if (ext === '.woff' && magic !== 'wOFF') {
      fail('font', target, `Invalid WOFF magic (${magic})`);
      continue;
    }
    if (ext === '.ttf') {
      const sfnt = buf.readUInt32BE(0);
      if (sfnt !== 0x00010000 && magic !== 'OTTO' && magic !== 'true') {
        fail('font', target, `Invalid TTF/OTF SFNT header (0x${sfnt.toString(16)})`);
        continue;
      }
    }
    pass();
  }
}

function resolveLocalRef(ref, baseDir) {
  const clean = ref.split('#')[0].split('?')[0].trim();
  if (!clean) return null;
  if (clean.includes('${')) return null;
  if (/^(https?:|data:|mailto:|tel:|javascript:|blob:)/i.test(clean)) return null;
  if (clean.startsWith('/')) return path.join(ROOT, 'public', clean.slice(1));
  return path.resolve(baseDir, clean);
}

// 1. Logo Suite (4 lockups x 4 colorways x {svg,png}, plus optional webp)
for (const lockup of LOCKUPS) {
  for (const colorway of COLORWAYS) {
    const stem = `logo-${lockup}-${colorway}`;
    inspectSvg(path.join(ROOT, 'public', 'brand', `${stem}.svg`));
    inspectPng(path.join(ROOT, 'public', 'brand', `${stem}.png`), { minWidth: 64, minHeight: 64 });
    const webpPath = path.join(ROOT, 'public', 'brand', `${stem}.webp`);
    if (existsSync(webpPath)) inspectWebp(webpPath);
  }
}

// 2. Favicons, PWA Icons, OG Image & Webmanifest
inspectSvg(path.join(ROOT, 'public', 'favicon.svg'));
inspectIco(path.join(ROOT, 'public', 'favicon.ico'));
inspectPng(path.join(ROOT, 'public', 'apple-touch-icon.png'), { exactWidth: 180, exactHeight: 180 });
inspectPng(path.join(ROOT, 'public', 'icon-192.png'), { exactWidth: 192, exactHeight: 192 });
inspectPng(path.join(ROOT, 'public', 'icon-512.png'), { exactWidth: 512, exactHeight: 512 });
inspectPng(path.join(ROOT, 'public', 'og-image.png'), { exactWidth: 1200, exactHeight: 630 });

const manifestPath = path.join(ROOT, 'public', 'site.webmanifest');
if (!existsSync(manifestPath)) {
  fail('manifest', 'public/site.webmanifest', 'File does not exist');
} else {
  try {
    const raw = readFileSync(manifestPath, 'utf8');
    if (DEMO_LEAK_RE.test(raw)) fail('manifest', 'public/site.webmanifest', 'Contains leftover MEVA/Kahraman string');
    const manifest = JSON.parse(raw);
    if (!manifest.name || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      fail('manifest', 'public/site.webmanifest', 'Missing name or icons array');
    } else {
      pass();
      for (const icon of manifest.icons) {
        const resolved = resolveLocalRef(String(icon.src ?? ''), path.join(ROOT, 'public'));
        if (!resolved || !existsSync(resolved) || statSync(resolved).size === 0) {
          fail('manifest', 'public/site.webmanifest', `Broken icon src: ${icon.src}`);
        } else {
          pass();
        }
      }
    }
  } catch (err) {
    fail('manifest', 'public/site.webmanifest', `Invalid JSON: ${err.message}`);
  }
}

// 3. Culinary & Stage Media (14 files)
for (const file of MEDIA_FILES) {
  inspectPng(path.join(ROOT, 'public', 'media', file), { minWidth: 400, minHeight: 300, minBytes: 1024 });
}

// 4. Fonts (5 families)
for (const fontBase of FONT_BASENAMES) {
  inspectFont(fontBase);
}

// 5. Brand Kit Deliverables
const guidelinesPath = path.join(ROOT, 'brand-kit', 'BRAND_GUIDELINES.md');
if (!existsSync(guidelinesPath)) {
  fail('brand-kit', 'brand-kit/BRAND_GUIDELINES.md', 'File does not exist');
} else {
  const md = readFileSync(guidelinesPath, 'utf8');
  if (md.length < 1000) fail('brand-kit', 'brand-kit/BRAND_GUIDELINES.md', 'Guidelines unexpectedly short');
  else if (DEMO_LEAK_RE.test(md)) fail('brand-kit', 'brand-kit/BRAND_GUIDELINES.md', 'Contains leftover MEVA/Kahraman string');
  else {
    const hasDe = /\b(deutsch|german|de)\b/i.test(md) && /[äöüß]/i.test(md);
    const hasEn = /\b(english|en)\b/i.test(md);
    const hasTr = /\b(türkçe|turkish|tr)\b/i.test(md) && /[ğüşiöçİĞÜŞÖÇ]/.test(md);
    if (!hasDe || !hasEn || !hasTr) {
      fail('brand-kit', 'brand-kit/BRAND_GUIDELINES.md', `Missing trilingual coverage (DE=${hasDe}, EN=${hasEn}, TR=${hasTr})`);
    } else {
      pass();
    }
  }
}

const tokensPath = path.join(ROOT, 'brand-kit', 'tokens.json');
if (!existsSync(tokensPath)) {
  fail('brand-kit', 'brand-kit/tokens.json', 'File does not exist');
} else {
  try {
    const raw = readFileSync(tokensPath, 'utf8');
    if (DEMO_LEAK_RE.test(raw)) {
      fail('brand-kit', 'brand-kit/tokens.json', 'Contains leftover MEVA/Kahraman/DEMO string');
    } else {
      const tokens = JSON.parse(raw);
      if (!tokens || typeof tokens !== 'object' || !/#[0-9a-f]{6}/i.test(raw)) {
        fail('brand-kit', 'brand-kit/tokens.json', 'Missing valid color hex tokens');
      } else {
        pass();
      }
    }
  } catch (err) {
    fail('brand-kit', 'brand-kit/tokens.json', `Invalid JSON: ${err.message}`);
  }
}

const brandKitHtmlPath = path.join(ROOT, 'brand-kit', 'brand-kit.html');
if (!existsSync(brandKitHtmlPath)) {
  fail('brand-kit', 'brand-kit/brand-kit.html', 'File does not exist');
} else {
  const html = readFileSync(brandKitHtmlPath, 'utf8');
  if (!/<html\b/i.test(html) || !/<\/html>/i.test(html)) {
    fail('brand-kit', 'brand-kit/brand-kit.html', 'Invalid HTML document structure');
  } else if (DEMO_LEAK_RE.test(html)) {
    fail('brand-kit', 'brand-kit/brand-kit.html', 'Contains leftover MEVA/Kahraman string');
  } else {
    pass();
  }

  const htmlWithoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const refMatches = [
    ...htmlWithoutScripts.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi),
    ...htmlWithoutScripts.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi),
  ];
  for (const match of refMatches) {
    const rawRef = match[1];
    const resolved = resolveLocalRef(rawRef, path.dirname(brandKitHtmlPath));
    if (!resolved) continue;
    if (!existsSync(resolved) || statSync(resolved).size === 0) {
      fail('brand-kit-ref', 'brand-kit/brand-kit.html', `Broken local asset reference: ${rawRef} -> ${rel(resolved)}`);
    } else {
      pass();
    }
  }
}

// Report & Exit Code
console.log(`\n[verify-brand-assets] Root: ${ROOT}`);
console.log(`[verify-brand-assets] Passed checks: ${passedChecks}, Failures: ${failures.length}`);
if (failures.length > 0) {
  console.error('\nFailures:');
  for (const f of failures) {
    console.error(`  - [${f.category}] ${f.target}: ${f.reason}`);
  }
  process.exit(1);
}
console.log('[verify-brand-assets] ALL BRAND ASSETS & REFERENCES VERIFIED.');
process.exit(0);
