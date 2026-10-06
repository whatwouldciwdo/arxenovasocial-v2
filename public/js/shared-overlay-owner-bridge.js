(function () {
  var root = document.documentElement;
  if (root.getAttribute('data-shared-overlays-owner') !== 'react') return;

  var querySelector = Document.prototype.querySelector;
  var querySelectorAll = Document.prototype.querySelectorAll;
  var isLegacyRuntime = function () {
    return String(new Error().stack || '').indexOf('/js/monolog-runtime.js') !== -1;
  };

  Document.prototype.querySelectorAll = function (selector) {
    if (selector === '[data-menu-btn]' && isLegacyRuntime()) {
      return querySelectorAll.call(this, ':not(*)');
    }
    return querySelectorAll.call(this, selector);
  };

  Document.prototype.querySelector = function (selector) {
    if (selector === '.about_modal_wrap' && isLegacyRuntime()) return null;
    return querySelector.call(this, selector);
  };
}());
