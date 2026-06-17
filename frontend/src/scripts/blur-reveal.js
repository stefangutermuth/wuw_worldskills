/**
 * Blur-Reveal: Sektions-Blöcke schärfen sich beim Einrollen mit gestaffelter
 * CSS-Transition (~85 ms pro Block) und werden beim Verlassen wieder unscharf.
 *
 * Bewusst KEIN GSAP/ScrollTrigger — kämpft nicht mit bestehenden Tweens.
 * Stattdessen: IntersectionObserver + CSS transition-delay pro Block.
 */
export function initBlurReveal() {
  const SECTIONS = ['#daumendruecken', '#live', '#presse', 'footer'];

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

    // Startzustand + gestaffelter Delay direkt als Inline-Style
    blocks.forEach((el, i) => {
      el.classList.add('br-block');
      el.style.transitionDelay = `${i * 85}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          blocks.forEach((el) => {
            el.classList.toggle('br-visible', entry.isIntersecting);
          });
        });
      },
      { threshold: 0.12 }
    );

    observer.observe(section);
  });
}
