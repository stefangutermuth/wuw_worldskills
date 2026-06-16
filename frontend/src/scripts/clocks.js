/**
 * Zwei-Zeitzonen-Uhr (Chemnitz / Shanghai), seitenweit.
 * Aktualisiert ALLE Elemente mit [data-clock-de] / [data-clock-cn]
 * (z. B. Header). Minutengenau, Tick alle 30 s.
 */
function clockFactory(tz) {
  const fmt = new Intl.DateTimeFormat('de-DE', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return () => fmt.format(new Date());
}

export function initClocks() {
  const de = document.querySelectorAll('[data-clock-de]');
  const cn = document.querySelectorAll('[data-clock-cn]');
  if (!de.length && !cn.length) return;

  const fmtDe = clockFactory('Europe/Berlin');
  const fmtCn = clockFactory('Asia/Shanghai');

  const tick = () => {
    const d = fmtDe();
    const c = fmtCn();
    de.forEach((el) => { el.textContent = d; });
    cn.forEach((el) => { el.textContent = c; });
  };

  tick();
  setInterval(tick, 1000 * 30);
}
