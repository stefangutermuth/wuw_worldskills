/**
 * Demo-Inhalte für die Präsentation.
 *
 * Greifen NUR als Fallback, wenn das WP-Backend nicht erreichbar ist oder
 * (noch) keine echten Einträge liefert. Echte Daten haben immer Vorrang.
 *
 * Abschalten/Anpassen:
 *   - DEMO_FALLBACK  = false  → Grüße & Daumendrücken zeigen wieder nur echte Daten
 *   - DEMO_DISPATCHES_ON = true → Live-Sektion in den Reportage-Modus mit Demo-Berichten
 */
export const DEMO_FALLBACK = true;
export const DEMO_DISPATCHES_ON = false;

/* ---------- Wunschbaum: Grüße ---------- */
export const DEMO_WISHES = [
  { vorname: 'Anja',          ort: 'Chemnitz',    nachricht: 'Macht uns stolz, Jungs! Ganz Sachsen drückt die Daumen. 🌿' },
  { vorname: 'Thomas',        ort: 'Dresden',     nachricht: 'Zeigt der Welt, was Erzgebirgs-Handwerk kann!' },
  { vorname: 'Familie Weber', ort: 'Leipzig',     nachricht: 'Wir verfolgen jede Minute. Volle Power für Shanghai!' },
  { vorname: 'Lena',          ort: 'Berlin',      nachricht: 'Ihr habt euch das verdient – genießt jeden Moment auf der Weltbühne.' },
  { vorname: 'Werner',        ort: 'Annaberg',    nachricht: 'Ruhig bleiben, sauber arbeiten – ihr könnt das!' },
  { vorname: 'Sophie',        ort: 'München',     nachricht: '8.000 km und ein Traum. Wir sind dabei! 🇩🇪' },
  { vorname: 'Markus',        ort: 'Chemnitz',    nachricht: 'Kopf hoch, Kelle fest – auf nach China!' },
  { vorname: 'Das Azubi-Team',ort: 'Wirth & Wiener', nachricht: 'Stolz auf euch. Holt euch den Titel!' },
];

/* ---------- Daumendrücken ---------- */
export const DEMO_CHEERS = {
  count: 1284,
  // „Daumendrücker" mit Namen (erscheinen im Ticker + auf den Laternen).
  // ~50 abwechslungsreiche Namen, Schwerpunkt Erzgebirge/Sachsen.
  ticker: [
    { vorname: 'Anja',      ort: 'Chemnitz' },
    { vorname: 'Jonas',     ort: 'Hamburg' },
    { vorname: 'Lena',      ort: 'Berlin' },
    { vorname: 'Markus',    ort: 'Chemnitz' },
    { vorname: 'Sophie',    ort: 'München' },
    { vorname: 'Thomas',    ort: 'Dresden' },
    { vorname: 'Mara',      ort: 'Köln' },
    { vorname: 'Paul',      ort: 'Zwickau' },
    { vorname: 'Katrin',    ort: 'Annaberg' },
    { vorname: 'Felix',     ort: 'Leipzig' },
    { vorname: 'Julia',     ort: 'Stuttgart' },
    { vorname: 'Sebastian', ort: 'Erfurt' },
    { vorname: 'Nora',      ort: 'Freiberg' },
    { vorname: 'David',     ort: 'Frankfurt' },
    { vorname: 'Hannah',    ort: 'Bremen' },
    { vorname: 'Tobias',    ort: 'Plauen' },
    { vorname: 'Lisa',      ort: 'Hannover' },
    { vorname: 'Daniel',    ort: 'Aue' },
    { vorname: 'Sandra',    ort: 'Düsseldorf' },
    { vorname: 'Michael',   ort: 'Chemnitz' },
    { vorname: 'Emma',      ort: 'Nürnberg' },
    { vorname: 'Florian',   ort: 'Augsburg' },
    { vorname: 'Pia',       ort: 'Marienberg' },
    { vorname: 'Jan',       ort: 'Halle' },
    { vorname: 'Vanessa',   ort: 'Jena' },
    { vorname: 'Christoph', ort: 'Karlsruhe' },
    { vorname: 'Mira',      ort: 'Schwarzenberg' },
    { vorname: 'Lukas',     ort: 'Mannheim' },
    { vorname: 'Steffi',    ort: 'Glauchau' },
    { vorname: 'Andreas',   ort: 'Magdeburg' },
    { vorname: 'Carla',     ort: 'Münster' },
    { vorname: 'Niklas',    ort: 'Görlitz' },
    { vorname: 'Tanja',     ort: 'Kassel' },
    { vorname: 'Robert',    ort: 'Zwönitz' },
    { vorname: 'Marie',     ort: 'Potsdam' },
    { vorname: 'Kevin',     ort: 'Oberwiesenthal' },
    { vorname: 'Franzi',    ort: 'Bautzen' },
    { vorname: 'Philipp',   ort: 'Bonn' },
    { vorname: 'Heike',     ort: 'Crimmitschau' },
    { vorname: 'Max',       ort: 'Wolfsburg' },
    { vorname: 'Nadine',    ort: 'Riesa' },
    { vorname: 'Oliver',    ort: 'Ulm' },
    { vorname: 'Sina',      ort: 'Pirna' },
    { vorname: 'Benjamin',  ort: 'Gera' },
    { vorname: 'Claudia',   ort: 'Dortmund' },
    { vorname: 'Erik',      ort: 'Mittweida' },
    { vorname: 'Johanna',   ort: 'Meißen' },
    { vorname: 'Stefan',    ort: 'Chemnitz' },
    { vorname: 'Melanie',   ort: 'Werdau' },
    { vorname: 'Tim',       ort: 'Lübeck' },
  ],
};

/* ---------- Live aus Shanghai: Berichte (nur wenn DEMO_DISPATCHES_ON) ---------- */
// Base-Pfad für Public-Assets (GitHub-Pages-Unterordner; lokal/Prod = '/').
const B = import.meta.env.BASE_URL.replace(/\/$/, '');
export const DEMO_DISPATCHES = [
  {
    date: '2026-09-22 09:30',
    title: 'Angekommen in Shanghai',
    text: 'Nach über 8.000 Kilometern sind Marc-Aurel und Lennard im National Exhibition and Convention Center eingetroffen. Erste Eindrücke: überwältigend.',
    image: `${B}/img/live/live-featured.jpg`,
  },
  {
    date: '2026-09-23 14:10',
    title: 'Aufbau läuft',
    text: 'Material gesichtet, Werkzeug kalibriert, Plan steht. Heute der erste Probelauf am Wettkampfstand.',
    image: `${B}/img/live/insta/insta-1.jpg`,
  },
  {
    date: '2026-09-24 18:45',
    title: 'Tag 1 geschafft',
    text: 'Pflasterverband sitzt sauber, der Zeitplan passt. Die Jungs sind fokussiert – morgen geht es an den Holzbau.',
    image: `${B}/img/live/insta/insta-2.jpg`,
  },
];
