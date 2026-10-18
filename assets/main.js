/* ═════════════════════════════════════════════════════════════
   Student OS Landing — shared behaviour
   - mounts app-screen mockups into [data-screen] phones
   - page-transition wipe between tabs
   - stable Three.js torus knot (app's FocusBrainCanvas mirror)
   - scroll-driven CSS 3D scenes + screens ring
   - reveals, counters, tilt, cursor, FAQ, timers
═════════════════════════════════════════════════════════════ */
(function () {
'use strict';
var RED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
function $(s, el) { return (el || document).querySelector(s); }
function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }

/* ────────────────────────────────────────────────────────────
   1. APP SCREEN TEMPLATES  (every screen from the app)
──────────────────────────────────────────────────────────── */
function dots5() { var o = '', i; for (i = 0; i < 5; i++) o += '<div class="ph-d' + (i === 0 ? ' on' : '') + '"></div>'; return o; }

var SCREENS = {
  dashboard:
    '<div class="slide-head"><span class="t">Good evening</span><span class="pill-xp">⚡ Lv 54</span></div>' +
    '<div class="scr scr-dash">' +
      '<div class="mini-grid">' +
        '<div class="tile"><div class="lb">Focus today</div><div class="big scr-foc">3h 20m</div></div>' +
        '<div class="tile"><div class="lb">Tasks done</div><div class="big">12</div></div>' +
        '<div class="tile"><div class="lb">Streak</div><div class="big">21d 🔥</div></div>' +
        '<div class="tile"><div class="lb">Weekly goal</div><div class="big">64%</div></div>' +
      '</div>' +
      '<div class="tile"><div class="lb" style="margin-bottom:2px">This week</div>' +
        '<div class="heat"><i style="--h:35"></i><i style="--h:55"></i><i style="--h:28"></i><i style="--h:70"></i><i style="--h:46"></i><i style="--h:88"></i><i style="--h:96"></i></div>' +
      '</div>' +
      '<div class="tile streak-row"><div class="ring-s"><i>74%</i></div><div><div class="lb">DAILY PROGRESS</div><div class="big" style="font-size:14px">Almost there</div></div></div>' +
      '<div class="tile" style="flex:1"><div class="lb" style="margin-bottom:4px">UP NEXT</div>' +
        '<div class="srow"><span class="ic">📚</span>Physics revision<span class="badge b-hi">HIGH</span><span class="meta">16:00</span></div>' +
        '<div class="srow"><span class="ic">🧪</span>Chemistry mock<span class="badge b-md">MED</span><span class="meta">18:30</span></div>' +
      '</div>' +
    '</div>',

  tasks:
    '<div class="slide-head"><span class="t">Tasks</span><span class="badge b-md">12 open</span></div>' +
    '<div class="scr scr-task">' +
      '<div class="tile" style="padding:8px"><span style="font-size:10px;color:var(--text-dimmer)">🔍 Search tasks…</span></div>' +
      '<div class="srow"><span class="ck">✓</span><span style="text-decoration:line-through;opacity:.55">Morning flashcards</span><span class="badge b-lo">15 XP</span></div>' +
      '<div class="srow"><span class="ck">✓</span><span style="text-decoration:line-through;opacity:.55">Read chapter 4</span><span class="badge b-lo">15 XP</span></div>' +
      '<div class="tile" style="flex:1"><div class="lb" style="margin-bottom:4px">PENDING</div>' +
        '<div class="srow"><span class="ic">📚</span>Physics revision<span class="badge b-hi">HIGH · 50 XP</span></div>' +
        '<div class="srow"><span class="ic">🧪</span>Chemistry mock test<span class="badge b-md">MED · 30 XP</span></div>' +
        '<div class="srow"><span class="ic">📝</span>Organise notes<span class="badge b-lo">LOW · 15 XP</span></div>' +
        '<div class="srow"><span class="ic">🔢</span>Maths problem set<span class="badge b-md">MED · 30 XP</span></div>' +
      '</div>' +
    '</div>',

  kanban:
    '<div class="slide-head"><span class="t">Board</span><span class="badge b-md">3 lists</span></div>' +
    '<div class="scr scr-kan">' +
      '<div class="cols">' +
        '<div class="col"><span class="lb">TO DO</span><div class="kcard">📝 Review notes</div><div class="kcard">📐 Geometry set</div><div class="kcard">🗂 Subject audit</div></div>' +
        '<div class="col"><span class="lb">DOING</span><div class="kcard">🧪 Chem mock test</div><div class="kcard">📚 Physics ch.7</div></div>' +
        '<div class="col"><span class="lb">DONE</span><div class="kcard">✅ Flashcards</div><div class="kcard">✅ Essay draft</div></div>' +
      '</div>' +
    '</div>',

  habits:
    '<div class="slide-head"><span class="t">Habits</span><span class="pill-xp">🔥 21d</span></div>' +
    '<div class="scr scr-hab">' +
      '<div class="hrow"><span>💧</span>Hydrate 3L<div class="hgrid"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on cur"></i></div></div>' +
      '<div class="hrow"><span>📖</span>Read 20 min<div class="hgrid"><i class="on"></i><i class="on"></i><i></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on cur"></i></div></div>' +
      '<div class="hrow"><span>🏃</span>Workout<div class="hgrid"><i class="on"></i><i></i><i class="on"></i><i class="on"></i><i></i><i class="on"></i><i class="cur"></i></div></div>' +
      '<div class="hrow"><span>🌙</span>Sleep before 12<div class="hgrid"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i class="on"></i><i class="on"></i><i class="on cur"></i></div></div>' +
      '<div class="tile" style="flex:1;display:flex;align-items:center;gap:10px"><span style="font-size:26px">🔥</span><div><div class="lb">BEST STREAK</div><div class="big">32 days</div><div class="lb" style="margin-top:2px">TODAY 4/4 · PERFECT</div></div></div>' +
    '</div>',

  month:
    '<div class="slide-head"><span class="t">October</span><span class="badge b-md">EXAMS IN 9d</span></div>' +
    '<div class="scr scr-month">' +
      '<div class="lb">MO&ensp;TU&ensp;WE&ensp;TH&ensp;FR&ensp;SA&ensp;SU</div>' +
      '<div class="cal">' +
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map(function(d){
          var cls = 'span';
          if (d === 27) cls += ' today';
          if (d === 6 || d === 13 || d === 20 || d === 21) cls += ' ev';
          return '<' + cls + '>' + d + '</' + cls + '>';
        }).join('') +
      '</div>' +
      '<div class="tile"><span class="lb">TODAY</span><div class="srow" style="padding:6px 0"><span class="ic" style="background:rgba(177,140,250,.15)">📖</span>Revision · Physics<span class="meta">4–6pm</span></div></div>' +
    '</div>',

  week:
    '<div class="slide-head"><span class="t">This week</span><span class="badge b-md">12 events</span></div>' +
    '<div class="scr scr-week">' +
      '<div class="wk">' +
        '<div class="day"><span class="lb">MON</span><div class="ev ev-study">Physics · 4pm</div><div class="ev ev-break">Gym · 7pm</div></div>' +
        '<div class="day"><span class="lb">TUE</span><div class="ev ev-rev">Revision · 2pm</div></div>' +
        '<div class="day"><span class="lb">WED</span><div class="ev ev-exam">Mock test</div><div class="ev ev-study">Maths · 6pm</div></div>' +
      '</div>' +
      '<div class="tile" style="padding:8px"><span class="lb">ZOOM FOR DAY & MONTH VIEWS</span></div>' +
    '</div>',

  analytics:
    '<div class="slide-head"><span class="t">Insights</span><span class="pill-xp">↑ 38%</span></div>' +
    '<div class="scr scr-sci">' +
      '<div class="tile" style="flex:1"><div class="lb">FOCUS THIS WEEK</div>' +
        '<div class="bars"><i style="--h:30"></i><i style="--h:52"></i><i style="--h:24"></i><i style="--h:66"></i><i style="--h:44"></i><i style="--h:82"></i><i style="--h:96"></i></div>' +
      '</div>' +
      '<div class="tile donut-wrap"><div class="donut"></div><div><div class="lb">SUBJECTS</div><div class="srow" style="border:0;padding:3px 0">🟣 Physics 38%</div><div class="srow" style="border:0;padding:3px 0">🔵 Maths 30%</div><div class="srow" style="border:0;padding:3px 0">🟢 Biology 22%</div></div></div>' +
    '</div>',

  focus:
    '<div class="slide-head"><span class="t">Focus</span><span class="pill-xp">🛡 ON</span></div>' +
    '<div class="scr scr-focus">' +
      '<div class="ring-wrap">' +
        '<svg viewBox="0 0 140 140" width="140" height="140"><circle class="track" cx="70" cy="70" r="62"/><circle class="prog" cx="70" cy="70" r="62" pathLength="1"/></svg>' +
        '<div class="tval scr-timer">25:00</div>' +
      '</div>' +
      '<div style="text-align:center" class="lb">DEEP WORK SESSION</div>' +
      '<div class="presets"><span>30m</span><span class="on">1h</span><span>90m</span><span>2h</span></div>' +
      '<div class="tile" style="display:flex;align-items:center;gap:9px"><span style="font-size:18px">🛡️</span><div><div class="big" style="font-size:12px">Deep Lock</div><div class="lb">SCORE 90 · EXCELLENT</div></div></div>' +
    '</div>',

  palette:
    '<div class="slide-head"><span class="t">⌘K</span><span class="badge b-md">PALETTE</span></div>' +
    '<div class="scr scr-pal">' +
      '<div class="search">⌘<span>Type a command…</span></div>' +
      '<div class="overlay">' +
        '<div class="grp">Navigate</div>' +
        '<div class="cmd sel">🏠 Dashboard<span class="kbd">G D</span></div>' +
        '<div class="cmd">⏱️ Focus mode<span class="kbd">G F</span></div>' +
        '<div class="cmd">✅ Tasks<span class="kbd">G T</span></div>' +
        '<div class="grp">Actions</div>' +
        '<div class="cmd">＋ Add task<span class="kbd">A</span></div>' +
        '<div class="cmd">🌙 Toggle AMOLED<span class="kbd">T</span></div>' +
      '</div>' +
    '</div>',

  settings:
    '<div class="slide-head"><span class="t">Settings</span><span class="badge b-md">LOCAL</span></div>' +
    '<div class="scr scr-set">' +
      '<div class="prof"><div class="ava">JK</div><div><div class="big" style="font-size:13px">Jainam</div><div class="lvl">LEVEL 54 · 4,300 XP</div></div></div>' +
      '<div class="row">Dark theme<div class="sw on"></div></div>' +
      '<div class="row">AMOLED black<div class="sw"></div></div>' +
      '<div class="row">Accent<div class="themes"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div></div>' +
      '<div class="row">Weekly goal<span class="big" style="font-size:11px">5h</span></div>' +
      '<div class="row">Export data<div class="sw"></div></div>' +
      '<div class="tile" style="flex:1"><div class="lb">ALL DATA STAYS ON THIS DEVICE</div></div>' +
    '</div>'
};

var NAV_ORDER = ['Focus', 'Tasks', 'Habits', 'Planner', 'Insights', 'You'];
function phoneChrome(tag) {
  return '<div class="pstatus"><span>7:35</span><div class="pdots">●●●</div></div>' + tag + '<div class="pnav">' + dots5() + '</div>';
}
function mountScreens(root) {
  $$('[data-screen]', root || document).forEach(function (ph) {
    var name = ph.getAttribute('data-screen');
    if (!SCREENS[name]) return;
    var idxMap = { dashboard: 0, tasks: 1, kanban: 1, habits: 2, month: 3, week: 3, analytics: 4, focus: 1, palette: 1, settings: 4 };
    var idx = idxMap[name] != null ? idxMap[name] : 0;
    var nd = ''; for (var i = 0; i < 5; i++) { nd += '<div class="ph-d' + (i === idx ? ' on' : '') + '"></div>'; }
    ph.classList.add('pscreen');
    ph.innerHTML = '<div class="pstatus"><span>7:35</span><div class="pdots">●●●</div></div>' +
      SCREENS[name] + '<div class="pnav">' + nd + '</div>';
  });
}

/* ────────────────────────────────────────────────────────────
   2. STABLE THREE.JS TORUS KNOT  (app FocusBrainCanvas mirror)
   Perf: lazy CDN load (only pages with a 3D host), FPS-capped
   render loop, low-end device degrades, context-loss recovery
──────────────────────────────────────────────────────────── */
var LOW = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
          (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
var sosScrollT = 0; /* last scroll timestamp — WebGL yields while scrolling */

var THREE_CDNS = [
  'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.min.js',
  'https://unpkg.com/three@0.150.1/build/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.150.1/three.min.js'
];
function ensureThree(cb) {
  if (typeof THREE !== 'undefined') { cb(); return; }
  var i = 0;
  (function next() {
    if (i >= THREE_CDNS.length) return; /* no 3D rather than a broken page */
    var s = document.createElement('script');
    s.src = THREE_CDNS[i++];
    s.async = true;
    s.onload = function () { if (typeof THREE !== 'undefined') cb(); else next(); };
    s.onerror = function () { s.remove(); next(); };
    document.head.appendChild(s);
  })();
}

function initTorusHost(host, opts) {
  if (!host || typeof THREE === 'undefined' || RED) return;
  if (host.dataset.torusReady) return;
  host.dataset.torusReady = '1';
  var opts2 = opts || {};
  try {
    var w = host.clientWidth || 400, h = host.clientHeight || 400;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(LOW ? 1 : Math.min(window.devicePixelRatio || 1, 1.35));
    host.appendChild(renderer.domElement);
    var geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 96, 18);
    var material = new THREE.MeshPhongMaterial({
      color: 0x7c4dff, shininess: 90, specular: 0xffffff,
      transparent: true, opacity: opts2.opacity != null ? opts2.opacity : 0.8, wireframe: true
    });
    var mesh = new THREE.Mesh(geometry, material);
    var grp = new THREE.Group();
    grp.add(mesh);
    scene.add(grp);

    /* twinkling particle field around the knot (skipped on low-end devices) */
    if (opts2.particles && !LOW) {
      var N = opts2.particles === true ? 240 : opts2.particles;
      var pos = new Float32Array(N * 3);
      for (var pi = 0; pi < N; pi++) {
        var th = Math.random() * Math.PI * 2, ph2 = Math.acos(2 * Math.random() - 1);
        var rr = 3.2 + Math.random() * 3.4;
        pos[pi * 3] = rr * Math.sin(ph2) * Math.cos(th);
        pos[pi * 3 + 1] = rr * Math.sin(ph2) * Math.sin(th) * 0.8;
        pos[pi * 3 + 2] = rr * Math.cos(ph2);
      }
      var pgeo = new THREE.BufferGeometry();
      pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var pmat = new THREE.PointsMaterial({ color: 0xc4b5fd, size: 0.07, transparent: true, opacity: 0.65, sizeAttenuation: true });
      var pts = new THREE.Points(pgeo, pmat);
      grp.add(pts);
      pts.userData.spin = 0.0016 * (opts2.speed / 0.005);
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var pl = new THREE.PointLight(0x7c4dff, 2);
    pl.position.set(5, 5, 5); scene.add(pl);
    camera.position.z = opts2.zoom || 5;

    /* drag + pointer parallax (opt-in via "interact") */
    var boosted = 0, drag = { on: false, x: 0, y: 0, vy: 0, vx: 0 }, hover = { tx: 0, ty: 0, x: 0, y: 0 };
    if (opts2.interact && host.id === 'knotHost') {
      host.addEventListener('pointerdown', function (e) { drag.on = true; drag.x = e.clientX; drag.y = e.clientY; });
      window.addEventListener('pointerup', function () { drag.on = false; });
      window.addEventListener('pointermove', function (e) {
        if (drag.on) {
          drag.vy = (e.clientX - drag.x) * 0.005; drag.vx = (e.clientY - drag.y) * 0.003;
          drag.x = e.clientX; drag.y = e.clientY;
        }
      }, { passive: true });
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        hover.tx = ((e.clientX - r.left) / r.width - .5) * 0.35;
        hover.ty = ((e.clientY - r.top) / r.height - .5) * 0.25;
      }, { passive: true });
      /* pulse on session-preset change (dispatched by the timer) */
      document.addEventListener('sos-knot-pulse', function () {
        boosted = 1;
        host.classList.add('knot-boost');
        setTimeout(function () { boosted = 0; host.classList.remove('knot-boost'); }, 1600);
      });
    }

    var raf = 0, pageVisible = document.visibilityState === 'visible', inView = true;
    var speed = opts2.speed || 0.005;
    var MIN_DT = 1000 / (LOW ? 24 : 38); /* cap render fps — saves battery & GPU */
    var lastT = 0, dead = false;
    renderer.domElement.addEventListener('webglcontextlost', function (ev) {
      ev.preventDefault(); dead = true; cancelAnimationFrame(raf);
    });
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (dead || !pageVisible || !inView) return;
      if (t - lastT < MIN_DT) return;
      if (performance.now() - sosScrollT < 220) { lastT = t; return; } /* yield to scrolling */
      lastT = t;
      var env = 1 + boosted * 1.6;
      mesh.rotation.x += speed * env;
      mesh.rotation.y += speed * env;
      hover.x += (hover.tx - hover.x) * 0.05;
      hover.y += (hover.ty - hover.y) * 0.05;
      grp.rotation.y += (drag.vy + hover.x * 0.06) * (drag.on ? 1 : 0.4);
      grp.rotation.x += (drag.vx + hover.y * 0.06) * (drag.on ? 1 : 0.4);
      drag.vy *= 0.94; drag.vx *= 0.94; /* inertia */
      boosted *= 0.965; if (boosted < 0.02) boosted = 0; /* eased decay, no flicker */
      grp.children.forEach(function (c) { if (c.userData && c.userData.spin) c.rotation.y += c.userData.spin; });
      var s = (opts2.breath === false ? 1 : 1 + Math.sin(t * 0.001) * 0.1 + boosted * Math.sin(t * 0.004) * 0.03) * (opts2.scale || 1);
      mesh.scale.set(s, s, s);
      renderer.render(scene, camera);
    }
    frame(0);
    var onVis = function () { pageVisible = document.visibilityState === 'visible'; };
    document.addEventListener('visibilitychange', onVis);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0 }).observe(host);
    }
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        var W = host.clientWidth || 400, H = host.clientHeight || 400;
        if (!W || !H) return;
        camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
      }, 150);
    });
    window.addEventListener('pagehide', function () {
      cancelAnimationFrame(raf);
      try { renderer.dispose(); geometry.dispose(); material.dispose(); } catch (e) {}
    });
  } catch (e) { /* decorative — fail silently */ }
}

/* ────────────────────────────────────────────────────────────
   3. PAGE TRANSITIONS
──────────────────────────────────────────────────────────── */
function initWipe() {
  var wipe = $('#wipe');
  if (!wipe) return;
  if (RED) { wipe.style.display = 'none'; return; }

  /* bfcache safety: when the page is restored (Back/forward), the cover
     class can be stuck in the DOM from the previous leave — clear it. */
  window.addEventListener('pageshow', function (ev) {
    wipe.classList.remove('cover', 'wipe-shift');
    wipe.style.pointerEvents = 'none';
    if (ev.persisted) {
      // restored from cache: re-run light bootstraps for stale state
      document.body.style.overflow = '';
      var menu = $('#mobileMenu');
      if (menu) { menu.classList.remove('open'); var b = $('#navBurger'); if (b) b.classList.remove('open'); }
    }
  });

  /* on page load: flash the cover once, then fade out */
  wipe.classList.add('cover', 'no-anim');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      wipe.classList.remove('no-anim');
      wipe.classList.remove('cover');
      setTimeout(function () { wipe.style.pointerEvents = 'none'; }, 450);
    });
  });

  /* intercept internal navigations: cover, then go */
  $$('a[href]').forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (!href || href.charAt(0) === '#') return;
    if (/^(https?:|mailto:)/.test(href)) return;
    a.addEventListener('click', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || a.target === '_blank') return;
      var target = href.split('/').pop();
      if (target === window.location.pathname.split('/').pop()) return;
      ev.preventDefault();
      wipe.classList.add('cover', 'wipe-shift');
      setTimeout(function () { window.location.href = href; }, 280);
    });
  });
}

/* ────────────────────────────────────────────────────────────
   4. SCROLL ENGINE — nav, progress, reveals, counters,
      3D scenes, ring, scenes map (one central loop)
──────────────────────────────────────────────────────────── */
/* ────────────────────────────────────────────────────────────
   4. SCROLL ENGINE — progress bar + ring (CSS scroll-timeline
   when supported → compositor-only, zero main-thread work).
   Scene tilt removed: JS style writes during scroll caused
   visible jitter/vibration on slower machines.
──────────────────────────────────────────────────────────── */
var USE_CSS_RING = (function () {
  try { return !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')); } catch (e) { return false; }
})();
var ringEl = null, ringRange = 1, ringPrev = -9e9;
function updateScenes() {
  if (!ringEl || USE_CSS_RING) return;
  var vh = window.innerHeight;
  var sec = ringEl.closest('.gallery-3d');
  if (sec) {
    var r2 = sec.getBoundingClientRect();
    var total = r2.height - vh;
    ringRange = total > 0 ? Math.max(0, Math.min(1, -r2.top / total)) : 0;
  }
}
function renderScenes() {
  if (!ringEl || USE_CSS_RING || RED) return;
  var rr = -18 - ringRange * 220;
  if (Math.abs(rr - ringPrev) > 0.06) { ringPrev = rr; ringEl.style.transform = 'rotateY(' + rr + 'deg)'; }
}
var ticking = false;
function onScrollAll() {
  if (!ticking) {
    ticking = true;
    sosScrollT = performance.now();
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      var topnav = $('#topnav');
      if (topnav) topnav.classList.toggle('scrolled', y > 40);
      var prog = $('#progress');
      if (prog) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }
      var bt = $('#backTop');
      if (bt) bt.classList.toggle('show', y > 700);
      if (!RED) { updateScenes(y); renderScenes(); }
      ticking = false;
    });
  }
}

function initReveals() {
  var els = $$('.reveal,.reveal-left,.reveal-right,.reveal-zoom');
  if (RED || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in-view'); }); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          var ph = e.target.querySelector ? e.target.querySelector('.phone') : null;
          if (ph) setTimeout(function () { ph.classList.add('revealed'); }, 220);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -50px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
  $$('[data-count]').forEach(function (el) {
    if (!('IntersectionObserver' in window)) { runCount(el); return; }
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { runCount(el); o.disconnect(); }
    }, { threshold: 0.5 }).observe(el);
  });
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (RED) { el.textContent = target + suffix; return; }
    var start = performance.now(), dur = 1300;
    (function step(now) {
      var t = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * e) + suffix;
      if (t < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
    })(start);
  }
}

/* ────────────────────────────────────────────────────────────
   5. CURSOR · TILT · SPOTLIGHT · MAGNETIC
──────────────────────────────────────────────────────────── */
function initCursor() {
  if (RED || !FINE || LOW) return;
  var glow = $('#cursorGlow'), ring = $('#cursorRing');
  if (!glow || !ring) return;
  var st = { tx: -999, ty: -999, cx: -999, cy: -999, rx: -999, ry: -999 };
  window.addEventListener('mousemove', function (e) { st.tx = e.clientX; st.ty = e.clientY; }, { passive: true });
  (function loop() {
    st.cx += (st.tx - st.cx) * 0.09; st.cy += (st.ty - st.cy) * 0.09;
    st.rx += (st.tx - st.rx) * 0.22; st.ry += (st.ty - st.ry) * 0.22;
    glow.style.transform = 'translate(' + st.cx + 'px,' + st.cy + 'px) translate(-50%,-50%)';
    ring.style.transform = 'translate(' + st.rx + 'px,' + st.ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
  $$('a,button,.fcard,.tab').forEach(function (el) {
    el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
  });
}
function initTilt() {
  if (RED || !FINE) return;
  var tiltEl = $('#heroTilt') || $('#mockTilt');
  var ts = { tx: 0, ty: 0, cx: 0, cy: 0 };
  window.addEventListener('mousemove', function (e) {
    var nx = (e.clientX / window.innerWidth - .5), ny = (e.clientY / window.innerHeight - .5);
    if (tiltEl) { ts.tx = ny * -9; ts.ty = nx * 12; }
    $$('.fcard').forEach(function (card) {
      var r = card.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }
    });
  }, { passive: true });
  if (tiltEl) {
    (function loop() {
      ts.cx += (ts.tx - ts.cx) * 0.07;
      ts.cy += (ts.ty - ts.cy) * 0.07;
      tiltEl.style.transform = 'rotateX(' + ts.cx + 'deg) rotateY(' + ts.cy + 'deg)';
      requestAnimationFrame(loop);
    })();
  }
}

/* ────────────────────────────────────────────────────────────
   6. SCREEN SWITCHER TABS + RING TABS
──────────────────────────────────────────────────────────── */
function initTabs() {
  $$('.screen-tabs').forEach(function (group) {
    var holderSel = group.getAttribute('data-target');
    var holder = holderSel ? $(holderSel) : null;
    var tabs = $$('button.tab', group);
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var name = b.getAttribute('data-value');
        if (holder && name) { holder.setAttribute('data-screen', name); mountScreens(holder.parentNode); }
        var label = $('.ring-label');
        if (label && b.getAttribute('data-label')) label.textContent = b.getAttribute('data-label');
      });
    });
  });
}

/* ────────────────────────────────────────────────────────────
   7. FAQ · DEMO BOARD · MINI TIMERS · BURGER · BACK-TOP
──────────────────────────────────────────────────────────── */
function initFaq() {
  $$('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      $$('.faq-item').forEach(function (o) { o.classList.remove('open'); var x = o.querySelector('.faq-a'); if (x) x.style.maxHeight = null; });
      if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });
}
function initDemo() {
  var board = $('#demoBoard');
  if (board) {
    var streak = $('#demoStreak');
    var btns = $$('button', board);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        b.classList.toggle('on');
        if (streak) {
          var n = btns.filter(function (x) { return x.classList.contains('on'); }).length;
          streak.textContent = n + 'd streak';
          streak.style.transform = 'scale(1.2)';
          setTimeout(function () { streak.style.transform = 'scale(1)'; }, 180);
        }
      });
    });
  }
  $$('.preset').forEach(function (p) {
    p.addEventListener('click', function () {
      $$('.preset').forEach(function (x) { x.classList.remove('on'); });
      p.classList.add('on');
      var mins = parseInt(p.getAttribute('data-mins') || '25', 10);
      totalSec = curSec = mins * 60; // the ticking loop reads this single source of truth
      updateTimerLabel();
      try { document.dispatchEvent(new CustomEvent('sos-knot-pulse')); } catch (e) {}
    });
  });
  /* ONE timer state shared by presets + ticking — no competing intervals */
  var bigTimer = $('#focusTimerBig');
  var miniTimer = $('#miniTimer');
  var sessionProg = $('#sessionProg');
  var curSec = 25 * 60, totalSec = 25 * 60;
  function updateTimerLabel() {
    var m = Math.floor(curSec / 60), s = curSec % 60;
    var label = (m >= 60
      ? String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
      : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
    if (bigTimer) bigTimer.textContent = label;
    if (miniTimer) miniTimer.textContent = label;
    if (sessionProg && totalSec > 0) {
      /* fill the knot's ring as the session elapses */
      sessionProg.style.strokeDashoffset = String(Math.max(0, 1 - (totalSec - curSec) / totalSec));
    }
  }
  if ((bigTimer || miniTimer) && !RED) {
    updateTimerLabel();
    setInterval(function () {
      curSec--; if (curSec < 0) { curSec = totalSec; if (sessionProg) sessionProg.style.strokeDashoffset = '1'; }
      updateTimerLabel();
    }, 1000);
  }
}
function initMenu() {
  var burger = $('#navBurger'), menu = $('#mobileMenu');
  if (!burger || !menu) return;
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow = ''; });
  });
  var bt = $('#backTop');
  if (bt) bt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: RED ? 'auto' : 'smooth' }); });
}
function markActive() {
  var page = document.body.getAttribute('data-page');
  if (!page) return;
  $$('.topnav a, .mobile-menu a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('/').pop().split('#')[0];
    if (!href) href = 'index.html';
    if (href === page) a.classList.add('active');
  });
}

/* ────────────────────────────────────────────────────────────
   8. SPLIT-LINE HEADING REVEALS — words rise line by line
──────────────────────────────────────────────────────────── */
function initHeadSplit() {
  if (RED || !('IntersectionObserver' in window)) return;
  $$('h2').forEach(function (h2) {
    if (h2.classList.contains('hl-done') || h2.closest('.vignette')) return;
    var words = []; var d = 0;
    Array.prototype.slice.call(h2.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (tk) {
          if (!tk) return;
          if (/^\s+$/.test(tk)) { words.push(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'hl-w';
          var inner = document.createElement('span');
          inner.style.setProperty('--wd', (d += 55) + 'ms');
          inner.textContent = tk;
          w.appendChild(inner);
          words.push(w);
        });
      } else {
        words.push(node); /* <br>, .grad spans etc. kept as-is */
      }
    });
    h2.classList.add('hl-wrap', 'hl-done');
    h2.textContent = '';
    words.forEach(function (w) { h2.appendChild(w); });
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { h2.classList.add('in-view'); o.disconnect(); }
    }, { threshold: 0.4 }).observe(h2);
  });
  /* hairline separators that draw themselves in */
  $$('.sect-wave').forEach(function (wv) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { wv.classList.add('in-view'); o.disconnect(); }
    }, { threshold: 0.6 }).observe(wv);
  });
  // nested .grad spans: their text is inside a single child — wrap those too
  $$('.hl-wrap .grad').forEach(function (g) {
    if (g.classList.contains('hl-done-g')) return;
    g.classList.add('hl-done-g');
    var frag = document.createDocumentFragment();
    var d = 0, total = 0;
    g.textContent.split(/(\s+)/).forEach(function (tk) {
      if (!tk) return;
      if (/^\s+$/.test(tk)) { frag.appendChild(document.createTextNode(' ')); return; }
      total++;
    });
    var i = 0;
    g.textContent.split(/(\s+)/).forEach(function (tk) {
      if (!tk) return;
      if (/^\s+$/.test(tk)) { frag.appendChild(document.createTextNode(' ')); return; }
      i++;
      var w = document.createElement('span'); w.className = 'hl-w';
      var inner = document.createElement('span');
      inner.style.setProperty('--wd', (200 + (i / total) * 200) + 'ms');
      inner.textContent = tk;
      w.appendChild(inner);
      frag.appendChild(w ? w : document.createTextNode(tk));
    });
    g.textContent = '';
    g.appendChild(frag);
  });
}

/* ────────────────────────────────────────────────────────────
   9. VIDEO WALKTHROUGH — click-to-player + modal demo reel
──────────────────────────────────────────────────────────── */
var VD_STEPS = [
  { s: 'dashboard', t: 'Everything at a glance — focus, tasks, streaks, week bar' },
  { s: 'focus',     t: 'Deep Work timer — timestamp-based, zero drift' },
  { s: 'palette',   t: '⌘K command palette — jump anywhere in a keystroke' },
  { s: 'tasks',     t: 'Tasks with priorities, subjects and XP rewards' },
  { s: 'kanban',    t: 'Kanban board for bigger projects' },
  { s: 'habits',    t: 'Habit grid — daily streaks made visible' },
  { s: 'month',     t: 'Study planner with exam countdowns' },
  { s: 'analytics', t: 'Analytics — where your hours actually went' },
  { s: 'settings',  t: 'Export anytime — all data stays on this device' }
];
function initVideo() {
  if (window.__vdReady) return; window.__vdReady = '1';
  var iframeFmt = document.querySelector('.video-frame');
  if (iframeFmt) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { iframeFmt.classList.add('in-view'); o.disconnect(); }
    }, { threshold: 0.25 }).observe(iframeFmt);
    iframeFmt.addEventListener('click', openVideoModal);
    iframeFmt.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideoModal(); }
    });
  }

  function openVideoModal() {
    if ($('.vd-modal')) { $('.vd-modal').classList.add('open'); return; }

    var modal = document.createElement('div');
    modal.className = 'vd-modal';
    modal.innerHTML =
      '<div class="vd-modal-inner" role="dialog" aria-modal="true" aria-label="App walkthrough">' +
        '<button class="vd-modal-close" aria-label="Close">✕</button>' +
        '<div class="vd-modal-stage">' +
          '<div class="vd-title">Student OS — guided tour<span class="vd-sub">9 screens · every module</span></div>' +
          '<div class="vd-phone"><div class="phone"><div class="pscreen" id="vdScreen"></div></div></div>' +
        '</div>' +
        '<div class="vd-caption" id="vdCaption"></div>' +
        '<div class="vd-controls">' +
          '<button class="vd-ctl-btn" id="vdToggle" aria-label="Play / pause"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.5 6.2 5 3.8-5 3.8V8.2Z"/></svg></button>' +
          '<div class="vd-bar" id="vdBar"></div>' +
          '<span class="vd-step" id="vdStep">01 / 09</span>' +
        '</div>' +
      '</div>';
    // caption sits below the stage inside the inner card
    var stage = $('.vd-modal-stage', modal);
    stage.parentNode.insertBefore($('.vd-caption', modal), $('.vd-controls', modal));
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { modal.classList.add('open'); });

    mountScreens(modal);
    var screen = $('#vdScreen', modal), cap = $('#vdCaption', modal),
        bar = $('#vdBar', modal), step = $('#vdStep', modal), toggle = $('#vdToggle', modal);
    var i = 0, playing = true, timer = 0;

    VD_STEPS.forEach(function () { var b = document.createElement('i'); bar.appendChild(b); });
    function segs() { return $$('i', bar); }
    function show(n) {
      i = (n + VD_STEPS.length) % VD_STEPS.length;
      screen.classList.add('vd-swap');
      setTimeout(function () {
        screen.setAttribute('data-screen', VD_STEPS[i].s);
        mountScreens(screen.parentNode);
        screen.classList.remove('vd-swap');
      }, 240);
      cap.style.opacity = 0;
      setTimeout(function () { cap.textContent = VD_STEPS[i].t; cap.style.opacity = 1; }, 200);
      segs().forEach(function (s, si) {
        s.classList.remove('grow');
        if (si < i) s.classList.add('fill');
        else if (si > i) s.classList.remove('fill');
      });
      segs()[i].classList.add('grow');
      step.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(VD_STEPS.length).padStart(2, '0');
      if (segs()[i].firstChild) segs()[i].removeChild(segs()[i].firstChild);
      var fill = document.createElement('em');
      fill.style.cssText = 'position:absolute;inset:0;background:linear-gradient(90deg,#8a63f5,#c4b5fd);transform-origin:left;border-radius:99px;';
      segs()[i].appendChild(fill);
      var t0 = performance.now();
      cancelAnimationFrame(fill._raf);
      (function anim(now) {
        if (!playing) { fill._paused = true; return; }
        var p = Math.min(1, (now - t0) / 2600) + (fill._pf || 0);
        fill.style.transform = 'scaleX(' + Math.min(1, p) + ')';
        if (p >= 1) { fill._pf = 1; show(i + 1); }
        else fill._raf = requestAnimationFrame(anim);
      })(t0);
    }
    toggle.addEventListener('click', function () {
      playing = !playing;
      toggle.style.color = playing ? '#dcd2ff' : 'var(--text-dimmer)';
      if (playing) { show(i + 1); } /* resume on next step */
    });
    function close() {
      playing = false;
      modal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function () { modal.remove(); }, 420);
    }
    $('.vd-modal-close', modal).addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', esc);
      }
    });
    show(0);
    timer = VD_STEPS.length; /* placeholder to keep linters calm */
  }
}

/* ─── BOOT ─────────────────────────────────────────────── */
function boot() {
  if (LOW) document.body.classList.add('low-end');
  try { mountScreens(); } catch (e) {}
  try { markActive(); } catch (e) {}
  try { initWipe(); } catch (e) {}
  try { initMenu(); } catch (e) {}
  try { initReveals(); } catch (e) {}
  try { initCursor(); } catch (e) {}
  try { initTilt(); } catch (e) {}
  try { initFaq(); } catch (e) {}
  try { initDemo(); } catch (e) {}
  try { initTabs(); } catch (e) {}
  try { initHeadSplit(); } catch (e) {}
  try { initVideo(); } catch (e) {}
  try {
    ringEl = $('.ring');
    updateScenes();
    renderScenes();
  } catch (e) {}
  try {
    var torusHosts = $$('[data-torus]');
    if (torusHosts.length && !RED) {
      ensureThree(function () {
        torusHosts.forEach(function (host) {
          var o = {};
          try { o = JSON.parse(host.getAttribute('data-torus') || '{}'); } catch (e2) {}
          initTorusHost(host, o);
        });
      });
    }
  } catch (e) {}
  window.addEventListener('scroll', onScrollAll, { passive: true });
  onScrollAll();
  /* auto-degrade: measure real fps shortly after load — if the device
     struggles, drop scroll-linked 3D + heavy effects permanently */
  if (!RED) {
    setTimeout(function () {
      var n = 0, t0 = performance.now();
      (function tick() {
        n++;
        if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
        else if (n < 32) {
          document.body.classList.add('low-end');
          LOW = true;
          if (ringEl) { ringEl.style.transform = ''; }
        }
      })();
    }, 2200);
  }
  setTimeout(function () { document.body.classList.add('loaded'); }, 120);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
