import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script, runInNewContext } from 'node:vm';
import { legacyProblemsSliderRuntime, repairProblemsRuntime } from './repair-problems-runtime.mjs';

const source = await readFile(new URL('../public/js/monolog-runtime.js', import.meta.url), 'utf8');

function sliderSource(runtime) {
  const start = runtime.indexOf('var problemsSliderOwners=');
  const end = runtime.indexOf('function He()', start);
  assert.ok(start >= 0 && end > start, 'repaired slider markers exist');
  return runtime.slice(start, end);
}

test('exact transformer compiles, is idempotent, and fails closed', () => {
  const repaired = repairProblemsRuntime(source);
  assert.doesNotThrow(() => new Script(repaired));
  assert.equal(repairProblemsRuntime(repaired), repaired);
  assert.throws(() => repairProblemsRuntime(''), /boundary changed/);
  assert.throws(() => repairProblemsRuntime(source.replace('var Fe=16;', 'var Fe=15;')), /boundary changed/);
  assert.equal((repaired.match(/var problemsSliderOwners=/g) ?? []).length, 1);
  const start = source.indexOf('var problemsSliderOwners=') >= 0
    ? source.indexOf('var problemsSliderOwners=') : source.indexOf('var Fe=16;');
  const end = source.indexOf('var O=null;function vt(e)', start);
  const repairedEnd = repaired.indexOf('var O=null;function vt(e)', start);
  assert.ok(start >= 0 && end > start && repairedEnd > start);
  assert.equal(repaired.slice(0, start), source.slice(0, start));
  assert.equal(repaired.slice(repairedEnd), source.slice(end), 'all non-slider bytes are unchanged');
  assert.throws(() => repairProblemsRuntime(source + source.slice(start, end)), /boundary changed/);
  assert.throws(() => repairProblemsRuntime(repaired + repaired.slice(start, repairedEnd)), /boundary changed/);
  assert.throws(() => repairProblemsRuntime(repaired.replace('let disposed=false,trigger;', 'let disposed=true,trigger;')), /boundary changed/);
  assert.throws(() => repairProblemsRuntime(source + repaired.slice(start, repairedEnd)), /boundary changed/);
});

test('legacy slider timing, wrap, progress, viewport, and SplitText contracts remain present', () => {
  const slider = sliderSource(repairProblemsRuntime(source));
  for (const marker of [
    'var Fe=16;',
    'let y=h==="next"?(g+1)%o:(g-1+o)%o',
    'let h=(g+1)%o',
    'l=x,p=w',
    'duration:.5,ease:"power2.inOut"',
    'duration:Fe,ease:"none"',
    'enteringDelay:.4',
    'enteringDelay:.2',
    'get split(){return this.message?.textSplit??null}',
    'h.split.lines',
    'onEnter:enter,onEnterBack:enter,onLeave:G,onLeaveBack:G',
  ]) assert.ok(slider.includes(marker), marker);
  assert.ok(slider.includes('r&&(r.textContent=o)'));
  assert.ok(slider.includes('s&&(s.textContent=g+1)'));
});

function createHarness({ legacy = false } = {}) {
  const cleanup = new Set();
  const animations = new Set();
  const calls = [];
  const triggers = new Set();
  let nextAnimation = 0;

  class Animation {
    constructor(kind, options = {}) {
      this.id = ++nextAnimation;
      this.kind = kind;
      this.options = options ?? {};
      this.children = [];
      this.killed = false;
      this.paused = false;
      this.progress = 0;
      this.operations = [];
      animations.add(this);
    }
    totalProgress() { return this.progress; }
    getChildren() { return this.children.flatMap(child => [child, ...child.getChildren()]); }
    kill() {
      this.killed = true; animations.delete(this);
      // A killed GSAP parent stops its descendants, but references can still exist.
      this.getChildren().forEach(child => animations.delete(child));
      return this;
    }
    killTweensOf(targets) {
      calls.push(['killTweensOf', this.id, targets]);
      for (const child of this.getChildren()) {
        const childTargets = Array.isArray(child.target) ? child.target : [child.target];
        if (childTargets.some(target => targets.includes(target))) child.kill();
      }
      return this;
    }
    pause() { this.paused = true; calls.push(['pause', this.id]); return this; }
    resume() { this.paused = false; calls.push(['resume', this.id]); return this; }
    duration() { return 1; }
    tween(type, target, vars) {
      const child = new Animation('tween', vars);
      child.target = target;
      this.children.push(child);
      this.operations.push({ type, target, vars });
      return this;
    }
    set(target, vars) { calls.push(['timeline.set', target, vars]); return this.tween('set', target, vars); }
    to(target, vars, position) { calls.push(['to', target, vars, position]); return this.tween('to', target, vars); }
    fromTo(target, from, to, position) { calls.push(['fromTo', target, from, to, position]); return this.tween('fromTo', target, to); }
    add(value, position) {
      calls.push(['add', typeof value, position]);
      if (typeof value === 'function') value();
      else if (value) this.children.push(value);
      return this;
    }
    call(fn, args, position) { calls.push(['call', fn, args, position]); return this; }
    complete() {
      this.progress = 1;
      animations.delete(this);
      this.getChildren().forEach(child => { child.progress = 1; animations.delete(child); });
      this.options.onComplete?.();
    }
  }

  const button = () => ({
    listeners: new Map(),
    addEventListener(type, fn) { assert.ok(!this.listeners.has(type)); this.listeners.set(type, fn); },
    removeEventListener(type, fn) { assert.equal(this.listeners.get(type), fn); this.listeners.delete(type); },
  });
  const next = button(), prev = button();
  const progressStart = { name: 'start' }, progressEnd = { name: 'end' };
  const counter = {}, dynamic = {};
  const items = Array.from({ length: 3 }, (_, index) => {
    const headshot = { name: `headshot-${index}` };
    const details = [{ name: `detail-${index}` }];
    const message = { textSplit: { lines: [{ name: `line-${index}` }] } };
    return {
      name: `item-${index}`, headshot, details, message,
      querySelector(selector) {
        return selector === '[data-slider-headshot]' ? headshot : selector === '[data-slider-message]' ? message : null;
      },
      querySelectorAll: selector => selector === '[data-slider-details]' ? details : [],
    };
  });
  const selections = new Map([
    ['[data-slider-next]', next], ['[data-slider-prev]', prev],
    ['[data-counter-value]', counter], ['[data-dynamic-value]', dynamic],
    ['[data-progress-bar-start]', progressStart], ['[data-progress-bar-end]', progressEnd],
  ]);
  const root = {
    querySelector: selector => selections.get(selector) ?? null,
    querySelectorAll: selector => selector === '[data-slider-item]' ? items : [],
  };
  const gsap = {
    timeline(options) { calls.push(['timeline', options]); return new Animation('timeline', options); },
    set(target, vars) { calls.push(['set', target, vars]); return new Animation('set'); },
    killTweensOf() { if (!legacy) throw new Error('slider must not kill unrelated global tweens'); },
  };
  const ScrollTrigger = { create(options) {
    const trigger = { options, killed: false, kill() { this.killed = true; triggers.delete(this); } };
    triggers.add(trigger); return trigger;
  } };
  const context = { root, window: { pageCleanupFunctions: cleanup }, gsap, ScrollTrigger,
    c: { fast: .4, slow: 1 }, console: { warn() {} } };
  return { context, root, next, prev, counter, dynamic, items, progressStart, progressEnd,
    cleanup, animations, calls, triggers, selections };
}

test('VM lifecycle owns initial/swap animations, trigger, and named listeners', () => {
  const code = sliderSource(repairProblemsRuntime(source));
  const h = createHarness();
  runInNewContext(`${code};ht(root)`, h.context);

  assert.equal(h.counter.textContent, 3);
  assert.equal(h.dynamic.textContent, 1);
  assert.equal(h.next.listeners.size, 1);
  assert.equal(h.prev.listeners.size, 1);
  assert.equal(h.triggers.size, 1);
  assert.equal(h.cleanup.size, 1);
  assert.ok(h.calls.some(([type, target]) => type === 'fromTo' && target === h.items[0].message.textSplit.lines),
    'initial F(t[g]) timeline is captured');
  assert.ok(h.calls.some(([type, target, vars]) => type === 'to' && target === h.progressStart && vars.duration === 16));

  h.next.listeners.get('click')();
  assert.equal(h.dynamic.textContent, 2);
  h.prev.listeners.get('click')();
  assert.equal(h.dynamic.textContent, 1, 'previous wraps from index one to zero');
  h.prev.listeners.get('click')();
  assert.equal(h.dynamic.textContent, 3, 'previous wraps from zero to last');

  const trigger = [...h.triggers][0];
  trigger.options.onLeave();
  assert.ok(h.calls.some(([type]) => type === 'pause'));
  trigger.options.onEnterBack();
  assert.ok(h.calls.some(([type]) => type === 'resume'));

  const staleCallbacks = h.calls.filter(([type]) => type === 'call').map(([, fn]) => fn);
  const dispose = [...h.cleanup][0];
  dispose(); dispose();
  assert.equal(h.next.listeners.size, 0);
  assert.equal(h.prev.listeners.size, 0);
  assert.equal(h.triggers.size, 0);
  assert.equal(h.animations.size, 0);
  assert.equal(h.cleanup.size, 0);
  staleCallbacks.forEach(fn => fn());
  assert.equal(h.animations.size, 0, 'stale timeline callbacks do not animate after cleanup');
});

test('per-root guard prevents duplicate initialization and permits clean re-entry', () => {
  const code = sliderSource(repairProblemsRuntime(source));
  const h = createHarness();
  runInNewContext(`${code};ht(root);ht(root)`, h.context);
  assert.equal(h.cleanup.size, 1);
  assert.equal(h.next.listeners.size, 1);
  [...h.cleanup][0]();
  assert.equal(h.animations.size, 0);
  runInNewContext('ht(root)', h.context);
  assert.equal(h.cleanup.size, 1);
  assert.equal(h.next.listeners.size, 1);
  [...h.cleanup][0]();
  assert.equal(h.animations.size, 0);
});

test('VM autoplay keeps 16 seconds, alternates bars, wraps next, and resumes the same clock', () => {
  const h = createHarness();
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root)`, h.context);
  const progress = () => [...h.animations].find(animation =>
    animation.kind === 'timeline' && animation.operations.some(op => op.vars.duration === 16));
  const trigger = [...h.triggers][0];
  let current = progress();
  assert.equal(current.operations[0].target, h.progressStart);
  for (const [leave, enter] of [['onLeave', 'onEnter'], ['onLeaveBack', 'onEnterBack']]) {
    trigger.options[leave]();
    assert.equal(current.paused, true);
    trigger.options[enter]();
    assert.equal(current.paused, false);
    assert.equal(progress(), current, 'resume does not restart autoplay');
  }
  for (let index = 0; index < 4; index++) {
    current.complete();
    current = progress();
    assert.equal(h.dynamic.textContent, (index + 1) % 3 + 1);
    const incoming = index % 2 === 0 ? h.progressEnd : h.progressStart;
    assert.equal(current.operations[1].target, incoming);
    assert.equal(current.operations[0].vars.duration, .5);
    assert.equal(current.operations[1].vars.duration, 16);
    assert.equal(current.operations[1].vars.ease, 'none');
    assert.ok(h.calls.some(([type, target, vars, position]) =>
      type === 'to' && target === incoming && vars.duration === 16 && position === .4));
  }
  h.next.listeners.get('click')();
  h.next.listeners.get('click')();
  assert.equal(h.dynamic.textContent, 1, 'next wraps last to first');
  assert.ok(h.calls.some(([type, , vars, position]) => type === 'to' && vars.duration === 16 && position === .2));
  [...h.cleanup][0]();
  assert.equal(h.animations.size, 0);
});

test('VM cleanup during initial entry leaves unrelated animations, triggers, and splits intact', () => {
  const h = createHarness();
  const sharedSplit = h.items[0].message.textSplit;
  sharedSplit.revert = () => assert.fail('slider does not own shared SplitText');
  const unrelatedAnimation = h.context.gsap.timeline().to(h.items[0], { duration: 20 });
  const unrelatedTrigger = h.context.ScrollTrigger.create({ trigger: h.root });
  const unrelatedCleanup = () => {};
  h.cleanup.add(unrelatedCleanup);
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root)`, h.context);
  const initial = [...h.animations].find(animation =>
    animation.operations.some(op => op.type === 'fromTo' && op.target === sharedSplit.lines));
  assert.ok(initial);
  const dispose = [...h.cleanup].find(fn => fn !== unrelatedCleanup);
  dispose(); dispose();
  assert.equal(initial.killed, true, 'initial F(t[g]) is explicitly owned');
  assert.deepEqual([...h.animations], [unrelatedAnimation, ...unrelatedAnimation.children]);
  assert.deepEqual([...h.triggers], [unrelatedTrigger]);
  assert.deepEqual([...h.cleanup], [unrelatedCleanup]);
  assert.equal(h.items[0].message.textSplit, sharedSplit);
});

test('VM stale callbacks cannot recreate resources or affect a reinitialized root', () => {
  const h = createHarness();
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root)`, h.context);
  const next = h.next.listeners.get('click');
  const prev = h.prev.listeners.get('click');
  next();
  const stale = [next, prev, ...Object.values([...h.triggers][0].options).filter(value => typeof value === 'function'),
    ...[...h.animations].map(animation => animation.options.onComplete).filter(Boolean),
    ...h.calls.filter(([type]) => type === 'call').map(([, fn]) => fn)];
  const dispose = [...h.cleanup][0];
  dispose();
  stale.forEach(fn => fn());
  assert.equal(h.animations.size, 0);
  runInNewContext('ht(root)', h.context);
  const count = h.calls.length;
  dispose(); stale.forEach(fn => fn());
  assert.equal(h.calls.length, count);
  assert.equal(h.dynamic.textContent, 1);
  assert.equal(h.cleanup.size, 1);
  [...h.cleanup][0]();
  assert.equal(h.animations.size, 0);
});

test('VM reads current SplitText lines after resplits, tolerates missing splits and optional nodes', () => {
  const h = createHarness();
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root)`, h.context);
  const outgoing = [{ name: 'resplit-out' }], incoming = [{ name: 'resplit-in' }];
  h.items[0].message.textSplit = { lines: outgoing };
  h.items[1].message.textSplit = { lines: incoming };
  h.next.listeners.get('click')();
  assert.ok(h.calls.some(([type, target]) => type === 'to' && target === outgoing));
  assert.ok(h.calls.some(([type, target]) => type === 'fromTo' && target === incoming));
  [...h.cleanup][0]();

  const missing = createHarness();
  missing.items.forEach(item => { delete item.message.textSplit; item.details.length = 0; });
  missing.selections.delete('[data-counter-value]');
  missing.selections.delete('[data-dynamic-value]');
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root)`, missing.context);
  missing.next.listeners.get('click')();
  [...missing.cleanup][0]();
  assert.equal(missing.animations.size, 0);

  const empty = createHarness();
  empty.items.length = 0;
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root)`, empty.context);
  assert.equal(empty.cleanup.size, 0);
  assert.equal(empty.animations.size, 0);
  assert.equal(empty.triggers.size, 0);

  const minimal = createHarness();
  minimal.items.length = 1;
  minimal.items[0].querySelector = selector => selector === '[data-slider-message]' ? minimal.items[0].message : null;
  minimal.items[0].details.length = 0;
  minimal.selections.clear();
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root)`, minimal.context);
  const clock = [...minimal.animations].find(animation =>
    animation.kind === 'timeline' && animation.operations.some(op => op.vars.duration === 16));
  clock.complete();
  [...minimal.cleanup][0]();
  assert.equal(minimal.animations.size, 0);
});

test('VM repeated page cycles and independent roots have independent owners', () => {
  const h = createHarness(), other = createHarness();
  h.context.otherRoot = other.root;
  runInNewContext(`${sliderSource(repairProblemsRuntime(source))};ht(root);ht(otherRoot)`, h.context);
  assert.equal(h.cleanup.size, 2);
  [...h.cleanup][0]();
  assert.equal(h.next.listeners.size, 0);
  assert.equal(other.next.listeners.size, 1);
  other.next.listeners.get('click')();
  assert.equal(other.dynamic.textContent, 2);
  [...h.cleanup][0]();
  assert.equal(h.animations.size, 0);
  for (let cycle = 0; cycle < 3; cycle++) {
    runInNewContext('ht(root);ht(root)', h.context);
    h.next.listeners.get('click')();
    h.prev.listeners.get('click')();
    [...h.cleanup][0]();
    assert.equal(h.animations.size, 0);
    assert.equal(h.triggers.size, 0);
    assert.equal(h.next.listeners.size, 0);
  }
});

test('VM animation call trace matches actual legacy source before lifecycle disposal', () => {
  // Use the exact-match legacy boundary even after the public bundle is promoted.
  const original = legacyProblemsSliderRuntime;
  assert.ok(!original.includes('const animations='), 'comparison requires unpromoted source');
  const exercise = (code, legacy) => {
    const h = createHarness({ legacy });
    runInNewContext(`${code};ht(root)`, h.context);
    h.next.listeners.get('click')();
    h.prev.listeners.get('click')();
    const deferred = h.calls.filter(([type]) => type === 'call').map(([, fn]) => fn);
    deferred.forEach(fn => fn());
    const trace = h.calls.filter(([type]) => type !== 'killTweensOf').map(call =>
      JSON.parse(JSON.stringify(call, (key, value) => {
        if (typeof value === 'function') return '<callback>';
        if (value?.name) return value.name;
        return value;
      })));
    return trace;
  };
  assert.deepEqual(exercise(sliderSource(repairProblemsRuntime(source)), false), exercise(original, true));
});
