/**
 * Sektion „Live aus Shanghai" (§A4).
 * - Tage-Countdown bis zum Event (Uhren laufen global im Header, siehe clocks.js).
 * - Status-Toggle: GET /status → schaltet Reportage-Modus frei.
 * - Dispatches (GET /dispatches): Featured + Karten; erscheinen erst, wenn vorhanden.
 * - Hintergrund-Zoom beim Scrollen.
 */
import { api } from '../lib/api.js';
import { initBgParallax } from './bgParallax.js';
import { DEMO_DISPATCHES_ON, DEMO_DISPATCHES } from '../lib/demo.js';

const TARGET = new Date('2026-09-22T00:00:00+08:00').getTime();

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso.replace(' ', 'T')));
  } catch {
    return '';
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function initLive(root) {
  if (!root) return;

  // ---- Tage-Countdown (Uhren laufen jetzt global im Header, siehe clocks.js) ----
  const daysEl = root.querySelector('[data-live-days]');

  function tick() {
    if (daysEl) {
      const days = Math.max(0, Math.ceil((TARGET - Date.now()) / 86400000));
      daysEl.textContent = String(days);
    }
  }
  tick();
  setInterval(tick, 1000 * 30);

  // ---- Hintergrund-Zoom ----
  initBgParallax(root.querySelector('[data-live-bg]'));

  // ---- Instagram-Feed (echte Posts der Haupt-WP via rts-backend) ----
  const igGrid = root.querySelector('[data-insta-grid]');
  if (igGrid) {
    api
      .getInstagram()
      .then((data) => {
        const items = (data && data.items) || [];
        if (!items.length) return; // keine Daten → Platzhalter bleiben stehen
        const esc = (s) => String(s == null ? '' : s).replace(/"/g, '&quot;');
        igGrid.innerHTML = items
          .slice(0, 5)
          .map(
            (p) => `
        <a class="live__insta-tile" href="${esc(p.permalink || 'https://www.instagram.com/wirth_wiener_gmbh/')}" target="_blank" rel="noopener" aria-label="${esc(p.caption || 'Instagram-Beitrag von Wirth & Wiener')}">
          <img src="${esc(p.image)}" alt="" loading="lazy" />
        </a>`
          )
          .join('');
      })
      .catch(() => {
        /* Fehler → Platzhalter bleiben stehen */
      });
  }

  // ---- Status + Dispatches ----
  const featured = root.querySelector('[data-live-featured]');
  const cards = root.querySelector('[data-live-cards]');

  function renderDispatches(items) {
    if (!items || !items.length) {
      root.dataset.dispatches = 'no';
      return;
    }
    root.dataset.dispatches = 'yes';

    const [first, ...rest] = items;
    if (featured && first) {
      featured.innerHTML = `
        ${first.image ? `<img class="live__featured-img" src="${escapeHtml(first.image)}" alt="" loading="lazy" />` : ''}
        <div class="live__featured-body">
          <time class="live__date">${escapeHtml(fmtDate(first.date))}</time>
          <h3 class="live__featured-title">${escapeHtml(first.title)}</h3>
          <p>${escapeHtml(first.text)}</p>
        </div>`;
      featured.hidden = false;
    }
    if (cards) {
      cards.innerHTML = rest
        .map(
          (d) => `<article class="live__card">
            ${d.image ? `<img class="live__card-img" src="${escapeHtml(d.image)}" alt="" loading="lazy" />` : ''}
            <time class="live__date">${escapeHtml(fmtDate(d.date))}</time>
            <h4>${escapeHtml(d.title)}</h4>
            <p>${escapeHtml(d.text)}</p>
          </article>`
        )
        .join('');
    }
  }

  async function init() {
    try {
      const status = await api.getStatus();
      root.dataset.live = status && status.live ? 'on' : 'off';
    } catch {
      root.dataset.live = 'off';
    }
    try {
      const data = await api.getDispatches();
      const items = data.items || [];
      // Demo-Fallback (optional, via Flag): leeres Backend → Beispiel-Berichte
      if (DEMO_DISPATCHES_ON && items.length === 0) {
        root.dataset.live = 'on';
        renderDispatches(DEMO_DISPATCHES);
      } else {
        renderDispatches(items);
      }
    } catch (e) {
      console.warn('[live] dispatches laden fehlgeschlagen', e);
      if (DEMO_DISPATCHES_ON) {
        root.dataset.live = 'on';
        renderDispatches(DEMO_DISPATCHES);
      }
    }
  }

  init();
}
