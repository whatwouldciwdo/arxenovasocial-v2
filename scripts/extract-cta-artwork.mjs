import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const section = await readFile('artifacts/cta/extraction/section.html', 'utf8');
const match = section.match(/<div class="cta_home_awards">([\s\S]*?)<\/div><blockquote class="cta_home_testimonial_message/);
assert(match, 'Expected one CTA awards block');
assert.equal((match[1].match(/<svg\b/g) || []).length, 3);
await mkdir('components/home', { recursive: true });
await writeFile('components/home/cta-artwork.ts',
  '// Exact static award SVGs from the audited legacy CTA section.\n'
  + `export const ctaAwardsHtml = ${JSON.stringify(match[1])};\n`);
console.log('components/home/cta-artwork.ts');
