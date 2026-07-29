<?php
/**
 * Plugin Name: WuW Road to Shanghai – Hinweis
 * Description: Blendet auf wirth-wiener.de einen dezenten, schließbaren Hinweis-Badge (Live-Countdown) ein, der auf die Microsite shanghai.wirth-wiener.de verlinkt. Nur im Frontend, per wp_footer. Keine Theme-/Inhaltsänderung.
 * Version: 1.0.0
 * Author: GUMU
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit;
}

const WUW_SH_URL    = 'https://shanghai.wirth-wiener.de';
const WUW_SH_TARGET = '2026-09-22T00:00:00+08:00'; // WM-Start Shanghai (NECC)
const WUW_SH_SNOOZE = 7;                            // Tage, bis der geschlossene Hinweis wiederkommt

add_action('wp_footer', function () {
    if (is_admin()) {
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
