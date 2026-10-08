(() => {
  'use strict';

  /* ------------------------------------------------------------------
     MAIL SETTINGS
     Browsers cannot send email on their own, and everything in this file is
     public once it is on GitHub. So NEVER put an iCloud password here.
     Deploy mail/Code.gs as a free Google Apps Script web app (see README.md)
     and paste its web app URL below. That URL is not a secret.
  ------------------------------------------------------------------ */
  const MAIL = {
    scriptUrl: 'https://script.google.com/macros/s/AKfycbyXbP5nZbQSVBOrsY_FfRbrDDkwGl0Soz9MvbaHyagSpKa1Sq8_T8CUTHS05_eYGvGP/exec'
  };

  const EVENT = {
    mapUrl: 'https://maps.app.goo.gl/UkPQQPJjdMraWyyo9?g_st=ic',
    startUtc: '20261010T140000Z', // 7:30 pm IST
    endUtc: '20261010T170000Z'    // 10:30 pm IST
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const demoMode = MAIL.scriptUrl.includes('PASTE_YOUR');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------------- Views and routing ---------------- */
  const views = {
    invite: $('#view-invite'),
    form: $('#view-form'),
    done: $('#view-done')
  };
  const state = { submitted: false, current: 'name', plus: null };

  function show(name) {
    Object.keys(views).forEach((k) => { views[k].hidden = k !== name; });
    const v = views[name];
    v.classList.remove('enter');
    void v.offsetWidth; // restart the entrance animation
    v.classList.add('enter');
    window.scrollTo(0, 0);
  }

  function route() {
    if (state.submitted) { show('done'); return; }
    if (location.hash === '#rsvp') {
      show('form');
      renderStep('forward', false);
      const first = $('.step.is-active input, .step.is-active textarea');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 450);
    } else {
      show('invite');
    }
  }
  window.addEventListener('hashchange', route);

  $('#rsvp-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (location.hash === '#rsvp') route(); else location.hash = 'rsvp';
    miniBurst(e.clientX, e.clientY);
  });

  /* ---------------- Floating background pizzas ---------------- */
  (function floaters() {
    if (reduceMotion) return;
    const box = $('#floaters');
    const icons = ['🍕', '🍅', '🧀', '🌿', '🍕', '🫒'];
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.className = 'floater';
      s.textContent = icons[i % icons.length];
      const dur = 16 + Math.random() * 20;
      s.style.left = Math.random() * 100 + '%';
      s.style.fontSize = 20 + Math.random() * 26 + 'px';
      s.style.animationDuration = dur + 's';
      s.style.animationDelay = -Math.random() * dur + 's';
      box.appendChild(s);
    }
  })();

  /* ---------------- Pizza stepper ---------------- */
  const NS = 'http://www.w3.org/2000/svg';
  const SLICES = 7;
  const SLICE_DEG = 360 / SLICES;
  const pizzaHost = $('#pizza');
  const pizzaWrap = $('#pizza-wrap');
  let eatenCount = 0;

  function el(tag, attrs) {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }
  function polar(r, deg) {
    const t = ((deg - 90) * Math.PI) / 180;
    return [+(100 + r * Math.cos(t)).toFixed(2), +(100 + r * Math.sin(t)).toFixed(2)];
  }

  function buildPizza() {
    const svg = el('svg', {
      viewBox: '0 0 200 200',
      role: 'img',
      'aria-label': 'A pizza that is eaten slice by slice as you fill in the form'
    });
    svg.appendChild(el('circle', { cx: 100, cy: 100, r: 98, fill: '#FFF8EA', stroke: '#3F5B3A', 'stroke-width': 1.5 }));
    svg.appendChild(el('circle', { cx: 100, cy: 100, r: 92, fill: 'none', stroke: '#3F5B3A', 'stroke-opacity': 0.3 }));

    for (let i = 0; i < SLICES; i++) {
      const a0 = i * SLICE_DEG + 1.5;
      const a1 = (i + 1) * SLICE_DEG - 1.5;
      const mid = i * SLICE_DEG + SLICE_DEG / 2;
      const g = el('g', { class: 'slice' });

      // Cheese wedge
      const [x0, y0] = polar(78, a0);
      const [x1, y1] = polar(78, a1);
      g.appendChild(el('path', {
        d: `M100 100L${x0} ${y0}A78 78 0 0 1 ${x1} ${y1}Z`,
        fill: '#F2C14E', stroke: '#D9A02B', 'stroke-width': 1
      }));
      // Tomato glaze near the crust
      const [s0x, s0y] = polar(70, a0 + 3);
      const [s1x, s1y] = polar(70, a1 - 3);
      g.appendChild(el('path', {
        d: `M${s0x} ${s0y}A70 70 0 0 1 ${s1x} ${s1y}`,
        fill: 'none', stroke: '#D8503F', 'stroke-opacity': 0.55, 'stroke-width': 5, 'stroke-linecap': 'round'
      }));
      // Crust
      const [c0x, c0y] = polar(84, a0 + 2);
      const [c1x, c1y] = polar(84, a1 - 2);
      g.appendChild(el('path', {
        d: `M${c0x} ${c0y}A84 84 0 0 1 ${c1x} ${c1y}`,
        fill: 'none', stroke: '#C98B4B', 'stroke-width': 9, 'stroke-linecap': 'round'
      }));
      // Pepperoni
      const [p1x, p1y] = polar(50, mid - 7);
      g.appendChild(el('circle', { cx: p1x, cy: p1y, r: 9.5, fill: '#A92F22' }));
      g.appendChild(el('circle', { cx: p1x - 2.5, cy: p1y - 2.5, r: 2.2, fill: '#F6EBD6', 'fill-opacity': 0.35 }));
      const [p2x, p2y] = polar(30, mid + 9);
      g.appendChild(el('circle', { cx: p2x, cy: p2y, r: 6.5, fill: '#A92F22' }));
      // Basil leaf
      const [bx, by] = polar(64, mid + 11);
      g.appendChild(el('ellipse', {
        cx: bx, cy: by, rx: 6.5, ry: 3.1, fill: '#3F5B3A',
        transform: `rotate(${mid + 11 - 90} ${bx} ${by})`
      }));

      // Direction the slice flies when eaten
      const ang = ((mid - 90) * Math.PI) / 180;
      g.style.setProperty('--dx', (Math.cos(ang) * 120).toFixed(1) + 'px');
      g.style.setProperty('--dy', (Math.sin(ang) * 120).toFixed(1) + 'px');
      g.style.setProperty('--rot', (i % 2 ? 28 : -28) + 'deg');
      g.style.transitionDelay = '0s';
      svg.appendChild(g);
    }
    pizzaHost.appendChild(svg);
  }

  const noms = ['nom', 'yum', 'mmm', 'mamma mia', 'delizioso', 'bellissimo'];
  function nom() {
    if (reduceMotion) return;
    const n = document.createElement('span');
    n.className = 'nom';
    n.textContent = noms[Math.floor(Math.random() * noms.length)];
    pizzaWrap.appendChild(n);
    setTimeout(() => n.remove(), 1100);
  }

  function setEaten(n) {
    const slices = $$('.slice', pizzaHost);
    slices.forEach((s, i) => {
      s.classList.toggle('eaten', i < n);
      // stagger when several go at once
      s.style.transitionDelay = i < n && i >= eatenCount ? (i - eatenCount) * 0.18 + 's' : '0s';
    });
    if (n > eatenCount) {
      pizzaWrap.classList.remove('chomp');
      void pizzaWrap.offsetWidth;
      pizzaWrap.classList.add('chomp');
      nom();
    }
    eatenCount = n;
  }

  buildPizza();

  /* ---------------- Multi-step form ---------------- */
  const ORDER = ['name', 'email', 'phone', 'plus', 'plusDetails', 'notes', 'review'];
  const form = $('#rsvp-form');
  const errorBox = $('#error');
  const nextBtn = $('#next-btn');
  const backBtn = $('#back-btn');
  const stepCount = $('#step-count');

  const path = () => ORDER.filter((k) => k !== 'plusDetails' || state.plus === 'yes');
  const val = (id) => $(id).value.trim();

  function renderStep(dir, animate = true) {
    form.dataset.dir = dir;
    $$('.step', form).forEach((s) => s.classList.toggle('is-active', s.dataset.step === state.current));
    const p = path();
    stepCount.textContent = `Step ${p.indexOf(state.current) + 1} of ${p.length}`;
    errorBox.textContent = '';
    const last = state.current === 'review';
    nextBtn.textContent = last ? 'Send RSVP' : 'Continue';
    nextBtn.disabled = false;
    if (last) buildReview();
    // The pizza loses a slice for each step completed (two at once if the plus 1 step is skipped)
    setEaten(ORDER.indexOf(state.current));
  }

  const NAME_RE = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F .'\u2019-]*$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_CHARS_RE = /^[+\d\s()-]+$/;

  function nameError(v, who) {
    if (!v) return who === 'you' ? 'Please enter your name.' : "Please enter your plus 1's name.";
    if (v.length < 2 || !NAME_RE.test(v)) return 'Use letters only (spaces, . \' and - are fine), at least 2 of them. Example: Priya Shah.';
    return '';
  }
  function phoneError(v, who, optional) {
    if (!v) return optional ? '' : 'Please enter your phone number.';
    const mine = who === 'you' ? 'Your' : "Your plus 1's";
    if (!PHONE_CHARS_RE.test(v)) return mine + ' number can only use digits, spaces, + ( ) and -.';
    const digits = v.replace(/\D/g, '').length;
    if (digits < 10 || digits > 15) return 'Enter 10 to 15 digits, like +91 98765 43210.';
    return '';
  }
  function emailError(v) {
    if (!v) return 'Please enter your email so we can send you the invite.';
    if (v.length > 120 || !EMAIL_RE.test(v)) return "That email doesn't look right. Try something like name@example.com.";
    return '';
  }

  // Returns a list of { sel, msg } problems for the step (empty list = valid)
  function validate(step) {
    const problems = [];
    const add = (sel, msg) => { if (msg) problems.push({ sel, msg }); };
    if (step === 'name') add('#f-name', nameError(val('#f-name'), 'you'));
    if (step === 'email') add('#f-email', emailError(val('#f-email')));
    if (step === 'phone') add('#f-phone', phoneError(val('#f-phone'), 'you', false));
    if (step === 'plus' && !state.plus) add('.choices', 'Please choose "Yes, we\'ll be two" or "Just me".');
    if (step === 'plusDetails') {
      add('#f-pname', nameError(val('#f-pname'), 'plus'));
      add('#f-pphone', phoneError(val('#f-pphone'), 'plus', true));
      if (val('#f-pnotes').length > 200) add('#f-pnotes', 'Please keep the notes under 200 characters.');
    }
    if (step === 'notes' && val('#f-notes').length > 400) add('#f-notes', 'Please keep your notes under 400 characters.');
    return problems;
  }

  function flagErrors(problems) {
    $$('.invalid', form).forEach((n) => { n.classList.remove('invalid'); n.removeAttribute('aria-invalid'); });
    errorBox.textContent = problems[0].msg;
    problems.forEach(({ sel }) => {
      const t = $(sel);
      if (!t) return;
      t.classList.add('invalid');
      if (t.tagName !== 'DIV') t.setAttribute('aria-invalid', 'true');
      t.classList.remove('shake');
      void t.offsetWidth;
      t.classList.add('shake');
    });
    const first = $(problems[0].sel);
    if (first && first.focus && first.tagName !== 'DIV') first.focus();
  }

  // Clear the red state as soon as the guest starts fixing it
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.classList) t.classList.remove('invalid');
    if (t.removeAttribute) t.removeAttribute('aria-invalid');
    if (t.name === 'plus') $('.choices').classList.remove('invalid');
    errorBox.textContent = '';
  });

  function go(dir) {
    const p = path();
    const i = p.indexOf(state.current);
    if (dir === 'back') {
      if (i === 0) { history.pushState(null, '', location.pathname + location.search); route(); return; }
      state.current = p[i - 1];
    } else {
      state.current = p[i + 1];
    }
    renderStep(dir);
    if (state.current !== 'plus' && state.current !== 'review') {
      const f = $('.step.is-active input, .step.is-active textarea');
      if (f) setTimeout(() => f.focus({ preventScroll: true }), 120);
    }
  }

  $$('input[name="plus"]').forEach((r) => {
    r.addEventListener('change', () => {
      state.plus = r.value;
      errorBox.textContent = '';
      const n = $('.step.is-active .count');
      if (n) n.textContent = '';
      const p = path();
      stepCount.textContent = `Step ${p.indexOf(state.current) + 1} of ${p.length}`;
    });
  });

  backBtn.addEventListener('click', () => go('back'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (nextBtn.disabled) return;
    const problems = validate(state.current);
    if (problems.length) { flagErrors(problems); return; }
    if (state.current === 'review') { submit(); return; }
    go('forward');
  });

  function buildReview() {
    const dl = $('#review');
    dl.textContent = '';
    const rows = [['Name', val('#f-name')], ['Email', val('#f-email')], ['Phone', val('#f-phone')]];
    if (state.plus === 'yes') {
      rows.push(['Plus 1', val('#f-pname')]);
      if (val('#f-pphone')) rows.push(['Plus 1 phone', val('#f-pphone')]);
      if (val('#f-pnotes')) rows.push(['Plus 1 notes', val('#f-pnotes')]);
    } else {
      rows.push(['Plus 1', 'Just me']);
    }
    rows.push(['Allergies or notes', val('#f-notes') || 'None']);
    rows.forEach(([k, v]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = k;
      dd.textContent = v;
      row.append(dt, dd);
      dl.appendChild(row);
    });
  }

  async function submit() {
    nextBtn.disabled = true;
    backBtn.disabled = true;
    nextBtn.textContent = 'Sending...';
    errorBox.textContent = '';

    const plus = state.plus === 'yes';
    const payload = {
      name: val('#f-name'),
      email: val('#f-email'),
      phone: val('#f-phone'),
      plusOne: plus,
      plusOneName: plus ? val('#f-pname') : '',
      plusOnePhone: plus ? val('#f-pphone') : '',
      plusOneNotes: plus ? val('#f-pnotes') : '',
      notes: val('#f-notes'),
      website: $('#f-gotcha').value // honeypot: real guests leave this empty
    };

    try {
      if (payload.website) {
        await sleep(600); // a bot filled the hidden field: pretend it worked
      } else if (demoMode) {
        await sleep(900);
        console.warn('Preview mode: add your Apps Script URL to MAIL.scriptUrl in app.js to send emails.');
      } else {
        // text/plain keeps this a "simple" request, so the browser skips the CORS preflight
        const res = await fetch(MAIL.scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const out = await res.json();
        if (!out.ok) {
          const err = new Error(out.error || 'Mailer refused the request');
          err.userMessage = out.error;
          throw err;
        }
      }
    } catch (err) {
      console.error(err);
      errorBox.textContent = err.userMessage || "That didn't send. Check your connection and press Send RSVP again.";
      nextBtn.disabled = false;
      backBtn.disabled = false;
      nextBtn.textContent = 'Send RSVP';
      return;
    }

    // Success: eat the last slice, then celebrate
    state.submitted = true;
    setEaten(SLICES);
    await sleep(reduceMotion ? 0 : 1100);

    $('#done-name').textContent = payload.name.split(/\s+/)[0];
    $('#done-sub').innerHTML = plus
      ? 'Table set for two.<br>Saturday, the tenth of October, half past seven.'
      : 'Saturday, the tenth of October<br>half past seven in the evening';
    $('#done-mail').textContent = demoMode ? '' : `Your invite and calendar file are on their way to ${payload.email}.`;
    $('#demo-note').hidden = !demoMode;
    show('done');
    confettiShow();
  }

  /* ---------------- Calendar + extra confetti ---------------- */
  $('#cal-btn').addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//october-10//RSVP//EN',
      'BEGIN:VEVENT',
      'UID:october-10@aagamsheth.com',
      'DTSTAMP:20261006T000000Z',
      'DTSTART:' + EVENT.startUtc,
      'DTEND:' + EVENT.endUtc,
      "SUMMARY:Aagam's Birthday Dinner: Pizza Tasting Ceremony",
      'LOCATION:KS Charcoal',
      'DESCRIPTION:Map: ' + EVENT.mapUrl,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aagams-birthday-dinner.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
  $('#again-btn').addEventListener('click', confettiShow);
  $('#emblem').addEventListener('click', (e) => miniBurst(e.clientX, e.clientY));

  /* ---------------- Confetti ---------------- */
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let running = false;
  let W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#7E241A', '#3F5B3A', '#C98B4B', '#F2C14E', '#D8503F', '#FFF8EA'];
  const emojis = ['🍕', '🍕', '🍅', '🧀', '🌿'];
  const rand = (a, b) => a + Math.random() * (b - a);

  function makeParticle(x, y, vx, vy) {
    const emoji = Math.random() < 0.34;
    return {
      x, y, vx, vy,
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.25, 0.25),
      size: emoji ? rand(20, 34) : rand(7, 13),
      kind: emoji ? 'emoji' : (Math.random() < 0.3 ? 'dot' : 'rect'),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      wob: rand(0, Math.PI * 2),
      drag: rand(0.985, 0.995)
    };
  }

  function cannon(x, y, angleDeg, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = ((angleDeg + rand(-24, 24)) * Math.PI) / 180;
      const s = rand(speed * 0.45, speed);
      particles.push(makeParticle(x, y, Math.cos(a) * s, -Math.sin(a) * s));
    }
  }

  function rain(count) {
    for (let i = 0; i < count; i++) {
      particles.push(makeParticle(rand(0, W), rand(-H * 0.25, -20), rand(-1.2, 1.2), rand(1.5, 4)));
    }
  }

  function confettiShow() {
    if (reduceMotion) return;
    const power = Math.max(14, Math.min(H / 38, 26));
    cannon(W * 0.04, H + 10, 62, 90, power);
    cannon(W * 0.96, H + 10, 118, 90, power);
    setTimeout(() => cannon(W * 0.5, H + 10, 90, 70, power * 1.1), 350);
    setTimeout(() => rain(70), 700);
    setTimeout(() => rain(50), 1500);
    start();
  }

  function miniBurst(x, y) {
    if (reduceMotion) return;
    for (let i = 0; i < 26; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(3, 9);
      particles.push(makeParticle(x, y, Math.cos(a) * s, Math.sin(a) * s - 3));
    }
    start();
  }

  function start() {
    if (running) return;
    running = true;
    let last = performance.now();
    (function frame(now) {
      const dt = Math.min(2.2, (now - last) / 16.67);
      last = now;
      ctx.clearRect(0, 0, W, H);
      particles = particles.filter((p) => p.y < H + 80 && p.x > -120 && p.x < W + 120);
      for (const p of particles) {
        p.vy += 0.34 * dt;
        p.vx *= Math.pow(p.drag, dt);
        p.vy *= Math.pow(p.drag, dt);
        p.wob += 0.08 * dt;
        p.x += (p.vx + Math.sin(p.wob) * 0.6) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.kind === 'emoji') {
          ctx.font = p.size + 'px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
        } else if (p.kind === 'dot') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.scale(1, Math.abs(Math.cos(p.wob)) * 0.8 + 0.2); // flutter
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (particles.length) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        running = false;
      }
    })(last);
  }

  /* ---------------- Go ---------------- */
  route();
})();
