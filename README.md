# Road to Shanghai — WorldSkills 2026

Kampagnen-Microsite für die Azubis **Marc-Aurel Spalek & Lennard Weitzmann** (Wirth & Wiener GmbH)
auf dem Weg zu den **WorldSkills 2026 in Shanghai**.

## Aufbau
- **`frontend/`** — Astro-Frontend (statisch), GSAP + Lenis. Der Großteil der Arbeit.
- **`app/public/wp-content/plugins/rts-backend/`** — Headless-WordPress-Plugin (REST-API, Zähler, Wünsche, Dispatches, CORS).
- **`conf/nginx/`** — nginx-Templates für das lokale Proxy-Setup (`.local` → Astro, `/wp-admin` → WordPress).

## Dokumentation
- **`STAND.md`** · aktueller Stand nach der WM (28.09.2026): Aufbau, Pflege, Deploy, Newsletter, Bildnachweise, offene Punkte. **Hier zuerst lesen.**
- **`frontend/STATUS.md`** · älterer Projektstand vom Juni 2026 (Architektur, Setup).
- **`frontend/IMAGES.md`** — Bild-Briefing & Prompts.

## Schnellstart (lokal)
```bash
cd frontend
npm install
npm run dev        # http://localhost:4321
```
WordPress läuft über **Local** (Flywheel); die `.local`-Domain zeigt via nginx-Proxy die Astro-Seite.
Details siehe `frontend/STATUS.md`.
