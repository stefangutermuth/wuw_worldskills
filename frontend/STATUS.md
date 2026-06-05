# Projekt-Status — Road to Shanghai

**Kampagnen-Microsite** zur Berufe-Weltmeisterschaft **WorldSkills 2026 in Shanghai** (22.–27.09.2026)
für die Azubis **Marc-Aurel Spalek & Lennard Weitzmann** (Wirth & Wiener GmbH, GaLaBau Chemnitz, Deutsche Meister 2025).
Konzept: **Koi-zur-Drache-Legende** & „East meets Erzgebirge". Vollständiges Briefing: `~/Desktop/CLAUDE.md`.

Stand: **2026-06-05**

---

## 1. Tech-Stack & Architektur

| Schicht | Technologie |
|---|---|
| Frontend | **Astro** (`output: 'static'`), Vanilla JS, **GSAP + ScrollTrigger**, **Lenis** (Smooth-Scroll) |
| Styling | Vanilla CSS, Design-Tokens. Fonts lokal via `@fontsource` (Inter, Cormorant Garamond, Great Vibes) |
| Backend | **Headless WordPress** als reines CMS/Admin — eigenes Plugin `rts-backend`, REST-API (`rts/v1`) |
| Hosting Prod | All-Inkl/Kasserver: Astro als statischer Build per FTP; WP headless auf Subdomain (`noindex`) |
| Lokal | WordPress via **Local** (Flywheel); Astro Dev-Server |

**Prinzip:** *Static shell + dynamic islands.* Die animierte Seite ist statisch; nur die interaktiven Teile
(Daumen-Zähler, Wunsch-Formular, Live-Ticker, Newsletter) sprechen per `fetch` die WP-REST-Endpunkte an.
Der Zähler wird **immer serverseitig** gerechnet.

---

## 2. Lokales Setup / Entwicklung

- **Projektwurzel (Local):** `~/Local Sites/worldskills-shanghai-2026`
- **Frontend:** `frontend/` → `npm run dev` (Port **4321**)
- **WordPress:** über Local, Domain **`worldskills-shanghai-2026.local`**

**nginx-Proxy:** `.local` zeigt die Astro-Seite (Proxy auf `127.0.0.1:4321`), `/wp-admin` & `/wp-json` gehen an WordPress.
Konfig in `conf/nginx/site.conf.hbs` (Original als `.bak`). Nach Template-Änderungen: **Site in Local neu starten**.

- **Seite ansehen:** `http://worldskills-shanghai-2026.local` (oder direkt `http://localhost:4321`)
- **WP-Admin:** `http://worldskills-shanghai-2026.local/wp-admin`
- **REST-Basis:** `.env` → `PUBLIC_WP_API=http://worldskills-shanghai-2026.local/wp-json`

**HMR:** läuft direkt auf `localhost:4321` (nicht über den Proxy). Bei Änderungen lädt der Dev-Server
automatisch komplett neu (wegen GSAP-ScrollTrigger, siehe §7).

---

## 3. Seitenaufbau (alle Sektionen umgesetzt ✅)

Reihenfolge: **Header → Hero → Reise → Daumendrücken → Wunschbaum → Live → Footer**

| Sektion | Komponente | Inhalt |
|---|---|---|
| Header/Nav | `Header.astro` | W&W-Logo (weiß), Navigation, Newsletter-Button, mobiles Burger-Menü, beim Scrollen dunkle Glas-Leiste |
| Hero | `Hero.astro` | Echtes Bild + freigestellter Koi + Nebel + schwebende Laternen, Kalligrafie-Headline „Shanghai", Split-Flap-Countdown, 3D-Parallax (Scroll + Maus) |
| Reise | `Route.astro` | Gepinntes Horizontal-Scrollytelling, wachsende SVG-Ranke (Jade→Gold→Chinarot), 5 Kapitel, Karten-Hintergrund mit Zoom, Mobile-Fallback (vertikal) |
| Daumendrücken | `Cheer.astro` | Live-Zähler, Tap-Laternen, Canvas-Laternenhimmel, Ticker, „Im Ticker eintragen", Foto-Hintergrund mit Zoom |
| Wunschbaum | `WishTree.astro` | Formular + moderierte Wunsch-Liste, hängende schwingende Wunsch-Laternen |
| Live | `LiveMode.astro` | LIVE-Badge, Zwei-Zeitzonen-Uhr (Chemnitz/Shanghai), Featured-Foto, Dispatch-Karten, Instagram-Grid |
| Footer | `Footer.astro` + `Newsletter.astro` | Newsletter-Anmeldung, Sponsoren, Teilen (Web Share + Copy), Rechtliches |

**Scripts:** `motion.js` (Lenis+GSAP), `countdown.js`, `route.js`, `cheer.js`, `wish.js`, `live.js`, `bgParallax.js`, `api.js`.

---

## 4. Backend — Plugin `rts-backend` (aktiv)

Liegt in `app/public/wp-content/plugins/rts-backend/`. REST-Namespace **`rts/v1`**:

| Methode | Route | Zweck |
|---|---|---|
| GET/POST | `/cheer` | Daumen-Zähler (serverseitig, 1×/Gerät/Tag), Ticker; Name auch nachträglich anhängbar |
| GET/POST | `/wishes` | Wünsche (Moderations-Queue = `pending`/`publish`), Turnstile-ready |
| GET | `/dispatches` | Live-Berichte (CPT `dispatch`) |
| GET | `/status` | Live-Modus-Flag (`{live:bool}`) |
| POST | `/newsletter` | **Platzhalter** (validiert, ESP noch nicht angebunden) |

- CPTs: `wunsch` (mit Admin-Spalten Vorname/Ort), `dispatch`.
- Custom-Tabelle `wp_rts_cheers` (Dedup + Ticker), Option `rts_cheer_count` (atomar).
- **CORS** für `localhost:4321`, `worldskills-shanghai-2026.local`, `shanghai.wirth-wiener.de`.
- Pretty Permalinks aktiv. **n8n entfällt** — Newsletter & Instagram laufen künftig über das Plugin.

---

## 5. Bilder-Pipeline

- Original-Bilder (aus ChatGPT) liegen in `frontend/image-sources/` (NICHT in `public/` → nicht deployt).
- Konvertierung zu AVIF/WebP/JPG via **sharp** (node-Einzeiler), Output nach `public/img/<sektion>/`.
- Einbau als CSS `image-set()` mit Verlauf-Fallback.
- Prompts & Specs: `frontend/IMAGES.md`.

**Eingebaut:** Hero-Hintergrund, Reise-Karte, Daumendrücken-Nachthimmel, Live-Featured (Platzhalter), Koi, Nebel, Laternen.

**KI-Bild-Technik (schwarzer Hintergrund):**
- **Leuchtende Objekte** (Laternen, Nebel) → `mix-blend-mode: screen` **auf dem Container** (nicht aufs Einzel-Element, sonst schwarzer Kasten).
- **Feste Objekte** (Koi) → echte Alpha-Freistellung: RGBA-Puffer **manuell** in sharp bauen
  (`removeAlpha().raw()` → pro Pixel `a = clamp(6*luminanz − 170)` → `sharp(buf,{raw:{channels:4}})`).
  `joinChannel`+Palette-PNG verliert den Alpha-Kanal! Immer mit `metadata().hasAlpha` UND Composite über **hellem** Grund prüfen.

---

## 6. Deploy (Prod)

- Lokal `npm run build` → `dist/` per FTP auf Kasserver (`shanghai.wirth-wiener.de`).
- WP headless auf `cms.wirth-wiener.de` (`noindex`).
- Umstellen: `.env` (`PUBLIC_WP_API`) + CORS-Origin im Plugin.

---

## 7. Bekannte Stolperfallen / Lehren

- **GSAP-ScrollTrigger + HMR vertragen sich nicht.** Beim Hot-Reload bleiben alte Trigger hängen → Pin/Scroll „verheddert".
  Fix in `motion.js`: bei jeder HMR-Änderung lädt die Seite im Dev komplett neu. **Im echten Build nie ein Problem.**
- **nginx-Proxy reicht den Vite-HMR-Websocket nicht durch** → HMR läuft direkt auf `localhost:4321`.
- **ScrollTrigger live testen:** programmatischer `window.scrollTo` triggert ScrollTrigger NICHT (Lenis) —
  zusätzlich `window.dispatchEvent(new Event('scroll'))` feuern, sonst scheint der Pin fälschlich „kaputt".
- **Screenshots der Extension** scheitern an den Dauer-Animationen (Seite nie „idle") — kein Seitenfehler.

---

## 8. Erledigt ✅

- Alle 6 Bau-Phasen + Header & Footer
- Alle Schlüsselbilder eingebaut & optimiert
- Hero komplett bild-basiert (Koi/Nebel/Laternen als echte Assets) + 3D-Parallax
- Kalligrafie-Headline „Shanghai" (Great Vibes)
- Hintergrund-Zoom in Reise & Daumendrücken
- Wording überall **WorldSkills** (statt „Berufe-WM")
- Header mit echtem W&W-Logo
- Wunschbaum optisch aufgewertet (hängende Laternen, Tiefe)

## 9. Offene To-dos

**Optik:**
- [ ] **Live-Sektion** fertig gestalten (Instagram-Grid mit Bildern statt leerer Kästchen, „Bald live"-Zustand) — *geplant mit Stockbildern*
- [ ] **Feinschliff** (#5): Sektionsübergänge, Typo-Klammer, Mobile-Durchsicht, Reise-Ranke/Karte-Passung
- [ ] Footer-Sponsoren: echte Partner-Logos
- [ ] Optional: Zoom-Effekt auch auf Wunschbaum/Live (sobald Foto-Hintergründe da)

**Inhalt/Technik vor Live:**
- [ ] **Newsletter-ESP** anbinden (Brevo/CleverReach) — `/newsletter` ist Stub
- [ ] **Cloudflare-Turnstile** Keys setzen (Wunsch-Formular: `PUBLIC_TURNSTILE_SITEKEY` + WP-Option `rts_turnstile_secret`)
- [ ] **Live-Modus** scharfschalten via Option `rts_live`
- [ ] **Echtes Foto** von Marc-Aurel & Lennard (ersetzt Live-Platzhalter)
- [ ] Instagram-Feed-Quelle, Impressum/Datenschutz
- [ ] Test-Wünsche (Anna, Familie Wagner) in wp-admin löschen
