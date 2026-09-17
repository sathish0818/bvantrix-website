/* BVANTRIX — progressive enhancement only.
   Nothing here is required for the page to be readable. */
(function () {
  'use strict';

  // Mark that JS is running, so reveal styles may apply.
  document.documentElement.classList.add('js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll reveal ────────────────────────────────────────── */
  var items = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });

    // Safety net — nothing stays hidden if the observer never fires.
    window.setTimeout(function () {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }, 700);
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── Nav shadow on scroll ─────────────────────────────────── */
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Orb follows the pointer, gently ──────────────────────── */
  var stage = document.getElementById('orbStage');
  if (stage && !reduce && window.matchMedia('(hover: hover)').matches) {
    var MAX = 14;           // px of travel — deliberately small
    var raf = null;

    stage.closest('.hero').addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        var r = stage.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));
        stage.style.setProperty('--tilt-x', (dx * MAX).toFixed(1) + 'px');
        stage.style.setProperty('--tilt-y', (dy * MAX).toFixed(1) + 'px');
        raf = null;
      });
    });

    stage.closest('.hero').addEventListener('pointerleave', function () {
      stage.style.setProperty('--tilt-x', '0px');
      stage.style.setProperty('--tilt-y', '0px');
    });
  }

  /* ── Mobile drawer ────────────────────────────────────────── */
  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('navDrawer');

  // keep the drawer pinned directly under the nav, whatever its height
  function syncNavHeight() {
    document.documentElement.style.setProperty(
      '--nav-h', Math.round(nav.getBoundingClientRect().height) + 'px'
    );
  }
  syncNavHeight();
  window.addEventListener('resize', syncNavHeight);

  function setDrawer(open) {
    toggle.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
  }

  toggle.addEventListener('click', function () {
    setDrawer(toggle.getAttribute('aria-expanded') !== 'true');
  });

  drawer.addEventListener('click', function (e) {
    if (e.target.closest('a')) setDrawer(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setDrawer(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) setDrawer(false);
  });
})();
