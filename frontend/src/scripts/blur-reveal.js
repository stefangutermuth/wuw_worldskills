/**
 * Blur-Reveal: Sektions-Blöcke schärfen sich beim Einrollen in den Viewport
 * (gestaffelt, ~80 ms pro Block) und werden beim Verlassen wieder unscharf.
 *
 * Sichtbarkeit wird per getBoundingClientRect() selbst berechnet — die ECHTE,
 * aktuelle Viewport-Position. Das ist immun gegen ScrollTrigger-Kalibrierung und
 * den gepinnten Route-Bereich.
 *
 * WICHTIG: Lenis steuert das Scrollen und feuert KEIN natives window-'scroll'-Event
 * (window.scrollTo aktualisiert nur scrollY). Daher primär an lenis.on('scroll')
 * hängen; window-scroll bleibt als Fallback (reduced-motion / kein Lenis).
 * Die eigentliche Blur-Transition macht reines CSS (.br-block / .br-block.br-visible).
 *
 * @param {import('lenis').default | null} lenis  Lenis-Instanz aus initMotion()
 */
export function initBlurReveal(lenis) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return; // CSS-Fallback macht Blöcke ohnehin sofort scharf

  // Hero & Route ausgelassen (eigene komplexe Animationen).
  const SECTIONS = ['#daumendruecken', '#live', '#presse', 'footer'];

  const groups = [];
  SECTIONS.forEach((sel) => {
    const section = document.querySelector(sel);
    if (!section) return;

    const container = section.querySelector('.u-container') ?? section;
    const blocks = [...container.children].filter((el) => {
      if (el.getAttribute('aria-hidden') === 'true') return false;
      if ('cheerLanterns' in el.dataset) return false;
      return el.offsetWidth > 0 || el.offsetHeight > 0;
    });
    if (!blocks.length) return;

    blocks.forEach((el, i) => {
      el.classList.add('br-block');
      el.style.transitionDelay = `${i * 80}ms`;
    });

    groups.push({ section, blocks, visible: null });
  });

  if (!groups.length) return;

  // Update: Sektion gilt als sichtbar, sobald sie den mittleren Bereich des
  // Viewports überlappt (oben < 85 % Höhe, unten > 15 % Höhe). Direkt im
  // Scroll-Handler (kein rAF) — billig (4× getBoundingClientRect, Toggle nur bei
  // Änderung) und Lenis feuert ohnehin höchstens einmal pro Frame.
  const apply = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for (const g of groups) {
      const r = g.section.getBoundingClientRect();
      const inView = r.top < vh * 0.85 && r.bottom > vh * 0.15;
      if (inView !== g.visible) {
        g.visible = inView;
        g.blocks.forEach((el) => el.classList.toggle('br-visible', inView));
      }
    }
  };

  apply(); // Startzustand sofort setzen

  // Primärer Treiber: Lenis-Scroll (window feuert unter Lenis kein scroll-Event).
  if (lenis && typeof lenis.on === 'function') lenis.on('scroll', apply);
  // Fallback + Sonderfälle (reduced-motion ohne Lenis, programmatisches Scrollen).
  window.addEventListener('scroll', apply, { passive: true });
  window.addEventListener('resize', apply);
  // Nach dem Preloader (Layout-Shift durch entsperrtes Scrollen) erneut prüfen.
  document.addEventListener('preloader:done', apply, { once: true });
}
