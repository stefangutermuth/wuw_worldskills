/**
 * Split-Flap-Countdown bis zum WM-Start.
 * Ziel: 2026-09-22T00:00:00+08:00 (Shanghai-Zeit, NECC).
 *
 * Logik = setInterval, Optik = CSS-Flip (siehe Countdown.astro).
 * Jede Stelle ist eine eigene Flip-Karte; es flippt nur, was sich ändert.
 */

const TARGET = new Date('2026-09-22T00:00:00+08:00').getTime();

const FIELDS = [
  { key: 'days', label: 'Tage', digits: 3 },
  { key: 'hours', label: 'Stunden', digits: 2 },
  { key: 'minutes', label: 'Minuten', digits: 2 },
  { key: 'seconds', label: 'Sekunden', digits: 2 },
];

function buildCard(initial = '0') {
  const card = document.createElement('span');
  card.className = 'flap';
  card.dataset.value = initial;
  card.innerHTML = `
    <span class="flap__static flap__static--top"><i>${initial}</i></span>
    <span class="flap__static flap__static--bottom"><i>${initial}</i></span>
    <span class="flap__fold flap__fold--front"><i>${initial}</i></span>
    <span class="flap__fold flap__fold--back"><i>${initial}</i></span>`;
  return card;
}

function setCard(card, next) {
  const current = card.dataset.value;
  if (current === next) return;

  const top = card.querySelector('.flap__static--top i');
  const bottom = card.querySelector('.flap__static--bottom i');
  const front = card.querySelector('.flap__fold--front');
  const back = card.querySelector('.flap__fold--back');
  const frontI = front.querySelector('i');
  const backI = back.querySelector('i');

  // reduced-motion oder kein Anim-Support → hart setzen
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    top.textContent = next;
    bottom.textContent = next;
    frontI.textContent = next;
    backI.textContent = next;
    card.dataset.value = next;
    return;
  }

  // Ausgangslage: front zeigt current (oben), back zeigt next (unten, hochgeklappt)
  frontI.textContent = current;
  backI.textContent = next;
  top.textContent = next; // obere Hälfte wird sofort auf next gesetzt (vom Front-Flap verdeckt)
  bottom.textContent = current; // untere Hälfte zeigt noch current

  card.classList.remove('is-flipping');
  // reflow erzwingen, damit die Animation neu startet
  void card.offsetWidth;
  card.classList.add('is-flipping');

  const onEnd = () => {
    bottom.textContent = next;
    frontI.textContent = next; // Ruhelage: Front-Flap zeigt nun den neuen Wert
    card.classList.remove('is-flipping');
    card.dataset.value = next;
    back.removeEventListener('animationend', onEnd);
  };
  back.addEventListener('animationend', onEnd);
}

function pad(num, len) {
  return String(Math.max(0, num)).padStart(len, '0');
}

export function initCountdown(root) {
  if (!root) return;

  // Felder + Karten aufbauen
  const cards = {};
  let first = true;
  for (const field of FIELDS) {
    // Doppelpunkt-Trenner zwischen den Gruppen (rein dekorativ)
    if (!first) {
      const sep = document.createElement('span');
      sep.className = 'cd-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = ':';
      root.appendChild(sep);
    }
    first = false;

    const group = document.createElement('div');
    group.className = 'cd-group';

    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'cd-cards';
    cards[field.key] = [];
    for (let i = 0; i < field.digits; i++) {
      const card = buildCard('0');
      cardsWrap.appendChild(card);
      cards[field.key].push(card);
    }

    const label = document.createElement('div');
    label.className = 'cd-label';
    label.textContent = field.label;

    group.append(cardsWrap, label);
    root.appendChild(group);
  }

  function render() {
    const diff = TARGET - Date.now();
    const clamped = Math.max(0, diff);
    const totalSec = Math.floor(clamped / 1000);

    const values = {
      days: pad(Math.floor(totalSec / 86400), 3),
      hours: pad(Math.floor((totalSec % 86400) / 3600), 2),
      minutes: pad(Math.floor((totalSec % 3600) / 60), 2),
      seconds: pad(totalSec % 60, 2),
    };

    for (const field of FIELDS) {
      const str = values[field.key];
      cards[field.key].forEach((card, i) => setCard(card, str[i]));
    }

    if (diff <= 0) {
      clearInterval(timer);
      root.classList.add('cd--reached');
    }
  }

  render();
  const timer = setInterval(render, 1000);
}
