"""Rendert Karussell + Storys "Kein Livestream – so seid ihr dabei" im Look der Website."""
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
import os, sys

SCR = sys.argv[1]
ROOT = sys.argv[2]
OUT = os.path.join(ROOT, 'marketing/ig-kein-livestream')
ORIG = os.path.join(ROOT, '_originale/pressegespraech/PG-Sachsen_WSS_Petra Reidel-{}.jpg')
os.makedirs(OUT, exist_ok=True)

NIGHT, INK = (12, 22, 34), (22, 18, 15)
PAPER, GOLD, RED = (241, 232, 214), (201, 162, 75), (168, 30, 46)
SOFT, DIM = (184, 177, 164), (120, 116, 108)

def F(name, size): return ImageFont.truetype(os.path.join(SCR, 'ttf', name + '.ttf'), size)
BR = lambda s: F('fa-brands', s)
SO = lambda s: F('fa-solid', s)
ICON = {'instagram': ('', BR), 'facebook': ('', BR), 'linkedin': ('', BR),
        'tiktok': ('', BR), 'youtube': ('', BR), 'globe': ('', SO),
        'bookmark': ('', SO), 'share': ('', SO)}

# ---------- Helfer ----------
def bg(w, h):
    """Nachthimmel-Verlauf wie im Live-Bereich der Seite, dazu ein roter Lichthof."""
    im = Image.new('RGB', (w, h))
    px = im.load()
    for y in range(h):
        t = y / (h - 1)
        c = tuple(int(NIGHT[i] * (1 - t) + INK[i] * t) for i in range(3))
        for x in range(w): px[x, y] = c
    glow = Image.new('L', (w, h), 0)
    ImageDraw.Draw(glow).ellipse((w * 0.45, -h * 0.25, w * 1.35, h * 0.35), fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    im.paste(Image.new('RGB', (w, h), RED), (0, 0), glow)
    gold = Image.new('L', (w, h), 0)
    ImageDraw.Draw(gold).ellipse((-w * 0.5, h * 0.72, w * 0.5, h * 1.3), fill=38)
    gold = gold.filter(ImageFilter.GaussianBlur(170))
    im.paste(Image.new('RGB', (w, h), GOLD), (0, 0), gold)
    return im

def photo(n, w, h, center):
    im = ImageOps.exif_transpose(Image.open(ORIG.format(n))).convert('RGB')
    return ImageOps.fit(im, (w, h), Image.LANCZOS, centering=center)

def shade(im, top_to, bottom_from, top_a=150, bottom_a=240):
    """Dunkler Verlauf oben und unten, damit Text über dem Foto lesbar bleibt."""
    w, h = im.size
    m = Image.new('L', (w, h), 0); p = m.load()
    for y in range(h):
        a = 0
        if y < top_to: a = int(top_a * (1 - y / top_to) ** 1.6)
        if y > bottom_from: a = max(a, int(bottom_a * ((y - bottom_from) / (h - bottom_from)) ** 1.15))
        for x in range(w): p[x, y] = a
    im.paste(Image.new('RGB', (w, h), (8, 10, 14)), (0, 0), m)
    return im

def spaced(d, xy, text, font, fill, track):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + track
    return x

def wrap(text, font, maxw):
    lines, cur = [], ''
    for word in text.split(' '):
        test = (cur + ' ' + word).strip()
        if font.getlength(test) <= maxw: cur = test
        else: lines.append(cur); cur = word
    if cur: lines.append(cur)
    return lines

def para(d, xy, text, font, fill, maxw, lh):
    x, y = xy
    for line in wrap(text, font, maxw):
        d.text((x, y), line, font=font, fill=fill); y += lh
    return y

def fit(text, name, start, maxw):
    s = start
    while F(name, s).getlength(text) > maxw: s -= 2
    return F(name, s)

def icon_circle(d, cx, cy, r, key):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=GOLD, width=3)
    glyph, fn = ICON[key]
    d.text((cx, cy), glyph, font=fn(int(r * 0.95)), fill=PAPER, anchor='mm')

def channel_row(d, x, y, w, h, key, platform, handle, hsize=40):
    d.rounded_rectangle((x, y, x + w, y + h), radius=22, fill=(255, 255, 255, 10) if False else (26, 30, 36), outline=(74, 66, 46), width=2)
    icon_circle(d, x + 26 + h * 0.34, y + h / 2, h * 0.3, key)
    tx = x + 52 + h * 0.68
    d.text((tx, y + h * 0.2), platform.upper(), font=F('inter-600', 21), fill=DIM)
    d.text((tx, y + h * 0.43), handle, font=fit(handle, 'inter-600', hsize, w - (tx - x) - 30), fill=PAPER)

def chrome(d, w, h, idx, total, label='ROAD TO SHANGHAI · WORLDSKILLS 2026'):
    spaced(d, (90, 92), label, F('inter-600', 23), GOLD, 4.2)
    d.text((90, h - 108), 'shanghai.wirth-wiener.de', font=F('inter-600', 25), fill=SOFT)
    if total:
        d.text((w - 90, h - 108), f'{idx} / {total}', font=F('inter-600', 25), fill=SOFT, anchor='ra')

def chevron(d, x, y, size, color, width=5):
    d.line((x, y - size, x + size, y, x, y + size), fill=color, width=width, joint='curve')

def rule(d, x, y, w=120): d.rectangle((x, y, x + w, y + 4), fill=GOLD)

W, H = 1080, 1350
TOTAL = 6
files = []

# ---------- 1: Hook mit Foto ----------
im = shade(photo(11, W, H, (0.61, 0.42)), top_to=380, bottom_from=560, top_a=215)
d = ImageDraw.Draw(im)
spaced(d, (90, 92), 'WORLDSKILLS SHANGHAI 2026', F('inter-600', 23), GOLD, 4.2)
pill = 'INFO FÜR ALLE FANS'
pf = F('inter-700', 22); pw = sum(pf.getlength(c) + 3.5 for c in pill) + 44
d.rounded_rectangle((90, 812, 90 + pw, 860), radius=24, fill=RED)
spaced(d, (112, 824), pill, pf, PAPER, 3.5)
d.text((86, 880), 'Kein Livestream', font=F('corm-700', 112), fill=PAPER)
d.text((86, 988), 'aus Shanghai.', font=F('corm-700', 112), fill=PAPER)
d.text((92, 1126), 'So seid ihr trotzdem ganz nah dran.', font=F('inter-400', 38), fill=PAPER)
sw = F('inter-600', 28); lab = 'Wischen'
d.text((W - 128 - sw.getlength(lab), 1236), lab, font=sw, fill=GOLD)
chevron(d, W - 112, 1253, 13, GOLD); chevron(d, W - 96, 1253, 13, GOLD)
d.text((92, 1244), 'Foto: Petra Reidel', font=F('inter-400', 21), fill=SOFT)
files.append(('slide-01.jpg', im))

# ---------- 2: Warum ----------
im = bg(W, H); d = ImageDraw.Draw(im); chrome(d, W, H, 2, TOTAL)
d.text((86, 190), 'Warum kein Stream?', font=F('corm-700', 92), fill=PAPER)
rule(d, 92, 318)
y = para(d, (92, 360), 'Damit sich die Teams voll auf ihre Aufgabe konzentrieren können, wird aus Shanghai nicht live übertragen – weder bei den Wettkämpfen noch bei den Veranstaltungen.', F('inter-400', 38), PAPER, 890, 56)
d.text((92, y + 14), 'Info: WorldSkills Germany', font=F('inter-400', 25), fill=DIM)
cy = y + 96
d.rounded_rectangle((90, cy, W - 90, cy + 420), radius=28, fill=(24, 28, 34), outline=(88, 76, 48), width=2)
spaced(d, (132, cy + 42), 'DIE WM-WOCHE', F('inter-600', 22), GOLD, 4)
rows = [('Di · 22.09.', 'Eröffnung'), ('Mi–Sa · 23.–26.09.', '4 Wettkampftage'), ('So · 27.09.', 'Siegerehrung')]
ry = cy + 104
for i, (a, b) in enumerate(rows):
    d.text((132, ry), a, font=F('inter-600', 34), fill=GOLD)
    d.text((W - 132, ry), b, font=F('inter-400', 34), fill=PAPER, anchor='ra')
    if i < 2: d.line((132, ry + 72, W - 132, ry + 72), fill=(58, 54, 46), width=2)
    ry += 98
files.append(('slide-02.jpg', im))

# ---------- 3–5: Kanaele ----------
def channels(num, eyebrow, title, sub, rows, idx):
    im = bg(W, H); d = ImageDraw.Draw(im); chrome(d, W, H, idx, TOTAL, eyebrow)
    d.text((86, 190), title, font=fit(title, 'corm-700', 92, W - 180), fill=PAPER)
    rule(d, 92, 318)
    y = para(d, (92, 360), sub, F('inter-400', 36), PAPER, 890, 52)
    y += 44
    rh = 150 if len(rows) <= 3 else 118
    gap = 28 if len(rows) <= 3 else 18
    for key, plat, handle in rows:
        channel_row(d, 90, y, W - 180, rh, key, plat, handle, hsize=46 if len(rows) <= 3 else 40)
        y += rh + gap
    return im

files.append(('slide-03.jpg', channels(1, 'SO SEID IHR DABEI · 1', 'Team Germany',
    'Updates, Bilder und Eindrücke vom ganzen deutschen Team – direkt aus Shanghai.',
    [('instagram', 'Instagram', '@worldskills_germany'), ('facebook', 'Facebook', 'WorldSkillsGermany'),
     ('linkedin', 'LinkedIn', 'WorldSkills Germany')], 3)))
files.append(('slide-04.jpg', channels(2, 'SO SEID IHR DABEI · 2', 'Die Landschaftsgärtner',
    'Jeden Tag Baufortschritt, Reels, Ländervergleiche und Interviews – von der Wettkampfbaustelle.',
    [('instagram', 'Instagram', '@die_landschaftsgaertner'), ('facebook', 'Facebook', 'dielandschaftsgaertner'),
     ('tiktok', 'TikTok', '@ausbildung_galabau'), ('youtube', 'YouTube', '@Ausbildung_galabau')], 4)))
im5 = channels(3, 'SO SEID IHR DABEI · 3', 'Marc-Aurel & Lennard',
    'Ihre Berichte, alle Bilder und das Daumendrücken – an einem Ort.',
    [('instagram', 'Instagram', '@wirth_wiener_gmbh'), ('globe', 'Website', 'shanghai.wirth-wiener.de')], 5)
d = ImageDraw.Draw(im5)
d.text((W / 2, 1036), 'Für jeden, der die Daumen drückt,', font=F('corm-600i', 50), fill=GOLD, anchor='ma')
d.text((W / 2, 1096), 'steigt eine Laterne auf.', font=F('corm-600i', 50), fill=GOLD, anchor='ma')
files.append(('slide-05.jpg', im5))

# ---------- 6: Teilen + Speichern, Foto ----------
im = photo(85, W, H, (0.5, 0.45))
im.paste(Image.new('RGB', (W, H), (8, 10, 14)), (0, 0), Image.new('L', (W, H), 140))
im = shade(im, top_to=380, bottom_from=300, top_a=215, bottom_a=252)
d = ImageDraw.Draw(im)
spaced(d, (90, 92), 'ROAD TO SHANGHAI · WORLDSKILLS 2026', F('inter-600', 23), GOLD, 4.2)
d.text((86, 640), 'Teilt das mit allen,', font=F('corm-700', 96), fill=PAPER)
d.text((86, 734), 'die nicht mitfliegen.', font=F('corm-700', 96), fill=PAPER)
rule(d, 92, 866)
para(d, (92, 904), 'Und speichert euch den Beitrag – am 22.\u00a0September geht es los.', F('inter-400', 38), PAPER, 880, 54)
for i, (key, lab) in enumerate([('bookmark', 'Speichern'), ('share', 'Teilen')]):
    x = 92 + i * 300
    icon_circle(d, x + 36, 1106, 36, key)
    d.text((x + 90, 1088), lab, font=F('inter-600', 32), fill=PAPER)
d.text((92, H - 108), 'shanghai.wirth-wiener.de', font=F('inter-600', 25), fill=SOFT)
d.text((W - 90, H - 108), f'{TOTAL} / {TOTAL}', font=F('inter-600', 25), fill=SOFT, anchor='ra')
d.text((W - 90, 92), 'Foto: Petra Reidel', font=F('inter-400', 21), fill=SOFT, anchor='ra')
files.append(('slide-06.jpg', im))

# ---------- Storys 1080 x 1920 (Text nur im sicheren Bereich 250–1580) ----------
SW, SH = 1080, 1920
s = bg(SW, SH); ph = photo(11, SW, 880, (0.52, 0.4)); s.paste(ph, (0, 340))
fade = Image.new('L', (SW, 880), 0); fp = fade.load()
for y in range(880):
    a = int(255 * max(0, (y - 560) / 320) ** 1.3) if y > 560 else 0
    for x in range(SW): fp[x, y] = a
s.paste(Image.new('RGB', (SW, 880), (18, 20, 24)), (0, 340), fade)
d = ImageDraw.Draw(s)
spaced(d, (90, 270), 'WORLDSKILLS SHANGHAI 2026', F('inter-600', 26), GOLD, 4.6)
d.text((86, 1110), 'Kein Livestream', font=F('corm-700', 120), fill=PAPER)
d.text((86, 1226), 'aus Shanghai.', font=F('corm-700', 120), fill=PAPER)
rule(d, 92, 1380, 140)
d.text((92, 1420), 'So seid ihr trotzdem dabei.', font=F('inter-400', 44), fill=PAPER)
d.text((92, 1490), 'Tippt weiter.', font=F('inter-600', 40), fill=GOLD)
chevron(d, 360, 1514, 15, GOLD); chevron(d, 380, 1514, 15, GOLD)
d.text((SW - 90, 1070), 'Foto: Petra Reidel', font=F('inter-400', 22), fill=SOFT, anchor='ra')
files.append(('story-01.jpg', s))

s = bg(SW, SH); d = ImageDraw.Draw(s)
spaced(d, (90, 270), 'SO SEID IHR DABEI', F('inter-600', 26), GOLD, 4.6)
d.text((86, 330), 'Folgt diesen Kanälen', font=F('corm-700', 96), fill=PAPER)
y = 480
for head, rows in [('TEAM GERMANY', [('instagram', 'Instagram', '@worldskills_germany'), ('facebook', 'Facebook', 'WorldSkillsGermany'), ('linkedin', 'LinkedIn', 'WorldSkills Germany')]),
                   ('DIE LANDSCHAFTSGÄRTNER', [('instagram', 'Instagram', '@die_landschaftsgaertner'), ('facebook', 'Facebook', 'dielandschaftsgaertner'), ('tiktok', 'TikTok', '@ausbildung_galabau'), ('youtube', 'YouTube', '@Ausbildung_galabau')])]:
    spaced(d, (92, y), head, F('inter-600', 24), SOFT, 4); y += 50
    for key, plat, handle in rows:
        channel_row(d, 90, y, SW - 180, 118, key, plat, handle); y += 132
    y += 34
files.append(('story-02.jpg', s))

s = bg(SW, SH); ph = photo(86, SW, 640, (0.55, 0.5)); s.paste(ph, (0, 340))
fade = Image.new('L', (SW, 640), 0); fp = fade.load()
for y in range(640):
    a = int(255 * max(0, (y - 380) / 260) ** 1.3) if y > 380 else 0
    for x in range(SW): fp[x, y] = a
s.paste(Image.new('RGB', (SW, 640), (18, 20, 24)), (0, 340), fade)
d = ImageDraw.Draw(s)
spaced(d, (90, 270), 'MARC-AUREL & LENNARD', F('inter-600', 26), GOLD, 4.6)
d.text((86, 940), 'Alles an', font=F('corm-700', 116), fill=PAPER)
d.text((86, 1052), 'einem Ort.', font=F('corm-700', 116), fill=PAPER)
rule(d, 92, 1200, 140)
y3 = para(d, (92, 1236), 'Berichte, Bilder und Daumendrücken auf unserer Shanghai-Seite:', F('inter-400', 42), PAPER, 880, 60)
d.text((92, y3 + 14), 'shanghai.wirth-wiener.de', font=fit('shanghai.wirth-wiener.de', 'inter-700', 60, SW - 180), fill=GOLD)
d.text((SW - 90, 900), 'Foto: Petra Reidel', font=F('inter-400', 22), fill=SOFT, anchor='ra')
# Platz fuer den Link-Sticker bleibt bewusst frei (ca. y 1440–1600)
files.append(('story-03.jpg', s))

for name, img in files:
    p = os.path.join(OUT, name); img.convert('RGB').save(p, 'JPEG', quality=92, optimize=True, subsampling=0)
    print(f'{name:13} {img.size[0]}x{img.size[1]}  {os.path.getsize(p)//1024:>4} KB')
