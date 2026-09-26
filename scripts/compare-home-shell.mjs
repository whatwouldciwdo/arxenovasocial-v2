import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const output = path.resolve(process.env.HOME_SHELL_OUTPUT || path.join(project, 'artifacts/home-shell/visual-current'));
const threshold = Number(process.env.HOME_SHELL_PIXEL_THRESHOLD || 0.005);
const targets = [
  { name: process.env.HOME_SHELL_LEFT_NAME || 'original', url: process.env.HOME_SHELL_LEFT_URL || 'http://127.0.0.1:3000' },
  { name: process.env.HOME_SHELL_RIGHT_NAME || 'repaired', url: process.env.HOME_SHELL_RIGHT_URL || 'http://127.0.0.1:3100' },
];
const requiredViewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const requestedViewports = process.env.HOME_SHELL_VIEWPORTS?.split(',').map((value) => value.trim()).filter(Boolean);
const viewports = requestedViewports?.length
  ? requiredViewports.filter(({ width, height }) => requestedViewports.includes(`${width}x${height}`))
  : requiredViewports;

if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
  throw new Error(`Invalid HOME_SHELL_PIXEL_THRESHOLD: ${process.env.HOME_SHELL_PIXEL_THRESHOLD}`);
}
if (new Set(targets.map(({ name }) => name)).size !== targets.length) {
  throw new Error('HOME_SHELL_LEFT_NAME and HOME_SHELL_RIGHT_NAME must differ');
}
if (!viewports.length || requestedViewports?.some((value) =>
  !requiredViewports.some(({ width, height }) => value === `${width}x${height}`))) {
  throw new Error(`Invalid HOME_SHELL_VIEWPORTS: ${process.env.HOME_SHELL_VIEWPORTS}`);
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const observations = [];
const captures = new Map();

async function pixelDifference(page, baseline, actual) {
  return page.evaluate(async ([left, right]) => {
    async function pixels(source) {
      const image = new Image();
      image.src = `data:image/png;base64,${source}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      return { width: image.width, height: image.height,
        data: context.getImageData(0, 0, image.width, image.height).data };
    }
    const first = await pixels(left);
    const second = await pixels(right);
    if (first.width !== second.width || first.height !== second.height) {
      return { ratio: 1, dimensionsMatch: false,
        leftSize: [first.width, first.height], rightSize: [second.width, second.height] };
    }
    let different = 0;
    const pixelsCount = first.width * first.height;
    for (let index = 0; index < first.data.length; index += 4) {
      if (first.data[index] !== second.data[index]
        || first.data[index + 1] !== second.data[index + 1]
        || first.data[index + 2] !== second.data[index + 2]
        || first.data[index + 3] !== second.data[index + 3]) different += 1;
    }
    return { ratio: different / pixelsCount, differentPixels: different, pixels: pixelsCount,
      dimensionsMatch: true, leftSize: [first.width, first.height], rightSize: [second.width, second.height] };
  }, [baseline.toString('base64'), actual.toString('base64')]);
}

try {
  for (const viewport of viewports) {
    for (const target of targets) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1,
        colorScheme: 'light', locale: 'en-US', reducedMotion: 'no-preference' });
      const page = await context.newPage();
      page.setDefaultTimeout(30_000);
      page.setDefaultNavigationTimeout(60_000);
      const errors = [];
      console.log(`Capturing ${target.name} ${viewport.width}x${viewport.height}`);
      page.on('pageerror', (error) => errors.push({ type: 'pageerror', text: error.message }));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push({ type: 'console', text: message.text() });
      });
      page.on('requestfailed', (request) => errors.push({ type: 'requestfailed',
        text: `${request.failure()?.errorText || 'failed'} ${request.url()}` }));
      page.on('response', (response) => {
        if (response.status() >= 400) errors.push({ type: 'http', text: `${response.status()} ${response.url()}` });
      });
      try {
        let response;
        let navigationError;
        for (let attempt = 1; attempt <= 2; attempt += 1) {
          try {
            response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
            navigationError = undefined;
            break;
          } catch (error) {
            navigationError = error;
            if (attempt < 2) await page.waitForTimeout(2_000);
          }
        }
        if (navigationError) throw navigationError;
        expect(response?.status()).toBe(200);
        await expect.poll(() => page.evaluate(() => window.barba?.transitions?.isRunning), { timeout: 30_000 }).toBe(false);
        // Full-page capture requires offscreen images too. This is a capture-only
        // loading override, not evidence of unchanged lazy-loading behavior.
        await page.evaluate(() => {
          for (const image of document.images) image.loading = 'eager';
        });
        await page.waitForFunction(() => document.fonts.status === 'loaded'
          && Array.from(document.images).every((image) => image.complete), { }, { timeout: 30_000 });
        const brokenImages = await page.evaluate(() => Array.from(document.images)
          .filter((image) => (image.currentSrc || image.src) && !image.naturalWidth)
          .map((image) => image.currentSrc || image.src));
        for (const url of brokenImages) errors.push({ type: 'image', text: `Undecoded image: ${url}` });
        await page.waitForTimeout(2500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const state = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('section, section *, footer, footer *'));
          const styles = ['display', 'position', 'font-family', 'font-size', 'line-height', 'color',
            'background-color', 'padding', 'margin', 'overflow', 'z-index'];
          return {
            bodyChildren: Array.from(document.body.children, (element) => `${element.tagName}.${element.className}`),
            sections: Array.from(document.querySelectorAll('section'), (element) => ({ class: element.className,
              parent: element.parentElement?.className, inside: !!element.closest('[data-barba="container"]') })),
            layout: elements.map((element) => {
              const rectangle = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return { tag: element.tagName, class: element.getAttribute('class'),
                rect: [rectangle.x, rectangle.y + scrollY, rectangle.width, rectangle.height],
                styles: Object.fromEntries(styles.map((key) => [key, style.getPropertyValue(key)])) };
            }),
          };
        });
        const capture = await page.screenshot({ path: path.join(output, `${target.name}-${viewport.width}x${viewport.height}.png`),
          fullPage: true, animations: 'disabled',
          style: 'video, canvas, [data-cursor] { visibility: hidden !important; }' });
        captures.set(`${target.name}-${viewport.width}x${viewport.height}`, capture);
        observations.push({ viewport, name: target.name, url: target.url, errors, ...state });
      } catch (error) {
        errors.push({ type: 'capture', text: String(error) });
        const readiness = await page.evaluate(() => ({ fonts: document.fonts.status,
          pendingImages: Array.from(document.images).filter((image) => !image.complete)
            .map((image) => ({ src: image.currentSrc || image.src, loading: image.loading })),
        })).catch(() => null);
        observations.push({ viewport, name: target.name, url: target.url, errors, readiness, layout: [] });
      } finally {
        await context.close();
      }
      await writeFile(path.join(output, 'observations.json'), JSON.stringify(observations, null, 2));
    }
  }

  const comparisonPage = await browser.newPage();
  const comparisons = [];
  try {
    for (const viewport of viewports) {
      const [left, right] = targets.map((target) => observations.find((item) =>
        item.name === target.name && item.viewport.width === viewport.width && item.viewport.height === viewport.height));
      const changes = left.layout.flatMap((entry, index) => {
        const next = right.layout[index];
        return JSON.stringify(entry) === JSON.stringify(next) ? [] : [{ index, left: entry, right: next }];
      });
      const leftCapture = captures.get(`${targets[0].name}-${viewport.width}x${viewport.height}`);
      const rightCapture = captures.get(`${targets[1].name}-${viewport.width}x${viewport.height}`);
      const pixel = leftCapture && rightCapture
        ? await pixelDifference(comparisonPage, leftCapture, rightCapture)
        : { ratio: null, dimensionsMatch: false, unavailable: 'Capture failed; see observations' };
      comparisons.push({ viewport, left: targets[0], right: targets[1],
        leftCount: left.layout.length, rightCount: right.layout.length, changedElements: changes.length,
        pixel, passed: pixel.dimensionsMatch && pixel.ratio <= threshold
          && left.errors.length === 0 && right.errors.length === 0, changes });
    }
  } finally {
    await comparisonPage.close();
  }

  const report = { generatedAt: new Date().toISOString(), threshold, targets, viewports, observations, comparisons,
    limitations: ['Full-page capture at initial scroll position; not every scroll/animation state.',
      'Video, canvas and cursor hidden; their visual content is not compared.',
      'Images loaded eagerly for capture; not a lazy-loading behavior test.',
      'CSS animations disabled; JavaScript animations may still introduce capture variance.',
      'Layout arrays are diagnostic by-index comparisons, not stable element identity.'],
    passed: comparisons.every(({ passed }) => passed) };
  await writeFile(path.join(output, 'comparison.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(comparisons.map(({ changes, ...comparison }) => ({ ...comparison,
    examples: changes.slice(0, 3) })), null, 2));
  if (!report.passed) process.exitCode = 1;
} finally {
  await browser.close();
}
