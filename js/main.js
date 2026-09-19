/* BVANTRIX — progressive enhancement only.
   Nothing here is required for the page to be readable. */

/* ════════════════════════════════════════════════════════════════════
   FORM DELIVERY — the one line to change.

   Paste a form endpoint (Formspree, Getform, Basin, your own API) and
   both the booking panel and the contact form POST to it. The request
   is then sent from the form service's server and lands in the
   info@bvantrix.com inbox whether or not the visitor has a mail app.

   Left empty, both forms fall back to opening the visitor's own mail
   client — which fails silently for anyone who does not have one.

     var BVANTRIX_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
   ════════════════════════════════════════════════════════════════════ */
var BVANTRIX_ENDPOINT = '';
var BVANTRIX_EMAIL    = 'info@bvantrix.com';

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

/* BVANTRIX — booking panel.
   The call is taken on our own page; nothing redirects to a third party. */
(function () {
  'use strict';

  var BOOKING_ENDPOINT = BVANTRIX_ENDPOINT;   /* set at the top of this file */
  var BOOKING_EMAIL    = BVANTRIX_EMAIL;

  var DAYS_AHEAD = 12;                                    // weekdays offered
  var SLOTS = ['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'];

  var modal = document.getElementById('book');
  if (!modal) return;

  var panel   = modal.querySelector('.book-panel');
  var grid    = document.getElementById('bookForm');
  var form    = modal.querySelector('.book-form');
  var done    = document.getElementById('bookDone');
  var doneLn  = document.getElementById('bookDoneLine');
  var dayWrap = document.getElementById('bkDays');
  var timeWrap= document.getElementById('bkTimes');
  var drawer  = document.getElementById('navDrawer');
  var toggle  = document.getElementById('navToggle');

  var picked  = { day: null, time: null };
  var opener  = null;

  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ── Build the day strip: the next weekdays, starting tomorrow ── */
  function buildDays() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    var made = 0;
    while (made < DAYS_AHEAD) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0 || d.getDay() === 6) continue;   // skip weekends
      dayWrap.appendChild(chip(
        'day',
        '<span class="chip-dow">' + DOW[d.getDay()] + '</span>' +
        '<span class="chip-day">' + d.getDate() + ' ' + MON[d.getMonth()] + '</span>',
        DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear()
      ));
      made++;
    }
  }

  function buildTimes() {
    SLOTS.forEach(function (t) {
      timeWrap.appendChild(chip('time', label12(t), label12(t) + ' IST'));
    });
  }

  function label12(hhmm) {
    var h = parseInt(hhmm.split(':')[0], 10);
    var m = hhmm.split(':')[1];
    var ap = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 || 12;
    return h12 + ':' + m + ' ' + ap;
  }

  function chip(kind, html, value) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.dataset.value = value;
    b.innerHTML = html;
    b.addEventListener('click', function () {
      var group = kind === 'day' ? dayWrap : timeWrap;
      group.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-checked', String(c === b));
      });
      picked[kind] = value;
      clearErr(kind === 'day' ? 'bkDays' : 'bkTimes');
    });
    return b;
  }

  /* ── Validation ────────────────────────────────────────────── */
  function setErr(id, msg) {
    var p = modal.querySelector('[data-err-for="' + id + '"]');
    if (p) p.textContent = msg;
    var f = document.getElementById(id);
    if (f && f.closest('.fld')) f.closest('.fld').classList.add('is-bad');
  }
  function clearErr(id) {
    var p = modal.querySelector('[data-err-for="' + id + '"]');
    if (p) p.textContent = '';
    var f = document.getElementById(id);
    if (f && f.closest('.fld')) f.closest('.fld').classList.remove('is-bad');
  }

  function validate() {
    ['bkName', 'bkEmail', 'bkDays', 'bkTimes'].forEach(clearErr);
    var ok = true, first = null;

    var name = document.getElementById('bkName');
    if (!name.value.trim()) { setErr('bkName', 'Please tell us your name.'); ok = false; first = first || name; }

    var mail = document.getElementById('bkEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) {
      setErr('bkEmail', 'We need a valid email to send the invite.'); ok = false; first = first || mail;
    }
    if (!picked.day)  { setErr('bkDays',  'Choose a day.');  ok = false; first = first || dayWrap.querySelector('.chip'); }
    if (!picked.time) { setErr('bkTimes', 'Choose a time.'); ok = false; first = first || timeWrap.querySelector('.chip'); }

    if (first) first.focus();
    return ok;
  }

  /* ── Submit ────────────────────────────────────────────────── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var data = {
      name:    document.getElementById('bkName').value.trim(),
      email:   document.getElementById('bkEmail').value.trim(),
      company: document.getElementById('bkCo').value.trim(),
      day:     picked.day,
      time:    picked.time,
      message: document.getElementById('bkMsg').value.trim(),
      _subject: 'Call request — ' + document.getElementById('bkName').value.trim(),
      form: 'Call booking'
    };

    var btn = form.querySelector('.book-submit');
    btn.disabled = true;
    form.querySelector('.book-submit-txt').textContent = 'Sending…';

    if (BOOKING_ENDPOINT) {
      fetch(BOOKING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        confirmed(data);
      }).catch(function () {
        btn.disabled = false;
        form.querySelector('.book-submit-txt').textContent = 'Request this time';
        setErr('bkEmail', 'That did not go through. Please try again, or write to ' + BOOKING_EMAIL + '.');
      });
    } else {
      // No endpoint yet: hand the request to email so it still reaches us.
      var body =
        'Name: '    + data.name    + '\n' +
        'Email: '   + data.email   + '\n' +
        'Company: ' + (data.company || '—') + '\n' +
        'Requested: ' + data.day + ' at ' + data.time + '\n\n' +
        (data.message || '');
      var a = document.createElement('a');
      a.href = 'mailto:' + BOOKING_EMAIL +
               '?subject=' + encodeURIComponent('Call request — ' + data.name) +
               '&body=' + encodeURIComponent(body);
      a.click();
      confirmed(data);
    }
  });

  function confirmed(data) {
    grid.hidden = true;
    done.hidden = false;
    doneLn.textContent =
      'You asked for ' + data.day + ' at ' + data.time + '. We will check that ' +
      'against our calendar and email ' + data.email + ' within one working day ' +
      'to confirm it, with the meeting link.';
    panel.scrollTop = 0;
    done.querySelector('.btn').focus();
  }

  /* ── Open / close ──────────────────────────────────────────── */
  function open() {
    opener = document.activeElement;
    if (drawer && toggle) {                 // a drawer left open would sit on top
      drawer.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    var f = document.getElementById('bkName');
    if (f) setTimeout(function () { f.focus(); }, 60);
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { modal.hidden = true; }, 300);
    if (opener && opener.focus) opener.focus();
  }

  document.querySelectorAll('[data-book-open]').forEach(function (b) {
    b.addEventListener('click', open);
  });
  modal.querySelectorAll('[data-book-close]').forEach(function (b) {
    b.addEventListener('click', close);
  });

  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    // keep focus inside the dialog
    var f = panel.querySelectorAll('a[href], button:not([disabled]), input, textarea, select');
    var list = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!list.length) return;
    var firstEl = list[0], lastEl = list[list.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
  });

  buildDays();
  buildTimes();
})();

/* BVANTRIX — contact form.
   Same validation vocabulary as the booking panel. */
(function () {
  'use strict';

  var CONTACT_ENDPOINT = BVANTRIX_ENDPOINT;   /* set at the top of this file */
  var CONTACT_EMAIL    = BVANTRIX_EMAIL;

  var form = document.getElementById('contactForm');
  if (!form) return;

  var done = document.getElementById('contactDone');

  /* The placeholder is a full sentence and a narrow phone cannot show it
     without cutting it in half, so it shortens rather than clips. */
  var tel = document.getElementById('ctPhone');
  if (tel) {
    var narrow = window.matchMedia('(max-width: 360px)');
    var setHint = function () {
      tel.placeholder = narrow.matches ? 'Mobile number' : 'Enter your mobile number';
    };
    if (narrow.addEventListener) narrow.addEventListener('change', setHint);
    else if (narrow.addListener) narrow.addListener(setHint);
    setHint();
  }

  /* The control shows only the dialling code; the native select behind it
     carries the country names. Keep the two in step. */
  var code = document.getElementById('ctCode');
  var codeTxt = form.querySelector('.tel-code-txt');
  if (code && codeTxt) {
    var syncCode = function () { codeTxt.textContent = code.value; };
    code.addEventListener('change', syncCode);
    syncCode();
  }

  function setErr(id, msg) {
    var p = form.querySelector('[data-err-for="' + id + '"]');
    if (p) p.textContent = msg;
    var f = document.getElementById(id);
    if (f && f.closest('.fld')) f.closest('.fld').classList.add('is-bad');
  }
  function clearErr(id) {
    var p = form.querySelector('[data-err-for="' + id + '"]');
    if (p) p.textContent = '';
    var f = document.getElementById(id);
    if (f && f.closest('.fld')) f.closest('.fld').classList.remove('is-bad');
  }

  function validate() {
    ['ctName', 'ctEmail', 'ctPhone'].forEach(clearErr);
    var ok = true, first = null;

    var name = document.getElementById('ctName');
    if (!name.value.trim()) { setErr('ctName', 'Please tell us your name.'); ok = false; first = first || name; }

    var mail = document.getElementById('ctEmail');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) {
      setErr('ctEmail', 'We need a valid email to reply to.'); ok = false; first = first || mail;
    }

    // the country supplies the code, so only the local number is checked
    var tel = document.getElementById('ctPhone');
    var digits = tel.value.replace(/\D/g, '');
    if (!digits) {
      setErr('ctPhone', 'Please enter your mobile number.'); ok = false; first = first || tel;
    } else if (digits.length < 6 || digits.length > 13 || /[^\d\s()\-]/.test(tel.value.trim())) {
      setErr('ctPhone', 'Please check the number.'); ok = false; first = first || tel;
    }

    if (first) first.focus();
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var data = {
      name:    document.getElementById('ctName').value.trim(),
      email:   document.getElementById('ctEmail').value.trim(),
      phone:   document.getElementById('ctCode').value + ' ' +
               document.getElementById('ctPhone').value.trim(),
      country: document.getElementById('ctCode')
                 .selectedOptions[0].text.replace(/\s*\+\d+$/, ''),
      message: document.getElementById('ctMsg').value.trim(),
      _subject: 'Website enquiry — ' + document.getElementById('ctName').value.trim(),
      form: 'Contact'
    };

    var btn = form.querySelector('.contact-submit');
    var txt = form.querySelector('.contact-submit-txt');
    btn.disabled = true;
    txt.textContent = 'Sending…';

    function settled() {
      done.hidden = false;
      btn.disabled = false;
      txt.textContent = 'Send';
      form.reset();   // restores India as the default country
      if (code && codeTxt) codeTxt.textContent = code.value;
    }

    if (CONTACT_ENDPOINT) {
      fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        settled();
      }).catch(function () {
        btn.disabled = false;
        txt.textContent = 'Send';
        setErr('ctEmail', 'That did not go through. Please try again, or write to ' + CONTACT_EMAIL + '.');
      });
    } else {
      var body =
        'Name: '   + data.name  + '\n' +
        'Email: '  + data.email + '\n' +
        'Mobile: ' + data.phone + '  (' + data.country + ')\n\n' +
        (data.message || '');
      var a = document.createElement('a');
      a.href = 'mailto:' + CONTACT_EMAIL +
               '?subject=' + encodeURIComponent('Website enquiry — ' + data.name) +
               '&body=' + encodeURIComponent(body);
      a.click();
      settled();
    }
  });
})();
