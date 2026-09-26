import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.env.FAQ_CANDIDATE_OUTPUT || 'artifacts/faq/candidate');
const pattern = /<section\b[^>]*\bid="faqs"[^>]*>[\s\S]*?<\/section>/g;
const candidate = execFileSync(process.execPath, [path.resolve('scripts/render-faq-candidate.mjs')], { encoding: 'utf8' });
const candidateURL = process.env.FAQ_CANDIDATE_URL;

async function canonical(page: Page, html: string) {
  return page.evaluate((markup) => {
    const section = new DOMParser().parseFromString(markup, 'text/html').querySelector('#faqs');
    function visit(node: Node): unknown {
      if (!(node instanceof Element)) return { type: node.nodeType, text: node.nodeValue };
      return { tag: node.localName, namespace: node.namespaceURI,
        attributes: Array.from(node.attributes, ({ name, value }) => [name, value]).sort(([a], [b]) => a.localeCompare(b)),
        children: Array.from(node.childNodes, visit) };
    }
    return visit(section!);
  }, html);
}

async function ready(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#faqs [data-accordion-toggle]')).toHaveCount(7);
}

async function state(page: Page) {
  return page.locator('#faqs').evaluate(section => ({
    statuses: Array.from(section.querySelectorAll('[data-accordion-status]'), item => item.getAttribute('data-accordion-status')),
    headings: Array.from(section.querySelectorAll('[data-hover-heading]'), item => item.textContent),
    image: (() => { const image = section.querySelector('img')!; const rect = image.getBoundingClientRect();
      return { src: image.getAttribute('src'), alt: image.getAttribute('alt'), loading: image.getAttribute('loading'),
        width: rect.width, height: rect.height, objectFit: getComputedStyle(image).objectFit,
        objectPosition: getComputedStyle(image).objectPosition }; })(),
  }));
}

async function pixelDifference(page: Page, baseline: Buffer, actual: Buffer) {
  return page.evaluate(async ([left, right]) => {
    async function pixels(source: string) {
      const image = new Image();
      image.src = `data:image/png;base64,${source}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return { width: image.width, height: image.height,
        data: context.getImageData(0, 0, image.width, image.height).data };
    }
    const first = await pixels(left), second = await pixels(right);
    if (first.width !== second.width || first.height !== second.height) return 1;
    let different = 0;
    for (let index = 0; index < first.data.length; index += 4) {
      if ([0, 1, 2, 3].some(channel => first.data[index + channel] !== second.data[index + channel])) different++;
    }
    return different / (first.width * first.height);
  }, [baseline.toString('base64'), actual.toString('base64')]);
}

// With two endpoints, BASELINE_URL is the FAQ_USE_LEGACY=1 control.
// Without a comparison endpoint, BASELINE_URL is the normal candidate default.
test('FAQ candidate: complete DOM contract and renderer selection', async ({ page, request }) => {
  await mkdir(root, { recursive: true });
  const home = await readFile(path.resolve('data/home.html'), 'utf8');
  const matches = Array.from(home.matchAll(pattern));
  expect(matches).toHaveLength(1);
  expect(await canonical(page, candidate)).toEqual(await canonical(page, matches[0][0]));
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(await canonical(page, html)).toEqual(await canonical(page, matches[0][0]));
  expect(html.includes(candidate)).toBe(!candidateURL);
  if (candidateURL) {
    const integrated = await request.get(candidateURL);
    expect(integrated.status()).toBe(200);
    expect(await integrated.text()).toContain(candidate);
  }
  await writeFile(path.join(root, 'candidate-section.html'), candidate);
});

for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 },
  { width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
  test(`FAQ candidate visual parity ${viewport.width}x${viewport.height}`, async ({ browser, baseURL }) => {
    test.skip(!candidateURL, 'Set FAQ_CANDIDATE_URL to the default server and BASELINE_URL to the FAQ legacy control.');
    test.setTimeout(180_000);
    await mkdir(root, { recursive: true });
    const screenshots: Buffer[] = [];
    const states = [];
    let difference = 1;
    for (const implementation of ['legacy', 'candidate']) {
      const context = await browser.newContext({ baseURL: implementation === 'candidate' ? candidateURL : baseURL,
        viewport, deviceScaleFactor: 1 });
      const page = await context.newPage();
      try {
        expect((await page.goto('/'))?.status()).toBe(200);
        await ready(page);
        const faq = page.locator('#faqs');
        await faq.scrollIntoViewIfNeeded();
        await faq.locator('img').evaluate((image: HTMLImageElement) => image.decode());
        await page.waitForTimeout(1100);
        states.push(await state(page));
        screenshots.push(await faq.screenshot({ animations: 'disabled',
          path: path.join(root, `${viewport.width}x${viewport.height}-${implementation}.png`),
          style: '[data-cursor] { visibility: hidden !important; }' }));
        if (implementation === 'candidate') difference = await pixelDifference(page, screenshots[0], screenshots[1]);
      } finally {
        await context.close();
      }
    }
    expect(states[1]).toEqual(states[0]);
    await writeFile(path.join(root, `${viewport.width}x${viewport.height}.json`), JSON.stringify({ difference, states,
      threshold: 0.005, integrated: true }, null, 2));
    expect(difference).toBeLessThanOrEqual(0.005);
  });
}

for (const implementation of ['legacy', 'candidate']) {
for (const touch of [false, true]) {
  test(`FAQ ${implementation} interaction and lifecycle: ${touch ? 'touch' : 'pointer'}`, async ({ browser, baseURL }, testInfo) => {
    test.skip(!candidateURL, 'Set FAQ_CANDIDATE_URL to the default server and BASELINE_URL to the FAQ legacy control.');
    test.setTimeout(240_000);
    const context = await browser.newContext({ baseURL: implementation === 'candidate' ? candidateURL : baseURL, viewport: touch ? { width: 375, height: 812 } : { width: 1440, height: 900 },
      hasTouch: touch, isMobile: touch });
    await context.addInitScript(() => {
      const records: any[] = [];
      (window as any).__faqListeners = records;
      const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener = function(type, callback, options) {
        if (this instanceof Element && this.closest('#faqs') && callback
          && /monolog-runtime\.js/.test(new Error().stack || '') && ['click', 'mouseenter', 'mouseleave'].includes(type)) {
          records.push({ target: this, callback, type, active: true });
        }
        return add.call(this, type, callback, options);
      };
      EventTarget.prototype.removeEventListener = function(type, callback, options) {
        records.filter(record => record.target === this && record.type === type && record.callback === callback)
          .forEach(record => { record.active = false; });
        return remove.call(this, type, callback, options);
      };
    });
    const page = await context.newPage();
    const events: string[] = [];
    page.on('pageerror', error => events.push(error.message));
    page.on('console', message => { if (message.type() === 'error'
      || message.type() === 'warning' && /hydrat|did not match|server html/i.test(message.text())) events.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) events.push(`${response.status()} ${response.url()}`); });
    try {
      const response = await page.goto('/');
      expect((await response!.text()).includes(candidate)).toBe(implementation === 'candidate');
      await ready(page);
      const items = page.locator('#faqs [data-accordion-status]');
      const toggles = page.locator('#faqs [data-accordion-toggle]');
      const listeners = async (home: boolean) => {
        const counts = await page.evaluate(() => {
          const active = (window as any).__faqListeners.filter((record: any) => record.active);
          return { click: active.filter((r: any) => r.type === 'click').length,
            hover: active.filter((r: any) => r.type !== 'click').length,
            detached: active.filter((r: any) => !r.target.isConnected).length };
        });
        expect(counts).toEqual({ click: home ? 1 : 0, hover: home && !touch ? 14 : 0, detached: 0 });
      };
      await listeners(true);
      for (let index = 0; index < 7; index++) {
        const toggle = toggles.nth(index);
        await toggle.scrollIntoViewIfNeeded();
        if (touch) await toggle.tap(); else { await toggle.focus(); await expect(toggle).toBeFocused(); await page.keyboard.press(index % 2 ? 'Space' : 'Enter'); }
        await expect(items.nth(index)).toHaveAttribute('data-accordion-status', 'active');
        expect(await items.evaluateAll(nodes => nodes.filter(node => node.getAttribute('data-accordion-status') === 'active').length)).toBe(1);
      }
      const last = toggles.last();
      if (touch) await last.tap(); else await page.keyboard.press('Enter');
      await expect(items.last()).toHaveAttribute('data-accordion-status', 'not-active');
      await toggles.first().evaluate((button: HTMLButtonElement) => { button.click(); button.click(); button.click(); });
      await expect(items.first()).toHaveAttribute('data-accordion-status', 'active');
      await toggles.first().click();
      await expect(items.first()).toHaveAttribute('data-accordion-status', 'not-active');
      if (!touch) {
        await toggles.first().focus();
        await page.keyboard.press('Tab');
        await expect(toggles.nth(1)).toBeFocused();
        await toggles.first().hover();
        await expect(page.locator('[data-cursor]')).toHaveAttribute('data-cursor', '');
      }
      const cta = page.locator('#faqs .g_btn_main');
      await expect(cta).toHaveAttribute('href', 'https://cal.com/byhuy/project-intro-call');
      await expect(cta).toHaveAttribute('target', '_blank');
      await expect(page.locator('#faqs .accordion_css_bottom_rich a')).toHaveAttribute('href',
        'https://cal.com/byhuy/project-intro-call?duration=45');
      await context.route('https://cal.com/**', route => route.fulfill({ body: '<title>Booking destination</title>' }));
      const popupPromise = page.waitForEvent('popup');
      if (touch) await cta.tap(); else { await cta.focus(); await page.keyboard.press('Enter'); }
      const popup = await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      expect(popup.url()).toBe('https://cal.com/byhuy/project-intro-call');
      await popup.close();
      for (const width of [767, 768, 991, 992, touch ? 375 : 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.waitForTimeout(500);
        await expect(toggles).toHaveCount(7);
        await toggles.first().click();
        await expect(items.first()).toHaveAttribute('data-accordion-status', 'active');
        await toggles.first().click();
        await expect(items.first()).toHaveAttribute('data-accordion-status', 'not-active');
      }
      await page.reload();
      await ready(page);
      await page.evaluate(() => { (window as any).__faqDocument = true; });
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.evaluate(() => (window as any).barba.go('/work'));
        await expect(page.locator('[data-barba-namespace="work"]')).toHaveCount(1);
        await expect.poll(() => page.evaluate(() => (window as any).barba.transitions.isRunning)).toBe(false);
        await listeners(false);
        await page.goBack();
        await ready(page);
        await listeners(true);
        await expect(page.locator('#faqs [data-accordion-status="active"]')).toHaveCount(0);
        expect(await page.evaluate(() => (window as any).__faqDocument)).toBe(true);
        await toggles.first().click();
        await expect(items.first()).toHaveAttribute('data-accordion-status', 'active');
        await toggles.first().click();
        await expect(items.first()).toHaveAttribute('data-accordion-status', 'not-active');
      }
      expect(events).toEqual([]);
    } finally {
      await testInfo.attach('faq-events', { body: JSON.stringify(events), contentType: 'application/json' });
      await context.close();
    }
  });
}
}
