import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const artifactRoot = path.resolve('artifacts/browser');
const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const routes = [
  '/',
  '/work',
  '/projects/mammoth-murals',
  '/projects/oh-architecture',
  '/projects/supersolid',
  '/projects/slik',
  '/projects/hiss-university-of-sydney',
  '/projects/backhouse',
  '/projects/squiggle-university-of-sydney',
];

type BrowserEvent = { type: string; url?: string; text?: string; status?: number; method?: string };

async function installRuntimeCounters(page: Page) {
  await page.addInitScript(() => {
    const state = { listenersAdded: 0, listenersRemoved: 0, rafRequested: 0, rafCancelled: 0 };
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const raf = window.requestAnimationFrame.bind(window);
    const cancelRaf = window.cancelAnimationFrame.bind(window);
    Object.defineProperty(window, '__baselineCounters', { value: state });
    EventTarget.prototype.addEventListener = function (...args) {
      state.listenersAdded += 1;
      return add.apply(this, args);
    };
    EventTarget.prototype.removeEventListener = function (...args) {
      state.listenersRemoved += 1;
      return remove.apply(this, args);
    };
    window.requestAnimationFrame = (callback) => {
      state.rafRequested += 1;
      return raf(callback);
    };
    window.cancelAnimationFrame = (handle) => {
      state.rafCancelled += 1;
      return cancelRaf(handle);
    };
  });
}

function observe(page: Page) {
  const events: BrowserEvent[] = [];
  page.on('console', (message) => events.push({ type: `console:${message.type()}`, text: message.text() }));
  page.on('pageerror', (error) => events.push({ type: 'pageerror', text: error.stack || error.message }));
  page.on('requestfailed', (request) => events.push({
    type: 'requestfailed', method: request.method(), url: request.url(), text: request.failure()?.errorText,
  }));
  page.on('response', (response) => {
    if (response.status() >= 400) events.push({
      type: 'response', method: response.request().method(), status: response.status(), url: response.url(),
    });
  });
  return events;
}

async function settle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    await Promise.race([
      Promise.all([
        document.fonts.ready,
        Promise.all(Array.from(document.images).map((image) => image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          }))),
      ]),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function waitForBarbaReady(page: Page, namespace: string) {
  await expect(page.locator(`[data-barba="container"][data-barba-namespace="${namespace}"]`)).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => {
    const runtime = window as typeof window & { barba?: { transitions?: { isRunning: boolean } } };
    return runtime.barba?.transitions?.isRunning;
  })).toBe(false);
}

async function snapshot(page: Page) {
  const evaluateSnapshot = () => page.evaluate(() => {
    const rectangle = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    const textMetrics = (element: Element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const lines = new Set(Array.from(range.getClientRects()).map((rect) => Math.round(rect.top)));
      return { selector: element.className, text: element.textContent?.trim(), lines: lines.size, rect: rectangle(element) };
    };
    const globals = window as typeof window & {
      ScrollTrigger?: { getAll?: () => unknown[] };
      gsap?: { ticker?: { listeners?: () => unknown[] } };
      __baselineCounters?: Record<string, number>;
      pageCleanupFunctions?: Set<unknown>;
    };
    return {
      url: location.href,
      title: document.title,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      fontsStatus: document.fonts.status,
      body: Object.fromEntries(Array.from(document.body.attributes).map(({ name, value }) => [name, value])),
      sections: Array.from(document.querySelectorAll('main section, [data-barba="container"] > section')).map((element) => ({
        id: element.id, className: element.className, rect: rectangle(element),
      })),
      textWrapping: Array.from(document.querySelectorAll('h1, h2, h3, .process_home_content_title')).map(textMetrics),
      runtime: {
        barbaContainers: document.querySelectorAll('[data-barba="container"]').length,
        scrollTriggers: globals.ScrollTrigger?.getAll?.().length ?? null,
        gsapTickerListeners: globals.gsap?.ticker?.listeners?.().length ?? null,
        cleanupFunctions: globals.pageCleanupFunctions?.size ?? null,
        canvas: document.querySelectorAll('canvas').length,
        audio: document.querySelectorAll('audio').length,
        video: document.querySelectorAll('video').length,
        counters: globals.__baselineCounters ?? null,
      },
    };
  });
  let lastError: unknown;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await evaluateSnapshot();
    } catch (error) {
      lastError = error;
      if (!String(error).includes('Execution context was destroyed')) throw error;
      await page.waitForTimeout(1000);
    }
  }
  throw lastError;
}

async function interactionSnapshot(page: Page) {
  return page.evaluate(() => {
    const describe = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        selector,
        attributes: Object.fromEntries(Array.from(element.attributes).map(({ name, value }) => [name, value])),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        style: {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          pointerEvents: style.pointerEvents,
          transform: style.transform,
          clipPath: style.clipPath,
        },
      };
    };
    const howler = (window as typeof window & {
      Howler?: {
        ctx?: { state?: string };
        _howls?: Array<{ playing?: () => boolean; state?: () => string }>;
      };
    }).Howler;
    return {
      timestamp: new Date().toISOString(),
      url: location.href,
      scroll: { x: scrollX, y: scrollY },
      capabilities: {
        hover: matchMedia('(hover: hover)').matches,
        finePointer: matchMedia('(pointer: fine)').matches,
        coarsePointer: matchMedia('(pointer: coarse)').matches,
        touchPoints: navigator.maxTouchPoints,
      },
      root: {
        htmlClass: document.documentElement.className,
        body: Object.fromEntries(Array.from(document.body.attributes).map(({ name, value }) => [name, value])),
        activeElement: document.activeElement instanceof HTMLElement
          ? { tagName: document.activeElement.tagName, className: document.activeElement.className, ariaLabel: document.activeElement.getAttribute('aria-label') }
          : null,
      },
      controls: {
        menu: describe('[data-menu-btn]'),
        about: describe('.about_modal_wrap'),
        aboutOverlay: describe('.about_overlay_close'),
        sound: describe('.navbar_left_sound_btn'),
        cursor: describe('[data-cursor]'),
        cursorText: document.querySelector('[data-cursor-text-target]')?.textContent?.trim() ?? null,
        transition: describe('.transition_screen'),
      },
      sound: {
        enabledStorage: localStorage.getItem('monolog_sound_enabled'),
        ariaPressed: document.querySelector('.navbar_left_sound_btn')?.getAttribute('aria-pressed') ?? null,
        ariaLabel: document.querySelector('.navbar_left_sound_btn')?.getAttribute('aria-label') ?? null,
        contextState: howler?.ctx?.state ?? null,
        howlCount: howler?._howls?.length ?? null,
        playingCount: howler?._howls?.filter((sound) => sound.playing?.()).length ?? null,
        states: howler?._howls?.map((sound) => sound.state?.() ?? null) ?? null,
      },
      videos: Array.from(document.querySelectorAll('video')).map((video, index) => ({
        index,
        currentTime: video.currentTime,
        duration: Number.isFinite(video.duration) ? video.duration : null,
        paused: video.paused,
        muted: video.muted,
        loop: video.loop,
        readyState: video.readyState,
        networkState: video.networkState,
      })),
      animations: document.getAnimations().slice(0, 200).map((animation) => ({
        playState: animation.playState,
        currentTime: typeof animation.currentTime === 'number' ? animation.currentTime : null,
        playbackRate: animation.playbackRate,
        target: animation.effect instanceof KeyframeEffect && animation.effect.target instanceof Element
          ? `${animation.effect.target.tagName.toLowerCase()}.${animation.effect.target.className}`
          : null,
      })),
      sections: ['.hero_home_wrap', '.problems_home_wrap', '#process', '#faqs', '.cta_home_wrap', '.footer_wrap']
        .map(describe),
    };
  });
}

async function captureInteractionState(
  page: Page,
  records: unknown[],
  phase: string,
  screenshotDirectory: string,
) {
  await page.waitForTimeout(750);
  records.push({ phase, snapshot: await interactionSnapshot(page) });
  await page.screenshot({ path: path.join(screenshotDirectory, `${phase}.png`) });
}

async function waitForInteractionRuntime(page: Page) {
  await page.locator('.navbar_left_sound_btn').waitFor({ state: 'attached' });
  await expect(page.locator('.navbar_left_sound_btn')).toHaveAttribute('aria-pressed', /^(true|false)$/);
}

async function saveJson(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

test.beforeEach(async ({ page }) => installRuntimeCounters(page));

test('capture visual, console, network, dimensions, and wrapping matrix', async ({ page }, testInfo) => {
  const events = observe(page);
  const manifest: unknown[] = [];
  await mkdir(path.join(artifactRoot, 'screenshots'), { recursive: true });
  for (const route of routes) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const eventStart = events.length;
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${route} must respond successfully`).toBeLessThan(400);
      await settle(page);
      expect(await page.locator('[data-barba="container"]').count()).toBe(1);
      const name = `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '--')}--${viewport.width}x${viewport.height}--legacy`;
      await page.screenshot({ path: path.join(artifactRoot, 'screenshots', `${name}.png`), fullPage: true });
      const routeEvents = events.slice(eventStart);
      const localFailures = routeEvents.filter((event) => event.url?.startsWith(testInfo.project.use.baseURL as string)
        && (event.type === 'requestfailed' || event.type === 'response'));
      manifest.push({ route, viewport, httpStatus: response?.status(), snapshot: await snapshot(page), events: routeEvents });
      expect(localFailures, `local network failures on ${route}`).toEqual([]);
      expect(routeEvents.filter((event) => event.type === 'pageerror'), `page errors on ${route}`).toEqual([]);
    }
  }
  await saveJson(path.join(artifactRoot, 'capture-manifest.json'), manifest);
  await saveJson(path.join(artifactRoot, 'browser-events.json'), events);
});

test('record interactions and three Barba navigation cycles', async ({ browser, baseURL }) => {
  const videoDirectory = path.join(artifactRoot, 'videos');
  await mkdir(videoDirectory, { recursive: true });
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDirectory, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await installRuntimeCounters(page);
  const events = observe(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await settle(page);
  const lifecycle = [{ phase: 'initial', snapshot: await snapshot(page) }];
  const documentStartedAt = await page.evaluate(() => performance.timeOrigin);

  const faq = page.locator('[data-accordion-toggle]:visible').first();
  if (await faq.count()) {
    await faq.click();
    await page.waitForTimeout(750);
    lifecycle.push({ phase: 'faq-open', snapshot: await snapshot(page) });
  }
  const process = page.locator('#process');
  await process.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
  lifecycle.push({ phase: 'process-visible', snapshot: await snapshot(page) });

  for (let cycle = 1; cycle <= 3; cycle += 1) {
    await waitForBarbaReady(page, 'home');
    await page.locator('a[href="/work"]').first().dispatchEvent('click');
    await page.waitForURL(/\/work\/?$/);
    await page.waitForTimeout(2500);
    await waitForBarbaReady(page, 'work');
    lifecycle.push({ phase: `cycle-${cycle}-work`, snapshot: await snapshot(page) });
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await page.waitForURL((url) => url.pathname === '/');
    await page.waitForTimeout(2500);
    await waitForBarbaReady(page, 'home');
    expect(await page.evaluate(() => performance.timeOrigin), 'Barba must not fall back to a document reload').toBe(documentStartedAt);
    lifecycle.push({ phase: `cycle-${cycle}-home`, snapshot: await snapshot(page) });
  }

  await page.goForward({ waitUntil: 'domcontentloaded' });
  await page.waitForURL(/\/work\/?$/);
  await page.waitForTimeout(2500);
  await waitForBarbaReady(page, 'work');
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(documentStartedAt);
  lifecycle.push({ phase: 'forward-work', snapshot: await snapshot(page) });

  expect(await page.locator('[data-barba="container"]').count()).toBe(1);
  await saveJson(path.join(artifactRoot, 'lifecycle.json'), { lifecycle, events });
  await context.close();
});

for (const scenario of ['menu-keyboard', 'about', 'sound', 'cursor', 'animations'] as const) {
test(`record desktop interaction: ${scenario}`, async ({ browser, baseURL }, testInfo) => {
  const screenshotDirectory = path.join(artifactRoot, 'interaction-states');
  const videoDirectory = path.join(artifactRoot, 'interaction-videos');
  await mkdir(screenshotDirectory, { recursive: true });
  await mkdir(videoDirectory, { recursive: true });
  const records: unknown[] = [];

  const desktop = await browser.newContext({
    baseURL,
    viewport: { width: scenario === 'menu-keyboard' ? 767 : 1440, height: 900 },
    recordVideo: { dir: videoDirectory, size: { width: 1440, height: 900 } },
  });
  await desktop.addInitScript(() => localStorage.removeItem('monolog_sound_enabled'));
  const desktopPage = await desktop.newPage();
  await installRuntimeCounters(desktopPage);
  const desktopEvents = observe(desktopPage);
  let failure: unknown;
  try {
  await desktopPage.goto('/', { waitUntil: 'domcontentloaded' });
  await settle(desktopPage);
  await waitForInteractionRuntime(desktopPage);
  await captureInteractionState(desktopPage, records, `desktop-${scenario}-initial`, screenshotDirectory);

  if (scenario === 'menu-keyboard') {
  const menu = desktopPage.locator('[data-menu-btn]');
  await expect(menu).toBeVisible();
  await expect.poll(() => desktopPage.locator('.menu_overlay_close').evaluate(
    (element) => (element as HTMLElement).style.pointerEvents,
  )).toBe('none');
  await menu.focus();
  await expect(menu).toBeFocused();
  await desktopPage.keyboard.press('Enter');
  await expect(desktopPage.locator('body')).toHaveAttribute('data-navigation-status', 'is-open');
  await captureInteractionState(desktopPage, records, 'desktop-menu-keyboard-open', screenshotDirectory);
  await desktopPage.keyboard.press('Escape');
  await expect(desktopPage.locator('body')).toHaveAttribute('data-navigation-status', 'is-closed');
  await captureInteractionState(desktopPage, records, 'desktop-menu-escape-closed', screenshotDirectory);
  }

  if (scenario === 'about') {
  await desktopPage.locator('[data-open-modal]:visible').first().click();
  await expect(desktopPage.locator('body')).toHaveAttribute('data-about-status', 'is-open');
  await captureInteractionState(desktopPage, records, 'desktop-about-open', screenshotDirectory);
  await desktopPage.keyboard.press('Escape');
  await expect(desktopPage.locator('body')).toHaveAttribute('data-about-status', 'is-closed');
  await captureInteractionState(desktopPage, records, 'desktop-about-escape-closed', screenshotDirectory);
  }

  if (scenario === 'sound') {
  const sound = desktopPage.locator('.navbar_left_sound_btn');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await captureInteractionState(desktopPage, records, 'desktop-sound-enabled', screenshotDirectory);
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await captureInteractionState(desktopPage, records, 'desktop-sound-disabled', screenshotDirectory);
  }

  if (scenario === 'cursor') {
  const cursorTarget = desktopPage.locator('#process [data-cursor-hover]').first();
  await cursorTarget.scrollIntoViewIfNeeded();
  await cursorTarget.hover();
  await expect(desktopPage.locator('[data-cursor]')).toHaveAttribute('data-cursor', /active/);
  await captureInteractionState(desktopPage, records, 'desktop-cursor-process-hover', screenshotDirectory);
  await desktopPage.mouse.move(5, 5);
  await captureInteractionState(desktopPage, records, 'desktop-cursor-release', screenshotDirectory);
  }

  if (scenario === 'animations') {
  for (const [name, selector] of [
    ['hero', '.hero_home_wrap'],
    ['problems', '.problems_home_wrap'],
    ['process-start', '#process'],
    ['faqs', '#faqs'],
    ['cta', '.cta_home_wrap'],
    ['footer', '.footer_wrap'],
  ] as const) {
    await desktopPage.locator(selector).scrollIntoViewIfNeeded();
    await captureInteractionState(desktopPage, records, `desktop-animation-${name}`, screenshotDirectory);
  }
  }

  expect(desktopEvents.filter((event) => event.type === 'pageerror'), 'desktop interaction page errors').toEqual([]);
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    try {
      await saveJson(path.join(artifactRoot, `interaction-desktop-${scenario}.json`), {
        scenario, profile: 'desktop', viewport: desktopPage.viewportSize(),
        status: failure ? 'failed' : testInfo.status,
        errors: failure ? [String(failure)] : testInfo.errors.map((error) => error.message),
        records, events: desktopEvents,
      });
    } finally {
      await desktop.close();
    }
  }
});
}

for (const scenario of ['menu', 'about', 'sound', 'animations'] as const) {
test(`record touch interaction: ${scenario}`, async ({ browser, baseURL }, testInfo) => {
  const screenshotDirectory = path.join(artifactRoot, 'interaction-states');
  const videoDirectory = path.join(artifactRoot, 'interaction-videos');
  await mkdir(screenshotDirectory, { recursive: true });
  await mkdir(videoDirectory, { recursive: true });
  const records: unknown[] = [];
  const touch = await browser.newContext({
    baseURL,
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
    recordVideo: { dir: videoDirectory, size: { width: 375, height: 812 } },
  });
  await touch.addInitScript(() => localStorage.removeItem('monolog_sound_enabled'));
  const touchPage = await touch.newPage();
  await installRuntimeCounters(touchPage);
  const touchEvents = observe(touchPage);
  let failure: unknown;
  try {
  await touchPage.goto('/', { waitUntil: 'domcontentloaded' });
  await settle(touchPage);
  await waitForInteractionRuntime(touchPage);
  await captureInteractionState(touchPage, records, `touch-${scenario}-initial`, screenshotDirectory);

  if (scenario === 'menu' || scenario === 'about') {
  const touchMenu = touchPage.locator('[data-menu-btn]');
  await expect(touchMenu).toBeVisible();
  await touchMenu.tap();
  await expect(touchPage.locator('body')).toHaveAttribute('data-navigation-status', 'is-open');
  await captureInteractionState(touchPage, records, `touch-${scenario}-menu-open`, screenshotDirectory);
  if (scenario === 'menu') {
    await touchMenu.tap();
    await expect(touchPage.locator('body')).toHaveAttribute('data-navigation-status', 'is-closed');
    await captureInteractionState(touchPage, records, 'touch-menu-closed', screenshotDirectory);
  }
  }

  if (scenario === 'about') {
  await touchPage.locator('.menu_wrap [data-open-modal]:visible').first().tap();
  await expect(touchPage.locator('body')).toHaveAttribute('data-about-status', 'is-open');
  await captureInteractionState(touchPage, records, 'touch-about-open', screenshotDirectory);
  await touchPage.locator('.about_modal_wrap [data-close-modal]:visible').first().tap();
  await expect(touchPage.locator('body')).toHaveAttribute('data-about-status', 'is-closed');
  await captureInteractionState(touchPage, records, 'touch-about-closed', screenshotDirectory);
  }

  if (scenario === 'sound') {
  const touchSound = touchPage.locator('.navbar_left_sound_btn');
  await touchSound.tap();
  await expect(touchSound).toHaveAttribute('aria-pressed', 'true');
  await captureInteractionState(touchPage, records, 'touch-sound-enabled', screenshotDirectory);
  await touchSound.tap();
  await expect(touchSound).toHaveAttribute('aria-pressed', 'false');
  await captureInteractionState(touchPage, records, 'touch-sound-disabled', screenshotDirectory);
  }

  if (scenario === 'animations') {
  for (const [name, selector] of [
    ['process', '#process'],
    ['faqs', '#faqs'],
    ['cta', '.cta_home_wrap'],
  ] as const) {
    await touchPage.locator(selector).scrollIntoViewIfNeeded();
    await captureInteractionState(touchPage, records, `touch-animation-${name}`, screenshotDirectory);
  }
  }

  expect(touchEvents.filter((event) => event.type === 'pageerror'), 'touch interaction page errors').toEqual([]);
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    try {
      await saveJson(path.join(artifactRoot, `interaction-touch-${scenario}.json`), {
        scenario, profile: 'touch', viewport: touchPage.viewportSize(),
        status: failure ? 'failed' : testInfo.status,
        errors: failure ? [String(failure)] : testInfo.errors.map((error) => error.message),
        records, events: touchEvents,
      });
    } finally {
      await touch.close();
    }
  }
});
}