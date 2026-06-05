# Bild-Briefing — Road to Shanghai

Fertige Prompts + Specs für die KI-Bilder (Generierung in ChatGPT).
**Workflow:** Bild in ChatGPT erzeugen → mir die Datei geben (PNG/JPG, Benennung egal) →
ich konvertiere zu AVIF/WebP, optimiere und lege sie am richtigen Pfad ab.
Oder direkt selbst in den jeweiligen Ordner unter `public/img/<sektion>/` legen.

## Grundregeln für alle Bilder
- **Kein Text im Bild** (Headlines liegen als echter Text darüber → scharf & mehrsprachig).
- **Querformat**, hohe Auflösung (siehe je Bild), als **PNG oder JPG** exportieren.
- **Farbwelt:** Chinarot `#A81E2E`, Gold `#C9A24B`, Jade `#3E7D5A`, Tusche-Schwarz `#16120F`, Reispapier `#F1E8D6`.
- Stil: **Tusche / Ink-wash, cinematic, edel** — nicht knallig, nicht „Stock-Foto".

---

## 1. Hero-Hintergrund  →  `public/img/hero/hero-bg.jpg`
**Wichtigstes Bild (LCP).** Seitenverhältnis **21:9**, mind. **2560×1097 px** (besser 3200×1371).

**Prompt (EN):**
> Cinematic ink-wash painting transitioning from a misty Erzgebirge pine forest on the LEFT into a glowing nighttime Shanghai skyline on the RIGHT (Oriental Pearl Tower), warm sky lanterns rising softly into a deep night sky, deep China-red and jade-green palette with gold accents, atmospheric depth and mist, highly detailed, wide cinematic banner, 21:9. Keep the CENTER and LEFT calmer and slightly darker for headline text overlay. No text, no large fish in the center, no people.

**Notizen:**
- **Kein großer Koi in der Mitte** — dort sitzt unser animierter Koi. Mitte/links ruhig & etwas dunkler halten (Platz für „ROAD TO SHANGHAI").
- Laternen dürfen im Bild sein (Tiefe); wir haben zusätzlich dezente animierte.

---

## 2. Reise-Hintergrund  →  `public/img/route/route-bg.jpg`
Liegt als ruhiger Backdrop hinter der gepinnten Sektion. **16:9**, **2560×1440 px**.

**Prompt (EN):**
> Elegant sumi-e ink-wash world map on a pale rice-paper texture, very subtle and faint, generous negative space, a soft faint Shanghai skyline and a few bamboo strokes on the far RIGHT edge, muted jade and warm paper tones, low contrast, premium editorial style, horizontal. No bright colors, no text, no vine (a glowing vine is added separately).

**Notizen:**
- **Sehr hell & kontrastarm** — Text und die animierte SVG-Ranke liegen darüber.
- Viel Weißraum/Reispapier; keine kräftigen Farben.

---

## 3. Daumendrücken-Hintergrund  →  `public/img/cheer/cheer-bg.jpg`
**3:2 / 16:9**, **2400×1600 px**.

**Prompt (EN):**
> Dark Shanghai night sky over a faint distant city skyline, hundreds of warm glowing sky lanterns drifting upward, deep indigo and black with golden lantern glow and subtle red and jade accents, magical and emotional, cinematic, horizontal. Keep the UPPER-CENTER open and dark for a large button overlay. No text, no people.

**Notizen:**
- **Obere Mitte frei/dunkel** (dort sitzt der große „Daumen drücken"-Button).
- Wir haben zusätzlich einen Canvas-Laternenlayer davor — das Bild ist die Tiefe dahinter.

---

## 4. Live-Featured (Platzhalter)  →  `public/img/live/live-featured.jpg`
**3:2 / 16:9**, **2000×1333 px**.

**Prompt (EN):**
> Two young landscapers in dark green "Team Germany" shirts building a competition show garden with a circular moon-gate feature, bright exhibition-hall lighting, documentary / photojournalistic style, warm tones, high detail, horizontal.

**Notizen:**
- Reiner Platzhalter — **später durch ein echtes Foto von Marc-Aurel & Lennard** ersetzen.

---

## Optional — Wunschbaum-Hintergrund  →  `public/img/wish/wish-bg.jpg`
Nur falls gewünscht. **16:9**.

**Prompt (EN):**
> A serene wishing tree silhouette at night with hanging lantern ribbons and small glowing lanterns, jade-green and deep teal tones with golden light, lots of calm negative space, sumi-e ink-wash style, horizontal. No text.

---

### Reihenfolge-Empfehlung
1. **Hero** zuerst (größter Effekt) → ich baue ihn komplett durch.
2. Dann Reise → Daumendrücken → Live.
