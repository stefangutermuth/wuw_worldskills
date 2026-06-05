/**
 * Sanfter Zoom-/Parallax-Effekt für Bild-Hintergründe (wie im Hero):
 * Die Bild-Ebene skaliert + driftet leicht, während die Sektion durchs
 * Viewport scrollt. Respektiert prefers-reduced-motion.
 *
 * Die Ziel-Ebene sollte etwas Überstand haben (z. B. inset: -6%), damit
 * beim Skalieren keine Kanten sichtbar werden.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initBgParallax(layer, opts = {}) {
  if (!layer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const trigger = opts.trigger || layer.parentElement;
  const fromScale = opts.fromScale ?? 1.02;
  const toScale = opts.toScale ?? 1.16;
  const yPercent = opts.yPercent ?? 8;

  gsap.fromTo(
    layer,
    { scale: fromScale, yPercent: -yPercent / 2 },
    {
      scale: toScale,
      yPercent: yPercent / 2,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );
}
