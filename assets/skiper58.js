/* ═════════════════════════════════════════════════════════════
   skiper58 · "Text roll nav" — vanilla recreation
   - splits each word into two masked letter tracks
   - hover/focus rolls the word out and the accent copy in,
     staggered from the centre of the word (like Skiper58)
   - pure CSS transitions, zero rAF, no dependencies
   - falls back to plain text without JS; respects
     prefers-reduced-motion (CSS side)
═════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STAGGER = 0.035; // matches the React component's per-letter delay

  function build(list) {
    var links = list.querySelectorAll('.roll-link');
    Array.prototype.forEach.call(links, function (link) {
      var word = link.querySelector('.roll-word');
      if (!word || word.getAttribute('data-done')) return;
      word.setAttribute('data-done', '1');

      var text = word.getAttribute('data-text') || (word.textContent || '').trim();
      if (!text) return;

      word.textContent = '';

      // keep an accessible name even though the letters are decorative
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = text;
      word.appendChild(sr);

      ['roll-a', 'roll-b'].forEach(function (cls) {
        var track = document.createElement('span');
        track.className = 'roll-track ' + cls;
        track.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < text.length; i++) {
          var ch = text.charAt(i);
          var span = document.createElement('span');
          span.className = 'ch';
          span.textContent = ch === ' ' ? '\u00A0' : ch;
          // stagger from the centre, exactly like the original
          var delay = STAGGER * Math.abs(i - (text.length - 1) / 2);
          span.style.setProperty('--d', delay.toFixed(3) + 's');
          track.appendChild(span);
        }
        word.appendChild(track);
      });
    });
  }

  function init() {
    var list = document.getElementById('rollList');
    if (list) build(list);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
