import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const output = process.env.PROCESS_OWNERSHIP_OUTPUT;
if (!output) throw new Error('Set PROCESS_OWNERSHIP_OUTPUT to a new evidence path');
const browser = await chromium.launch();
const observations = [];
try {
  for (const touch of [false, true]) {
    const context = await browser.newContext({ viewport: touch
      ? { width: 375, height: 812 } : { width: 1440, height: 900 }, hasTouch: touch, isMobile: touch });
    await context.addInitScript(() => {
      const pending = new Map();
      const request = window.requestAnimationFrame.bind(window);
      const cancel = window.cancelAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => {
        const stack = new Error().stack;
        const id = request(time => { pending.delete(id); callback(time); });
        pending.set(id, stack);
        return id;
      };
      window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
      window.__pendingRaf = pending;
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const scripts = new Map();
    cdp.on('Debugger.scriptParsed', script => scripts.set(script.scriptId, script.url));
    await cdp.send('Runtime.enable');
    await cdp.send('Debugger.enable');
    await page.goto(process.env.BASELINE_URL || 'http://127.0.0.1:3100/');
    async function ready(home) {
      await expect.poll(() => page.evaluate(() => window.barba?.transitions?.isRunning), { timeout: 30000 }).toBe(false);
      await expect(page.locator('#process')).toHaveCount(home ? 1 : 0);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1000);
    }
    async function snapshot(phase) {
      const listeners = {};
      for (const expression of ['window', 'document', 'document.fonts', 'document.body']) {
        const { result } = await cdp.send('Runtime.evaluate', { expression });
        const resultListeners = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
        listeners[expression] = resultListeners.listeners.map(l => ({ type: l.type,
          capture: l.useCapture, passive: l.passive, once: l.once,
          scriptId: l.scriptId, scriptUrl: scripts.get(l.scriptId) || '',
          line: l.lineNumber, column: l.columnNumber,
          handler: l.originalHandler?.description || l.handler?.description }));
        await cdp.send('Runtime.releaseObject', { objectId: result.objectId });
      }
      observations.push({ touch, phase, listeners, state: await page.evaluate(() => ({
        raf: Array.from(window.__pendingRaf.values()),
        ticker: gsap.ticker._listeners.map(fn => String(fn)),
        cleanup: window.pageCleanupFunctions.size,
        triggers: ScrollTrigger.getAll().length,
        detached: ScrollTrigger.getAll().filter(t => t.trigger && !t.trigger.isConnected).length,
        process: ScrollTrigger.getAll().filter(t => t.trigger?.closest?.('#process')).length,
      })) });
    }
    await ready(true);
    await snapshot('direct');
    for (let cycle = 1; cycle <= 3; cycle++) {
      await page.evaluate(() => barba.go('/work'));
      await ready(false);
      await snapshot(`work-${cycle}`);
      await page.goBack();
      await ready(true);
      await snapshot(`back-${cycle}`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(output, JSON.stringify({ observations,
    limitations: ['CDP global-target listeners and pending RAF/ticker census, not heap reachability.',
      'No exhaustive element listener, observer, or timer audit; Chromium emulation only.'] }, null, 2));
}
console.log(JSON.stringify(observations.map(({ touch, phase, listeners, state }) => ({
  touch, phase, listeners: Object.fromEntries(Object.entries(listeners).map(([key, value]) => [key, value.length])),
  raf: state.raf.length, ticker: state.ticker.length, cleanup: state.cleanup,
  triggers: state.triggers, detached: state.detached, process: state.process,
})), null, 2));
