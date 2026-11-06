/* ═════════════════════════════════════════════════════════════
   skiper31 · "Assemble on scroll" — vanilla recreation
   - splits the headline into characters
   - one progress value (--k) drives every character and badge
     through CSS transforms
   - transform-only, no idle rAF, no per-element writes per frame
   - respects prefers-reduced-motion (renders the assembled state)
═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var sec = document.getElementById('assembly');
  var pin = document.getElementById('asm-pin');
  if (!sec || !pin) return;

  var lines = Array.prototype.slice.call(sec.querySelectorAll('[data-split]'));
  var tools = Array.prototype.slice.call(sec.querySelectorAll('.asm-tool'));
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var reduced = reduceMq.matches;
  var onScreen = false;
  var ticking = false;
  var lastK = '';

  function px(n) { return Math.round(n * 10) / 10 + 'px'; }
  function deg(n) { return Math.round(n * 10) / 10 + 'deg'; }
  function cl(x) { return Math.max(0, Math.min(1, x)); }

  /* ── split each headline line into characters ─────────────── */
  var charSpread = fine ? 46 : 42;
  var charRotate = fine ? 34 : 28;

  lines.forEach(function (el) {
    var text = (el.textContent || '').trim();
    var center = (text.length - 1) / 2;
    el.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var span = document.createElement('span');
      span.className = 'asm-char' + (ch === ' ' ? ' sp' : '');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      var d = i - center;
      span.style.setProperty('--dx', px(d * charSpread));
      span.style.setProperty('--rx', deg(d * charRotate));
      el.appendChild(span);
    }
  });

  /* ── spread the module badges around their centre ─────────── */
  var iconSpread = fine ? 66 : 58;
  var iconLift = fine ? 18 : 14;
  var iconRotate = fine ? 28 : 20;
  var iconCenter = (tools.length - 1) / 2;

  tools.forEach(function (el, i) {
    var d = i - iconCenter;
    el.style.setProperty('--dx', px(d * iconSpread));
    el.style.setProperty('--dy', px(-Math.abs(d) * iconLift));
    el.style.setProperty('--rot', deg(d * iconRotate));
  });

  function setK(value) {
    var v = value.toFixed(3);
    if (v === lastK) return;
    lastK = v;
    pin.style.setProperty('--k', v);
  }

  function paint() {
    var span = sec.offsetHeight - window.innerHeight;
    var p = span > 0 ? cl(-sec.getBoundingClientRect().top / span) : 0;
    var q = cl(p / 0.62);
    var eased = q * q * (3 - 2 * q);
    setK(1 - eased);
  }

  function request() {
    if (reduced) { setK(0); return; }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      paint();
    });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      pin.classList.toggle('is-live', onScreen && !reduced);
    }, { rootMargin: '200px 0px' }).observe(sec);
  } else {
    onScreen = true;
    pin.classList.add('is-live');
  }

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });

  function onReduced() {
    reduced = reduceMq.matches;
    pin.classList.toggle('is-live', onScreen && !reduced);
    if (reduced) setK(0);
    else request();
  }
  if (reduceMq.addEventListener) reduceMq.addEventListener('change', onReduced);
  else if (reduceMq.addListener) reduceMq.addListener(onReduced);

  if (reduced) setK(0);
  else paint();
})();
