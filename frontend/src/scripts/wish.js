/**
 * Wunschbaum-Insel (§A3): Wünsche laden (paginiert) + absenden (→ Moderation).
 * Turnstile-Token wird mitgeschickt, falls das Widget gerendert wurde
 * (PUBLIC_TURNSTILE_SITEKEY gesetzt) – sonst lässt das Backend im Dev durch.
 */
import { api } from '../lib/api.js';

const fmt = new Intl.NumberFormat('de-DE');

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function initWishTree(root) {
  if (!root) return;

  const listEl = root.querySelector('[data-wish-list]');
  const moreBtn = root.querySelector('[data-wish-more]');
  const totalEl = root.querySelector('[data-wish-total]');
  const form = root.querySelector('[data-wish-form]');
  const statusEl = root.querySelector('[data-wish-status]');

  let page = 0;
  let pages = 1;

  function card(w) {
    const el = document.createElement('article');
    el.className = 'wish';
    const ort = w.ort ? ` · ${escapeHtml(w.ort)}` : '';
    el.innerHTML = `<p class="wish__msg">„${escapeHtml(w.nachricht)}"</p>
      <p class="wish__by">${escapeHtml(w.vorname)}${ort}</p>`;
    return el;
  }

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.kind = kind || '';
  }

  async function loadMore() {
    if (page >= pages) return;
    page += 1;
    if (moreBtn) moreBtn.disabled = true;
    try {
      const data = await api.getWishes(page);
      pages = data.pages || 1;
      (data.items || []).forEach((w) => listEl.appendChild(card(w)));
      if (totalEl) totalEl.textContent = fmt.format(data.total || 0);
      if (moreBtn) moreBtn.hidden = page >= pages;
    } catch (e) {
      console.warn('[wish] laden fehlgeschlagen', e);
    } finally {
      if (moreBtn) moreBtn.disabled = false;
    }
  }

  if (moreBtn) moreBtn.addEventListener('click', loadMore);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        vorname: String(fd.get('vorname') || '').trim(),
        ort: String(fd.get('ort') || '').trim(),
        nachricht: String(fd.get('nachricht') || '').trim(),
        consent: !!fd.get('consent'),
      };
      const tokenEl = form.querySelector('[name="cf-turnstile-response"]');
      if (tokenEl && tokenEl.value) payload.turnstile = tokenEl.value;

      if (!payload.vorname || !payload.nachricht) {
        setStatus('Bitte Vorname und Nachricht ausfüllen.', 'err');
        return;
      }
      if (!payload.consent) {
        setStatus('Bitte stimme der öffentlichen Anzeige zu.', 'err');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      setStatus('Wird gesendet …', '');
      try {
        await api.postWish(payload);
        form.reset();
        setStatus('Danke! Dein Wunsch erscheint nach kurzer Prüfung. 🌿', 'ok');
      } catch (err) {
        console.warn('[wish] senden fehlgeschlagen', err);
        setStatus('Hoppla, das hat nicht geklappt. Bitte später nochmal.', 'err');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  loadMore(); // erste Seite laden
}
