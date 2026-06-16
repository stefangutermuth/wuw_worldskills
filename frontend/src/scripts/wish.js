/**
 * Wunschbaum-Insel (§A3): Wünsche laden (paginiert) + absenden (→ Moderation).
 * Turnstile-Token wird mitgeschickt, falls das Widget gerendert wurde
 * (PUBLIC_TURNSTILE_SITEKEY gesetzt) – sonst lässt das Backend im Dev durch.
 */
import { api } from '../lib/api.js';
import { DEMO_FALLBACK, DEMO_WISHES } from '../lib/demo.js';

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

  // Demo-Fallback: leere/fehlende Backend-Daten mit Beispiel-Grüßen füllen.
  function renderDemo() {
    DEMO_WISHES.forEach((w) => listEl.appendChild(card(w)));
    if (totalEl) totalEl.textContent = fmt.format(DEMO_WISHES.length);
    if (moreBtn) moreBtn.hidden = true;
  }

  async function loadMore() {
    if (page >= pages) return;
    page += 1;
    if (moreBtn) moreBtn.disabled = true;
    try {
      const data = await api.getWishes(page);
      const items = data.items || [];
      if (page === 1 && items.length === 0 && DEMO_FALLBACK) {
        renderDemo();
        return;
      }
      pages = data.pages || 1;
      items.forEach((w) => listEl.appendChild(card(w)));
      if (totalEl) totalEl.textContent = fmt.format(data.total || 0);
      if (moreBtn) moreBtn.hidden = page >= pages;
    } catch (e) {
      console.warn('[wish] laden fehlgeschlagen', e);
      if (page === 1 && DEMO_FALLBACK && !listEl.children.length) renderDemo();
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

      // Optionaler Newsletter (separate Einwilligung – nie an den Wunsch gekoppelt)
      const email = String(fd.get('email') || '').trim();
      const wantsNewsletter = !!fd.get('newsletter');

      if (!payload.vorname || !payload.nachricht) {
        setStatus('Bitte Vorname und Nachricht ausfüllen.', 'err');
        return;
      }
      if (!payload.consent) {
        setStatus('Bitte stimme der öffentlichen Anzeige zu.', 'err');
        return;
      }
      if (wantsNewsletter && !/.+@.+\..+/.test(email)) {
        setStatus('Für den Newsletter bitte eine gültige E-Mail angeben (oder Haken entfernen).', 'err');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      setStatus('Wird gesendet …', '');
      try {
        await api.postWish(payload);

        // Newsletter separat anstoßen (Double-Opt-in übernimmt der ESP)
        let nl = false;
        if (wantsNewsletter && email) {
          try {
            await api.postNewsletter({ email, consent: true });
            nl = true;
          } catch (e) {
            console.warn('[wish] newsletter fehlgeschlagen', e);
          }
        }

        form.reset();
        setStatus(
          nl
            ? 'Danke! Dein Wunsch erscheint nach Prüfung. 🌿 Die Updates schicken wir dir per E-Mail.'
            : 'Danke! Dein Wunsch erscheint nach kurzer Prüfung. 🌿',
          'ok'
        );
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
