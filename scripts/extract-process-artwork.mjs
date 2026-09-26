import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// Explicit, offline extraction only. Never invoked by the app or normal tests.
const root = new URL('../', import.meta.url);
const home = await readFile(new URL('data/home.html', root), 'utf8');
const sections = [...home.matchAll(/<section\b[^>]*\bid="process"[^>]*>[\s\S]*?<\/section>/g)];
assert.equal(sections.length, 1);
const section = sections[0][0];
const paths = [...section.matchAll(/<path d="([^"]+)" fill="currentColor"><\/path>/g)].map((match) => match[1]);
assert.equal(paths.length, 14);
const css = section.match(/<style>([\s\S]*?)<\/style>/)[1];
const destination = new URL('components/home/process-artwork.ts', root);
await mkdir(new URL('components/home/', root), { recursive: true });
await writeFile(destination, '// Exact static artwork and inline CSS from the audited legacy Process section.\n'
  + '// Preserve literal backslash-n and the legacy selector typo during parity.\n'
  + `export const processCss = ${JSON.stringify(css)};\n\n`
  + `export const processHeadingPaths = ${JSON.stringify(paths, null, 2)} as const;\n`);
console.log(fileURLToPath(destination));
