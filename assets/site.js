/* ═════════════════════════════════════════════════════════════
   Student OS — shared interactions
   Nav, mobile menu, scroll reveal, progress, FAQ, habit demo,
   focus timer demo. Dependency-free, reduced-motion aware.
   ═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── icon sprite ──────────────────────────────────────────── */
  var sprite =
    '<svg class="sprite" aria-hidden="true" focusable="false"><defs>' +
    '<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>' +
    '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.3-2.8 7.6-7 9-4.2-1.4-7-4.7-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/></symbol>' +
    '<symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></symbol>' +
    '<symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></symbol>' +
    '<symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></symbol>' +
    '<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/></symbol>' +
    '<symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></symbol>' +
    '<symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V7a4 4 0 018 0v4"/></symbol>' +
    '<symbol id="i-eye-off" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 10.6A2 2 0 0013.4 13.4"/><path d="M9.9 5.2A10.9 10.9 0 0112 5c5 0 9 4.4 10 7-.4 1-1.2 2.2-2.3 3.3"/><path d="M6.2 6.3C4.5 7.6 3.2 9.3 2 12c1 2.6 5 7 10 7 1.5 0 2.9-.4 4.1-1"/></symbol>' +
    '<symbol id="i-spark" viewBox="0 0 24 24"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></symbol>' +
    '<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></symbol>' +
    '<symbol id="i-arrow-up" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></symbol>' +
    '<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>' +
    '<symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></symbol>' +
    '<symbol id="i-cloud-off" viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M18 18H6a4 4 0 01-.7-7.9"/><path d="M8.2 5.8A6 6 0 0118 11a3.5 3.5 0 011.5 6.6"/></symbol>' +
    '<symbol id="i-user-x" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 016-6"/><path d="M17 8l5 5M22 8l-5 5"/></symbol>' +
    '<symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></symbol>' +
    '</defs></svg>';
  if (document.body && !$('.sprite')) {
    document.body.insertAdjacentHTML('afterbegin', sprite);
  }

  /* ── active nav link ──────────────────────────────────────── */
  var page = document.body.getAttribute('data-page');
  if (page) {
    $$('[data-nav="' + page + '"], [data-mnav="' + page + '"]').forEach(function (a) {
      a.setAttribute('aria-current', 'page');
    });
  }

  /* ── mobile menu ──────────────────────────────────────────── */
  var burger = $('#navBurger');
  var menu = $('#mobileMenu');
  if (burger && menu) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      document.body.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', function () {
      setMenu(menu.hidden);
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
    var mq = window.matchMedia('(min-width: 901px)');
    var onChange = function () { if (mq.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ── progress + back to top ───────────────────────────────── */
  var bar = $('#pageProgress');
  var top = $('#backTop');
  if (bar || top) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var y = window.pageYOffset || doc.scrollTop || 0;
      if (bar) bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + '%';
      if (top) top.classList.toggle('show', y > 640);
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
    if (top) {
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    }
  }

  /* ── reveal on scroll ─────────────────────────────────────── */
  var reveals = $$('.reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || REDUCED) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ── FAQ accordion ────────────────────────────────────────── */
  var faqButtons = $$('.faq-q');
  faqButtons.forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(function (other) {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        var p = document.getElementById(other.getAttribute('aria-controls'));
        if (p) p.hidden = true;
      });
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) panel.hidden = open;
    });
  });

  /* ── habit demo ───────────────────────────────────────────── */
  var board = $('#demoBoard');
  if (board) {
    var cells = $$('button', board);
    var streakEl = $('#demoStreak');
    var countEl = $('#demoCount');
    var render = function () {
      var streak = 0;
      for (var i = cells.length - 1; i >= 0; i--) {
        if (!cells[i].classList.contains('on')) break;
        streak++;
      }
      var count = cells.filter(function (c) { return c.classList.contains('on'); }).length;
      if (streakEl) streakEl.textContent = streak + 'd streak';
      if (countEl) countEl.textContent = count + ' / ' + cells.length + ' days';
      cells.forEach(function (c) {
        c.setAttribute('aria-pressed', c.classList.contains('on') ? 'true' : 'false');
      });
    };
    cells.forEach(function (c) {
      c.addEventListener('click', function () {
        c.classList.toggle('on');
        render();
      });
    });
    render();
  }

  /* ── focus timer demo ─────────────────────────────────────── */
  var demo = $('#focusDemo');
  if (demo) {
    var ring = $('#fdRing', demo);
    var timeEl = $('#fdTime', demo);
    var statusEl = $('#fdStatus', demo);
    var startBtn = $('#fdStart', demo);
    var resetBtn = $('#fdReset', demo);
    var presets = $$('[data-mins]', demo);
    var total = 25 * 60;
    var left = total;
    var endAt = 0;
    var running = false;
    var ticker = 0;

    var fmt = function (s) {
      s = Math.max(0, Math.ceil(s));
      var h = Math.floor(s / 3600);
      var m = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      var p = function (n) { return (n < 10 ? '0' : '') + n; };
      return h > 0 ? h + ':' + p(m) + ':' + p(sec) : p(m) + ':' + p(sec);
    };
    var paint = function () {
      if (timeEl) timeEl.textContent = fmt(left);
      if (ring) ring.style.setProperty('--p', (total > 0 ? (left / total) * 100 : 0).toFixed(2));
      if (statusEl) statusEl.textContent = running ? 'In session' : (left < total ? 'Paused' : 'Ready');
      if (startBtn) startBtn.textContent = running ? 'Pause' : (left < total ? 'Resume' : 'Start');
      demo.setAttribute('aria-busy', running ? 'true' : 'false');
    };
    var stop = function () {
      running = false;
      if (ticker) { clearInterval(ticker); ticker = 0; }
      paint();
    };
    var tick = function () {
      left = Math.max(0, (endAt - Date.now()) / 1000);
      paint();
      if (left <= 0) {
        stop();
        if (statusEl) statusEl.textContent = 'Session complete';
        if (startBtn) startBtn.textContent = 'Start again';
      }
    };
    var start = function () {
      if (left <= 0) left = total;
      endAt = Date.now() + left * 1000;
      running = true;
      paint();
      if (ticker) clearInterval(ticker);
      ticker = setInterval(tick, 250);
    };
    presets.forEach(function (btn) {
      btn.addEventListener('click', function () {
        stop();
        total = (parseInt(btn.getAttribute('data-mins'), 10) || 25) * 60;
        left = total;
        presets.forEach(function (b) { b.classList.toggle('on', b === btn); });
        paint();
      });
    });
    if (startBtn) startBtn.addEventListener('click', function () {
      if (running) stop(); else start();
    });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      stop();
      left = total;
      paint();
    });
    paint();
  }

  /* ── footer year ──────────────────────────────────────────── */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
