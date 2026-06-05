/**
 * Sektion „Live aus Shanghai" (§A4).
 * - Zwei-Zeitzonen-Uhr (Chemnitz / Shanghai) – reine Client-Zeitlogik.
 * - Status-Toggle: GET /status → schaltet Reportage-Modus frei.
 * - Dispatches (GET /dispatches) als Featured + Karten.
 */
import { api } from '../lib/api.js';

function clockFactory(tz) {
  const time = new Intl.DateTimeFormat('de-DE', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return () => time.format(new Date());
}

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

  // ---- Uhren ----
  const deClock = root.querySelector('[data-clock-de]');
  const cnClock = root.querySelector('[data-clock-cn]');
  const fmtDe = clockFactory('Europe/Berlin');
  const fmtCn = clockFactory('Asia/Shanghai');
  function tick() {
    if (deClock) deClock.textContent = fmtDe();
    if (cnClock) cnClock.textContent = fmtCn();
  }
  tick();
  setInterval(tick, 1000 * 15);

  // ---- Status + Dispatches ----
  const featured = root.querySelector('[data-live-featured]');
  const cards = root.querySelector('[data-live-cards]');
  const empty = root.querySelector('[data-live-empty]');

  function renderDispatches(items) {
    if (!items || !items.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

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
      renderDispatches(data.items || []);
    } catch (e) {
      console.warn('[live] dispatches laden fehlgeschlagen', e);
      if (empty) empty.hidden = false;
    }
  }

  init();
}
