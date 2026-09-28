# Road to Shanghai · Stand nach der WM

**Stand: 28.09.2026** · Live: <https://shanghai.wirth-wiener.de> · Repo: dieses Verzeichnis (Branch `main`)

Kampagnenseite von Wirth & Wiener für **Marc-Aurel Spalek und Lennard Weitzmann** bei den
**WorldSkills 2026 in Shanghai** (22. bis 27.09.2026). Seit dem 28.09. ist die Seite eine
**Erinnerungsseite**: kein Countdown, kein Livestream-Hinweis, kein Verkauf, kein Spendenaufruf mehr.

---

## 1. Ergebnis und Eckdaten

| | |
|---|---|
| Ergebnis | **Bronze** im Skill 37 „Landscape Gardening" |
| Gold | Frankreich (Justin Kress, Corentin Mathieu) |
| Silber | noch nicht auf der Seite, Team offen |
| Feld | 20 Zweierteams aus 20 Ländern, 4 Wettkampftage, 22 Stunden Wettkampfzeit |
| Arbeitsplatz | Fläche 13 im Skill 37, National Exhibition and Convention Center (NECC) |
| Ablauf | 17.09. Abflug ab Frankfurt · 22.09. Eröffnung · 23. bis 26.09. Wettkampf · 27.09. Siegerehrung |
| Daumendrücker | **111** Laternen (Ziel auf der Seite steht bei 100) |
| Newsletter | 9 Ausgaben, alle vollständig zugestellt, 13 bestätigte Abonnenten |

Aufzeichnungen: [Eröffnungsfeier](https://www.youtube.com/watch?v=8CnEnzlDPfw) · [Siegerehrung](https://www.youtube.com/live/2yamAa_pcOU)

---

## 2. Aufbau der Seite heute

Reihenfolge von oben nach unten (`frontend/src/pages/index.astro`):

1. **Hero** (`components/Hero.astro`): Schriftzug „Shanghai" (das „Road to" ist nur noch für
   Screenreader da), Unterzeile „Unsere Jungs bei den WorldSkills 2026", großes **Bronze** in
   Bronzetönen mit Lichtschein, Button „Siegerehrung ansehen", Scroll-Hinweis „Die Reise nacherleben".
   Unten ein leichter dunkler Verlauf für die Lesbarkeit (in `.hero__scrim`).
2. **Die Reise** (`components/Route.astro`): 11 Kapitel, zuletzt 09 Die Eröffnung (Video),
   10 Fläche 13, 11 Bronze (Video der Siegerehrung, Link zum WSG-Beitrag, 6 Bilder).
3. **Daumendrücken** (`components/Cheer.astro`): Laternen, Zähler, Formular. Noch unverändert,
   siehe offene Punkte.
4. **Die WM-Woche in Shanghai** (`components/LiveMode.astro`, Anker `#live`, Menüpunkt „Tagebuch"):
   Aktuell-Karte (Bronze), Status „Das war die WM", **Tagebuch** mit Reitern, Box **Zum Nachschauen**
   (Aufzeichnungen und Kanäle), **Instagram-Raster** mit 5 Kacheln.
5. **Pressematerial** (`components/Press.astro`): als Akkordeon, standardmäßig zu.
   Direktlinks wie `#pressetext` klappen es automatisch auf.
6. **Fußbereich** (`components/Footer.astro`): Newsletter-Anmeldung (Text: Ratgeber und Neuigkeiten
   von Wirth & Wiener), Sponsoren, Impressum und Datenschutz.

Menü: Die Reise · Daumendrücken · Tagebuch · Newsletter

**Seit dem 28.09. entfernt:** Limo-Verkauf, Spendenaufruf mit Bankdaten, Teilen-Bereich,
„Das Programm in Shanghai", „So bist du dabei", Menüpunkt „Unterstützen", Countdown,
pulsierender Live-Punkt, eingebetteter Instagram-Beitrag.

---

## 3. Inhalte pflegen

| Was | Wo | Hinweis |
|---|---|---|
| Tagebuch (Reiter pro Tag) | `frontend/src/data/tagebuch.js` | Offen ist immer der neueste Tag mit Inhalt. `credit` pro Foto möglich. Ein einzelnes Foto wird automatisch groß und ohne Beschnitt gezeigt. Direktlink: `/#tag-2709` |
| Bilder Tagebuch | `frontend/public/img/tagebuch/<TTMM>/` | Dateien `pNN.jpg/.webp` (max. 1600 px) und `pNN-thumb.jpg/.webp` (560 px) |
| Instagram-Kacheln | `frontend/src/data/instagram.js` | Feste Liste, neueste zuerst, 5 werden gezeigt. Collab-Beiträge liefert die Instagram-Schnittstelle nicht, deshalb von Hand. Liste leeren = automatischer Feed der eigenen Beiträge. Tokens (`?stkn=`, `utm_`) aus Links entfernen. |
| Reise-Kapitel | `frontend/src/components/Route.astro`, Array oben | Bilder in `frontend/public/img/route/<kapitel>/` |
| Aktuell-Karte | `frontend/src/components/LiveMode.astro`, Block `live__update` | Badge, Text, Button, Meta |
| Zum Nachschauen | `frontend/src/components/LiveMode.astro`, Block `live__replay` | |
| Hero-Ergebnis | `frontend/src/components/Hero.astro`, Block `hero__status` | Größe staffelt sich nach Fensterhöhe |

**Bilder aufbereiten:** Originale nie verändern. Auswahl per Kontaktabzug, dann mit Pillow auf 1600 px
(voll) und 560 px (Kachel) als JPG und WebP.

---

## 4. Bildnachweise (Pflicht)

| Quelle | Nachweis auf der Seite | Wo |
|---|---|---|
| Petra Reidel, Pakete „AUGALA-Reidel" (Tag 1 bis 4, Abschluss) | **AuGaLa/Reidel** | Tagebuch 23. bis 27.09., Reise 11, Newsletter 5 bis 9 |
| Petra Reidel, Eröffnung und Pressegespräch 10.09. | **Petra Reidel** | Tagebuch 22.09., Reise 08 |
| Eigene Fotos (Handy, mitgereiste Fans) | **Wirth & Wiener** | Tagebuch 22./23.09., Reise 09/10, Newsletter 3/4 |
| WorldSkills Germany | WorldSkills Germany / Frank Erpinar | Team-Germany-Fotos |
| Verband GaLaBau Sachsen | © Verband … Sachsen e. V. | ältere Kapitel |

Kontakt Reidel: blätterwerk redaktionsbüro, Petra Reidel, Dorfstraße 42, 88527 Unlingen, Tel. 0175 2711433.

**Offen: das Jubelbild** (Marc-Aurel, Lennard und Trainer unter der Fahne, in der Halle). Kam nur als
Bildschirmfoto, Quelle unbekannt. Steht im Tagebuch 27.09. ohne Nachweis und im Pop-up auf
wirth-wiener.de. In Newsletter 9 steht darunter „Foto: AuGaLa/Reidel" (Mail ist raus, nicht änderbar).

---

## 5. Veröffentlichen (Deploy)

```bash
cd frontend
unset PAGES_BASE && npm run build
rsync -rz --delete --exclude='.DS_Store' -e "ssh -o BatchMode=yes" dist/ wirth-wiener:www/htdocs/w01f6f47/shanghai.wirth-wiener.de/
```

- Hosting: All-Inkl (85.13.135.67), DNS bei IONOS. SSH-Alias `wirth-wiener`.
- Hauptseite (WordPress): `www/htdocs/w01f6f47/wp2025`, WP-CLI vorhanden.
- Lokal testen: `npm run dev` (Port 4321) oder Produktions-Build mit `npm run preview -- --port 4322`
  (beides in `.claude/launch.json`).
- Direktlinks mit `#anker` springen nach dem Preloader an die richtige Stelle (`scripts/motion.js`).

---

## 6. Newsletter

Plugin **„Newsletter" (TNP)** auf wirth-wiener.de, Vorlagen aus `marketing/newsletter/build.cjs`
(Ausgabe in `marketing/newsletter/dist/`, Vorschauen `preview-*.html`). Tracking aus, Double-Opt-in aktiv.

| # | Betreff | Versand |
|---|---|---|
| 1 | Die WM-Woche beginnt | Sa 19.09. 19:00 |
| 2 | Heute, 14 Uhr: Die Eröffnung live | Di 22.09. 06:30 |
| 3 | Eröffnung zum Nachschauen & Tag 1 | Mi 23.09. 06:30 |
| 4 | Mitgereist: unsere Gruppe in Shanghai | Mi 23.09. 17:30 |
| 5 | Tag 2 ist geschafft, und er hatte es in sich | Fr 25.09. 10:24 |
| 6 | Drei Tage geschafft, heute ist der letzte Wettkampftag | Sa 26.09. 10:04 |
| 7 | Geschafft, der Garten steht | Sa 26.09. 17:00 |
| 8 | Heute 13 Uhr: die Siegerehrung live | So 27.09. 12:09 |
| 9 | Bronze für Marc-Aurel und Lennard | So 27.09. 14:06 |

**Ablauf, der sich bewährt hat:** in `build.cjs` bauen, Bilder nach
`wirth-wiener.de/wp-content/uploads/newsletter-rts/` laden, per `wp eval-file` als Entwurf anlegen
(`status=new`), Test-Mail an stefan@gumu-agentur.de, erst nach ausdrücklichem GO auf `sending` stellen.

**Wichtig zu wissen:**
- `mail()` geht nur im Web-Kontext, nicht per SSH. Test-Mails daher über eine kurzlebige,
  schlüsselgeschützte REST-Route (mu-plugin), danach sofort löschen und 404 prüfen.
- Das Plugin verschickt in Schüben (erst 8, Rest beim nächsten Lauf). Nachhelfen mit
  `curl "https://wirth-wiener.de/wp-cron.php?doing_wp_cron=$(date +%s)"`, zwischen zwei Aufrufen
  gut eine Minute warten (Sperre).
- Absender (Übergang): `RTS_Newsletter_Sender` in `rts-backend` setzt „Wirth & Wiener"
  &lt;info@wirth-wiener.de&gt;, Rücksendepfad stefan@gumu-agentur.de.
- **Geplant Anfang Oktober:** WP Mail SMTP auf smtp.ionos.de:587 mit info@wirth-wiener.de umstellen
  (Passwort trägt Stefan ein), dann in `wp-config.php` `define('RTS_NL_SENDER_OVERRIDE', false);`
  und mit mail-tester prüfen.
- Newsletter läuft als allgemeiner Wirth-&-Wiener-Newsletter weiter (Anmeldetext entsprechend).

---

## 7. Hauptseite wirth-wiener.de

Plugin **`wuw-shanghai-hinweis` 2.0.0** (Kopie im Repo unter `app/public/wp-content/plugins/`):

- **Bronze-Pop-up** auf allen Seiten: Jubelbild, „Bronze!", Text, Button zur Shanghai-Seite.
  Einmal pro Besucher, danach 30 Tage Ruhe (`WUW_SH_BRONZE_SNOOZE`). Schließt per X, Esc, Klick daneben.
- Ausschalten: `const WUW_SH_BRONZE = false;` dann kommt wieder der alte kleine Hinweis unten rechts.
- Startseiten-Sektion (Slot `wuw_home_shanghai` in `front-page.php`) zeigt „Bronze! …" und ab
  28.09. (Shanghai-Zeit) „Bronze bei den WorldSkills 2026, danke fürs Daumendrücken!".
- Achtung: Vor Änderungen immer zuerst den Serverstand holen, die Repo-Kopie war schon einmal älter.

---

## 8. Offene Punkte und Ideen

- [ ] **Daumendrücken → Glückwünsche?** Vorschlag: 111 Laternen als Erinnerung stehen lassen,
      Formular wird zu „Gratuliere Marc-Aurel und Lennard", neue Laternen in Bronzeton,
      zwei bis drei Wochen offen, danach schließen. Entscheidung bei Stefan.
- [ ] Ziel beim Daumendrücken (100) anpassen oder Balken auf „Ziel erreicht" stellen.
- [ ] Quelle des Jubelbilds klären, dann Nachweis im Tagebuch und Pop-up nachtragen
      (oder im Pop-up auf Reidels Bühnenjubel wechseln, Quelle eindeutig).
- [ ] Silber-Team ergänzen, falls das Podest im Text stehen soll.
- [ ] Presse-Akkordeon inhaltlich nachziehen: Zeilen „Livestream" und „Täglich ab 22.09." sind noch
      im Vorab-Stand, Ergebnis Bronze fehlt in den Eckdaten.
- [ ] Ortszeit-Uhren (Chemnitz/Shanghai) im Header und Hero: für eine Erinnerungsseite entbehrlich.
- [ ] Bronze-Pop-up auf wirth-wiener.de nach ein paar Wochen abschalten.
- [ ] Newsletter-Absender auf IONOS umstellen (siehe Abschnitt 6).
- [ ] `frontend/STATUS.md` ist vom Juni und veraltet, dieses Dokument ersetzt es.

---

## 9. Regeln, die gelten

- Texte ohne Gedankenstriche, natürlich formuliert (Datumsspannen wie 22.–27. sind ok).
- Presse- und Kontaktadresse auf der Seite immer **info@gumu-agentur.de**.
- Bildnachweise immer angeben (Abschnitt 4).
- Newsletter nie ohne ausdrückliches GO verschicken oder einplanen. Double-Opt-in bleibt aktiv.
- Keine Passwörter oder API-Schlüssel ins Repo.
- Originalbilder auf dem Schreibtisch nie verändern oder löschen.
