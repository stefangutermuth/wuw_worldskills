/**
 * Globales Motion-Setup: Lenis (Smooth-Scroll) an GSAP-Ticker koppeln,
 * ScrollTrigger registrieren. Respektiert prefers-reduced-motion.
 *
 * Konventionen (§A0):
 *  - Nur transform & opacity animieren (GPU).
 *  - reduced-motion → kein Smooth-Scroll, statischer Endzustand.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Dev: GSAP-ScrollTrigger verträgt sich schlecht mit Hot-Reload (alte Trigger
// bleiben hängen → Pin/Scroll „verheddert" sich). Daher bei jeder HMR-Änderung
// einmal sauber komplett neu laden. Nur im Dev aktiv (import.meta.hot).
if (import.meta.hot) {
  import.meta.hot.on('vite:afterUpdate', () => window.location.reload());
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export let lenis = null;

export function initMotion() {
  if (prefersReduced) {
    // Kein Smooth-Scroll, keine Scroll-Tweens – Endzustände stehen via CSS.
    return { lenis: null, gsap, ScrollTrigger, prefersReduced };
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  // Lenis-RAF an GSAP-Ticker koppeln (eine einzige Render-Loop)
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // WICHTIG: Nach dem Laden der Web-Fonts verschiebt sich das Layout.
  // Ohne Neuberechnung verrechnen sich gepinnte ScrollTrigger (z. B. die Reise).
  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refresh);
  }
  window.addEventListener('load', refresh);

  // WICHTIG: Solange der Preloader läuft, sperrt html.is-preloading das Scrollen
  // (overflow: hidden). ScrollTrigger kalibriert dann gegen das gesperrte Layout →
  // die Hero-Parallax (Koi, BG-Layer) sitzt falsch, bis der erste Scroll ein Update
  // auslöst. Daher nach dem Preloader-Ende neu kalibrieren (doppeltes rAF, damit
  // Scrollbar/Höhe sicher gesetzt sind).
  const refreshAfterPreloader = () => {
    requestAnimationFrame(() => requestAnimationFrame(refresh));
  };
  if (document.documentElement.classList.contains('is-preloading')) {
    document.addEventListener('preloader:done', refreshAfterPreloader, { once: true });
  } else {
    refreshAfterPreloader(); // Preloader schon weg (reduced-motion / Cache)
  }

  // ── Scroll-Snap: Nach dem Scrollen springt die Seite zur nächsten Rubrik.
  // Arbeitet mit lenis.scrollTo() statt CSS scroll-snap (Lenis v1 inkompatibel).
  // Logik: Wir ermitteln, zwischen welchen zwei Rubriken wir gerade stehen.
  // Sind wir über 50 % des Abstands → snap zur nächsten, sonst zurück zur aktuellen.
  // Lange Lücken (Route-Pinning > 2,5× Viewport) werden ausgelassen – kein Rücksprung
  // mitten in der Scrollytelling-Animation.
  const _snapEls = ['#hero', '#route', '#daumendruecken', '#live', '#presse', 'footer']
    .map((s) => document.querySelector(s))
    .filter(Boolean);

  if (_snapEls.length) {
    let _snapTimer = null;
    let _snapping = false;

    lenis.on('scroll', ({ scroll }) => {
      if (_snapping) return;
      clearTimeout(_snapTimer);
      _snapTimer = setTimeout(() => {
        const vh = window.innerHeight;

        // Finde, in welcher Rubrik wir gerade sind (letzte mit offsetTop ≤ scroll)
        let inIdx = 0;
        for (let i = 0; i < _snapEls.length; i++) {
          if (_snapEls[i].offsetTop <= scroll) inIdx = i;
          else break;
        }

        const cur = _snapEls[inIdx];
        const next = _snapEls[inIdx + 1];
        const distFromCur = scroll - cur.offsetTop;

        if (distFromCur < 2 || !next) return; // bereits ganz oben oder letzte Rubrik

        const gap = next.offsetTop - cur.offsetTop;

        // Lange Lücken (z. B. Route-Pinning) auslassen – sonst Rücksprung mitten im Scrollytelling
        if (gap > vh * 2.5) return;

        const target = (distFromCur / gap) >= 0.5 ? next : cur;
        if (Math.abs(target.offsetTop - scroll) < 2) return;

        _snapping = true;
        lenis.scrollTo(target, {
          duration: 0.9,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          onComplete: () => { _snapping = false; },
        });
      }, 180);
    });
  }

  return { lenis, gsap, ScrollTrigger, prefersReduced };
}

export { gsap, ScrollTrigger, prefersReduced };
