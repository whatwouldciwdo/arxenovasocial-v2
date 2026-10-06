/* Capture native history before hydration. Only Barba uses this bridge;
Next keeps its own wrappers for routes outside the legacy container. */
window.history.scrollRestoration = "manual";
window.__legacyHistory = {
  pushState: window.history.pushState.bind(window.history),
  replaceState: window.history.replaceState.bind(window.history)
};
window.addEventListener("popstate", function (event) {
  var barba = window.barba;
  if (event.state?.from !== "barba" || !barba || !barba.history || !document.querySelector('[data-barba="container"]')) return;
  event.stopImmediatePropagation();
  barba.go(window.location.href, "popstate", event);
}, true);
