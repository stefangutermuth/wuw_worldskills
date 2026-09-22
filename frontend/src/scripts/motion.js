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

// Direktlinks wie /#daumendruecken oder /#tag-2209 (Newsletter, Social): Solange der
// Preloader läuft, ist das Scrollen gesperrt – der native Sprung des Browsers verpufft
// und man landet oben im Hero. Daher nach dem Preloader selbst hinspringen.
// Steht an einem Vorfahren data-scroll-anchor, ist der das Ziel (Tagebuch: Reiter mit ins Bild).
const HEADER_OFFSET = 90;
function jumpToHash(l) {
  let id = '';
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const el = id && document.getElementById(id);
  if (!el) return;
  const target = el.closest('[data-scroll-anchor]') || el;
  if (l) {
    // Lenis misst die Seitenhöhe entprellt nach – ohne resize() gilt noch die gesperrte
    // Höhe (limit 0) und der Sprung endet oben.
    l.resize();
    l.scrollTo(target, { offset: -HEADER_OFFSET, immediate: true, force: true });
  } else {
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET });
  }
}
function afterPreloader(fn) {
  if (document.documentElement.classList.contains('is-preloading')) {
    document.addEventListener('preloader:done', fn, { once: true });
  } else {
    fn(); // Preloader schon weg (Cache)
  }
}

export function initMotion() {
  if (prefersReduced) {
    // Kein Smooth-Scroll, keine Scroll-Tweens – Endzustände stehen via CSS.
    afterPreloader(() => requestAnimationFrame(() => jumpToHash(null)));
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
  // Erst neu kalibrieren (Pin-Abstände der Reise stehen dann), dann zum Anker springen.
  afterPreloader(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      refresh();
      jumpToHash(lenis);
    }));
  });
  // Hash-Wechsel ohne Neuladen (URL von Hand geändert): nativer Sprung ignoriert den Header
  window.addEventListener('hashchange', () => jumpToHash(lenis));

  // (Scroll-Snap entfernt: rastete immer am Sektionsanfang ein – bei Sektionen,
  //  die höher als der Viewport sind (z. B. „Live"), blieb das untere Ende verdeckt.
  //  Jetzt scrollt die Seite frei, alles ist erreichbar.)

  // Anker-Links (#…) smooth scrollen. Ohne das überschreibt Lenis den nativen
  // Sprung und nichts passiert. Versatz für den fixen Header.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return; // unbekannter Anker (z. B. #impressum-Platzhalter) → normal lassen
    e.preventDefault();
    lenis.scrollTo(target.closest('[data-scroll-anchor]') || target, { offset: -HEADER_OFFSET, duration: 1.1 });
  });

  return { lenis, gsap, ScrollTrigger, prefersReduced };
}

export { gsap, ScrollTrigger, prefersReduced };
