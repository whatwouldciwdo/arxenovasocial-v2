import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';

const project = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(project, 'artifacts/home-shell');
await mkdir(output, { recursive: true });
const source = await readFile(path.join(project, 'data/home.html'), 'utf8');
const boundary = '</div></div></div></div></div></div></div></section><section id="process"';
if (source.split(boundary).length !== 2) throw new Error('Unexpected Problems/Process boundary');
const stack = [], mismatches = [], boundaries = [];
const tokens = /<!--[\s\S]*?-->|<(style|script)\b[^>]*>[\s\S]*?<\/\1\s*>|<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g;
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
for (const token of source.matchAll(tokens)) {
  const tag = token[2]?.toLowerCase();
  if (!tag || voidTags.has(tag) || /\/>$/.test(token[0])) continue;
  if (token[0].startsWith('</')) {
    const top = stack.at(-1);
    if (top?.tag !== tag) mismatches.push({ offset: token.index, close: tag, stack: stack.slice(-5) });
    const index = stack.map((entry) => entry.tag).lastIndexOf(tag);
    if (index >= 0) stack.splice(index);
  } else {
    if (tag === 'section') boundaries.push({ offset: token.index, tag: token[0], stack: [...stack] });
    stack.push({ tag, offset: token.index, open: token[0] });
  }
}
const browser = await chromium.launch();
const variants = [];
try {
  const page = await browser.newPage();
  for (let remove = 0; remove <= 5; remove++) {
    const html = source.replace(boundary, '</div>'.repeat(7 - remove) + '</section><section id="process"');
    const result = await page.evaluate((markup) => {
      const doc = new DOMParser().parseFromString(`<body><div>${markup}</div></body>`, 'text/html');
      const sections = Array.from(doc.querySelectorAll('section'), (section) => ({
        class: section.className, parent: section.parentElement?.className,
        inContainer: !!section.closest('[data-barba="container"]'),
        inMain: !!section.closest('main'),
      }));
      return { sections, containerCount: doc.querySelectorAll('[data-barba="container"]').length };
    }, html);
    variants.push({ remove, ...result });
  }
} finally { await browser.close(); }
await writeFile(path.join(output, 'structure-audit.json'), JSON.stringify({ boundaries, mismatches, remaining: stack, variants }, null, 2));
console.log(JSON.stringify({ mismatches, variants }, null, 2));
