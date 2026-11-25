import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expect, test } from '@playwright/test';
import {
  expectEuroClose,
  formatCheckByLocale,
  parseEuro,
} from './helpers/currency';
import { calculateExpectedQuote, REFERENCE_VECTORS } from './helpers/pricing-oracle';
import {
  assertAllVisibleImgsLoaded,
  captureWhatsAppAction,
  computeFutureDateIso,
  dismissSplash,
  installPrintAndWindowOpenSpy,
  locateModalField,
  openApp,
  openQuoteModal,
  pickVisible,
  readCardEuroPrice,
  readReceiptSummary,
  selectMeat,
  selectSetup,
  setExtra,
  setExtras,
  setGuestsViaInput,
  setGuestsViaSlider,
  switchLocale,
  switchTheme,
  triggerAndCaptureWhatsApp,
  waitForImgLoaded,
} from './helpers/site-actions';

const DEMO_LEAK_RE = /\b(?:meva|kahraman|mevadoener|beispielseite)\b|\[demo\]|demo-seite/i;
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

test.describe('Tier 1 — Core Feature Coverage', () => {
  test.describe('Area A: Logo & Brand Asset Loading/Rendering', () => {
    test('T1-ASSET-01: Clean initial load & zero runtime errors', async ({ page }) => {
      const monitors = await openApp(page, '/');
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page.locator('#hero')).toBeVisible();
      monitors.assertClean();
    });

    test('T1-ASSET-02: Header & Footer logo rendering', async ({ page }) => {
      const monitors = await openApp(page, '/');
      const logos = page.locator('header img, header svg, footer img, footer svg');
      const count = await logos.count();
      expect(count).toBeGreaterThanOrEqual(2);

      for (const containerSel of ['header', 'footer']) {
        const container = page.locator(containerSel).first();
        await container.scrollIntoViewIfNeeded();
        const imgs = container.locator('img');
        const imgCount = await imgs.count();
        for (let i = 0; i < imgCount; i += 1) {
          const ok = await imgs.nth(i).evaluate((img: HTMLImageElement) => {
            return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
          });
          expect(ok, `${containerSel} img #${i} failed to decode`).toBe(true);
        }

        const svgs = container.locator('svg');
        const svgCount = await svgs.count();
        expect(imgCount + svgCount, `${containerSel} must render logo graphics`).toBeGreaterThan(0);
        if (imgCount === 0 && svgCount > 0) {
          const box = await svgs.first().boundingBox();
          expect(box && box.width > 0 && box.height > 0).toBe(true);
        }
      }
      monitors.assertClean();
    });

    test('T1-ASSET-03: Favicon, PWA icons & OG meta asset integrity', async ({ page, request }) => {
      const monitors = await openApp(page, '/');

      const refs = await page.evaluate(() => {
        const links = Array.from(
          document.querySelectorAll<HTMLLinkElement>(
            'link[rel*="icon" i], link[rel="apple-touch-icon"], link[rel="manifest"]'
          )
        ).map((el) => ({ rel: el.rel, href: el.getAttribute('href') ?? '' }));
        const ogImage =
          document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.getAttribute('content') ?? '';
        return { links, ogImage };
      });

      expect(refs.links.length).toBeGreaterThan(0);
      for (const link of refs.links) {
        expect(link.href).not.toBe('');
        const res = await request.get(link.href);
        expect(res.status(), `Failed asset ${link.rel}: ${link.href}`).toBe(200);
        const body = await res.body();
        expect(body.byteLength).toBeGreaterThan(0);

        if (link.rel.toLowerCase().includes('manifest')) {
          const manifest = JSON.parse(body.toString('utf8')) as {
            name?: string;
            icons?: Array<{ src?: string; sizes?: string }>;
          };
          expect(manifest.name).toBeTruthy();
          expect(Array.isArray(manifest.icons) && manifest.icons.length > 0).toBe(true);
          const iconSrcs = (manifest.icons ?? []).map((ic) => ic.src ?? '');
          expect(iconSrcs.some((s) => s.includes('192'))).toBe(true);
          expect(iconSrcs.some((s) => s.includes('512'))).toBe(true);
          for (const icon of manifest.icons ?? []) {
            if (!icon.src) continue;
            const iconRes = await request.get(icon.src.startsWith('/') ? icon.src : `/${icon.src}`);
            expect(iconRes.status(), `Manifest icon failed: ${icon.src}`).toBe(200);
          }
        }
      }

      if (refs.ogImage) {
        const ogUrl = /^https?:\/\//i.test(refs.ogImage)
          ? new URL(refs.ogImage).pathname
          : refs.ogImage;
        const ogRes = await request.get(ogUrl);
        expect(ogRes.status(), `OG image failed: ${ogUrl}`).toBe(200);
        const ogBuf = await ogRes.body();
        expect(ogBuf.byteLength).toBeGreaterThan(100);
      }

      monitors.assertClean();
    });

    test('T1-ASSET-04: Complete Logo Suite availability (4 lockups x 4 colorways)', async ({
      page,
      request,
    }) => {
      await openApp(page, '/');
      const lockups = ['primary', 'stacked', 'seal', 'monogram'] as const;
      const colorways = ['light', 'dark', 'ember', 'mono'] as const;

      for (const lockup of lockups) {
        for (const colorway of colorways) {
          const svgUrl = `/brand/logo-${lockup}-${colorway}.svg`;
          const svgRes = await request.get(svgUrl);
          expect(svgRes.status(), `Missing ${svgUrl}`).toBe(200);
          const svgText = await svgRes.text();
          expect(svgText.length).toBeGreaterThan(100);
          expect(svgText).toMatch(/<svg\b/i);

          const pngUrl = `/brand/logo-${lockup}-${colorway}.png`;
          const pngRes = await request.get(pngUrl);
          expect(pngRes.status(), `Missing ${pngUrl}`).toBe(200);
          const pngBuf = await pngRes.body();
          expect(pngBuf.byteLength).toBeGreaterThan(100);
          expect(pngBuf.subarray(0, 8).equals(PNG_SIG), `Invalid PNG signature: ${pngUrl}`).toBe(true);
        }
      }
    });

    test('T1-ASSET-05: Culinary & Stage Media rendering (Hero, 5 spits, 3 setups, 4 gallery slides)', async ({
      page,
    }) => {
      const monitors = await openApp(page, '/');

      // Hero both stage views
      await assertAllVisibleImgsLoaded(page, '#hero');
      const trailerBtn = page.locator('#hero').getByRole('button', { name: /trailer/i }).first();
      if ((await trailerBtn.count()) > 0) {
        await trailerBtn.click();
        await assertAllVisibleImgsLoaded(page, '#hero');
      }

      // Calculator spits & setups
      await page.locator('#rechner').scrollIntoViewIfNeeded();
      await assertAllVisibleImgsLoaded(page, '#rechner');

      // Gallery all 4 slides
      await page.locator('#galerie').scrollIntoViewIfNeeded();
      const nextBtn = page
        .locator('#galerie')
        .getByRole('button', { name: /next|nächste|vor|weiter|sonraki|ileri/i })
        .first();
      for (let slide = 0; slide < 4; slide += 1) {
        await assertAllVisibleImgsLoaded(page, '#galerie');
        if ((await nextBtn.count()) > 0) {
          await nextBtn.click();
        }
      }

      monitors.assertClean();
    });

    test('T1-ASSET-06: Self-hosted Atelier Motion font loading', async ({ page }) => {
      const monitors = await openApp(page, '/');
      const loadedFamilies = await page.evaluate(async () => {
        await document.fonts.ready;
        return Array.from(document.fonts)
          .filter((f) => f.status === 'loaded')
          .map((f) => f.family.replace(/["']/g, ''));
      });

      const normalized = loadedFamilies.join(' | ');
      expect(normalized).toMatch(/Space\s*Grotesk/i);
      expect(normalized).toMatch(/Syne/i);
      expect(normalized).toMatch(/Instrument\s*Serif/i);
      expect(normalized).toMatch(/JetBrains\s*Mono/i);
      monitors.assertClean();
    });

    test('T1-ASSET-07: Zero MEVA / DEMO branding leakage', async ({ page }) => {
      await openApp(page, '/');
      const snapshot = await page.evaluate(() => ({
        title: document.title,
        bodyText: document.body.innerText,
        metaText: Array.from(document.querySelectorAll('meta'))
          .map((m) => m.getAttribute('content') ?? '')
          .join(' '),
        imgAttrs: Array.from(document.querySelectorAll('img'))
          .map((img) => `${img.getAttribute('src') ?? ''} ${img.getAttribute('alt') ?? ''}`)
          .join(' '),
      }));

      expect(snapshot.title).toMatch(/DCC|Döner Catering Club/i);
      expect(snapshot.bodyText).toMatch(/DCC|Döner Catering Club/i);
      expect(snapshot.title).not.toMatch(DEMO_LEAK_RE);
      expect(snapshot.bodyText).not.toMatch(DEMO_LEAK_RE);
      expect(snapshot.metaText).not.toMatch(DEMO_LEAK_RE);
      expect(snapshot.imgAttrs).not.toMatch(DEMO_LEAK_RE);
    });
  });

  test.describe('Area B: DE / EN / TR Language Views', () => {
    test('T1-I18N-01: Default German (de) view on boot', async ({ page }) => {
      const monitors = await openApp(page, '/');
      await expect(page.locator('html')).toHaveAttribute('lang', /^de/i);
      await expect(page.locator('#hero')).toBeVisible();
      await expect(page.locator('#rechner')).toContainText(/Gäste|Spieß|Aufbau|Extras/i);
      await expect(page.locator('#rechner-summary')).toContainText(/Netto|MwSt|Brutto|pro Gast/i);
      await expect(page.locator('footer')).toContainText(/Impressum|Datenschutz/i);
      monitors.assertClean();
    });

    test('T1-I18N-02: Full English (en) translation parity', async ({ page }) => {
      const monitors = await openApp(page, '/');
      await switchLocale(page, 'en');

      const rechnerText = await page.locator('#rechner').innerText();
      expect(rechnerText).not.toMatch(/Gästeanzahl|Spieß-Auswahl|Zusatzleistungen/i);
      expect(rechnerText).toMatch(/Guest|Spit|Setup|Extra/i);

      const summaryText = await page.locator('#rechner-summary').innerText();
      expect(summaryText).not.toMatch(/\bMwSt\.\b|Gesamt brutto|pro Gast/i);
      expect(summaryText).toMatch(/VAT|Gross|Net|per guest/i);

      await expect(page.locator('#galerie')).toBeVisible();
      await expect(page.locator('#produktion')).toBeVisible();
      await expect(page.locator('#faq')).toBeVisible();
      monitors.assertClean();
    });

    test('T1-I18N-03: Full Turkish (tr) translation parity & diacritics', async ({ page }) => {
      const monitors = await openApp(page, '/');
      await switchLocale(page, 'tr');

      const fullText = await page.locator('body').innerText();
      expect(fullText).not.toContain('\uFFFD');
      expect(fullText).toMatch(/[ğüşiöçİĞÜŞÖÇ]/);

      const rechnerText = await page.locator('#rechner').innerText();
      expect(rechnerText).not.toMatch(/Gästeanzahl|Spieß-Auswahl/i);
      expect(rechnerText).toMatch(/Misafir|Kişi|Döner|Kurulum|Ekstra/i);

      const summaryText = await page.locator('#rechner-summary').innerText();
      expect(summaryText).toMatch(/KDV|Brüt|Net|Kişi Başı/i);
      monitors.assertClean();
    });

    test('T1-I18N-04: Locale-specific currency formatting (DE, EN, TR)', async ({ page }) => {
      await openApp(page, '/');
      const defaultVec = REFERENCE_VECTORS[0];

      for (const locale of ['de', 'en', 'tr'] as const) {
        await switchLocale(page, locale);
        const receipt = await readReceiptSummary(page);

        const netCheck = formatCheckByLocale(receipt.netText, locale);
        const vatCheck = formatCheckByLocale(receipt.vatText, locale);
        const grossCheck = formatCheckByLocale(receipt.grossText, locale);
        const perGuestCheck = formatCheckByLocale(receipt.perGuestText, locale);

        expect(netCheck.valid, netCheck.reason).toBe(true);
        expect(vatCheck.valid, vatCheck.reason).toBe(true);
        expect(grossCheck.valid, grossCheck.reason).toBe(true);
        expect(perGuestCheck.valid, perGuestCheck.reason).toBe(true);

        expectEuroClose(receipt.net, defaultVec.expectedSubtotalNet, 0.01, `${locale} net`);
        expectEuroClose(receipt.vat, defaultVec.expectedVatAmount, 0.01, `${locale} vat`);
        expectEuroClose(receipt.gross, defaultVec.expectedTotalGross, 0.01, `${locale} gross`);
        expectEuroClose(
          receipt.perGuest,
          defaultVec.expectedPerGuestNet,
          0.01,
          `${locale} perGuest`
        );
      }
    });

    test('T1-I18N-05: Mobile Bottom Bar localization (390x844)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const monitors = await openApp(page, '/');

      const bottomBar = page.locator('[data-testid="mobile-bottom-bar"], nav.fixed.bottom-0').first();
      await expect(bottomBar).toBeVisible();
      const deText = await bottomBar.innerText();

      await switchLocale(page, 'en');
      const enText = await bottomBar.innerText();
      expect(enText).not.toEqual(deText);
      expect(enText).not.toMatch(/\bRechner\b|\bAnrufen\b|\bStart\b/i);

      await switchLocale(page, 'tr');
      const trText = await bottomBar.innerText();
      expect(trText).not.toEqual(enText);
      expect(trText).not.toMatch(/\bRechner\b|\bAnrufen\b|\bCalculator\b|\bCall\b/i);
      monitors.assertClean();
    });

    test('T1-I18N-06: Quote Modal & validation message localization', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');

      const snapshots: Record<string, string> = {};
      for (const locale of ['en', 'tr', 'de'] as const) {
        await switchLocale(page, locale);
        const modal = await openQuoteModal(page);

        const waNamed = modal
          .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
          .filter({ hasText: /whatsapp/i });
        const submitBtn =
          (await waNamed.count()) > 0
            ? waNamed.first()
            : modal.locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button[type="submit"]').first();
        await triggerAndCaptureWhatsApp(page, submitBtn);
        snapshots[locale] = await modal.innerText();

        await page.keyboard.press('Escape');
        await expect(modal).toBeHidden();
      }

      expect(snapshots.en).not.toEqual(snapshots.de);
      expect(snapshots.tr).not.toEqual(snapshots.de);
      expect(snapshots.tr).not.toEqual(snapshots.en);
    });
  });

  test.describe('Area C: Theme Switching', () => {
    test('T1-THEME-01: Default theme-obsidian on boot', async ({ page }) => {
      await openApp(page, '/');
      const state = await page.evaluate(() => {
        const hasObsidian =
          document.documentElement.classList.contains('theme-obsidian') ||
          Boolean(document.querySelector('.theme-obsidian'));
        const bg = getComputedStyle(document.body).backgroundColor;
        const m = bg.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
        const luminance = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
        return { hasObsidian, bg, luminance };
      });
      expect(state.hasObsidian).toBe(true);
      expect(state.luminance).toBeLessThan(0.2);
    });

    test('T1-THEME-02: Switch to theme-limestone', async ({ page }) => {
      await openApp(page, '/');
      await switchTheme(page, 'limestone');
      const state = await page.evaluate(() => {
        const bg = getComputedStyle(document.body).backgroundColor;
        const m = bg.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
        const luminance = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
        return { bg, luminance };
      });
      expect(state.luminance).toBeGreaterThan(0.65);
    });

    test('T1-THEME-03: Switch to theme-emerald-club', async ({ page }) => {
      await openApp(page, '/');
      await switchTheme(page, 'limestone');
      const limestoneBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

      await switchTheme(page, 'emerald-club');
      const emeraldState = await page.evaluate(() => ({
        bg: getComputedStyle(document.body).backgroundColor,
        brand: getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim(),
      }));
      expect(emeraldState.bg).not.toEqual(limestoneBg);
      expect(emeraldState.brand).not.toBe('');
    });

    test('T1-THEME-04: Round-trip back to theme-obsidian', async ({ page }) => {
      await openApp(page, '/');
      const initialBg = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--bg-main').trim()
      );
      await switchTheme(page, 'emerald-club');
      await switchTheme(page, 'obsidian');
      const restoredBg = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--bg-main').trim()
      );
      expect(restoredBg).toEqual(initialBg);
    });

    test('T1-THEME-05: Visual contrast & token consistency across all 3 themes', async ({ page }) => {
      await openApp(page, '/');
      for (const theme of ['obsidian', 'limestone', 'emerald-club'] as const) {
        await switchTheme(page, theme);
        const tokens = await page.evaluate(() => {
          const rootStyle = getComputedStyle(document.documentElement);
          const bodyStyle = getComputedStyle(document.body);
          const receiptEl = document.querySelector('#rechner-summary');
          const receiptStyle = receiptEl ? getComputedStyle(receiptEl) : null;
          return {
            bgMain: rootStyle.getPropertyValue('--bg-main').trim(),
            textPrimary: rootStyle.getPropertyValue('--text-primary').trim(),
            brandPrimary: rootStyle.getPropertyValue('--brand-primary').trim(),
            receiptBg: rootStyle.getPropertyValue('--receipt-bg').trim(),
            bodyColor: bodyStyle.color,
            bodyBg: bodyStyle.backgroundColor,
            receiptColor: receiptStyle?.color ?? '',
            receiptBgComputed: receiptStyle?.backgroundColor ?? '',
          };
        });

        expect(tokens.bgMain).not.toBe('');
        expect(tokens.textPrimary).not.toBe('');
        expect(tokens.brandPrimary).not.toBe('');
        expect(tokens.bodyColor).not.toEqual(tokens.bodyBg);
        expect(tokens.receiptColor).not.toEqual(tokens.receiptBgComputed);
      }
    });
  });

  test.describe('Area D: Hero, Gallery, Production Bento & Corporate FAQ', () => {
    test('T1-CONTENT-01: IntroSplash dismissal & replay', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await dismissSplash(page);
      const heroCta = page.locator('#hero a[href="#rechner"], #hero button').first();
      await expect(heroCta).toBeVisible();

      const replayBtn = page.getByRole('button', { name: /intro|replay/i }).first();
      if ((await replayBtn.count()) > 0 && (await replayBtn.isVisible())) {
        await replayBtn.click();
        await dismissSplash(page);
      }
      await expect(heroCta).toBeVisible();
    });

    test('T1-CONTENT-02: Hero stage switcher (Live-Station vs Club-Trailer)', async ({ page }) => {
      await openApp(page, '/');
      const hero = page.locator('#hero');
      const img = hero.locator('img').first();
      const firstSrc = await img.getAttribute('src');

      const trailerBtn = hero.getByRole('button', { name: /trailer/i }).first();
      const stationBtn = hero.getByRole('button', { name: /station/i }).first();
      await trailerBtn.click();
      await expect(img).not.toHaveAttribute('src', firstSrc ?? '');
      await waitForImgLoaded(img, 'hero trailer img');

      await stationBtn.click();
      await expect(img).toHaveAttribute('src', firstSrc ?? '');
      await waitForImgLoaded(img, 'hero station img');
    });

    test('T1-CONTENT-03: Header navigation & Hero CTA scroll/links', async ({ page }) => {
      const monitors = await openApp(page, '/');
      for (const sectionId of ['#rechner', '#galerie', '#produktion', '#faq']) {
        const navLink = page.locator(`header a[href="${sectionId}"]`).first();
        if ((await navLink.count()) > 0 && (await navLink.isVisible())) {
          await navLink.click();
        } else {
          await page.locator(sectionId).scrollIntoViewIfNeeded();
        }
        await expect(page.locator(sectionId)).toBeVisible();
      }
      monitors.assertClean();
    });

    test('T1-CONTENT-04: Gallery 4-slide carousel Prev/Next controls', async ({ page }) => {
      await openApp(page, '/');
      const gallery = page.locator('#galerie');
      await gallery.scrollIntoViewIfNeeded();

      await expect(gallery).toContainText(/1\s*\/\s*4/);
      const nextBtn = gallery
        .getByRole('button', { name: /next|nächste|vor|weiter|sonraki|ileri/i })
        .first();
      const prevBtn = gallery
        .getByRole('button', { name: /prev|zurück|vorher|önceki|geri/i })
        .first();

      await nextBtn.click();
      await expect(gallery).toContainText(/2\s*\/\s*4/);
      await nextBtn.click();
      await expect(gallery).toContainText(/3\s*\/\s*4/);
      await nextBtn.click();
      await expect(gallery).toContainText(/4\s*\/\s*4/);
      await nextBtn.click();
      await expect(gallery).toContainText(/1\s*\/\s*4/);
      await prevBtn.click();
      await expect(gallery).toContainText(/4\s*\/\s*4/);
    });

    test('T1-CONTENT-05: Gallery indicator dots direct navigation', async ({ page }) => {
      await openApp(page, '/');
      const gallery = page.locator('#galerie');
      await gallery.scrollIntoViewIfNeeded();

      const dots = gallery.locator('[data-testid^="gallery-dot-"], [role="tablist"] button, button[aria-label*="Slide" i], button[aria-label*="Folie" i], button[aria-label*="Slayt" i]');
      expect(await dots.count()).toBeGreaterThanOrEqual(4);

      for (const idx of [2, 0, 3, 1]) {
        await dots.nth(idx).click();
        await expect(gallery).toContainText(new RegExp(`${idx + 1}\\s*/\\s*4`));
      }
    });

    test('T1-CONTENT-06: Production Bento #produktion cards', async ({ page }) => {
      await openApp(page, '/');
      const bento = page.locator('#produktion');
      await bento.scrollIntoViewIfNeeded();
      await expect(bento).toBeVisible();
      const cardCount = await bento.locator('article, [data-testid^="bento-card"]').count();
      expect(cardCount).toBeGreaterThanOrEqual(3);
      await expect(bento).toContainText(/Halal|EG|EU/i);
    });

    test('T1-CONTENT-07: Corporate FAQ #faq accordion interaction', async ({ page }) => {
      await openApp(page, '/');
      const faq = page.locator('#faq');
      await faq.scrollIntoViewIfNeeded();
      const triggers = faq.locator('button[aria-expanded]');
      const count = await triggers.count();
      expect(count).toBeGreaterThanOrEqual(4);

      const first = triggers.first();
      const initialExpanded = await first.getAttribute('aria-expanded');
      await first.click();
      const toggled = await first.getAttribute('aria-expanded');
      expect(toggled).not.toEqual(initialExpanded);

      await triggers.nth(1).click();
      await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('Area E: Calculator Controls & Live Receipt', () => {
    test('T1-CALC-01: Default calculator state & exact receipt totals', async ({ page }) => {
      await openApp(page, '/');
      const vec = REFERENCE_VECTORS[0];
      await expect(page.locator('[data-testid="guest-input"]')).toHaveValue('120');

      const receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, vec.expectedSubtotalNet, 0.01, 'default net');
      expectEuroClose(receipt.vat, vec.expectedVatAmount, 0.01, 'default vat');
      expectEuroClose(receipt.gross, vec.expectedTotalGross, 0.01, 'default gross');
      expectEuroClose(receipt.perGuest, vec.expectedPerGuestNet, 0.01, 'default perGuest');
      await expect(page.locator('#rechner')).toContainText(/5\s*%/);
    });

    test('T1-CALC-02: Stepper -10 and +10 guest controls', async ({ page }) => {
      await openApp(page, '/');
      await page.locator('[data-testid="guest-plus"]').click();
      await expect(page.locator('[data-testid="guest-input"]')).toHaveValue('130');
      await expect(page.locator('[data-testid="guest-slider"]')).toHaveValue('130');

      let receipt = await readReceiptSummary(page);
      const q130 = calculateExpectedQuote({
        guests: 130,
        meatId: 'scheiben',
        setupId: 'station',
        extras: { bread_salad: true, drinks: true, dessert: false },
      });
      expectEuroClose(receipt.net, q130.subtotalNet, 0.01, '130 net');

      await page.locator('[data-testid="guest-minus"]').click();
      await page.locator('[data-testid="guest-minus"]').click();
      await expect(page.locator('[data-testid="guest-input"]')).toHaveValue('110');
      receipt = await readReceiptSummary(page);
      const q110 = calculateExpectedQuote({
        guests: 110,
        meatId: 'scheiben',
        setupId: 'station',
        extras: { bread_salad: true, drinks: true, dessert: false },
      });
      expectEuroClose(receipt.net, q110.subtotalNet, 0.01, '110 net');
    });

    test('T1-CALC-03: Guest slider & direct numeric input sync', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaSlider(page, 250);
      await expect(page.locator('[data-testid="guest-input"]')).toHaveValue('250');

      await setGuestsViaInput(page, 300);
      await expect(page.locator('[data-testid="guest-slider"]')).toHaveValue('300');
      await expect(page.locator('#rechner')).toContainText(/10\s*%/);

      const receipt = await readReceiptSummary(page);
      const q300 = calculateExpectedQuote({
        guests: 300,
        meatId: 'scheiben',
        setupId: 'station',
        extras: { bread_salad: true, drinks: true, dessert: false },
      });
      expectEuroClose(receipt.net, q300.subtotalNet, 0.01, '300 net');
      expectEuroClose(receipt.gross, q300.totalGross, 0.01, '300 gross');
    });

    test('T1-CALC-04: Volume discount tiers (0%, 5%, 10%, 15%)', async ({ page }) => {
      await openApp(page, '/');
      const cases = [
        { guests: 60, expectedUnit: 21.0 },
        { guests: 150, expectedUnit: 19.95 },
        { guests: 300, expectedUnit: 18.9 },
        { guests: 550, expectedUnit: 17.85 },
      ] as const;

      for (const c of cases) {
        await setGuestsViaInput(page, c.guests);
        const cardPrice = await readCardEuroPrice(page, 'meat-scheiben');
        expectEuroClose(cardPrice, c.expectedUnit, 0.01, `scheiben @ ${c.guests}`);
      }
    });

    test('T1-CALC-05: All 5 spit selections (scheiben, kalb, chicken, duo, vegan)', async ({
      page,
    }) => {
      await openApp(page, '/');

      for (const meatId of ['scheiben', 'kalb', 'chicken', 'duo'] as const) {
        await selectMeat(page, meatId);
        const receipt = await readReceiptSummary(page);
        const oracle = calculateExpectedQuote({
          guests: 120,
          meatId,
          setupId: 'station',
          extras: { bread_salad: true, drinks: true, dessert: false },
        });
        expectEuroClose(receipt.net, oracle.subtotalNet, 0.01, `${meatId} @ 120 net`);
      }

      // Dynamic vegan unit price discovery at 0% tier (60 guests), then check at 120 guests (5% tier)
      await setGuestsViaInput(page, 60);
      const veganBasePrice = await readCardEuroPrice(page, 'meat-vegan');
      await setGuestsViaInput(page, 120);
      await selectMeat(page, 'vegan');

      const veganReceipt = await readReceiptSummary(page);
      const veganOracle = calculateExpectedQuote({
        guests: 120,
        meatId: 'vegan',
        setupId: 'station',
        extras: { bread_salad: true, drinks: true, dessert: false },
        veganUnitPrice: veganBasePrice,
      });
      expectEuroClose(veganReceipt.net, veganOracle.subtotalNet, 0.02, 'vegan @ 120 net');
      expectEuroClose(veganReceipt.gross, veganOracle.totalGross, 0.02, 'vegan @ 120 gross');
    });

    test('T1-CALC-06: All 3 setup selections (station, truck, buffet)', async ({ page }) => {
      await openApp(page, '/');
      for (const setupId of ['station', 'truck', 'buffet'] as const) {
        await selectSetup(page, setupId);
        const receipt = await readReceiptSummary(page);
        const oracle = calculateExpectedQuote({
          guests: 120,
          meatId: 'scheiben',
          setupId,
          extras: { bread_salad: true, drinks: true, dessert: false },
        });
        expectEuroClose(receipt.net, oracle.subtotalNet, 0.01, `${setupId} net`);
        expectEuroClose(receipt.gross, oracle.totalGross, 0.01, `${setupId} gross`);
      }
    });

    test('T1-CALC-07: All 3 per-guest extras toggles', async ({ page }) => {
      await openApp(page, '/');
      await setExtra(page, 'dessert', true);
      let receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, 4024.0, 0.01, 'all 3 extras net');

      await setExtra(page, 'bread_salad', false);
      receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, 3604.0, 0.01, 'drinks + dessert net');

      await setExtra(page, 'drinks', false);
      receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, 3064.0, 0.01, 'dessert only net');
    });

    test('T1-CALC-08: Live Receipt metadata, DCC quote reference & direct WhatsApp', async ({
      page,
    }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      const summaryText = await page.locator('#rechner-summary').innerText();
      expect(summaryText).toMatch(/DCC-/i);
      expect(summaryText).not.toMatch(/MV-|MEVA|DEMO/i);

      const waTrigger = await pickVisible(page.locator('[data-testid="quote-whatsapp"]'));
      const wa = await captureWhatsAppAction(page, waTrigger);
      expect(wa.triggered).toBe(true);
      expect(wa.url).toMatch(/^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//i);
      const parsed = new URL(wa.url!);
      const text = parsed.searchParams.get('text') ?? '';
      expect(text).toContain('120');
      expect(text).toMatch(/DCC|Döner Catering Club/i);
      expect(text).not.toMatch(DEMO_LEAK_RE);
    });

    test('T1-CALC-09: Sticky summary glides with scroll and remains fully in viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 780 });
      await openApp(page, '/');

      const gridTop = await page.locator('.dcc-configurator-grid').evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY;
      });

      for (const offset of [gridTop + 120, gridTop + 520]) {
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }),
          offset
        );
        await page.waitForTimeout(100);
        const box = await page.locator('#rechner-summary').boundingBox();
        expect(box, `Summary box missing at y=${offset}`).not.toBeNull();
        expect(box!.y, `Summary top out of sticky range at y=${offset}`).toBeGreaterThanOrEqual(60);
        expect(box!.y, `Summary did not stick near top at y=${offset}`).toBeLessThanOrEqual(115);
        expect(
          box!.y + box!.height,
          `Summary bottom clipped at y=${offset} (${box!.y + box!.height} > 780)`
        ).toBeLessThanOrEqual(780);
      }
    });
  });

  test.describe('Area F: Receipt & Quote Modal', () => {
    test('T1-MODAL-01: Open Quote Modal with synchronized KPIs', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 200);
      await selectMeat(page, 'kalb');
      await selectSetup(page, 'truck');
      await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

      const receipt = await readReceiptSummary(page);
      const modal = await openQuoteModal(page);
      await expect(modal).toHaveAttribute('aria-modal', 'true');
      const modalText = await modal.innerText();
      expect(modalText).toContain('200');
      expect(parseEuro(modalText.match(/[\d.,]+\s*€|€\s*[\d.,]+/)?.[0] ?? '')).toBeGreaterThan(0);
      expect(modalText.replace(/[.,\s]/g, '')).toContain(String(Math.trunc(receipt.net)));
    });

    test('T1-MODAL-02: Close Quote Modal preserves calculator state', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 200);
      await selectMeat(page, 'kalb');
      await selectSetup(page, 'truck');

      const modal = await openQuoteModal(page);

      const closeBtn = modal.getByRole('button', { name: /close|schließen|kapat|×/i }).first();
      await closeBtn.click();
      await expect(modal).toBeHidden();

      await openQuoteModal(page);
      await expect(modal).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();

      await expect(page.locator('[data-testid="guest-input"]')).toHaveValue('200');
    });

    test('T1-MODAL-03: Valid form submission & WhatsApp URL encoding', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');

      const modal = await openQuoteModal(page);

      const futureDate = computeFutureDateIso(30);
      await locateModalField(modal, 'name').fill('Max Mustermann');
      const companyField = locateModalField(modal, 'company');
      if ((await companyField.count()) > 0) await companyField.fill('Berlin Tech GmbH');
      await locateModalField(modal, 'email').fill('max@berlintech.de');
      await locateModalField(modal, 'phone').fill('+49 30 1234567');
      await locateModalField(modal, 'date').fill(futureDate);
      const vatField = locateModalField(modal, 'vatId');
      if ((await vatField.count()) > 0) await vatField.fill('DE123456789');

      const waTrigger = modal
        .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
        .filter({ hasText: /whatsapp/i })
        .first();
      const result = await triggerAndCaptureWhatsApp(page, waTrigger);
      expect(result.triggered, 'Expected valid Quote Modal WhatsApp submission to fire').toBe(true);
      expect(result.url).toMatch(/^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//i);

      const text = new URL(result.url!).searchParams.get('text') ?? '';
      expect(text).toContain('Max Mustermann');
      expect(text).toContain('max@berlintech.de');
      expect(text).toContain(futureDate);
      expect(text).not.toMatch(DEMO_LEAK_RE);
    });

    test('T1-MODAL-04: Copy Quote to Clipboard with localized feedback', async ({ page }) => {
      await openApp(page, '/');
      const modal = await openQuoteModal(page);

      await locateModalField(modal, 'name').fill('Max Mustermann');
      await locateModalField(modal, 'email').fill('max@berlintech.de');
      await locateModalField(modal, 'phone').fill('+49 30 1234567');
      await locateModalField(modal, 'date').fill(computeFutureDateIso(25));

      const copyBtn = modal
        .locator('[data-testid="modal-copy"], button')
        .filter({ hasText: /kopier|copy|kopyala/i })
        .first();
      await copyBtn.click();

      await expect(modal).toContainText(/kopiert|copied|kopyalandı/i);
      const clipText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipText).toMatch(/DCC|Döner Catering Club/i);
      expect(clipText).toContain('120');
      expect(clipText).not.toMatch(DEMO_LEAK_RE);
    });

    test('T1-MODAL-05: Print Quote trigger availability & invocation', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');

      const modal = await openQuoteModal(page);
      const printBtn = modal
        .locator('[data-testid="modal-print"], button')
        .filter({ hasText: /druck|print|yazdır/i })
        .first();

      await expect(printBtn).toBeVisible();
      await expect(printBtn).toBeEnabled();
      await printBtn.click();

      const printCount = await page.evaluate(
        () => (window as unknown as { __printCalled?: number }).__printCalled ?? 0
      );
      expect(printCount).toBe(1);
    });

    test('T1-MODAL-06: Direct Receipt WhatsApp button reactivity (quote-whatsapp)', async ({
      page,
    }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      await setGuestsViaInput(page, 150);
      await selectMeat(page, 'chicken');

      const waTrigger = await pickVisible(page.locator('[data-testid="quote-whatsapp"]'));
      const wa = await captureWhatsAppAction(page, waTrigger);
      expect(wa.triggered).toBe(true);
      expect(wa.url).toMatch(/^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//i);
      const decoded = new URL(wa.url!).searchParams.get('text') ?? '';
      expect(decoded).toContain('150');
      expect(decoded).toMatch(/chicken|hähnchen|tavuk/i);
    });
  });

  test.describe('Area G: Brand Kit Portal', () => {
    test('T1-BRANDKIT-01: Brand Kit Portal navigation (#brand-kit & ?view=brand-kit)', async ({
      page,
    }) => {
      const monitors = await openApp(page, '/');
      const link = await pickVisible(
        page.locator('a[href*="brand-kit"]:visible'),
        page.locator('a[href*="brand-kit"], button[data-testid*="brand-kit"]')
      );
      await link.scrollIntoViewIfNeeded().catch(() => {});
      await link.click();
      const portal = page.locator('#brand-kit');
      await expect(portal).toBeVisible();

      await openApp(page, '/?view=brand-kit');
      await expect(page.locator('#brand-kit')).toBeVisible();
      monitors.assertClean();
    });

    test('T1-BRANDKIT-02: Brand Kit DE / EN / TR live translation', async ({ page }) => {
      await openApp(page, '/?view=brand-kit');
      const portal = page.locator('#brand-kit');
      await expect(portal).toBeVisible();

      const deText = await portal.innerText();
      await switchLocale(page, 'en');
      const enText = await portal.innerText();
      await switchLocale(page, 'tr');
      const trText = await portal.innerText();

      expect(enText).not.toEqual(deText);
      expect(trText).not.toEqual(enText);
      expect(trText).toMatch(/[ğüşiöçİĞÜŞÖÇ]/);
    });

    test('T1-BRANDKIT-03: Brand Kit Logo Pack previews & downloads', async ({ page, request }) => {
      await openApp(page, '/?view=brand-kit');
      const portal = page.locator('#brand-kit');
      const imgs = portal.locator('img');
      const imgCount = await imgs.count();
      expect(imgCount).toBeGreaterThanOrEqual(4);
      for (let i = 0; i < imgCount; i += 1) {
        await waitForImgLoaded(imgs.nth(i), `Brand kit image #${i}`);
      }

      const downloads = portal.locator('a[download], a[href$=".svg"], a[href$=".png"]');
      const dlCount = await downloads.count();
      expect(dlCount).toBeGreaterThanOrEqual(4);
      for (let i = 0; i < dlCount; i += 1) {
        const href = await downloads.nth(i).getAttribute('href');
        if (!href) continue;
        const res = await request.get(href);
        expect(res.status(), `Broken Brand Kit download: ${href}`).toBe(200);
      }
    });

    test('T1-BRANDKIT-04: Color & Typography token copy interaction', async ({ page }) => {
      await openApp(page, '/?view=brand-kit');
      const portal = page.locator('#brand-kit');
      const copyBtn = portal
        .locator('[data-testid^="copy-token"], button')
        .filter({ hasText: /#[0-9a-f]{6}|obsidian|ember|kopier|copy/i })
        .first();
      await copyBtn.click();

      const clipText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipText).toMatch(/#[0-9a-f]{6}|--[a-z-]+/i);
    });

    test('T1-BRANDKIT-05: Brand Applications & Do/Dont visual plates', async ({ page }) => {
      await openApp(page, '/?view=brand-kit');
      const portal = page.locator('#brand-kit');
      await expect(portal).toContainText(/Do|Don't|Richtig|Falsch|Doğru|Yanlış/i);
      const imgs = portal.locator('img');
      const count = await imgs.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i += 1) {
        await waitForImgLoaded(imgs.nth(i), `Brand kit plate #${i}`);
      }
    });

    test('T1-BRANDKIT-06: Standalone brand-kit files & brand-kit.html integrity', async ({
      page,
    }) => {
      const root = process.cwd();
      const guidelinesPath = path.join(root, 'brand-kit', 'BRAND_GUIDELINES.md');
      const tokensPath = path.join(root, 'brand-kit', 'tokens.json');
      const htmlPath = path.join(root, 'brand-kit', 'brand-kit.html');

      expect(existsSync(guidelinesPath), 'Missing brand-kit/BRAND_GUIDELINES.md').toBe(true);
      expect(existsSync(tokensPath), 'Missing brand-kit/tokens.json').toBe(true);
      expect(existsSync(htmlPath), 'Missing brand-kit/brand-kit.html').toBe(true);

      const md = readFileSync(guidelinesPath, 'utf8');
      expect(md).toMatch(/[äöüß]/i);
      expect(md).toMatch(/[ğüşiöçİĞÜŞÖÇ]/);
      expect(md).not.toMatch(DEMO_LEAK_RE);

      const tokens = JSON.parse(readFileSync(tokensPath, 'utf8')) as Record<string, unknown>;
      expect(Object.keys(tokens).length).toBeGreaterThan(0);

      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
      const brokenCount = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).filter(
          (img) => !img.complete || img.naturalWidth === 0
        ).length;
      });
      expect(brokenCount).toBe(0);
    });
  });

  test.describe('Area H: Legal Modals & Footer', () => {
    test('T1-LEGAL-01: Footer structure & zero dead anchor links', async ({ page }) => {
      await openApp(page, '/');
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toContainText(/DCC|Döner Catering Club/i);
      await expect(footer.locator('a[href="#impressum"], button').filter({ hasText: /impressum|imprint|künye/i }).first()).toBeVisible();
      await expect(footer.locator('a[href="#datenschutz"], button').filter({ hasText: /datenschutz|privacy|gizlilik/i }).first()).toBeVisible();
      await expect(footer.locator('a[href="#ifs"], button').filter({ hasText: /ifs|hygiene|hijyen|halal/i }).first()).toBeVisible();
    });

    test('T1-LEGAL-02: #impressum modal opens with real legal content', async ({ page }) => {
      await openApp(page, '/');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.locator('a[href="#impressum"], button').filter({ hasText: /impressum|imprint|künye/i }).first().click();

      const modal = page.getByRole('dialog').first();
      await expect(modal).toBeVisible();
      const text = await modal.innerText();
      expect(text).toMatch(/DCC Döner Catering Club/i);
      expect(text).toMatch(/Berlin/i);
      expect(text).not.toMatch(DEMO_LEAK_RE);
    });

    test('T1-LEGAL-03: #datenschutz modal opens with real GDPR content', async ({ page }) => {
      await openApp(page, '/');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.locator('a[href="#datenschutz"], button').filter({ hasText: /datenschutz|privacy|gizlilik/i }).first().click();

      const modal = page.getByRole('dialog').first();
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/DSGVO|GDPR|KVKK|WhatsApp/i);
    });

    test('T1-LEGAL-04: #ifs modal opens with Hygiene / Halal / IFS content', async ({ page }) => {
      await openApp(page, '/');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.locator('a[href="#ifs"], button').filter({ hasText: /ifs|hygiene|hijyen|halal/i }).first().click();

      const modal = page.getByRole('dialog').first();
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(/Halal|IFS|HACCP|Kühlkette|Cold/i);
    });

    test('T1-LEGAL-05: Legal modals respond in DE, EN, and TR', async ({ page }) => {
      await openApp(page, '/');

      await switchLocale(page, 'en');
      await page.locator('a[href="#impressum"], button').filter({ hasText: /impressum|imprint|legal notice/i }).first().click();
      let modal = page.getByRole('dialog').first();
      await expect(modal).toBeVisible();
      const enModalText = await modal.innerText();
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();

      await switchLocale(page, 'tr');
      await page.locator('a[href="#datenschutz"], button').filter({ hasText: /datenschutz|privacy|gizlilik/i }).first().click();
      modal = page.getByRole('dialog').first();
      await expect(modal).toBeVisible();
      const trModalText = await modal.innerText();
      expect(trModalText).not.toEqual(enModalText);
      expect(trModalText).toMatch(/[ğüşiöçİĞÜŞÖÇ]/);
      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();
    });
  });
});
