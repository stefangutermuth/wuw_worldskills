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
    // Vorschaubilder der Videos erst jetzt setzen (s. Route.astro: data-poster).
    body.querySelectorAll('video[data-poster]').forEach((v) => {
      v.poster = v.dataset.poster;
    });
    card.setAttribute('aria-label', el.dataset.title || 'Kapitel-Details');
    lastFocus = document.activeElement;
    dialog.hidden = false;
    // WICHTIG: NICHT über requestAnimationFrame einblenden. Kommt der rAF-Rückruf
    // verzögert (ausgelastete Renderpipeline, Hintergrund-Tab, Firefox unter Last),
    // liegt sonst ein unsichtbares Vollbild-Overlay (opacity:0) über der Seite und
    // schluckt jeden Klick – die Karte wirkt dann „kaputt". Ein erzwungener Reflow
    // schreibt den Startzustand fest, danach startet die Transition auch synchron.
    void dialog.offsetWidth;
    dialog.classList.add('is-open');
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
      void lightbox.offsetWidth; // s. openCard(): kein rAF, sonst unsichtbares Overlay
      lightbox.classList.add('is-open');
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

    /* ---------- Bedienung: Pfeile, Ziehen, Hinweis, Fortschritt ----------
     * Die Reise wird von der SEITEN-Scrollposition getrieben. Klick und Ziehen
     * duerfen daher NICHT die x-Position des Tracks setzen (dagegen wuerde
     * ScrollTrigger sofort zurueckrechnen), sondern muessen die Scrollposition
     * aendern. Praktisch: Weil end = start + distance und x von 0 bis -distance
     * laeuft, ist die Zuordnung 1:1 -> scrollY = start + horizontaler Versatz.
     */
    const nav = section.querySelector('[data-route-nav]');
    const prevBtn = section.querySelector('[data-route-prev]');
    const nextBtn = section.querySelector('[data-route-next]');
    const progress = section.querySelector('[data-route-progress]');
    const progressBar = section.querySelector('[data-route-progress-bar]');
    const hint = section.querySelector('[data-route-hint]');

    [nav, progress, hint].forEach((el) => { if (el) el.hidden = false; });
    if (viewport) viewport.classList.add('is-draggable');

    const startY = () => (horizontal.scrollTrigger ? horizontal.scrollTrigger.start : 0);
    const currentX = () => -(gsap.getProperty(track, 'x') || 0);
    const clampX = (x) => Math.max(0, Math.min(distance(), x));

    // Zielpositionen: jedes Kapitel buendig hinter dem linken Track-Rand.
    const stops = () => {
      const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      return items.map((el) => clampX(el.offsetLeft - pad));
    };

    const goToX = (x, smooth = true) => {
      const y = startY() + clampX(x);
      if (lenis) lenis.scrollTo(y, smooth ? { duration: 0.9 } : { immediate: true });
      else window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'auto' });
    };

    const step = (dir) => {
      const list = stops();
      const now = currentX();
      const next = dir > 0
        ? list.find((t) => t > now + 12)
        : [...list].reverse().find((t) => t < now - 12);
      goToX(next !== undefined ? next : (dir > 0 ? distance() : 0));
    };

    const onPrev = () => step(-1);
    const onNext = () => step(1);
    if (prevBtn) prevBtn.addEventListener('click', onPrev);
    if (nextBtn) nextBtn.addEventListener('click', onNext);

    // Ziehen mit Maus/Stift. Touch bleibt aus: dort ist Wischen = Seitenscroll.
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let moved = 0;

    const onDown = (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      if (e.target.closest('[data-route-nav], a, button, video')) return;
      dragging = true;
      moved = 0;
      dragStartX = e.clientX;
      dragStartY = startY() + currentX();
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture && viewport.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      moved = Math.max(moved, Math.abs(dx));
      const y = Math.max(startY(), Math.min(startY() + distance(), dragStartY - dx));
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo({ top: y });
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      viewport.releasePointerCapture && e.pointerId !== undefined
        && viewport.hasPointerCapture && viewport.hasPointerCapture(e.pointerId)
        && viewport.releasePointerCapture(e.pointerId);
      // Nach echtem Ziehen den folgenden Klick auf einer Karte unterdruecken.
      if (moved > 6) {
        const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        viewport.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => viewport.removeEventListener('click', swallow, true), 60);
      }
    };

    if (viewport) {
      viewport.addEventListener('pointerdown', onDown);
      viewport.addEventListener('pointermove', onMove);
      viewport.addEventListener('pointerup', onUp);
      viewport.addEventListener('pointercancel', onUp);
    }

    // Fortschritt, Hinweis und Pfeil-Zustaende mitfuehren
    const uiST = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => '+=' + distance(),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        if (progressBar) progressBar.style.width = (p * 100).toFixed(1) + '%';
        if (hint) hint.classList.toggle('is-gone', p > 0.02);
        if (prevBtn) prevBtn.disabled = p <= 0.002;
        if (nextBtn) nextBtn.disabled = p >= 0.998;
      },
    });
    if (prevBtn) prevBtn.disabled = true;

    return () => {
      horizontal.scrollTrigger && horizontal.scrollTrigger.kill();
      horizontal.kill();
      if (vineST) vineST.kill();
      introTween.scrollTrigger && introTween.scrollTrigger.kill();
      chapterTweens.forEach((t) => t.scrollTrigger && t.scrollTrigger.kill());
      uiST.kill();
      if (prevBtn) prevBtn.removeEventListener('click', onPrev);
      if (nextBtn) nextBtn.removeEventListener('click', onNext);
      if (viewport) {
        viewport.removeEventListener('pointerdown', onDown);
        viewport.removeEventListener('pointermove', onMove);
        viewport.removeEventListener('pointerup', onUp);
        viewport.removeEventListener('pointercancel', onUp);
        viewport.classList.remove('is-draggable', 'is-dragging');
      }
      [nav, progress, hint].forEach((el) => { if (el) el.hidden = true; });
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
