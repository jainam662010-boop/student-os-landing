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
──────────────────────────────────────────────────────────── */
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    host.appendChild(renderer.domElement);
    var geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 96, 18);
    var material = new THREE.MeshPhongMaterial({
      color: 0x7c4dff, shininess: 90, specular: 0xffffff,
      transparent: true, opacity: opts2.opacity != null ? opts2.opacity : 0.8, wireframe: true
    });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var pl = new THREE.PointLight(0x7c4dff, 2);
    pl.position.set(5, 5, 5); scene.add(pl);
    camera.position.z = opts2.zoom || 5;

    var raf = 0, pageVisible = document.visibilityState === 'visible', inView = true;
    var speed = opts2.speed || 0.005;
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!pageVisible || !inView) return;
      mesh.rotation.x += speed;
      mesh.rotation.y += speed;
      var s = (opts2.breath === false ? 1 : 1 + Math.sin(t * 0.001) * 0.1) * (opts2.scale || 1);
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
      setTimeout(function () { window.location.href = href; }, 420);
    });
  });
}

/* ────────────────────────────────────────────────────────────
   4. SCROLL ENGINE — nav, progress, reveals, counters,
      3D scenes, ring, scenes map (one central loop)
──────────────────────────────────────────────────────────── */
var sceneEls = [], ringEl = null, ringRange = 1;
function measureScenes() {
  sceneEls = $$('.scene3d').map(function (el) { return { el: el, t: 0, c: 0, prev: -9 }; });
}
function updateScenes(scrollY) {
  var vh = window.innerHeight;
  sceneEls.forEach(function (s) {
    var r = s.el.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) return;
    var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
    s.t = Math.max(-1, Math.min(1, p));
  });
  var ring = ringEl;
  if (ring) {
    var sec = ring.closest('.gallery-3d');
    if (sec) {
      var r2 = sec.getBoundingClientRect();
      var total = r2.height - vh;
      var p2 = total > 0 ? Math.max(0, Math.min(1, -r2.top / total)) : 0;
      ringRange = p2;
    }
  }
}
function renderScenes() {
  sceneEls.forEach(function (s) {
    s.c += (s.t - s.c) * 0.12;
    var p = s.c;
    /* write style only when the interpolated value still moves — no churn when idle */
    if (Math.abs(p - s.prev) > 0.0008) {
      s.prev = p;
      s.el.style.transform = 'perspective(1200px) rotateY(' + (p * -30) + 'deg) rotateX(' + (p * 9) + 'deg) translateZ(' + (-Math.abs(p) * 220) + 'px) scale(' + (1 - Math.abs(p) * 0.22) + ')';
      s.el.style.opacity = Math.max(0, 1 - Math.abs(p) * 0.95);
    }
  });
  if (ringEl && !RED) {
    ringEl.style.transform = 'rotateY(' + (-18 - ringRange * 300) + 'deg)';
  }
}
var ticking = false;
function onScrollAll() {
  if (!ticking) {
    ticking = true;
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
  if (RED || !FINE) return;
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
      curSec = mins * 60; // the ticking loop reads this single source of truth
      updateTimerLabel();
    });
  });
  /* ONE timer state shared by presets + ticking — no competing intervals */
  var bigTimer = $('#focusTimerBig');
  var miniTimer = $('#miniTimer');
  var curSec = 25 * 60;
  function updateTimerLabel() {
    var m = Math.floor(curSec / 60), s = curSec % 60;
    var label = (m >= 60
      ? String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
      : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
    if (bigTimer) bigTimer.textContent = label;
    if (miniTimer) miniTimer.textContent = label;
  }
  if ((bigTimer || miniTimer) && !RED) {
    updateTimerLabel();
    setInterval(function () {
      curSec--; if (curSec < 0) curSec = 25 * 60;
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

/* ─── BOOT ─────────────────────────────────────────────── */
function boot() {
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
  try {
    ringEl = $('.ring');
    measureScenes();
    updateScenes(0);
    renderScenes();
  } catch (e) {}
  try {
    $$('[data-torus]').forEach(function (host) {
      var o = {};
      try { o = JSON.parse(host.getAttribute('data-torus') || '{}'); } catch (e2) {}
      initTorusHost(host, o);
    });
  } catch (e) {}
  window.addEventListener('scroll', onScrollAll, { passive: true });
  window.addEventListener('resize', function () { measureScenes(); }, { passive: true });
  onScrollAll();
  setTimeout(function () { document.body.classList.add('loaded'); }, 120);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
