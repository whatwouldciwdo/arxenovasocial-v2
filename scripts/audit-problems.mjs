import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium, expect } from '@playwright/test';

const output = process.env.PROBLEMS_OUTPUT || 'artifacts/problems/baseline';
await mkdir(output, { recursive: true });
const sourceHashes = {};
for (const file of ['data/home.html', 'app/page.tsx', 'public/js/monolog-runtime.js', 'public/images/teams/fadel-febrian.jpeg']) {
  sourceHashes[file] = createHash('sha256').update(await readFile(file)).digest('hex');
}
const browser = await chromium.launch();
const profiles = [];
try {
  for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 },
    { width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    const context = await browser.newContext({ baseURL: process.env.BASELINE_URL || 'http://127.0.0.1:3200', viewport });
    const page = await context.newPage(), events = [];
    page.on('pageerror', e => events.push(e.message));
    page.on('console', m => { if (m.type() === 'error') events.push(m.text()); });
    try {
      expect((await page.goto('/'))?.status()).toBe(200);
      await expect.poll(() => page.evaluate(() => window.barba?.transitions?.isRunning)).toBe(false);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator('.problems_home_wrap');
      await root.scrollIntoViewIfNeeded();
      await root.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.waitForTimeout(1200);
      const inventory = await root.evaluate(section => [section, ...section.querySelectorAll('*')].map(el => {
        const rect = el.getBoundingClientRect(), css = getComputedStyle(el);
        return { tag: el.tagName, attributes: Object.fromEntries(Array.from(el.attributes, a => [a.name, a.value])),
          text: el.children.length ? null : el.textContent,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          styles: Object.fromEntries(['display','position','object-fit','object-position','font-size','line-height','grid-template-columns']
            .map(key => [key, css.getPropertyValue(key)])) };
      }));
      const name = `${viewport.width}x${viewport.height}`;
      await root.screenshot({ path: `${output}/${name}.png`, animations: 'disabled', style: '[data-cursor]{visibility:hidden!important}' });
      const counts = [];
      for (const control of ['[data-slider-next]', '[data-slider-prev]']) {
        await root.locator(control).click();
        await page.waitForTimeout(1500);
        counts.push(await root.locator('[data-dynamic-value]').textContent());
      }
      profiles.push({ viewport, inventory, counts, events });
      expect(events).toEqual([]);
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
  await writeFile(`${output}/audit.json`, JSON.stringify({ sourceHashes, profiles,
    limitations: ['Baseline observations only; not candidate acceptance or manual review.'] }, null, 2));
}
console.log(`Problems baseline: ${profiles.length}/5 viewports`);
