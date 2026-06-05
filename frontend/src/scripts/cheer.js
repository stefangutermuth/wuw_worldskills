/**
 * Dynamic Island „Daumendrücken".
 *
 * Prinzip (§A3/§B5): Der Zähler wird IMMER serverseitig gerechnet. Der Browser
 * zeigt beim Tap optimistisch sofort +1 und ersetzt den Wert danach durch den
 * autoritativen Count aus der Antwort. Dedup (1×/Gerät/Tag) liegt im Backend;
 * der Button wird hier nur kurz gesperrt.
 */
import { gsap } from 'gsap';
import { api } from '../lib/api.js';

const fmt = new Intl.NumberFormat('de-DE');
const DEVICE_KEY = 'rts_device';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function votedKey() {
  return `rts_voted_${new Date().toISOString().slice(0, 10)}`;
}

function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : `d${Date.now()}${Math.floor(Math.random() * 1e6)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function initCheer(root) {
  if (!root) return;

  const btn = root.querySelector('[data-cheer-btn]');
  const countEl = root.querySelector('[data-cheer-count]');
  const tickerEl = root.querySelector('[data-cheer-ticker]');
  const launchLayer = root.querySelector('[data-lantern-launch]');
  const canvas = root.querySelector('[data-cheer-canvas]');
  const nameInput = root.querySelector('[data-cheer-name]');
  const ortInput = root.querySelector('[data-cheer-ort]');
  const consentInput = root.querySelector('[data-cheer-consent]');
  const nameSubmit = root.querySelector('[data-cheer-name-submit]');
  const nameStatus = root.querySelector('[data-cheer-name-status]');
  const msgEl = root.querySelector('[data-cheer-msg]');

  let count = 0;
  let ticker = [];
  let busy = false;

  function renderCount() {
    countEl.textContent = fmt.format(count);
  }

  function animateCountTo(target) {
    if (reduced) {
      count = target;
      renderCount();
      return;
    }
    const obj = { v: count };
    gsap.to(obj, {
      v: target,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        count = Math.round(obj.v);
        renderCount();
      },
    });
  }

  // ---- Ticker ----
  let tickerTimer = null;
  let tickerIdx = 0;
  function renderTicker() {
    if (!ticker.length) {
      tickerEl.textContent = 'Drück als Erste/r die Daumen für unsere Jungs!';
      return;
    }
    const e = ticker[tickerIdx % ticker.length];
    const ort = e.ort ? ` aus ${e.ort}` : '';
    tickerEl.innerHTML = `<span class="cheer__ticker-pre">Gerade eben:</span> ${escapeHtml(
      e.vorname
    )}${escapeHtml(ort)} drückt die Daumen! 🤞`;
    tickerIdx++;
  }
  function startTicker() {
    clearInterval(tickerTimer);
    tickerIdx = 0;
    renderTicker();
    if (ticker.length > 1) tickerTimer = setInterval(renderTicker, 4200);
  }

  // ---- Tap-Laterne ----
  function launchLantern() {
    if (reduced || !launchLayer) return;
    const el = document.createElement('span');
    el.className = 'cheer-lantern';
    el.style.left = `calc(50% + ${Math.random() * 44 - 22}px)`;
    launchLayer.appendChild(el);

    const rise = window.innerHeight * 0.8;
    gsap.fromTo(
      el,
      { y: 0, opacity: 0, scale: 0.55 },
      {
        y: -rise,
        opacity: 1,
        scale: 1,
        duration: 4 + Math.random() * 2,
        ease: 'power1.out',
        onComplete: () => el.remove(),
      }
    );
    gsap.to(el, { x: Math.random() * 70 - 35, duration: 5, ease: 'sine.inOut' });
    gsap.to(el, { opacity: 0, delay: 3.2, duration: 1.6 });
  }

  // ---- Laden / Re-Sync ----
  async function load() {
    try {
      const data = await api.getCheers();
      ticker = Array.isArray(data.ticker) ? data.ticker : [];
      animateCountTo(Number(data.count) || 0);
      startTicker();
    } catch (e) {
      console.warn('[cheer] load fehlgeschlagen', e);
    }
  }

  function setMsg(text) {
    if (msgEl) msgEl.textContent = text;
  }
  function setNameStatus(text, kind) {
    if (!nameStatus) return;
    nameStatus.textContent = text;
    nameStatus.dataset.kind = kind || '';
  }

  // ---- Daumen-Button (anonym, nur Zähler) ----
  async function cheer() {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    btn.classList.add('is-pressed');

    launchLantern();

    const alreadyLocal = localStorage.getItem(votedKey()) === '1';
    if (!alreadyLocal) animateCountTo(count + 1); // optimistisch

    try {
      const data = await api.postCheer({ device_id: deviceId() });
      localStorage.setItem(votedKey(), '1');
      ticker = Array.isArray(data.ticker) ? data.ticker : ticker;
      animateCountTo(Number(data.count) || count); // autoritativ
      startTicker();
      root.dataset.state = data.already ? 'already' : 'cheered';
      setMsg(data.already ? 'Du bist heute schon dabei – danke! 🤞' : 'Daumen sind gedrückt! 🤞');
    } catch (e) {
      console.warn('[cheer] post fehlgeschlagen', e);
      load(); // optimistischen Wert wieder mit Server abgleichen
    } finally {
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('is-pressed');
        busy = false;
      }, 900);
    }
  }

  // ---- „Im Ticker eintragen" (Name – unabhängig, auch nachträglich) ----
  async function submitName() {
    const vorname = nameInput ? nameInput.value.trim() : '';
    const ort = ortInput ? ortInput.value.trim() : '';

    if (!vorname) {
      setNameStatus('Bitte gib deinen Vornamen ein.', 'err');
      return;
    }
    if (!consentInput || !consentInput.checked) {
      setNameStatus('Bitte setz das Häkchen, damit dein Name erscheinen darf.', 'err');
      return;
    }

    if (nameSubmit) nameSubmit.disabled = true;
    setNameStatus('Wird eingetragen …', '');
    launchLantern();

    const alreadyLocal = localStorage.getItem(votedKey()) === '1';
    if (!alreadyLocal) animateCountTo(count + 1);

    try {
      const data = await api.postCheer({ device_id: deviceId(), vorname, ort, consent: true });
      localStorage.setItem(votedKey(), '1');
      ticker = Array.isArray(data.ticker) ? data.ticker : ticker;
      animateCountTo(Number(data.count) || count);
      startTicker();
      setNameStatus(`Danke, ${vorname}! Du erscheinst jetzt im Ticker. 🎉`, 'ok');
      setMsg('Daumen sind gedrückt! 🤞');
    } catch (e) {
      console.warn('[cheer] name-post fehlgeschlagen', e);
      setNameStatus('Hat nicht geklappt – bitte später nochmal.', 'err');
      load();
    } finally {
      if (nameSubmit) setTimeout(() => { nameSubmit.disabled = false; }, 600);
    }
  }

  btn.addEventListener('click', cheer);
  if (nameSubmit) nameSubmit.addEventListener('click', submitName);

  // Live halten: periodischer Re-Sync, nur wenn Tab sichtbar.
  setInterval(() => {
    if (document.visibilityState === 'visible') load();
  }, 20000);

  if (canvas && !reduced) initAmbient(canvas, root);

  load();
}

/* ------------------------------------------------------------------ */
/* Ambient-Laternenhimmel als Canvas-Partikel (kein hunderter DOM)     */
/* ------------------------------------------------------------------ */
function initAmbient(canvas, root) {
  const ctx = canvas.getContext('2d');
  const COUNT = window.matchMedia('(max-width: 767px)').matches ? 16 : 30;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let parts = [];
  let raf = null;
  let visible = true;
  let last = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.max(1, w * dpr);
    canvas.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function mk(seed) {
    return {
      x: Math.random() * w,
      y: seed ? Math.random() * h : h + 20,
      r: 2 + Math.random() * 3,
      sp: 8 + Math.random() * 18,
      drift: (Math.random() - 0.5) * 10,
      a: 0.35 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
    };
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.sp * dt;
      p.x += Math.sin(now / 1000 + p.ph) * p.drift * dt;
      if (p.y < -20) Object.assign(p, mk(false));
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(255, 210, 130, ${p.a})`);
      g.addColorStop(0.5, `rgba(201, 162, 75, ${p.a * 0.5})`);
      g.addColorStop(1, 'rgba(201, 162, 75, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = visible ? requestAnimationFrame(frame) : null;
  }

  resize();
  parts = Array.from({ length: COUNT }, () => mk(true));
  window.addEventListener('resize', resize);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    { threshold: 0.01 }
  );
  io.observe(root);

  raf = requestAnimationFrame(frame);
}
