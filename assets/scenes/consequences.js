/* The page's one scroll scene.

   A decision is made, and reaches six places. The stage is held for two
   screens; over that hold each consequence arrives in turn and the counter
   climbs. Nothing is hidden by it: without script, without GSAP, or with
   motion reduced, the finished composition is what shows. */
(function () {
  'use strict';
  if (!window.Stage) return;

  var root = document.querySelector('[data-scene="consequences"]');
  if (!root) return;

  Stage.scene(root, {
    hold: 2,
    scrub: 0.4,            /* a little weight, still tied to the scrollbar */
    beats: 6,
    build: function (tl, ctx) {
      var items = ctx.q('.chain li');
      var count = root.querySelector('[data-count]');

      /* The heading settles first. In px, not yPercent: a percentage is of
         each element's own height, so the statement travelled far enough to
         sit under the counter beneath it. */
      tl.from(ctx.q('.scene-talk > *'), {
        y: 22, opacity: 0, duration: 0.18, stagger: 0.04, ease: 'power3.out'
      }, 0);

      items.forEach(function (li, i) {
        var at = 0.2 + i * 0.12;
        tl.from(li, {
          y: 20, opacity: 0, duration: 0.14, ease: 'power3.out'
        }, at);
        tl.to(li, { '--lit': 1, duration: 0.1, ease: 'none' }, at + 0.04);
        if (count) {
          tl.to(count, {
            duration: 0.01,
            onComplete: function () { count.textContent = String(i + 1); },
            onReverseComplete: function () { count.textContent = String(i); }
          }, at + 0.05);
        }
      });
    },
    phone: { hold: 1.4 },
    rest: function (ctx) {
      var count = root.querySelector('[data-count]');
      if (count) count.textContent = '6';
      ctx.q('.chain li').forEach(function (li) { li.style.setProperty('--lit', 1); });
    }
  });
})();
