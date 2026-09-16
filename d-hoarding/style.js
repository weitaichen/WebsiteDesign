/*
 * D · 工地圍籬 d-hoarding：風格專屬互動
 * 手機版 hero 圍籬是可橫向捲動的 scroll-snap 容器，這裡負責滑動提示：
 * 目前第幾片、走過的進度條、上一片／下一片按鈕，以及可捲動時讓鍵盤可以聚焦。
 * 在 site.js 之後以一般 <script defer> 載入。
 */
(function () {
  'use strict';

  var fence = document.querySelector('[data-fence]');
  var hint = document.querySelector('[data-fence-hint]');
  if (!fence || !hint) return;

  var prev = hint.querySelector('[data-fence-prev]');
  var next = hint.querySelector('[data-fence-next]');
  var count = hint.querySelector('[data-fence-count]');
  var panels = Array.prototype.slice.call(fence.querySelectorAll('.panel'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ticking = false;
  if (!panels.length) return;

  function maxScroll() { return fence.scrollWidth - fence.clientWidth; }

  function update() {
    ticking = false;
    var max = maxScroll();
    var scrollable = max > 4;

    if (scrollable) {
      fence.setAttribute('tabindex', '0');
      fence.setAttribute('role', 'region');
      fence.setAttribute('aria-label', '圍籬看板，可以左右捲動');
    } else {
      fence.removeAttribute('tabindex');
      fence.removeAttribute('role');
      fence.removeAttribute('aria-label');
    }

    var width = panels[0].offsetWidth || 1;
    var index = scrollable && fence.scrollLeft >= max - 4
      ? panels.length - 1
      : Math.round(fence.scrollLeft / width);
    index = Math.max(0, Math.min(panels.length - 1, index));

    if (count) count.textContent = (index + 1) + ' / ' + panels.length;
    hint.style.setProperty('--fence-progress', scrollable ? Math.min(1, fence.scrollLeft / max).toFixed(3) : '0');
    if (prev) prev.setAttribute('aria-disabled', String(index === 0));
    if (next) next.setAttribute('aria-disabled', String(index === panels.length - 1));
  }

  function schedule() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  function step(dir, button) {
    if (button.getAttribute('aria-disabled') === 'true') return;
    touched();
    fence.scrollBy({ left: dir * panels[0].offsetWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // 只有使用者的操作才算「碰過」圍籬（停止輕推動畫、不再自動捲回）；
  // 程式或瀏覽器重新對齊造成的捲動不算
  function touched() { fence.classList.add('is-touched'); }
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (type) {
    fence.addEventListener(type, touched, { passive: true });
  });

  // site.js 載入後才把四片標語板插進圍籬，瀏覽器會重新對齊到原本唯一的白板（最後一片）；
  // 使用者碰到圍籬之前，一律捲回第一片
  function rewind() {
    if (!fence.classList.contains('is-touched') && fence.scrollLeft !== 0) fence.scrollLeft = 0;
    schedule();
  }

  fence.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (prev) prev.addEventListener('click', function () { step(-1, prev); });
  if (next) next.addEventListener('click', function () { step(1, next); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rewind);
  window.addEventListener('load', rewind);

  rewind();
  window.requestAnimationFrame(rewind);
})();
