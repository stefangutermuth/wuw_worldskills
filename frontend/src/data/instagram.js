// Feste Kacheln für das Instagram-Raster im Live-Bereich.
//
// Warum von Hand? Collab-Beiträge (Wirth & Wiener als Mitwirkende auf einem fremden
// Beitrag) gehören technisch dem anderen Konto. Die Instagram-Schnittstelle liefert nur
// eigene Beiträge, solche Collabs tauchen dort nie auf, obwohl sie im Profil stehen.
//
// Solange diese Liste gefüllt ist, zeigt die Seite genau diese Kacheln und holt nichts
// von Instagram. Liste leeren = automatischer Feed der eigenen Beiträge wie vorher.
//
// Neuen Beitrag ergänzen (neueste zuerst, es werden 5 gezeigt):
//   { url: 'https://www.instagram.com/p/XXXXXXXX/', image: '/img/tagebuch/2409/p01-thumb', alt: 'kurze Beschreibung' }
//   url   = Link zum Beitrag (auch fremdes Konto, z. B. @die_landschaftsgaertner)
//   image = eigenes Bild ohne Endung, .webp und .jpg liegen daneben (z. B. aus dem Tagebuch)
//   alt   = was zu sehen ist, für Screenreader

export const posts = [];
