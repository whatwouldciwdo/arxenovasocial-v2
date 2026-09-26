import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { test, expect, type Page } from '@playwright/test';

const candidate = execFileSync(process.execPath, ['scripts/render-problems-candidate.mjs'], { encoding: 'utf8' });
const candidateURL = process.env.PROBLEMS_CANDIDATE_URL;
const legacyURL = process.env.PROBLEMS_LEGACY_URL;
const comparisonURL = candidateURL || legacyURL;
const output = process.env.PROBLEMS_OUTPUT || 'artifacts/problems/candidate';
const selector = '.problems_home_wrap';

function implementationURL(mode: string, baseURL?: string) {
  return mode === 'candidate' ? candidateURL || baseURL : legacyURL || baseURL;
}

async function canonical(page: Page, html: string) {
  return page.evaluate(html => {
    const section = new DOMParser().parseFromString(html, 'text/html').querySelector('.problems_home_wrap')!;
    function visit(node: Node): any {
      // Client-card comments and indentation are source formatting, not copy.
      if (node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) return null;
      if (!(node instanceof Element)) return { text: node.textContent };
      return { tag: node.localName, namespace: node.namespaceURI,
        attrs: Array.from(node.attributes, a => [a.name, a.name === 'style' ? (node as HTMLElement).style.cssText : a.value])
          .sort(([a], [b]) => a.localeCompare(b)), children: Array.from(node.childNodes, visit).filter(Boolean) };
    }
    return visit(section);
  }, html);
}

async function ready(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(`${selector} [data-counter-value]`)).toHaveText('2');
  await expect(page.locator(selector)).toHaveCount(1);
}

test('Problems complete DOM, source assets, and opt-in renderer', async ({ page, request }) => {
  const legacy = await readFile('artifacts/problems/extraction/section.html', 'utf8');
  expect(await canonical(page, candidate)).toEqual(await canonical(page, legacy));
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html.includes(candidate)).toBe(Boolean(legacyURL));
  expect(await canonical(page, html)).toEqual(await canonical(page, legacy));
  if (candidateURL) {
    const response = await request.get(candidateURL);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(candidate);
  }
  if (legacyURL) {
    const response = await request.get(legacyURL);
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain(candidate);
  }
});

for (const viewport of [{ width: 375, height: 812 }, { width: 768, height: 1024 },
  { width: 1024, height: 768 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
  test(`Problems visual and image parity ${viewport.width}x${viewport.height}`, async ({ browser, baseURL }) => {
    test.skip(!comparisonURL, 'Set a Problems candidate or legacy comparison URL.');
    test.setTimeout(180_000);
    await mkdir(output, { recursive: true });
    const screenshots: Buffer[] = [], layouts: any[] = [];
    let difference = 1;
    for (const mode of ['legacy', 'candidate']) {
      const context = await browser.newContext({ baseURL: implementationURL(mode, baseURL), viewport });
      const page = await context.newPage();
      try {
        await page.goto('/'); await ready(page);
        const root = page.locator(selector);
        await root.scrollIntoViewIfNeeded();
        await root.locator('img').evaluateAll(images => Promise.all(images.map((image: HTMLImageElement) => image.decode())));
        await page.waitForTimeout(1600);
        layouts.push(await root.evaluate(section => Array.from(section.querySelectorAll('img'), image => {
          const rect = image.getBoundingClientRect(), css = getComputedStyle(image);
          return { src: image.getAttribute('src'), alt: image.alt, loading: image.loading,
            width: rect.width, height: rect.height, fit: css.objectFit, position: css.objectPosition };
        })));
        screenshots.push(await root.screenshot({ path: `${output}/${viewport.width}x${viewport.height}-${mode}.png`,
          animations: 'disabled', style: '[data-cursor],.problems_home_stats,.g_grain_overlay{visibility:hidden!important}' }));
        if (mode === 'candidate') difference = await page.evaluate(async ([a, b]) => {
          async function pixels(source: string) {
            const img = new Image(); img.src = `data:image/png;base64,${source}`; await img.decode();
            const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0);
            return { width: img.width, height: img.height, data: ctx.getImageData(0, 0, img.width, img.height).data };
          }
          const left = await pixels(a), right = await pixels(b);
          if (left.width !== right.width || left.height !== right.height) return 1;
          let changed = 0;
          for (let i = 0; i < left.data.length; i += 4) if ([0,1,2,3].some(c => left.data[i+c] !== right.data[i+c])) changed++;
          return changed / (left.width * left.height);
        }, screenshots.map(buffer => buffer.toString('base64')));
      } finally { await context.close(); }
    }
    await writeFile(`${output}/${viewport.width}x${viewport.height}.json`, JSON.stringify({ layouts, difference, threshold: 0.005,
      limitations: ['Slider, cursor, and the page-global animated grain overlay are masked for static pixels; slider behavior is tested separately.'] }, null, 2));
    expect(layouts[1]).toEqual(layouts[0]);
    expect(difference).toBeLessThanOrEqual(0.005);
  });
}

for (const mode of ['legacy', 'candidate']) for (const touch of [false, true]) {
  test(`Problems ${mode} controls autoplay resize lifecycle ${touch ? 'touch' : 'pointer'}`, async ({ browser, baseURL }, testInfo) => {
    test.skip(!comparisonURL, 'Set a Problems candidate or legacy comparison URL.');
    test.setTimeout(240_000);
    const context = await browser.newContext({ baseURL: implementationURL(mode, baseURL),
      viewport: { width: touch ? 375 : 1440, height: 900 }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning' && /hydrat|did not match/i.test(m.text())) errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    try {
      const response = await page.goto('/');
      expect((await response!.text()).includes(candidate)).toBe(mode === 'candidate');
      await ready(page);
      const root = page.locator(selector), next = root.locator('[data-slider-next]'), prev = root.locator('[data-slider-prev]');
      const current = root.locator('[data-dynamic-value]');
      await next.scrollIntoViewIfNeeded(); await page.waitForTimeout(1600);
      await expect(current).toHaveText('1');
      if (touch) await next.tap(); else { await next.focus(); await expect(next).toBeFocused(); await page.keyboard.press('Enter'); }
      await expect(current).toHaveText('2'); await page.waitForTimeout(1600);
      if (touch) await prev.tap(); else { await prev.focus(); await page.keyboard.press('Space'); }
      await expect(current).toHaveText('1'); await page.waitForTimeout(1600);
      await prev.click(); await expect(current).toHaveText('2'); await page.waitForTimeout(1600);
      await next.click(); await expect(current).toHaveText('1');
      await expect(current).toHaveText('2', { timeout: 21_000 });
      await page.locator('#faqs').scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
      const paused = await current.textContent(); await page.waitForTimeout(17_000);
      await expect(current).toHaveText(paused!);
      await next.scrollIntoViewIfNeeded();
      await expect.poll(() => current.textContent(), { timeout: 21_000 }).not.toBe(paused);
      for (const width of [767,768,991,992]) {
        await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(1700);
        await next.scrollIntoViewIfNeeded(); const before = await current.textContent();
        await next.click(); await expect(current).not.toHaveText(before!);
      }
      await page.reload(); await ready(page);
      await page.evaluate(() => { (window as any).__problemsDocument = true; });
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.evaluate(() => (window as any).barba.go('/work'));
        await expect(page.locator(selector)).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => (window as any).barba.transitions.isRunning)).toBe(false);
        await page.goBack(); await ready(page);
        expect(await page.evaluate(() => (window as any).__problemsDocument)).toBe(true);
        await next.scrollIntoViewIfNeeded(); await page.waitForTimeout(1600);
        await next.click(); await expect(current).toHaveText('2');
        expect(await page.evaluate(() => (window as any).ScrollTrigger.getAll().filter((t: any) => t.trigger && !t.trigger.isConnected).length)).toBe(0);
      }
      expect(errors).toEqual([]);
    } finally {
      await testInfo.attach('problems-errors', { body: JSON.stringify(errors), contentType: 'application/json' });
      await context.close();
    }
  });
}
