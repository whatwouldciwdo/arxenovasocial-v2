import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export function repairProcessRuntime(source) {
  if (source.includes('let fixtureLenisCleanup;')) return source;
  function replaceOnce(before, after) {
    if (source.split(before).length !== 2) throw new Error(`Runtime boundary changed: ${before.slice(0, 80)}`);
    source = source.replace(before, after);
  }
  const start = source.indexOf('function oe(){if(Webflow.env("editor"))');
  const end = source.indexOf('var Ye=', start);
  if (start < 0 || end < 0) throw new Error('Lenis runtime boundary missing');
  replaceOnce(source.slice(start, end), `let fixtureLenisCleanup;
function oe(preserveScroll=false){
  if(Webflow.env("editor"))return;
  const position=preserveScroll?window.scrollY:0;
  fixtureLenisCleanup?.();
  b?.destroy();
  const horizontal=document.body.getAttribute("data-page-type")==="horizontal"&&!te();
  const instance=new Lenis({duration:.5,orientation:horizontal?"horizontal":"vertical"});
  b=instance;
  let interval,timeout;
  if(!preserveScroll){
    interval=setInterval(()=>{if(window.scrollY!==0){window.scrollTo(0,0);instance.scrollTo(0,{immediate:true,force:true})}},16);
    timeout=setTimeout(()=>clearInterval(interval),1000);
  }
  instance.scrollTo(position,{immediate:true,force:true});
  instance.on("scroll",ScrollTrigger.update);
  const tick=time=>{instance.raf(time*1000);K?.raf(time*1500)};
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  const top=document.querySelector("#to-top");
  const onTop=()=>instance.scrollTo(0,{duration:1});
  top?.addEventListener("click",onTop);
  const anchors=Array.from(document.querySelectorAll('a[href^="#"]'));
  const onAnchor=event=>{
    const href=event.currentTarget.getAttribute("href");
    if(href==="#")return;
    const target=document.querySelector(href);
    if(target){event.preventDefault();event.stopPropagation();instance.scrollTo(target,{duration:1.2,offset:20})}
  };
  anchors.forEach(anchor=>anchor.addEventListener("click",onAnchor,true));
  const cleanup=()=>{
    clearInterval(interval);clearTimeout(timeout);
    gsap.ticker.remove(tick);
    instance.off("scroll",ScrollTrigger.update);
    top?.removeEventListener("click",onTop);
    anchors.forEach(anchor=>anchor.removeEventListener("click",onAnchor,true));
    window.pageCleanupFunctions.delete(cleanup);
    if(fixtureLenisCleanup===cleanup)fixtureLenisCleanup=null;
  };
  fixtureLenisCleanup=cleanup;
  window.pageCleanupFunctions.add(cleanup);
}`);
  replaceOnce('t!==o&&(t=o,oe(),ScrollTrigger.refresh())', 't!==o&&(t=o,oe(true),ScrollTrigger.refresh())');
  replaceOnce('function at(){let e,t=j();window.addEventListener("resize",()=>{clearTimeout(e),e=setTimeout(()=>{me();let o=j();t!==o&&(t=o,oe(true),ScrollTrigger.refresh())},150)})}',
    'function at(){let e,t=j();const resize=()=>{clearTimeout(e);e=setTimeout(()=>{me();let o=j();t!==o&&(t=o,oe(true),ScrollTrigger.refresh())},150)};window.addEventListener("resize",resize);window.pageCleanupFunctions.add(()=>{clearTimeout(e);window.removeEventListener("resize",resize)})}');
  const highlightStart = source.indexOf('function St(e)');
  const highlightEnd = source.indexOf('function bt(e)', highlightStart);
  if (highlightStart < 0 || highlightEnd < 0) throw new Error('Highlight runtime boundary missing');
  let highlight = source.slice(highlightStart, highlightEnd);
  highlight = highlight.replace('new SplitText(o,', 'const split=new SplitText(o,');
  const suffix = '})}})})}';
  if (!highlight.endsWith(suffix)) throw new Error('Highlight cleanup boundary changed');
  // SplitText 3.15 owns only a returned animation (totalTime/revert), not a
  // gsap.context. Return the timeline so font/width resplits revert old triggers.
  const contextBoundary = 'onSplit(u){return gsap.context(()=>{';
  if (highlight.split(contextBoundary).length !== 2) throw new Error('Highlight animation boundary changed');
  highlight = highlight.replace(contextBoundary, 'onSplit(u){');
  highlight = highlight.slice(0, -suffix.length) + ';return f}});window.pageCleanupFunctions.add(()=>split.revert())})}';
  replaceOnce(source.slice(highlightStart, highlightEnd), highlight);
  // Reverting triggers alone does not unregister matchMedia callbacks. They would
  // recreate animations against outgoing nodes on the next breakpoint change.
  replaceOnce('t.length<2||gsap.matchMedia().add("(min-width: 992px)",()=>{',
    'const media=gsap.matchMedia();window.pageCleanupFunctions.add(()=>media.revert());t.length<2||media.add("(min-width: 992px)",()=>{');
  replaceOnce('function xt(){gsap.matchMedia().add("(hover: none), (pointer: coarse)",()=>{',
    'function xt(){const media=gsap.matchMedia();window.pageCleanupFunctions.add(()=>media.revert());media.add("(hover: none), (pointer: coarse)",()=>{');
  replaceOnce('function We(e){oe(),ve(e)',
    'function We(e){window.pageCleanupFunctions.add(()=>ge.revert());oe(),ve(e)');
  // Shared splits must release font listeners/observers as well as their DOM.
  replaceOnce('return e._splitInstance=n,e._splitType=t,gsap.set(e,{autoAlpha:1}),{instance:n,type:t}',
    'window.pageCleanupFunctions.add(()=>{n.revert();delete e._splitInstance;delete e._splitType});return e._splitInstance=n,e._splitType=t,gsap.set(e,{autoAlpha:1}),{instance:n,type:t}');
  replaceOnce('t.length&&t.forEach(o=>{SplitText.create(o,{type:"lines",linesClass:"lines-split"',
    't.length&&t.forEach(o=>{const split=SplitText.create(o,{type:"lines",linesClass:"lines-split"');
  replaceOnce('createScrollAnimation(n.lines,o):null)})})}function Ke(e)',
    'createScrollAnimation(n.lines,o):null)});window.pageCleanupFunctions.add(()=>{split.revert();delete o.textSplit})})}function Ke(e)');
  replaceOnce('return e._eyebrowSplit=t,t}',
    'window.pageCleanupFunctions.add(()=>{t.revert();delete e._eyebrowSplit});return e._eyebrowSplit=t,t}');
  replaceOnce('function u(){document.addEventListener("scroll",d)}d(),u()',
    'function u(){document.addEventListener("scroll",d);window.pageCleanupFunctions.add(()=>document.removeEventListener("scroll",d))}d(),u()');
  // Cursor initialization runs on every page. Own only its listeners, queued
  // hit tests and tweens; never kill unrelated animation on the shared cursor.
  replaceOnce('window.addEventListener("mousemove",u=>{o=u.clientX,n=u.clientY,a=!0,r(o),s(n),requestAnimationFrame(d)}),window.addEventListener("scroll",()=>{a&&requestAnimationFrame(d)},{passive:!0}),window.addEventListener("mousedown",u=>{u.button===0&&gsap.to(e,{scale:.9,duration:.4,ease:"power2.out"})}),window.addEventListener("mouseup",u=>{u.button===0&&gsap.to(e,{scale:1,duration:.3,ease:"power2.out"})})', `
const frames=new Set(),scales=new Set();
let disposed=false;
const schedule=()=>{
  const id=requestAnimationFrame(()=>{frames.delete(id);if(!disposed)d()});
  frames.add(id);
};
const move=u=>{o=u.clientX;n=u.clientY;a=true;r(o);s(n);schedule()};
const scroll=()=>{if(a)schedule()};
const scale=(value,duration)=>{
  const tween=gsap.to(e,{scale:value,duration,ease:"power2.out",onComplete:()=>scales.delete(tween)});
  scales.add(tween);
};
const down=u=>{if(u.button===0)scale(.9,.4)};
const up=u=>{if(u.button===0)scale(1,.3)};
window.addEventListener("mousemove",move);
window.addEventListener("scroll",scroll,{passive:true});
window.addEventListener("mousedown",down);
window.addEventListener("mouseup",up);
const cleanup=()=>{
  if(disposed)return;
  disposed=true;
  window.removeEventListener("mousemove",move);
  window.removeEventListener("scroll",scroll);
  window.removeEventListener("mousedown",down);
  window.removeEventListener("mouseup",up);
  frames.forEach(id=>cancelAnimationFrame(id));frames.clear();
  r.tween.kill();s.tween.kill();
  scales.forEach(tween=>tween.kill());scales.clear();
  window.pageCleanupFunctions.delete(cleanup);
};
window.pageCleanupFunctions.add(cleanup);
`);
  return source;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = process.argv[2];
  const output = process.argv[3];
  if (!input || !output) throw new Error('Usage: node repair-process-runtime.mjs <input> <output>');
  await writeFile(output, repairProcessRuntime(await readFile(input, 'utf8')));
}
