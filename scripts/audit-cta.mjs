import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium, expect } from '@playwright/test';

const output = process.env.CTA_OUTPUT || 'artifacts/cta/baseline';
await mkdir(output, { recursive: true });
const sourceHashes = {};
for (const file of ['data/home.html', 'app/page.tsx', 'public/js/monolog-runtime.js']) {
  sourceHashes[file] = createHash('sha256').update(await readFile(file)).digest('hex');
}
const browser = await chromium.launch();
const profiles = [];
try {
  for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 },
    { width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
    const context = await browser.newContext({ baseURL: process.env.BASELINE_URL || 'http://127.0.0.1:3200', viewport });
    const page = await context.newPage(), events = [];
    page.on('pageerror', error => events.push(error.message));
    page.on('console', message => { if (message.type() === 'error') events.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) events.push(`${response.status()} ${response.url()}`); });
    try {
      expect((await page.goto('/'))?.status()).toBe(200);
      await expect.poll(() => page.evaluate(() => window.barba?.transitions?.isRunning)).toBe(false);
      await page.evaluate(() => document.fonts.ready);
      const root = page.locator('.cta_home_wrap');
      await expect(root).toHaveCount(1);
      await root.scrollIntoViewIfNeeded();
      await root.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.waitForTimeout(1200);
      const state = await root.evaluate(section => {
        const image = section.querySelector('img');
        const imageRect = image.getBoundingClientRect(), imageCSS = getComputedStyle(image);
        const rootRect = section.getBoundingClientRect();
        return {
          root: { width: rootRect.width, height: rootRect.height },
          headings: Array.from(section.querySelectorAll('.cta_home_heading'), element => element.textContent),
          link: (() => { const link = section.querySelector('a'); return { href: link.getAttribute('href'), target: link.getAttribute('target'), rel: link.getAttribute('rel') }; })(),
          awards: Array.from(section.querySelectorAll('.cta_home_svgs'), svg => ({ viewBox: svg.getAttribute('viewBox'), class: svg.getAttribute('class') })),
          testimonial: section.querySelector('.cta_home_testimonial_message').textContent,
          testimonee: section.querySelector('.cta_home_testimonee').textContent,
          image: { src: image.getAttribute('src'), alt: image.getAttribute('alt'), loading: image.getAttribute('loading'),
            width: imageRect.width, height: imageRect.height, fit: imageCSS.objectFit, position: imageCSS.objectPosition,
            transform: imageCSS.transform },
          triggers: window.ScrollTrigger.getAll().filter(trigger => trigger.trigger?.closest?.('.cta_home_wrap')).map(trigger => ({
            start: trigger.start, end: trigger.end, progress: trigger.progress, scrub: trigger.vars.scrub,
          })),
        };
      });
      const name = `${viewport.width}x${viewport.height}`;
      await root.screenshot({ path: `${output}/${name}.png`, animations: 'disabled',
        style: '[data-cursor],.g_grain_overlay{visibility:hidden!important}' });
      profiles.push({ viewport, state, events });
      expect(events).toEqual([]);
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
  await writeFile(`${output}/audit.json`, JSON.stringify({ sourceHashes, profiles,
    limitations: ['Baseline observations only; not candidate acceptance or manual timing/easing review.'] }, null, 2));
}
console.log(`CTA baseline: ${profiles.length}/5 viewports`);
