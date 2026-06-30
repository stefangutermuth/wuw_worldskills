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
import { lenis } from './motion.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Karten-Detail-Modal („Mehr erfahren"). Läuft unabhängig von Scroll-Animationen,
 * also auch bei prefers-reduced-motion. Klont den versteckten [data-detail]-Inhalt
 * der angeklickten Karte in den (an <body> verschobenen) Dialog.
 */
function initRouteCards(section) {
  const dialog = section.querySelector('[data-route-dialog]');
  if (!dialog) return;

  // Dialog ans <body> hängen → liegt sicher über allem (kein Pin-/Overflow-Konflikt).
  if (dialog.parentElement !== document.body) document.body.appendChild(dialog);

  const body = dialog.querySelector('[data-route-dialog-body]');
  const card = dialog.querySelector('.route__dialog-card');
  const closeBtn = dialog.querySelector('[data-route-close]');
  let lastFocus = null;

  function openCard(el) {
    const detail = el.querySelector('[data-detail]');
    if (!detail) return;
    body.innerHTML = detail.innerHTML;
    card.setAttribute('aria-label', el.dataset.title || 'Kapitel-Details');
    lastFocus = document.activeElement;
    dialog.hidden = false;
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    if (lenis) lenis.stop();            // Hintergrund-Scroll einfrieren
    closeBtn.focus();
  }

  function close() {
    dialog.classList.remove('is-open');
    if (lenis) lenis.start();
    setTimeout(() => { dialog.hidden = true; body.innerHTML = ''; }, 260);
    if (lastFocus) lastFocus.focus();
  }

  // ---- Bild-Lightbox: Galerie-/Titelbilder im Dialog groß anzeigen ----
  const lightbox = section.querySelector('[data-route-lightbox]');
  let closeLightbox = () => {};
  if (lightbox) {
    if (lightbox.parentElement !== document.body) document.body.appendChild(lightbox);
    const lbImg = lightbox.querySelector('[data-lightbox-img]');
    const lbCredit = lightbox.querySelector('[data-lightbox-credit]');

    const openLightbox = (img) => {
      lbImg.src = img.currentSrc || img.src; // bereits geladene Auflösung wiederverwenden
      lbImg.alt = img.alt || '';
      const credit = img.dataset.credit;     // Quellenhinweis (z. B. Verband) mitführen
      if (lbCredit) {
        lbCredit.textContent = credit ? `Foto: ${credit}` : '';
        lbCredit.hidden = !credit;
      }
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add('is-open'));
    };
    closeLightbox = () => {
      lightbox.classList.remove('is-open');
      setTimeout(() => { lightbox.hidden = true; lbImg.src = ''; }, 240);
    };

    // Klick auf ein Bild im Dialog-Inhalt → Lightbox öffnen
    body.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (img && body.contains(img)) openLightbox(img);
    });
    // Klick irgendwo auf die Lightbox (Overlay, Bild, ×) → schließen
    lightbox.addEventListener('click', closeLightbox);
  }

  section.querySelectorAll('[data-card]').forEach((el) => {
    el.addEventListener('click', () => openCard(el));
  });
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (lightbox && !lightbox.hidden) { closeLightbox(); return; } // erst Lightbox
    if (!dialog.hidden) close();
  });
}

export function initRoute(section) {
  if (!section) return;

  // Detail-Modal immer initialisieren (auch bei reduced-motion).
  initRouteCards(section);

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
