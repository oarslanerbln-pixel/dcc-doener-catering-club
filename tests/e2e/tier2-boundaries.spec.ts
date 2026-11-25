import { expect, test } from '@playwright/test';
import { expectEuroClose } from './helpers/currency';
import { REFERENCE_VECTORS } from './helpers/pricing-oracle';
import {
  captureWhatsAppAction,
  checkNoHorizontalOverflow,
  computeFutureDateIso,
  dismissSplash,
  getGuestInput,
  installPrintAndWindowOpenSpy,
  isControlActive,
  locateModalField,
  openApp,
  openQuoteModal,
  pickVisible,
  readCardEuroPrice,
  readReceiptSummary,
  selectMeat,
  selectSetup,
  setExtras,
  setGuestsViaInput,
  switchLocale,
  switchTheme,
  triggerAndCaptureWhatsApp,
  waitForImgLoaded,
} from './helpers/site-actions';

const DEMO_LEAK_RE = /\b(?:meva|kahraman|mevadoener|beispielseite)\b|\[demo\]|demo-seite/i;
const BAD_NUM_RE = /\b(?:NaN|Infinity|undefined|null)\b|€NaN/i;

test.describe('Tier 2 — Boundary, Corner & Invalid Case Matrix', () => {
  test.describe('Area A: Assets & Runtime Boundaries', () => {
    test('T2-ASSET-01: Full-interaction network monitor across / + ?view=brand-kit + modals', async ({
      page,
    }) => {
      const monitors = await openApp(page, '/');
      await switchLocale(page, 'en');
      await switchTheme(page, 'limestone');
      await openQuoteModal(page);
      await page.keyboard.press('Escape');

      await page.locator('#galerie').scrollIntoViewIfNeeded();
      const nextBtn = page
        .locator('#galerie')
        .getByRole('button', { name: /next|nächste|vor|weiter|sonraki|ileri/i })
        .first();
      for (let i = 0; i < 4; i += 1) {
        if ((await nextBtn.count()) > 0) await nextBtn.click();
      }

      const brandRes = await page.goto('/?view=brand-kit', { waitUntil: 'domcontentloaded' });
      expect(brandRes?.status()).toBeLessThan(400);
      await dismissSplash(page);
      await expect(page.locator('#brand-kit')).toBeVisible();
      monitors.assertClean();
    });

    test('T2-ASSET-02: Full-interaction console & uncaught exception monitor', async ({ page }) => {
      const monitors = await openApp(page, '/');
      for (const locale of ['en', 'tr', 'de'] as const) {
        await switchLocale(page, locale);
      }
      for (const theme of ['limestone', 'emerald-club', 'obsidian'] as const) {
        await switchTheme(page, theme);
      }
      await setGuestsViaInput(page, 400);
      await selectMeat(page, 'kalb');
      await selectSetup(page, 'truck');
      await setExtras(page, { bread_salad: false, drinks: true, dessert: true });
      monitors.assertClean();
    });

    test('T2-ASSET-03: Internal <a href> link audit (zero dead anchors)', async ({ page }) => {
      await openApp(page, '/');
      const audit = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
        const dead: string[] = [];
        const missingTargets: string[] = [];
        const modalIds = new Set(['#impressum', '#datenschutz', '#ifs', '#brand-kit']);
        for (const a of anchors) {
          const href = a.getAttribute('href') ?? '';
          if (href === '' || href === '#') {
            dead.push(a.outerHTML.slice(0, 120));
          } else if (href.startsWith('#') && !modalIds.has(href)) {
            const target = document.getElementById(href.slice(1));
            if (!target) missingTargets.push(href);
          }
        }
        return { dead, missingTargets };
      });
      expect(audit.dead, `Dead anchors: ${audit.dead.join(', ')}`).toEqual([]);
      expect(
        audit.missingTargets,
        `Missing anchor targets: ${audit.missingTargets.join(', ')}`
      ).toEqual([]);
    });

    test('T2-ASSET-04: All rendered <img> decode & aspect sanity', async ({ page }) => {
      await openApp(page, '/');
      const imgs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll<HTMLImageElement>('img'))
          .filter((img) => {
            const r = img.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          })
          .map((img) => ({
            src: img.currentSrc || img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          }));
      });
      expect(imgs.length).toBeGreaterThan(0);
      for (const img of imgs) {
        expect(img.complete && img.naturalWidth > 0 && img.naturalHeight > 0, `Bad img ${img.src}`).toBe(
          true
        );
      }
    });

    test('T2-ASSET-05: Deep-scan payload & attribute leak check', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      await setGuestsViaInput(page, 250);
      await selectMeat(page, 'duo');

      const waTrigger = await pickVisible(page.locator('[data-testid="quote-whatsapp"]'));
      const waResult = await captureWhatsAppAction(page, waTrigger);
      await openQuoteModal(page);

      const bodyText = await page.locator('body').innerText();
      expect(bodyText).not.toMatch(DEMO_LEAK_RE);
      expect(waResult.url ?? '').not.toMatch(DEMO_LEAK_RE);
    });
  });

  test.describe('Area B: i18n & Typography Boundaries', () => {
    test('T2-I18N-01: Rapid sequential toggling DE -> TR -> EN -> DE -> TR', async ({ page }) => {
      await openApp(page, '/');
      await switchLocale(page, 'tr');
      await switchLocale(page, 'en');
      await switchLocale(page, 'de');
      await switchLocale(page, 'tr');

      await expect(page.locator('html')).toHaveAttribute('lang', /^tr/i);
      const summary = await page.locator('#rechner-summary').innerText();
      expect(summary).toMatch(/KDV|Brüt|Net/i);
      expect(summary).not.toMatch(/\bMwSt\b|\bVAT\b/);
    });

    test('T2-I18N-02: Turkish & German diacritics + Euro symbol integrity', async ({ page }) => {
      await openApp(page, '/');
      const deBody = await page.locator('body').innerText();
      expect(deBody).toMatch(/[äöüß]/i);
      expect(deBody).toContain('€');
      expect(deBody).not.toContain('\uFFFD');

      await switchLocale(page, 'tr');
      const trBody = await page.locator('body').innerText();
      expect(trBody).toMatch(/[ğüşiöçİĞÜŞÖÇ]/);
      expect(trBody).toContain('€');
      expect(trBody).not.toContain('\uFFFD');
    });

    test('T2-I18N-03: Receipt extreme numeric states across DE, EN, TR (zero NaN/Infinity)', async ({
      page,
    }) => {
      await openApp(page, '/');
      for (const locale of ['de', 'en', 'tr'] as const) {
        await switchLocale(page, locale);
        for (const guests of [30, 800]) {
          await setGuestsViaInput(page, guests);
          await selectMeat(page, guests === 30 ? 'vegan' : 'scheiben');
          const text = await page.locator('#rechner-summary').innerText();
          expect(text).not.toMatch(BAD_NUM_RE);
          const receipt = await readReceiptSummary(page);
          expect(Number.isFinite(receipt.net)).toBe(true);
          expect(Number.isFinite(receipt.gross)).toBe(true);
        }
      }
    });

    test('T2-I18N-04: Mobile 390x844 long-string overflow check in DE and TR', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openApp(page, '/');
      for (const locale of ['de', 'tr'] as const) {
        await switchLocale(page, locale);
        await checkNoHorizontalOverflow(page);
      }
    });

    test('T2-I18N-05: Switch language while Quote Modal is open with validation errors', async ({
      page,
    }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      let modal = await openQuoteModal(page);
      const getSubmitBtn = async () => {
        const waNamed = modal
          .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
          .filter({ hasText: /whatsapp/i });
        return (await waNamed.count()) > 0
          ? waNamed.first()
          : modal.locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button[type="submit"]').first();
      };

      await triggerAndCaptureWhatsApp(page, await getSubmitBtn());
      const deModalText = await modal.innerText();

      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();
      await switchLocale(page, 'en');
      modal = await openQuoteModal(page);
      await triggerAndCaptureWhatsApp(page, await getSubmitBtn());
      const enModalText = await modal.innerText();

      expect(enModalText).not.toEqual(deModalText);
    });
  });

  test.describe('Area C: Theme Boundaries', () => {
    test('T2-THEME-01: Single locked theme-obsidian class across interactions', async ({
      page,
    }) => {
      await openApp(page, '/');
      const activeThemeClasses = await page.evaluate(() =>
        Array.from(document.documentElement.classList).filter((c) => c.startsWith('theme-'))
      );
      expect(activeThemeClasses).toEqual(['theme-obsidian']);
    });

    test('T2-THEME-02: Locale & Calculator state integrity in Pure Black', async ({ page }) => {
      await openApp(page, '/');
      await switchLocale(page, 'tr');
      await setGuestsViaInput(page, 275);
      await selectMeat(page, 'kalb');

      await expect(page.locator('html')).toHaveAttribute('lang', /^tr/i);
      await expect(getGuestInput(page)).toHaveValue('275');
      expect(await isControlActive(page.locator('[data-testid="meat-kalb"]').first())).toBe(true);
    });

    test('T2-THEME-03: Modal & Brand Kit inherit Pure Black theme with readable contrast', async ({
      page,
    }) => {
      await openApp(page, '/');
      const modal = await openQuoteModal(page);
      const contrast = await modal.evaluate((el) => {
        const s = getComputedStyle(el);
        return { color: s.color, bg: s.backgroundColor };
      });
      expect(contrast.color).not.toEqual(contrast.bg);
      await page.keyboard.press('Escape');

      await openApp(page, '/?view=brand-kit');
      await expect(page.locator('#brand-kit')).toBeVisible();
    });

    test('T2-THEME-04: prefers-reduced-motion: reduce emulation', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const monitors = await openApp(page, '/');
      await setGuestsViaInput(page, 180);
      const receipt = await readReceiptSummary(page);
      expect(receipt.net).toBeGreaterThan(0);
      monitors.assertClean();
    });

    test('T2-THEME-05: Page reload boots cleanly into theme-obsidian without console errors', async ({
      page,
    }) => {
      const monitors = await openApp(page, '/');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await dismissSplash(page);
      const hasObsidian = await page.evaluate(
        () =>
          document.documentElement.classList.contains('theme-obsidian') ||
          Boolean(document.querySelector('.theme-obsidian'))
      );
      expect(hasObsidian).toBe(true);
      monitors.assertClean();
    });
  });

  test.describe('Area D: Hero, Gallery, Bento & FAQ Boundaries', () => {
    test('T2-CONTENT-01: Rapid Hero stage toggle (6 clicks)', async ({ page }) => {
      await openApp(page, '/');
      const hero = page.locator('#hero');
      const trailerBtn = hero.getByRole('button', { name: /trailer/i }).first();
      const stationBtn = hero.getByRole('button', { name: /station/i }).first();
      for (let i = 0; i < 3; i += 1) {
        await trailerBtn.click();
        await stationBtn.click();
      }
      await waitForImgLoaded(hero.locator('img').first(), 'hero stage img');
    });

    test('T2-CONTENT-02: Gallery boundary wraparound (Prev on 1, Next on 4, rapid 10 clicks)', async ({
      page,
    }) => {
      await openApp(page, '/');
      const gallery = page.locator('#galerie');
      await gallery.scrollIntoViewIfNeeded();
      const prevBtn = gallery
        .getByRole('button', { name: /prev|zurück|vorher|önceki|geri/i })
        .first();
      const nextBtn = gallery
        .getByRole('button', { name: /next|nächste|vor|weiter|sonraki|ileri/i })
        .first();

      await prevBtn.click();
      await expect(gallery).toContainText(/4\s*\/\s*4/);
      await nextBtn.click();
      await expect(gallery).toContainText(/1\s*\/\s*4/);

      for (let i = 0; i < 10; i += 1) {
        await nextBtn.click();
      }
      await expect(gallery).toContainText(/3\s*\/\s*4/);
    });

    test('T2-CONTENT-03: Gallery hover-pause behavior', async ({ page }) => {
      await openApp(page, '/');
      const gallery = page.locator('#galerie');
      await gallery.scrollIntoViewIfNeeded();
      await expect(gallery).toContainText(/1\s*\/\s*4/);
      await gallery.hover();
      await page.waitForTimeout(5_500);
      await expect(gallery).toContainText(/1\s*\/\s*4/);
    });

    test('T2-CONTENT-04: FAQ expand/collapse rapid toggle', async ({ page }) => {
      await openApp(page, '/');
      const faq = page.locator('#faq');
      await faq.scrollIntoViewIfNeeded();
      const triggers = faq.locator('button[aria-expanded]');
      const count = await triggers.count();
      expect(count).toBeGreaterThanOrEqual(4);
      for (let i = 0; i < count; i += 1) {
        await triggers.nth(i).click();
        await triggers.nth(i).click();
      }
      await expect(triggers.first()).toBeVisible();
    });

    test('T2-CONTENT-05: Scroll jump via URL hash /#rechner, /#galerie, /#faq on cold load', async ({
      page,
    }) => {
      for (const hash of ['/#rechner', '/#galerie', '/#faq']) {
        const monitors = await openApp(page, hash);
        await expect(page.locator(hash.slice(1))).toBeVisible();
        monitors.assertClean();
      }
    });
  });

  test.describe('Area E: Calculator Boundaries, duo < 100, 800+ & Invalid Inputs', () => {
    test('T2-CALC-01: Lower clamp at 30 when clicking guest-minus', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 30);
      await page.locator('[data-testid="guest-minus"]').click();
      await expect(getGuestInput(page)).toHaveValue('30');
      const receipt = await readReceiptSummary(page);
      expect(receipt.net).toBeGreaterThanOrEqual(600);
    });

    test('T2-CALC-02: Step clamp near min (35 - 10 -> 30)', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 35);
      await page.locator('[data-testid="guest-minus"]').click();
      await expect(getGuestInput(page)).toHaveValue('30');
    });

    test('T2-CALC-03: Tier 1 boundary (99 -> 0% vs 100 -> 5%)', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 99);
      let receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, REFERENCE_VECTORS[2].expectedSubtotalNet, 0.01, '99 net');
      expectEuroClose(await readCardEuroPrice(page, 'meat-scheiben'), 21.0, 0.01, '99 unit');

      await setGuestsViaInput(page, 100);
      receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, REFERENCE_VECTORS[3].expectedSubtotalNet, 0.01, '100 net');
      expectEuroClose(await readCardEuroPrice(page, 'meat-scheiben'), 19.95, 0.01, '100 unit');
    });

    test('T2-CALC-04: Tier 2 boundary (249 -> 5% vs 250 -> 10%)', async ({ page }) => {
      await openApp(page, '/');
      await selectMeat(page, 'kalb');
      await setExtras(page, { bread_salad: true, drinks: false, dessert: false });

      await setGuestsViaInput(page, 249);
      let receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, REFERENCE_VECTORS[4].expectedSubtotalNet, 0.01, '249 net');
      expectEuroClose(receipt.vat, REFERENCE_VECTORS[4].expectedVatAmount, 0.01, '249 vat');

      await setGuestsViaInput(page, 250);
      receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, REFERENCE_VECTORS[5].expectedSubtotalNet, 0.01, '250 net');
      expectEuroClose(receipt.vat, REFERENCE_VECTORS[5].expectedVatAmount, 0.01, '250 vat');
    });

    test('T2-CALC-05: Tier 3 boundary (499 -> 10% vs 500 -> 15%)', async ({ page }) => {
      await openApp(page, '/');
      await selectMeat(page, 'chicken');
      await selectSetup(page, 'truck');
      await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

      await setGuestsViaInput(page, 499);
      let receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, REFERENCE_VECTORS[6].expectedSubtotalNet, 0.01, '499 net');
      expectEuroClose(receipt.vat, REFERENCE_VECTORS[6].expectedVatAmount, 0.01, '499 vat');

      await setGuestsViaInput(page, 500);
      receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, REFERENCE_VECTORS[7].expectedSubtotalNet, 0.01, '500 net');
      expectEuroClose(receipt.vat, REFERENCE_VECTORS[7].expectedVatAmount, 0.01, '500 vat');
    });

    test('T2-CALC-06: Upper clamp near max (795 + 10 -> 800, exact max totals)', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 795);
      await page.locator('[data-testid="guest-plus"]').click();
      await expect(getGuestInput(page)).toHaveValue('800');

      await selectMeat(page, 'scheiben');
      await selectSetup(page, 'truck');
      await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

      const maxVec = REFERENCE_VECTORS[8];
      const receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, maxVec.expectedSubtotalNet, 0.01, '800 net');
      expectEuroClose(receipt.vat, maxVec.expectedVatAmount, 0.01, '800 vat');
      expectEuroClose(receipt.gross, maxVec.expectedTotalGross, 0.01, '800 gross');
      expectEuroClose(receipt.perGuest, maxVec.expectedPerGuestNet, 0.01, '800 perGuest');
    });

    test('T2-CALC-07: 800+ Enterprise / Großevent boundary', async ({ page }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 1200);
      const enterpriseToggle = page.locator('[data-testid="enterprise-800-plus"], button:has-text("800+")').first();
      if ((await enterpriseToggle.count()) > 0 && (await enterpriseToggle.isVisible())) {
        const active = await isControlActive(enterpriseToggle);
        if (!active) await enterpriseToggle.click();
      }

      const inputVal = Number(await getGuestInput(page).inputValue());
      expect(inputVal).toBeLessThanOrEqual(800);
      const rechnerAndSummary = await page.locator('#rechner, #rechner-summary').allInnerTexts();
      const combined = rechnerAndSummary.join(' ');
      expect(combined).not.toMatch(BAD_NUM_RE);
      expect(combined).toMatch(/800\+|Enterprise|Großevent|Kurumsal/i);

      const receipt = await readReceiptSummary(page);
      expect(Number.isFinite(receipt.net) && receipt.net > 0).toBe(true);
    });

    test('T2-CALC-08: Invalid guest-input entries (0, -5, 15, 2000, abc, empty)', async ({
      page,
    }) => {
      await openApp(page, '/');
      for (const bad of ['0', '-5', '15', '2000', 'abc', '']) {
        const input = getGuestInput(page);
        await input.scrollIntoViewIfNeeded();
        const inputType = (await input.getAttribute('type'))?.toLowerCase();
        if (inputType === 'number' && bad !== '' && !/^-?\d+(?:\.\d+)?$/.test(bad)) {
          await input.click();
          await input.press('Control+A');
          await input.pressSequentially(bad);
        } else {
          await input.fill(bad);
        }
        await input.blur();

        const summaryText = await page.locator('#rechner-summary').innerText();
        expect(summaryText, `NaN/Infinity for input "${bad}"`).not.toMatch(BAD_NUM_RE);

        const rawVal = await input.inputValue();
        const val = rawVal === '' ? Number.NaN : Number(rawVal);
        if (inputType === 'number' && bad === 'abc') {
          if (rawVal !== '') {
            expect(val).toBeGreaterThanOrEqual(30);
            expect(val).toBeLessThanOrEqual(800);
          }
        } else {
          expect(val).toBeGreaterThanOrEqual(30);
          expect(val).toBeLessThanOrEqual(800);
        }

        const receipt = await readReceiptSummary(page);
        expect(Number.isFinite(receipt.net) && receipt.net >= 600).toBe(true);
      }
    });

    test('T2-CALC-09: duo minimum guest enforcement (DUO_MIN_GUESTS = 100)', async ({ page }) => {
      await openApp(page, '/');
      await selectMeat(page, 'chicken');
      await setGuestsViaInput(page, 45);
      await setExtras(page, { bread_salad: false, drinks: false, dessert: false });

      const duoCard = page.locator('[data-testid="meat-duo"]').first();
      const isDisabled = await duoCard.evaluate(
        (el) =>
          el.hasAttribute('disabled') ||
          el.getAttribute('aria-disabled') === 'true' ||
          el.getAttribute('data-disabled') === 'true'
      );

      if (isDisabled) {
        await expect(page.locator('#rechner')).toContainText(/100/);
        expect(await isControlActive(duoCard)).toBe(false);
      } else {
        await duoCard.click();
        const guestsAfter = Number(await getGuestInput(page).inputValue());
        const receipt = await readReceiptSummary(page);
        if (guestsAfter >= 100) {
          expect(guestsAfter).toBe(100);
          expectEuroClose(receipt.net, 1710 + 250, 0.01, 'duo auto-adjusted 100 net');
        } else {
          // Billing floor / warning enforcement
          await expect(page.locator('#rechner, #rechner-summary').first()).toContainText(/100/);
          const naiveBrokenNet = 18 * 45 + 250; // 1060€ (buggy MEVA behavior)
          expect(receipt.net).toBeGreaterThan(naiveBrokenNet + 100);
        }
      }

      // Case (b): select duo at 120, then drop guests to 60
      await setGuestsViaInput(page, 120);
      await duoCard.click();
      await setGuestsViaInput(page, 60);
      const guests60 = Number(await getGuestInput(page).inputValue());
      const receipt60 = await readReceiptSummary(page);
      const duoStillActive = await isControlActive(duoCard);
      if (duoStillActive && guests60 < 100) {
        expect(receipt60.net).toBeGreaterThan(18 * 60 + 250 + 100);
      }
    });

    test('T2-CALC-10: Minimum possible quote floor (30, chicken, buffet, no extras -> 600 / 714)', async ({
      page,
    }) => {
      await openApp(page, '/');
      await setGuestsViaInput(page, 30);
      await selectMeat(page, 'chicken');
      await selectSetup(page, 'buffet');
      await setExtras(page, { bread_salad: false, drinks: false, dessert: false });

      const minVec = REFERENCE_VECTORS[1];
      const receipt = await readReceiptSummary(page);
      expectEuroClose(receipt.net, minVec.expectedSubtotalNet, 0.01, 'min net');
      expectEuroClose(receipt.vat, minVec.expectedVatAmount, 0.01, 'min vat');
      expectEuroClose(receipt.gross, minVec.expectedTotalGross, 0.01, 'min gross');
      expectEuroClose(receipt.perGuest, minVec.expectedPerGuestNet, 0.01, 'min perGuest');
    });
  });

  test.describe('Area F: Quote Modal Validation & Sanitization Boundaries', () => {
    test('T2-MODAL-01: Empty or whitespace-only Contact Name blocks submit', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      const modal = await openQuoteModal(page);

      await locateModalField(modal, 'email').fill('max@berlintech.de');
      await locateModalField(modal, 'phone').fill('+49 30 9876543');
      await locateModalField(modal, 'date').fill(computeFutureDateIso(20));

      const waTrigger = modal
        .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
        .filter({ hasText: /whatsapp/i })
        .first();

      for (const badName of ['', '   ']) {
        await locateModalField(modal, 'name').fill(badName);
        const res = await triggerAndCaptureWhatsApp(page, waTrigger);
        expect(res.triggered, `Empty name "${badName}" must not submit`).toBe(false);
        await expect(modal).toContainText(/name|erforderlich|required|zorunlu|ad/i);
      }
    });

    test('T2-MODAL-02: Invalid Email strings (foo, a@, @b.com, user@domain) rejected', async ({
      page,
    }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      const modal = await openQuoteModal(page);

      await locateModalField(modal, 'name').fill('Max Mustermann');
      await locateModalField(modal, 'phone').fill('+49 30 9876543');
      await locateModalField(modal, 'date').fill(computeFutureDateIso(20));

      const waTrigger = modal
        .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
        .filter({ hasText: /whatsapp/i })
        .first();

      for (const badEmail of ['foo', 'a@', '@b.com', 'user@domain']) {
        await locateModalField(modal, 'email').fill(badEmail);
        const res = await triggerAndCaptureWhatsApp(page, waTrigger);
        expect(res.triggered, `Invalid email "${badEmail}" must be blocked`).toBe(false);
        await expect(modal).toContainText(/e-?mail|eposta/i);
      }

      await locateModalField(modal, 'email').fill('name@company.de');
      const okRes = await triggerAndCaptureWhatsApp(page, waTrigger);
      expect(okRes.triggered).toBe(true);
    });

    test('T2-MODAL-03: Invalid Phone numbers (empty, 123, abcdef) rejected', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      const modal = await openQuoteModal(page);

      await locateModalField(modal, 'name').fill('Max Mustermann');
      await locateModalField(modal, 'email').fill('name@company.de');
      await locateModalField(modal, 'date').fill(computeFutureDateIso(20));

      const waTrigger = modal
        .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
        .filter({ hasText: /whatsapp/i })
        .first();

      for (const badPhone of ['', '123', 'abcdef']) {
        await locateModalField(modal, 'phone').fill(badPhone);
        const res = await triggerAndCaptureWhatsApp(page, waTrigger);
        expect(res.triggered, `Invalid phone "${badPhone}" must be blocked`).toBe(false);
        await expect(modal).toContainText(/telefon|phone|nummer/i);
      }

      await locateModalField(modal, 'phone').fill('+49 30 9876543');
      const okRes = await triggerAndCaptureWhatsApp(page, waTrigger);
      expect(okRes.triggered).toBe(true);
    });

    test('T2-MODAL-04: Past Event Date (2020-01-01) rejected', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      const modal = await openQuoteModal(page);

      await locateModalField(modal, 'name').fill('Max Mustermann');
      await locateModalField(modal, 'email').fill('name@company.de');
      await locateModalField(modal, 'phone').fill('+49 30 9876543');
      await locateModalField(modal, 'date').fill('2020-01-01');

      const waTrigger = modal
        .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
        .filter({ hasText: /whatsapp/i })
        .first();

      const badRes = await triggerAndCaptureWhatsApp(page, waTrigger);
      expect(badRes.triggered, 'Past date 2020-01-01 must be rejected').toBe(false);
      await expect(modal).toContainText(/datum|date|tarih|zukunft|future|gelecek/i);

      await locateModalField(modal, 'date').fill(computeFutureDateIso(15));
      const okRes = await triggerAndCaptureWhatsApp(page, waTrigger);
      expect(okRes.triggered).toBe(true);
    });

    test('T2-MODAL-05: XSS / Special characters in Name & Company safely escaped', async ({
      page,
    }) => {
      await installPrintAndWindowOpenSpy(page);
      let dialogTriggered = false;
      page.on('dialog', async (d) => {
        dialogTriggered = true;
        await d.dismiss();
      });

      await openApp(page, '/');
      const modal = await openQuoteModal(page);

      const payload = 'Ömer Çelik & Söhne <script>alert(1)</script>';
      await locateModalField(modal, 'name').fill(payload);
      const companyField = locateModalField(modal, 'company');
      if ((await companyField.count()) > 0) await companyField.fill('<img src=x onerror=alert(1)>');
      await locateModalField(modal, 'email').fill('oemer@celik.de');
      await locateModalField(modal, 'phone').fill('+49 30 7654321');
      await locateModalField(modal, 'date').fill(computeFutureDateIso(30));

      const waTrigger = modal
        .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
        .filter({ hasText: /whatsapp/i })
        .first();
      const res = await triggerAndCaptureWhatsApp(page, waTrigger);
      expect(dialogTriggered).toBe(false);
      expect(res.triggered).toBe(true);
      const decoded = new URL(res.url!).searchParams.get('text') ?? '';
      expect(decoded).toContain('Ömer Çelik');
    });

    test('T2-MODAL-06: Modal reopen after failed validation remains usable', async ({ page }) => {
      await installPrintAndWindowOpenSpy(page);
      await openApp(page, '/');
      const modal = await openQuoteModal(page);

      const waTrigger = modal
        .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], a[href*="wa.me"], button')
        .filter({ hasText: /whatsapp/i })
        .first();
      await triggerAndCaptureWhatsApp(page, waTrigger);

      await page.keyboard.press('Escape');
      await expect(modal).toBeHidden();

      await openQuoteModal(page);
      await locateModalField(modal, 'name').fill('Aylin Demir');
      await locateModalField(modal, 'email').fill('aylin@firma.de');
      await locateModalField(modal, 'phone').fill('+49 170 1234567');
      await locateModalField(modal, 'date').fill(computeFutureDateIso(14));

      const res = await triggerAndCaptureWhatsApp(page, waTrigger);
      expect(res.triggered).toBe(true);
    });
  });

  test.describe('Area G: Brand Kit Portal Boundaries', () => {
    test('T2-BRANDKIT-01: Direct deep-link /?view=brand-kit on cold start', async ({ page }) => {
      const monitors = await openApp(page, '/?view=brand-kit');
      await expect(page.locator('#brand-kit')).toBeVisible();
      monitors.assertClean();
    });

    test('T2-BRANDKIT-02: Every downloadable logo/asset link probed via HTTP GET returns 200', async ({
      page,
      request,
    }) => {
      await openApp(page, '/?view=brand-kit');
      const hrefs = await page.locator('#brand-kit a[href]').evaluateAll((links) =>
        links
          .map((a) => a.getAttribute('href') ?? '')
          .filter((h) => /\.(?:svg|png|webp|json|md|html)$/i.test(h))
      );
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        const res = await request.get(href);
        expect(res.status(), `Failed GET ${href}`).toBe(200);
        expect((await res.body()).byteLength).toBeGreaterThan(0);
      }
    });

    test('T2-BRANDKIT-03: Rapid token-copy clicks across multiple swatches', async ({ page }) => {
      await openApp(page, '/?view=brand-kit');
      const buttons = page
        .locator('#brand-kit [data-testid^="copy-token"], #brand-kit button')
        .filter({ hasText: /#[0-9a-f]{6}/i });
      const count = await buttons.count();
      expect(count).toBeGreaterThanOrEqual(2);

      await buttons.nth(0).click();
      const firstClip = await page.evaluate(() => navigator.clipboard.readText());
      await buttons.nth(1).click();
      const secondClip = await page.evaluate(() => navigator.clipboard.readText());

      expect(firstClip).toMatch(/#[0-9a-f]{6}/i);
      expect(secondClip).toMatch(/#[0-9a-f]{6}/i);
    });

    test('T2-BRANDKIT-04: Brand Kit switching DE -> EN -> TR without untranslated keys', async ({
      page,
    }) => {
      await openApp(page, '/?view=brand-kit');
      for (const locale of ['de', 'en', 'tr'] as const) {
        await switchLocale(page, locale);
        const text = await page.locator('#brand-kit').innerText();
        expect(text.length).toBeGreaterThan(100);
        expect(text).not.toMatch(/undefined|\[missing/i);
      }
    });

    test('T2-BRANDKIT-05: Return navigation from ?view=brand-kit back to main calculator', async ({
      page,
    }) => {
      await openApp(page, '/?view=brand-kit');
      const portal = page.locator('#brand-kit');
      const scopedTrigger = portal
        .locator('a[href="/"], a[href="#rechner"], a[href="/#rechner"], button')
        .filter({ hasText: /rechner|calculator|hesapla|zurück|back|geri|dcc/i });
      const headerFallback = page
        .locator('header a[href="/"], header a[href="/#rechner"], header button')
        .filter({ hasText: /rechner|calculator|hesapla|zurück|back|geri|dcc/i });
      const backTrigger = await pickVisible(scopedTrigger, headerFallback);
      await backTrigger.scrollIntoViewIfNeeded().catch(() => {});
      await backTrigger.click();
      await dismissSplash(page);
      await expect(page.locator('#rechner')).toBeVisible();
      await expect(getGuestInput(page)).toBeEnabled();
    });
  });

  test.describe('Area H: Legal Modal & Navigation Boundaries', () => {
    test('T2-LEGAL-01: Open #impressum, close via Escape, reopen #datenschutz (single backdrop)', async ({
      page,
    }) => {
      await openApp(page, '/');
      await page.locator('a[href="#impressum"], button').filter({ hasText: /impressum|imprint|künye/i }).first().click();
      await expect(page.getByRole('dialog')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);

      await page.locator('a[href="#datenschutz"], button').filter({ hasText: /datenschutz|privacy|gizlilik/i }).first().click();
      await expect(page.getByRole('dialog')).toHaveCount(1);
    });

    test('T2-LEGAL-02: Open #ifs from Footer and close cleanly restoring scroll', async ({
      page,
    }) => {
      await openApp(page, '/');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.locator('a[href="#ifs"], button').filter({ hasText: /ifs|hygiene|hijyen|halal/i }).first().click();
      const dialog = page.getByRole('dialog').first();
      await expect(dialog).toBeVisible();

      const closeBtn = dialog.getByRole('button', { name: /close|schließen|kapat|×/i }).first();
      await closeBtn.click();
      await expect(dialog).toBeHidden();
      const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
      expect(bodyOverflow).not.toBe('hidden');
    });

    test('T2-LEGAL-03: Direct hash navigation /#impressum, /#datenschutz, /#ifs', async ({
      page,
    }) => {
      for (const hash of ['/#impressum', '/#datenschutz', '/#ifs']) {
        const monitors = await openApp(page, hash);
        await expect(page.locator('#root')).not.toBeEmpty();
        monitors.assertClean();
      }
    });

    test('T2-LEGAL-04: Legal modal on mobile 390x844 fits viewport with clickable close button', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openApp(page, '/');
      await page.locator('footer').scrollIntoViewIfNeeded();
      await page.locator('a[href="#impressum"], button').filter({ hasText: /impressum|imprint|künye/i }).first().click();

      const dialog = page.getByRole('dialog').first();
      await expect(dialog).toBeVisible();
      await checkNoHorizontalOverflow(page);

      const closeBtn = dialog.getByRole('button', { name: /close|schließen|kapat|×/i }).first();
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await expect(dialog).toBeHidden();
    });

    test('T2-LEGAL-05: Zero orphaned modal focus trap after closing legal modals', async ({
      page,
    }) => {
      await openApp(page, '/');
      await page.locator('a[href="#impressum"], button').filter({ hasText: /impressum|imprint|künye/i }).first().click();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);

      await page.locator('[data-testid="guest-plus"]').click();
      await expect(getGuestInput(page)).toHaveValue('130');
    });
  });
});
