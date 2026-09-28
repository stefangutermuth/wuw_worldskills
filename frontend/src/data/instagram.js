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

export const posts = [
  {
    url: 'https://www.instagram.com/reel/Dd0L88sslih/',
    image: '/img/tagebuch/2709/p02-thumb',
    alt: 'Reel vom Siegerabend bei @die_landschaftsgaertner: Jubel mit der Deutschlandfahne auf der Bühne',
    credit: 'AuGaLa/Reidel',
  },
  {
    url: 'https://www.instagram.com/p/DdywiYvCiyI/',
    image: '/img/tagebuch/2709/p05-thumb',
    alt: 'Bronze für Deutschland: beide mit Medaille und Fahne, Beitrag von @die_landschaftsgaertner',
    credit: 'AuGaLa/Reidel',
  },
  {
    url: 'https://www.instagram.com/p/Ddyg3Y9gEsj/',
    image: '/img/tagebuch/2309/p08-thumb',
    alt: 'Bronze für Marc-Aurel und Lennard, gemeldet von @worldskills_germany',
    credit: 'AuGaLa/Reidel',
  },
  {
    url: 'https://www.instagram.com/reel/Ddv0LcPM67U/',
    image: '/img/tagebuch/2609/p01-thumb',
    alt: 'Reel vom letzten Wettkampftag bei @die_landschaftsgaertner: der fertige Garten mit Holzbrücke',
    credit: 'AuGaLa/Reidel',
  },
  {
    url: 'https://www.instagram.com/p/Dds2XWTFJgi/',
    image: '/img/tagebuch/2409/p02-thumb',
    alt: 'Tag 3 bei @die_landschaftsgaertner: Ein Stein wird auf der frei stehenden Mauer versetzt',
    credit: 'AuGaLa/Reidel',
  },
  {
    url: 'https://www.instagram.com/reel/DdrGhhQlT2u/',
    image: '/img/tagebuch/2409/p08-thumb',
    alt: 'Reel vom zweiten Wettkampftag: Pflastersteine werden verlegt',
    credit: 'AuGaLa/Reidel',
  },
  {
    url: 'https://www.instagram.com/p/Ddp_CMcltHT/',
    image: '/img/tagebuch/2409/p01-thumb',
    alt: 'Zweiter Wettkampftag: Marc-Aurel und Lennard mit ihrem Trainer in der Halle',
    credit: 'AuGaLa/Reidel',
  },
  {
    url: 'https://www.instagram.com/p/Ddob0w8Ci5R/',
    image: '/img/tagebuch/2309/p02-thumb',
    alt: 'Tag 1 bei den WorldSkills: zu zweit an der Trockenmauer vor dem Mondtor',
    credit: 'AuGaLa/Reidel',
  },
];
