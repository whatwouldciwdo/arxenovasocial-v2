import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const renderScript = path.resolve('scripts/render-process-candidate.mjs');

const integrated = !!process.env.PROCESS_CANDIDATE_URL;
const root = path.resolve(process.env.PROCESS_CANDIDATE_OUTPUT || 'artifacts/project-process/candidate');
const pattern = /<section\b[^>]*\bid="process"[^>]*>[\s\S]*?<\/section>/g;
const candidate = execFileSync(process.execPath, [renderScript], { encoding: 'utf8' });

async function canonical(page: Page, html: string) {
  return page.evaluate((markup) => {
    const section = new DOMParser().parseFromString(markup, 'text/html').querySelector('#process');
    function visit(node: Node): unknown {
      if (!(node instanceof Element)) return { type: node.nodeType, text: node.nodeValue };
      // Explicit HTML serialization differences only. No whitespace/copy/class normalization.
      const attributes = Array.from(node.attributes, ({ name, value }) => [name, value]);
      if (node instanceof HTMLVideoElement) {
        for (const attribute of attributes) {
          if (['loop', 'muted', 'playsinline'].includes(attribute[0])) attribute[1] = '';
        }
        if (!node.hasAttribute('style')) attributes.push(['style', '']);
      }
      return { tag: node.localName, namespace: node.namespaceURI,
        attributes: attributes.sort(([a], [b]) => a.localeCompare(b)),
        children: Array.from(node.childNodes, visit) };
    }
    return visit(section!);
  }, html);
}

async function ready(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => (window as any).ScrollTrigger?.getAll()
    .filter((trigger: any) => trigger.trigger?.closest?.('#process')).length)).toBe(3);
}

async function layout(page: Page) {
  return page.locator('#process').evaluate((section) => {
    const base = section.getBoundingClientRect();
    return [section, ...Array.from(section.querySelectorAll('*'))].map((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return { tag: element.tagName, class: element.getAttribute('class'),
        x: rect.x - base.x, y: rect.y - base.y, width: rect.width, height: rect.height,
        styles: Object.fromEntries(['display', 'position', 'font-family', 'font-size', 'line-height',
          'letter-spacing', 'object-fit', 'counter-reset', 'counter-increment'].map((key) => [key, style.getPropertyValue(key)])),
        before: getComputedStyle(element, '::before').content };
    });
  });
}

async function pixelDifference(page: Page, baseline: Buffer, actual: Buffer) {
  return page.evaluate(async ([a, b]) => {
    async function pixels(src: string) {
      const image = new Image();
      image.src = `data:image/png;base64,${src}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return { width: image.width, height: image.height,
        data: context.getImageData(0, 0, image.width, image.height).data };
    }
    const first = await pixels(a), second = await pixels(b);
    if (first.width !== second.width || first.height !== second.height) return 1;
    let different = 0;
    for (let index = 0; index < first.data.length; index += 4) {
      if ([0, 1, 2, 3].some((channel) => first.data[index + channel] !== second.data[index + channel])) different++;
    }
    return different / (first.width * first.height);
  }, [baseline.toString('base64'), actual.toString('base64')]);
}

test('Process candidate: complete DOM contract and immutable legacy default', async ({ page, request }) => {
  await mkdir(root, { recursive: true });
  const home = await readFile(path.resolve('data/home.html'), 'utf8');
  const matches = Array.from(home.matchAll(pattern));
  expect(matches).toHaveLength(1);
  const legacy = matches[0][0];
  expect(await canonical(page, candidate)).toEqual(await canonical(page, legacy));
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain(legacy);
  await writeFile(path.join(root, 'candidate-section.html'), candidate);
  await writeFile(path.join(root, 'dom-contract.json'), JSON.stringify({ passed: true,
    normalizations: ['attribute order', 'video boolean attribute values', 'missing video style equals empty style'],
    legacyDefault: true, generatedAt: new Date().toISOString() }, null, 2));
});

const profiles = [
  { width: 375, height: 812 }, { width: 768, height: 1024 },
  { width: 1024, height: 768 }, { width: 1440, height: 900 },
  { width: 1920, height: 1080 }, { width: 375, height: 812, touch: true },
];

for (const profile of profiles) {
  const name = `${profile.width}x${profile.height}${profile.touch ? '-touch' : ''}`;
  test(`Process candidate: layout, pixels and behavior ${name}`, async ({ browser, baseURL }) => {
    test.setTimeout(180_000);
    await mkdir(root, { recursive: true });
    const observations: Array<Record<string, unknown>> = [];
    const captures: Buffer[] = [];
    const layouts: Awaited<ReturnType<typeof layout>>[] = [];
    for (const implementation of ['legacy', 'candidate']) {
      const context = await browser.newContext({ baseURL: integrated && implementation === 'candidate'
        ? process.env.PROCESS_CANDIDATE_URL : baseURL, viewport: profile, hasTouch: !!profile.touch,
        isMobile: !!profile.touch, deviceScaleFactor: 1, locale: 'en-US', colorScheme: 'light' });
      // Intercepted navigation responses need explicit loopback permission in Chromium.
      await context.grantPermissions(['local-network-access'], { origin: new URL(baseURL!).origin });
      const page = await context.newPage();
      const events: Array<{ type: string; text: string }> = [];
      let replacements = 0;
      page.on('pageerror', (error) => events.push({ type: 'pageerror', text: error.message }));
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) events.push({ type: message.type(), text: message.text() });
      });
      page.on('response', (response) => {
        if (response.status() >= 400) events.push({ type: 'http', text: `${response.status()} ${response.url()}` });
      });
      // Local response switch. App route/source/RSC payload are untouched.
      // This proves SSR markup/runtime compatibility, NOT React hydration integration.
      if (!integrated && implementation === 'candidate') await page.route('**/*', async (route) => {
        const request = route.request();
        if (request.isNavigationRequest() && new URL(request.url()).pathname === '/') {
          const response = await route.fetch();
          const html = await response.text();
          expect(Array.from(html.matchAll(pattern))).toHaveLength(1);
          replacements++;
          await route.fulfill({ response, body: html.replace(pattern, () => candidate) });
        } else await route.continue();
      });
      try {
        const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBe(200);
        if (integrated) {
          const legacyHome = await readFile(path.resolve('data/home.html'), 'utf8');
          const legacySection = Array.from(legacyHome.matchAll(pattern))[0][0];
          expect((await response!.text()).includes(legacySection)).toBe(implementation === 'legacy');
        }
        await ready(page);
        const links = page.locator('#process a[data-video="playpause"]');
        for (let index = 0; index < 3; index++) {
          const link = links.nth(index);
          await link.evaluate((element) => element.scrollIntoView({ block: 'center' }));
          await expect.poll(() => link.locator('video').evaluate((video: HTMLVideoElement) =>
            !video.paused && video.readyState >= 2 && video.currentTime > 0 && !video.error)).toBe(true);
          await expect(link.locator('video')).toHaveJSProperty('muted', true);
          if (!profile.touch) {
            await link.hover();
            await expect(page.locator('[data-cursor-text-target]')).toHaveText((await link.getAttribute('data-cursor-text'))!);
            await link.focus();
            await expect(link).toBeFocused();
          }
          await context.route('https://youtu.be/**', (route) => route.fulfill({ status: 200, body: '<title>Destination</title>' }));
          const opened = page.waitForEvent('popup');
          if (profile.touch) await link.tap(); else await page.keyboard.press('Enter');
          const popup = await opened;
          await popup.waitForLoadState('domcontentloaded');
          expect(popup.url()).toBe(await link.getAttribute('href'));
          await popup.close();
          await context.unroute('https://youtu.be/**');
          await page.bringToFront();
        }
        await page.locator('#faqs').evaluate((element) => element.scrollIntoView({ block: 'start' }));
        await expect.poll(() => page.locator('#process video').evaluateAll((videos) =>
          videos.every((video: HTMLVideoElement) => video.paused))).toBe(true);
        await links.first().evaluate((element) => element.scrollIntoView({ block: 'center' }));
        await expect.poll(() => links.first().locator('video').evaluate((video: HTMLVideoElement) => !video.paused)).toBe(true);
        await page.mouse.move(0, 0);
        await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
        await page.waitForTimeout(600);
        layouts.push(await layout(page));
        // Exclude time-dependent video/cursor only; preserve their layout boxes.
        // CSS capture override also works on mobile where locator masks were not applied.
        captures.push(await page.locator('#process').screenshot({
          path: path.join(root, `${name}-${implementation}.png`), animations: 'disabled',
          style: '#process video, [data-cursor] { visibility: hidden !important; }',
        }));
        if (implementation === 'candidate') expect(replacements).toBe(integrated ? 0 : 1);
        expect(events.filter((event) => ['pageerror', 'http'].includes(event.type))).toEqual([]);
        expect(events.filter((event) => event.type === 'error'
          || (event.type === 'warning' && /hydrat|did not match|server html/i.test(event.text)))).toEqual([]);
        if (implementation === 'candidate') {
          expect(layouts[1]).toEqual(layouts[0]);
          const difference = await pixelDifference(page, captures[0], captures[1]);
          observations.push({ pixelDifference: difference });
          expect(difference).toBeLessThanOrEqual(0.005);
        }
      } finally {
        observations.push({ implementation, events, replacements });
        await context.close();
        await writeFile(path.join(root, `${name}.json`), JSON.stringify({ observations, layouts,
          integrated,
          limitations: [integrated ? 'Real production endpoints; navigation lifecycle tested separately.'
            : 'SSR response substitution only; no candidate React hydration or RSC navigation proof.',
            'Video/cursor masked for static pixel diff; YouTube destinations stubbed.',
            'Root hydration is asserted; candidate React hydration still requires integration coverage.'] }, null, 2));
      }
    }
  });
}
