/**
 * Sektion „Die Reise" (§A2) – gepinntes Horizontal-Scrollytelling.
 *
 * Desktop: Section wird gepinnt. ZUERST eine sanfte Intro-Phase (Titel/Text/Siegel
 *          faden weich ein, kein Horizontal-Scroll). Erst wenn alles steht, beginnt
 *          die horizontale Bewegung; die SVG-Ranke zeichnet sich synchron,
 *          Kapitel reveal’en nacheinander.
 * Mobile:  kein Pin/Horizontal – vertikaler Stapel, Ranke wächst (scaleY),
 *          Kapitel als Fade/Slide.
 * reduced-motion: statischer Endzustand (alles sichtbar, Ranke voll).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initRoute(section) {
  if (!section) return;

  const viewport = section.querySelector('[data-route-viewport]');
  const track = section.querySelector('[data-route-track]');
  const vine = section.querySelector('[data-vine]');
  const vline = section.querySelector('[data-vline]');
  const routeBg = section.querySelector('[data-route-bg]');
  const items = gsap.utils.toArray(section.querySelectorAll('[data-chapter]'));
  const intro = items[0];
  const chapters = items.slice(1);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ranke (SVG) vorbereiten
  let vineLen = 0;
  if (vine) {
    vineLen = vine.getTotalLength();
    vine.style.strokeDasharray = String(vineLen);
    vine.style.strokeDashoffset = String(vineLen);
  }

  if (reduced) {
    if (vine) vine.style.strokeDashoffset = '0';
    if (vline) vline.style.transform = 'scaleY(1)';
    items.forEach((c) => c.classList.add('is-in'));
    return;
  }

  const mm = gsap.matchMedia();

  /* ---------------- Desktop: Pin + Horizontal (robustes containerAnimation-Muster) ---------------- */
  mm.add('(min-width: 768px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - viewport.offsetWidth);

    // Horizontale Haupt-Tween (treibt Pin + Scrub). distance() ist funktionsbasiert
    // → wird bei jedem Refresh neu gemessen (kein fester, evtl. 0-Wert).
    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Ranke zeichnet sich synchron zum Fortschritt
    let vineST = null;
    if (vine) {
      vineST = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          vine.style.strokeDashoffset = String(vineLen * (1 - self.progress));
          // Karten-Hintergrund zoomt sanft über die Reise (wie im Hero)
          if (routeBg) routeBg.style.transform = `scale(${1.04 + self.progress * 0.12})`;
        },
      });
    }

    // Intro fadet sanft ein, sobald die Sektion einpinnt
    const introTween = gsap.from(intro.querySelectorAll('[data-reveal]'), {
      opacity: 0,
      y: 50,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: section, start: 'top 72%', toggleActions: 'play none none reverse' },
    });

    // Kapitel reveal’en an ihrer horizontalen Position (an die Haupt-Tween gekoppelt)
    const chapterTweens = chapters.map((ch) =>
      gsap.from(ch.querySelectorAll('[data-reveal]'), {
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: ch,
          containerAnimation: horizontal,
          start: 'left 80%',
          toggleActions: 'play none none reverse',
        },
      })
    );

    return () => {
      horizontal.scrollTrigger && horizontal.scrollTrigger.kill();
      horizontal.kill();
      if (vineST) vineST.kill();
      introTween.scrollTrigger && introTween.scrollTrigger.kill();
      chapterTweens.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill());
    };
  });

  /* ---------------- Mobile: vertikaler Stapel ---------------- */
  mm.add('(max-width: 767px)', () => {
    let vineTween = null;
    if (vline) {
      vineTween = gsap.fromTo(
        vline,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: { trigger: track, start: 'top 80%', end: 'bottom 65%', scrub: 1 },
        }
      );
    }

    const reveals = items.map((ch) =>
      gsap.from(ch.querySelectorAll('[data-reveal]'), {
        y: 40,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: ch, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    );

    return () => {
      if (vineTween && vineTween.scrollTrigger) vineTween.scrollTrigger.kill();
      reveals.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill());
    };
  });
}
