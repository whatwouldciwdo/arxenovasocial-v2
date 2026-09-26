import { execFileSync } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { test, expect, type Page } from '@playwright/test';

const candidate = execFileSync(process.execPath, ['scripts/render-cta-candidate.mjs'], { encoding: 'utf8' });
const candidateURL = process.env.CTA_CANDIDATE_URL;
const legacyURL = process.env.CTA_LEGACY_URL;
const comparisonURL = candidateURL || legacyURL;
const output = process.env.CTA_OUTPUT || 'artifacts/cta/candidate';
const selector = '[data-barba-namespace="home"] .cta_home_wrap';

function implementationURL(mode: string, baseURL?: string) {
  return mode === 'candidate' ? candidateURL || baseURL : legacyURL || baseURL;
}

async function canonical(page: Page, html: string) {
  return page.evaluate(html => {
    const section = new DOMParser().parseFromString(html, 'text/html').querySelector('.cta_home_wrap')!;
    const visit = (node: Node): any => {
      if (node.nodeType === Node.COMMENT_NODE) return null;
      if (!(node instanceof Element)) return { text: node.textContent };
      return { tag: node.localName, namespace: node.namespaceURI,
        attrs: Array.from(node.attributes, a => [a.name, a.value]).sort(([a], [b]) => a.localeCompare(b)),
        children: Array.from(node.childNodes, visit).filter(Boolean) };
    };
    return visit(section);
  }, html);
}

async function ready(page: Page) {
  await expect.poll(() => page.evaluate(() => (window as any).barba?.transitions?.isRunning)).toBe(false);
  await expect(page.locator(selector)).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

test('CTA complete DOM and renderer selection', async ({ page, request }) => {
  const legacy = await readFile('artifacts/cta/extraction/section.html', 'utf8');
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
  test(`CTA visual parity ${viewport.width}x${viewport.height}`, async ({ browser, baseURL }) => {
    test.skip(!comparisonURL, 'Requires real CTA candidate or legacy comparison endpoint.');
    test.setTimeout(180_000);
    await mkdir(output, { recursive: true });
    const images: Buffer[] = [], states: any[] = [];
    let difference = 1;
    for (const mode of ['legacy', 'candidate']) {
      const context = await browser.newContext({ baseURL: implementationURL(mode, baseURL), viewport });
      const page = await context.newPage();
      try {
        expect((await page.goto('/'))?.status()).toBe(200);
        await ready(page);
        const root = page.locator(selector);
        await root.scrollIntoViewIfNeeded();
        await root.locator('img').evaluate((image: HTMLImageElement) => image.decode());
        // Use the same actual scroll position, rather than forcing animation progress.
        await root.evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY));
        await page.waitForTimeout(1800);
        // Locator screenshots span beyond the viewport; pin only CTA-owned scrub state
        // so independent contexts cannot capture different compositor frames.
        await root.evaluate(element => (window as any).ScrollTrigger.getAll()
          .filter((trigger: any) => trigger.trigger?.closest?.('.cta_home_wrap') === element)
          .forEach((trigger: any) => trigger.animation?.progress(0.5)));
        states.push(await root.evaluate(element => {
          const image = element.querySelector('img')!, css = getComputedStyle(image);
          const rect = image.getBoundingClientRect();
          return { src: image.getAttribute('src'), alt: image.alt, loading: image.loading,
            width: rect.width, height: rect.height, fit: css.objectFit, position: css.objectPosition };
        }));
        images.push(await root.screenshot({ path: `${output}/${viewport.width}x${viewport.height}-${mode}.png`,
          animations: 'disabled', style: '[data-cursor],.g_grain_overlay{visibility:hidden!important}' }));
        if (mode === 'candidate') difference = await page.evaluate(async ([a, b]) => {
          const pixels = async (data: string) => {
            const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
            const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0);
            return { width: image.width, height: image.height, data: ctx.getImageData(0, 0, image.width, image.height).data };
          };
          const left = await pixels(a), right = await pixels(b);
          if (left.width !== right.width || left.height !== right.height) return 1;
          let changed = 0;
          for (let i = 0; i < left.data.length; i += 4) if ([0,1,2,3].some(c => left.data[i+c] !== right.data[i+c])) changed++;
          return changed / (left.width * left.height);
        }, images.map(image => image.toString('base64')));
      } finally { await context.close(); }
    }
    await writeFile(`${output}/${viewport.width}x${viewport.height}.json`, JSON.stringify({ states, difference,
      threshold: 0.005, limitations: ['Global cursor/grain hidden; not manual timing/easing acceptance.'] }, null, 2));
    expect(states[1]).toEqual(states[0]);
    expect(difference).toBeLessThanOrEqual(0.005);
  });
}

for (const mode of ['legacy', 'candidate']) for (const touch of [false, true]) {
  test(`CTA ${mode} link scroll resize cleanup ${touch ? 'touch' : 'pointer'}`, async ({ browser, baseURL }, testInfo) => {
    test.skip(!comparisonURL, 'Requires real CTA candidate or legacy comparison endpoint.');
    test.setTimeout(240_000);
    const context = await browser.newContext({ baseURL: implementationURL(mode, baseURL),
      viewport: { width: touch ? 375 : 1440, height: 900 }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning' && /hydrat|did not match/i.test(message.text())) errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    try {
      const response = await page.goto('/');
      expect((await response!.text()).includes(candidate)).toBe(mode === 'candidate');
      await ready(page);
      const root = page.locator(selector), link = root.locator('a');
      await expect(root.locator('canvas,video')).toHaveCount(0);
      await expect(root.locator('.cta_home_svgs')).toHaveCount(3);
      await expect(link).toHaveAttribute('href', 'https://cal.com/byhuy/project-intro-call');
      await expect(link).toHaveAttribute('target', '_blank');
      await context.route('https://cal.com/**', route => route.fulfill({ body: '<title>Booking destination</title>' }));
      await link.scrollIntoViewIfNeeded();
      if (!touch) { await link.hover(); await link.focus(); await expect(link).toBeFocused(); }
      const popupPromise = page.waitForEvent('popup');
      if (touch) await link.tap(); else await page.keyboard.press('Enter');
      const popup = await popupPromise; await popup.waitForLoadState('domcontentloaded');
      expect(popup.url()).toBe('https://cal.com/byhuy/project-intro-call'); await popup.close();
      for (const width of [767, 768, 991, 992, touch ? 375 : 1440]) {
        await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(1800);
        await expect.poll(() => page.evaluate(() => (window as any).ScrollTrigger.getAll()
          .filter((trigger: any) => trigger.trigger?.closest?.('.cta_home_wrap')).length)).toBe(width >= 992 ? 3 : 2);
        await page.evaluate(() => { window.scrollTo(0, 0); (window as any).ScrollTrigger.update(); });
        await page.waitForTimeout(700);
        const before = await root.locator('.cta_heading_inner').evaluate(el => getComputedStyle(el).transform);
        await root.evaluate(el => { el.scrollIntoView({ block: 'start' }); (window as any).ScrollTrigger.update(); });
        await page.waitForTimeout(1200);
        await expect.poll(() => root.locator('.cta_heading_inner').evaluate(el => getComputedStyle(el).transform)).not.toBe(before);
      }
      await page.reload(); await ready(page);
      await page.evaluate(() => { (window as any).__ctaDocument = true; });
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.evaluate(() => { (window as any).__ctaOutgoing = (window as any).ScrollTrigger.getAll()
          .filter((trigger: any) => trigger.trigger?.closest?.('.cta_home_wrap')); });
        await page.evaluate(() => (window as any).barba.go('/work'));
        await expect(page.locator(selector)).toHaveCount(0);
        await expect.poll(() => page.evaluate(() => (window as any).barba.transitions.isRunning)).toBe(false);
        expect(await page.evaluate(() => {
          const active = (window as any).ScrollTrigger.getAll();
          return (window as any).__ctaOutgoing.every((trigger: any) => !active.includes(trigger) && !trigger.animation?.parent);
        })).toBe(true);
        await page.goBack(); await ready(page);
        expect(await page.evaluate(() => (window as any).__ctaDocument)).toBe(true);
        expect(await page.evaluate(() => (window as any).ScrollTrigger.getAll().filter((trigger: any) => trigger.trigger && !trigger.trigger.isConnected).length)).toBe(0);
        await expect.poll(() => page.evaluate(() => (window as any).ScrollTrigger.getAll()
          .filter((trigger: any) => trigger.trigger?.closest?.('.cta_home_wrap')).length)).toBe(touch ? 2 : 3);
      }
      expect(errors).toEqual([]);
    } finally {
      await testInfo.attach('cta-errors', { body: JSON.stringify(errors), contentType: 'application/json' });
      await context.close();
    }
  });
}
