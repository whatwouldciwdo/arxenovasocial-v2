import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium, expect } from '@playwright/test';

const output = path.resolve(process.env.FAQ_OUTPUT || 'artifacts/faq/baseline');
const baseURL = process.env.BASELINE_URL || 'http://127.0.0.1:3200';
const home = await readFile('data/home.html', 'utf8');
const sections = Array.from(home.matchAll(/<section\b[^>]*\bid="faqs"[^>]*>[\s\S]*?<\/section>/g));
if (sections.length !== 1) throw new Error('Expected exactly one FAQ section');
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'legacy-section.html'), sections[0][0]);
const sourceHashes = {};
for (const file of ['data/home.html', 'app/page.tsx', 'app/layout.tsx', 'public/js/monolog-runtime.js']) {
  sourceHashes[file] = createHash('sha256').update(await readFile(file)).digest('hex');
}
const browser = await chromium.launch();
const profiles = [];
try {
  for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 },
    { width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    const context = await browser.newContext({ baseURL, viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const events = [];
    const states = [];
    page.on('pageerror', error => events.push({ type: 'pageerror', text: error.message }));
    page.on('console', message => {
      if (['error', 'warning'].includes(message.type())) events.push({ type: message.type(), text: message.text() });
    });
    page.on('response', response => {
      if (response.status() >= 400) events.push({ type: 'http', text: `${response.status()} ${response.url()}` });
    });
    const name = `${viewport.width}x${viewport.height}`;
    try {
      expect((await page.goto('/'))?.status()).toBe(200);
      await expect.poll(() => page.evaluate(() => window.barba?.transitions?.isRunning)).toBe(false);
      await page.evaluate(() => document.fonts.ready);
      const section = page.locator('#faqs');
      await section.scrollIntoViewIfNeeded();
      await section.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.waitForTimeout(1200);
      const inventory = await section.evaluate(root => Array.from([root, ...root.querySelectorAll('*')], element => {
        const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
        return { tag: element.tagName, attributes: Object.fromEntries(Array.from(element.attributes, a => [a.name, a.value])),
          text: element.childElementCount ? null : element.textContent,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          styles: Object.fromEntries(['display', 'position', 'font-family', 'font-size', 'line-height', 'object-fit',
            'object-position', 'overflow', 'height'].map(key => [key, style.getPropertyValue(key)])) };
      }));
      async function capture(state) {
        states.push({ state, items: await section.locator('[data-accordion-status]').evaluateAll(items => items.map(item => ({
          status: item.getAttribute('data-accordion-status'), html: item.outerHTML,
        }))) });
        await section.screenshot({ path: path.join(output, `${name}-${state}.png`), animations: 'disabled',
          style: '[data-cursor] { visibility: hidden !important; }' });
      }
      await capture('initial');
      const toggles = section.locator('[data-accordion-toggle]');
      expect(await toggles.count()).toBeGreaterThan(0);
      for (let i = 0; i < await toggles.count(); i++) {
        await toggles.nth(i).click();
        await page.waitForTimeout(700);
        await capture(`toggle-${i + 1}`);
      }
      profiles.push({ name, viewport, inventory, states, events });
      expect(events.filter(event => event.type !== 'warning' || /hydrat|did not match|server html/i.test(event.text))).toEqual([]);
    } finally {
      await writeFile(path.join(output, `${name}.json`), JSON.stringify({ viewport, states, events }, null, 2));
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(path.join(output, 'audit.json'), JSON.stringify({ baseURL, generatedAt: new Date().toISOString(),
    sourceHashes, profiles, limitations: ['Baseline observations, not candidate acceptance.',
      'Chromium pointer profiles; keyboard/touch/lifecycle tested separately.', 'Screenshots are not manual sign-off.'] }, null, 2));
}
console.log(`FAQ baseline captured: ${profiles.length} viewports in ${output}`);
