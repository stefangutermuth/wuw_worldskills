/**
 * Newsletter-Mails im Wirth-&-Wiener-Look (Plugin „Newsletter" auf wirth-wiener.de).
 *
 *   node marketing/newsletter/build.cjs
 *
 * Erzeugt in marketing/newsletter/dist/:
 *   template.html            Rahmen für ALLE Service-Mails (Platzhalter {message})
 *   msg-confirmation.html    Bestätigung (Double-Opt-in)
 *   msg-welcome.html         Willkommen nach der Bestätigung
 *   msg-goodbye.html         Abmeldebestätigung
 *   newsletter-wm-woche.html Newsletter-Vorlage (komplett, ohne Rahmen-Platzhalter)
 *   preview-*.html           Vorschauen mit Beispielwerten statt Plugin-Platzhaltern
 *
 * Bewusst KEINE Web-Fonts (Google Fonts würde beim Öffnen die IP an Google senden).
 * Montserrat/Open Sans greifen, wo installiert, sonst Systemschrift.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'dist');
fs.mkdirSync(OUT, { recursive: true });

// ---- Wirth & Wiener (aus wirth-wiener.de, Theme „wuw") ----
const C = {
  primary: '#07886a',
  primaryDark: '#06745a',
  secondary: '#376484',
  ink: '#2b2c36',
  body: '#4e5663',
  muted: '#8a8d98',
  line: '#e3e7ea',
  surface: '#f2f4f5',
  white: '#ffffff',
};
const F = {
  display: "Montserrat, 'Segoe UI', Helvetica, Arial, sans-serif",
  body: "'Open Sans', 'Segoe UI', Helvetica, Arial, sans-serif",
};
const ASSETS = 'https://wirth-wiener.de/wp-content/uploads/newsletter-rts';
const SITE = 'https://shanghai.wirth-wiener.de/';

// ---- Bausteine ----
const preheader = (t) =>
  `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.surface};opacity:0">${t}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>`;

const eyebrow = (t) =>
  `<p style="margin:0 0 12px;font-family:${F.display};font-size:11px;line-height:16px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.primary}">${t}</p>`;

const h1 = (t) =>
  `<h1 style="margin:0 0 20px;font-family:${F.display};font-size:24px;line-height:32px;font-weight:600;color:${C.ink}">${t}</h1>`;

const h2 = (t) =>
  `<h2 style="margin:0 0 10px;font-family:${F.display};font-size:17px;line-height:24px;font-weight:600;color:${C.ink}">${t}</h2>`;

const p = (t, extra = '') =>
  `<p style="margin:0 0 16px;font-family:${F.body};font-size:15px;line-height:25px;color:${C.body};${extra}">${t}</p>`;

const small = (t) =>
  `<p style="margin:0 0 12px;font-family:${F.body};font-size:13px;line-height:20px;color:${C.muted}">${t}</p>`;

const link = (href, t, color = C.primary) =>
  `<a href="${href}" style="color:${color};text-decoration:underline">${t}</a>`;

// „Bulletproof"-Button: Tabelle + bgcolor, klappt auch in Outlook
const button = (href, label, variant = 'solid') => {
  const solid = variant === 'solid';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px">
  <tr><td align="center" bgcolor="${solid ? C.primary : C.white}" style="border-radius:4px;${solid ? '' : `border:1px solid ${C.primary};`}">
    <a href="${href}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:${F.display};font-size:14px;line-height:20px;font-weight:600;letter-spacing:0.3px;color:${solid ? C.white : C.primary};text-decoration:none;border-radius:4px">${label}</a>
  </td></tr></table>`;
};

const divider = () =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 28px"><tr><td style="border-top:1px solid ${C.line};font-size:0;line-height:0">&nbsp;</td></tr></table>`;

const infobox = (inner) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px">
  <tr><td style="background:${C.surface};border-radius:6px;padding:20px 22px">${inner}</td></tr></table>`;

const signature = () =>
  p(`Herzliche Grüße<br><strong style="color:${C.ink};font-weight:600">Wirth &amp; Wiener GmbH</strong><br><span style="color:${C.muted}">Garten- und Landschaftsbau · Chemnitz</span>`, 'margin-top:28px');

// ---- Rahmen (für alle Mails gleich) ----
function frame(content, { footerExtra = '' } = {}) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="de">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Road to Shanghai · Wirth &amp; Wiener</title>
<style type="text/css">
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  img { border:0; outline:none; text-decoration:none; }
  a { color:${C.primary}; }
  @media only screen and (max-width:620px) {
    .ww-card { border-radius:0 !important; border-left:0 !important; border-right:0 !important; }
    .ww-pad { padding-left:24px !important; padding-right:24px !important; }
    .ww-outer { padding:0 !important; }
    .ww-hero img { width:100% !important; height:auto !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.surface}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.surface}" style="background:${C.surface}">
  <tr><td class="ww-outer" align="center" style="padding:32px 16px">

    <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
    <table role="presentation" class="ww-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.white};border:1px solid ${C.line};border-radius:8px;overflow:hidden">
      <tr><td style="height:4px;background:${C.primary};font-size:0;line-height:0">&nbsp;</td></tr>
      <tr><td class="ww-pad" style="padding:28px 44px 22px">
        <a href="https://wirth-wiener.de/" target="_blank" style="text-decoration:none"><img src="${ASSETS}/ww-logo@2x.png" width="200" height="32" alt="Wirth &amp; Wiener GmbH" style="display:block;width:200px;height:32px" /></a>
      </td></tr>
      <tr><td style="border-top:1px solid ${C.line};font-size:0;line-height:0">&nbsp;</td></tr>
      ${content}
    </table>

    <table role="presentation" class="ww-foot" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
      <tr><td class="ww-pad" align="center" style="padding:24px 44px 8px;font-family:${F.body};font-size:12px;line-height:19px;color:${C.muted}">
        ${footerExtra}
        Wirth &amp; Wiener GmbH · Am Erlenwald 4 · 09128 Chemnitz<br />
        ${link('https://wirth-wiener.de/', 'wirth-wiener.de', C.muted)} &nbsp;·&nbsp; ${link('https://wirth-wiener.de/impressum/', 'Impressum', C.muted)} &nbsp;·&nbsp; ${link('https://wirth-wiener.de/datenschutzerklaerung/', 'Datenschutz', C.muted)}
      </td></tr>
    </table>
    <!--[if mso]></td></tr></table><![endif]-->

  </td></tr>
</table>
</body>
</html>`;
}

// Inhaltsbereich im Rahmen (Padding innen)
const section = (inner, pad = '36px 44px 36px') =>
  `<tr><td class="ww-pad" style="padding:${pad}">${inner}</td></tr>`;

// ---- Service-Mails (landen im {message} des Rahmens) ----
const EYEBROW = 'Road to Shanghai · WorldSkills 2026';

const msgConfirmation = (
  preheader('Nur noch ein Klick – bestätige deine Anmeldung zum Newsletter „Road to Shanghai“.') +
  eyebrow(EYEBROW) +
  h1('Nur noch ein Klick') +
  p('Schön, dass du Marc-Aurel Spalek und Lennard Weitzmann auf dem Weg zur Berufe-Weltmeisterschaft in Shanghai begleiten möchtest.') +
  p('Bitte bestätige deine Anmeldung, damit wir dir die Neuigkeiten schicken dürfen:') +
  button('{subscription_confirm_url}', 'Anmeldung bestätigen') +
  small(`Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br /><span style="word-break:break-all">{subscription_confirm_url}</span>`) +
  small('Du hast dich nicht angemeldet? Dann ignoriere diese E-Mail einfach – ohne Bestätigung erhältst du nichts von uns.') +
  signature()
);

const msgWelcome = (
  preheader('Deine Anmeldung ist bestätigt – ab jetzt bist du bei „Road to Shanghai“ ganz nah dran.') +
  eyebrow(EYEBROW) +
  h1('Schön, dass du dabei bist') +
  p('Deine Anmeldung ist bestätigt. Ab jetzt erfährst du als Erstes, wie es Marc-Aurel und Lennard bei der WorldSkills 2026 in Shanghai ergeht – vom Wettkampfauftakt bis zur Siegerehrung.') +
  infobox(
    `<p style="margin:0 0 8px;font-family:${F.display};font-size:11px;line-height:16px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.secondary}">Die WM-Woche</p>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
      <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Di 22.09.</td><td style="padding:3px 0 3px 12px">Eröffnung</td></tr>
      <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Mi–Sa 23.–26.09.</td><td style="padding:3px 0 3px 12px">Vier Wettkampftage</td></tr>
      <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">So 27.09.</td><td style="padding:3px 0 3px 12px">Siegerehrung</td></tr>
    </table>`
  ) +
  p('Alle Bilder, die Reise und das Daumendrücken findest du jederzeit auf der Shanghai-Seite:') +
  button(SITE, 'Zur Shanghai-Seite') +
  signature() +
  small(`Du möchtest keine E-Mails mehr erhalten? ${link('{unsubscription_url}', 'Hier abmelden', C.muted)}.`)
);

const msgGoodbye = (
  preheader('Du bist vom Newsletter „Road to Shanghai“ abgemeldet.') +
  eyebrow(EYEBROW) +
  h1('Du bist abgemeldet') +
  p('Wir haben dich aus dem Verteiler „Road to Shanghai“ entfernt. Du erhältst keine weiteren E-Mails von uns.') +
  p('War das ein Versehen? Dann kannst du dich jederzeit wieder anmelden:') +
  button(SITE + '#newsletter', 'Wieder anmelden', 'outline') +
  signature()
);

// ---- Newsletter-Vorlage (eigenes, vollständiges HTML) ----
const newsletter = frame(
  `<tr><td class="ww-hero" style="padding:0;font-size:0;line-height:0">
     <a href="${SITE}" target="_blank"><img src="${ASSETS}/rts-hero-teamgermany.jpg" width="600" height="499" alt="Team Germany bei der WorldSkills 2026 vor einem chinesischen Pavillon in Shanghai" style="display:block;width:100%;max-width:600px;height:auto" /></a>
   </td></tr>
  <!-- Bildnachweis fürs Team-Germany-Foto ergänzen, sobald der Urheber feststeht -->` +
  section(
    preheader('Eröffnung am 22. September, kein Livestream – so bleibst du trotzdem ganz nah dran.') +
    eyebrow('Road to Shanghai · Update') +
    h1('Die WM-Woche beginnt') +
    p('Am 22. September wird die WorldSkills 2026 in Shanghai eröffnet, ab dem 23. September bauen Marc-Aurel Spalek und Lennard Weitzmann vier Tage lang ihren Wettbewerbsgarten. 20 Zweierteams aus 20 Ländern treten im Skill 37 „Landscape Gardening“ an – eines davon kommt aus dem Erzgebirge.') +
    infobox(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Di 22.09.</td><td style="padding:3px 0 3px 12px">Eröffnung</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Mi–Sa 23.–26.09.</td><td style="padding:3px 0 3px 12px">Vier Wettkampftage</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">So 27.09.</td><td style="padding:3px 0 3px 12px">Siegerehrung</td></tr>
      </table>`
    ) +
    h2('Die Generalprobe') +
    p('Beim letzten Training haben die beiden einen Garten nach chinesischem Vorbild gebaut – mit Holztor, Natursteinpflaster und Teich. 22 Stunden, genau so viel Zeit wie auf der Wettbewerbsbaustelle in Shanghai. Am selben Tag übergab der Verband Garten-, Landschafts- und Sportplatzbau Sachsen 7.000 Euro: zusammengekommen aus rund 10.000 verkauften Flaschen Landschaftsgärtner-Limonade und 1.500 Euro vom Freistaat Sachsen.') +
    divider() +
    h2('Kein Livestream – so bist du dabei') +
    p(`Aus Shanghai wird nicht live übertragen, damit die Teams ungestört arbeiten können. Die Bilder kommen trotzdem: Team Germany berichtet auf ${link('https://www.instagram.com/worldskills_germany/', 'Instagram')}, die Landschaftsgärtner zeigen täglich den Baufortschritt auf ${link('https://www.instagram.com/die_landschaftsgaertner/', 'Instagram')} und ${link('https://www.facebook.com/dielandschaftsgaertner', 'Facebook')} – und auf unserer Shanghai-Seite findest du alle Berichte von Marc-Aurel und Lennard.`) +
    divider() +
    h2('Drück die Daumen') +
    p('Für jeden, der den beiden die Daumen drückt, steigt auf unserer Seite eine Laterne auf. Hilf uns, das Ziel von 70 Laternen zu erreichen.') +
    button(SITE + '#daumendruecken', 'Daumen drücken') +
    signature()
  ),
  {
    footerExtra: `Du erhältst diese E-Mail, weil du dich auf ${link(SITE, 'shanghai.wirth-wiener.de', C.muted)} angemeldet hast.<br />
      ${link('{unsubscription_url}', 'Newsletter abbestellen', C.muted)} &nbsp;·&nbsp; ${link('{profile_url}', 'Daten ändern', C.muted)}<br /><br />`,
  }
);

// ---- Dateien schreiben ----
// {message} sitzt in einer gepolsterten Zelle – so passen auch plugin-eigene Mails
// (z. B. „E-Mail-Adresse geändert“), die nur <p>-Absätze liefern, ins Design.
const template = frame(section('{message}'));
const write = (name, html) => fs.writeFileSync(path.join(OUT, name), html);
write('template.html', template);
write('msg-confirmation.html', msgConfirmation);
write('msg-welcome.html', msgWelcome);
write('msg-goodbye.html', msgGoodbye);
write('newsletter-wm-woche.html', newsletter);

// Vorschau: Plugin-Platzhalter durch Beispielwerte ersetzen
const demo = (html) => html
  .replace(/\{subscription_confirm_url\}/g, 'https://wirth-wiener.de/wp-admin/admin-ajax.php?action=tnp&amp;na=c&amp;nk=12-3a4b5c6d7e')
  .replace(/\{unsubscription_url\}/g, '#abmelden')
  .replace(/\{profile_url\}/g, '#profil');
write('preview-1-bestaetigung.html', demo(template.replace('{message}', msgConfirmation)));
write('preview-2-willkommen.html', demo(template.replace('{message}', msgWelcome)));
write('preview-3-abmeldung.html', demo(template.replace('{message}', msgGoodbye)));
write('preview-4-newsletter.html', demo(newsletter));

for (const f of fs.readdirSync(OUT).sort()) console.log(f.padEnd(28), fs.statSync(path.join(OUT, f)).size, 'Bytes');
