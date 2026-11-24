import { expect, test } from '@playwright/test';
import { expectEuroClose, formatCheckByLocale } from './helpers/currency';
import { calculateExpectedQuote } from './helpers/pricing-oracle';
import {
  assertNoElementOverlap,
  captureAuditScreenshot,
  checkNoHorizontalOverflow,
  computeFutureDateIso,
  getGuestInput,
  installPrintAndWindowOpenSpy,
  isControlActive,
  locateModalField,
  openApp,
  openQuoteModal,
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

test.describe('Tier 4 — Real-World Application Scenarios (6 Full E2E Journeys)', () => {
  test('T4-SCEN-01: Corporate Summit (350 Guests, EN, Desktop 1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');

    await switchLocale(page, 'en');
    const trailerBtn = page.locator('#hero').getByRole('button', { name: /trailer/i }).first();
    if ((await trailerBtn.count()) > 0) await trailerBtn.click();

    await expect(page.locator('#produktion')).toBeVisible();
    await expect(page.locator('#faq')).toBeVisible();

    await setGuestsViaInput(page, 350);
    await selectMeat(page, 'scheiben');
    await selectSetup(page, 'station');
    await setExtras(page, { bread_salad: true, drinks: true, dessert: false });

    const receipt = await readReceiptSummary(page);
    expect(formatCheckByLocale(receipt.grossText, 'en').valid).toBe(true);
    expectEuroClose(receipt.net, 9665.0, 0.01, 'SCEN-01 net');
    expectEuroClose(receipt.vat, 1836.35, 0.01, 'SCEN-01 vat');
    expectEuroClose(receipt.gross, 11501.35, 0.01, 'SCEN-01 gross');
    expectEuroClose(receipt.perGuest, 27.61, 0.01, 'SCEN-01 perGuest');

    await captureAuditScreenshot(page, 't4-scen-01-corporate-desktop-en');

    const modal = await openQuoteModal(page);

    const waTrigger = modal
      .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button')
      .filter({ hasText: /whatsapp/i })
      .first();

    // First verify invalid email blocks submit in EN
    const futureDate = computeFutureDateIso(40);
    await locateModalField(modal, 'name').fill('Dr. Elena Weber');
    const companyField = locateModalField(modal, 'company');
    if ((await companyField.count()) > 0) await companyField.fill('Summit Cloud AG');
    await locateModalField(modal, 'email').fill('invalid-email');
    await locateModalField(modal, 'phone').fill('+49 30 5551234');
    await locateModalField(modal, 'date').fill(futureDate);
    const vatField = locateModalField(modal, 'vatId');
    if ((await vatField.count()) > 0) await vatField.fill('DE987654321');

    expect((await triggerAndCaptureWhatsApp(page, waTrigger)).triggered).toBe(false);

    // Fix email and verify Copy, Print, WhatsApp
    await locateModalField(modal, 'email').fill('elena.weber@summitcloud.de');
    const copyBtn = modal
      .locator('[data-testid="modal-copy"], button')
      .filter({ hasText: /copy/i })
      .first();
    await copyBtn.click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain('350');
    expect(clip).toContain('Dr. Elena Weber');

    const printBtn = modal
      .locator('[data-testid="modal-print"], button')
      .filter({ hasText: /print/i })
      .first();
    await printBtn.click();
    expect(
      await page.evaluate(() => (window as unknown as { __printCalled?: number }).__printCalled ?? 0)
    ).toBe(1);

    const waRes = await triggerAndCaptureWhatsApp(page, waTrigger);
    expect(waRes.triggered).toBe(true);
    const waText = new URL(waRes.url!).searchParams.get('text') ?? '';
    expect(waText).toContain('Dr. Elena Weber');
    expect(waText).toContain('350');
    expect(waText).not.toMatch(DEMO_LEAK_RE);

    await checkNoHorizontalOverflow(page);
    monitors.assertClean();
  });

  test('T4-SCEN-02: VIP Wedding (140 Guests, DE, Desktop 1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');

    await switchTheme(page, 'limestone');
    await page.locator('#galerie').scrollIntoViewIfNeeded();
    const nextBtn = page
      .locator('#galerie')
      .getByRole('button', { name: /next|nächste|vor|weiter/i })
      .first();
    await nextBtn.click();
    await expect(page.locator('#galerie')).toContainText(/2\s*\/\s*4/);
    await waitForImgLoaded(page.locator('#galerie img').first(), 'gallery slide 2 img');

    await setGuestsViaInput(page, 140);
    await selectMeat(page, 'duo');
    await selectSetup(page, 'station');
    await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, 4254.0, 0.01, 'SCEN-02 net');
    expectEuroClose(receipt.vat, 808.26, 0.01, 'SCEN-02 vat');
    expectEuroClose(receipt.gross, 5062.26, 0.01, 'SCEN-02 gross');
    expectEuroClose(receipt.perGuest, 30.39, 0.01, 'SCEN-02 perGuest');

    await captureAuditScreenshot(page, 't4-scen-02-wedding-limestone-de');

    const modal = await openQuoteModal(page);
    await locateModalField(modal, 'name').fill('Sophia & Lukas Richter');
    await locateModalField(modal, 'email').fill('sophia.lukas@hochzeit.de');
    await locateModalField(modal, 'phone').fill('+49 171 4455667');
    await locateModalField(modal, 'date').fill(computeFutureDateIso(90));

    const waTrigger = modal
      .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button')
      .filter({ hasText: /whatsapp/i })
      .first();
    const waRes = await triggerAndCaptureWhatsApp(page, waTrigger);
    expect(waRes.triggered).toBe(true);
    const waText = new URL(waRes.url!).searchParams.get('text') ?? '';
    expect(waText).toContain('140');
    expect(waText).toContain('Sophia & Lukas Richter');
    expect(waText).not.toMatch(DEMO_LEAK_RE);

    await checkNoHorizontalOverflow(page);
    monitors.assertClean();
  });

  test('T4-SCEN-03: Cultural Festival (600 Guests, TR, Mobile 390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');

    await switchLocale(page, 'tr');
    await switchTheme(page, 'emerald-club');

    const bottomBar = page.locator('[data-testid="mobile-bottom-bar"], nav.fixed.bottom-0').first();
    await expect(bottomBar).toBeVisible();
    expect(await bottomBar.innerText()).not.toMatch(/\bRechner\b|\bAnrufen\b/i);

    await setGuestsViaInput(page, 600);
    await selectMeat(page, 'kalb');
    await selectSetup(page, 'truck');
    await setExtras(page, { bread_salad: false, drinks: true, dessert: false });

    const receipt = await readReceiptSummary(page);
    expect(formatCheckByLocale(receipt.grossText, 'tr').valid).toBe(true);
    expectEuroClose(receipt.net, 12770.0, 0.01, 'SCEN-03 net');
    expectEuroClose(receipt.vat, 2426.3, 0.01, 'SCEN-03 vat');
    expectEuroClose(receipt.gross, 15196.3, 0.01, 'SCEN-03 gross');
    expectEuroClose(receipt.perGuest, 21.28, 0.01, 'SCEN-03 perGuest');

    // Scroll away from receipt summary to verify mobile sticky/jump behavior
    await page.locator('#hero').scrollIntoViewIfNeeded();
    const themeSwitcher = page.locator('[data-testid="theme-switcher"]').first();
    if ((await themeSwitcher.count()) > 0) {
      await assertNoElementOverlap(bottomBar, themeSwitcher, 'MobileBottomBar vs ThemeSwitcher');
    }
    await captureAuditScreenshot(page, 't4-scen-03-festival-mobile-tr');

    const modal = await openQuoteModal(page);
    await locateModalField(modal, 'name').fill('Çağlar Yıldırım');
    await locateModalField(modal, 'email').fill('caglar@kulturfest.de');
    await locateModalField(modal, 'phone').fill('+49 176 9988776');
    await locateModalField(modal, 'date').fill(computeFutureDateIso(60));

    const waTrigger = modal
      .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button')
      .filter({ hasText: /whatsapp/i })
      .first();
    const waRes = await triggerAndCaptureWhatsApp(page, waTrigger);
    expect(waRes.triggered).toBe(true);
    const waText = new URL(waRes.url!).searchParams.get('text') ?? '';
    expect(waText).toContain('Çağlar Yıldırım');
    expect(waText).toContain('600');

    await page.keyboard.press('Escape');
    await checkNoHorizontalOverflow(page);
    monitors.assertClean();
  });

  test('T4-SCEN-04: Office Vegan Lunch (45 Guests, DE, Desktop 1440x900 + Legal)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');

    await setGuestsViaInput(page, 45);
    const duoCard = page.locator('[data-testid="meat-duo"]').first();
    const isDisabled = await duoCard.evaluate(
      (el) => el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true'
    );
    if (!isDisabled) {
      await duoCard.click();
      const guestsAfter = Number(await getGuestInput(page).inputValue());
      if (guestsAfter < 100) {
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
    expectEuroClose(receipt.net, oracle.subtotalNet, 0.02, 'SCEN-04 vegan net');
    expectEuroClose(receipt.gross, oracle.totalGross, 0.02, 'SCEN-04 vegan gross');

    // Verify legal modals open and close cleanly
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.locator('a[href="#impressum"], button').filter({ hasText: /impressum/i }).first().click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.keyboard.press('Escape');

    await page.locator('a[href="#ifs"], button').filter({ hasText: /ifs|hygiene|halal/i }).first().click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.keyboard.press('Escape');

    // Complete inquiry
    const modal = await openQuoteModal(page);
    await locateModalField(modal, 'name').fill('Hannah Becker');
    await locateModalField(modal, 'email').fill('hannah@greenoffice.de');
    await locateModalField(modal, 'phone').fill('+49 30 3344556');
    await locateModalField(modal, 'date').fill(computeFutureDateIso(21));

    const waTrigger = modal
      .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button')
      .filter({ hasText: /whatsapp/i })
      .first();
    const waRes = await triggerAndCaptureWhatsApp(page, waTrigger);
    expect(waRes.triggered).toBe(true);
    await checkNoHorizontalOverflow(page);
    monitors.assertClean();
  });

  test('T4-SCEN-05: Brand Kit & Guidelines Verification (DE/EN/TR, Desktop & Mobile)', async ({
    page,
    request,
  }) => {
    const monitors = await openApp(page, '/?view=brand-kit');
    const portal = page.locator('#brand-kit');
    await expect(portal).toBeVisible();

    for (const vp of [
      { width: 1440, height: 900, label: 'desktop' },
      { width: 390, height: 844, label: 'mobile' },
    ] as const) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const locale of ['de', 'en', 'tr'] as const) {
        await switchLocale(page, locale);
        await checkNoHorizontalOverflow(page);
      }
      await switchTheme(page, vp.label === 'desktop' ? 'obsidian' : 'limestone');
      await captureAuditScreenshot(page, `t4-scen-05-brandkit-${vp.label}`);
    }

    const imgCount = await portal.locator('img').count();
    expect(imgCount).toBeGreaterThan(0);
    for (let i = 0; i < imgCount; i += 1) {
      await waitForImgLoaded(portal.locator('img').nth(i), `Brand kit image #${i}`);
    }

    const downloadHrefs = await portal.locator('a[href$=".svg"], a[href$=".png"]').evaluateAll((els) =>
      els.map((a) => a.getAttribute('href') ?? '').filter(Boolean)
    );
    expect(downloadHrefs.length).toBeGreaterThan(0);
    for (const href of downloadHrefs) {
      const res = await request.get(href);
      expect(res.status(), `Broken Brand Kit download ${href}`).toBe(200);
    }

    const copyBtn = portal
      .locator('[data-testid^="copy-token"], button')
      .filter({ hasText: /#[0-9a-f]{6}/i })
      .first();
    await copyBtn.click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/#[0-9a-f]{6}/i);
    monitors.assertClean();
  });

  test('T4-SCEN-06: Enterprise Mega-Event 800+ Inquiry (EN, Mobile 390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await installPrintAndWindowOpenSpy(page);
    const monitors = await openApp(page, '/');

    await switchLocale(page, 'en');
    await setGuestsViaInput(page, 800);
    await page.locator('[data-testid="guest-plus"]').click();

    const enterpriseBtn = page.locator('[data-testid="enterprise-800-plus"], button:has-text("800+")').first();
    if ((await enterpriseBtn.count()) > 0 && (await enterpriseBtn.isVisible())) {
      if (!(await isControlActive(enterpriseBtn))) {
        await enterpriseBtn.click();
      }
    } else {
      await setGuestsViaInput(page, 1000);
    }

    await selectMeat(page, 'scheiben');
    await selectSetup(page, 'truck');
    await setExtras(page, { bread_salad: true, drinks: true, dessert: true });

    const receipt = await readReceiptSummary(page);
    expectEuroClose(receipt.net, 23860.0, 0.01, 'SCEN-06 base 800 net');
    expectEuroClose(receipt.gross, 28393.4, 0.01, 'SCEN-06 base 800 gross');

    const modal = await openQuoteModal(page);
    await expect(modal).toContainText(/800\+|Enterprise|Custom/i);

    await locateModalField(modal, 'name').fill('Marcus Vance');
    const companyField = locateModalField(modal, 'company');
    if ((await companyField.count()) > 0) await companyField.fill('EuroArena Live GmbH');
    await locateModalField(modal, 'email').fill('m.vance@euroarena.eu');
    await locateModalField(modal, 'phone').fill('+49 30 9001122');
    await locateModalField(modal, 'date').fill(computeFutureDateIso(120));

    const waTrigger = modal
      .locator('[data-testid="modal-whatsapp"], [data-testid="quote-whatsapp"], button')
      .filter({ hasText: /whatsapp/i })
      .first();
    const waRes = await triggerAndCaptureWhatsApp(page, waTrigger);
    expect(waRes.triggered).toBe(true);
    const waText = new URL(waRes.url!).searchParams.get('text') ?? '';
    expect(waText).toMatch(/800\+|Enterprise/i);
    expect(waText).toContain('Marcus Vance');

    await page.keyboard.press('Escape');
    await checkNoHorizontalOverflow(page);
    monitors.assertClean();
  });
});
