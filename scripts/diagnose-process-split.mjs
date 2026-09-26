import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

// Diagnostic only: instrument the served fixture, never the application source.
const output = process.env.SPLIT_DIAGNOSTICS_OUTPUT;
if (!output) throw new Error('Set SPLIT_DIAGNOSTICS_OUTPUT to a new evidence path');
const browser = await chromium.launch();
const observations = [];
try {
  for (const touch of [false, true]) {
    const context = await browser.newContext({
      viewport: touch ? { width: 375, height: 812 } : { width: 1440, height: 900 },
      hasTouch: touch, isMobile: touch,
    });
    const page = await context.newPage();
    await page.route('**/js/monolog-runtime.js', async route => {
      const response = await route.fetch();
      const source = await response.text();
      const start = source.indexOf('function St(e)');
      const end = source.indexOf('function bt(e)', start);
      const original = source.slice(start, end);
      if (start < 0 || !original.includes('onSplit(u){')) throw new Error('Unknown highlight boundary');
      const instrumented = original.replace('onSplit(u){', `onSplit(u){
        window.__highlightSplit=u;
        (window.__splitEvents??=[]).push({fonts:document.fonts.status,time:performance.now(),
          previousOwned:!!u._data.anim,
          triggers:ScrollTrigger.getAll().filter(t=>t.trigger===o).length});`);
      await route.fulfill({ response, body: source.replace(original, instrumented) });
    });
    // Routing disables HTTP cache. Warm refers to fonts already loaded in this
    // document, not a claim about the browser disk cache.
    for (const phase of ['cold-document', 'reload']) {
      if (phase === 'reload') await page.reload();
      else await page.goto(process.env.BASELINE_URL || 'http://127.0.0.1:3100/');
      await expect.poll(() => page.evaluate(() => window.barba?.transitions?.isRunning), { timeout: 30000 }).toBe(false);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1000);
      for (const resplit of [false, true]) {
        observations.push({ touch, phase, resplit, state: await page.evaluate(force => {
          const split = window.__highlightSplit;
          const before = ScrollTrigger.getAll().filter(t => t.trigger === split.elements[0]);
          if (force) split.split();
          const after = ScrollTrigger.getAll().filter(t => t.trigger === split.elements[0]);
          return { fonts: document.fonts.status, events: window.__splitEvents,
            ownsAnimation: !!split._data.anim, before: before.length, after: after.length,
            survivingPrevious: before.filter(t => after.includes(t)).length,
            total: ScrollTrigger.getAll().length, scrollY,
            triggers: ScrollTrigger.getAll().map(t => ({ class: t.trigger?.className,
              once: t.vars.once === true, start: t.start, end: t.end, progress: t.progress })) };
        }, resplit) });
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(output, JSON.stringify(observations, null, 2));
}
console.log(JSON.stringify(observations.map(({ state, ...entry }) => ({ ...entry,
  ...state, triggers: undefined })), null, 2));
