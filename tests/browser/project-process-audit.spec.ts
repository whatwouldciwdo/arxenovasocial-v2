import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.env.PROJECT_PROCESS_BASELINE_DIR || 'artifacts/project-process');
const sourceFiles = [
  'data/home.html', 'app/page.tsx', 'data/html-home.ts', 'app/layout.tsx',
  'app/globals.css', 'public/css/webflow.shared.css', 'public/css/monolog-custom.css',
  'public/js/monolog-runtime.js',
];
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
async function save(file: string, value: unknown) {
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}
async function source() {
  const files = await Promise.all(sourceFiles.map(async (file) => ({
    file, text: await readFile(path.resolve(file), 'utf8'),
  })));
  const home = files[0].text;
  // The current source has no nested section in Process; fail if that changes.
  const matches = Array.from(home.matchAll(/<section\b[^>]*\bid="process"[^>]*>[\s\S]*?<\/section>/g));
  expect(matches).toHaveLength(1);
  const markup = matches[0][0];
  expect(markup.match(/<section\b/g)).toHaveLength(1);
  return { files, markup, hashes: Object.fromEntries(files.map(({ file, text }) => [file, hash(text)])) };
}

test('Process inventory: exact source snapshot, DOM, CSS and runtime references', async ({ page }) => {
  const { files, markup, hashes } = await source();
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, 'legacy-section.html'), markup);
  expect((await readFile(path.join(root, 'legacy-section.html'))).equals(Buffer.from(markup))).toBe(true);
  // Parse offline: scripts never run and media never starts. Preserve both raw
  // source bytes and browser-normalized DOM instead of conflating the two.
  const inventory = await page.evaluate(({ home, styles }) => {
    const doc = new DOMParser().parseFromString(home, 'text/html');
    const section = doc.querySelector('#process')!;
    const nodes: Array<Record<string, unknown>> = [];
    function visit(node: Node, location: string) {
      nodes.push(node instanceof Element ? {
        path: location, type: node.nodeType, tag: node.localName, namespace: node.namespaceURI,
        attributes: Array.from(node.attributes, ({ name, value }) => ({ name, value })),
      } : { path: location, type: node.nodeType, text: node.nodeValue });
      Array.from(node.childNodes).forEach((child, index) => visit(child, `${location}/${index}`));
    }
    visit(section, '0');
    const elements = [section, ...Array.from(section.querySelectorAll('*'))];
    const ancestors: Element[] = [];
    for (let parent = section.parentElement; parent; parent = parent.parentElement) ancestors.push(parent);
    const subjects = [...elements, ...ancestors];
    const classes = Array.from(new Set(elements.flatMap((element) => Array.from(element.classList)))).sort();
    const steps = Array.from(section.querySelectorAll('.process_home_content-item'), (item, index) => {
      const link = item.querySelector('a')!;
      const video = item.querySelector('video')!;
      return {
        order: index + 1,
        heading: item.querySelector('h3')!.textContent,
        description: item.querySelector('p')!.textContent,
        numberSpanText: item.querySelector('.process_home_content_span')!.textContent,
        cta: Array.from(item.querySelectorAll('.process_home_cta'), (node) => node.textContent),
        link: Object.fromEntries(Array.from(link.attributes, ({ name, value }) => [name, value])),
        video: Object.fromEntries(Array.from(video.attributes, ({ name, value }) => [name, value])),
      };
    });
    const css: Array<Record<string, unknown>> = [];
    // CSSOM parsing retains valid selectors and media conditions, including
    // inactive breakpoints. Raw text separately preserves invalid legacy CSS.
    for (const { file, text } of [...styles, ...Array.from(doc.querySelectorAll('style'), (style, index) => ({
      file: `home-inline-${index}${section.contains(style) ? '-process' : ''}`, text: style.textContent || '',
    }))]) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(text);
      const rules: Array<Record<string, unknown>> = [];
      const walk = (list: CSSRuleList, conditions: string[]) => {
        Array.from(list).forEach((rule, index) => {
          if (rule instanceof CSSStyleRule) {
            const direct = /\.(process_[\w-]*|overview_home_video)\b/.test(rule.selectorText);
            let matches = false;
            try { matches = subjects.some((element) => element.matches(rule.selectorText)); } catch { /* pseudo rules */ }
            const classReference = classes.some((name) => rule.selectorText.includes(`.${name}`));
            if (direct || matches || classReference) rules.push({
              index, conditions, selector: rule.selectorText, declarations: rule.style.cssText,
              direct, matchesDetachedDOM: matches, classReference,
            });
          }
          if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules,
            [...conditions, rule.cssText.slice(0, rule.cssText.indexOf('{')).trim()]);
        });
      };
      walk(sheet.cssRules, []);
      css.push({ file, parsedRuleCount: sheet.cssRules.length, rawText: text, rules });
    }
    return { nodes, classes, steps, css, normalizedHTML: section.outerHTML,
      ancestors: ancestors.map((element) => ({ tag: element.localName,
        attributes: Object.fromEntries(Array.from(element.attributes, ({ name, value }) => [name, value])) })),
      counts: { elements: elements.length, nodes: nodes.length, svg: section.querySelectorAll('svg').length,
        paths: section.querySelectorAll('path').length, videos: section.querySelectorAll('video').length } };
  }, { home: files[0].text, styles: files.filter(({ file }) => file.endsWith('.css')) });
  expect(inventory.steps).toHaveLength(3);
  expect(inventory.counts.videos).toBe(3);
  const runtime = files.find(({ file }) => file.endsWith('.js'))!.text;
  const references = ['process_', 'overview_home_video', 'data-video', 'data-cursor-hover',
    'data-cursor-text', 'data-hover-highlight', 'data-stacking-cards-item', 'pageCleanupFunctions',
    'function lt()', 'function At(', 'function Ct(', 'function Ot(', 'function _e(',
    'function oe(', 'function Lt(', 'function wt(', 'function We(', 'function Ft('].map((token) => {
    const matches: Array<{ offset: number; excerpt: string }> = [];
    let offset = -1;
    while ((offset = runtime.indexOf(token, offset + 1)) >= 0) {
      matches.push({ offset, excerpt: runtime.slice(Math.max(0, offset - 220), offset + 1300) });
    }
    return { token, matches };
  });
  await save('inventory.json', { generatedAt: new Date().toISOString(), hashes,
    snapshot: { file: 'legacy-section.html', bytes: Buffer.byteLength(markup), sha256: hash(markup) },
    ...inventory, runtimeReferences: references,
    limitations: ['CSS inventory includes direct and matching/class-referencing rules, home inline styles and ancestor matches; live computed styles record actual inheritance.',
      'No behavior inferred solely from class names or static runtime token searches.'] });
  expect((await source()).hashes).toEqual(hashes);
});

async function ready(page: Page) {
  await expect(page.locator('[data-barba="container"][data-barba-namespace="home"]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => (window as any).ScrollTrigger?.getAll()
    .filter((trigger: any) => trigger.trigger?.matches?.('#process [data-video]')).length)).toBe(3);
}

async function state(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector('#process')!;
    const describe = (element: Element) => {
      const style = getComputedStyle(element);
      const range = document.createRange();
      range.selectNodeContents(element);
      return { tag: element.tagName, class: element.getAttribute('class'),
        rect: element.getBoundingClientRect().toJSON(),
        style: Object.fromEntries(['display', 'position', 'top', 'width', 'height', 'gap', 'flex-direction',
          'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'object-fit',
          'opacity', 'transform', 'counter-reset', 'counter-increment'].map((key) => [key, style.getPropertyValue(key)])),
        before: getComputedStyle(element, '::before').content,
        textRects: Array.from(range.getClientRects(), (rect) => rect.toJSON()),
      };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight }, scrollY, timeOrigin: performance.timeOrigin,
      capabilities: { fine: matchMedia('(pointer: fine)').matches, coarse: matchMedia('(pointer: coarse)').matches,
        hover: matchMedia('(hover: hover)').matches, touchPoints: navigator.maxTouchPoints },
      elements: [section, ...Array.from(section.querySelectorAll('h2, h3, p, .process_home_content-item, .process_home_content-left, .process_home_content_index, .process_home_content_span, a, video, .process_home_cta'))].map(describe),
      videos: Array.from(section.querySelectorAll('video'), (video) => ({
        src: video.currentSrc || video.src, paused: video.paused, muted: video.muted, loop: video.loop,
        playsInline: video.playsInline, preload: video.preload, readyState: video.readyState,
        currentTime: video.currentTime, error: video.error?.code ?? null,
        width: video.videoWidth, height: video.videoHeight,
      })),
      triggers: (window as any).ScrollTrigger.getAll().filter((trigger: any) => section.contains(trigger.trigger))
        .map((trigger: any) => ({ trigger: trigger.trigger.className, start: trigger.start, end: trigger.end,
          active: trigger.isActive, progress: trigger.progress, pin: Boolean(trigger.pin), scrub: trigger.vars.scrub ?? null })),
      cursor: { text: document.querySelector('[data-cursor-text-target]')?.textContent,
        status: document.querySelector('[data-cursor]')?.getAttribute('data-cursor'),
        style: document.querySelector('[data-cursor]') ? describe(document.querySelector('[data-cursor]')!) : null },
      activeElement: document.activeElement ? { tag: document.activeElement.tagName,
        id: document.activeElement.id, class: document.activeElement.className,
        href: document.activeElement.getAttribute('href') } : null,
      mediaEvents: (window as any).__processMediaEvents,
    };
  });
}

const profiles = [
  { width: 375, height: 812 }, { width: 768, height: 1024 },
  { width: 1024, height: 768 }, { width: 1440, height: 900 },
  { width: 1920, height: 1080 }, { width: 375, height: 812, touch: true },
  { width: 1440, height: 900, resize: true },
];
for (const profile of profiles) {
  const name = `${profile.width}x${profile.height}-${profile.touch ? 'touch' : profile.resize ? 'resize' : 'pointer'}`;
  test(`Process behavior: ${name}`, async ({ browser, baseURL }, testInfo) => {
    test.setTimeout(180_000);
    const before = await source();
    const directory = path.join(root, name);
    await mkdir(directory, { recursive: true });
    const context = await browser.newContext({ baseURL, viewport: profile, hasTouch: !!profile.touch,
      isMobile: !!profile.touch, deviceScaleFactor: 1, locale: 'en-US', colorScheme: 'light',
      reducedMotion: 'no-preference', recordVideo: { dir: directory, size: profile } });
    const page = await context.newPage();
    const events: Array<Record<string, unknown>> = [];
    const records: Array<Record<string, unknown>> = [];
    page.on('pageerror', (error) => events.push({ type: 'pageerror', text: error.message }));
    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) events.push({ type: message.type(), text: message.text() });
    });
    page.on('requestfailed', (request) => events.push({ type: 'requestfailed', url: request.url(), error: request.failure() }));
    page.on('response', (response) => {
      if (response.status() >= 400) events.push({ type: 'http', status: response.status(), url: response.url() });
    });
    await page.addInitScript(() => {
      (window as any).__processMediaEvents = [];
      for (const type of ['play', 'playing', 'pause', 'loadeddata', 'error']) document.addEventListener(type, (event) => {
        const video = event.target;
        if (video instanceof HTMLVideoElement && video.closest('#process')) (window as any).__processMediaEvents.push({
          type, src: video.src, time: performance.now(), currentTime: video.currentTime, readyState: video.readyState,
        });
      }, true);
    });
    const capture = async (phase: string) => {
      await page.waitForTimeout(350);
      records.push({ phase, snapshot: await state(page) });
      await page.screenshot({ path: path.join(directory, `${phase}.png`) });
    };
    let failure: unknown;
    try {
      expect((await page.goto('/', { waitUntil: 'domcontentloaded' }))?.status()).toBe(200);
      await ready(page);
      await capture('entry');
      const links = page.locator('#process a[data-video="playpause"]');
      await expect(links).toHaveCount(3);
      for (let index = 0; index < 3; index += 1) {
        const link = links.nth(index);
        await link.evaluate((element) => element.scrollIntoView({ block: 'center' }));
        const video = link.locator('video');
        await expect.poll(() => video.evaluate((element: HTMLVideoElement) =>
          !element.paused && element.readyState >= 2 && element.currentTime > 0), { timeout: 30_000 }).toBe(true);
        const time = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
        await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).not.toBe(time);
        await capture(`step-${index + 1}-visible`);
        if (!profile.touch) {
          await link.hover();
          await expect(page.locator('[data-cursor-text-target]')).toHaveText(await link.getAttribute('data-cursor-text') || '');
          await capture(`step-${index + 1}-hover`);
          await link.focus();
          await expect(link).toBeFocused();
          await page.keyboard.press('Tab');
          await page.keyboard.press('Shift+Tab');
          await expect(link).toBeFocused();
          await capture(`step-${index + 1}-focus`);
        }
        const href = await link.getAttribute('href');
        await expect(link).toHaveAttribute('target', '_blank');
        expect(href).toMatch(/^https:\/\/youtu\.be\//);
        // Verify native activation/target/URL, not YouTube availability/content.
        await context.route('https://youtu.be/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Link destination audit</title>' }));
        const opened = page.waitForEvent('popup');
        if (profile.touch) await link.tap(); else await page.keyboard.press('Enter');
        const popup = await opened;
        await popup.waitForLoadState('domcontentloaded');
        expect(popup.url()).toBe(href);
        await popup.close();
        await page.bringToFront();
        await context.unroute('https://youtu.be/**');
        records.push({ phase: `step-${index + 1}-link`, input: profile.touch ? 'tap' : 'Enter', href, target: '_blank', destinationStubbed: true });
      }
      await page.locator('#faqs').evaluate((element) => element.scrollIntoView({ block: 'start' }));
      await expect.poll(() => page.locator('#process video').evaluateAll((videos) => videos.every((video: HTMLVideoElement) => video.paused))).toBe(true);
      await capture('exit-paused');
      await links.first().evaluate((element) => element.scrollIntoView({ block: 'center' }));
      await expect.poll(() => links.first().locator('video').evaluate((video: HTMLVideoElement) => !video.paused)).toBe(true);
      await capture('reenter');
      if (profile.touch) {
        const session = await context.newCDPSession(page);
        const y = await page.evaluate(() => scrollY);
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 600 }] });
        for (let step = 1; step <= 10; step += 1) {
          await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y: 600 - step * 30 }] });
          await page.waitForTimeout(30);
        }
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y);
        await capture('touch-scroll');
        await session.detach();
      } else {
        const y = await page.evaluate(() => scrollY);
        await page.mouse.move(5, 5);
        await page.mouse.wheel(0, 300);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y);
        await capture('wheel-scroll');
      }
      if (profile.resize) for (const width of [992, 991, 768, 767, 768, 991, 992, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await ready(page);
        await capture(`resize-${records.length}-${width}-initial`);
        // Legacy reinitializes Lenis across some breakpoints and resets scroll
        // for one second. Keep the raw state above, then reframe for comparison.
        await page.waitForTimeout(1200);
        await links.first().evaluate((element) => element.scrollIntoView({ block: 'center' }));
        await expect(links.first()).toBeInViewport();
        await expect.poll(() => links.first().locator('video').evaluate((video: HTMLVideoElement) =>
          !video.paused && video.readyState >= 2)).toBe(true);
        await capture(`resize-${records.length}-${width}-settled`);
      }
      expect(events.filter((event) => event.type === 'pageerror')).toEqual([]);
      expect(events.filter((event) => event.type === 'http' && String(event.url).startsWith(baseURL!))).toEqual([]);
      expect((await source()).hashes).toEqual(before.hashes);
    } catch (error) {
      failure = error;
      throw error;
    } finally {
      await context.close();
      await save(`${name}.json`, { profile, generatedAt: new Date().toISOString(), browser: browser.version(),
        hashes: before.hashes, status: failure ? 'failed' : 'passed', error: failure ? String(failure) : null,
        records, events, video: await page.video()?.path(),
        limitations: ['Chromium emulation only; video frames are not pixel-diff acceptance.',
          'YouTube popup destinations intercepted; live external content not validated.'] });
      await testInfo.attach('process-evidence', { path: path.join(root, `${name}.json`), contentType: 'application/json' });
    }
  });
}