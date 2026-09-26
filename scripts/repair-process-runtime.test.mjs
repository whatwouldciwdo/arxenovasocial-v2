import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, runInNewContext } from 'node:vm';
import { repairProcessRuntime } from './repair-process-runtime.mjs';

const source = await readFile(new URL('../public/js/monolog-runtime.js', import.meta.url), 'utf8');

test('fixture runtime repair compiles and retains the legacy bundle outside its patch', () => {
  const repaired = repairProcessRuntime(source);
  assert.doesNotThrow(() => new Script(repaired));
  assert.equal(repaired, source, 'deployed repaired runtime is idempotent');
  assert.ok(repaired.includes('oe(true),ScrollTrigger.refresh()'));
  assert.ok(repaired.includes('gsap.ticker.remove(tick)'));
  assert.ok(repaired.includes('window.removeEventListener("resize",resize)'));
  assert.ok(repaired.includes('window.pageCleanupFunctions.add(()=>split.revert())'));
  assert.ok(repaired.includes('window.pageCleanupFunctions.add(()=>ge.revert())'));
});
test('fixture runtime repair fails closed for changed input and accepts deployed input', () => {
  assert.throws(() => repairProcessRuntime(''), /boundary missing/);
  assert.equal(repairProcessRuntime(source), source);
});

test('highlight owns its timeline across resplits and page cleanup', () => {
  const repaired = repairProcessRuntime(source);
  const highlight = repaired.slice(repaired.indexOf('function St(e)'), repaired.indexOf('function bt(e)'));
  const active = new Set();
  const cleanup = new Set();
  let instance;
  const element = { getAttribute: () => null };
  class SplitText {
    constructor(target, vars) {
      instance = this;
      this.vars = vars;
      this.lines = [{ contains: () => true }];
      this.chars = [{}];
      this.split();
    }
    // Match the bundled plugin's animation-adoption contract.
    split() {
      this.revert();
      const animation = this.vars.onSplit(this);
      if (animation?.totalTime) this.animation = animation;
    }
    revert() { this.animation?.revert(); }
  }
  runInNewContext(`${highlight};St(root)`, {
    root: { querySelectorAll: () => [element] }, SplitText,
    window: { pageCleanupFunctions: cleanup },
    gsap: { timeline: options => {
      assert.equal(options.scrollTrigger.trigger, element);
      const timeline = { from() { return this; }, totalTime: () => 0,
        revert: () => active.delete(timeline) };
      active.add(timeline);
      return timeline;
    } },
  });
  assert.equal(active.size, 1);
  assert.ok(active.has(instance.animation));
  for (let i = 0; i < 3; i++) {
    const previous = instance.animation;
    instance.split();
    assert.equal(active.size, 1);
    assert.ok(!active.has(previous));
    assert.ok(active.has(instance.animation));
  }
  assert.equal(cleanup.size, 1);
  cleanup.forEach(fn => fn());
  assert.equal(active.size, 0);
});

test('shared splits release instances and cached references on every page leave', () => {
  const repaired = repairProcessRuntime(source);
  const shared = repaired.slice(repaired.indexOf('function ie(e)'), repaired.indexOf('function Ze(e)'));
  const cleanup = new Set();
  const active = new Set();
  const element = { dataset: {}, hasAttribute: () => true };
  let created = 0;
  const context = {
    element, root: { querySelectorAll: () => [element] },
    window: { pageCleanupFunctions: cleanup }, gsap: { set() {} },
    createScrollAnimation: () => null,
    SplitText: { create(target, vars) {
      created++;
      const split = { lines: [], revert() { active.delete(split); } };
      active.add(split);
      vars.onSplit?.(split);
      return split;
    } },
  };
  for (let cycle = 0; cycle < 3; cycle++) {
    runInNewContext(`${shared};ie(element);ie(element);Ke(element);Ke(element);ve(root)`, context);
    assert.equal(active.size, 3);
    assert.equal(cleanup.size, 3);
    assert.equal(created, (cycle + 1) * 3, 'cached splits are not initialized twice');
    cleanup.forEach(fn => fn());
    cleanup.clear();
    assert.equal(active.size, 0);
    for (const key of ['_splitInstance', '_splitType', '_eyebrowSplit', 'textSplit']) {
      assert.equal(Object.hasOwn(element, key), false, `${key} released`);
    }
  }
});

test('shared theme scroll listener is removed with the same handler on leave', () => {
  const repaired = repairProcessRuntime(source);
  const start = repaired.indexOf('function t(){let r=document.querySelector("[data-nav-bar-height]")');
  const end = repaired.indexOf('t();function o()', start);
  assert.ok(start >= 0 && end > start);
  const cleanup = new Set();
  const handlers = new Set();
  const context = { window: { pageCleanupFunctions: cleanup }, document: {
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener(type, handler) { assert.equal(type, 'scroll'); handlers.add(handler); },
    removeEventListener(type, handler) { assert.equal(type, 'scroll'); assert.ok(handlers.delete(handler)); },
  } };
  for (let cycle = 0; cycle < 3; cycle++) {
    runInNewContext(`${repaired.slice(start, end)};t()`, context);
    assert.equal(handlers.size, 1);
    cleanup.forEach(fn => fn());
    cleanup.clear();
    assert.equal(handlers.size, 0);
  }
});

test('cursor owns listeners, queued frames and tweens across three page cycles', () => {
  const repaired = repairProcessRuntime(source);
  const cursor = repaired.slice(repaired.indexOf('function _e(){'), repaired.indexOf('var M,k,D,Z,Me;'));
  const cleanup = new Set(), frames = new Map(), tweens = new Set(), handlers = new Map();
  const moves = [], scales = [];
  let nextId = 0, hits = 0, status, text = {}, fine = true, exists = true;
  const element = { setAttribute(name, value) { status = value; }, getBoundingClientRect: () => ({ right: 1500 }) };
  const tween = () => {
    const value = { kill() { assert.ok(tweens.delete(value)); } };
    tweens.add(value);
    return value;
  };
  const context = {
    window: { pageCleanupFunctions: cleanup, innerWidth: 1440,
      matchMedia: () => ({ matches: fine }),
      addEventListener(type, handler, options) {
        assert.ok(!handlers.has(type), `${type} registered only once`);
        if (type === 'scroll') assert.equal(options.passive, true);
        handlers.set(type, handler);
      },
      removeEventListener(type, handler) { assert.equal(handlers.get(type), handler); handlers.delete(type); },
    },
    document: {
      querySelector: selector => selector === '[data-cursor]' ? (exists ? element : null) : text,
      elementFromPoint(x, y) { hits++; assert.deepEqual([x, y], [100, 200]);
        return { closest: () => ({ getAttribute: () => 'View project' }) }; },
    },
    gsap: {
      quickTo(target, property, options) {
        assert.equal(target, element); assert.equal(options.duration, .4);
        const fn = value => moves.push([property, value]);
        fn.tween = tween(); return fn;
      },
      to(target, options) { assert.equal(target, element); scales.push(options); return tween(); },
    },
    requestAnimationFrame(fn) { frames.set(++nextId, fn); return nextId; },
    cancelAnimationFrame(id) { assert.ok(frames.delete(id)); },
  };
  for (let cycle = 0; cycle < 3; cycle++) {
    runInNewContext(`${cursor};_e()`, context);
    assert.equal(handlers.size, 4); assert.equal(cleanup.size, 1);
    handlers.get('scroll')(); assert.equal(frames.size, 0);
    handlers.get('mousemove')({ clientX: 100, clientY: 200 });
    assert.deepEqual(moves.slice(-2), [['x', 100], ['y', 200]]);
    for (const [id, fn] of frames) { frames.delete(id); fn(); }
    assert.equal(status, 'active-edge'); assert.equal(text.textContent, 'View project');
    handlers.get('mousedown')({ button: 1 }); assert.equal(tweens.size, 2);
    handlers.get('mousedown')({ button: 0 }); handlers.get('mouseup')({ button: 0 });
    assert.deepEqual(scales.slice(-2).map(({ scale, duration }) => [scale, duration]), [[.9, .4], [1, .3]]);
    handlers.get('mousemove')({ clientX: 100, clientY: 200 }); handlers.get('scroll')();
    assert.equal(frames.size, 2);
    const staleFrames = [...frames.values()], dispose = [...cleanup][0], previousHits = hits;
    dispose(); dispose();
    assert.equal(handlers.size, 0); assert.equal(frames.size, 0);
    assert.equal(tweens.size, 0); assert.equal(cleanup.size, 0);
    staleFrames.forEach(fn => fn()); assert.equal(hits, previousHits);
  }
  fine = false;
  runInNewContext(`${cursor};_e()`, context);
  fine = true; exists = false;
  runInNewContext(`${cursor};_e()`, context);
  assert.equal(handlers.size, 0); assert.equal(tweens.size, 0); assert.equal(cleanup.size, 0);
});
