/* ═════════════════════════════════════════════════════════════
   skiper6 · "Hover members" — vanilla recreation
   - splits each name into masked letters
   - hover/focus a card → card activation + staggered letter roll
   - lazy cursor orb that trails the pointer inside the stage
   No dependencies. Respects prefers-reduced-motion.
═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var RED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  function hexToRgba(hex, a) {
    var h = (hex || '').trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(138,99,245,' + a + ')';
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function init() {
    var root = document.getElementById('hm') || document.getElementById('modules');
    var stage = document.getElementById('hmStage');
    var row = document.getElementById('hmRow');
    if (!root || !stage || !row) return;

    var cards = Array.prototype.slice.call(row.querySelectorAll('.hm-card'));
    if (!cards.length) return;

    var follow = document.getElementById('hmFollow');
    var idxEl = document.getElementById('hmIdx');
    var roleEl = document.getElementById('hmRole');
    var nameEls = {};

    Array.prototype.forEach.call(document.querySelectorAll('.hm-name'), function (el) {
      nameEls[el.getAttribute('data-name')] = el;
    });

    var idleRole = roleEl ? roleEl.textContent : '';
    var current = 'default';
    var activeCard = null;
    var touchMode = false;

    /* ── split names into letters ───────────────────────── */
    Object.keys(nameEls).forEach(function (key) {
      var el = nameEls[key];
      var text = (el.textContent || '').trim();
      el.textContent = '';
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        var span = document.createElement('span');
        span.className = 'l' + (ch === ' ' ? ' sp' : '');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
      }
    });

    function letters(el) {
      return Array.prototype.slice.call(el.querySelectorAll('.l'));
    }

    function cancelAnims(el) {
      letters(el).forEach(function (l) {
        if (l.getAnimations) {
          l.getAnimations().forEach(function (a) { a.cancel(); });
        }
      });
    }

    function animateIn(el, baseDelay) {
      if (!el) return;
      cancelAnims(el);
      el.classList.add('is-on');
      if (RED) return;
      letters(el).forEach(function (l, i) {
        l.animate(
          [
            { transform: 'translateY(104%)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
          ],
          {
            duration: 760,
            delay: (baseDelay || 0) + i * 26,
            easing: 'cubic-bezier(.16,1,.3,1)',
            fill: 'both'
          }
        );
      });
    }

    function animateOut(el) {
      if (!el) return;
      if (RED) { el.classList.remove('is-on'); return; }
      var key = el.getAttribute('data-name');
      letters(el).forEach(function (l, i) {
        l.animate(
          [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: 'translateY(-104%)', opacity: 0 }
          ],
          {
            duration: 440,
            delay: i * 9,
            easing: 'cubic-bezier(.16,1,.3,1)',
            fill: 'both'
          }
        );
      });
      // drop the class once it is off-screen (keeps reduced-motion toggles sane)
      setTimeout(function () {
        if (current !== key) el.classList.remove('is-on');
      }, 540);
    }

    function swapName(key) {
      if (key === current) return;
      var prev = nameEls[current];
      var next = nameEls[key];
      if (!next) return;
      animateOut(prev);
      // cancel whatever the incoming name was doing so it always starts below
      cancelAnims(next);
      next.classList.remove('is-on');
      animateIn(next, 70);
      current = key;
    }

    /* ── meta line ──────────────────────────────────────── */
    function setMeta(card) {
      var color = card ? card.style.getPropertyValue('--hm-c') : '#5b5bf0';
      stage.style.setProperty('--hm-c', color || '#5b5bf0');
      if (idxEl) {
        idxEl.textContent = card ? card.getAttribute('data-idx') : '00';
        idxEl.style.setProperty('--hm-c', color || '#5b5bf0');
      }
      if (roleEl) {
        var next = card ? card.getAttribute('data-role') : idleRole;
        if (roleEl.textContent !== next) {
          roleEl.textContent = next;
          roleEl.classList.remove('swap');
          void roleEl.offsetWidth; /* restart the keyframe */
          roleEl.classList.add('swap');
        }
      }
      stage.style.setProperty('--hm-orb', hexToRgba(color, 0.26));
    }

    /* ── activation ─────────────────────────────────────── */
    function activate(card) {
      if (card === activeCard) return;
      if (activeCard) activeCard.classList.remove('is-active');
      activeCard = card;

      if (card) {
        card.classList.add('is-active');
        row.classList.add('has-hover');
        swapName(card.getAttribute('data-name'));
      } else {
        row.classList.remove('has-hover');
        swapName('default');
      }
      setMeta(card);
    }

    /* ── pointer / focus wiring ─────────────────────────── */
    cards.forEach(function (card) {
      var label = card.querySelector('.hm-label b');
      if (label) {
        card.setAttribute('aria-label', label.textContent + ' — ' + (card.getAttribute('data-role') || ''));
      }
      card.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        activate(card);
      });
      card.addEventListener('focus', function () { activate(card); });
      card.addEventListener('click', function (e) {
        // mouse users already preview on hover — let the link follow through
        if (FINE && !touchMode) return;
        // touch: first tap previews the module, second tap opens it
        if (activeCard === card) return;
        e.preventDefault();
        activate(card);
      });
    });

    stage.addEventListener('pointerdown', function (e) {
      touchMode = e.pointerType !== 'mouse';
    });

    row.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch') return;
      if (row.contains(document.activeElement)) return;
      activate(null);
    });

    row.addEventListener('focusout', function () {
      // wait a tick: focus may already be moving to the next card
      setTimeout(function () {
        if (!row.contains(document.activeElement)) activate(null);
      }, 0);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && activeCard) {
        activeCard.blur();
        activate(null);
      }
    });

    /* ── cursor orb ─────────────────────────────────────── */
    if (follow && FINE && !RED) {
      var fx = 0, fy = 0, tx = 0, ty = 0, raf = null;

      var tick = function () {
        fx += (tx - fx) * 0.14;
        fy += (ty - fy) * 0.14;
        follow.style.transform =
          'translate3d(' + fx.toFixed(2) + 'px,' + fy.toFixed(2) + 'px,0) translate(-50%,-50%)';
        if (Math.abs(tx - fx) > 0.4 || Math.abs(ty - fy) > 0.4) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = null;
        }
      };

      stage.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = stage.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        if (raf === null) raf = requestAnimationFrame(tick);
      });

      stage.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        var r = stage.getBoundingClientRect();
        fx = tx = e.clientX - r.left;
        fy = ty = e.clientY - r.top;
        follow.style.transform =
          'translate3d(' + fx + 'px,' + fy + 'px,0) translate(-50%,-50%)';
        stage.classList.add('hovering');
      });

      stage.addEventListener('pointerleave', function () {
        stage.classList.remove('hovering');
      });
    }

    /* ── first paint ────────────────────────────────────── */
    if (RED) root.classList.add('is-static');
    setMeta(null);
    nameEls.default && nameEls.default.classList.add('is-on');
    animateIn(nameEls.default, 320);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
