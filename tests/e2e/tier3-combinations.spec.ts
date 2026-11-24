import { expect, test, type Page } from '@playwright/test';
import { expectEuroClose, formatCheckByLocale } from './helpers/currency';
import { calculateExpectedQuote } from './helpers/pricing-oracle';
import {
  assertNoElementOverlap,
  captureWhatsAppAction,
  checkNoHorizontalOverflow,
  computeFutureDateIso,
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
} from './helpers/site-actions';

async function assertLayoutInvariants(page: Page, mode: 'desktop' | 'mobile'): Promise<void> {
  await checkNoHorizontalOverflow(page);
  const bottomBar = page.locator('[data-testid="mobile-bottom-bar"], nav.fixed.bottom-0').first();
  if (mode === 'desktop') {
    if ((await bottomBar.count()) > 0) {
      await expect(bottomBar).toBeHidden();
    }
    await expect(page.locator('#rechner-summary')).toBeVisible();
  } else {
    await expect(bottomBar).toBeVisible();
    const themeSwitcher = page.locator('[data-testid="theme-switcher"]').first();
    if ((await themeSwitcher.count()) > 0) {
      await assertNoElementOverlap(bottomBar, themeSwitcher, 'MobileBottomBar vs ThemeSwitcher');
    }
  }
}

test.describe('Tier 3 — Cross-Feature Pairwise Matrix (12 Combinations)', () => {
  test('T3-PAIR-01: de + obsidian + 1440x900 + 30 (0%) + chicken + buffet + none + receipt', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'de');
    await switchTheme(page, 'obsidian');

    await setGuestsViaInput(page, 30);
    await selectMeat(page, 'chicken');
    await selectSetup(page, 'buffet');
    await setExtras(page, { bread_salad: false, drinks: false, dessert: false });

    const receipt = await readReceiptSummary(page);
    expect(formatCheckByLocale(receipt.netText, 'de').valid).toBe(true);
    expectEuroClose(receipt.net, 600.0, 0.01, 'T3-PAIR-01 net');
    expectEuroClose(receipt.gross, 714.0, 0.01, 'T3-PAIR-01 gross');
    await assertLayoutInvariants(page, 'desktop');
    monitors.assertClean();
  });

  test('T3-PAIR-02: en + limestone + 390x844 + 99 (0%) + kalb + station + bread_salad + mobile sticky bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'en');
    await switchTheme(page, 'limestone');

    await setGuestsViaInput(page, 99);
    await selectMeat(page, 'kalb');
    await selectSetup(page, 'station');
    await setExtras(page, { bread_salad: true, drinks: false, dessert: false });

    const receipt = await readReceiptSummary(page);
    const oracle = calculateExpectedQuote({
      guests: 99,
      meatId: 'kalb',
      setupId: 'station',
      extras: { bread_salad: true, drinks: false, dessert: false },
    });
    expect(formatCheckByLocale(receipt.netText, 'en').valid).toBe(true);
    expectEuroClose(receipt.net, oracle.subtotalNet, 0.01, 'T3-PAIR-02 net');
    expectEuroClose(receipt.net, 2477.5, 0.01, 'T3-PAIR-02 exact 2477.50');

    const bottomBar = page.locator('[data-testid="mobile-bottom-bar"], nav.fixed.bottom-0').first();
    await expect(bottomBar).toBeVisible();
    expect(await bottomBar.innerText()).not.toMatch(/\bRechner\b|\bAnrufen\b/i);
    await assertLayoutInvariants(page, 'mobile');
    monitors.assertClean();
  });

  test('T3-PAIR-03: tr + emerald-club + 1440x900 + 100 (5%) + duo + truck + drinks+dessert + discount boundary', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'tr');
    await switchTheme(page, 'emerald-club');

    await setGuestsViaInput(page, 100);
    await selectMeat(page, 'duo');
    await selectSetup(page, 'truck');
    await setExtras(page, { bread_salad: false, drinks: true, dessert: true });

    const receipt = await readReceiptSummary(page);
    expect(formatCheckByLocale(receipt.netText, 'tr').valid).toBe(true);
    expectEuroClose(receipt.net, 2890.0, 0.01, 'T3-PAIR-03 net');
    expectEuroClose(receipt.gross, 3439.1, 0.01, 'T3-PAIR-03 gross');
    expect(await page.locator('body').innerText()).toMatch(/[ğüşiöçİĞÜŞÖÇ]/);
    await assertLayoutInvariants(page, 'desktop');
    monitors.assertClean();
  });

  test('T3-PAIR-04: de + emerald-club + 390x844 + 249 (5%) + vegan + buffet + bread_salad+dessert + Hero toggle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'de');
    await switchTheme(page, 'emerald-club');

    const trailerBtn = page.locator('#hero').getByRole('button', { name: /trailer/i }).first();
    if ((await trailerBtn.count()) > 0) await trailerBtn.click();

    await setGuestsViaInput(page, 60);
    const veganBase = await readCardEuroPrice(page, 'meat-vegan');
    await setGuestsViaInput(page, 249);
    await selectMeat(page, 'vegan');
    await selectSetup(page, 'buffet');
    await setExtras(page, { bread_salad: true, drinks: false, dessert: true });

    const oracle = calculateExpectedQuote({
      guests: 249,
      meatId: 'vegan',
      setupId: 'buffet',
      extras: { bread_salad: true, drinks: false, dessert: true },
      veganUnitPrice: veganBase,
    });
    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, oracle.subtotalNet, 0.02, 'T3-PAIR-04 vegan net');
    await assertLayoutInvariants(page, 'mobile');
    monitors.assertClean();
  });

  test('T3-PAIR-05: en + obsidian + 1440x900 + 250 (10%) + scheiben + station + all 3 extras + Quote Modal + Print', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'en');
    await switchTheme(page, 'obsidian');

    await setGuestsViaInput(page, 250);
    await selectMeat(page, 'scheiben');
    await selectSetup(page, 'station');
    await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, 7850.0, 0.01, 'T3-PAIR-05 net');
    expectEuroClose(receipt.gross, 9341.5, 0.01, 'T3-PAIR-05 gross');

    const modal = await openQuoteModal(page);
    const printBtn = modal
      .locator('[data-testid="modal-print"], button')
      .filter({ hasText: /print/i })
      .first();
    await printBtn.click();
    const printCount = await page.evaluate(
      () => (window as unknown as { __printCalled?: number }).__printCalled ?? 0
    );
    expect(printCount).toBe(1);
    await page.keyboard.press('Escape');
    await assertLayoutInvariants(page, 'desktop');
    monitors.assertClean();
  });

  test('T3-PAIR-06: tr + limestone + 390x844 + 499 (10%) + kalb + truck + bread_salad+drinks + mobile overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'tr');
    await switchTheme(page, 'limestone');

    await setGuestsViaInput(page, 499);
    await selectMeat(page, 'kalb');
    await selectSetup(page, 'truck');
    await setExtras(page, { bread_salad: true, drinks: true, dessert: false });

    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, 12904.9, 0.01, 'T3-PAIR-06 net');
    await assertLayoutInvariants(page, 'mobile');
    monitors.assertClean();
  });

  test('T3-PAIR-07: de + limestone + 1440x900 + 500 (15%) + duo + station + drinks + Logo & WhatsApp', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'de');
    await switchTheme(page, 'limestone');

    await setGuestsViaInput(page, 500);
    await selectMeat(page, 'duo');
    await selectSetup(page, 'station');
    await setExtras(page, { bread_salad: false, drinks: true, dessert: false });

    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, 10150.0, 0.01, 'T3-PAIR-07 net');
    expectEuroClose(receipt.gross, 12078.5, 0.01, 'T3-PAIR-07 gross');

    const waTrigger = await pickVisible(page.locator('[data-testid="quote-whatsapp"]'));
    const wa = await captureWhatsAppAction(page, waTrigger);
    expect(wa.triggered).toBe(true);
    expect(wa.url).toMatch(/^https:\/\/(?:wa\.me|api\.whatsapp\.com)\//i);
    expect(new URL(wa.url!).searchParams.get('text')).toContain('500');
    await assertLayoutInvariants(page, 'desktop');
    monitors.assertClean();
  });

  test('T3-PAIR-08: en + obsidian + 390x844 + 800 (15%) + scheiben + truck + all 3 + Gallery mobile scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'en');
    await switchTheme(page, 'obsidian');

    await setGuestsViaInput(page, 800);
    await selectMeat(page, 'scheiben');
    await selectSetup(page, 'truck');
    await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, 23860.0, 0.01, 'T3-PAIR-08 net');
    expectEuroClose(receipt.gross, 28393.4, 0.01, 'T3-PAIR-08 gross');

    await page.locator('#galerie').scrollIntoViewIfNeeded();
    const nextBtn = page
      .locator('#galerie')
      .getByRole('button', { name: /next|nächste|vor|weiter/i })
      .first();
    await nextBtn.click();
    await expect(page.locator('#galerie')).toContainText(/2\s*\/\s*4/);
    await assertLayoutInvariants(page, 'mobile');
    monitors.assertClean();
  });

  test('T3-PAIR-09: tr + obsidian + 1440x900 + 800+ + scheiben + truck + all 3 + Modal validation & Copy', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'tr');
    await switchTheme(page, 'obsidian');

    await setGuestsViaInput(page, 950);
    const enterpriseBtn = page.locator('[data-testid="enterprise-800-plus"], button:has-text("800+")').first();
    if ((await enterpriseBtn.count()) > 0 && (await enterpriseBtn.isVisible())) {
      if (!(await isControlActive(enterpriseBtn))) await enterpriseBtn.click();
    }

    await selectMeat(page, 'scheiben');
    await selectSetup(page, 'truck');
    await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

    const modal = await openQuoteModal(page);
    await locateModalField(modal, 'name').fill('Emre Kaya');
    await locateModalField(modal, 'email').fill('bad-email');
    await locateModalField(modal, 'phone').fill('+90 532 1234567');
    await locateModalField(modal, 'date').fill(computeFutureDateIso(45));

    const waTrigger = modal
      .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button')
      .filter({ hasText: /whatsapp/i })
      .first();
    const badAttempt = await triggerAndCaptureWhatsApp(page, waTrigger);
    expect(badAttempt.triggered).toBe(false);

    await locateModalField(modal, 'email').fill('emre@kaya-events.tr');
    const copyBtn = modal
      .locator('[data-testid="modal-copy"], button')
      .filter({ hasText: /kopyala|copy/i })
      .first();
    await copyBtn.click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toMatch(/DCC|Döner Catering Club/i);
    await page.keyboard.press('Escape');
    await assertLayoutInvariants(page, 'desktop');
    monitors.assertClean();
  });

  test('T3-PAIR-10: en + emerald-club + 390x844 + 45 (0%) + vegan + try duo + buffet + bread_salad + Modal', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const monitors = await openApp(page, '/');
    await switchLocale(page, 'en');
    await switchTheme(page, 'emerald-club');

    await setGuestsViaInput(page, 45);
    const duoCard = page.locator('[data-testid="meat-duo"]').first();
    const duoDisabled = await duoCard.evaluate(
      (el) => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true'
    );
    if (!duoDisabled) {
      await duoCard.click();
      // Ensure duo < 100 was enforced (either adjusted to 100 or warned)
      const gAfter = Number(await getGuestInput(page).inputValue());
      if (gAfter < 100) {
        await expect(page.locator('#rechner, #rechner-summary').first()).toContainText(/100/);
      }
      await setGuestsViaInput(page, 45);
    }

    const veganPrice = await readCardEuroPrice(page, 'meat-vegan');
    await selectMeat(page, 'vegan');
    await selectSetup(page, 'buffet');
    await setExtras(page, { bread_salad: true, drinks: false, dessert: false });

    const oracle = calculateExpectedQuote({
      guests: 45,
      meatId: 'vegan',
      setupId: 'buffet',
      extras: { bread_salad: true, drinks: false, dessert: false },
      veganUnitPrice: veganPrice,
    });
    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, oracle.subtotalNet, 0.02, 'T3-PAIR-10 vegan net');

    await openQuoteModal(page);
    await page.keyboard.press('Escape');
    await assertLayoutInvariants(page, 'mobile');
    monitors.assertClean();
  });

  test('T3-PAIR-11: Brand Kit + Token Copy across DE->EN->TR, limestone->obsidian, desktop & mobile', async ({
    page,
    request,
  }) => {
    const monitors = await openApp(page, '/?view=brand-kit');
    for (const vp of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ] as const) {
      await page.setViewportSize(vp);
      await switchTheme(page, vp.width === 1440 ? 'limestone' : 'obsidian');
      for (const locale of ['de', 'en', 'tr'] as const) {
        await switchLocale(page, locale);
        await checkNoHorizontalOverflow(page);
      }
    }

    const copyBtn = page
      .locator('#brand-kit [data-testid^="copy-token"], #brand-kit button')
      .filter({ hasText: /#[0-9a-f]{6}|obsidian|ember|kopier|copy|kopyala/i })
      .first();
    await copyBtn.scrollIntoViewIfNeeded();
    await copyBtn.click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/#[0-9a-f]{6}|--[a-z-]+/i);

    const sampleDownload = await page
      .locator('#brand-kit a[href$=".svg"], #brand-kit a[href$=".png"]')
      .first()
      .getAttribute('href');
    if (sampleDownload) {
      const res = await request.get(sampleDownload);
      expect(res.status()).toBe(200);
    }
    monitors.assertClean();
  });

  test('T3-PAIR-12: de/tr + emerald-club + 390x844 + 150 (5%) + chicken + station + drinks + Legal Modals + FAQ', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const monitors = await openApp(page, '/');
    await switchTheme(page, 'emerald-club');
    await switchLocale(page, 'tr');

    await setGuestsViaInput(page, 150);
    await selectMeat(page, 'chicken');
    await selectSetup(page, 'station');
    await setExtras(page, { bread_salad: false, drinks: true, dessert: false });

    const faqTrigger = page.locator('#faq button[aria-expanded]').first();
    await faqTrigger.scrollIntoViewIfNeeded();
    await faqTrigger.click();
    await expect(faqTrigger).toHaveAttribute('aria-expanded', 'true');

    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.locator('a[href="#impressum"], button').filter({ hasText: /impressum|künye|imprint/i }).first().click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(getGuestInput(page)).toHaveValue('150');
    await assertLayoutInvariants(page, 'mobile');
    monitors.assertClean();
  });
});
