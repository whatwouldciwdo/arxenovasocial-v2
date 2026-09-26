import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const home = await readFile(new URL('../data/home.html', import.meta.url), 'utf8');
const sections = Array.from(home.matchAll(/<section\b[^>]*\bid="faqs"[^>]*>[\s\S]*?<\/section>/g));
if (sections.length !== 1) throw new Error('Expected exactly one FAQ section');
const browser = await chromium.launch();
let contract;
try {
  const page = await browser.newPage({ offline: true });
  contract = await page.evaluate((sectionHtml) => {
    const root = document.createElement('div');
    root.innerHTML = sectionHtml;
    const section = root.querySelector('#faqs');
    const items = Array.from(section.querySelectorAll('[data-accordion-status]'), item => ({
      status: item.getAttribute('data-accordion-status'),
      question: item.querySelector('[data-hover-heading]')?.textContent,
      answer: Array.from(item.querySelectorAll('.accordion_css_bottom_rich > *'), element => ({
        tag: element.localName, text: element.textContent, html: element.innerHTML,
      })),
    }));
    const image = section.querySelector('img');
    const link = section.querySelector('a');
    const css = section.querySelector('.faq_css style')?.textContent;
    return { sectionHtml, items, image: image && Object.fromEntries(Array.from(image.attributes, a => [a.name, a.value])),
      link: link && { attributes: Object.fromEntries(Array.from(link.attributes, a => [a.name, a.value])), text: link.textContent },
      css, itemCount: items.length };
  }, sections[0][0]);
} finally {
  await browser.close();
}
await mkdir(new URL('../artifacts/faq/extraction/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/faq/extraction/contract.json', import.meta.url), `${JSON.stringify(contract, null, 2)}\n`);
await writeFile(new URL('../artifacts/faq/extraction/readable.html', import.meta.url), sections[0][0].replace(/></g, '>\n<'));
const runtime = await readFile(new URL('../public/js/monolog-runtime.js', import.meta.url), 'utf8');
const bundle = runtime.slice(runtime.indexOf('/* --- bundle.js --- */'));
const accordionStart = bundle.indexOf('var Ee=');
const accordionEnd = bundle.indexOf('var Tt=', accordionStart);
const accordion = bundle.slice(accordionStart, accordionEnd);
const hoverStart = bundle.indexOf('function ct()');
const hoverEnd = bundle.indexOf('function xe()', hoverStart);
await writeFile(new URL('../artifacts/faq/extraction/runtime.txt', import.meta.url), `${bundle.slice(hoverStart, hoverEnd)}\n\n${accordion}`
  .replaceAll('},', '},\n').replaceAll(');', ');\n'));
console.log(`Extracted ${contract.itemCount} FAQ items.`);
