import { expect, test, type Page } from '@playwright/test';

test.skip(process.env.PROCESS_INTEGRATION_TEST !== '1', 'Opt-in Process ownership acceptance.');

async function ready(page: Page, home: boolean) {
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await expect(page.locator('#process')).toHaveCount(home ? 1 : 0);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1100);
}

for (const touch of [false, true]) {
  test(`Process ownership interactions: ${touch ? 'touch' : 'pointer'}`, async ({ browser, baseURL }, testInfo) => {
    test.setTimeout(180_000);
    const context = await browser.newContext({ baseURL, viewport: touch
      ? { width: 375, height: 812 } : { width: 1440, height: 900 }, hasTouch: touch, isMobile: touch });
    const response = await context.request.get('/js/monolog-runtime.js');
    expect(response.ok()).toBe(true);
    const runtime = await response.text();
    // Derive locations from the served repair, including columns on minified lines.
    const ranges = [
      ['lenis', 'function oe(', '}var Ye='],
      ['split', 'function ie(', 'function Te('],
      ['resize', 'function at(', 'function rt('],
      ['clock', 'function it(', 'function st('],
      ['cursor', 'const frames=new Set(),scales=new Set();', '}var M,k,D,Z,Me;'],
      ['menu', 'function ke(', '}var T;'],
      ['modal', 'function Xe(', '}var qe='],
    ].map(([owner, start, end]) => {
      const from = runtime.indexOf(start, runtime.indexOf('/* --- bundle.js --- */'));
      const to = runtime.indexOf(end, from);
      expect(from, `${owner} start marker`).toBeGreaterThanOrEqual(0);
      expect(to, `${owner} end marker`).toBeGreaterThan(from);
      const location = (offset: number) => {
        const lines = runtime.slice(0, offset).split('\n');
        return { line: lines.length - 1, column: lines[lines.length - 1].length };
      };
      return { owner, from: location(from), to: location(to) };
    });
    await context.addInitScript(({ ranges }) => {
      const w = window as any;
      const ownerAt = (line: number, column: number) => ranges.find(range =>
        (line > range.from.line || line === range.from.line && column >= range.from.column)
        && (line < range.to.line || line === range.to.line && column < range.to.column))?.owner;
      const ownerFromStack = (stack: string) => {
        const pattern = /\/js\/monolog-runtime\.js:(\d+):(\d+)/g;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(stack))) {
          const owner = ownerAt(Number(match[1]) - 1, Number(match[2]) - 1);
          if (owner) return owner;
        }
      };
      let generation = 0;
      let executing: any;
      const ownership = () => executing || { owner: ownerFromStack(new Error().stack || ''), generation };
      const run = (scope: any, callback: any, receiver: any, args: any[]) => {
        const previous = executing;
        executing = scope;
        try { return callback.apply(receiver, args); } finally { executing = previous; }
      };
      w.__ownership = { generation: () => generation, ownerAt, listeners: [] };
      const frames = new Map<number, any>();
      w.__ownedFrames = frames;
      const request = window.requestAnimationFrame.bind(window);
      const cancel = window.cancelAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => {
        // RAF loops in shared libraries can first start inside an owned callback;
        // attribute only direct runtime call sites so those globals stay unscoped.
        const scope = { owner: ownerFromStack(new Error().stack || ''), generation };
        const id = request(time => { frames.delete(id); run(scope, callback, window, [time]); });
        frames.set(id, { ...scope, source: String(callback) });
        return id;
      };
      window.cancelAnimationFrame = id => { frames.delete(id); cancel(id); };
      const cursorFrames = () => Array.from(frames.values()).filter(record => record.owner === 'cursor').length;
      const add = EventTarget.prototype.addEventListener;
      const remove = EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener = function(type, callback, options) {
        const scope = ownership();
        const runtimeProcess = this instanceof Element && this.closest('#process')
          && /\/js\/monolog-runtime\.js:/.test(new Error().stack || '');
        if (callback && (scope.owner || runtimeProcess)) {
          w.__ownership.listeners.push({ ...scope, owner: scope.owner || 'process', type,
            target: new WeakRef(this), callback: new WeakRef(callback),
            capture: typeof options === 'boolean' ? options : !!options?.capture, active: true });
        }
        return add.call(this, type, callback, options);
      };
      EventTarget.prototype.removeEventListener = function(type, callback, options) {
        const capture = typeof options === 'boolean' ? options : !!options?.capture;
        for (const record of w.__ownership.listeners) if (record.active && record.type === type
          && record.target.deref() === this && record.callback.deref() === callback && record.capture === capture) {
          record.active = false;
        }
        return remove.call(this, type, callback, options);
      };
      w.__cursorDisposals = [];
      // Inject queued work immediately before the actual cursor leave cleanup.
      const forEach = Set.prototype.forEach;
      Set.prototype.forEach = function(callback, thisArg) {
        if (this !== w.pageCleanupFunctions) return forEach.call(this, callback, thisArg);
        const result = forEach.call(this, (value, key, set) => {
          if (!String(value).includes('r.tween.kill()')) return callback.call(thisArg, value, key, set);
          window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
          window.dispatchEvent(new MouseEvent('mousedown', { button: 0 }));
          window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
          const before = cursorFrames();
          callback.call(thisArg, value, key, set);
          const after = cursorFrames();
          value();
          w.__cursorDisposals.push({ before, after, twice: cursorFrames() });
        });
        generation++;
        return result;
      };
      w.__observerRecords = [];
      for (const kind of ['ResizeObserver', 'IntersectionObserver', 'MutationObserver']) {
        const Original = w[kind];
        w[kind] = class extends Original {
          record: any;
          constructor(callback: any) {
            const scope = ownership();
            super((...args: any[]) => run(scope, callback, this, args));
            this.record = { ...scope, kind, stack: new Error().stack, targets: new Set() };
            w.__observerRecords.push({ owner: new WeakRef(this), record: this.record });
          }
          observe(target: Element, options?: any) {
            for (const ref of this.record.targets) if (ref.deref() === target) this.record.targets.delete(ref);
            this.record.targets.add(new WeakRef(target));
            return super.observe(target, options);
          }
          unobserve(target: Element) {
            for (const ref of this.record.targets) if (ref.deref() === target) this.record.targets.delete(ref);
            return super.unobserve(target);
          }
          disconnect() { this.record.targets.clear(); return super.disconnect(); }
        };
      }
      const timers = new Map();
      w.__ownedTimers = timers;
      for (const kind of ['Timeout', 'Interval']) {
        const set = w[`set${kind}`].bind(window), clear = w[`clear${kind}`].bind(window);
        w[`set${kind}`] = (callback: any, delay: number, ...args: any[]) => {
          const stack = new Error().stack;
          const scope = ownership();
          const wrapped = typeof callback === 'function' ? (...values: any[]) => {
            if (kind === 'Timeout') timers.delete(id);
            return run(scope, callback, window, values);
          } : callback;
          const id = set(wrapped, delay, ...args);
          timers.set(id, { ...scope, kind, delay, stack });
          return id;
        };
        w[`clear${kind}`] = (id: number) => { timers.delete(id); return clear(id); };
      }
    }, { ranges });
    const page = await context.newPage();
    const errors: string[] = [], observations: unknown[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' || /hydrat|did not match/i.test(message.text())) errors.push(message.text());
    });
    const cdp = await context.newCDPSession(page);
    const scripts = new Map<string, string>();
    cdp.on('Debugger.scriptParsed', script => scripts.set(script.scriptId, script.url));
    await cdp.send('Runtime.enable');
    await cdp.send('Debugger.enable');
    const pageCensus = new Map<string, unknown>();
    const cursorRange = ranges.find(range => range.owner === 'cursor')!;
    async function snapshot(phase: string) {
      const { result } = await cdp.send('Runtime.evaluate', { expression: 'window' });
      const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId! });
      const cursor: string[] = [];
      for (const listener of listeners) if (scripts.get(listener.scriptId)?.endsWith('/js/monolog-runtime.js')
        && ['mousemove', 'scroll', 'mousedown', 'mouseup'].includes(listener.type)
        && (listener.lineNumber > cursorRange.from.line
          || listener.lineNumber === cursorRange.from.line && listener.columnNumber >= cursorRange.from.column)
        && (listener.lineNumber < cursorRange.to.line
          || listener.lineNumber === cursorRange.to.line && listener.columnNumber < cursorRange.to.column)
      ) cursor.push(listener.type);
      await cdp.send('Runtime.releaseObject', { objectId: result.objectId! });
      const state = await page.evaluate(() => {
        const w = window as any;
        const generation = w.__ownership.generation();
        const scoped = (record: any) => !!record.owner;
        const describeTarget = (target: EventTarget) => target instanceof Element
          ? { tag: target.nodeName, connected: target.isConnected, process: !!target.closest('#process') }
          : { tag: target === window ? 'WINDOW' : target === document ? 'DOCUMENT' : target.constructor.name,
              connected: true, process: false };
        const ownedListeners = w.__ownership.listeners.filter(scoped).map((record: any) => ({
          owner: record.owner, generation: record.generation, type: record.type, active: record.active,
          target: record.target.deref() ? describeTarget(record.target.deref()) : null,
        }));
        const processListeners = w.__ownership.listeners.filter((record: any) => record.active
          && record.target.deref() instanceof Element && record.target.deref().closest('#process'));
        return { generation, disposals: w.__cursorDisposals,
          timers: [...w.__ownedTimers.values()], frames: [...w.__ownedFrames.values()],
          ownedListeners,
          lenisTicks: w.gsap.ticker._listeners.filter((callback: any) => String(callback).includes('instance.raf(time*1000)')).length,
          retiredTicks: (w.__outgoingTicks || []).filter((callback: any) => w.gsap.ticker._listeners.includes(callback)).length,
          observers: w.__observerRecords.filter((entry: any) => entry.owner.deref()).map(({ record }: any) => ({
            owner: record.owner, generation: record.generation, kind: record.kind, stack: record.stack,
            targets: [...record.targets].map((ref: any) => ref.deref()).filter(Boolean)
              .map((target: Element) => ({ tag: target.nodeName, connected: target.isConnected })),
          })),
          census: { cleanupFunctions: w.pageCleanupFunctions.size,
            tickerListeners: w.gsap.ticker._listeners.length,
            processElements: document.querySelectorAll('#process *').length,
            processVideos: document.querySelectorAll('#process video').length,
            ownedObservers: w.__observerRecords.filter((entry: any) => entry.owner.deref()
              && entry.record.owner && entry.record.targets.size && entry.record.generation === generation).length,
            ownedTimers: [...w.__ownedTimers.values()].filter((record: any) => record.owner
              && record.generation === generation).length },
          detachedTriggers: w.ScrollTrigger.getAll().filter((t: any) => t.trigger && !t.trigger.isConnected).length,
          processTriggers: w.ScrollTrigger.getAll().filter((t: any) => t.trigger?.closest?.('#process')).length };
      });
      observations.push({ phase, cursor, ...state });
      expect(cursor.sort()).toEqual(touch ? [] : ['mousedown', 'mousemove', 'mouseup', 'scroll']);
      expect(state.detachedTriggers).toBe(0);
      expect(state.processTriggers).toBe(phase.startsWith('work') ? 0 : 3);
      expect(state.lenisTicks).toBe(1);
      expect(state.retiredTicks).toBe(0);
      expect(state.frames.filter((record: any) => record.owner && record.generation < state.generation)).toEqual([]);
      expect(state.timers.filter((record: any) => record.owner && record.generation < state.generation)).toEqual([]);
      expect(state.observers.filter((record: any) => record.owner && record.generation < state.generation)
        .flatMap((record: any) => record.targets).filter((target: any) => !target.connected)).toEqual([]);
      expect(state.ownedListeners.filter((record: any) => record.generation < state.generation
        && record.active && (!record.target || !record.target.connected))).toEqual([]);
      const pageKind = phase.startsWith('work') ? 'work' : 'home';
      if (!pageCensus.has(pageKind)) pageCensus.set(pageKind, state.census);
      expect(state.census).toEqual(pageCensus.get(pageKind));
      for (const disposal of state.disposals) {
        expect(disposal.before).toBeGreaterThan(0);
        expect(disposal.after).toBe(0);
        expect(disposal.twice).toBe(0);
      }
    }
    try {
      await page.goto('/');
      await ready(page, true);
      await snapshot('direct');
      for (let cycle = 1; cycle <= 3; cycle++) {
        const links = page.locator('#process [data-video="playpause"]');
        for (let index = 0; index < 3; index++) {
          const link = links.nth(index);
          await link.evaluate(element => element.scrollIntoView({ block: 'center' }));
          await expect.poll(() => link.locator('video').evaluate((video: HTMLVideoElement) =>
            !video.paused && video.currentTime > 0 && !video.error)).toBe(true);
          if (touch) {
            await expect(page.locator('[data-cursor]')).not.toBeVisible();
          } else {
            await link.hover();
            await expect(page.locator('[data-cursor-text-target]')).toHaveText((await link.getAttribute('data-cursor-text'))!);
            await expect(page.locator('[data-cursor]')).toHaveAttribute('data-cursor', /^active(-edge)?$/);
            const box = (await link.boundingBox())!;
            const x = box.x + box.width / 2, y = box.y + box.height / 2;
            await page.mouse.move(x, y);
            await expect.poll(() => page.locator('[data-cursor]').evaluate(element =>
              Number((window as any).gsap.getProperty(element, 'x')))).toBeCloseTo(x, 0);
            await page.mouse.down();
            await expect.poll(() => page.locator('[data-cursor]').evaluate(element =>
              Number((window as any).gsap.getProperty(element, 'scaleX')))).toBeCloseTo(0.9, 2);
            // Release off-link to avoid opening a real external destination.
            await page.mouse.move(0, 0);
            await page.mouse.up();
            await page.evaluate(() => window.dispatchEvent(new MouseEvent('mouseup', { button: 0 })));
            await expect.poll(() => page.locator('[data-cursor]').evaluate(element =>
              Number((window as any).gsap.getProperty(element, 'scaleX')))).toBeCloseTo(1, 2);
          }
        }
        await page.evaluate(() => {
          const w = window as any;
          w.__outgoingVideos = Array.from(document.querySelectorAll('#process video'));
          w.__outgoingTicks = [...(w.__outgoingTicks || []), ...w.gsap.ticker._listeners.filter(
            (callback: any) => String(callback).includes('instance.raf(time*1000)'))];
        });
        await page.evaluate(() => (window as any).barba.go('/work'));
        await ready(page, false);
        await snapshot(`work-${cycle}`);
        expect(await page.evaluate(() => (window as any).__outgoingVideos.every(
          (video: HTMLVideoElement) => !video.isConnected && video.paused))).toBe(true);
        await page.evaluate(() => {
          const w = window as any;
          w.__outgoingTicks.push(...w.gsap.ticker._listeners.filter(
            (callback: any) => String(callback).includes('instance.raf(time*1000)')));
        });
        await page.goBack();
        await ready(page, true);
        await snapshot(`back-${cycle}`);
      }
      expect(await page.evaluate(() => (window as any).__cursorDisposals.length)).toBe(touch ? 0 : 6);
      expect(errors).toEqual([]);
    } finally {
      await testInfo.attach('ownership-interactions', { body: JSON.stringify({ observations, errors,
        limitations: ['Chromium emulation; observer/timer census is diagnostic, not heap reachability.',
          'Registry hook injects pending cursor work at cleanup; native pointer actions tested separately.'] }, null, 2),
        contentType: 'application/json' });
      await context.close();
    }
  });
}
