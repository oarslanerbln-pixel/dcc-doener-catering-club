import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Locator, type Page, type Response, type Route } from '@playwright/test';
import { parseEuro, type SupportedLocale } from './currency';
import type { ExtraId, MeatId, SetupId } from './pricing-oracle';

export type ThemeId = 'obsidian' | 'limestone' | 'emerald-club';

export type RuntimeMonitors = {
  consoleErrors: string[];
  pageErrors: string[];
  failedResponses: Array<{ url: string; status: number }>;
  assertClean: () => void;
};

export function attachRuntimeMonitors(page: Page): RuntimeMonitors {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedResponses: Array<{ url: string; status: number }> = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  page.on('response', (res: Response) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && !url.includes('wa.me') && !url.includes('whatsapp.com')) {
      failedResponses.push({ url, status });
    }
  });

  return {
    consoleErrors,
    pageErrors,
    failedResponses,
    assertClean: () => {
      expect(consoleErrors, `Console errors: ${consoleErrors.join('; ')}`).toEqual([]);
      expect(pageErrors, `Page errors: ${pageErrors.join('; ')}`).toEqual([]);
      expect(
        failedResponses,
        `Failed HTTP responses: ${JSON.stringify(failedResponses)}`
      ).toEqual([]);
    },
  };
}

export async function dismissSplash(page: Page): Promise<void> {
  const splash = page
    .locator('[data-testid="intro-splash"], [aria-label*="intro" i], [data-splash="true"]')
    .first();

  const headerOrHero = page.locator('#hero, header').first();
  await headerOrHero.waitFor({ state: 'attached', timeout: 10_000 });

  // Give IntroSplash a moment if mounted, then dismiss via Escape and click fallback
  if (await splash.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    if (await splash.isVisible().catch(() => false)) {
      await splash.click({ force: true }).catch(() => {});
    }
    await expect(splash).toBeHidden({ timeout: 5_000 });
  } else {
    // Also guard against an unlabeled fullscreen splash overlay blocking pointer events
    const blocker = page.locator('div.fixed.inset-0').first();
    if (await blocker.isVisible().catch(() => false)) {
      const zIndex = await blocker.evaluate((el) => Number(getComputedStyle(el).zIndex) || 0);
      if (zIndex >= 50) {
        await page.keyboard.press('Escape');
        await blocker.click({ force: true }).catch(() => {});
        await page.waitForTimeout(350);
      }
    }
  }
}

export async function openApp(page: Page, pathWithQuery = '/'): Promise<RuntimeMonitors> {
  const monitors = attachRuntimeMonitors(page);
  const res = await page.goto(pathWithQuery, { waitUntil: 'domcontentloaded' });
  if (res !== null) {
    expect(res.status(), `Unexpected status for ${pathWithQuery}`).toBeLessThan(400);
  }
  await page.locator('#root').waitFor({ state: 'attached', timeout: 10_000 });
  await dismissSplash(page);
  return monitors;
}

export async function firstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();
  for (let i = 0; i < count; i += 1) {
    const nth = locator.nth(i);
    if (await nth.isVisible().catch(() => false)) {
      return nth;
    }
  }
  return null;
}

export async function pickVisible(primary: Locator, fallback?: Locator): Promise<Locator> {
  const visPrimary = await firstVisible(primary);
  if (visPrimary) return visPrimary;
  if (fallback) {
    const visFallback = await firstVisible(fallback);
    if (visFallback) return visFallback;
  }
  return (await primary.count()) > 0 ? primary.first() : (fallback ?? primary).first();
}

export async function switchLocale(page: Page, locale: SupportedLocale): Promise<void> {
  const primary = page.locator(`[data-testid="lang-${locale}"]`);
  const fallback = page.getByRole('button', { name: new RegExp(`^${locale}$`, 'i') });
  const target = await pickVisible(primary, fallback);
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await target.click();
  await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${locale}`, 'i'));
}

export async function switchTheme(page: Page, _theme: ThemeId): Promise<void> {
  // Pure Black + Gold/Emerald (theme-obsidian) is the single locked design
  await expect(async () => {
    const hasObsidian = await page.evaluate(() => {
      return (
        document.documentElement.classList.contains('theme-obsidian') ||
        Boolean(document.querySelector('.theme-obsidian'))
      );
    });
    expect(hasObsidian, 'Expected locked theme-obsidian class').toBe(true);
  }).toPass({ timeout: 3_000 });
}

export async function openQuoteModal(page: Page): Promise<Locator> {
  const primary = page.locator('[data-testid="quote-open-modal"]');
  const fallback = page.getByRole('button', {
    name: /angebot|quote|teklif|anfragen|request/i,
  });
  const target = await pickVisible(primary, fallback);
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await target.click();
  const modal = page.getByRole('dialog').first();
  await expect(modal).toBeVisible();
  return modal;
}

export async function waitForImgLoaded(img: Locator, label = 'image'): Promise<void> {
  await img.scrollIntoViewIfNeeded().catch(() => {});
  await expect
    .poll(
      async () =>
        img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0).catch(() => false),
      { timeout: 10_000, message: `Timed out waiting for ${label} to decode` }
    )
    .toBe(true);
}

export async function assertAllVisibleImgsLoaded(page: Page, scopeSel: string): Promise<void> {
  const imgs = page.locator(`${scopeSel} img`);
  const count = await imgs.count();
  expect(count, `Expected images inside ${scopeSel}`).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const img = imgs.nth(i);
    if (!(await img.isVisible())) continue;
    await waitForImgLoaded(img, `${scopeSel} img #${i}`);
  }
}

export function getGuestInput(page: Page): Locator {
  return page.locator('[data-testid="guest-input"], #rechner input[type="number"]').first();
}

export function getGuestSlider(page: Page): Locator {
  return page.locator('[data-testid="guest-slider"], #rechner input[type="range"]').first();
}

export async function setGuestsViaInput(page: Page, value: number | string): Promise<void> {
  const input = getGuestInput(page);
  await input.scrollIntoViewIfNeeded();
  await input.fill(String(value));
  await input.press('Enter').catch(() => {});
  await input.blur();
}

export async function setGuestsViaSlider(page: Page, value: number): Promise<void> {
  const slider = getGuestSlider(page);
  await slider.scrollIntoViewIfNeeded();
  await slider.fill(String(value));
  await slider.dispatchEvent('change');
}

export async function selectMeat(page: Page, meatId: MeatId): Promise<void> {
  const card = page.locator(`[data-testid="meat-${meatId}"]`).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
}

export async function selectSetup(page: Page, setupId: SetupId): Promise<void> {
  const card = page.locator(`[data-testid="setup-${setupId}"]`).first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
}

export async function isControlActive(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
      return el.checked;
    }
    const nested = el.querySelector('input[type="checkbox"], input[type="radio"]');
    if (nested instanceof HTMLInputElement) {
      return nested.checked;
    }
    const ariaChecked = el.getAttribute('aria-checked');
    if (ariaChecked !== null) return ariaChecked === 'true';
    const ariaPressed = el.getAttribute('aria-pressed');
    if (ariaPressed !== null) return ariaPressed === 'true';
    const dataActive = el.getAttribute('data-active') ?? el.getAttribute('data-selected');
    if (dataActive !== null) return dataActive === 'true';
    return /\b(active|selected|ring-2)\b/i.test(el.className);
  });
}

export async function setExtra(page: Page, extraId: ExtraId, enabled: boolean): Promise<void> {
  const control = page.locator(`[data-testid="extra-${extraId}"]`).first();
  await control.scrollIntoViewIfNeeded();
  const currentlyActive = await isControlActive(control);
  if (currentlyActive !== enabled) {
    await control.click();
  }
}

export async function setExtras(
  page: Page,
  extras: Record<ExtraId, boolean>
): Promise<void> {
  await setExtra(page, 'bread_salad', extras.bread_salad);
  await setExtra(page, 'drinks', extras.drinks);
  await setExtra(page, 'dessert', extras.dessert);
}

export type ReceiptSnapshot = {
  netText: string;
  vatText: string;
  grossText: string;
  perGuestText: string;
  net: number;
  vat: number;
  gross: number;
  perGuest: number;
};

export async function readReceiptSummary(page: Page): Promise<ReceiptSnapshot> {
  const netText = await page.locator('[data-testid="summary-net"]').first().innerText();
  const vatText = await page.locator('[data-testid="summary-vat"]').first().innerText();
  const grossText = await page.locator('[data-testid="summary-gross"]').first().innerText();
  const perGuestText = await page.locator('[data-testid="summary-per-guest"]').first().innerText();

  return {
    netText: netText.trim(),
    vatText: vatText.trim(),
    grossText: grossText.trim(),
    perGuestText: perGuestText.trim(),
    net: parseEuro(netText),
    vat: parseEuro(vatText),
    gross: parseEuro(grossText),
    perGuest: parseEuro(perGuestText),
  };
}

export async function readCardEuroPrice(page: Page, testId: string): Promise<number> {
  const card = page.locator(`[data-testid="${testId}"]`).first();
  const text = await card.innerText();
  const price = parseEuro(text);
  expect(Number.isFinite(price) && price > 0, `Expected positive € price on ${testId}, got "${text}"`).toBe(
    true
  );
  return price;
}

export async function checkNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    metrics.scrollWidth,
    `Horizontal overflow detected: scrollWidth=${metrics.scrollWidth} > innerWidth=${metrics.innerWidth}`
  ).toBeLessThanOrEqual(metrics.innerWidth + 1);
}

export async function assertNoElementOverlap(a: Locator, b: Locator, label = 'elements'): Promise<void> {
  if (!(await a.isVisible().catch(() => false)) || !(await b.isVisible().catch(() => false))) {
    return;
  }
  const boxA = await a.boundingBox();
  const boxB = await b.boundingBox();
  if (!boxA || !boxB) return;

  const horizontalOverlap = boxA.x < boxB.x + boxB.width && boxA.x + boxA.width > boxB.x;
  const verticalOverlap = boxA.y < boxB.y + boxB.height && boxA.y + boxA.height > boxB.y;
  expect(
    horizontalOverlap && verticalOverlap,
    `Unexpected bounding-box overlap between ${label}: A=${JSON.stringify(boxA)} B=${JSON.stringify(boxB)}`
  ).toBe(false);
}

export function computeFutureDateIso(daysAhead = 30): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function installPrintAndWindowOpenSpy(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __printCalled: number;
      __openedUrls: string[];
    };
    w.__printCalled = 0;
    w.__openedUrls = [];
    window.print = () => {
      w.__printCalled += 1;
    };
    const origOpen = window.open.bind(window);
    window.open = (url?: string | URL, target?: string, features?: string) => {
      const urlStr = url ? String(url) : '';
      if (/wa\.me|whatsapp\.com/i.test(urlStr)) {
        w.__openedUrls.push(urlStr);
        return null;
      }
      return origOpen(url, target, features);
    };
  });
}

export async function triggerAndCaptureWhatsApp(
  page: Page,
  trigger: Locator
): Promise<{ triggered: boolean; url: string | null }> {
  const beforeCount = await page.evaluate(
    () => (window as unknown as { __openedUrls?: string[] }).__openedUrls?.length ?? 0
  );

  // Abort external navigation to WhatsApp in case an <a target="_blank"> fires
  const waPattern = /https:\/\/(?:wa\.me|api\.whatsapp\.com)\//i;
  const abortHandler = (route: Route) => route.abort();
  await page.context().route(waPattern, abortHandler);

  try {
    const popupPromise = page.waitForEvent('popup', { timeout: 1200 }).catch(() => null);
    await trigger.scrollIntoViewIfNeeded().catch(() => {});
    await trigger.click();
    const popup = await popupPromise;

    if (popup) {
      const popupUrl = popup.url();
      await popup.close().catch(() => {});
      if (/wa\.me|whatsapp\.com/i.test(popupUrl)) {
        return { triggered: true, url: popupUrl };
      }
    }

    const spiedUrls = await page.evaluate(
      () => (window as unknown as { __openedUrls?: string[] }).__openedUrls ?? []
    );
    if (spiedUrls.length > beforeCount) {
      return { triggered: true, url: spiedUrls[spiedUrls.length - 1] };
    }

    return { triggered: false, url: null };
  } finally {
    await page.context().unroute(waPattern, abortHandler).catch(() => {});
  }
}

export async function captureWhatsAppAction(
  page: Page,
  trigger: Locator
): Promise<{ triggered: boolean; url: string | null }> {
  await trigger.scrollIntoViewIfNeeded().catch(() => {});
  const href = await trigger.getAttribute('href');
  if (href) {
    return { triggered: true, url: href };
  }
  return triggerAndCaptureWhatsApp(page, trigger);
}

export type ModalFieldKind = 'name' | 'company' | 'email' | 'phone' | 'date' | 'vatId';

export function locateModalField(modal: Locator, kind: ModalFieldKind): Locator {
  switch (kind) {
    case 'name':
      return modal
        .locator(
          '[data-testid="quote-name"], input[name="name"], input[name*="contact" i], input[autocomplete="name"], input[placeholder*="Name" i], input[placeholder*="Ad" i]'
        )
        .first();
    case 'company':
      return modal
        .locator(
          '[data-testid="quote-company"], input[name*="company" i], input[name*="firma" i], input[name*="sirket" i], input[autocomplete="organization"], input[placeholder*="Firma" i], input[placeholder*="Company" i], input[placeholder*="Şirket" i]'
        )
        .first();
    case 'email':
      return modal
        .locator('[data-testid="quote-email"], input[type="email"], input[name*="email" i]')
        .first();
    case 'phone':
      return modal
        .locator(
          '[data-testid="quote-phone"], input[type="tel"], input[name*="phone" i], input[name*="telefon" i]'
        )
        .first();
    case 'date':
      return modal
        .locator('[data-testid="quote-date"], input[type="date"], input[name*="date" i], input[name*="datum" i], input[name*="tarih" i]')
        .first();
    case 'vatId':
      return modal
        .locator(
          '[data-testid="quote-vat-id"], input[name*="ust" i], input[name*="vat" i], input[name*="vergi" i], input[placeholder*="USt" i], input[placeholder*="VAT" i], input[placeholder*="Vergi" i]'
        )
        .first();
  }
}

export async function captureAuditScreenshot(page: Page, name: string): Promise<string> {
  const dir = path.join(process.cwd(), 'test-results', 'screenshots');
  mkdirSync(dir, { recursive: true });
  let projectName = 'default';
  try {
    projectName = test.info().project.name || 'default';
  } catch {
    projectName = 'default';
  }
  const safeProject = projectName.replace(/[^a-z0-9_-]+/gi, '-');
  const filePath = path.join(dir, `${safeProject}-${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true, animations: 'disabled', timeout: 25_000 }).catch(async () => {
    await page.screenshot({ path: filePath, fullPage: false, animations: 'disabled' });
  });
  return filePath;
}
