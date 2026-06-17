/**
 * Dynamic Island „Daumendrücken".
 *
 * Flow: Button „Daumen drücken" öffnet einen Dialog, der optional nach
 * Vorname/Ort fragt (oder „anonym mitmachen"). Beim Bestätigen steigt eine
 * Laterne auf, der Zähler wird serverseitig erhöht (1×/Gerät/Tag).
 * Die schwebenden Laternen sind anklickbar → zeigen „X aus Y drückt die
 * Daumen" bzw. „anonym".
 */
import { gsap } from 'gsap';
import { api } from '../lib/api.js';
import { DEMO_FALLBACK, DEMO_CHEERS } from '../lib/demo.js';

const fmt = new Intl.NumberFormat('de-DE');
const DEVICE_KEY = 'rts_device';
const NAME_KEY = 'rts_name';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function votedKey() {
  return `rts_voted_${new Date().toISOString().slice(0, 10)}`;
}
function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : `d${Date.now()}${Math.floor(Math.random() * 1e6)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function labelFor(entry) {
  if (entry && entry.nachricht) {
    const who = entry.vorname
      ? `${entry.vorname}${entry.ort ? ' aus ' + entry.ort : ''}`
      : 'Anonym';
    return `„${entry.nachricht}" – ${who}`;
  }
  if (entry && entry.vorname) {
    const ort = entry.ort ? ` aus ${entry.ort}` : '';
    return `${entry.vorname}${ort} drückt die Daumen! 🤞`;
  }
  return 'Jemand drückt anonym die Daumen 🤞';
}

export function initCheer(root) {
  if (!root) return;

  const btn = root.querySelector('[data-cheer-btn]');
  const countEl = root.querySelector('[data-cheer-count]');
  const tickerEl = root.querySelector('[data-cheer-ticker]');
  const msgEl = root.querySelector('[data-cheer-msg]');
  const tip = root.querySelector('[data-cheer-tip]');
  const lanternsLayer = root.querySelector('[data-cheer-lanterns]');
  const MAX_LANTERNS = 60; // Performance-Obergrenze; bei sehr vielen Fans gedeckelt
  // Astro-Scope-Attribut (z. B. data-astro-cid-…) vom Container übernehmen,
  // damit die gescopten .cheer__lantern-Styles auch für JS-erzeugte Laternen greifen.
  const scopeAttr = lanternsLayer
    ? Array.from(lanternsLayer.attributes).map((a) => a.name).find((n) => n.startsWith('data-astro-cid-')) || null
    : null;

  // Dialog
  const dialog = root.querySelector('[data-cheer-dialog]');
  const nameInput = root.querySelector('[data-cheer-name]');
  const ortInput = root.querySelector('[data-cheer-ort]');
  const greetingInput = root.querySelector('[data-cheer-greeting]');
  const consentInput = root.querySelector('[data-cheer-consent]');
  const newsletterInput = root.querySelector('[data-cheer-newsletter]');
  const emailInput = root.querySelector('[data-cheer-email]');
  const goalFill = root.querySelector('[data-cheer-fill]');
  const goalBar = root.querySelector('[data-cheer-bar]');
  const sharePanel = root.querySelector('[data-cheer-share]');
  const sharePanelText = root.querySelector('[data-cheer-share-text]');
  const shareBtn = root.querySelector('[data-cheer-share-btn]');
  const GOAL = 2026;

  // E-Mail-Feld nur zeigen, wenn Newsletter angehakt ist
  if (newsletterInput && emailInput) {
    newsletterInput.addEventListener('change', () => {
      emailInput.hidden = !newsletterInput.checked;
      if (newsletterInput.checked) emailInput.focus();
    });
  }
  const confirmBtn = root.querySelector('[data-cheer-confirm]');
  const anonBtn = root.querySelector('[data-cheer-anon]');
  const closeBtn = root.querySelector('[data-cheer-close]');
  const dlgStatus = root.querySelector('[data-cheer-dialog-status]');

  // Dialog an den Body hängen, damit er über allem (auch dem Header) liegt.
  if (dialog && dialog.parentElement !== document.body) document.body.appendChild(dialog);

  let count = 0;
  let ticker = [];
  let busy = false;

  /* ---------- Zähler ---------- */
  function renderCount() {
    countEl.textContent = fmt.format(count);
    if (goalFill && goalBar) {
      const pct = Math.min((count / GOAL) * 100, 100);
      goalFill.style.width = pct.toFixed(1) + '%';
      goalBar.setAttribute('aria-valuenow', String(count));
    }
  }
  function animateCountTo(target) {
    if (reduced) { count = target; renderCount(); return; }
    const obj = { v: count };
    gsap.to(obj, { v: target, duration: 0.8, ease: 'power2.out', onUpdate: () => { count = Math.round(obj.v); renderCount(); } });
  }
  function setMsg(t) { if (msgEl) msgEl.textContent = t; }

  /* ---------- Ticker (rotierende Zeile) ---------- */
  let tickerTimer = null;
  let tickerIdx = 0;
  function renderTicker() {
    if (!ticker.length) { tickerEl.textContent = 'Drück als Erste/r die Daumen für unsere Jungs!'; return; }
    const e = ticker[tickerIdx % ticker.length];
    tickerEl.innerHTML = `<span class="cheer__ticker-pre">Gerade eben:</span> ${esc(labelFor(e))}`;
    tickerIdx++;
  }
  function startTicker() {
    clearInterval(tickerTimer);
    tickerIdx = 0;
    renderTicker();
    if (ticker.length > 1) tickerTimer = setInterval(renderTicker, 4200);
  }

  /* ---------- Tooltip ---------- */
  let tipTimer = null;
  function showTip(label, x, y) {
    if (!tip) return;
    tip.textContent = label;
    const r = root.getBoundingClientRect();
    tip.style.left = `${x - r.left}px`;
    tip.style.top = `${y - r.top}px`;
    tip.classList.add('is-visible');
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => tip.classList.remove('is-visible'), 3600);
  }

  /* ---------- Laternen: eine pro Daumendrücker, schwebend ---------- */
  const lanternEls = [];
  function makeLantern() {
    const el = document.createElement('span');
    el.className = 'cheer__lantern';
    if (scopeAttr) el.setAttribute(scopeAttr, '');
    const left = (4 + Math.random() * 92).toFixed(1);
    const top = (10 + Math.random() * 78).toFixed(1);
    const s = (0.4 + Math.random() * 0.45).toFixed(2);
    const dx = ((5 + Math.random() * 8) * (Math.random() < 0.5 ? -1 : 1)).toFixed(1);
    const dy = (8 + Math.random() * 10).toFixed(1);
    const dur = (7 + Math.random() * 6).toFixed(1);
    const delay = (-Math.random() * 12).toFixed(1);
    const o = (0.78 + Math.random() * 0.22).toFixed(2);
    el.style.cssText =
      `left:${left}%;top:${top}%;--s:${s};--dx:${dx}px;--dy:${dy}px;--dur:${dur}s;--delay:${delay}s;--o:${o};`;
    el.dataset.o = o;
    el.dataset.label = labelFor(null);
    el.addEventListener('click', (e) => showTip(el.dataset.label || labelFor(null), e.clientX, e.clientY));
    return el;
  }
  function renderLanterns(total) {
    if (!lanternsLayer) return;
    const target = Math.min(Math.max(0, total | 0), MAX_LANTERNS);
    // fehlende Laternen ergänzen (faden sanft ein)
    while (lanternEls.length < target) {
      const el = makeLantern();
      lanternsLayer.appendChild(el);
      lanternEls.push(el);
    }
    // überzählige entfernen
    while (lanternEls.length > target) lanternEls.pop().remove();
    // Labels neu verteilen: jüngste Cheers mit Namen zuerst, Rest anonym
    lanternEls.forEach((el, i) => { el.dataset.label = labelFor(ticker[i] || null); });
  }

  /* ---------- Laden / Re-Sync ---------- */
  function applyDemo() {
    ticker = DEMO_CHEERS.ticker.slice();
    animateCountTo(DEMO_CHEERS.count);
    renderLanterns(DEMO_CHEERS.count);
    startTicker();
  }
  async function load() {
    try {
      const data = await api.getCheers();
      const c = Number(data.count) || 0;
      const tk = Array.isArray(data.ticker) ? data.ticker : [];
      // Demo-Fallback: Backend leer → Beispiel-Daumendrücker zeigen
      if (DEMO_FALLBACK && c === 0 && tk.length === 0) {
        applyDemo();
        return;
      }
      ticker = tk;
      animateCountTo(c);
      renderLanterns(c);
      startTicker();
    } catch (e) {
      console.warn('[cheer] load fehlgeschlagen', e);
      if (DEMO_FALLBACK) applyDemo();
    }
  }

  /* ---------- Dialog ---------- */
  function openDialog() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(NAME_KEY) || '{}'); } catch {}
    if (nameInput) nameInput.value = saved.vorname || '';
    if (ortInput) ortInput.value = saved.ort || '';
    if (greetingInput) greetingInput.value = '';
    if (consentInput) consentInput.checked = false;
    if (newsletterInput) newsletterInput.checked = false;
    if (emailInput) { emailInput.value = ''; emailInput.hidden = true; }
    if (dlgStatus) { dlgStatus.textContent = ''; dlgStatus.dataset.kind = ''; }
    if (sharePanel) sharePanel.hidden = true;
    dialog.hidden = false;
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    setTimeout(() => nameInput && nameInput.focus(), 120);
  }
  function closeDialog() {
    dialog.classList.remove('is-open');
    setTimeout(() => { dialog.hidden = true; }, 260);
  }

  async function doCheer(withName) {
    if (busy) return;
    const vorname = nameInput ? nameInput.value.trim() : '';
    const ort = ortInput ? ortInput.value.trim() : '';
    const nachricht = greetingInput ? greetingInput.value.trim() : '';
    const consent = consentInput && consentInput.checked;

    // Sobald Name ODER Gruß angegeben ist, braucht es die öffentliche Zustimmung.
    if (withName && (vorname || nachricht) && !consent) {
      dlgStatus.textContent = 'Bitte das Häkchen setzen, damit Name & Gruß erscheinen dürfen.';
      dlgStatus.dataset.kind = 'err';
      return;
    }
    const useName = withName && (vorname || nachricht) && consent;

    // Newsletter (separate Einwilligung): bei Haken ist die E-Mail Pflicht.
    const wantsNewsletter = newsletterInput && newsletterInput.checked;
    const email = emailInput ? emailInput.value.trim() : '';
    if (wantsNewsletter && !/.+@.+\..+/.test(email)) {
      dlgStatus.textContent = 'Für den Newsletter bitte eine gültige E-Mail angeben (oder Haken entfernen).';
      dlgStatus.dataset.kind = 'err';
      return;
    }

    busy = true;
    if (confirmBtn) confirmBtn.disabled = true;
    if (anonBtn) anonBtn.disabled = true;

    const alreadyLocal = localStorage.getItem(votedKey()) === '1';
    if (!alreadyLocal) animateCountTo(count + 1);

    const payload = { device_id: deviceId() };
    if (useName) {
      payload.vorname = vorname;
      payload.ort = ort;
      payload.consent = true;
      if (nachricht) payload.nachricht = nachricht;
    }
    let successMsg = nachricht ? 'Dein Gruß ist unterwegs! 🤞' : 'Daumen sind gedrückt! 🤞';
    if (wantsNewsletter) successMsg += ' Infos kommen per Mail.';

    // Newsletter separat anstoßen (Double-Opt-in übernimmt der ESP); fehlertolerant.
    const signupNewsletter = async () => {
      if (!wantsNewsletter || !email) return;
      try { await api.postNewsletter({ email, consent: true }); }
      catch (err) { console.warn('[cheer] newsletter fehlgeschlagen', err); }
    };

    try {
      const data = await api.postCheer(payload);
      localStorage.setItem(votedKey(), '1');
      if (useName) localStorage.setItem(NAME_KEY, JSON.stringify({ vorname, ort }));
      ticker = Array.isArray(data.ticker) ? data.ticker : ticker;
      animateCountTo(Number(data.count) || count);
      renderLanterns(Number(data.count) || count); // ggf. neue Laterne (faded ein)
      startTicker();
      setMsg(data.already ? 'Du bist schon dabei – danke! 🤞' : successMsg);
      signupNewsletter();
      showSharePanel(useName ? vorname : '');
      closeDialog();
    } catch (e) {
      console.warn('[cheer] post fehlgeschlagen', e);
      if (DEMO_FALLBACK) {
        // Demo ohne Backend: Erfolg simulieren (Zähler bleibt erhöht, Laterne erscheint)
        localStorage.setItem(votedKey(), '1');
        if (useName) {
          localStorage.setItem(NAME_KEY, JSON.stringify({ vorname, ort }));
          ticker = [{ vorname, ort, nachricht }, ...ticker];
        }
        renderLanterns(count);
        startTicker();
        setMsg(successMsg);
        signupNewsletter();
        showSharePanel(useName ? vorname : '');
        closeDialog();
      } else {
        if (dlgStatus) { dlgStatus.textContent = 'Hat nicht geklappt – bitte später nochmal.'; dlgStatus.dataset.kind = 'err'; }
        load();
      }
    } finally {
      busy = false;
      if (confirmBtn) confirmBtn.disabled = false;
      if (anonBtn) anonBtn.disabled = false;
    }
  }

  /* ---------- Teilen-Panel ---------- */
  function showSharePanel(vorname) {
    if (!sharePanel) return;
    const who = vorname ? ` mit ${vorname}` : '';
    if (sharePanelText) sharePanelText.textContent = `Deine Laterne fliegt${who}! 🏮`;
    const shareUrl = window.location.href.split('?')[0];
    sharePanel.dataset.shareMsg = (vorname
      ? `${vorname} drückt die Daumen für Marc-Aurel & Lennard bei den WorldSkills 2026 in Shanghai! 🏮 `
      : 'Ich drücke die Daumen für Marc-Aurel & Lennard bei den WorldSkills 2026! 🏮 '
    ) + shareUrl;
    sharePanel.hidden = false;
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const text = sharePanel ? sharePanel.dataset.shareMsg : '';
      const url = window.location.href.split('?')[0];
      if (navigator.share) {
        try { await navigator.share({ title: 'Road to Shanghai – WorldSkills 2026', text, url }); } catch {}
      } else {
        try {
          await navigator.clipboard.writeText(text || url);
          const orig = shareBtn.innerHTML;
          shareBtn.textContent = 'Kopiert! ✓';
          setTimeout(() => { shareBtn.innerHTML = orig; }, 2400);
        } catch {}
      }
    });
  }

  btn.addEventListener('click', openDialog);
  if (confirmBtn) confirmBtn.addEventListener('click', () => doCheer(true));
  if (anonBtn) anonBtn.addEventListener('click', () => doCheer(false));
  if (closeBtn) closeBtn.addEventListener('click', closeDialog);
  if (dialog) dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dialog && !dialog.hidden) closeDialog(); });

  // Live halten
  setInterval(() => { if (document.visibilityState === 'visible') load(); }, 20000);

  load();
}
