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

  return { lenis, gsap, ScrollTrigger, prefersReduced };
}

export { gsap, ScrollTrigger, prefersReduced };
