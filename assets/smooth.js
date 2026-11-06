/* ═════════════════════════════════════════════════════════════
   smooth · Lenis-style inertial wheel scrolling
   - intercepts the mouse wheel on fine pointers and EASES the
     window scroll toward it, with a short momentum tail after
     the gesture ends (Magic Mouse / trackpad inertia feel)
   - scrollbar, keyboard, touch and anchor scrolling are native
     and untouched: any external scroll simply re-syncs the target
   - self-disabling: touch-only devices, prefers-reduced-motion,
     open dialogs (.showreel-open) and scrollable sub-containers
   - no listeners beyond one passive wheel + one passive scroll
═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
  var EASE = 0.095;  // per-frame lerp toward the wheel target
  var TAIL = 0.9;    // momentum decay per frame after the gesture
  var HOLD = 70;     // ms of wheel silence before momentum kicks in
  var STEP = 0.6;    // settle threshold (px)

  var raf = 0;
  var active = false;
  var target = 0;
  var written = -1;  // last position we wrote (to recognise own scroll events)
  var vel = 0;       // smoothed gesture velocity
  var lastWheel = 0;

  function maxY() {
    return Math.max(0, document.documentElement.scrollHeight - innerHeight);
  }
  function clamp(v) {
    return v < 0 ? 0 : (v > maxY() ? maxY() : v);
  }

  function start() {
    if (active || document.hidden) return;
    active = true;
    raf = requestAnimationFrame(step);
  }
  function stop() {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function step(now) {
    raf = 0;
    var y = scrollY;

    /* momentum tail: keep advancing the target while the wheel is silent */
    if (vel && now - lastWheel > HOLD) {
      target = clamp(target + vel);
      vel *= TAIL;
      if (Math.abs(vel) < 0.6) vel = 0;
    }
    target = clamp(target);

    var d = target - y;
    var next = Math.abs(d) < STEP ? target : y + d * EASE;
    if (Math.round(next) !== Math.round(y)) {
      written = Math.round(next);
      scrollTo(0, written);
    }
    if (vel || Math.abs(target - scrollY) >= STEP) {
      raf = requestAnimationFrame(step);
    } else {
      active = false;
      target = scrollY;
    }
  }

  /* ── wheel: capture + redirect into the easing loop ──────── */
  addEventListener('wheel', function (e) {
    if (REDUCE.matches) return;    /* hand control back to the browser */
    if (e.ctrlKey) return;         /* pinch-zoom */
    if (document.documentElement.classList.contains('showreel-open')) return;

    /* let wheel events inside scrollable sub-containers behave natively */
    var n = e.target;
    while (n && n !== document.documentElement) {
      if (n.nodeType === 1) {
        var over = n.scrollHeight - n.clientHeight;
        if (over > 4) {
          var ov = (n.currentStyle || getComputedStyle(n)).overflowY;
          if (ov === 'auto' || ov === 'scroll') return;
        }
      }
      n = n.parentNode;
    }

    e.preventDefault();
    if (document.hidden) return;

    var dy = e.deltaMode === 1 ? e.deltaY * 16
      : e.deltaMode === 2 ? e.deltaY * innerHeight
      : e.deltaY;
    if (!dy) return;

    target = clamp((active ? target : scrollY) + dy);
    vel = vel ? vel * 0.4 + dy * 0.6 : dy;
    lastWheel = performance.now();
    start();
  }, { passive: false });

  /* ── external scroll (scrollbar, keyboard, anchors): sync ── */
  addEventListener('scroll', function () {
    var y = scrollY;
    if (written >= 0 && Math.abs(y - written) < 1.5) {
      written = -1; /* our own write landed — ignore */
      return;
    }
    target = clamp(y);
    vel = 0;
    written = -1;
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { target = clamp(scrollY); vel = 0; }
    else stop();
  });

  addEventListener('blur', stop);

  if (REDUCE.addEventListener) {
    REDUCE.addEventListener('change', function () {
      stop();
      vel = 0;
      target = clamp(scrollY);
    });
  }
})();
