/**
 * INVERSION PROTOTYPE — prototype.js
 *
 * The mechanic, end to end:
 *
 *   1. On load: scroll restoration is set to manual and scroll snaps
 *      to top. The user always begins at the Gate.
 *
 *   2. The user scrolls down through Hell normally. No JS interception.
 *
 *   3. We measure the pivot position (P) and wrapper height (H) at
 *      load and on resize. We set two CSS variables on the wrapper:
 *        --inversion-pivot-y = P     (rotation origin)
 *        --inversion-shift   = 2P-H  (translate to undo asymmetric
 *                                    shift caused by off-center pivot)
 *
 *   4. The rotation triggers when the boundary between Hell and the
 *      ascent reaches viewport CENTER. At that moment the user's
 *      eyeline is on the conceptual pivot.
 *
 *   5. On trigger:
 *        - Wrapper gets .is-inverted, which fires the CSS rotation
 *          (180° around the pivot, plus translate compensation).
 *        - JS animates window scroll by (H - 2P) over the same
 *          duration as the rotation, so the user stays anchored to
 *          the boundary throughout.
 *
 * All measurements come from runtime layout. No fixed pixel values.
 * Works for any content size, any viewport, any device.
 */

(() => {
  'use strict';


  /* ==================================================================
     SCROLL RESTORATION — always start at the Gate.
     ================================================================== */

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  requestAnimationFrame(() => window.scrollTo(0, 0));


  /* ==================================================================
     References
     ================================================================== */

  const wrapper = document.getElementById('wrapper');
  const pivot = document.getElementById('pivot');
  if (!wrapper || !pivot) return;

  // Debug elements — remove this block (and the debug markup) in
  // production.
  const debugState = document.getElementById('debug-state');
  const debugScroll = document.getElementById('debug-scroll');
  const debugPivot = document.getElementById('debug-pivot');

  let state = 'pre';


  /* ==================================================================
     measureAndApply()

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
       up on screen, so we use translateY of 2P-H.
     ================================================================== */

  function measureAndApply() {
    const P = pivot.offsetTop;
    const H = wrapper.offsetHeight;
    wrapper.style.setProperty('--inversion-pivot-y', `${P}px`);
    wrapper.style.setProperty('--inversion-shift', `${2 * P - H}px`);
    if (debugPivot) debugPivot.textContent = `P=${Math.round(P)} shift=${Math.round(2*P - H)}`;
  }

  measureAndApply();
  window.addEventListener('resize', measureAndApply);


  /* ==================================================================
     animateScroll(targetY, duration)

     RAF-driven smooth scroll. Used at trigger to keep the user
     anchored to the boundary as the rotation animates.

     We use RAF rather than scrollTo({ behavior: 'smooth' }) because
     the native version has an unpredictable duration that won't
     match our CSS transition timing.
     ================================================================== */

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


  /* ==================================================================
     trigger()

     Fires the rotation. Called once when the user's scroll position
     places the boundary at viewport center.

     The pivot's document position changes by (H - 2P) due to the
     CSS translate compensation. We scroll the user by that same
     amount, animated in sync, so they stay looking at the boundary.
     ================================================================== */

  function trigger() {
    if (state !== 'pre') return;
    state = 'inverted';
    measureAndApply();

    const P = pivot.offsetTop;
    const H = wrapper.offsetHeight;
    const scrollTarget = window.scrollY + (H - 2 * P);

    wrapper.classList.add('is-inverted');
    animateScroll(scrollTarget, 1400);  // matches CSS transition

    if (debugState) debugState.textContent = state;
  }


  /* ==================================================================
     Single scroll listener: updates debug AND checks trigger.

     Trigger fires when scrollY >= P - viewportHeight/2 — the moment
     the boundary reaches viewport center.
     ================================================================== */

  function onScroll() {
    if (debugScroll) debugScroll.textContent = Math.round(window.scrollY);

    if (state === 'pre') {
      const triggerThreshold = pivot.offsetTop - window.innerHeight / 2;
      if (window.scrollY >= triggerThreshold) trigger();
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

})();
