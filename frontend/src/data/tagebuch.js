// Tagebuch der WM-Woche – ein Eintrag pro Tag, als Reiter im Live-Bereich.
//
// Neuen Tag befüllen: photos (und optional text/link) beim passenden Tag eintragen.
// Offen ist automatisch der NEUESTE Tag mit Inhalt; Tage ohne Inhalt erscheinen
// ausgegraut als „folgt".
//
// photos: { thumb, full, alt, wide? }   thumb/full ohne Endung (.webp + .jpg liegen daneben)
//         wide: true → Querformat, belegt zwei Spalten (nur nutzen, wenn das Raster dann aufgeht)
//
// Direkt verlinkbar: https://shanghai.wirth-wiener.de/#tag-2209 (id des Tages)

const YT_OPENING = 'https://www.youtube.com/watch?v=8CnEnzlDPfw';

export const tage = [
  {
    id: '2209',
    tab: 'Di 22.09.',
    title: 'Eröffnung',
    text: 'Große Show in der Arena, mittendrin ein Fanblock von Wirth & Wiener. Der Arbeitsplatz steht bereit: Fläche 13 im Skill 37.',
    credit: 'Wirth & Wiener',
    link: { url: YT_OPENING, label: 'Eröffnungsfeier nachschauen', icon: 'youtube' },
    photos: [
      { thumb: '/img/tagebuch/2209/01-thumb', full: '/img/route/eroeffnung/eroeffnung-01', alt: 'Blick in die Arena bei der Eröffnungsfeier' },
      { thumb: '/img/tagebuch/2209/02-thumb', full: '/img/route/eroeffnung/eroeffnung-02', alt: 'Fan-Shirt mit Marc-Aurel und Lennard vor der Bühne' },
      { thumb: '/img/tagebuch/2209/03-thumb', full: '/img/route/eroeffnung/eroeffnung-03', alt: 'Mit Deutschlandfahne auf dem Weg zur Arena' },
      { thumb: '/img/tagebuch/2209/04-thumb', full: '/img/route/eroeffnung/eroeffnung-05', alt: 'Fans in roten Shirts auf der Rolltreppe' },
      { thumb: '/img/tagebuch/2209/05-thumb', full: '/img/route/eroeffnung/eroeffnung-04', alt: 'Jubel auf dem Weg zur Eröffnungsfeier' },
      { thumb: '/img/tagebuch/2209/06-thumb', full: '/img/route/eroeffnung/eroeffnung-06', alt: 'Shanghai bei Nacht am Huangpu' },
      { thumb: '/img/tagebuch/2209/07-thumb', full: '/img/route/eroeffnung/eroeffnung-07', alt: 'Der China-Pavillon in Shanghai' },
      { thumb: '/img/tagebuch/2209/08-thumb', full: '/img/route/flaeche13/flaeche13-01', alt: 'Fläche 13 im Skill 37 mit Mauer und Mondtor' },
    ],
  },
  {
    id: '2309',
    tab: 'Mi 23.09.',
    title: 'Tag 1',
    text: 'Der Wettkampf läuft. Mauer, Beläge und die ersten Pflanzen stehen. Die beiden liegen gut in der Zeit und sind mit ihrer Arbeit zufrieden. Auch von außen betrachtet sieht alles hervorragend aus.',
    credit: 'Wirth & Wiener',
    photos: [
      { thumb: '/img/tagebuch/2309/01-thumb', full: '/img/tagebuch/2309/01', alt: 'Team Germany baut die Trockenmauer vor der weißen Wand mit Mondtor' },
      { thumb: '/img/tagebuch/2309/02-thumb', full: '/img/tagebuch/2309/02', alt: 'Pflanzen kommen in das Beet hinter der fertigen Trockenmauer' },
      { thumb: '/img/tagebuch/2309/03-thumb', full: '/img/tagebuch/2309/03', alt: 'Ein Formgehölz wird an der Mauer in Position gebracht' },
      { thumb: '/img/tagebuch/2309/04-thumb', full: '/img/tagebuch/2309/04', alt: 'Unterwegs auf der Wettkampffläche, daneben Paletten mit Natursteinen' },
      { thumb: '/img/tagebuch/2309/05-thumb', full: '/img/tagebuch/2309/05', alt: 'Umarmung auf der Wettkampffläche' },
      { thumb: '/img/tagebuch/2309/06-thumb', full: '/img/tagebuch/2309/06', alt: 'Gruppenbild in der Messehalle nach dem ersten Wettkampftag' },
    ],
  },
  { id: '2409', tab: 'Do 24.09.', title: 'Tag 2', photos: [] },
  { id: '2509', tab: 'Fr 25.09.', title: 'Tag 3', photos: [] },
  { id: '2609', tab: 'Sa 26.09.', title: 'Tag 4', photos: [] },
  { id: '2709', tab: 'So 27.09.', title: 'Siegerehrung', photos: [] },
];

export const hasContent = (t) => (t.photos && t.photos.length > 0) || !!t.text;
