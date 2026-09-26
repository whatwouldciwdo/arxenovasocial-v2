import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sliderBefore = 'var Fe=16;function gt(e){let t=e.querySelectorAll("[data-slider-item]");return Array.from(t,o=>({root:o,headshot:o.querySelector("[data-slider-headshot]"),message:o.querySelector("[data-slider-message]"),details:Array.from(o.querySelectorAll("[data-slider-details]")),get split(){return this.message?.textSplit??null}}))}function ht(e){let t=gt(e),o=t.length;if(!o)return;let n=e.querySelector("[data-slider-next]"),a=e.querySelector("[data-slider-prev]"),r=e.querySelector("[data-counter-value]"),s=e.querySelector("[data-dynamic-value]"),d=e.querySelector("[data-progress-bar-start]"),u=e.querySelector("[data-progress-bar-end]"),g=0,i=null,f=null,l=d,p=u;r&&(r.textContent=o);let m=()=>{s&&(s.textContent=g+1)},v=h=>{gsap.set(h.root,{opacity:0,yPercent:150}),h.headshot&&gsap.set(h.headshot,{opacity:0,yPercent:100}),h.details.length&&gsap.set(h.details,{opacity:0})},S=h=>{gsap.killTweensOf(h.root),gsap.killTweensOf(h.headshot),h.details.length&&gsap.killTweensOf(h.details)},E=()=>t.forEach(v),ae=()=>{gsap.set(d,{xPercent:-100}),gsap.set(u,{xPercent:-100}),l=d,p=u},z=({enteringDelay:h,onSwapStart:y})=>{let w=l,x=p;l=x,p=w,gsap.set(x,{xPercent:-100}),i=gsap.timeline({onComplete:()=>W()}),y&&i.add(y,0),i.to(w,{xPercent:100,duration:.5,ease:"power2.inOut"},0),i.to(x,{xPercent:0,duration:Fe,ease:"none"},h)},I=()=>{i&&i.kill(),i=gsap.timeline({onComplete:()=>W()}),i.to(l,{xPercent:0,duration:Fe,ease:"none"})},W=()=>{i&&i.kill();let h=(g+1)%o;z({enteringDelay:.4,onSwapStart:()=>X(h)})},G=()=>{i&&i.pause()},$=()=>{i&&(i.kill(),i=null),f&&(f.kill(),f=null)},Q=h=>{if(!h.split)return console.warn("Missing SplitText instance for testimonial:",h.root),null;let y=c.fast,w=gsap.timeline();return w.to(h.split.lines,{yPercent:-150,opacity:0,stagger:.03,ease:"ease-primary",duration:y}),w.to(h.headshot,{yPercent:-50,opacity:0,ease:"ease-primary",duration:y},`-=${y*1.2}`),h.details.length&&w.to(h.details,{yPercent:-150,opacity:0,ease:"ease-primary",duration:y,stagger:.03},"<"),w},F=h=>{if(!h.split)return console.warn("Missing SplitText instance for testimonial:",h.root),null;let y=gsap.timeline();return y.set(h.root,{opacity:1,yPercent:0}).fromTo(h.split.lines,{yPercent:150,opacity:0},{yPercent:0,opacity:1,stagger:.03,ease:"ease-transition",duration:c.slow}),y.fromTo(h.headshot,{yPercent:50,opacity:0},{yPercent:0,opacity:1,ease:"ease-transition",duration:c.slow},"-=1"),h.details.length&&y.fromTo(h.details,{yPercent:150,opacity:0},{yPercent:0,opacity:1,ease:"ease-transition",duration:c.slow,stagger:.03},"<"),y},X=h=>{f&&(f.kill(),f=null);let y=t[g],w=t[h];g=h,m();let x=Q(y);if(!x)return;let N=x.duration()*.6;f=gsap.timeline({onComplete:()=>{f=null}}),f.add(x,0).call(()=>{S(y),v(y)},null,N).add(F(w),N)},U=h=>{$();let y=h==="next"?(g+1)%o:(g-1+o)%o;z({enteringDelay:.2,onSwapStart:()=>X(y)})};n?.addEventListener("click",()=>U("next")),a?.addEventListener("click",()=>U("prev")),E(),ae(),F(t[g]),m(),I(),ScrollTrigger.create({trigger:e,start:"top bottom",end:"bottom top",onEnter:()=>{i?i.resume():I()},onEnterBack:()=>{i?i.resume():I()},onLeave:G,onLeaveBack:G})}function He(){document.querySelectorAll("[data-slider]").forEach(e=>ht(e))}';

export const legacyProblemsSliderRuntime = sliderBefore;

// Keep the legacy animation body intact; change only ownership and callback entry points.
let sliderAfter = sliderBefore;
function patch(before, after) {
  if (sliderAfter.split(before).length !== 2) throw new Error('Problems patch definition changed');
  sliderAfter = sliderAfter.replace(before, after);
}
patch('var Fe=16;', 'var problemsSliderOwners=new WeakMap();var Fe=16;');
patch('function ht(e){let t=gt(e)', 'function ht(e){if(problemsSliderOwners.has(e))return;let t=gt(e)');
patch('r&&(r.textContent=o);let m=', `r&&(r.textContent=o);
let disposed=false,trigger;
const animations=new Set();
const own=animation=>{
  // Completed animations no longer need retaining on a long-lived autoplay slider.
  for(const previous of animations)if(previous.totalProgress()===1)animations.delete(previous);
  animations.add(animation);
  return animation;
};
const timeline=options=>own(gsap.timeline(options));
const set=(target,vars)=>own(gsap.set(target,vars));
const kill=animation=>{
  if(!animation)return;
  // Nested entrance/exit timelines are owned too, including an interrupted swap.
  animation.getChildren?.(true,true,true).forEach(child=>{animations.delete(child);child.kill()});
  animation.kill();animations.delete(animation);
};
const cleanup=()=>{
  if(disposed)return;
  disposed=true;
  n?.removeEventListener("click",next);
  a?.removeEventListener("click",prev);
  trigger?.kill();
  for(const animation of animations)kill(animation);
  animations.clear();i=null;f=null;trigger=null;
  problemsSliderOwners.delete(e);
  window.pageCleanupFunctions.delete(cleanup);
};
let m=`);
// Limit substitutions to the original body, not the ownership helpers above.
const bodyStart = sliderAfter.indexOf('let m=');
sliderAfter = sliderAfter.slice(0, bodyStart) + sliderAfter.slice(bodyStart)
  .replaceAll('gsap.set(', 'set(')
  .replaceAll('gsap.timeline(', 'timeline(')
  .replaceAll('i&&i.kill()', 'i&&kill(i)')
  .replaceAll('i.kill(),i=null', 'kill(i),i=null')
  .replaceAll('f.kill(),f=null', 'kill(f),f=null');
patch('S=h=>{gsap.killTweensOf(h.root),gsap.killTweensOf(h.headshot),h.details.length&&gsap.killTweensOf(h.details)}',
  'S=h=>{for(const animation of animations)animation.killTweensOf?.([h.root,h.headshot,...h.details].filter(Boolean))}');
patch('W=()=>{i&&kill(i);', 'W=()=>{if(disposed)return;i&&kill(i);');
patch('G=()=>{i&&i.pause()}', 'G=()=>{if(!disposed)i&&i.pause()}');
patch('X=h=>{f&&', 'X=h=>{if(disposed)return;f&&');
patch('.call(()=>{S(y),v(y)}', '.call(()=>{if(!disposed){S(y),v(y)}}');
patch('U=h=>{$();', 'U=h=>{if(disposed)return;$();');
patch('n?.addEventListener("click",()=>U("next")),a?.addEventListener("click",()=>U("prev")),E(),ae(),F(t[g]),m(),I(),ScrollTrigger.create(',
  'const next=()=>U("next"),prev=()=>U("prev"),enter=()=>{if(!disposed){i?i.resume():I()}};problemsSliderOwners.set(e,cleanup);window.pageCleanupFunctions.add(cleanup);n?.addEventListener("click",next),a?.addEventListener("click",prev),E(),ae(),F(t[g]),m(),I(),trigger=ScrollTrigger.create(');
patch('onEnter:()=>{i?i.resume():I()},onEnterBack:()=>{i?i.resume():I()}', 'onEnter:enter,onEnterBack:enter');
patch('f=timeline({onComplete:()=>{f=null}})', 'f=timeline({onComplete:()=>{if(!disposed)f=null}})');

export function repairProblemsRuntime(source) {
  const originals = source.split(sliderBefore).length - 1;
  const repaired = source.split(sliderAfter).length - 1;
  const owners = source.split('var problemsSliderOwners=').length - 1;
  if (repaired === 1 && originals === 0 && owners === 1) return source;
  if (originals !== 1 || repaired !== 0 || owners !== 0) throw new Error('Problems slider runtime boundary changed');
  return source.replace(sliderBefore, sliderAfter);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node repair-problems-runtime.mjs <input> <output>');
  await writeFile(output, repairProblemsRuntime(await readFile(input, 'utf8')));
}
