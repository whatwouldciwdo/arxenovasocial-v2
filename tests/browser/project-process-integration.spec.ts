import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const enabled = process.env.PROCESS_INTEGRATION_TEST === '1';
const candidate = process.env.PROCESS_INTEGRATION_CANDIDATE === '1';
test.skip(!enabled, 'Opt-in integration fixture or explicit legacy control run.');

async function ready(page: Page, home = true) {
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await expect(page.locator('[data-barba="container"]')).toHaveCount(1);
  await expect(page.locator('#process')).toHaveCount(home ? 1 : 0);
  await expect.poll(() => page.evaluate(() => (window as any).ScrollTrigger?.getAll()
    .filter((trigger: any) => trigger.trigger?.closest?.('#process')).length)).toBe(home ? 3 : 0);
}

for (const lifecycle of [false, true]) {
for (const touch of [false, true]) {
  test(`Process integration ${candidate ? 'candidate' : 'fallback'}: ${touch ? 'touch' : 'pointer'} ${lifecycle ? 'navigation' : 'direct-resize'}`, async ({ browser, baseURL }, testInfo) => {
    test.setTimeout(240_000);
    const context = await browser.newContext({ baseURL,
      viewport: touch ? { width: 375, height: 812 } : { width: 1440, height: 900 },
      hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    const events: Array<{ type: string; text: string }> = [];
    const observations: unknown[] = [];
    page.on('console', (message) => {
      if (['warning', 'error'].includes(message.type())) events.push({ type: message.type(), text: message.text() });
    });
    page.on('pageerror', (error) => events.push({ type: 'pageerror', text: error.message }));
    page.on('response', (response) => {
      if (response.status() >= 400) events.push({ type: 'http', text: `${response.status()} ${response.url()}` });
    });
    async function snapshot(phase: string) {
      const state = await page.evaluate(() => {
        const triggers = (window as any).ScrollTrigger.getAll();
        const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
        return { triggers: triggers.length,
          detachedTriggers: triggers.filter((trigger: any) => trigger.trigger && !trigger.trigger.isConnected).length,
          canvas: document.querySelectorAll('canvas').length,
          duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
          processTriggers: triggers.filter((trigger: any) => trigger.trigger?.closest?.('#process')).length };
      });
      observations.push({ phase, ...state, triggerInventory: await page.evaluate(() =>
        (window as any).ScrollTrigger.getAll().map((trigger: any) => ({
          tag: trigger.trigger?.tagName, class: trigger.trigger?.className,
          connected: trigger.trigger?.isConnected, once: trigger.vars.once === true,
          start: trigger.start, end: trigger.end, progress: trigger.progress,
          process: !!trigger.trigger?.closest?.('#process'),
        }))) });
      expect(state.detachedTriggers).toBe(0);
      // Existing Home duplicates, verified against the unchanged legacy server.
      // Preserve the finding; this is a no-new-duplicates gate, not clean-ID signoff.
      if (state.processTriggers) expect(state.duplicateIds).toEqual([
        '', '', '', '', '',
        'w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf',
        'w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf', '', '',
      ]);
      return state;
    }
    async function playback() {
      const links = page.locator('#process [data-video="playpause"]');
      for (let index = 0; index < 3; index++) {
        const link = links.nth(index);
        await link.evaluate((element) => element.scrollIntoView({ block: 'center' }));
        await expect.poll(() => link.locator('video').evaluate((video: HTMLVideoElement) =>
          !video.paused && video.readyState >= 2 && video.currentTime > 0 && !video.error)).toBe(true);
        await expect(link.locator('video')).toHaveJSProperty('muted', true);
      }
      await page.locator('#faqs').evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await expect.poll(() => page.locator('#process video').evaluateAll((videos) =>
        videos.every((video: HTMLVideoElement) => video.paused))).toBe(true);
    }

    try {
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      const html = await response!.text();
      const raw = await readFile(path.resolve('data/home.html'), 'utf8');
      const legacy = raw.match(/<section\b[^>]*\bid="process"[^>]*>[\s\S]*?<\/section>/)![0];
      expect(html.includes(legacy)).toBe(!candidate);
      expect(html).toContain('self.__next_f.push');
      await ready(page);
      const initial = await snapshot('direct');
      await playback();
      await page.reload();
      await ready(page);
      expect(await snapshot('reload')).toEqual(initial);
      await page.evaluate(() => { (window as any).__integrationDocument = 'retained'; });
      for (let cycle = 1; lifecycle && cycle <= 3; cycle++) {
        await page.evaluate(() => {
          (window as any).__outgoingProcess = Array.from(document.querySelectorAll('#process video'));
        });
        await page.evaluate(() => (window as any).barba.go('/work'));
        await expect(page.locator('[data-barba-namespace="work"]')).toHaveCount(1);
        await ready(page, false);
        await snapshot(`work-${cycle}`);
        expect(await page.evaluate(() => (window as any).__outgoingProcess.every(
          (video: HTMLVideoElement) => !video.isConnected && video.paused))).toBe(true);
        await page.goBack();
        await ready(page);
        expect(await snapshot(`back-${cycle}`)).toEqual(initial);
        await page.goForward();
        await ready(page, false);
        await page.goBack();
        await ready(page);
        expect(await snapshot(`forward-back-${cycle}`)).toEqual(initial);
        expect(await page.evaluate(() => (window as any).__integrationDocument)).toBe('retained');
        await playback();
      }
      for (const width of [767, 768, 991, 992, touch ? 375 : 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(500);
        await ready(page);
        const resized = await snapshot(`resize-${width}`);
        expect(resized.processTriggers).toBe(3);
        expect(resized.canvas).toBe(initial.canvas);
        await playback();
      }
      expect(events.filter((event) => event.type !== 'warning'
        || /hydrat|did not match|server html/i.test(event.text))).toEqual([]);
    } finally {
      observations.push({ phase: 'final-dom', state: await page.evaluate(() => ({
        url: location.href,
        processInsideBarba: !!document.querySelector('#process')?.closest('[data-barba="container"]'),
        videos: Array.from(document.querySelectorAll('#process video'), (element: HTMLVideoElement) => ({
          paused: element.paused, time: element.currentTime, readyState: element.readyState,
          error: element.error?.message, top: element.getBoundingClientRect().top,
        })),
      })).catch((error) => ({ unavailable: String(error) })) });
      await testInfo.attach('integration-observations', {
        body: JSON.stringify({ candidate, touch, events, observations,
          limitations: ['Barba navigation, not React unmount or App Router lifecycle.',
            'Trigger/video cleanup measured; not a listener, heap or RAF leak audit.'] }, null, 2),
        contentType: 'application/json',
      });
      await context.close();
    }
  });
}
}
