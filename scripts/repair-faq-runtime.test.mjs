import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, runInNewContext } from 'node:vm';
import { repairFaqRuntime } from './repair-faq-runtime.mjs';

const source = await readFile(new URL('../public/js/monolog-runtime.js', import.meta.url), 'utf8');
const repaired = repairFaqRuntime(source);

test('FAQ repair compiles, is idempotent, and rejects changed boundaries', () => {
  assert.doesNotThrow(() => new Script(repaired));
  assert.equal(repairFaqRuntime(repaired), repaired);
  assert.throws(() => repairFaqRuntime(''), /boundary changed/);
  assert.throws(() => repairFaqRuntime(repaired.replace('faqAccordionOwners.has(e)', 'broken.has(e)')), /boundary changed/);
});

test('accordion owns one delegated listener, preserves sibling behavior, and releases on leave', () => {
  const start = repaired.indexOf('var faqAccordionOwners=');
  const script = repaired.slice(start, repaired.indexOf('function _e()', start));
  const cleanup = new Set(), listeners = new Set();
  const items = [0, 1].map(() => ({ status: 'not-active', getAttribute() { return this.status; },
    setAttribute(name, value) { this.status = value; } }));
  const root = {
    getAttribute: () => 'true', querySelectorAll: () => items.filter(item => item.status === 'active'),
    addEventListener(type, fn) { assert.equal(type, 'click'); listeners.add(fn); },
    removeEventListener(type, fn) { assert.equal(type, 'click'); listeners.delete(fn); },
  };
  const context = { document: { querySelectorAll: () => [root] }, window: { pageCleanupFunctions: cleanup } };
  runInNewContext(`${script};globalThis.init=Ee`, context);
  for (let cycle = 0; cycle < 3; cycle++) {
    context.init(); context.init();
    assert.equal(listeners.size, 1); assert.equal(cleanup.size, 1);
    const click = index => [...listeners][0]({ target: { closest: () => ({ closest: () => items[index] }) } });
    click(0); assert.equal(items[0].status, 'active');
    click(1); assert.equal(items[0].status, 'not-active'); assert.equal(items[1].status, 'active');
    click(1); assert.equal(items[1].status, 'not-active');
    const dispose = [...cleanup][0]; dispose(); dispose();
    assert.equal(listeners.size, 0); assert.equal(cleanup.size, 0);
  }
});

test('hover owns two listeners and its tween without changing baseline colors or timings', () => {
  const start = repaired.indexOf('var faqHighlightOwners=');
  const script = repaired.slice(start, repaired.indexOf('function xe()', start));
  const cleanup = new Set(), listeners = new Map(), tweens = new Set(), calls = [];
  const element = { dataset: { hoverHighlight: 'accordion' }, getAttribute: () => null,
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type, fn) { assert.equal(listeners.get(type), fn); listeners.delete(type); } };
  const context = { document: { querySelectorAll: () => [element] },
    window: { pageCleanupFunctions: cleanup, matchMedia: () => ({ matches: true }) },
    c: { fast: 0.3, normal: 0.6 }, gsap: { to(target, options) {
      assert.equal(target, element); calls.push(options);
      const tween = { kill: () => tweens.delete(tween) }; tweens.add(tween); return tween;
    } } };
  runInNewContext(`${script};globalThis.init=ct`, context);
  for (let cycle = 0; cycle < 3; cycle++) {
    context.init(); context.init();
    assert.equal(listeners.size, 2); assert.equal(cleanup.size, 1);
    listeners.get('mouseenter')(); listeners.get('mouseleave')();
    assert.equal(tweens.size, 1);
    assert.equal(calls.at(-2).backgroundColor, '#fafaf9'); assert.equal(calls.at(-2).duration, 0.3);
    assert.equal(calls.at(-1).backgroundColor, 'transparent'); assert.equal(calls.at(-1).duration, 0.6);
    [...cleanup][0]();
    assert.equal(listeners.size, 0); assert.equal(tweens.size, 0); assert.equal(cleanup.size, 0);
  }
});
