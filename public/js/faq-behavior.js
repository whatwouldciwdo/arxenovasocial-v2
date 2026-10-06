(function (window) {
  "use strict";

  const accordionOwners = new WeakMap();
  const highlightOwners = new WeakMap();
  const rootSelector = '[data-accordion-css-init][data-faq-behavior="modular"]';

  function markedRoots(scope) {
    if (!scope || typeof scope.querySelectorAll !== "function") return [];
    const roots = Array.from(scope.querySelectorAll(rootSelector));
    if (scope.matches?.(rootSelector)) roots.unshift(scope);
    return roots;
  }

  function initAccordion(root) {
    if (accordionOwners.has(root)) return;
    const closeSiblings = root.getAttribute("data-accordion-close-siblings") === "true";
    let disposed = false;
    const click = event => {
      const toggle = event.target.closest("[data-accordion-toggle]");
      if (!toggle || !root.contains(toggle)) return;
      const item = toggle.closest("[data-accordion-status]");
      if (!item || !root.contains(item)) return;
      const active = item.getAttribute("data-accordion-status") === "active";
      item.setAttribute("data-accordion-status", active ? "not-active" : "active");
      if (closeSiblings && !active) {
        root.querySelectorAll('[data-accordion-status="active"]').forEach(sibling => {
          if (sibling !== item) sibling.setAttribute("data-accordion-status", "not-active");
        });
      }
    };
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      root.removeEventListener("click", click);
      accordionOwners.delete(root);
      window.pageCleanupFunctions.delete(cleanup);
    };
    root.addEventListener("click", click);
    accordionOwners.set(root, cleanup);
    window.pageCleanupFunctions.add(cleanup);
  }

  function initHighlight(target) {
    if (highlightOwners.has(target)) return;
    let tween;
    let disposed = false;
    const animate = (backgroundColor, duration) => {
      tween?.kill();
      tween = window.gsap.to(target, {
        backgroundColor,
        duration,
        ease: "ease-transition",
        overwrite: true,
      });
    };
    const enter = () => animate("#fafaf9", .3);
    const leave = () => {
      const active = target.dataset.hoverHighlight === "accordion"
        && target.getAttribute("data-accordion-status") === "active";
      animate(active ? "#fafaf9" : "transparent", .65);
    };
    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      target.removeEventListener("mouseenter", enter);
      target.removeEventListener("mouseleave", leave);
      tween?.kill();
      tween = null;
      highlightOwners.delete(target);
      window.pageCleanupFunctions.delete(cleanup);
    };
    target.addEventListener("mouseenter", enter);
    target.addEventListener("mouseleave", leave);
    highlightOwners.set(target, cleanup);
    window.pageCleanupFunctions.add(cleanup);
  }

  window.__faqBehavior = {
    init(scope) {
      const roots = markedRoots(scope);
      roots.forEach(initAccordion);
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      roots.forEach(root => {
        root.querySelectorAll('[data-hover-highlight="accordion"]').forEach(initHighlight);
      });
    },
  };
})(window);
