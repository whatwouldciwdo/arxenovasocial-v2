import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { generateHomeTree } from './prepare-process-integration.mjs';

const home = await readFile('data/home.html', 'utf8');
const generated = await generateHomeTree(home);
const tree = JSON.parse(generated.slice(generated.indexOf('export default ') + 15).trim().replace(/;$/, ''));
const matches = [];
function visit(node) {
  if (node?.props?.className?.split(' ').includes('cta_home_wrap')) matches.push(node);
  node?.children?.forEach(visit);
}
visit(tree);
if (matches.length !== 1) throw new Error('Expected one CTA tree node');
const node = matches[0];
if (node.children || node.tag !== 'section') throw new Error('Unexpected CTA tree shape');
const browser = await chromium.launch();
let contract;
try {
  const page = await browser.newPage({ offline: true });
  contract = await page.evaluate(node => {
    const root = document.createElement('section');
    for (const [name, value] of Object.entries(node.props)) root.setAttribute(name === 'className' ? 'class' : name, value);
    root.innerHTML = node.html;
    return { html: root.outerHTML, inventory: [root, ...root.querySelectorAll('*')].map(el => ({
      tag: el.localName, attributes: Object.fromEntries(Array.from(el.attributes, a => [a.name, a.value])),
      text: el.children.length ? null : el.textContent,
    })) };
  }, node);
} finally { await browser.close(); }
await mkdir('artifacts/cta/extraction', { recursive: true });
await writeFile('artifacts/cta/extraction/contract.json', JSON.stringify({ ...contract,
  sourceSha256: createHash('sha256').update(home).digest('hex') }, null, 2));
await writeFile('artifacts/cta/extraction/readable.html', contract.html.replaceAll('><', '>\n<'));
await writeFile('artifacts/cta/extraction/section.html', contract.html);
console.log(`Extracted CTA: ${contract.inventory.length} elements`);
