import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('public/js/monolog-runtime.js', 'utf8');
const start = source.indexOf('function Ae()');
const end = source.indexOf('var faqAccordionOwners=', start);
if (start < 0 || end < 0) throw new Error('CTA runtime boundary not found');
const runtime = source.slice(start, end);
if (!runtime.includes('data-scroll-container') || !runtime.includes('dataset.targetTranslate')
  || !runtime.includes('data-translate-hero')) throw new Error('Unexpected CTA runtime shape');
await writeFile('artifacts/cta/extraction/runtime.txt', runtime
  .replaceAll('},', '},\n')
  .replaceAll(';', ';\n'));
console.log(`Extracted CTA runtime: ${runtime.length} bytes`);
