/* ============================================================================
   BVANTRIX — ESG demo engine.

   Reads window.ESG_DEMO (esg-demo-data.js) and never hard-codes content.
   Six steps: start, context, two question steps, score, decision.
   ============================================================================ */
(function () {
  'use strict';

  var D = window.ESG_DEMO;
  if (!D) return;

  var root = document.getElementById('demo');
  if (!root) return;

  document.documentElement.classList.add('js');

  /* ── state ─────────────────────────────────────────────────────────── */
  var SPLIT = 8;                       // questions on the first of two steps
  var setA  = D.questions.slice(0, SPLIT);
  var setB  = D.questions.slice(SPLIT);

  var state = {
    step: 1,
    profile: {},
    answers: {},                       // id -> value (number) or null (unknown)
    weights: null,                     // criterion id -> 0..1, set after scoring
    skipped: false                     // came straight to the decision
  };

  var STEPS = [
    { n: 1, label: 'Start' },
    { n: 2, label: 'Context' },
    { n: 3, label: 'Questions' },
    { n: 4, label: 'Questions' },
    { n: 5, label: 'Your score' },
    { n: 6, label: 'A decision' }
  ];

  /* ── persistence, best effort only ─────────────────────────────────── */
  var KEY = 'bvx-esg-demo';
  function save() {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function restore() {
    try {
      var raw = sessionStorage.getItem(KEY);
      if (!raw) return;
      var p = JSON.parse(raw);
      if (p && typeof p === 'object') {
        state.profile = p.profile || {};
        state.answers = p.answers || {};
        state.weights = p.weights || null;
      }
    } catch (e) {}
  }

  /* ── scoring ───────────────────────────────────────────────────────── */
  function scored() {
    return D.questions.filter(function (q) {
      var v = state.answers[q.id];
      return typeof v === 'number';
    });
  }

  function dimensionScores() {
    var out = {};
    D.dimensions.forEach(function (d) {
      var qs = D.questions.filter(function (q) { return q.dim === d.id; });
      var got = 0, possible = 0, answered = 0;
      qs.forEach(function (q) {
        var v = state.answers[q.id];
        if (typeof v !== 'number') return;
        answered++;
        got += v * q.weight;
        possible += D.scoring.max * q.weight;
      });
      out[d.id] = {
        id: d.id, name: d.name, short: d.short,
        answered: answered, total: qs.length,
        pct: possible ? Math.round((got / possible) * 100) : null
      };
    });
    return out;
  }

  function overall() {
    var got = 0, possible = 0;
    scored().forEach(function (q) {
      got += state.answers[q.id] * q.weight;
      possible += D.scoring.max * q.weight;
    });
    return possible ? Math.round((got / possible) * 100) : 0;
  }

  function confidence() {
    var ratio = scored().length / D.questions.length;
    var band = D.scoring.confidence.find(function (c) { return ratio >= c.minAnswered; });
    return { ratio: ratio, label: band.label, note: band.note,
             answered: scored().length, total: D.questions.length };
  }

  function band(score) {
    return D.scoring.bands.find(function (b) { return score >= b.min; });
  }

  function gaps() {
    return D.questions.filter(function (q) {
      return typeof state.answers[q.id] !== 'number';
    });
  }

  /* The weakest dimension matters most, so it weighs most. That is the
     "their own priorities" part — derived, then adjustable. */
  function deriveWeights() {
    var ds = dimensionScores(), w = {};
    D.decision.criteria.forEach(function (c) {
      if (!c.dim) { w[c.id] = 0.5; return; }
      var pct = ds[c.dim] && ds[c.dim].pct;
      w[c.id] = pct === null || pct === undefined ? 0.5 : (1 - pct / 100) * 0.8 + 0.2;
    });
    return w;
  }

  function rankOptions() {
    var w = state.weights || {};
    var rows = D.decision.options.map(function (o) {
      var got = 0, possible = 0;
      D.decision.criteria.forEach(function (c) {
        var weight = w[c.id] === undefined ? 0.5 : w[c.id];
        got += (o.scores[c.id] || 0) * weight;
        possible += 4 * weight;
      });
      return { opt: o, pct: possible ? Math.round((got / possible) * 100) : 0 };
    });
    rows.sort(function (a, b) { return b.pct - a.pct; });
    return rows;
  }

  /* ── tiny DOM helper ───────────────────────────────────────────────── */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  window.__esgDemo = { state: state, overall: overall, dimensionScores: dimensionScores,
                       confidence: confidence, rankOptions: rankOptions };

  /* ── rendering ─────────────────────────────────────────────────────── */

  function renderRail() {
    var rail = document.getElementById('demoRail');
    rail.innerHTML = '';
    STEPS.forEach(function (s) {
      var li = el('li', s.n === state.step ? 'is-here'
                      : s.n < state.step ? 'is-done' : '');
      li.innerHTML = '<span class="rail-n">' + String(s.n).padStart(2, '0') + '</span>' +
                     '<span class="rail-l">' + s.label + '</span>';
      rail.appendChild(li);
    });
    var pct = ((state.step - 1) / (STEPS.length - 1)) * 100;
    document.getElementById('demoBar').style.width = pct + '%';
  }

  function questionCard(q, idx) {
    var card = el('fieldset', 'q');
    var fw = (q.frameworks || []).map(function (f) {
      return '<span class="fw">' + esc(f) + '</span>';
    }).join('');

    card.innerHTML =
      '<legend class="q-h"><span class="q-n">' + idx + '</span>' + esc(q.text) + '</legend>' +
      (q.help ? '<p class="q-help">' + esc(q.help) + '</p>' : '') +
      '<div class="q-fw">' + fw + '</div>';

    var list = el('div', 'q-opts');
    q.options.forEach(function (o, i) {
      var id = q.id + '-' + i;
      var lab = el('label', 'opt' + (o.value === null ? ' opt--unknown' : ''));
      lab.setAttribute('for', id);
      lab.innerHTML =
        '<input type="radio" id="' + id + '" name="' + q.id + '"' +
        (state.answers[q.id] === o.value && (q.id in state.answers) ? ' checked' : '') + '>' +
        '<span class="opt-dot" aria-hidden="true"></span>' +
        '<span class="opt-l">' + esc(o.label) + '</span>';
      lab.querySelector('input').addEventListener('change', function () {
        state.answers[q.id] = o.value;
        save();
        /* :has() paints this too, but a class means the selected option is
           still obvious in a browser that does not support it */
        list.querySelectorAll('.opt').forEach(function (n) { n.classList.remove('is-on'); });
        lab.classList.add('is-on');
        card.classList.add('is-answered');
        updateStepCount();
      });
      list.appendChild(lab);
    });
    card.appendChild(list);
    if (q.id in state.answers) {
      card.classList.add('is-answered');
      var chosen = list.querySelector('input:checked');
      if (chosen) chosen.closest('.opt').classList.add('is-on');
    }
    return card;
  }

  function updateStepCount() {
    var set = state.step === 3 ? setA : state.step === 4 ? setB : null;
    var node = document.getElementById('demoCount');
    if (!set || !node) return;
    var done = set.filter(function (q) { return q.id in state.answers; }).length;
    node.textContent = done + ' of ' + set.length + ' answered';
    var next = document.getElementById('demoNext');
    if (next) next.disabled = false;      // skipping is allowed; it costs confidence
  }

  /* ── the six screens ───────────────────────────────────────────────── */
  var screens = {};

  screens[1] = function () {
    var w = el('div', 'screen');
    w.innerHTML =
      '<p class="eyebrow">ESG demo</p>' +
      '<h1 class="h2">See where your data<br>would let you decide.</h1>' +
      '<p class="body">Fifteen questions, about five minutes. You get a preliminary ' +
      'ESG score out of 100 with its confidence level — then one real decision, ' +
      'compared using the priorities your own answers imply.</p>' +
      '<ul class="facts">' +
        '<li><span class="mi" aria-hidden="true">schedule</span>About 7 minutes to a result</li>' +
        '<li><span class="mi" aria-hidden="true">lock</span>Nothing leaves your browser</li>' +
        '<li><span class="mi" aria-hidden="true">fact_check</span>Mapped to BRSR, GRI and ISSB</li>' +
      '</ul>' +
      '<div class="actions">' +
        '<button class="btn btn--amber" data-go="2">Start the assessment' +
          '<svg class="arw" width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">' +
          '<path d="M1 5h10M8 1.5 11.5 5 8 8.5" stroke="currentColor" stroke-width="1.4" ' +
          'stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<button class="as-link" data-skip>Skip to a sample decision</button>' +
      '</div>';
    return w;
  };

  screens[2] = function () {
    var w = el('div', 'screen');
    w.innerHTML =
      '<p class="eyebrow">Step 02 — Context</p>' +
      '<h2 class="h2">First, who is answering.</h2>' +
      (root.classList.contains('is-continued')
        ? '<p class="carried"><span class="mi" aria-hidden="true">check</span>' +
          'Question 1 came with you from the homepage — it is answered on the ' +
          'next step, and you can change it there. Fourteen to go.</p>'
        : '') +
      '<p class="body">None of this is scored. It decides which parts of the ' +
      'result matter most for you.</p>';
    var grid = el('div', 'profile');
    D.profile.forEach(function (f) {
      var block = el('div', 'profile-f');
      block.innerHTML = '<p class="profile-l">' + esc(f.label) + '</p>';
      var opts = el('div', 'chips');
      f.options.forEach(function (o) {
        var b = el('button', 'chip' + (state.profile[f.id] === o ? ' is-on' : ''), esc(o));
        b.type = 'button';
        b.addEventListener('click', function () {
          state.profile[f.id] = o;
          save();
          opts.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-on'); });
          b.classList.add('is-on');
        });
        opts.appendChild(b);
      });
      block.appendChild(opts);
      grid.appendChild(block);
    });
    w.appendChild(grid);
    return w;
  };

  function questionScreen(set, n, title) {
    return function () {
      var w = el('div', 'screen');
      w.innerHTML =
        '<p class="eyebrow">Step ' + String(n).padStart(2, '0') + ' — ' + title + '</p>' +
        '<h2 class="h2">' + (n === 3 ? 'What you measure.' : 'What you can act on.') + '</h2>' +
        '<p class="body">Answer what you know. <em>I don\'t know</em> is a real ' +
        'answer here — it lowers the confidence of the result rather than the score, ' +
        'which is the honest way round.</p>' +
        '<p class="count" id="demoCount"></p>';
      set.forEach(function (q, i) {
        w.appendChild(questionCard(q, (n === 3 ? 0 : SPLIT) + i + 1));
      });
      return w;
    };
  }
  screens[3] = questionScreen(setA, 3, 'Questions');
  screens[4] = questionScreen(setB, 4, 'Questions');

  screens[5] = function () {
    var score = overall(), c = confidence(), b = band(score), ds = dimensionScores(), g = gaps();
    state.weights = state.weights || deriveWeights();
    save();

    var w = el('div', 'screen');
    var ring = 2 * Math.PI * 54;

    w.innerHTML =
      '<p class="eyebrow">Step 05 — Your score</p>' +
      '<div class="result">' +
        '<div class="dial">' +
          '<svg viewBox="0 0 128 128" aria-hidden="true">' +
            '<circle cx="64" cy="64" r="54" stroke="var(--line-2)" stroke-width="7" fill="none"/>' +
            '<circle class="dial-v" cx="64" cy="64" r="54" stroke="var(--amber)" stroke-width="7" ' +
              'fill="none" stroke-linecap="round" transform="rotate(-90 64 64)" ' +
              'stroke-dasharray="' + ring + '" stroke-dashoffset="' + ring + '" ' +
              'style="--to:' + (ring - ring * score / 100) + '"/>' +
          '</svg>' +
          '<p class="dial-n"><b>' + score + '</b><span>/ 100</span></p>' +
        '</div>' +
        '<div class="result-copy">' +
          '<h2 class="h2">' + esc(b.label) + '.</h2>' +
          '<p class="body">' + esc(b.note) + '</p>' +
          '<p class="conf"><span class="conf-k">Confidence</span>' +
            '<b class="conf-v conf-v--' + c.label.toLowerCase() + '">' + c.label + '</b>' +
            '<span class="conf-n">' + c.answered + ' of ' + c.total + ' answered — ' +
            esc(c.note) + '</span></p>' +
        '</div>' +
      '</div>' +
      '<h3 class="sub">Where the number comes from</h3>';

    var bars = el('ul', 'bars');
    D.dimensions.forEach(function (d) {
      var s = ds[d.id];
      var li = el('li', s.pct === null ? 'is-blank' : '');
      li.innerHTML =
        '<span class="bar-l">' + esc(d.name) + '</span>' +
        '<span class="bar-t"><span class="bar-f" style="--w:' + (s.pct || 0) + '%"></span></span>' +
        '<span class="bar-v">' + (s.pct === null ? 'no data' : s.pct) + '</span>' +
        '<span class="bar-b">' + esc(d.blurb) + '</span>';
      bars.appendChild(li);
    });
    w.appendChild(bars);

    if (g.length) {
      var gapBox = el('div', 'gaps');
      gapBox.innerHTML = '<h3 class="sub">What we could not score</h3>' +
        '<p class="body">These are the gaps behind the confidence level. Each one is ' +
        'a question somebody will eventually ask you.</p>';
      var ul = el('ul', 'gap-list');
      g.forEach(function (q) {
        ul.appendChild(el('li', null, esc(q.text) +
          ' <span class="gap-fw">' + (q.frameworks || []).map(esc).join(' · ') + '</span>'));
      });
      gapBox.appendChild(ul);
      w.appendChild(gapBox);
    }
    return w;
  };

  screens[6] = function () {
    if (!state.weights) state.weights = state.skipped ? neutralWeights() : deriveWeights();
    var w = el('div', 'screen');
    w.innerHTML =
      '<p class="eyebrow">Step 06 — A decision</p>' +
      '<h2 class="h2">' + esc(D.decision.question) + '</h2>' +
      '<p class="body">' + esc(D.decision.context) + ' ' +
      (state.skipped
        ? 'Priorities are set evenly here. Answer the assessment and they shift to yours.'
        : 'The weights below came from your answers — the dimensions you are weakest on ' +
          'carry the most, because that is where a decision is most likely to surprise you.') +
      '</p>';

    var panel = el('div', 'weights');
    panel.innerHTML = '<h3 class="sub">Your priorities <span class="sub-n">drag to change</span></h3>';
    D.decision.criteria.forEach(function (c) {
      var row = el('div', 'weight');
      var val = Math.round((state.weights[c.id] || 0.5) * 100);
      row.innerHTML =
        '<label for="w-' + c.id + '">' + esc(c.label) + '</label>' +
        '<input id="w-' + c.id + '" type="range" min="0" max="100" value="' + val + '">' +
        '<output>' + val + '</output>';
      row.querySelector('input').addEventListener('input', function (e) {
        state.weights[c.id] = e.target.value / 100;
        row.querySelector('output').textContent = e.target.value;
        save();
        paintOptions();
      });
      panel.appendChild(row);
    });
    w.appendChild(panel);
    w.appendChild(el('div', 'opts-out', '<h3 class="sub">How the options compare</h3>' +
                                        '<div id="demoOpts"></div>'));
    return w;
  };

  function neutralWeights() {
    var w = {};
    D.decision.criteria.forEach(function (c) { w[c.id] = 0.5; });
    return w;
  }

  function paintOptions() {
    var host = document.getElementById('demoOpts');
    if (!host) return;
    var rows = rankOptions();
    host.innerHTML = '';
    rows.forEach(function (r, i) {
      var card = el('article', 'dopt' + (i === 0 ? ' dopt--lead' : ''));
      var lines = D.decision.criteria.map(function (c) {
        var v = r.opt.scores[c.id] || 0;
        return '<li><span class="dopt-c">' + esc(c.label) + '</span>' +
               '<span class="dopt-m" aria-label="' + v + ' out of 4">' +
               [0,1,2,3].map(function (n) {
                 return '<i class="' + (n < v ? 'on' : '') + '"></i>';
               }).join('') + '</span>' +
               '<span class="dopt-n">' + esc(r.opt.notes[c.id] || '') + '</span></li>';
      }).join('');
      card.innerHTML =
        '<header><h4>' + esc(r.opt.label) + '</h4>' +
        (i === 0 ? '<span class="tag">Best fit for your priorities</span>' : '') +
        '<span class="dopt-pct">' + r.pct + '</span></header>' +
        '<p class="dopt-s">' + esc(r.opt.summary) + '</p>' +
        '<ul class="dopt-l">' + lines + '</ul>';
      host.appendChild(card);
    });
  }

  /* ── navigation ────────────────────────────────────────────────────── */
  function go(n) {
    state.step = Math.max(1, Math.min(STEPS.length, n));
    save();
    paint();
    var top = root.getBoundingClientRect().top + window.scrollY - 86;
    window.scrollTo({ top: top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function paint() {
    var stage = document.getElementById('demoStage');
    stage.innerHTML = '';
    stage.appendChild(screens[state.step]());

    renderRail();
    updateStepCount();
    if (state.step === 6) paintOptions();

    /* foot controls */
    var foot = document.getElementById('demoFoot');
    foot.innerHTML = '';
    if (state.step > 1) {
      var back = el('button', 'as-link', '← Back');
      back.type = 'button';
      back.addEventListener('click', function () { go(state.step - 1); });
      foot.appendChild(back);
    }
    if (state.step < 6) {
      var next = el('button', 'btn btn--amber');
      next.id = 'demoNext';
      next.type = 'button';
      next.innerHTML = (state.step === 4 ? 'See my score' : state.step === 5 ? 'Now a decision' : 'Continue') +
        '<svg class="arw" width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">' +
        '<path d="M1 5h10M8 1.5 11.5 5 8 8.5" stroke="currentColor" stroke-width="1.4" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>';
      next.addEventListener('click', function () {
        if (state.step === 4) state.weights = deriveWeights();
        go(state.step + 1);
      });
      foot.appendChild(next);
    } else {
      var again = el('button', 'as-link', 'Start again');
      again.type = 'button';
      again.addEventListener('click', function () {
        state.answers = {}; state.profile = {}; state.weights = null; state.skipped = false;
        try { sessionStorage.removeItem(KEY); } catch (e) {}
        go(1);
      });
      var talk = el('a', 'btn btn--amber');
      talk.href = 'index.html#contact';
      talk.innerHTML = 'Bring us your own decision' +
        '<svg class="arw" width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">' +
        '<path d="M1 5h10M8 1.5 11.5 5 8 8.5" stroke="currentColor" stroke-width="1.4" ' +
        'stroke-linecap="round" stroke-linejoin="round"/></svg>';
      foot.appendChild(again);
      foot.appendChild(talk);
    }

    stage.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { go(+b.dataset.go); });
    });
    var skip = stage.querySelector('[data-skip]');
    if (skip) skip.addEventListener('click', function () {
      state.skipped = true;
      state.weights = neutralWeights();
      go(6);
    });
  }

  restore();
  /* Arrived with question one already answered on the homepage: start at
     the context step rather than the pitch, and say so. */
  try {
    var seeded = JSON.parse(sessionStorage.getItem(KEY) || '{}');
    if (seeded.fromHome && Object.keys(state.answers).length && state.step === 1) {
      state.step = 2;
      root.classList.add('is-continued');
    }
  } catch (e) {}
  paint();
})();
