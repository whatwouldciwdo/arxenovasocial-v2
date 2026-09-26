import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const browser = await chromium.launch();
const observations = [];
try {
  for (const port of [3000, 3100]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://127.0.0.1:${port}/`);
    await expect.poll(() => page.evaluate(() => window.barba?.transitions?.isRunning), { timeout: 30000 }).toBe(false);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    async function snapshot(phase) {
      observations.push({ port, phase, state: await page.evaluate(() => ({
        scrollY, viewport: [innerWidth, innerHeight], height: document.documentElement.scrollHeight,
        processInsideBarba: !!document.querySelector('#process')?.closest('[data-barba="container"]'),
        videos: Array.from(document.querySelectorAll('#process video'), (video) => ({
          top: video.getBoundingClientRect().top, paused: video.paused, readyState: video.readyState,
        })),
        triggers: window.ScrollTrigger.getAll().map((trigger) => ({
          tag: trigger.trigger?.tagName, class: trigger.trigger?.className,
          connected: trigger.trigger?.isConnected, start: trigger.start, end: trigger.end,
          active: trigger.isActive, progress: trigger.progress,
          process: !!trigger.trigger?.closest('#process'),
        })),
      })) });
    }
    for (const width of [1440, 767, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(500);
      await snapshot(`resize-${width}`);
      const link = page.locator('#process [data-video="playpause"]').first();
      await link.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      await snapshot(`scroll-${width}-immediate`);
      await page.waitForTimeout(2000);
      await snapshot(`scroll-${width}-settled`);
      // Diagnostic retry AFTER the legacy one-second reset window; not an
      // acceptance workaround. The integration assertions remain unchanged.
      await link.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500);
      await snapshot(`scroll-${width}-late-retry`);
      await page.locator('#faqs').evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(300);
    }
    await page.evaluate(() => { window.__outgoing = Array.from(document.querySelectorAll('#process video')); window.barba.go('/work'); });
    await expect(page.locator('[data-barba-namespace="work"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => window.barba.transitions.isRunning), { timeout: 30000 }).toBe(false);
    await page.waitForTimeout(1000);
    await snapshot('work');
    observations.push({ port, phase: 'outgoing-videos', state: await page.evaluate(() => window.__outgoing.map((video) => ({ connected: video.isConnected, paused: video.paused }))) });
    await page.close();
  }
} finally { await browser.close(); }
await writeFile(fileURLToPath(new URL('../artifacts/home-shell/resize-cleanup-diagnostics.json', import.meta.url)), JSON.stringify(observations, null, 2));
console.log(JSON.stringify(observations.map(({ port, phase, state }) => ({ port, phase,
  ...(Array.isArray(state) ? { videos: state } : { ...state, triggers: state.triggers.filter((t) => t.process || t.connected === false) }) })), null, 2));
