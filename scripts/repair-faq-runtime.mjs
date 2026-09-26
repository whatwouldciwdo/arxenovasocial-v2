import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const accordionBefore = 'var Ee=()=>{document.querySelectorAll("[data-accordion-css-init]").forEach(e=>{let t=e.getAttribute("data-accordion-close-siblings")==="true";e.addEventListener("click",o=>{let n=o.target.closest("[data-accordion-toggle]");if(!n)return;let a=n.closest("[data-accordion-status]");if(!a)return;let r=a.getAttribute("data-accordion-status")==="active";a.setAttribute("data-accordion-status",r?"not-active":"active"),t&&!r&&e.querySelectorAll(\'[data-accordion-status="active"]\').forEach(s=>{s!==a&&s.setAttribute("data-accordion-status","not-active")})})})};';
const accordionAfter = `var faqAccordionOwners=new WeakMap();
var Ee=()=>{document.querySelectorAll("[data-accordion-css-init]").forEach(e=>{
  if(faqAccordionOwners.has(e))return;
  let t=e.getAttribute("data-accordion-close-siblings")==="true";
  const click=o=>{let n=o.target.closest("[data-accordion-toggle]");if(!n)return;let a=n.closest("[data-accordion-status]");if(!a)return;let r=a.getAttribute("data-accordion-status")==="active";a.setAttribute("data-accordion-status",r?"not-active":"active"),t&&!r&&e.querySelectorAll('[data-accordion-status="active"]').forEach(s=>{s!==a&&s.setAttribute("data-accordion-status","not-active")})};
  const cleanup=()=>{e.removeEventListener("click",click);faqAccordionOwners.delete(e);window.pageCleanupFunctions.delete(cleanup)};
  e.addEventListener("click",click);faqAccordionOwners.set(e,cleanup);window.pageCleanupFunctions.add(cleanup);
})};`;
const hoverBefore = 'function ct(){if(!window.matchMedia("(hover: hover) and (pointer: fine)").matches)return;document.querySelectorAll("[data-hover-highlight]").forEach(o=>{o.addEventListener("mouseenter",()=>{gsap.to(o,{backgroundColor:"#fafaf9",duration:c.fast,ease:"ease-transition",overwrite:!0})}),o.addEventListener("mouseleave",()=>{let a=o.dataset.hoverHighlight==="accordion"&&o.getAttribute("data-accordion-status")==="active";gsap.to(o,{backgroundColor:a?"#fafaf9":"transparent",duration:c.normal,ease:"ease-transition",overwrite:!0})})})}';
const hoverAfter = `var faqHighlightOwners=new WeakMap();
function ct(){if(!window.matchMedia("(hover: hover) and (pointer: fine)").matches)return;
document.querySelectorAll("[data-hover-highlight]").forEach(o=>{
  if(faqHighlightOwners.has(o))return;
  let tween;
  const animate=(backgroundColor,duration)=>{tween?.kill();tween=gsap.to(o,{backgroundColor,duration,ease:"ease-transition",overwrite:!0})};
  const enter=()=>animate("#fafaf9",c.fast);
  const leave=()=>{let a=o.dataset.hoverHighlight==="accordion"&&o.getAttribute("data-accordion-status")==="active";animate(a?"#fafaf9":"transparent",c.normal)};
  const cleanup=()=>{o.removeEventListener("mouseenter",enter);o.removeEventListener("mouseleave",leave);tween?.kill();tween=null;faqHighlightOwners.delete(o);window.pageCleanupFunctions.delete(cleanup)};
  o.addEventListener("mouseenter",enter);o.addEventListener("mouseleave",leave);faqHighlightOwners.set(o,cleanup);window.pageCleanupFunctions.add(cleanup);
})}`;

export function repairFaqRuntime(source) {
  for (const [before, after] of [[accordionBefore, accordionAfter], [hoverBefore, hoverAfter]]) {
    if (source.split(after).length === 2 && !source.includes(before)) continue;
    if (source.split(before).length !== 2 || source.includes(after)) throw new Error('FAQ runtime boundary changed');
    source = source.replace(before, after);
  }
  return source;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node repair-faq-runtime.mjs <input> <output>');
  await writeFile(output, repairFaqRuntime(await readFile(input, 'utf8')));
}
