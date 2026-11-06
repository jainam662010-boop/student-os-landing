/* ═════════════════════════════════════════════════════════════
   sticky-cards · "StickyCard002" — vanilla recreation
   - pinned viewport, one card visible at a time
   - as the next card slides up from below, the outgoing card
     scrubs to scale(.7) rotate(5deg) — same motion as the
     GSAP original, driven by scroll position only
   - one paint per scroll event, paused off-screen, no idle rAF
   - mobile / prefers-reduced-motion: plain stacked cards, no JS
═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var sec = document.getElementById('storyScroll');
  if (!sec) return;

  var cards = Array.prototype.slice.call(sec.querySelectorAll('.story-card'));
  var n = cards.length;
  if (!n) return;

  var FROM = 135; // % below the stage where the next card waits (fully off-screen)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var raf = 0;
  var onScreen = false;
  var topAbs = 0; // absolute document Y of the section top (cached, re-measured on resize)
  var span = 1;

  function measure() {
    topAbs = sec.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
    span = Math.max(1, sec.offsetHeight - innerHeight);
  }

  function staticMode() {
    return reduce.matches || innerWidth <= 820;
  }

  function cl(v) {
    return Math.max(0, Math.min(1, v));
  }

  function clear() {
    cards.forEach(function (c) {
      c.__t = null;
      c.__z = null;
      c.style.transform = '';
      c.style.zIndex = '';
    });
  }

  function paint() {
    if (staticMode()) {
      clear();
      return;
    }
    var p = span > 0 ? cl(((window.scrollY || window.pageYOffset || 0) - topAbs) / span) : 0;
    var f = p * (n - 1); // scroll position in "card steps"

    for (var i = 0; i < n; i++) {
      var tOut = cl(f - i); // how far card i has been covered by card i+1
      var tIn = cl(f - (i - 1)); // how far card i has slid in
      var y = i === 0 ? 0 : (1 - tIn) * FROM;
      var sc = 1 - 0.3 * tOut;
      var rot = 5 * tOut;
      var tf =
        'translate3d(0,' + y.toFixed(2) + '%,0) scale(' + sc.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)';
      if (cards[i].__t !== tf) {
        cards[i].__t = tf;
        cards[i].style.transform = tf;
      }
      var z = String(i + 1);
      if (cards[i].__z !== z) {
        cards[i].__z = z;
        cards[i].style.zIndex = z;
      }
    }
  }

  function requestPaint() {
    if (raf || !onScreen || document.hidden) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      paint();
    });
  }

  addEventListener('scroll', requestPaint, { passive: true });
  addEventListener('resize', function () {
    measure();
    requestPaint();
  }, { passive: true });
  if (reduce.addEventListener) reduce.addEventListener('change', requestPaint);
  else if (reduce.addListener) reduce.addListener(requestPaint);
  document.addEventListener('visibilitychange', requestPaint);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      function (es) {
        onScreen = es[0].isIntersecting;
        if (onScreen) requestPaint();
      },
      { threshold: 0 }
    ).observe(sec);
  } else {
    onScreen = true;
  }

  measure();
  paint();
})();
