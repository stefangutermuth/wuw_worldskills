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
 *   newsletter-*.html        Newsletter (komplett, ohne Rahmen-Platzhalter)
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
   <tr><td class="ww-pad" align="right" style="padding:8px 44px 0;font-family:${F.body};font-size:11px;line-height:16px;color:${C.muted}">Foto: Instagram <a href="https://www.instagram.com/worldskills_germany/" target="_blank" style="color:${C.muted};text-decoration:underline">@worldskills_germany</a></td></tr>` +
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

// ---- Newsletter 2: Eröffnungsfeier live (Versand Di 22.09.2026, 06:30 – daher „heute") ----
// Stream: offizieller Kanal „WorldSkills" auf YouTube, Start 22.09.2026 12:00 UTC (= 14:00 MESZ / 20:00 Shanghai)
const STREAM = 'https://www.youtube.com/watch?v=8CnEnzlDPfw';
const newsletterEroeffnung = frame(
  `<tr><td class="ww-hero" style="padding:0;font-size:0;line-height:0">
     <a href="${STREAM}" target="_blank"><img src="${ASSETS}/rts-opening-ceremony.jpg" width="600" height="270" alt="WorldSkills 2026 Opening Ceremony – 22. September 2026, live auf YouTube" style="display:block;width:100%;max-width:600px;height:auto" /></a>
   </td></tr>
   <tr><td class="ww-pad" align="right" style="padding:8px 44px 0;font-family:${F.body};font-size:11px;line-height:16px;color:${C.muted}">Grafik: WorldSkills</td></tr>` +
  section(
    preheader('Heute um 14 Uhr läuft die Eröffnungsfeier der WorldSkills 2026 live auf YouTube.') +
    eyebrow('Road to Shanghai · Heute live') +
    h1('Heute live: die Eröffnung in Shanghai') +
    p('Jetzt wird es ernst: Heute wird die WorldSkills 2026 in Shanghai feierlich eröffnet – und du kannst live dabei sein. WorldSkills überträgt die Eröffnungsfeier auf YouTube. Halte Ausschau nach Team Germany: Mit dabei sind Marc-Aurel Spalek und Lennard Weitzmann.') +
    infobox(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Wann</td><td style="padding:3px 0 3px 12px"><strong style="color:${C.ink}">Heute, 14:00 Uhr</strong> (in Shanghai ist es dann 20:00 Uhr)</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Wo</td><td style="padding:3px 0 3px 12px">Live auf YouTube, Kanal „WorldSkills"</td></tr>
      </table>`
    ) +
    button(STREAM, 'Heute live verfolgen') +
    small(`Der Link führt zu YouTube. Falls der Button nicht funktioniert: ${link(STREAM, 'youtube.com/watch?v=8CnEnzlDPfw', C.muted)}`) +
    divider() +
    h2('Und danach?') +
    p('Ab morgen bauen Marc-Aurel und Lennard vier Tage lang ihren Wettbewerbsgarten, am Sonntag ist Siegerehrung. Die Wettkampftage selbst werden nicht übertragen – Berichte und Bilder findest du auf unserer Shanghai-Seite.') +
    infobox(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Heute, Di 22.09.</td><td style="padding:3px 0 3px 12px">Eröffnung – live ab 14:00 Uhr</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Mi–Sa 23.–26.09.</td><td style="padding:3px 0 3px 12px">Vier Wettkampftage</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">So 27.09.</td><td style="padding:3px 0 3px 12px">Siegerehrung</td></tr>
      </table>`
    ) +
    button(SITE, 'Zur Shanghai-Seite', 'outline') +
    signature()
  ),
  {
    footerExtra: `Du erhältst diese E-Mail, weil du dich auf ${link(SITE, 'shanghai.wirth-wiener.de', C.muted)} angemeldet hast.<br />
      ${link('{unsubscription_url}', 'Newsletter abbestellen', C.muted)} &nbsp;·&nbsp; ${link('{profile_url}', 'Daten ändern', C.muted)}<br /><br />`,
  }
);

// ---- Newsletter 3: Eröffnung zum Nachschauen + Tag 1 (Versand Mi 23.09.2026 morgens – daher „heute“) ----
// Fotos: Wirth & Wiener (mitgereiste Fans, 22.09.2026). Bild 5 (Lanyards, evtl. Team Germany) bewusst nicht verwendet.
const photo = (src, w, h, alt, href) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px">
  <tr><td style="font-size:0;line-height:0">${href ? `<a href="${href}" target="_blank">` : ''}<img src="${ASSETS}/${src}" width="${w}" height="${h}" alt="${alt}" style="display:block;width:100%;max-width:${w}px;height:auto;border-radius:6px" />${href ? '</a>' : ''}</td></tr></table>`;
const TAGEBUCH = SITE + '#tag-2209';
const TAGEBUCH_TAG1 = SITE + '#tag-2309';
const newsletterTag1 = frame(
  `<tr><td class="ww-hero" style="padding:0;font-size:0;line-height:0">
     <a href="${STREAM}" target="_blank"><img src="${ASSETS}/rts-eroeffnung-hero.jpg" width="600" height="338" alt="Blick in die Arena bei der Eröffnungsfeier der WorldSkills 2026 in Shanghai" style="display:block;width:100%;max-width:600px;height:auto" /></a>
   </td></tr>
   <tr><td class="ww-pad" align="right" style="padding:8px 44px 0;font-family:${F.body};font-size:11px;line-height:16px;color:${C.muted}">Foto: Wirth &amp; Wiener</td></tr>` +
  section(
    preheader('Die Eröffnungsfeier zum Nachschauen, Bilder vom Fanblock – und heute ist der erste Wettkampftag.') +
    eyebrow('Road to Shanghai · Tag 1') +
    h1('Die Eröffnung ist gefeiert – jetzt wird gebaut') +
    p('Gestern wurde die 48. WorldSkills in Shanghai eröffnet: eine große Show in der Arena, Teilnehmende aus über 70 Ländern und Regionen – und mittendrin Marc-Aurel Spalek und Lennard Weitzmann mit Team Germany. Wer die Feier verpasst hat oder noch einmal reinschauen will: Die komplette Aufzeichnung gibt es auf YouTube.') +
    button(STREAM, 'Eröffnungsfeier nachschauen') +
    small(`Aufzeichnung auf dem YouTube-Kanal „WorldSkills“ · 1&nbsp;Std. 53&nbsp;Min. Auch auf unserer ${link(SITE + '#route', 'Shanghai-Seite', C.muted)} unter „Die Reise“.`) +
    divider() +
    h2('Unser Fanblock in Shanghai') +
    photo('rts-fanshirts.jpg', 512, 320, 'Mitgereiste Fans von Wirth &amp; Wiener in roten Shirts auf dem Weg zur Eröffnungsfeier', TAGEBUCH) +
    p('Mitgereist sind auch Fans von Wirth &amp; Wiener – in roten Shirts, auf dem Rücken Marc-Aurel und Lennard. Näher dran kann man beim Daumendrücken kaum sein.') +
    divider() +
    h2('Fläche 13 – hier entsteht ihr Garten') +
    photo('rts-flaeche13.jpg', 512, 320, 'Fläche 13 im Skill 37 mit weißer Mauer, Mondtor und chinesischem Ziegeldach', TAGEBUCH) +
    p('Das ist der Arbeitsplatz der beiden für die nächsten vier Tage: Fläche 13 im Skill 37 „Landscape Gardening“. Die weiße Mauer mit Mondtor und chinesischem Ziegeldach steht schon, daneben warten Sand, Natursteine und Holz. Ab heute bauen Marc-Aurel und Lennard hier ihren Wettbewerbsgarten.') +
    infobox(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Heute, Mi 23.09.</td><td style="padding:3px 0 3px 12px"><strong style="color:${C.ink}">Wettkampftag 1</strong></td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Do–Sa 24.–26.09.</td><td style="padding:3px 0 3px 12px">Wettkampftage 2 bis 4</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">So 27.09.</td><td style="padding:3px 0 3px 12px">Siegerehrung</td></tr>
      </table>`
    ) +
    p(`Von den Wettkampftagen gibt es keinen Livestream. Die Bilder kommen trotzdem: Auf unserer Shanghai-Seite sammeln wir ab jetzt Tag für Tag Fotos im Tagebuch. Team Germany berichtet auf ${link('https://www.instagram.com/worldskills_germany/', 'Instagram')}, die Landschaftsgärtner zeigen den Baufortschritt auf ${link('https://www.instagram.com/die_landschaftsgaertner/', 'Instagram')} und ${link('https://www.facebook.com/dielandschaftsgaertner', 'Facebook')}.`) +
    button(TAGEBUCH, 'Zum Tagebuch', 'outline') +
    divider() +
    h2('Drück die Daumen') +
    p('Schon mehr als 90 Menschen drücken den beiden die Daumen – für jeden steigt auf unserer Seite eine Laterne auf. Mach mit, jetzt zählt jede einzelne.') +
    button(SITE + '#daumendruecken', 'Daumen drücken') +
    signature()
  ),
  {
    footerExtra: `Du erhältst diese E-Mail, weil du dich auf ${link(SITE, 'shanghai.wirth-wiener.de', C.muted)} angemeldet hast.<br />
      ${link('{unsubscription_url}', 'Newsletter abbestellen', C.muted)} &nbsp;·&nbsp; ${link('{profile_url}', 'Daten ändern', C.muted)}<br /><br />`,
  }
);

// ---- Newsletter 4: Reisegruppe + Tag 1 (Titelbild: Gruppe vor dem China-Pavillon) ----
// Fotos: Wirth & Wiener (22./23.09.2026).
const newsletterReisegruppe = frame(
  `<tr><td class="ww-hero" style="padding:0;font-size:0;line-height:0">
     <a href="${TAGEBUCH_TAG1}" target="_blank"><img src="${ASSETS}/rts-reisegruppe.jpg" width="600" height="400" alt="Die Reisegruppe von Wirth &amp; Wiener in roten Fanshirts mit Deutschlandfahne vor dem China-Pavillon in Shanghai" style="display:block;width:100%;max-width:600px;height:auto" /></a>
   </td></tr>
   <tr><td class="ww-pad" align="right" style="padding:8px 44px 0;font-family:${F.body};font-size:11px;line-height:16px;color:${C.muted}">Foto: Wirth &amp; Wiener</td></tr>` +
  section(
    preheader('Unsere Reisegruppe in Shanghai und der erste Wettkampftag, der nach Plan läuft.') +
    eyebrow('Road to Shanghai · Tag 1') +
    h1('Mitgereist: unsere Gruppe in Shanghai') +
    p('Sie sind über 8.000 Kilometer geflogen, um zwei Landschaftsgärtnern die Daumen zu drücken: Mitarbeiterinnen und Mitarbeiter von Wirth &amp; Wiener, dazu Familie und Freunde. Die roten Fanshirts wurden eigens für diese Reise angefertigt. Hier steht die Gruppe vor dem China-Pavillon. Lauter kann ein Fanblock kaum sein.') +
    divider() +
    h2('Tag 1: alles im Plan') +
    photo('rts-tag1-mauer.jpg', 512, 320, 'Marc-Aurel und Lennard bauen die Trockenmauer vor der Wand mit Mondtor', TAGEBUCH_TAG1) +
    p('Seit heute früh wird gebaut. Die Trockenmauer steht, die Beläge liegen, die ersten Pflanzen sind gesetzt. Marc-Aurel und Lennard liegen gut in der Zeit und sind mit ihrer Arbeit zufrieden. Auch von außen betrachtet sieht alles hervorragend aus.') +
    photo('rts-tag1-pflanzen.jpg', 512, 320, 'Pflanzen kommen in das Beet hinter der fertigen Trockenmauer', TAGEBUCH_TAG1) +
    p('Beeindruckend ist auch alles drumherum: wie diese Weltmeisterschaft organisiert ist und welche Dimension die Hallen haben. Überwältigend.') +
    button(TAGEBUCH_TAG1, 'Alle Bilder im Tagebuch') +
    infobox(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Do bis Sa</td><td style="padding:3px 0 3px 12px">24. bis 26.09., Wettkampftage 2 bis 4</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Sonntag</td><td style="padding:3px 0 3px 12px">27.09., Siegerehrung</td></tr>
      </table>`
    ) +
    divider() +
    h2('Fast am Ziel') +
    p('Fast 100 Menschen drücken den beiden inzwischen die Daumen. Für jeden steigt auf unserer Seite eine Laterne auf. Bis zur runden Zahl fehlen nur noch ein paar.') +
    button(SITE + '#daumendruecken', 'Daumen drücken') +
    signature()
  ),
  {
    footerExtra: `Du erhältst diese E-Mail, weil du dich auf ${link(SITE, 'shanghai.wirth-wiener.de', C.muted)} angemeldet hast.<br />
      ${link('{unsubscription_url}', 'Newsletter abbestellen', C.muted)} &nbsp;·&nbsp; ${link('{profile_url}', 'Daten ändern', C.muted)}<br /><br />`,
  }
);

// ---- Newsletter 5: Tag 2 geschafft (Versand Fr 25.09.2026, waehrend Tag 3 laeuft) ----
// Fotos: AuGaLa/Reidel (Petra Reidel), Quellenangabe ist Pflicht.
const TAGEBUCH_TAG2 = SITE + '#tag-2409';
const newsletterTag2 = frame(
  `<tr><td class="ww-hero" style="padding:0;font-size:0;line-height:0">
     <a href="${TAGEBUCH_TAG2}" target="_blank"><img src="${ASSETS}/rts-tag2-hero.jpg" width="600" height="400" alt="Marc-Aurel und Lennard mit ihrem Trainer in der Messehalle, beide zeigen den Daumen nach oben" style="display:block;width:100%;max-width:600px;height:auto" /></a>
   </td></tr>
   <tr><td class="ww-pad" align="right" style="padding:8px 44px 0;font-family:${F.body};font-size:11px;line-height:16px;color:${C.muted}">Foto: AuGaLa/Reidel</td></tr>` +
  section(
    preheader('Tag 2 hatte es in sich. Das Zeitlimit haben die beiden gerade so gehalten, mit ihrem Stand sind sie zufrieden.') +
    eyebrow('Road to Shanghai · Tag 2') +
    h1('Tag 2 ist geschafft') +
    p('Der zweite Wettkampftag war deutlich härter als der erste. Das Zeitlimit haben Marc-Aurel und Lennard gerade so gehalten. Mit ihrer Arbeit und mit dem Zwischenstand sind sie zufrieden, und genau darauf kommt es jetzt an.') +
    photo('rts-tag2-waage.jpg', 512, 320, 'Mit der Wasserwaage flach im Sand, der Belag muss auf den Millimeter stimmen', TAGEBUCH_TAG2) +
    p('Auf der Fläche zählt jeder Millimeter. Wasserwaage, Schnur und Winkel sind genauso im Einsatz wie Hammer und Meißel.') +
    photo('rts-tag2-mauer.jpg', 512, 320, 'Zu zweit an der frei stehenden Trockenmauer', TAGEBUCH_TAG2) +
    p('Die frei stehende Mauer wächst Stein für Stein. Jeder einzelne wird zugerichtet, angepasst und versetzt.') +
    button(TAGEBUCH_TAG2, 'Alle Bilder im Tagebuch') +
    p('Während du das liest, läuft in Shanghai schon Tag 3.') +
    infobox(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Heute, Fr 25.09.</td><td style="padding:3px 0 3px 12px"><strong style="color:${C.ink}">Wettkampftag 3</strong></td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Samstag</td><td style="padding:3px 0 3px 12px">26.09., letzter Wettkampftag</td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Sonntag</td><td style="padding:3px 0 3px 12px">27.09., Siegerehrung</td></tr>
      </table>`
    ) +
    divider() +
    h2('Die 100 steht') +
    p('Mehr als 100 Menschen drücken den beiden inzwischen die Daumen. Das Ziel ist geschafft, und jede weitere Laterne steigt trotzdem auf.') +
    button(SITE + '#daumendruecken', 'Daumen drücken', 'outline') +
    signature()
  ),
  {
    footerExtra: `Du erhältst diese E-Mail, weil du dich auf ${link(SITE, 'shanghai.wirth-wiener.de', C.muted)} angemeldet hast.<br />
      ${link('{unsubscription_url}', 'Newsletter abbestellen', C.muted)} &nbsp;·&nbsp; ${link('{profile_url}', 'Daten ändern', C.muted)}<br /><br />`,
  }
);

// ---- Newsletter 6: Tag 3 geschafft (Versand Sa 26.09.2026, letzter Wettkampftag laeuft) ----
// Fotos: AuGaLa/Reidel (Petra Reidel), Quellenangabe ist Pflicht.
const TAGEBUCH_TAG3 = SITE + '#tag-2509';
const newsletterTag3 = frame(
  `<tr><td class="ww-hero" style="padding:0;font-size:0;line-height:0">
     <a href="${TAGEBUCH_TAG3}" target="_blank"><img src="${ASSETS}/rts-tag3-hero.jpg" width="600" height="400" alt="Marc-Aurel und Lennard arbeiten zu zweit am Holz über der fertigen Trockenmauer" style="display:block;width:100%;max-width:600px;height:auto" /></a>
   </td></tr>
   <tr><td class="ww-pad" align="right" style="padding:8px 44px 0;font-family:${F.body};font-size:11px;line-height:16px;color:${C.muted}">Foto: AuGaLa/Reidel</td></tr>` +
  section(
    preheader('Tag 3 war anstrengend, im Kopf und im Körper. Ziel trotzdem erreicht. Heute ist der letzte Wettkampftag.') +
    eyebrow('Road to Shanghai · Tag 3') +
    h1('Drei Tage geschafft') +
    p('Der dritte Wettkampftag war anstrengend, körperlich und im Kopf. Nach vier Tagen Dauerspannung merken Marc-Aurel und Lennard die Anstrengung und den Druck. Ihr Tagesziel haben sie trotzdem erreicht, mit dem Stand sind sie zufrieden. Die Vorfreude galt am Abend vor allem dem Bett.') +
    photo('rts-tag3-fenster.jpg', 512, 320, 'Das fertige Gitterfenster aus Holz in der weißen Wand', TAGEBUCH_TAG3) +
    p('Tag 3 war der Tag des Holzes. In die weiße Wand kam ein Gitterfenster nach chinesischem Vorbild, jede Leiste einzeln zugeschnitten und eingepasst.') +
    photo('rts-tag3-saege.jpg', 512, 320, 'Zuschnitt an der Kappsäge', TAGEBUCH_TAG3) +
    p('Dazu der gebogene Rahmen für die Brücke, die Teichfolie und der Sand für den Belag. Jeder Schnitt muss sitzen, nachbessern kostet Zeit, die keiner hat.') +
    button(TAGEBUCH_TAG3, 'Alle Bilder im Tagebuch') +
    infobox(
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${F.body};font-size:14px;line-height:22px;color:${C.body}">
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Heute, Sa 26.09.</td><td style="padding:3px 0 3px 12px"><strong style="color:${C.ink}">Letzter Wettkampftag</strong></td></tr>
        <tr><td width="150" style="width:150px;padding:3px 0;color:${C.ink};font-weight:600;white-space:nowrap">Morgen</td><td style="padding:3px 0 3px 12px">27.09., Siegerehrung</td></tr>
      </table>`
    ) +
    divider() +
    h2('Heute zählt jeder Daumen') +
    p('104 Menschen drücken den beiden inzwischen die Daumen. Heute fällt der letzte Hammerschlag, ein guter Tag für ein paar Laternen mehr.') +
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
write('newsletter-eroeffnung.html', newsletterEroeffnung);
write('newsletter-tag1.html', newsletterTag1);
write('newsletter-reisegruppe.html', newsletterReisegruppe);
write('newsletter-tag2.html', newsletterTag2);
write('newsletter-tag3.html', newsletterTag3);

// Vorschau: Plugin-Platzhalter durch Beispielwerte ersetzen
const demo = (html) => html
  .replace(/\{subscription_confirm_url\}/g, 'https://wirth-wiener.de/wp-admin/admin-ajax.php?action=tnp&amp;na=c&amp;nk=12-3a4b5c6d7e')
  .replace(/\{unsubscription_url\}/g, '#abmelden')
  .replace(/\{profile_url\}/g, '#profil');
write('preview-1-bestaetigung.html', demo(template.replace('{message}', msgConfirmation)));
write('preview-2-willkommen.html', demo(template.replace('{message}', msgWelcome)));
write('preview-3-abmeldung.html', demo(template.replace('{message}', msgGoodbye)));
write('preview-4-newsletter.html', demo(newsletter));
write('preview-5-eroeffnung.html', demo(newsletterEroeffnung));
write('preview-6-tag1.html', demo(newsletterTag1));
write('preview-7-reisegruppe.html', demo(newsletterReisegruppe));
write('preview-8-tag2.html', demo(newsletterTag2));
write('preview-9-tag3.html', demo(newsletterTag3));

for (const f of fs.readdirSync(OUT).sort()) console.log(f.padEnd(28), fs.statSync(path.join(OUT, f)).size, 'Bytes');
