import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const root = path.resolve(process.env.PROJECT_PROCESS_BASELINE_DIR || path.join(project, 'artifacts', 'project-process'));
const reportFile = process.argv[2] || 'audit-continued.json';
const json = async (file) => JSON.parse(await readFile(path.resolve(root, file), 'utf8'));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const nonempty = async (file) => assert.ok((await stat(file)).size > 0, `Empty evidence: ${file}`);
const report = await json(reportFile);
assert.equal(report.stats.expected, 8);
for (const key of ['unexpected', 'skipped', 'flaky']) assert.equal(report.stats[key], 0, key);
assert.deepEqual(report.errors || [], []);
const inventory = await json('inventory.json');
for (const [file, expected] of Object.entries(inventory.hashes)) {
  assert.equal(sha256(await readFile(path.join(project, file))), expected, `Source changed: ${file}`);
}
const snapshot = await readFile(path.join(root, inventory.snapshot.file));
assert.equal(snapshot.length, inventory.snapshot.bytes);
assert.equal(sha256(snapshot), inventory.snapshot.sha256);
const home = await readFile(path.join(project, 'data', 'home.html'), 'utf8');
const sections = [...home.matchAll(/<section\b[^>]*\bid="process"[^>]*>[\s\S]*?<\/section>/g)];
assert.equal(sections.length, 1);
assert.equal(snapshot.toString('utf8'), sections[0][0]);
assert.equal(inventory.steps.length, 3);

const profiles = ['375x812-pointer', '768x1024-pointer', '1024x768-pointer',
  '1440x900-pointer', '1920x1080-pointer', '375x812-touch', '1440x900-resize'];
const results = [];
for (const name of profiles) {
  const evidence = await json(`${name}.json`);
  assert.equal(evidence.status, 'passed', name);
  assert.deepEqual(evidence.hashes, inventory.hashes, `Evidence source mismatch: ${name}`);
  await nonempty(path.resolve(project, evidence.video));
  const captures = evidence.records.filter((record) => record.snapshot);
  for (const { phase } of captures) await nonempty(path.join(root, name, `${phase}.png`));
  for (let index = 0; index < 3; index += 1) {
    const phase = `step-${index + 1}-visible`;
    const video = evidence.records.find((record) => record.phase === phase)?.snapshot.videos[index];
    assert.ok(video, `${name}: missing ${phase}`);
    assert.equal(video.error, null);
    assert.equal(video.paused, false);
    assert.ok(video.readyState >= 2 && video.currentTime > 0 && video.width > 0 && video.height > 0);
    const link = evidence.records.find((record) => record.phase === `step-${index + 1}-link`);
    assert.equal(link?.href, inventory.steps[index].link.href);
    assert.equal(link.target, '_blank');
  }
  const first = evidence.records.find((record) => record.phase === 'step-1-visible').snapshot;
  results.push({ name, records: evidence.records.length, screenshots: captures.length,
    height: first.elements[0].rect.height,
    positions: [...new Set(first.elements.map((element) => element.style.position))],
    triggerCounts: [...new Set(captures.map(({ snapshot: state }) => state.triggers.length))],
    pinned: captures.some(({ snapshot: state }) => state.triggers.some((trigger) => trigger.pin)),
    events: evidence.events,
  });
}
const summary = {
  generatedAt: new Date().toISOString(), report: reportFile, stats: report.stats,
  sourceHashesVerified: Object.keys(inventory.hashes).length,
  snapshot: inventory.snapshot, counts: inventory.counts, steps: inventory.steps,
  css: inventory.css.map(({ file, rules }) => ({ file, rules: rules.length,
    direct: rules.filter((rule) => rule.direct).length })),
  runtimeReferences: inventory.runtimeReferences.map(({ token, matches }) => ({ token, matches: matches.length })),
  totals: { profiles: results.length, screenshots: results.reduce((sum, result) => sum + result.screenshots, 0),
    videos: results.length },
  profiles: results,
  limitations: ['Evidence integrity validation, not candidate acceptance or a new browser run.',
    'Console warnings/errors are preserved, not waived. Legacy remains default.',
    'Chromium/touch emulation only; YouTube destinations were stubbed; no pixel-diff/manual sign-off.'],
};
await writeFile(path.join(root, 'audit-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
