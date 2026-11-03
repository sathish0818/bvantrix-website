/* ════════════════════════════════════════════════════════════════════
   FORM DELIVERY, the one line to change.

   Paste a form endpoint (Formspree, Getform, Basin, your own API) and
   the enquiry form posts to it, so the message reaches the inbox
   whether or not the visitor has a mail application installed.

   Left empty, the form falls back to opening the visitor's own mail
   client, which fails silently for anyone who does not have one.

     var RITVA_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
   ════════════════════════════════════════════════════════════════════ */
var RITVA_ENDPOINT = '';
var RITVA_EMAIL    = 'info@bvantrix.com';

/* RITVA, progressive enhancement only.
   The page reads and the form submits with none of this running. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ── the phone menu ───────────────────────────────────────────────── */
  var btn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');
  if (btn && drawer) {
    var set = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      drawer.hidden = !open;
      btn.textContent = open ? 'Close' : 'Menu';
    };
    btn.addEventListener('click', function () {
      set(btn.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 920) set(false); });
  }

  /* ── entrances ────────────────────────────────────────────────────────
     Sections lift once as they arrive. The brief asks for lightweight
     transitions, so this is opacity and transform only, it runs once,
     and anything still hidden after 2s is shown regardless, so a
     backgrounded tab can never leave the page blank. */
  var risers = document.querySelectorAll('.split, .steps, .values, .cards, .dims, .hero-words, .hero-fig');
  Array.prototype.forEach.call(risers, function (el) { el.classList.add('rise'); });

  var show = function (el) { el.classList.add('in'); };

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(risers, function (el) { io.observe(el); });
    setTimeout(function () { Array.prototype.forEach.call(risers, show); }, 2000);
  } else {
    Array.prototype.forEach.call(risers, show);
  }

  /* ── the enquiry form ─────────────────────────────────────────────── */
  var form = document.getElementById('enquiry');
  var note = document.getElementById('formNote');
  if (!form || !note) return;

  var say = function (msg, ok) {
    note.textContent = msg;
    if (ok) { note.setAttribute('data-ok', '1'); } else { note.removeAttribute('data-ok'); }
  };

  var emailLooksReal = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('input, textarea');
    var firstBad = null;

    Array.prototype.forEach.call(fields, function (f) {
      var bad = false;
      if (f.hasAttribute('required') && !f.value.trim()) { bad = true; }
      if (f.type === 'email' && f.value.trim() && !emailLooksReal(f.value.trim())) { bad = true; }
      f.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !firstBad) { firstBad = f; }
    });

    if (firstBad) {
      say('Please complete the highlighted fields so we can reply.');
      firstBad.focus();
      return;
    }

    var data = {
      name:        form.elements.name.value.trim(),
      email:       form.elements.email.value.trim(),
      organisation:form.elements.organisation.value.trim(),
      designation: form.elements.designation.value.trim(),
      message:     form.elements.message.value.trim()
    };

    var done = function () {
      form.reset();
      Array.prototype.forEach.call(fields, function (f) { f.setAttribute('aria-invalid', 'false'); });
      say('Thank you. Your enquiry is with us and we will reply by email.', true);
    };

    if (RITVA_ENDPOINT) {
      say('Sending your enquiry.');
      fetch(RITVA_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) { done(); }
        else { say('That did not send. Please email ' + RITVA_EMAIL + ' and we will pick it up.'); }
      }).catch(function () {
        say('That did not send. Please email ' + RITVA_EMAIL + ' and we will pick it up.');
      });
      return;
    }

    /* No endpoint configured: hand the message to the visitor's mail client
       and say plainly what is happening, rather than pretending it was sent. */
    var body = [
      'Name: ' + data.name,
      'Work email: ' + data.email,
      'Organisation: ' + data.organisation,
      'Designation: ' + (data.designation || 'not given'),
      '',
      data.message || '(no message)'
    ].join('\n');

    window.location.href = 'mailto:' + RITVA_EMAIL
      + '?subject=' + encodeURIComponent('RITVA enquiry from ' + (data.organisation || data.name))
      + '&body=' + encodeURIComponent(body);

    say('Your mail application is opening with this enquiry ready to send. '
      + 'If nothing happens, email ' + RITVA_EMAIL + ' directly.');
  });
})();
