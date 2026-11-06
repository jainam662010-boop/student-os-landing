/* ═════════════════════════════════════════════════════════════
   showreel — screenshot-driven product tour
   Vanilla port of the Skiper67 click-to-play popover:
   - hovering the preview shows a cursor-following "Play" label
   - clicking expands into a full-size player via clip-path
   - the "video" is the five shipped app screens, crossfaded
     with a blurred backdrop, caption and scrub bar
   No dependencies. Respects prefers-reduced-motion.
   Markup contract (see index.html):
     [data-showreel] .showreel-trigger > .showreel-shots > img.showreel-shot
     each shot carries data-kicker / data-title / data-note
   ═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var SCENE_MS = 4600; /* per screenshot */
  var EASE = 'cubic-bezier(.16,1,.3,1)';

  var roots = document.querySelectorAll('[data-showreel]');
  if (!roots.length) return;
  /* <dialog> support guard (Safari < 15.4): leave the preview as a static card */
  if (typeof document.createElement('dialog').showModal !== 'function') return;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(ms) {
    var s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ':' + pad(s % 60);
  }

  /* ── inline icons ─────────────────────────────────────────── */
  var ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5h3.2v14H7.5zM13.3 5h3.2v14h-3.2z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ── popover markup (built once per page) ─────────────────── */
  function buildPopover() {
    var pop = document.createElement('dialog');
    pop.className = 'showreel-pop';
    pop.setAttribute('aria-label', 'Student OS showreel');
    pop.innerHTML =
      '<div class="showreel-veil" data-close></div>' +
      '<div class="showreel-card">' +
      ' <div class="showreel-slides"></div>' +
      ' <div class="showreel-top">' +
      '  <span class="showreel-count" aria-hidden="true">01 / 05</span>' +
      '  <button class="showreel-close" type="button" aria-label="Close showreel">' + ICONS.close + '</button>' +
      ' </div>' +
      ' <div class="showreel-meta">' +
      '  <p class="showreel-kicker">Inside Student OS</p>' +
      '  <p class="showreel-title" aria-live="polite"></p>' +
      '  <p class="showreel-note"></p>' +
      ' </div>' +
      ' <div class="showreel-controls">' +
      '  <button class="showreel-btn" type="button" data-playing="false" aria-label="Play showreel">' +
      '   <span data-ico="play">' + ICONS.play + '</span>' +
      '   <span data-ico="pause">' + ICONS.pause + '</span>' +
      '  </button>' +
      '  <input class="showreel-range" type="range" min="0" max="1000" step="1" value="0" aria-label="Showreel progress">' +
      '  <span class="showreel-time" aria-hidden="true">0:00 / 0:00</span>' +
      ' </div>' +
      '</div>';
    document.body.appendChild(pop);
    return {
      pop: pop,
      veil: pop.querySelector('.showreel-veil'),
      card: pop.querySelector('.showreel-card'),
      slides: pop.querySelector('.showreel-slides'),
      count: pop.querySelector('.showreel-count'),
      close: pop.querySelector('.showreel-close'),
      kicker: pop.querySelector('.showreel-kicker'),
      title: pop.querySelector('.showreel-title'),
      note: pop.querySelector('.showreel-note'),
      btn: pop.querySelector('.showreel-btn'),
      range: pop.querySelector('.showreel-range'),
      time: pop.querySelector('.showreel-time')
    };
  }

  function initInstance(root) {
    var trigger = root.querySelector('.showreel-trigger');
    var shots = Array.prototype.slice.call(root.querySelectorAll('.showreel-shot'));
    if (!trigger || !shots.length) return;

    /* ── preview autoplay: only run CSS loop while on screen ── */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        var visible = false;
        entries.forEach(function (e) { if (e.isIntersecting) visible = true; });
        root.classList.add('is-live');
        root.classList.toggle('is-visible', visible);
      }, { threshold: 0.15 });
      io.observe(root);
    } else {
      root.classList.add('is-live', 'is-visible');
    }

    /* ── cursor-following label (fine pointers only) ────────── */
    if (FINE && !REDUCED) {
      var label = root.querySelector('.showreel-cursor');
      if (label) {
        var tx = 0, ty = 0, x = 0, y = 0, raf = null;

        var tick = function () {
          x += (tx - x) * 0.22;
          y += (ty - y) * 0.22;
          label.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
          if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) {
            raf = requestAnimationFrame(tick);
          } else {
            raf = null;
          }
        };
        var move = function (e) {
          var r = trigger.getBoundingClientRect();
          tx = e.clientX - r.left;
          ty = e.clientY - r.top;
          if (raf === null) raf = requestAnimationFrame(tick);
        };
        var enter = function (e) {
          var r = trigger.getBoundingClientRect();
          x = tx = e.clientX - r.left;
          y = ty = e.clientY - r.top;
          label.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        };

        trigger.addEventListener('pointerenter', enter);
        trigger.addEventListener('pointermove', move);
      }
    }

    /* ── player ──────────────────────────────────────────────── */
    var ui = null, playing = false, elapsed = 0, current = -1;
    var last = 0, rafId = null, closing = false, lastFocus = null, savedPad = null;
    var total = shots.length * SCENE_MS;

    function buildSlides() {
      shots.forEach(function (img, i) {
        var slide = document.createElement('div');
        slide.className = 'showreel-slide' + (i === 0 ? ' is-active' : '');

        var bg = document.createElement('img');
        bg.className = 'showreel-slide-bg';
        bg.src = img.currentSrc || img.src;
        bg.alt = '';
        bg.setAttribute('aria-hidden', 'true');
        bg.decoding = 'async';

        var phone = document.createElement('span');
        phone.className = 'showreel-phone';
        var shot = document.createElement('img');
        shot.src = img.currentSrc || img.src;
        shot.alt = img.alt || 'Student OS screen';
        shot.decoding = 'async';

        phone.appendChild(shot);
        slide.appendChild(bg);
        slide.appendChild(phone);
        ui.slides.appendChild(slide);
      });
    }

    function render() {
      var i = Math.min(shots.length - 1, Math.floor(elapsed / SCENE_MS));
      if (i !== current) {
        current = i;
        Array.prototype.forEach.call(ui.slides.children, function (s, k) {
          s.classList.toggle('is-active', k === i);
        });
        var shot = shots[i];
        ui.kicker.textContent = shot.getAttribute('data-kicker') || 'Inside Student OS';
        ui.title.textContent = shot.getAttribute('data-title') || '';
        ui.note.textContent = shot.getAttribute('data-note') || '';
        ui.count.textContent = pad(i + 1) + ' / ' + pad(shots.length);
        if (!REDUCED && ui.title.animate) {
          ui.title.animate(
            [{ opacity: 0, transform: 'translateY(7px)' }, { opacity: 1, transform: 'none' }],
            { duration: 480, easing: EASE }
          );
        }
      }
      var p = total ? (elapsed / total) * 1000 : 0;
      ui.range.value = String(Math.round(p));
      ui.range.style.setProperty('--p', (p / 10) + '%');
      ui.time.textContent = fmt(elapsed) + ' / ' + fmt(total);
    }

    function frame(now) {
      if (!playing) return;
      if (!last) last = now;
      elapsed += now - last;
      last = now;
      if (elapsed >= total) {
        elapsed = total;
        render();
        pause();
        return;
      }
      render();
      rafId = requestAnimationFrame(frame);
    }

    function play() {
      if (playing) return;
      if (elapsed >= total) { elapsed = 0; current = -1; }
      playing = true;
      last = 0;
      ui.btn.dataset.playing = 'true';
      ui.btn.setAttribute('aria-label', 'Pause showreel');
      ui.pop.classList.add('is-playing');
      rafId = requestAnimationFrame(frame);
    }

    function pause() {
      playing = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      ui.btn.dataset.playing = 'false';
      ui.btn.setAttribute('aria-label', 'Play showreel');
    }

    function clipFromTrigger() {
      var c = ui.card.getBoundingClientRect();
      var t = trigger.getBoundingClientRect();
      var top = Math.max(0, ((t.top - c.top) / c.height) * 100);
      var right = Math.max(0, ((c.right - t.right) / c.width) * 100);
      var bottom = Math.max(0, ((c.bottom - t.bottom) / c.height) * 100);
      var left = Math.max(0, ((t.left - c.left) / c.width) * 100);
      return 'inset(' + top.toFixed(2) + '% ' + right.toFixed(2) + '% ' +
        bottom.toFixed(2) + '% ' + left.toFixed(2) + '%)';
    }

    function lockScroll() {
      var sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) {
        savedPad = document.body.style.paddingRight;
        document.body.style.paddingRight = sw + 'px';
      }
      document.documentElement.classList.add('showreel-open');
    }

    function unlockScroll() {
      document.documentElement.classList.remove('showreel-open');
      if (savedPad !== null) {
        document.body.style.paddingRight = savedPad;
        savedPad = null;
      }
    }

    function open() {
      if (!ui) {
        ui = buildPopover();
        buildSlides();
        wirePlayer();
      }
      lastFocus = document.activeElement;
      elapsed = 0;
      current = -1;
      closing = false;
      lockScroll();
      ui.pop.showModal();
      render();

      if (!REDUCED && ui.card.animate) {
        if (window.innerWidth <= 720) {
          ui.veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
          ui.card.animate(
            [{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'scale(1)' }],
            { duration: 420, easing: EASE }
          );
        } else {
          ui.veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
          ui.card.animate(
            [{ clipPath: clipFromTrigger(), opacity: 0.35 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }],
            { duration: 850, easing: EASE }
          );
        }
      }
      ui.close.focus({ preventScroll: true });
      play();
    }

    function close() {
      if (!ui || !ui.pop.open || closing) return;
      closing = true;
      pause();

      var finish = function () {
        if (!closing) return;
        closing = false;
        ui.pop.close();
        unlockScroll();
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      };

      if (REDUCED || !ui.card.animate) { finish(); return; }

      if (window.innerWidth <= 720) {
        ui.veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' });
        var a = ui.card.animate(
          [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.94)' }],
          { duration: 300, easing: 'ease-in' }
        );
        a.onfinish = finish;
        setTimeout(finish, 420);
      } else {
        ui.veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in', delay: 260 });
        var b = ui.card.animate(
          [{ clipPath: 'inset(0 0 0 0)', opacity: 1 }, { clipPath: clipFromTrigger(), opacity: 0.3 }],
          { duration: 640, easing: 'cubic-bezier(.4,0,.2,1)' }
        );
        b.onfinish = finish;
        setTimeout(finish, 900);
      }
    }

    function wirePlayer() {
      ui.close.addEventListener('click', close);
      ui.veil.addEventListener('click', close);
      ui.pop.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
      ui.btn.addEventListener('click', function () { playing ? pause() : play(); });
      ui.range.addEventListener('input', function () {
        elapsed = (Number(ui.range.value) / 1000) * total;
        if (playing) last = 0;
        render();
      });
      Array.prototype.forEach.call(ui.slides.children, function (slide, i) {
        slide.addEventListener('click', function () {
          elapsed = i * SCENE_MS;
          current = -1;
          render();
          if (!playing) play();
        });
      });
    }

    trigger.addEventListener('click', open);
  }

  Array.prototype.forEach.call(roots, initInstance);
})();
