import { expect, test, type Page } from '@playwright/test';
import { PROJECTS } from '../../data/projects';

async function ready(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await expect(page.locator('[data-barba="container"]')).toHaveCount(1);
}

for (const touch of [false, true]) {
  test(`root hydration: ${touch ? 'touch' : 'pointer'} direct loads, reload and navigation`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      baseURL: testInfo.project.use.baseURL,
      viewport: touch ? { width: 375, height: 812 } : { width: 1440, height: 900 },
      hasTouch: touch, isMobile: touch,
    });
    const page = await context.newPage();
    const events: Array<{ type: string; text: string }> = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        events.push({ type: message.type(), text: message.text() });
      }
    });
    page.on('pageerror', (error) => events.push({ type: 'pageerror', text: error.message }));
    page.on('response', (response) => {
      if (response.status() >= 400) events.push({ type: 'http', text: `${response.status()} ${response.url()}` });
    });
    async function check() {
      await ready(page);
      const classes = await page.locator('html').getAttribute('class');
      expect(classes?.split(/\s+/).filter((name) => name === 'w-mod-js')).toHaveLength(1);
      expect(classes?.split(/\s+/).includes('w-mod-touch')).toBe(touch);
      // Preserve all warnings as evidence; the gate is errors + hydration warnings,
      // not unrelated Three.js deprecation / Chromium GPU performance notices.
      expect(events.filter((event) => event.type !== 'warning'
        || /hydrat|did not match|server html/i.test(event.text))).toEqual([]);
    }
    try {
      for (const route of ['/', '/work', ...PROJECTS.map(({ slug }) => `/projects/${slug}`)]) {
        expect((await page.goto(route))?.status()).toBe(200);
        await check();
        expect((await page.reload())?.status()).toBe(200);
        await check();
      }
      await page.goto('/');
      await check();
      await page.reload();
      await check();
      // Use the real Barba owner, not a document response substitution.
      await page.evaluate(() => (window as any).barba.go('/work'));
      await expect(page.locator('[data-barba-namespace="work"]')).toHaveCount(1);
      await check();
      await page.goBack();
      await expect(page.locator('#process')).toHaveCount(1);
      await check();
    } finally {
      await testInfo.attach('root-hydration-events', {
        body: JSON.stringify(events, null, 2), contentType: 'application/json',
      });
      await context.close();
    }
  });
}
