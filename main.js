/**
 * THE DIGITAL COMEDY — main.js
 *
 * All interactive mechanics for the entire project, vanilla JS,
 * no dependencies. Wrapped in an IIFE so nothing leaks to the
 * global scope.
 *
 * STRUCTURE OF THIS FILE:
 *   0.  Shared utilities
 *   1.  HELL
 *       1.1  Gate (no-op — design TBD)
 *       1.2  Circle 1 — Limbo: dead affordances
 *       1.3  Circle 2 — Lust: sensory assault
 *       1.4  Circle 3 — Gluttony: stacked cycling modals
 *       1.5  Circle 4 — Greed: unsubscribe gauntlet
 *       1.6  Circle 5 — Wrath: hostile UX
 *       1.7  Circle 6 — Heresy: nesting clickbait
 *       1.8  Circle 7 — Violence: real-time fingerprinting
 *       1.9  Circle 8 — Fraud: six concurrent mechanics
 *       1.10 Circle 9 — Treachery: accumulating dashboard
 *   2.  THE INVERSION — scroll direction reversal
 *   3.  PURGATORY
 *       3.1  Mountain progress indicator
 *       3.2  Terrace 6 — responsive demonstration
 *       3.3  Terrace 7 — mirror observation layer
 *       3.4  Wall of Fire — hold mechanic
 *   4.  HEAVEN
 *       4.1  Sphere orbital approach
 *       4.2  Sphere navigator
 *       4.3  Empyrean blinking cursor
 *   5.  Init
 */

(() => {
  'use strict';


  /* ==================================================================
     0. SHARED UTILITIES
     ================================================================== */

  // Helper: short alias for querySelector.
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Helper: respect prefers-reduced-motion.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ==================================================================
     1.1  THE GATE — placeholder (your design)

     Currently no JS. When you're ready to add the entry animation,
     this is where the panel-opening trigger and timing logic go.
     ================================================================== */

  function initGate() {
    // Intentionally empty — design TBD.
    // To activate: add gate.classList.add('is-opening') after a delay,
    //              then gate.classList.add('is-passed') after the
    //              transition completes (so off-screen panels can't
    //              intercept clicks).
  }


  /* ==================================================================
     1.2  CIRCLE 1 — LIMBO
     "The ghost of interactivity. Things look clickable but do not work."

     All anchors and buttons inside .circle--limbo have their default
     activation suppressed. Cursor affordance (pointer on hover) is a
     CSS concern. Forms accept input and silently clear on submit.
     ================================================================== */

  function initLimbo() {
    const limbo = $('.circle--limbo');
    if (!limbo) return;

    // Suppress all link / button activations within Limbo.
    // Event delegation: one listener handles everything inside.
    limbo.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      const button = e.target.closest('button');
      if (link || (button && button.type !== 'submit')) {
        e.preventDefault();
      }
    });

    // Forms accept input and silently clear — no error, no success.
    $$('form', limbo).forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        $$('input, textarea', form).forEach((field) => { field.value = ''; });
      });
    });
  }


  /* ==================================================================
     1.3  CIRCLE 2 — LUST: SENSORY ASSAULT
     "Multiple stimuli simultaneously. The off switch is unfindable."

     We START all the chaos when the circle scrolls into view. We
     never STOP it. There is no off switch. Browsers may block
     autoplay audio — we attempt anyway and don't worry about failure.
     ================================================================== */

  function initLust() {
    const lust = $('.circle--lust');
    if (!lust) return;

    let started = false;

    // Use IntersectionObserver to detect when the circle enters view.
    // IntersectionObserver fires callbacks when an observed element
    // crosses a visibility threshold relative to the viewport.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          startChaos();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(lust);

    function startChaos() {
      // Attempt to play any <audio> or <video> elements scoped to
      // this circle. .play() returns a Promise that may reject if
      // the browser blocks autoplay; we swallow the rejection
      // because the chaos that DOES start is plenty.
      $$('audio, video', lust).forEach((media) => {
        media.play().catch(() => {});
      });

      // Add a state class so CSS can fire any animations/marquees/
      // tiled-GIF backgrounds you've chosen to gate on this state.
      lust.classList.add('is-assaulting');

      // Marquee elements: the <marquee> tag is deprecated but still
      // works in browsers. If you'd rather use CSS-driven scrolling
      // text, that's purely a CSS concern — leave the markup as-is.
    }
  }


  /* ==================================================================
     1.4  CIRCLE 3 — GLUTTONY: STACKED CYCLING MODALS
     "Cookie consent on newsletter on chat widget on notification
      request, cycling again."

     Modals appear in order. Each new one stacks on top. After all
     have appeared, they reset and begin again. Content beneath is
     briefly visible between cycles.
     ================================================================== */

  function initGluttony() {
    const gluttony = $('.circle--gluttony');
    if (!gluttony) return;

    const modals = $$('.modal', gluttony);
    if (modals.length === 0) return;

    let started = false;
    let activeIndex = -1;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          startCycle();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(gluttony);

    function startCycle() {
      // Each modal appears 1.5s after the previous one. After the
      // last appears and lingers, all reset; cycle restarts after
      // a brief gap during which the underlying content is visible.
      activeIndex = -1;
      stackNext();
    }

    function stackNext() {
      activeIndex++;
      if (activeIndex < modals.length) {
        modals[activeIndex].classList.add('is-active');
        setTimeout(stackNext, 1500);
      } else {
        // All stacked — pause, then clear all and restart.
        setTimeout(() => {
          modals.forEach((m) => m.classList.remove('is-active'));
          // Brief gap during which content beneath is visible.
          setTimeout(startCycle, 1200);
        }, 2500);
      }
    }

    // The X / close buttons inside modals: clicking them advances to
    // the next, but never permanently dismisses. They don't have to
    // do nothing — they just don't escape the cycle.
    $$('.modal-close', gluttony).forEach((closeBtn) => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) modal.classList.remove('is-active');
        // Cycle continues independently — closing a modal does not
        // stop the next from appearing.
      });
    });
  }


  /* ==================================================================
     1.5  CIRCLE 4 — GREED: UNSUBSCRIBE GAUNTLET
     "Pre-checked re-subscribe boxes, 'confirm cancellation' that
      confirms continuation. The verdict appears AFTER the user
      gives up — not at a fixed time."

     We track "exhaustion": the user has clicked through enough
     gauntlet steps to demonstrate they tried, OR they have spent
     enough time bouncing between the deceptive controls. When
     exhaustion is reached, we reveal the verdict.
     ================================================================== */

  function initGreed() {
    const greed = $('.circle--greed');
    if (!greed) return;

    let interactionCount = 0;
    const exhaustionThreshold = 6; // any 6 distinct gauntlet interactions
    let revealed = false;

    function tally() {
      if (revealed) return;
      interactionCount++;
      if (interactionCount >= exhaustionThreshold) {
        revealVerdict();
      }
    }

    // Every gauntlet form, button, and checkbox counts as one
    // exhaustion tick. We watch for any interaction inside the
    // circle that isn't simply scrolling.
    greed.addEventListener('click', (e) => {
      // Form submissions (the "confirm" / "cancel" / "continue" buttons)
      // are intercepted here. We DO NOT actually unsubscribe — every
      // path leads back into the gauntlet.
      const button = e.target.closest('button, input[type="submit"]');
      if (button) {
        e.preventDefault();
        tally();
        cycleGauntlet();
        return;
      }
      // Checkbox toggles count too. Pre-checked re-subscribe boxes
      // re-check themselves shortly after being unchecked.
      const checkbox = e.target.closest('input[type="checkbox"]');
      if (checkbox) {
        tally();
        // After 800ms, the box reasserts its preferred state.
        // (Pre-checked boxes have data-prefer="true".)
        if (checkbox.dataset.prefer === 'true') {
          setTimeout(() => { checkbox.checked = true; }, 800);
        }
      }
    });

    // Submitting any form within Greed cycles to the next gauntlet
    // step rather than completing.
    $$('form', greed).forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        tally();
        cycleGauntlet();
      });
    });

    function cycleGauntlet() {
      // Move through gauntlet steps: each .gauntlet-step is a phase.
      // Reaching the "final" step loops back to the start.
      const steps = $$('.gauntlet-step', greed);
      const currentIdx = steps.findIndex((s) => s.classList.contains('is-active'));
      const nextIdx = (currentIdx + 1) % steps.length;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === nextIdx));
    }

    function revealVerdict() {
      revealed = true;
      const verdict = $('.verdict', greed);
      if (verdict) verdict.classList.add('is-revealed');
    }

    // Initialize: first step is active.
    const steps = $$('.gauntlet-step', greed);
    if (steps.length > 0) steps[0].classList.add('is-active');
  }


  /* ==================================================================
     1.6  CIRCLE 5 — WRATH: HOSTILE UX
     "Form clears on submit with no explanation. CAPTCHA fails. Back
      button loops."

     Three concurrent mechanics:
       (a) The form: submit clears all fields, shows error with no
           specifics, and remains in error state.
       (b) The CAPTCHA: clicking "I'm not a robot" fails after a
           pause with no reason, then resets.
       (c) The back-button trap: clicking the in-page "back" button
           scrolls the user further INTO Wrath, not out.
     ================================================================== */

  function initWrath() {
    const wrath = $('.circle--wrath');
    if (!wrath) return;

    // (a) Form: clears fields on submit and toggles error state.
    const form = $('.wrath-form', wrath);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Clear every input and textarea.
        $$('input, textarea', form).forEach((field) => { field.value = ''; });
        // Toggle error state. Error appears with no specifics.
        form.classList.add('has-error');
      });
    }

    // (b) CAPTCHA: thinks for 1.5s, then fails. Then resets after
    //     another delay. The cycle never resolves successfully.
    const captcha = $('.wrath-captcha', wrath);
    if (captcha) {
      const checkbox = $('.wrath-captcha-check', captcha);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          if (!checkbox.checked) return;
          captcha.classList.add('is-checking');
          setTimeout(() => {
            captcha.classList.remove('is-checking');
            captcha.classList.add('has-failed');
            checkbox.checked = false;
            // Reset state after a beat so the user can try again.
            setTimeout(() => { captcha.classList.remove('has-failed'); }, 2500);
          }, 1500);
        });
      }
    }

    // (c) Back button trap: clicking the in-page "back" button
    //     scrolls further DOWN into the wrath section, not back
    //     out of it.
    $$('.wrath-back-button', wrath).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = $('.wrath-trap-target', wrath);
        if (target) {
          target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });
  }


  /* ==================================================================
     1.7  CIRCLE 6 — HERESY: NESTING CLICKBAIT
     "Each click delivers another layer of clickbait, none of which
      deliver. Infinite regress of false promise."

     Implementation: clickbait headlines are <a> elements that, when
     clicked, replace the article body with another set of clickbait
     headlines (all promising revelation, none delivering). A counter
     tracks descent depth. After enough layers, the verdict
     ("This was never the article.") appears in the article body.
     ================================================================== */

  function initHeresy() {
    const heresy = $('.circle--heresy');
    if (!heresy) return;

    const target = $('.heresy-article', heresy);
    if (!target) return;

    // Pool of clickbait headlines. Each click swaps the article body
    // for a new randomized set drawn from this pool.
    const headlines = [
      'She Asked One Simple Question. The Internet Has Not Recovered.',
      'Scientists CONFIRM What Your Doctor Never Told You.',
      'This Man Lost Everything. What He Found Instead Will Change How You Think About Everything.',
      'You Won\u2019t Believe What Happens At The 4 Minute Mark.',
      'Doctors Hate This Simple Trick.',
      '14 Photos That Will Make You Question Reality.',
      'The Truth About What\u2019s Really In Your Pantry.',
      'This Couple Tried Something Strange. The Result Will Shock You.',
      'Page 7 Will Blow Your Mind.',
      'Warning: Emotional.',
      'Experts Are STUNNED By This Local Discovery.',
      'What Happened Next Defies All Explanation.'
    ];

    let depth = 0;
    const verdictDepth = 4; // verdict appears after 4 clicks of regress

    function renderLayer() {
      // Pick 5 random headlines for this layer. Each is a link that,
      // when clicked, recurses one level deeper.
      const picks = [];
      const pool = [...headlines];
      for (let i = 0; i < 5 && pool.length > 0; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        picks.push(pool.splice(idx, 1)[0]);
      }

      if (depth >= verdictDepth) {
        // Verdict layer — flat, no decoration.
        target.innerHTML = '<p class="heresy-verdict">This was never the article.</p>';
        return;
      }

      // Each list item is a link to the next layer.
      const html = '<ul class="heresy-list">' +
        picks.map((h) => `<li><a href="#" class="heresy-link">${h}</a></li>`).join('') +
        '</ul>';
      target.innerHTML = html;

      // Bind the new links.
      $$('.heresy-link', target).forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          depth++;
          renderLayer();
        });
      });
    }

    renderLayer();
  }


  /* ==================================================================
     1.8  CIRCLE 7 — VIOLENCE: SURVEILLANCE
     "Trackers named, fingerprint assembled in real time. Explicitly
      noted as the visible portion only. The rest is still running."

     We assemble a fingerprint from ACTUAL browser APIs. None of this
     leaves the user's device — it's all client-side, stored nowhere.
     The horror is that the data IS available, not that we transmit it.

     Items appear one by one as if being collected. At the end, a
     note is added: "Visible items: 27 of [REDACTED]. The rest is
     still running."
     ================================================================== */

  function initViolence() {
    const violence = $('.circle--violence');
    if (!violence) return;

    const list = $('.violence-tracker-list', violence);
    if (!list) return;

    let started = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          collectFingerprint();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(violence);

    function collectFingerprint() {
      // Each entry is a real piece of data the browser exposes by
      // default to any page. The point of this circle: this list is
      // partial, and the partial-ness itself is the argument.
      const items = [
        () => `User-Agent: ${navigator.userAgent}`,
        () => `Platform: ${navigator.platform}`,
        () => `Language: ${navigator.language}`,
        () => `Languages: ${(navigator.languages || []).join(', ')}`,
        () => `Screen: ${screen.width} \u00d7 ${screen.height} (${screen.colorDepth}-bit)`,
        () => `Viewport: ${window.innerWidth} \u00d7 ${window.innerHeight}`,
        () => `Device pixel ratio: ${window.devicePixelRatio}`,
        () => `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        () => `Timezone offset: ${new Date().getTimezoneOffset()} minutes`,
        () => `Cookies enabled: ${navigator.cookieEnabled}`,
        () => `Do Not Track: ${navigator.doNotTrack || 'not set'}`,
        () => `CPU cores: ${navigator.hardwareConcurrency || 'unknown'}`,
        () => `Device memory: ${navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'unknown'}`,
        () => `Touch points: ${navigator.maxTouchPoints}`,
        () => `Online: ${navigator.onLine}`,
        () => `Connection: ${navigator.connection ? (navigator.connection.effectiveType || 'unknown') : 'unknown'}`,
        () => `Battery API: ${'getBattery' in navigator ? 'available' : 'not available'}`,
        () => `Local storage: ${typeof localStorage !== 'undefined' ? 'available' : 'unavailable'}`,
        () => `Session storage: ${typeof sessionStorage !== 'undefined' ? 'available' : 'unavailable'}`,
        () => `IndexedDB: ${'indexedDB' in window ? 'available' : 'unavailable'}`,
        () => `Service Worker: ${'serviceWorker' in navigator ? 'available' : 'unavailable'}`,
        () => `WebGL: ${detectWebGL()}`,
        () => `Canvas fingerprint hash: ${canvasHash()}`,
        () => `Page entered at: ${new Date().toISOString()}`,
        () => `Time on page so far: ${Math.round(performance.now() / 1000)}s`,
        () => `Referrer: ${document.referrer || '(none)'}`,
        () => `Plugins detected: ${(navigator.plugins && navigator.plugins.length) || 0}`,
      ];

      // Helpers used inside the items array above.
      function detectWebGL() {
        try {
          const c = document.createElement('canvas');
          const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
          if (!gl) return 'unavailable';
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'available';
        } catch (e) { return 'unavailable'; }
      }

      function canvasHash() {
        // A simplified canvas fingerprint: render some text and hash
        // the resulting pixel data. Different GPUs / font rendering
        // engines produce different hashes. This is a real
        // fingerprinting technique used in the wild.
        try {
          const c = document.createElement('canvas');
          c.width = 200; c.height = 50;
          const ctx = c.getContext('2d');
          ctx.textBaseline = 'top';
          ctx.font = '14px Arial';
          ctx.fillStyle = '#f60';
          ctx.fillRect(0, 0, 100, 25);
          ctx.fillStyle = '#069';
          ctx.fillText('fingerprint', 2, 15);
          const data = c.toDataURL();
          // Simple hash of the data URL.
          let hash = 0;
          for (let i = 0; i < data.length; i++) {
            hash = ((hash << 5) - hash) + data.charCodeAt(i);
            hash |= 0;
          }
          return hash.toString(16);
        } catch (e) { return 'blocked'; }
      }

      // Stagger item appearance so the list builds visibly.
      items.forEach((getItem, i) => {
        setTimeout(() => {
          const li = document.createElement('li');
          li.className = 'violence-item';
          li.textContent = getItem();
          list.appendChild(li);
        }, i * 220);
      });

      // After all items appear, add the partial-ness note.
      setTimeout(() => {
        const note = $('.violence-partial-note', violence);
        if (note) note.classList.add('is-revealed');
      }, items.length * 220 + 600);
    }
  }


  /* ==================================================================
     1.9  CIRCLE 8 — FRAUD: SIX CONCURRENT MECHANICS
     Per Design Strategy 3.3, all six operate simultaneously:
       1. Countdown timer that "extends" when it hits zero
       2. Social proof ticker (random names, "2 seconds ago")
       3. Scarcity signals that never decrement
       4. Stock-photo testimonials (static, but listed)
       5. Automated chat that opens unprompted
       6. Exit interception when user reaches near the bottom
     ================================================================== */

  function initFraud() {
    const fraud = $('.circle--fraud');
    if (!fraud) return;

    let started = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          startAllSix();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(fraud);

    function startAllSix() {
      startCountdown();
      startSocialProof();
      // Scarcity signals are static in the HTML; nothing to start.
      // Testimonials are static in the HTML.
      scheduleAutomatedChat();
      armExitInterception();
    }

    // ---- 1. Countdown timer ---------------------------------------
    function startCountdown() {
      const timer = $('.fraud-countdown', fraud);
      if (!timer) return;
      let total = 14 * 60 + 37; // 14:37
      const tick = () => {
        const m = String(Math.floor(total / 60)).padStart(2, '0');
        const s = String(total % 60).padStart(2, '0');
        timer.textContent = `${m}:${s}`;
        total--;
        if (total < 0) {
          // Reset and announce extension.
          total = 14 * 60 + 37;
          const extNote = $('.fraud-countdown-extension', fraud);
          if (extNote) {
            extNote.classList.add('is-shown');
            setTimeout(() => extNote.classList.remove('is-shown'), 4000);
          }
        }
      };
      tick();
      setInterval(tick, 1000);
    }

    // ---- 2. Social proof ticker -----------------------------------
    function startSocialProof() {
      const ticker = $('.fraud-social-proof', fraud);
      if (!ticker) return;

      const names = [
        'Jennifer R.', 'David K.', 'Sarah M.', 'Michael B.', 'Emily T.',
        'Robert P.', 'Jessica L.', 'Christopher H.', 'Ashley G.', 'Matthew W.',
        'Amanda S.', 'Joshua C.', 'Stephanie F.', 'Andrew N.', 'Nicole D.',
        'Daniel V.', 'Lauren A.', 'Ryan O.', 'Megan Y.', 'Brandon E.',
        'Heather Q.', 'Justin Z.', 'Rachel I.', 'Tyler U.', 'Brittany X.',
        'Kevin J.', 'Samantha M.', 'Eric R.', 'Crystal P.', 'Adam K.',
        'Melissa B.', 'Nathan H.', 'Kayla T.', 'Jeremy L.', 'Angela G.',
        'Patrick W.', 'Christina S.', 'Travis C.', 'Rebecca F.', 'Gregory N.',
        'Kimberly D.', 'Steven V.', 'Tiffany A.', 'Mark O.', 'Vanessa Y.',
        'Brian E.', 'Dana Q.', 'Jason Z.', 'Stacy I.', 'Aaron U.'
      ];
      const cities = [
        'Phoenix, AZ', 'Portland, OR', 'Austin, TX', 'Denver, CO',
        'Atlanta, GA', 'Seattle, WA', 'Miami, FL', 'Boston, MA',
        'Chicago, IL', 'Nashville, TN', 'Minneapolis, MN', 'Charlotte, NC'
      ];
      const actions = [
        'just secured their spot.',
        'just saved $847 using this method.',
        'is ALSO viewing this page.',
        'just unlocked their bonus.',
        'just claimed the offer.'
      ];

      let entries = [];

      function pushEntry() {
        const name = names[Math.floor(Math.random() * names.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const isWarning = Math.random() < 0.25;
        entries.unshift({
          name, city, action,
          isWarning,
          // Always "2 seconds ago" — the timestamp never changes.
          timestamp: '2 seconds ago'
        });
        if (entries.length > 5) entries = entries.slice(0, 5);
        render();
      }

      function render() {
        ticker.innerHTML = entries.map((e) => `
          <li class="fraud-social-proof-item${e.isWarning ? ' is-warning' : ''}">
            <span class="fraud-dot" aria-hidden="true">${e.isWarning ? '\u26A0' : '\u2022'}</span>
            <strong>${e.name}</strong> from ${e.city} ${e.action}
            <span class="fraud-timestamp">${e.timestamp}</span>
          </li>
        `).join('');
      }

      pushEntry();
      setInterval(pushEntry, 8000);
    }

    // ---- 5. Automated chat ----------------------------------------
    function scheduleAutomatedChat() {
      const chat = $('.fraud-chat', fraud);
      if (!chat) return;
      // Opens uninvited 12 seconds after the circle becomes active.
      setTimeout(() => { chat.classList.add('is-open'); }, 12000);

      // The chat input — whatever the user types, Melissa redirects.
      const input = $('.fraud-chat-input', chat);
      const log = $('.fraud-chat-log', chat);
      const form = $('.fraud-chat-form', chat);
      if (form && input && log) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const userText = input.value.trim();
          if (!userText) return;

          const userMsg = document.createElement('div');
          userMsg.className = 'fraud-chat-msg fraud-chat-msg--user';
          userMsg.textContent = userText;
          log.appendChild(userMsg);

          input.value = '';

          // "Melissa" responds after a typing delay.
          setTimeout(() => {
            const reply = document.createElement('div');
            reply.className = 'fraud-chat-msg fraud-chat-msg--bot';
            // If the user typed anything skeptical, Melissa redirects
            // to the offer specifically. Otherwise she also redirects
            // to the offer, but with different wording. Either way:
            // the offer.
            const skeptical = /\b(fake|fraud|scam|bot|automated|real|spam|stop|help|please)\b/i.test(userText);
            reply.textContent = skeptical
              ? 'I understand your hesitation! That\u2019s completely normal. The results speak for themselves \u2014 have you seen what our verified purchasers are saying? \u{1F447}'
              : 'That\u2019s a great question! Let me connect you with our exclusive offer right away \u2014 it\u2019s only available for visitors like you. \u{1F447}';
            log.appendChild(reply);
            log.scrollTop = log.scrollHeight;
          }, 1200);
        });
      }
    }

    // ---- 6. Exit interception -------------------------------------
    function armExitInterception() {
      const exitIntent = $('.fraud-exit-intent', fraud);
      if (!exitIntent) return;
      let triggered = false;

      // Intersection observer on a sentinel near the bottom of the
      // fraud section. When it becomes visible (user has scrolled
      // far enough that they're about to leave), we trigger.
      const sentinel = $('.fraud-exit-sentinel', fraud);
      if (!sentinel) return;

      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            triggered = true;
            exitIntent.classList.add('is-shown');
          }
        });
      }, { threshold: 0.5 });
      obs.observe(sentinel);
    }
  }


  /* ==================================================================
     1.10  CIRCLE 9 — TREACHERY: ACCUMULATING DASHBOARD

     Three layered behaviors:
       (a) Slow vignette already in CSS (no JS).
       (b) Data cards appear without invitation, accumulating slowly.
       (c) Color-temperature shift: a CSS variable
           (--treachery-temp) drifts from 0 to 1 over the duration
           the user is in the circle. CSS uses this however the
           designer wishes (mix-blend, hue rotation, color slot
           overrides, etc.).
     ================================================================== */

  function initTreachery() {
    const treachery = $('.circle--treachery');
    if (!treachery) return;

    let started = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          start();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(treachery);

    function start() {
      const cardSource = $('.treachery-card-source', treachery);
      const cardTarget = $('.treachery-card-grid', treachery);

      // The "card source" contains pre-written hidden cards (in HTML).
      // We move them one-by-one into the visible grid on a slow
      // schedule, without announcement.
      if (cardSource && cardTarget) {
        const cards = $$('.treachery-card', cardSource);
        cards.forEach((card, i) => {
          setTimeout(() => {
            cardTarget.appendChild(card);
            card.classList.add('is-visible');
          }, 4000 + i * 5000);
        });
      }

      // Color temperature drift over 90 seconds. CSS reads
      // --treachery-temp (range 0 to 1) and applies whatever
      // chromatic shift the designer chose.
      const start = performance.now();
      const duration = 90000;
      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        treachery.style.setProperty('--treachery-temp', t.toFixed(4));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  }


  /* ==================================================================
     2. THE INVERSION — rotation-based mechanic

     End-to-end:

       1. On load: history.scrollRestoration = 'manual', scroll to top.
          The user always begins at the Gate.

       2. The user scrolls down through Hell normally. No JS interception.

       3. We measure the pivot position (P) and wrapper height (H) at
          load and on resize. We set two CSS variables on the wrapper:
            --inversion-pivot-y = P     (rotation origin)
            --inversion-shift   = 2P-H  (translate to undo asymmetric
                                        shift caused by off-center pivot)

       4. The rotation triggers when the boundary between Hell and the
          ascent reaches viewport CENTER. The user's eyeline is on the
          conceptual pivot at that moment.

       5. On trigger:
            - Wrapper gets .is-inverted, firing the CSS rotation
              (180° around the pivot, plus translate compensation).
            - JS animates window scroll by (H - 2P) over the same
              duration as the rotation, anchoring the user to the
              boundary throughout the animation.

     All measurements come from runtime layout. No fixed pixel values.
     Works for any content size, any viewport, any device.
     ================================================================== */

  function initInversion() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    requestAnimationFrame(() => window.scrollTo(0, 0));

    const wrapper = document.getElementById('wrapper');
    const pivot = document.getElementById('pivot');
    if (!wrapper || !pivot) return;

    let state = 'pre';

    /* measureAndApply()
       P = pivot.offsetTop      — pivot's distance from wrapper top
       H = wrapper.offsetHeight — total wrapper height

       Sets:
         --inversion-pivot-y = P     (rotation origin)
         --inversion-shift   = 2P-H  (translate to undo asymmetric shift)

       Why 2P - H specifically:
         Rotating around the pivot, the wrapper's visible content moves
         from (0 to H) to (2P-H to 2P). To put it back at (0 to H), we
         translate by H - 2P in screen space. CSS translate happens
         AFTER rotation in the rotated coordinate system where +Y points
         up on screen, so we use translateY of 2P-H. */
    function measureAndApply() {
      const P = pivot.offsetTop;
      const H = wrapper.offsetHeight;
      wrapper.style.setProperty('--inversion-pivot-y', `${P}px`);
      wrapper.style.setProperty('--inversion-shift', `${2 * P - H}px`);
    }

    measureAndApply();
    window.addEventListener('resize', measureAndApply);

    /* RAF-driven smooth scroll. We use this rather than
       scrollTo({ behavior: 'smooth' }) because the native version's
       duration varies by browser and won't sync with our 1.4s CSS
       transition. */
    function animateScroll(targetY, duration) {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        window.scrollTo(0, startY + distance * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    /* trigger()
       Adds .is-inverted to fire the CSS rotation, simultaneously
       animating scroll by (H - 2P) — the inverse of the translate —
       so the user stays anchored to the boundary. */
    function trigger() {
      if (state !== 'pre') return;
      state = 'inverted';
      measureAndApply();

      const P = pivot.offsetTop;
      const H = wrapper.offsetHeight;
      const scrollTarget = window.scrollY + (H - 2 * P);

      wrapper.classList.add('is-inverted');
      animateScroll(scrollTarget, 1400);  // matches CSS transition

      // Also flag body for any downstream styling that wants to know
      // we're past the inversion (kept for parity with the previous
      // architecture's body class hooks).
      document.body.classList.add('is-inverted');
    }

    /* Trigger when scrollY puts the boundary at viewport center.
       Threshold: scrollY >= P - viewportHeight/2. */
    function onScroll() {
      if (state !== 'pre') return;
      const triggerThreshold = pivot.offsetTop - window.innerHeight / 2;
      if (window.scrollY >= triggerThreshold) trigger();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ==================================================================
     3.1  PURGATORY — MOUNTAIN PROGRESS INDICATOR

     A progress indicator visible only within Purgatory. Tracks which
     terrace is currently in view. Hidden in Hell and Heaven.
     ================================================================== */

  function initMountainIndicator() {
    const indicator = $('.mountain-indicator');
    if (!indicator) return;
    const purgatory = $('.purgatory');
    const terraces = $$('.terrace');

    // Show / hide based on Purgatory visibility.
    if (purgatory) {
      const purgObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          indicator.classList.toggle('is-visible', entry.isIntersecting);
        });
      }, { threshold: 0.05 });
      purgObs.observe(purgatory);
    }

    // Track which terrace is currently most in view. Update marker.
    if (terraces.length > 0) {
      const terraceObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const num = entry.target.dataset.terrace;
            if (num) {
              indicator.dataset.currentTerrace = num;
              indicator.style.setProperty('--current-terrace', num);
              // Update aria-live region so AT users hear position.
              const live = $('.mountain-indicator-live', indicator);
              if (live) live.textContent = `Currently on Terrace ${num} of 7`;
            }
          }
        });
      }, { threshold: 0.5 });
      terraces.forEach((t) => terraceObs.observe(t));
    }
  }


  /* ==================================================================
     3.2  TERRACE 6 — RESPONSIVE DEMONSTRATION

     The terrace's layout reflows as the viewport changes — but at
     EXAGGERATED scale, so the user can watch the breakpoints happen.
     We watch window resize and update a data attribute that CSS
     uses to drive the layout state.
     ================================================================== */

  function initTerrace6() {
    const t6 = $('.terrace--6');
    if (!t6) return;

    function updateBreakpoint() {
      const w = window.innerWidth;
      let state;
      if      (w < 480)  state = 'mobile';
      else if (w < 768)  state = 'tablet';
      else if (w < 1024) state = 'small-desktop';
      else               state = 'desktop';
      t6.dataset.viewportState = state;
      // Also expose viewport width as a CSS var so designers can
      // animate fluidly between breakpoints if desired.
      t6.style.setProperty('--viewport-width', w + 'px');
    }
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint, { passive: true });
  }


  /* ==================================================================
     3.3  TERRACE 7 — MIRROR OBSERVATION LAYER

     The most conceptually delicate JS in the project. As the user
     reads the optimization log, a parallel observation layer
     reports facts about their behavior — calculated ENTIRELY
     CLIENT-SIDE, transmitted nowhere. The argument: the same
     instrumentation the log describes is observing them, right now.

     Reported facts (per Design Strategy 4.3):
       - Time on this section
       - Scroll position within the terrace
       - Which entries have been read (entered viewport)
       - Pause near specific entries (especially Entry 010)
       - Whether the user has scrolled back

     Constraints (per docs):
       - Factual, not inferential
       - Client-side, no network requests
       - Finite — observations stop near the exit
     ================================================================== */

  function initTerrace7() {
    const t7 = $('.terrace--7');
    if (!t7) return;
    const mirror = $('.terrace-7-mirror', t7);
    if (!mirror) return;

    let firstVisibleAt = null;
    let entriesRead = new Set();
    let maxScrollDepth = 0;
    let hasScrolledBack = false;
    let observationsActive = true;
    let entry010PauseTime = 0;
    let entry010Visible = false;
    let entry010LastSeen = null;

    // Entry-level observer: which log entries have been viewed.
    const logEntries = $$('.log-entry', t7);
    const entryObserver = new IntersectionObserver((items) => {
      items.forEach((item) => {
        if (item.isIntersecting) {
          const id = item.target.dataset.entry;
          entriesRead.add(id);
          // Special handling for Entry 010 — measure pause time.
          if (id === '010') {
            entry010Visible = true;
            entry010LastSeen = performance.now();
          }
        } else {
          if (item.target.dataset.entry === '010' && entry010Visible) {
            entry010Visible = false;
            if (entry010LastSeen) {
              entry010PauseTime += (performance.now() - entry010LastSeen) / 1000;
              entry010LastSeen = null;
            }
          }
        }
      });
    }, { threshold: 0.6 });
    logEntries.forEach((e) => entryObserver.observe(e));

    // Section-level observer: when does T7 first become visible?
    // When does it stop being visible (so we can stop observing)?
    const sectionObserver = new IntersectionObserver((items) => {
      items.forEach((item) => {
        if (item.isIntersecting && firstVisibleAt === null) {
          firstVisibleAt = performance.now();
        }
        // If the terrace has fully exited the viewport (heading into
        // the Wall of Fire), stop observing per the doc's mandate
        // that observations are finite.
        if (!item.isIntersecting && firstVisibleAt !== null) {
          // Only stop if the user is below the section, not above.
          const rect = item.target.getBoundingClientRect();
          if (rect.bottom < 0) observationsActive = false;
        }
      });
    }, { threshold: [0, 0.05] });
    sectionObserver.observe(t7);

    // Scroll watcher — maxScrollDepth and hasScrolledBack flags.
    let lastScrollY = window.scrollY;

    function updateScrollMetrics(y) {
      const rect = t7.getBoundingClientRect();
      const scrolledIntoT7 = Math.max(0, -rect.top);
      if (scrolledIntoT7 > maxScrollDepth) maxScrollDepth = scrolledIntoT7;
      // "Scrolled back" means scrolled away from advancing direction.
      if (y < lastScrollY && firstVisibleAt !== null) hasScrolledBack = true;
      lastScrollY = y;
    }

    window.addEventListener('scroll', () => {
      updateScrollMetrics(window.scrollY);
    }, { passive: true });

    // Render mirror observations on a slow tick.
    setInterval(() => {
      if (!observationsActive) return;
      if (firstVisibleAt === null) return;

      // If Entry 010 is currently visible, accumulate pause time
      // since last sample (so we always have a current reading).
      let pauseSample = entry010PauseTime;
      if (entry010Visible && entry010LastSeen !== null) {
        pauseSample += (performance.now() - entry010LastSeen) / 1000;
      }

      const elapsed = (performance.now() - firstVisibleAt) / 1000;
      const lines = [
        `You have been reading this page for ${formatDuration(elapsed)}.`,
        `You have read ${entriesRead.size} of ${logEntries.length} entries.`
      ];
      if (hasScrolledBack) {
        lines.push(`You have scrolled back.`);
      } else {
        lines.push(`You have not scrolled back up.`);
      }
      if (pauseSample > 1.5) {
        lines.push(`You paused at Entry 010 for ${pauseSample.toFixed(1)} seconds.`);
      }

      // Render as styled list. CSS controls visual presentation.
      mirror.innerHTML = lines.map((l) => `<li class="mirror-line">${l}</li>`).join('');
    }, 1500);

    function formatDuration(s) {
      if (s < 60) return `${Math.round(s)} seconds`;
      const m = Math.floor(s / 60);
      const r = Math.round(s % 60);
      return `${m} minute${m === 1 ? '' : 's'} and ${r} second${r === 1 ? '' : 's'}`;
    }
  }


  /* ==================================================================
     3.4  WALL OF FIRE — HOLD MECHANIC

     The user must press and hold a button (pointer or keyboard) for
     3 seconds. Reduced-motion users get the same duration but with
     a simplified visual; AT users get the same hold mechanic with
     announced progress.

     Implementation:
       - pointerdown / keydown (Space or Enter on the .hold-button)
         start the hold.
       - pointerup / keyup / pointerleave / blur cancel the hold and
         reset progress.
       - On hold completion, .wall-of-fire gets .is-passed; the
         next section (Earthly Paradise) becomes accessible.
       - If the user does not complete, the wall remains and they
         cannot progress (they can scroll back, but they cannot
         advance).
     ================================================================== */

  function initWallOfFire() {
    const wall = $('.wall-of-fire');
    if (!wall) return;
    const button = $('.hold-button', wall);
    const progress = $('.hold-progress', wall);
    if (!button) return;

    const HOLD_MS = 3000;
    let holdStart = null;
    let raf = null;
    let passed = false;

    function startHold() {
      if (passed) return;
      if (holdStart !== null) return;
      holdStart = performance.now();
      button.classList.add('is-holding');
      // Live region announces start for AT users.
      const live = $('.hold-live', wall);
      if (live) live.textContent = 'Holding. Continue holding to pass through.';
      tick();
    }

    function tick() {
      if (holdStart === null) return;
      const elapsed = performance.now() - holdStart;
      const progressFraction = Math.min(1, elapsed / HOLD_MS);
      if (progress) {
        progress.style.setProperty('--hold-progress', progressFraction.toFixed(4));
        progress.style.width = (progressFraction * 100) + '%';
      }
      if (progressFraction >= 1) {
        complete();
      } else {
        raf = requestAnimationFrame(tick);
      }
    }

    function cancelHold() {
      if (passed) return;
      if (holdStart === null) return;
      holdStart = null;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      button.classList.remove('is-holding');
      if (progress) {
        progress.style.setProperty('--hold-progress', '0');
        progress.style.width = '0%';
      }
    }

    function complete() {
      passed = true;
      holdStart = null;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      wall.classList.add('is-passed');
      button.classList.remove('is-holding');
      button.setAttribute('aria-disabled', 'true');
      const live = $('.hold-live', wall);
      if (live) live.textContent = 'You have passed through.';
    }

    // Pointer events (mouse, touch, pen unified).
    button.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startHold();
    });
    button.addEventListener('pointerup', cancelHold);
    button.addEventListener('pointerleave', cancelHold);
    button.addEventListener('pointercancel', cancelHold);

    // Keyboard equivalent: Space or Enter held on the focused button.
    // We track keydown/keyup. Browsers fire repeated keydown events
    // while a key is held; we ignore repeats.
    button.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (e.repeat) return;
        startHold();
      }
    });
    button.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') cancelHold();
    });
    button.addEventListener('blur', cancelHold);
  }


  /* ==================================================================
     4.1  HEAVEN — SPHERE ORBITAL APPROACH

     "Each sphere rotates subtly as the user approaches, suggesting
      orbit rather than climbing." (Design Strategy 1.3)

     We expose two CSS hooks per sphere:
       - .is-approaching: the sphere is entering the viewport.
       - .is-centered:    the sphere is centered in the viewport.

     We also set a CSS custom property --approach (0..1) on each
     sphere reflecting how close to centered it is. The designer
     uses this to drive rotation, scale, opacity, etc.
     ================================================================== */

  function initSphereApproach() {
    const spheres = $$('.sphere');
    if (spheres.length === 0) return;

    function update() {
      const vh = window.innerHeight;
      const center = vh / 2;
      spheres.forEach((sphere) => {
        const rect = sphere.getBoundingClientRect();
        const sphereCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sphereCenter - center);
        // Normalize: 1 when centered, 0 when far away.
        const approach = Math.max(0, 1 - (distance / vh));
        sphere.style.setProperty('--approach', approach.toFixed(4));

        const inViewport = rect.bottom > 0 && rect.top < vh;
        sphere.classList.toggle('is-approaching', inViewport);
        sphere.classList.toggle('is-centered', approach > 0.85);
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }


  /* ==================================================================
     4.2  HEAVEN — SPHERE NAVIGATOR

     "Heaven introduces a subtle sphere navigator that becomes
      available after the Perceptual Transformation."
     ================================================================== */

  function initSphereNavigator() {
    const nav = $('.sphere-navigator');
    if (!nav) return;
    const heaven = $('.heaven');
    if (heaven) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          nav.classList.toggle('is-available', entry.isIntersecting);
        });
      }, { threshold: 0.05 });
      obs.observe(heaven);
    }

    // Each link in the navigator scrolls to its target sphere.
    $$('a[data-sphere]', nav).forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.dataset.sphere;
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center'
        });
      });
    });
  }


  /* ==================================================================
     4.3  EMPYREAN — BLINKING CURSOR, INCOMPLETE SENTENCE

     "A blank canvas. A blinking cursor. A single line of text that
      does not complete. The poem ends mid-sentence. The project
      can end the same way."

     The text "The next word is" is in the HTML. The cursor is a CSS
     :after pseudo-element that blinks via animation. JS does not
     complete the sentence. JS will not ever complete the sentence.
     ================================================================== */

  function initEmpyrean() {
    // Intentionally empty. The cursor blinks via CSS animation.
    // The argument of the Empyrean is that the project does not
    // complete this. JS leaving it alone is the mechanic.
  }


  /* ==================================================================
     5. INIT
     ================================================================== */

  function init() {
    // Hell
    initGate();
    initLimbo();
    initLust();
    initGluttony();
    initGreed();
    initWrath();
    initHeresy();
    initViolence();
    initFraud();
    initTreachery();

    // Inversion
    initInversion();

    // Purgatory
    initMountainIndicator();
    initTerrace6();
    initTerrace7();
    initWallOfFire();

    // Heaven
    initSphereApproach();
    initSphereNavigator();
    initEmpyrean();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
