import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const baseUrl = new URL(process.env.BASELINE_URL || 'http://127.0.0.1:3000');
const outputRoot = path.resolve(process.env.BASELINE_OUTPUT || path.join(root, 'artifacts', 'baseline'));
const snapshotRoot = path.join(outputRoot, 'html');
const projectData = await readFile(path.join(root, 'data', 'projects.ts'), 'utf8');
const projectHtml = await readFile(path.join(root, 'data', 'html-projects.ts'), 'utf8');
const dataSlugs = [...projectData.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const htmlSlugs = [...projectHtml.matchAll(/^\s*["']([^"']+)["']:\s*["']/gm)].map((match) => match[1]);
const routes = ['/', '/work', ...dataSlugs.map((slug) => `/projects/${slug}`)];

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const unique = (values) => [...new Set(values)].sort();
const valuesFor = (html, attribute) => unique(
  [...html.matchAll(new RegExp(`\\b${attribute}\\s*=\\s*["']([^"']*)["']`, 'gi'))].map((match) => match[1]),
);
const countTag = (html, tag) => (html.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
const titleFor = (html) => html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || null;
const metaFor = (html, name) => html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`, 'i'))?.[1]
  || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`, 'i'))?.[1]
  || null;

async function request(route) {
  const url = new URL(route, baseUrl);
  const response = await fetch(url, { redirect: 'manual' });
  return { url: url.href, status: response.status, headers: Object.fromEntries(response.headers), html: await response.text() };
}

function classifyUrl(raw, route) {
  if (!raw || raw.startsWith('#') || /^(data:|blob:|javascript:|mailto:|tel:)/i.test(raw)) return null;
  try {
    const resolved = new URL(raw, new URL(route, baseUrl));
    return resolved.origin === baseUrl.origin ? `${resolved.pathname}${resolved.search}` : null;
  } catch {
    return null;
  }
}

await mkdir(snapshotRoot, { recursive: true });
const routeResults = [];
const localAssets = new Map();

for (const route of routes) {
  const response = await request(route);
  const references = unique([
    ...valuesFor(response.html, 'src'),
    ...valuesFor(response.html, 'href'),
    ...valuesFor(response.html, 'poster'),
  ]);
  for (const reference of references) {
    const local = classifyUrl(reference, route);
    if (local && !local.startsWith('/_next/') && !routes.includes(local) && !local.startsWith('/projects/')) {
      localAssets.set(local, null);
    }
  }

  const snapshotName = route === '/' ? 'home.html' : `${route.slice(1).replaceAll('/', '--')}.html`;
  await writeFile(path.join(snapshotRoot, snapshotName), response.html);
  routeResults.push({
    route,
    status: response.status,
    bytes: Buffer.byteLength(response.html),
    sha256: sha256(response.html),
    snapshot: `html/${snapshotName}`,
    metadata: {
      title: titleFor(response.html),
      description: metaFor(response.html, 'description'),
      canonical: valuesFor(response.html, 'href').find((href) => response.html.includes(`rel="canonical" href="${href}"`)) || null,
    },
    links: {
      internal: references.filter((value) => classifyUrl(value, route)),
      external: references.filter((value) => /^https?:\/\//i.test(value) && !value.startsWith(baseUrl.origin)),
      anchors: references.filter((value) => value.startsWith('#')),
    },
    media: {
      images: countTag(response.html, 'img'), videos: countTag(response.html, 'video'),
      audio: countTag(response.html, 'audio'), svg: countTag(response.html, 'svg'),
      canvas: countTag(response.html, 'canvas'), iframe: countTag(response.html, 'iframe'),
    },
    sections: valuesFor(response.html, 'class').filter((value) => /(?:hero|problems|process|faq|cta)_home_wrap/.test(value)),
    state: {
      html: response.html.match(/<html\b([^>]*)>/i)?.[1].trim() || null,
      body: response.html.match(/<body\b([^>]*)>/i)?.[1].trim() || null,
      barbaContainers: (response.html.match(/data-barba=["']container["']/gi) || []).length,
    },
  });
}

const assetResults = [];
for (const asset of [...localAssets.keys()].sort()) {
  const response = await fetch(new URL(asset, baseUrl), { redirect: 'manual' });
  assetResults.push({ asset, status: response.status, contentType: response.headers.get('content-type') });
}

const navigationCycles = [];
for (let cycle = 1; cycle <= 3; cycle += 1) {
  const statuses = {};
  for (const route of routes) statuses[route] = (await request(route)).status;
  navigationCycles.push({ cycle, statuses });
}

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  baseUrl: baseUrl.href,
  baselineCommit: process.env.BASELINE_COMMIT || '42b92697239e39e0911e49e4f96399f4850eb943',
  projectSlugParity: { dataSlugs, htmlSlugs, matches: JSON.stringify([...dataSlugs].sort()) === JSON.stringify([...htmlSlugs].sort()) },
  routes: routeResults,
  localAssets: assetResults,
  navigationCycles,
  limitations: [
    'HTTP navigation cycles do not execute browser JavaScript or prove listener cleanup.',
    'Screenshots, computed layout, console, network waterfall, and interactions require manual capture or Playwright.',
  ],
};
const failures = [
  ...routeResults.filter((item) => item.status !== 200).map((item) => `${item.route}: HTTP ${item.status}`),
  ...assetResults.filter((item) => item.status < 200 || item.status >= 400).map((item) => `${item.asset}: HTTP ${item.status}`),
  ...(manifest.projectSlugParity.matches ? [] : ['Project slugs differ between projects.ts and html-projects.ts']),
];
manifest.summary = { routeCount: routes.length, assetCount: assetResults.length, failureCount: failures.length, failures };
await writeFile(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Baseline manifest: ${path.join(outputRoot, 'manifest.json')}`);
console.log(`Routes: ${routes.length}; local assets: ${assetResults.length}; failures: ${failures.length}`);
if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
}
