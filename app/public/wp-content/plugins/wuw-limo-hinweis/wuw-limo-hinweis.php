<?php
/**
 * Plugin Name: WuW Landschaftsgärtner-Limonade
 * Description: Zeigt auf der Startseite die Limonaden-Aktion (5 €/Kasten für die WorldSkills-Vorbereitung). Rendert in den Theme-Slot do_action('wuw_home_limo') in front-page.php – Plugin deaktivieren blendet die Sektion rückstandsfrei aus.
 * Version: 1.0.0
 * Author: GUMU
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Kleines Flaschen-Icon (Inline-SVG, erbt die Textfarbe). */
function wuw_limo_icon(): string {
    return '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        . '<path d="M10 2h4M10.5 2v3c0 2-2 3-2 6v8a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5v-8c0-3-2-4-2-6V2"/>'
        . '<path d="M8.7 13.5h6.6"/>'
        . '</svg>';
}

/* Nav-Link „Limonade" – Desktop (Slot in header.php nach „Kontakt") */
add_action('wuw_nav_limo', function () {
    ?>
                <li><a href="<?php echo esc_url(home_url('/#limonade')); ?>" class="flex items-center gap-1.5 py-2 text-sm font-semibold tracking-wide text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]" title="Landschaftsgärtner-Limonade – 5 € pro Kasten für die WorldSkills-Vorbereitung"><?php echo wuw_limo_icon(); ?>Limonade</a></li>
    <?php
});

/* Nav-Link „Limonade" – Mobile (Slot in header.php vor „Kontakt") */
add_action('wuw_nav_limo_mobile', function () {
    ?>
            <li class="border-b border-[var(--color-line)]"><a href="<?php echo esc_url(home_url('/#limonade')); ?>" class="flex items-center gap-1.5 py-3 text-base font-medium text-[var(--color-primary)]"><?php echo wuw_limo_icon(); ?>Limonade</a></li>
    <?php
});

add_action('wuw_home_limo', function () {
    $img_webp = plugins_url('assets/limo-square.webp', __FILE__);
    $img_jpg  = plugins_url('assets/limo-square.jpg', __FILE__);

    $body = "Hallo Team Wirth & Wiener,\n\n"
        . "ich möchte folgende Kästen der Landschaftsgärtner-Limonade \"Gurke-Zitrone\" bestellen (Abholung bei Ihnen in Chemnitz):\n\n"
        . "Anzahl Kästen:\nName:\nTelefon:\nWunschtermin zur Abholung:\n\nVielen Dank!";
    $mailto = 'mailto:info@wirth-wiener.de?subject=' . rawurlencode('Bestellung Landschaftsgärtner-Limonade')
        . '&body=' . rawurlencode($body);
    ?>
<section class="wuw-limo" id="limonade" aria-labelledby="wuw-limo-title">
  <style>
    .wuw-limo{background:linear-gradient(180deg,#f6faf1,#eef4e6);padding:5rem 0;scroll-margin-top:6rem;}
    .wuw-limo__inner{max-width:72rem;margin:0 auto;padding:0 1.25rem;display:grid;gap:2.5rem;align-items:center;}
    @media(min-width:900px){.wuw-limo__inner{grid-template-columns:minmax(0,420px) 1fr;gap:4rem;}}
    .wuw-limo__media{border-radius:1.5rem;overflow:hidden;box-shadow:0 24px 50px rgba(31,45,24,.18);line-height:0;max-width:420px;margin-inline:auto;}
    .wuw-limo__media img{width:100%;height:auto;display:block;}
    .wuw-limo__eyebrow{font-size:.8rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--color-primary,#4a7c2f);margin:0 0 .6rem;}
    .wuw-limo__title{font-size:clamp(1.7rem,3.5vw,2.4rem);font-weight:800;line-height:1.15;color:var(--color-ink,#1f2d18);margin:0 0 1rem;}
    .wuw-limo__text{color:var(--color-body,#44523c);line-height:1.65;margin:0 0 1.4rem;max-width:56ch;}
    .wuw-limo__text strong{color:var(--color-primary,#4a7c2f);}
    .wuw-limo__facts{list-style:none;margin:0 0 1.6rem;padding:0;display:grid;gap:.45rem;color:var(--color-ink,#1f2d18);font-size:.95rem;}
    .wuw-limo__facts li{position:relative;padding-left:1.5rem;}
    .wuw-limo__facts li::before{content:"✓";position:absolute;left:0;color:var(--color-primary,#4a7c2f);font-weight:800;}
    .wuw-limo__btn{display:inline-block;background:var(--color-primary,#4a7c2f);color:#fff;padding:.85rem 1.8rem;font-size:.9rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;text-decoration:none;transition:background .2s,transform .18s;}
    .wuw-limo__btn:hover{background:var(--color-primary-dark,#3a6323);color:#fff;transform:translateY(-2px);}
    .wuw-limo__note{margin:.9rem 0 0;font-size:.85rem;color:var(--color-muted,#6c7a62);}
  </style>
  <div class="wuw-limo__inner">
    <a class="wuw-limo__media" href="<?php echo esc_url($mailto); ?>" aria-label="Landschaftsgärtner-Limonade reservieren">
      <picture>
        <source srcset="<?php echo esc_url($img_webp); ?>" type="image/webp">
        <img src="<?php echo esc_url($img_jpg); ?>" alt="Landschaftsgärtner-Limonade Gurke-Zitrone – 5 Euro pro Kasten für die WorldSkills-Vorbereitung" loading="lazy" width="1200" height="1200">
      </picture>
    </a>
    <div>
      <p class="wuw-limo__eyebrow">Road to Shanghai · WorldSkills 2026</p>
      <h2 id="wuw-limo-title" class="wuw-limo__title">Trinken. Unterstützen. Mitfiebern.</h2>
      <p class="wuw-limo__text">
        Unsere Azubis Marc-Aurel &amp; Lennard vertreten Deutschland bei der Berufe-WM in Shanghai.
        Mit der neuen <strong>Landschaftsgärtner-Limonade „Gurke-Zitrone"</strong> können Sie die beiden
        ganz einfach unterstützen: <strong>5,00&nbsp;€ pro verkauftem Kasten</strong> fließen direkt in die
        Trainings- und Wettkampfvorbereitung.
      </p>
      <ul class="wuw-limo__facts">
        <li>1 Kasten = 20 Flaschen à 0,33&nbsp;l – 20,00&nbsp;€ (zzgl. 4,50&nbsp;€ Pfand + 19&nbsp;% MwSt.)</li>
        <li>Ab sofort erhältlich – solange der Vorrat reicht</li>
        <li>Abholung bei uns: Am Erlenwald&nbsp;4, 09128&nbsp;Chemnitz</li>
      </ul>
      <a class="wuw-limo__btn" href="<?php echo esc_url($mailto); ?>">Kasten reservieren</a>
      <p class="wuw-limo__note">oder telefonisch: 0371&nbsp;77440-0 · keine Lieferung, nur Abholung ·
        <a href="https://shanghai.wirth-wiener.de" rel="noopener">Mehr zur Road to Shanghai</a>
      </p>
    </div>
  </div>
</section>
    <?php
});
