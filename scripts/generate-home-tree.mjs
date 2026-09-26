import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { generateHomeTree } from './prepare-process-integration.mjs';

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
  throw new Error('Usage: node scripts/generate-home-tree.mjs [--check]');
}

const source = new URL('../data/home.html', import.meta.url);
const target = new URL('../data/process-integration-tree.ts', import.meta.url);
const generated = await generateHomeTree(await readFile(source, 'utf8'));

if (args[0] === '--check') {
  const current = await readFile(target, 'utf8').catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (current !== generated) {
    throw new Error('Home tree is stale. Run node scripts/generate-home-tree.mjs');
  }
  console.log('Home tree is current.');
} else {
  await writeFile(target, generated);
  console.log(`Generated home tree: ${fileURLToPath(target)}`);
}
