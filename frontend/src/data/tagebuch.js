// Tagebuch der WM-Woche – ein Eintrag pro Tag, als Reiter im Live-Bereich.
//
// Neuen Tag befüllen: photos (und optional text/link) beim passenden Tag eintragen.
// Offen ist automatisch der NEUESTE Tag mit Inhalt; Tage ohne Inhalt erscheinen
// ausgegraut als „folgt".
//
// photos: { thumb, full, alt, wide?, credit? }   thumb/full ohne Endung (.webp + .jpg liegen daneben)
//         credit: überschreibt den Tages-Bildnachweis (Pflicht bei Fremdfotos)
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
      { thumb: '/img/tagebuch/2209/p01-thumb', full: '/img/tagebuch/2209/p01', alt: 'Einmarsch der Nationen mit Fahnen in der Arena', credit: 'Petra Reidel' },
      { thumb: '/img/tagebuch/2209/p02-thumb', full: '/img/tagebuch/2209/p02', alt: 'Das Motto „Master Skills, Change Your Future“ über der Bühne', credit: 'Petra Reidel' },
      { thumb: '/img/tagebuch/2209/p03-thumb', full: '/img/tagebuch/2209/p03', alt: 'Schriftzug WorldSkills Shanghai 2026 über den Rängen', credit: 'Petra Reidel' },
      { thumb: '/img/tagebuch/2209/p04-thumb', full: '/img/tagebuch/2209/p04', alt: 'Team Germany im Publikum mit Deutschlandfähnchen', credit: 'Petra Reidel' },
      { thumb: '/img/tagebuch/2209/p05-thumb', full: '/img/tagebuch/2209/p05', alt: 'Jubel bei Team Germany während der Eröffnungsfeier', credit: 'Petra Reidel' },
      { thumb: '/img/tagebuch/2209/p06-thumb', full: '/img/tagebuch/2209/p06', alt: 'Große Kugel und Tänzerinnen bei der Show', credit: 'Petra Reidel' },
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
      { thumb: '/img/tagebuch/2309/p01-thumb', full: '/img/tagebuch/2309/p01', alt: 'Ein Stein wird mit dem Hammer zugerichtet, daneben entsteht die Trockenmauer', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/p02-thumb', full: '/img/tagebuch/2309/p02', alt: 'Zu zweit an der Trockenmauer vor dem Mondtor', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/p03-thumb', full: '/img/tagebuch/2309/p03', alt: 'Blick über die ganze Fläche mit Mondtor und Mauer im Bau', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/p04-thumb', full: '/img/tagebuch/2309/p04', alt: 'Konzentriert an der Mauerkrone', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/p05-thumb', full: '/img/tagebuch/2309/p05', alt: 'Ein schwerer Stein wird in der Mauer versetzt', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/p06-thumb', full: '/img/tagebuch/2309/p06', alt: 'Arbeiten mit der Lampe an der Mauer unter dem Mondtor', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/p07-thumb', full: '/img/tagebuch/2309/p07', alt: 'Eine Platte wird für den Belag zugelegt', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/p08-thumb', full: '/img/tagebuch/2309/p08', alt: 'Kurzes Lächeln in die Kamera, mit Deutschlandfähnchen in der Hand', credit: 'AuGaLa/Reidel' },
      { thumb: '/img/tagebuch/2309/01-thumb', full: '/img/tagebuch/2309/01', alt: 'Team Germany baut die Trockenmauer vor der weißen Wand mit Mondtor' },
      { thumb: '/img/tagebuch/2309/02-thumb', full: '/img/tagebuch/2309/02', alt: 'Pflanzen kommen in das Beet hinter der fertigen Trockenmauer' },
      { thumb: '/img/tagebuch/2309/03-thumb', full: '/img/tagebuch/2309/03', alt: 'Ein Formgehölz wird an der Mauer in Position gebracht' },
      { thumb: '/img/tagebuch/2309/04-thumb', full: '/img/tagebuch/2309/04', alt: 'Unterwegs auf der Wettkampffläche, daneben Paletten mit Natursteinen' },
      { thumb: '/img/tagebuch/2309/05-thumb', full: '/img/tagebuch/2309/05', alt: 'Umarmung auf der Wettkampffläche' },
      { thumb: '/img/tagebuch/2309/06-thumb', full: '/img/tagebuch/2309/06', alt: 'Gruppenbild in der Messehalle nach dem ersten Wettkampftag' },
    ],
  },
  {
    id: '2409',
    tab: 'Do 24.09.',
    title: 'Tag 2',
    text: 'Tag 2 hatte es in sich, deutlich härter als der erste. Das Zeitlimit haben die beiden gerade so gehalten. Mit ihrer Arbeit und dem Zwischenstand sind sie zufrieden.',
    credit: 'AuGaLa/Reidel',
    photos: [
      { thumb: '/img/tagebuch/2409/p01-thumb', full: '/img/tagebuch/2409/p01', alt: 'Marc-Aurel und Lennard mit ihrem Trainer auf dem Weg durch die Halle' },
      { thumb: '/img/tagebuch/2409/p02-thumb', full: '/img/tagebuch/2409/p02', alt: 'Ein Stein wird auf der frei stehenden Mauer versetzt' },
      { thumb: '/img/tagebuch/2409/p03-thumb', full: '/img/tagebuch/2409/p03', alt: 'Zu zweit an der frei stehenden Mauer' },
      { thumb: '/img/tagebuch/2409/p04-thumb', full: '/img/tagebuch/2409/p04', alt: 'Gemeinsam wird die Höhe der nächsten Steinlage geprüft' },
      { thumb: '/img/tagebuch/2409/p05-thumb', full: '/img/tagebuch/2409/p05', alt: 'Arbeiten an der Mauerkrone, daneben liegt loses Steinmaterial' },
      { thumb: '/img/tagebuch/2409/p06-thumb', full: '/img/tagebuch/2409/p06', alt: 'Ein Stein wird mit Hammer und Meißel gespalten' },
      { thumb: '/img/tagebuch/2409/p07-thumb', full: '/img/tagebuch/2409/p07', alt: 'Mit der Wasserwaage flach im Sand, der Belag muss auf den Millimeter stimmen' },
      { thumb: '/img/tagebuch/2409/p08-thumb', full: '/img/tagebuch/2409/p08', alt: 'Pflastersteine werden verlegt und ausgerichtet' },
      { thumb: '/img/tagebuch/2409/p09-thumb', full: '/img/tagebuch/2409/p09', alt: 'Die fertige Ecke der Trockenmauer aus der Nähe' },
      { thumb: '/img/tagebuch/2409/p10-thumb', full: '/img/tagebuch/2409/p10', alt: 'Blick durch das Fenster in der weißen Wand auf die Arbeit dahinter' },
    ],
  },
  {
    id: '2509',
    tab: 'Fr 25.09.',
    title: 'Tag 3',
    text: 'Der dritte Tag war anstrengend, körperlich und im Kopf. Die beiden merken die Woche und den Druck. Trotzdem haben sie auch an Tag 3 ihr Ziel erreicht und sind mit dem Stand zufrieden. Jetzt freuen sie sich aufs Bett und auf morgen.',
    credit: 'AuGaLa/Reidel',
    photos: [
      { thumb: '/img/tagebuch/2509/p01-thumb', full: '/img/tagebuch/2509/p01', alt: 'Zu zweit am Holz über der fertigen Mauer' },
      { thumb: '/img/tagebuch/2509/p02-thumb', full: '/img/tagebuch/2509/p02', alt: 'Das fertige Gitterfenster aus Holz in der weißen Wand' },
      { thumb: '/img/tagebuch/2509/p03-thumb', full: '/img/tagebuch/2509/p03', alt: 'Der gebogene Holzrahmen für die Brücke liegt bereit' },
      { thumb: '/img/tagebuch/2509/p04-thumb', full: '/img/tagebuch/2509/p04', alt: 'Gemeinsam wird die Teichfolie ausgelegt' },
      { thumb: '/img/tagebuch/2509/p05-thumb', full: '/img/tagebuch/2509/p05', alt: 'Blick durch das Gitterfenster auf die Arbeit dahinter' },
      { thumb: '/img/tagebuch/2509/p06-thumb', full: '/img/tagebuch/2509/p06', alt: 'Höhen abstecken mit der Messlatte' },
      { thumb: '/img/tagebuch/2509/p07-thumb', full: '/img/tagebuch/2509/p07', alt: 'Zuschnitt an der Kappsäge' },
      { thumb: '/img/tagebuch/2509/p08-thumb', full: '/img/tagebuch/2509/p08', alt: 'Ein Kantholz wird mit dem Klüpfel in Position gebracht' },
      { thumb: '/img/tagebuch/2509/p09-thumb', full: '/img/tagebuch/2509/p09', alt: 'Der Sand wird von Hand abgezogen und verdichtet' },
      { thumb: '/img/tagebuch/2509/p10-thumb', full: '/img/tagebuch/2509/p10', alt: 'Zu zweit beim Setzen der Findlinge' },
    ],
  },
  {
    id: '2609',
    tab: 'Sa 26.09.',
    title: 'Tag 4',
    text: 'Geschafft. Unter dem Jubel der mitgereisten Fans haben die beiden das Zeitlimit eingehalten und ein Spitzenergebnis abgeliefert. Brücke, Mauern, Wege und Bepflanzung stehen. Beide sind überwältigt und können es kaum in Worte fassen. Jetzt heißt es Daumen drücken.',
    credit: 'AuGaLa/Reidel',
    photos: [
      { thumb: '/img/tagebuch/2609/p01-thumb', full: '/img/tagebuch/2609/p01', alt: 'Der fertige Garten mit Holzbrücke, Mondtor und Bambus' },
      { thumb: '/img/tagebuch/2609/p02-thumb', full: '/img/tagebuch/2609/p02', alt: 'Blick über den Garten mit Formgehölzen und Pflanzflächen' },
      { thumb: '/img/tagebuch/2609/p03-thumb', full: '/img/tagebuch/2609/p03', alt: 'Die letzten Pflanzen kommen in die Beete' },
      { thumb: '/img/tagebuch/2609/p04-thumb', full: '/img/tagebuch/2609/p04', alt: 'Moos wird rund um die Brücke verlegt' },
      { thumb: '/img/tagebuch/2609/p05-thumb', full: '/img/tagebuch/2609/p05', alt: 'Der Weg wird Stein für Stein fertig verlegt' },
      { thumb: '/img/tagebuch/2609/p06-thumb', full: '/img/tagebuch/2609/p06', alt: 'Zu zweit am Geländer der Brücke' },
      { thumb: '/img/tagebuch/2609/p07-thumb', full: '/img/tagebuch/2609/p07', alt: 'Das Geländer wird ausgerichtet und verschraubt' },
      { thumb: '/img/tagebuch/2609/p08-thumb', full: '/img/tagebuch/2609/p08', alt: 'Feinarbeit am Handlauf, zu zweit' },
      { thumb: '/img/tagebuch/2609/p09-thumb', full: '/img/tagebuch/2609/p09', alt: 'Letzte Anpassung am Brückenbogen' },
      { thumb: '/img/tagebuch/2609/p10-thumb', full: '/img/tagebuch/2609/p10', alt: 'Steine aus der Schubkarre für die letzten Meter' },
    ],
  },
  { id: '2709', tab: 'So 27.09.', title: 'Siegerehrung', photos: [] },
];

export const hasContent = (t) => (t.photos && t.photos.length > 0) || !!t.text;
