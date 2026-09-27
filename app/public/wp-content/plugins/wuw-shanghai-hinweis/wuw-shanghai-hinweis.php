<?php
/**
 * Plugin Name: WuW Road to Shanghai – Hinweis
 * Description: Road-to-Shanghai-Hinweise auf wirth-wiener.de: große Startseiten-Sektion nach dem Hero (Slot do_action("wuw_home_shanghai") in front-page.php, mit Live-Countdown + WM-Programm) sowie ein schließbarer Hinweis-Badge auf allen Unterseiten. Seit dem 27.09.2026 zusätzlich ein einmaliges Bronze-Pop-up. Plugin deaktivieren blendet alles rückstandsfrei aus.
 * Version: 2.0.0
 * Author: GUMU
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

const WUW_SH_URL    = 'https://shanghai.wirth-wiener.de';
const WUW_SH_TARGET = '2026-09-22T00:00:00+08:00'; // WM-Start Shanghai (NECC)
const WUW_SH_SNOOZE = 7;                            // Tage, bis der geschlossene Hinweis wiederkommt
// Ergebnis der WM (Siegerehrung 27.09.2026): solange true, laeuft das Bronze-Pop-up
// und der alte Countdown-Badge bleibt aus. Auf false setzen = zurueck zum Badge.
const WUW_SH_BRONZE        = true;
const WUW_SH_BRONZE_SNOOZE = 30;   // Tage, bis das geschlossene Pop-up wiederkommt

add_action('wp_footer', function () {
    // Auf der Startseite übernimmt die große Sektion (wuw_home_shanghai) – kein doppelter Hinweis.
    // Solange das Bronze-Pop-up läuft, bleibt der Countdown-Badge aus (sonst zwei Hinweise).
    if (is_admin() || is_front_page() || WUW_SH_BRONZE) {
        return;
    }
    $url    = esc_url(WUW_SH_URL);
    $target = esc_js(WUW_SH_TARGET);
    $snooze = (int) WUW_SH_SNOOZE;
    ?>
<style id="wuw-sh-style">
  #wuw-sh-badge{position:fixed;right:20px;bottom:20px;z-index:999999;width:min(320px,calc(100vw - 32px));
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;opacity:0;transform:translateY(24px);
    transition:opacity .5s ease,transform .5s cubic-bezier(.22,1,.36,1)}
  #wuw-sh-badge.is-in{opacity:1;transform:none}
  #wuw-sh-badge .wuw-sh__link{display:block;position:relative;text-decoration:none;color:#f1e8d6;
    background:linear-gradient(160deg,rgba(24,20,14,.97),rgba(14,12,9,.97));
    border:1px solid rgba(201,162,75,.55);border-radius:16px;padding:18px 20px 16px;
    box-shadow:0 18px 46px rgba(0,0,0,.42);overflow:hidden;
    -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  #wuw-sh-badge .wuw-sh__link::before{content:"";position:absolute;inset:0;border-radius:16px;pointer-events:none;
    box-shadow:inset 0 0 0 1px rgba(201,162,75,.18)}
  #wuw-sh-badge .wuw-sh__link::after{content:"";position:absolute;right:-40px;top:-40px;width:120px;height:120px;
    border-radius:50%;background:radial-gradient(circle,rgba(201,162,75,.28),rgba(201,162,75,0) 70%);pointer-events:none}
  #wuw-sh-badge .wuw-sh__eyebrow{display:block;font-size:.72rem;font-weight:700;letter-spacing:.16em;
    text-transform:uppercase;color:#c9a24b;margin-bottom:.5rem}
  #wuw-sh-badge .wuw-sh__count{display:block;font-family:Georgia,"Times New Roman",serif;font-size:1.5rem;
    font-weight:700;color:#f4ecda;line-height:1.1;margin-bottom:.35rem}
  #wuw-sh-badge .wuw-sh__count b{color:#c9a24b}
  #wuw-sh-badge .wuw-sh__text{display:block;font-size:.82rem;line-height:1.5;color:rgba(241,232,214,.82);margin-bottom:.85rem}
  #wuw-sh-badge .wuw-sh__cta{display:inline-flex;align-items:center;gap:.4rem;background:#a81e2e;color:#fff;
    font-size:.82rem;font-weight:700;padding:.5rem .95rem;border-radius:999px;transition:background .2s,transform .18s}
  #wuw-sh-badge .wuw-sh__link:hover .wuw-sh__cta{background:#c0202f;transform:translateX(2px)}
  #wuw-sh-badge .wuw-sh__close{position:absolute;top:8px;right:9px;z-index:2;width:26px;height:26px;border:none;
    border-radius:50%;background:rgba(255,255,255,.08);color:#e7ddc7;font-size:1.05rem;line-height:1;cursor:pointer;
    transition:background .2s}
  #wuw-sh-badge .wuw-sh__close:hover{background:rgba(255,255,255,.18)}
  #wuw-sh-badge .wuw-sh__dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#e2483f;
    margin-right:.45rem;vertical-align:middle;box-shadow:0 0 0 0 rgba(226,72,63,.6);animation:wuw-sh-pulse 2s infinite}
  @keyframes wuw-sh-pulse{0%{box-shadow:0 0 0 0 rgba(226,72,63,.55)}70%{box-shadow:0 0 0 8px rgba(226,72,63,0)}100%{box-shadow:0 0 0 0 rgba(226,72,63,0)}}
  @media (max-width:480px){#wuw-sh-badge{right:12px;left:12px;bottom:12px;width:auto}}
  @media (prefers-reduced-motion:reduce){#wuw-sh-badge{transition:none}#wuw-sh-badge .wuw-sh__dot{animation:none}}
</style>

<div id="wuw-sh-badge" role="complementary" aria-label="Road to Shanghai – unsere Azubis bei der Berufe-WM 2026">
  <button type="button" class="wuw-sh__close" aria-label="Hinweis schließen">&times;</button>
  <a class="wuw-sh__link" href="<?php echo $url; ?>" rel="noopener">
    <span class="wuw-sh__eyebrow"><span class="wuw-sh__dot" aria-hidden="true"></span>Road to Shanghai</span>
    <span class="wuw-sh__count" data-wuw-sh-count>Noch <b>–</b> Tage</span>
    <span class="wuw-sh__text">Marc-Aurel &amp; Lennard vertreten Deutschland bei der Berufe-WM 2026. Verfolge ihre Reise live.</span>
    <span class="wuw-sh__cta">Live mitfiebern <span aria-hidden="true">&rarr;</span></span>
  </a>
</div>

<script>
(function(){
  var el=document.getElementById('wuw-sh-badge'); if(!el) return;
  var KEY='wuw-sh-dismissed', SNOOZE=<?php echo $snooze; ?>*86400000;
  try{var t=parseInt(localStorage.getItem(KEY)||'0',10);
      if(t && (Date.now()-t)<SNOOZE){el.parentNode.removeChild(el); return;}}catch(e){}
  var TARGET=new Date('<?php echo $target; ?>').getTime();
  var c=el.querySelector('[data-wuw-sh-count]');
  var days=Math.ceil((TARGET-Date.now())/86400000);
  if(days>1){c.innerHTML='Noch <b>'+days+'</b> Tage';}
  else if(days===1){c.innerHTML='Nur noch <b>1</b> Tag!';}
  else if(days>-8){c.innerHTML='<b>Die WM läuft!</b>';}
  else{c.innerHTML='<b>Wir waren dabei</b>';}
  el.querySelector('.wuw-sh__close').addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    try{localStorage.setItem(KEY,String(Date.now()));}catch(err){}
    el.classList.remove('is-in');
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},400);
  });
  setTimeout(function(){el.classList.add('is-in');},700);
})();
</script>
    <?php
}, 50);

/**
 * Bronze-Pop-up (ab 27.09.2026): einmal pro Besucher, alle Seiten inkl. Startseite.
 * Schließt per X, Esc, Klick daneben; merkt sich das in localStorage (WUW_SH_BRONZE_SNOOZE Tage).
 * Kein Autoplay, kein Tracking, respektiert prefers-reduced-motion.
 */
add_action('wp_footer', function () {
    if (is_admin() || ! WUW_SH_BRONZE) {
        return;
    }
    $url    = esc_url(WUW_SH_URL);
    $img    = esc_url(plugins_url('assets/bronze.jpg', __FILE__));
    $webp   = esc_url(plugins_url('assets/bronze.webp', __FILE__));
    $snooze = (int) WUW_SH_BRONZE_SNOOZE;
    ?>
<style id="wuw-bz-style">
  #wuw-bz{position:fixed;inset:0;z-index:1000000;display:none;align-items:center;justify-content:center;padding:16px;
    font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  #wuw-bz.is-open{display:flex}
  #wuw-bz .wuw-bz__backdrop{position:absolute;inset:0;background:rgba(8,10,14,.72);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
  #wuw-bz .wuw-bz__box{position:relative;width:min(560px,100%);max-height:calc(100dvh - 32px);overflow-y:auto;
    background:linear-gradient(170deg,#1a1610,#12100c);border:1px solid rgba(201,162,75,.5);border-radius:18px;
    box-shadow:0 30px 70px rgba(0,0,0,.5);opacity:0;transform:translateY(18px) scale(.985);
    transition:opacity .35s ease,transform .35s cubic-bezier(.22,1,.36,1)}
  #wuw-bz.is-in .wuw-bz__box{opacity:1;transform:none}
  #wuw-bz .wuw-bz__media{display:block;width:100%;height:auto;border-radius:18px 18px 0 0}
  #wuw-bz .wuw-bz__body{padding:22px 24px 24px;text-align:center;color:#f1e8d6}
  #wuw-bz .wuw-bz__eyebrow{margin:0 0 .5rem;font-size:.72rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#c9a24b}
  #wuw-bz .wuw-bz__title{margin:0 0 .6rem;font-family:"Cormorant Garamond",Georgia,"Times New Roman",serif;
    font-size:clamp(2rem,7vw,2.8rem);line-height:1.05;font-weight:600;color:#e8c97a}
  #wuw-bz .wuw-bz__text{margin:0 0 1.2rem;font-size:.95rem;line-height:1.6;color:rgba(241,232,214,.86)}
  #wuw-bz .wuw-bz__cta{display:inline-flex;align-items:center;gap:.45rem;background:#a81e2e;color:#fff;text-decoration:none;
    font-size:.92rem;font-weight:700;padding:.8rem 1.5rem;border-radius:999px;min-height:44px;box-sizing:border-box;
    transition:background .2s,transform .18s}
  #wuw-bz .wuw-bz__cta:hover{background:#c0202f;transform:translateX(2px)}
  #wuw-bz .wuw-bz__close{position:absolute;top:10px;right:10px;width:40px;height:40px;border:none;border-radius:50%;
    background:rgba(10,10,10,.55);color:#fff;font-size:1.4rem;line-height:1;cursor:pointer;transition:background .2s}
  #wuw-bz .wuw-bz__close:hover{background:rgba(10,10,10,.8)}
  @media (prefers-reduced-motion:reduce){#wuw-bz .wuw-bz__box{transition:none}}
</style>

<div id="wuw-bz" role="dialog" aria-modal="true" aria-labelledby="wuw-bz-title" hidden>
  <div class="wuw-bz__backdrop" data-wuw-bz-close></div>
  <div class="wuw-bz__box">
    <button type="button" class="wuw-bz__close" data-wuw-bz-close aria-label="Hinweis schließen">&times;</button>
    <picture>
      <source srcset="<?php echo $webp; ?>" type="image/webp" />
      <img class="wuw-bz__media" src="<?php echo $img; ?>" width="1200" height="631" alt="Marc-Aurel und Lennard jubeln mit ihrem Trainer unter der Deutschlandfahne" />
    </picture>
    <div class="wuw-bz__body">
      <p class="wuw-bz__eyebrow">WorldSkills 2026 · Shanghai</p>
      <p class="wuw-bz__title" id="wuw-bz-title">Bronze!</p>
      <p class="wuw-bz__text">Marc-Aurel Spalek und Lennard Weitzmann holen bei der Berufe-Weltmeisterschaft in Shanghai die Bronzemedaille im Landschaftsgartenbau. Vier Wettkampftage, 20 Teams aus 20 Ländern, am Ende ein Platz auf dem Podest.</p>
      <a class="wuw-bz__cta" href="<?php echo $url; ?>" rel="noopener">Die ganze Woche ansehen <span aria-hidden="true">&rarr;</span></a>
    </div>
  </div>
</div>

<script>
(function(){
  var el=document.getElementById('wuw-bz'); if(!el) return;
  var KEY='wuw-bronze-seen', SNOOZE=<?php echo $snooze; ?>*86400000, last=null;
  try{var t=parseInt(localStorage.getItem(KEY)||'0',10);
      if(t && (Date.now()-t)<SNOOZE){el.parentNode.removeChild(el); return;}}catch(e){}
  function close(){
    try{localStorage.setItem(KEY,String(Date.now()));}catch(err){}
    el.classList.remove('is-in');
    document.documentElement.style.overflow='';
    setTimeout(function(){el.classList.remove('is-open');el.hidden=true;if(last&&last.focus)last.focus();},320);
    document.removeEventListener('keydown',onKey);
  }
  function onKey(e){ if(e.key==='Escape'){e.preventDefault();close();} }
  function open(){
    last=document.activeElement;
    el.hidden=false; el.classList.add('is-open');
    document.documentElement.style.overflow='hidden';
    requestAnimationFrame(function(){el.classList.add('is-in');});
    el.querySelector('.wuw-bz__close').focus();
    document.addEventListener('keydown',onKey);
  }
  [].slice.call(el.querySelectorAll('[data-wuw-bz-close]')).forEach(function(b){
    b.addEventListener('click',function(e){e.preventDefault();close();});
  });
  el.querySelector('.wuw-bz__cta').addEventListener('click',function(){
    try{localStorage.setItem(KEY,String(Date.now()));}catch(err){}
  });
  setTimeout(open,1200);
})();
</script>
    <?php
}, 60);

/**
 * Startseiten-Sektion direkt nach dem Hero (Slot do_action('wuw_home_shanghai') in front-page.php).
 * Look der Microsite: Nachtblau, Gold, China-Rot, Serif-Headline. Countdown/Programm schalten per JS
 * automatisch um (vor der WM → Countdown, 22.–27.09. → „Die WM läuft", danach → Rückblick).
 */
add_action('wuw_home_shanghai', function () {
    $url  = esc_url(WUW_SH_URL);
    $webp = esc_url(plugins_url('assets/rts-team.webp', __FILE__));
    $jpg  = esc_url(plugins_url('assets/rts-team.jpg', __FILE__));
    $steps = [
        ['2026-09-17T00:00:00+08:00', '17. Sep', 'Abflug'],
        ['2026-09-22T00:00:00+08:00', '22. Sep', 'Eröffnung'],
        ['2026-09-23T00:00:00+08:00', '23.–26. Sep', 'Wettkampf'],
        ['2026-09-27T00:00:00+08:00', '27. Sep', 'Siegerehrung'],
    ];
    ?>
<section class="wuw-rts" id="shanghai" aria-labelledby="wuw-rts-title">
  <style>
    .wuw-rts{--rts-night:#0C1622;--rts-ink:#16120F;--rts-gold:#C9A24B;--rts-red:#A81E2E;--rts-paper:#F1E8D6;
      position:relative;overflow:hidden;color:var(--rts-paper);padding:5rem 0;scroll-margin-top:6rem;
      background:radial-gradient(90% 120% at 100% 0%,rgba(168,30,46,.28),transparent 55%),
                 radial-gradient(70% 90% at 0% 100%,rgba(201,162,75,.14),transparent 60%),
                 linear-gradient(160deg,var(--rts-night),var(--rts-ink));}
    .wuw-rts::before{content:"";position:absolute;inset:0;opacity:.07;pointer-events:none;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}
    .wuw-rts__inner{position:relative;max-width:72rem;margin:0 auto;padding:0 1.25rem;display:grid;gap:3rem;align-items:center;}
    @media(min-width:900px){.wuw-rts__inner{grid-template-columns:1.25fr .75fr;gap:4rem;}}
    .wuw-rts__eyebrow{display:flex;align-items:center;gap:.55rem;margin:0 0 1rem;font-size:.78rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--rts-gold);}
    .wuw-rts__dot{width:8px;height:8px;border-radius:50%;background:#e2483f;animation:wuw-rts-pulse 2s infinite;}
    @keyframes wuw-rts-pulse{0%{box-shadow:0 0 0 0 rgba(226,72,63,.55)}70%{box-shadow:0 0 0 9px rgba(226,72,63,0)}100%{box-shadow:0 0 0 0 rgba(226,72,63,0)}}
    .wuw-rts h2.wuw-rts__title{font-family:"Cormorant Garamond",Georgia,"Times New Roman",serif;font-weight:600;
      font-size:clamp(2.3rem,5.5vw,4rem);line-height:1.02;letter-spacing:-.01em;margin:0 0 1.1rem;color:var(--rts-paper);text-transform:none;}
    .wuw-rts__title em{display:block;font-style:italic;color:var(--rts-gold);
      background:linear-gradient(100deg,#b58a35 0%,#f3dc9b 45%,#c9a24b 60%,#a67b2c 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
    .wuw-rts__lead{max-width:56ch;margin:0 0 2rem;font-size:1.05rem;line-height:1.7;color:rgba(241,232,214,.8);}
    .wuw-rts__lead strong{color:var(--rts-paper);}
    .wuw-rts__count{display:flex;gap:.75rem;margin:0 0 2rem;}
    .wuw-rts__unit{min-width:4.6rem;padding:.8rem .6rem .65rem;text-align:center;border:1px solid rgba(201,162,75,.4);border-radius:10px;background:rgba(255,255,255,.03);}
    .wuw-rts__num{display:block;font-family:"Cormorant Garamond",Georgia,serif;font-size:2.3rem;font-weight:700;line-height:1;color:var(--rts-gold);font-variant-numeric:tabular-nums;}
    .wuw-rts__lbl{display:block;margin-top:.35rem;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(241,232,214,.65);}
    .wuw-rts__live{display:none;margin:0 0 2rem;font-family:"Cormorant Garamond",Georgia,serif;font-size:1.9rem;font-weight:700;color:var(--rts-gold);}
    .wuw-rts.is-live .wuw-rts__count,.wuw-rts.is-done .wuw-rts__count{display:none;}
    .wuw-rts.is-live .wuw-rts__live,.wuw-rts.is-done .wuw-rts__live{display:block;}
    .wuw-rts__steps{list-style:none;margin:0 0 2.2rem;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid rgba(201,162,75,.3);}
    .wuw-rts__step{position:relative;padding:.9rem .5rem 0 0;font-size:.8rem;line-height:1.3;color:rgba(241,232,214,.5);}
    .wuw-rts__step::before{content:"";position:absolute;top:-5px;left:0;width:9px;height:9px;border-radius:50%;background:var(--rts-night);border:1px solid rgba(201,162,75,.6);}
    .wuw-rts__step b{display:block;font-size:.9rem;color:rgba(241,232,214,.75);}
    .wuw-rts__step.is-past::before{background:var(--rts-gold);}
    .wuw-rts__step.is-now{color:var(--rts-paper);}
    .wuw-rts__step.is-now b{color:var(--rts-gold);}
    .wuw-rts__step.is-now::before{background:#e2483f;border-color:#e2483f;box-shadow:0 0 0 5px rgba(226,72,63,.25);}
    .wuw-rts__actions{display:flex;flex-wrap:wrap;align-items:center;gap:.9rem 1.4rem;}
    .wuw-rts__btn{display:inline-flex;align-items:center;gap:.5rem;padding:.95rem 1.7rem;border-radius:999px;background:var(--rts-red);color:#fff;
      font-size:.9rem;font-weight:700;letter-spacing:.03em;text-decoration:none;transition:background .2s,transform .18s;}
    .wuw-rts__btn:hover{background:#c0202f;color:#fff;transform:translateY(-2px);}
    .wuw-rts__link{color:var(--rts-gold);font-size:.9rem;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(201,162,75,.45);padding-bottom:2px;transition:color .2s,border-color .2s;}
    .wuw-rts__link:hover{color:#f3dc9b;border-color:#f3dc9b;}
    .wuw-rts__media{position:relative;max-width:380px;margin-inline:auto;}
    .wuw-rts__media::before{content:"";position:absolute;inset:-14px 14px 14px -14px;border:1px solid rgba(201,162,75,.55);border-radius:14px;}
    .wuw-rts__media img{position:relative;display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:50% 30%;border-radius:12px;box-shadow:0 30px 60px rgba(0,0,0,.5);}
    .wuw-rts__cap{position:relative;margin:.9rem 0 0;font-size:.78rem;letter-spacing:.04em;color:rgba(241,232,214,.6);}
    @media(max-width:560px){.wuw-rts{padding:3.75rem 0}.wuw-rts__unit{min-width:0;flex:1}.wuw-rts__steps{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:1.2rem}}
    @media(prefers-reduced-motion:reduce){.wuw-rts__dot{animation:none}.wuw-rts__btn:hover{transform:none}}
  </style>

  <div class="wuw-rts__inner">
    <div>
      <p class="wuw-rts__eyebrow"><span class="wuw-rts__dot" aria-hidden="true"></span>WorldSkills 2026 · Shanghai</p>
      <h2 id="wuw-rts-title" class="wuw-rts__title">Road to <em>Shanghai</em></h2>
      <p class="wuw-rts__lead">
        Jetzt geht's los: Unsere Azubis <strong>Marc-Aurel Spalek &amp; Lennard Weitzmann</strong> vertreten
        Deutschland bei der Berufe-WM im Landschaftsbau. Vier Wettkampftage, ein Schaugarten nach chinesischem
        Vorbild – und ganz Chemnitz drückt die Daumen.
      </p>

      <div class="wuw-rts__count" data-rts-count aria-live="polite">
        <div class="wuw-rts__unit"><span class="wuw-rts__num" data-rts-d>–</span><span class="wuw-rts__lbl">Tage</span></div>
        <div class="wuw-rts__unit"><span class="wuw-rts__num" data-rts-h>–</span><span class="wuw-rts__lbl">Std</span></div>
        <div class="wuw-rts__unit"><span class="wuw-rts__num" data-rts-m>–</span><span class="wuw-rts__lbl">Min</span></div>
      </div>
      <p class="wuw-rts__live" data-rts-live>Die WM läuft!</p>

      <ol class="wuw-rts__steps">
        <?php foreach ($steps as $s) : ?>
          <li class="wuw-rts__step" data-rts-step="<?php echo esc_attr($s[0]); ?>"><b><?php echo esc_html($s[1]); ?></b><?php echo esc_html($s[2]); ?></li>
        <?php endforeach; ?>
      </ol>

      <div class="wuw-rts__actions">
        <a class="wuw-rts__btn" href="<?php echo $url; ?>" rel="noopener">Live mitfiebern <span aria-hidden="true">&rarr;</span></a>
        <?php if (has_action('wuw_home_limo')) : ?>
          <a class="wuw-rts__link" href="#limonade">Mit Limonade unterstützen</a>
        <?php endif; ?>
      </div>
    </div>

    <figure class="wuw-rts__media">
      <picture>
        <source srcset="<?php echo $webp; ?>" type="image/webp">
        <img src="<?php echo $jpg; ?>" alt="Marc-Aurel Spalek und Lennard Weitzmann nach dem Sieg beim Landschaftsgärtner-Cup 2025" loading="lazy" width="616" height="900">
      </picture>
      <figcaption class="wuw-rts__cap">Deutsche Meister 2025 – jetzt bei der WM in Shanghai.</figcaption>
    </figure>
  </div>

  <script>
  (function(){
    var root=document.getElementById('shanghai'); if(!root) return;
    var OPEN=new Date('<?php echo esc_js(WUW_SH_TARGET); ?>').getTime();
    var END=new Date('2026-09-28T00:00:00+08:00').getTime();
    var d=root.querySelector('[data-rts-d]'),h=root.querySelector('[data-rts-h]'),m=root.querySelector('[data-rts-m]'),live=root.querySelector('[data-rts-live]');
    var steps=[].slice.call(root.querySelectorAll('[data-rts-step]'));
    function pad(n){return n<10?'0'+n:''+n;}
    function tick(){
      var now=Date.now();
      if(now<OPEN){
        var s=Math.floor((OPEN-now)/60000);
        d.textContent=Math.floor(s/1440); h.textContent=pad(Math.floor(s/60)%24); m.textContent=pad(s%60);
      }else if(now<END){
        root.classList.add('is-live'); live.textContent='Bronze! Marc-Aurel & Lennard holen die Bronzemedaille.';
      }else{
        root.classList.remove('is-live'); root.classList.add('is-done'); live.textContent='Bronze bei den WorldSkills 2026, danke fürs Daumendrücken!';
      }
      var cur=-1;
      steps.forEach(function(el,i){ if(now>=new Date(el.getAttribute('data-rts-step')).getTime()) cur=i; });
      steps.forEach(function(el,i){ el.classList.toggle('is-past',i<cur); el.classList.toggle('is-now',i===cur && now<END); });
    }
    tick(); setInterval(tick,30000);
  })();
  </script>
</section>
    <?php
});
