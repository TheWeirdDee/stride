'use client'

export default function LandingStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
  :root{
    --ink:#0c0e10;
    --charcoal:#16181a;
    --charcoal-2:#1d2023;
    --paper:#f3f1ec;
    --paper-card:#ffffff;
    --blue:#0a5aa2;
    --blue-deep:#084a86;
    --blue-hi:#1d72c0;
    --lime:#cdfb46;
    --lime-deep:#bdf014;
    --lime-ink:#1c2900;
    --muted:#6f7681;
    --muted-d:#8b939c;
    --line:#e3e0d8;
    --line-d:#2c3034;
    --r:22px;
    --r-sm:14px;
    --maxw:1280px;
    --display:'Anton',sans-serif;
    --display-weight:400;
    --sans:'Hanken Grotesk',sans-serif;
    --mono:'Space Mono',monospace;
  }

  .landing-page-container * {margin:0;padding:0;box-sizing:border-box;}
  .landing-page-container-html {scroll-behavior:smooth;}
  .landing-page-container {
    font-family:var(--sans);
    background:var(--paper);
    color:var(--ink);
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .landing-page-container img {display:block;max-width:100%;height:100%;object-fit:cover;}
  .landing-page-container a {color:inherit;text-decoration:none;}
  .wrap{max-width:var(--maxw);margin:0 auto;padding:0 56px;}
  @media(min-width:1440px){.wrap{padding:0 72px;}}

  .display{font-family:var(--display);font-weight:var(--display-weight);text-transform:uppercase;letter-spacing:.005em;line-height:.92;}
  .mono{font-family:var(--mono);}
  .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.16em;text-transform:uppercase;}

  /* ---------- buttons ---------- */
  .btn{
    display:inline-flex;align-items:center;gap:10px;
    font-weight:700;font-size:15px;border:none;cursor:pointer;
    padding:15px 24px;border-radius:999px;transition:.18s ease;
    font-family:var(--sans);
  }
  .btn-light{background:#fff;color:var(--ink);}
  .btn-light:hover{transform:translateY(-2px);}
  .btn-lime{background:var(--lime);color:var(--lime-ink);}
  .btn-lime:hover{background:var(--lime-deep);transform:translateY(-2px);}
  .btn-dark{background:var(--ink);color:#fff;}
  .btn-dark:hover{transform:translateY(-2px);}
  .btn-ghost{background:transparent;border:1.5px solid rgba(255,255,255,.5);color:#fff;}
  .btn-ghost:hover{background:rgba(255,255,255,.12);}
  /* Link-styled buttons otherwise inherit color from the generic anchor rule,
     which made dark buttons show black-on-dark text. */
  .landing-page-container a.btn-dark{color:#fff;}
  .landing-page-container a.btn-lime{color:var(--lime-ink);}
  .landing-page-container a.btn-light{color:var(--ink);}
  .arrow-chip{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--lime-ink);color:var(--lime);}

  /* ================= NAV ================= */
  .nav{position:absolute;top:0;left:0;right:0;z-index:40;}
  .nav-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:26px 40px;max-width:var(--maxw);margin:0 auto;}
  .logo{display:flex;align-items:center;gap:2px;font-weight:800;font-size:24px;letter-spacing:-.02em;color:#fff;}
  .logo .chev{color:var(--lime);font-weight:800;letter-spacing:-.18em;margin-left:2px;}
  .nav-menu{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(10px);border-radius:999px;padding:7px 8px;}
  .nav-menu a{color:rgba(255,255,255,.92);font-weight:600;font-size:14px;padding:9px 16px;border-radius:999px;transition:.16s;}
  .nav-menu a:hover{background:rgba(255,255,255,.16);}
  .nav-right{display:flex;align-items:center;gap:10px;}
  .icon-btn{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;transition:.16s;}
  .icon-btn:hover{background:rgba(255,255,255,.22);}

  /* ================= HERO ================= */
  .hero{
    position:relative;min-height:900px;
    background:#000;
    color:#fff;overflow:hidden;
  }
  .hero-grid-tex{position:absolute;inset:0;opacity:.10;background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(180deg,#000,transparent 70%);}
  .hero-inner{position:relative;z-index:5;max-width:var(--maxw);margin:0 auto;padding:138px 40px 48px;}

  .hero-photo{position:absolute;z-index:2;top:64px;bottom:0;left:50%;transform:translateX(-46%);width:min(880px,60vw);overflow:visible;}
  .hero-photo img{width:100%;height:100%;object-fit:contain;object-position:bottom center;mix-blend-mode:screen;}

  .hero-tags{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;}
  .tag{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:8px 15px;}
  .tag .dot{width:6px;height:6px;border-radius:50%;background:var(--lime);}

  .hero-h1{font-size:clamp(32px,5.6vw,78px);font-weight:700;line-height:1.0;letter-spacing:-.03em;max-width:14ch;}
  .hero-h1 .lite{color:rgba(255,255,255,.62);}
  .hero-sub{margin-top:22px;max-width:36ch;font-size:18px;line-height:1.55;color:rgba(255,255,255,.82);}

  .hero-cta{margin-top:30px;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:7px 7px 7px 22px;max-width:430px;backdrop-filter:blur(8px);}
  .hero-get-started{margin-top:28px;display:inline-flex;align-items:center;gap:10px;background:var(--lime);color:var(--lime-ink);font-weight:800;font-size:17px;border:none;cursor:pointer;padding:18px 32px;border-radius:999px;font-family:var(--sans);transition:.18s ease;}
  .hero-get-started:hover{background:var(--lime-deep);transform:translateY(-2px);}
  .hero-cta input{flex:1;background:transparent;border:none;outline:none;color:#fff;font-family:var(--sans);font-size:15px;}
  .hero-cta input::placeholder{color:rgba(255,255,255,.6);}

  .hero-foot{position:absolute;z-index:5;left:40px;bottom:36px;display:flex;flex-direction:row;align-items:flex-end;gap:48px;flex-wrap:wrap;}
  .route-strip{display:flex;align-items:center;gap:14px;}
  .route-thumbs{display:flex;}
  .route-thumb{width:52px;height:52px;border:2px solid var(--blue);border-radius:12px;margin-left:-12px;overflow:hidden;flex:none;}
  .route-thumb:first-child{margin-left:0;}
  .route-meta{font-size:13px;line-height:1.35;color:rgba(255,255,255,.85);}
  .route-meta b{font-weight:700;color:#fff;}
  .hero-edge{display:flex;align-items:center;gap:14px;}
  .edge-mark{width:46px;height:46px;border-radius:12px;border:1.5px solid rgba(255,255,255,.4);display:grid;place-items:center;color:var(--lime);}
  .edge-txt{font-size:20px;font-weight:700;line-height:1.1;}
  .edge-txt span{display:block;font-size:12px;font-weight:500;color:rgba(255,255,255,.7);font-family:var(--mono);letter-spacing:.04em;text-transform:uppercase;margin-top:3px;}

  /* hero floating cards */
  .hero-cards{position:absolute;z-index:6;right:40px;top:120px;width:330px;display:flex;flex-direction:column;gap:18px;align-items:flex-end;}
  .card-trainer{background:#fff;color:var(--ink);border-radius:26px;padding:22px;width:100%;box-shadow:0 30px 60px -28px rgba(0,0,0,.45);}
  .pill-sm{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;border:1px solid var(--line);border-radius:999px;padding:6px 12px;color:#444;}
  .pill-sm .dot{width:6px;height:6px;border-radius:50%;background:var(--blue);}
  .card-trainer h3{margin:16px 0 18px;font-size:25px;font-weight:700;line-height:1.18;letter-spacing:-.01em;}
  .card-trainer h3 .lite{color:#aab0b8;}
  .stake-card{width:300px;background:rgba(12,16,22,.55);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(14px);border-radius:22px;padding:20px;color:#fff;margin-top:auto;}
  .stake-card .row1{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:rgba(255,255,255,.75);font-weight:600;}
  .stake-amt{display:flex;align-items:baseline;gap:4px;margin:8px 0 14px;}
  .stake-amt b{font-size:46px;font-weight:800;letter-spacing:-.03em;line-height:1;}
  .stake-amt small{font-size:14px;color:rgba(255,255,255,.7);}
  .stake-list{list-style:none;display:flex;flex-direction:column;gap:9px;}
  .stake-list li{display:flex;align-items:center;gap:9px;font-size:13.5px;color:rgba(255,255,255,.9);}
  .stake-list li::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--lime);flex:none;}

  /* ================= SECTION SHELL ================= */
  section{position:relative;}
  .sec-head{display:flex;align-items:center;gap:18px;padding:26px 0;border-bottom:1px solid var(--line);}
  .sec-badge{width:38px;height:38px;border-radius:50%;border:1.5px solid currentColor;display:grid;place-items:center;font-family:var(--mono);font-weight:700;font-size:14px;flex:none;}
  .sec-label{font-family:var(--mono);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}

  /* ===== HOW IT WORKS ===== */
  .about{background:var(--paper);padding-bottom:96px;}
  .about-top{display:grid;grid-template-columns:1.05fr .95fr;gap:60px;padding:64px 0 56px;}
  .about-h2{font-size:clamp(38px,4.4vw,62px);}
  .about-h2 em{font-style:normal;color:var(--blue);}
  .about-copy{display:flex;flex-direction:column;gap:18px;}
  .about-copy p{font-size:16px;line-height:1.62;color:#3c4148;max-width:46ch;}
  .about-copy .btn{align-self:flex-start;margin-top:6px;}

  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:8px;}
  .step{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:26px;}
  .step .num{font-family:var(--display);font-size:30px;color:var(--blue);}
  .step h4{font-size:19px;font-weight:700;margin:14px 0 8px;letter-spacing:-.01em;}
  .step p{font-size:14.5px;line-height:1.55;color:#525860;}

  .about-feature{display:grid;grid-template-columns:1.5fr 1fr;gap:24px;margin-top:46px;}
  .feature-img{position:relative;border-radius:var(--r);overflow:hidden;min-height:440px;}
  .feature-img img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;}
  .feature-stats{position:absolute;left:18px;right:18px;bottom:18px;z-index:3;display:flex;gap:0;background:rgba(12,16,22,.62);backdrop-filter:blur(10px);border-radius:18px;overflow:hidden;}
  .fstat{flex:1;padding:18px 20px;color:#fff;}
  .fstat + .fstat{border-left:1px solid rgba(255,255,255,.16);}
  .fstat b{font-family:var(--display);font-size:30px;display:block;line-height:1;}
  .fstat span{font-size:13px;color:rgba(255,255,255,.78);}
  .fstat.cta{flex:none;width:74px;display:grid;place-items:center;background:var(--lime);color:var(--lime-ink);border-left:none;}

  .feature-side{display:flex;flex-direction:column;justify-content:space-between;gap:24px;}
  .side-photo{border-radius:var(--r);overflow:hidden;height:220px;}
  .side-photo img{width:100%;height:100%;object-fit:cover;}
  .big-num{display:flex;flex-direction:column;}
  .big-num b{font-family:var(--display);font-size:clamp(80px,10vw,128px);color:var(--blue);line-height:.82;}
  .big-num .nl{font-size:18px;font-weight:700;margin-top:10px;}
  .check-list{list-style:none;margin-top:14px;display:flex;flex-direction:column;gap:9px;}
  .check-list li{display:flex;align-items:center;gap:10px;font-size:15px;color:#3c4148;font-weight:500;}
  .check-list li svg{flex:none;}

  /* ===== PROGRAMS (dark) ===== */
  .dark{background:var(--charcoal);color:#fff;}
  .dark .sec-head{border-color:var(--line-d);}
  .dark .sec-label{color:var(--muted-d);}
  .programs{padding:70px 0 90px;}
  .prog-head{display:flex;align-items:flex-end;justify-content:space-between;gap:40px;flex-wrap:wrap;margin:48px 0 40px;}
  .prog-head h2{font-size:clamp(46px,7vw,104px);}
  .prog-head h2 em{font-style:normal;color:var(--lime);}
  .prog-head p{max-width:34ch;font-size:16px;line-height:1.6;color:var(--muted-d);}
  .prog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
  .pcard{background:var(--charcoal-2);border:1px solid var(--line-d);border-radius:var(--r);padding:28px;display:flex;flex-direction:column;gap:14px;transition:.2s;min-height:230px;}
  .pcard:hover{border-color:var(--lime);transform:translateY(-4px);}
  .pcard .ic{width:48px;height:48px;border-radius:13px;background:rgba(205,251,70,.12);display:grid;place-items:center;color:var(--lime);}
  .pcard h4{font-size:21px;font-weight:700;letter-spacing:-.01em;margin-top:4px;}
  .pcard p{font-size:14.5px;line-height:1.55;color:var(--muted-d);}
  .pcard .pmeta{margin-top:auto;font-family:var(--mono);font-size:12px;letter-spacing:.06em;color:var(--lime);text-transform:uppercase;}

  /* ===== COMMUNITY STATS ===== */
  .community{padding:30px 0 80px;}
  .live-ticker{display:inline-flex;align-items:center;gap:10px;background:var(--charcoal-2);border:1px solid var(--line-d);border-radius:999px;padding:10px 18px;font-size:14px;color:#d7dce1;margin-bottom:30px;}
  .live-dot{width:9px;height:9px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 0 rgba(205,251,70,.6);animation:pulse 1.8s infinite;}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(205,251,70,.55);}70%{box-shadow:0 0 0 12px rgba(205,251,70,0);}100%{box-shadow:0 0 0 0 rgba(205,251,70,0);}}
  .stat-band{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
  .sband{background:var(--charcoal-2);border:1px solid var(--line-d);border-radius:var(--r);padding:34px 30px;}
  .sband b{font-family:var(--display);font-size:clamp(48px,6vw,84px);color:#fff;line-height:.9;display:block;}
  .sband b em{font-style:normal;color:var(--lime);}
  .sband span{display:block;margin-top:12px;font-size:15px;color:var(--muted-d);}

  .cities{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px;}
  .city-card{background:var(--charcoal-2);border:1px solid var(--line-d);border-radius:var(--r);padding:30px;}
  .city-card h5{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-d);margin-bottom:18px;}
  .city-row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-top:1px solid var(--line-d);font-size:16px;}
  .city-row:first-of-type{border-top:none;}
  .city-row .ci{display:flex;align-items:center;gap:12px;font-weight:600;}
  .city-rank{font-family:var(--mono);font-size:13px;color:var(--lime);width:24px;}
  .city-km{font-family:var(--mono);color:var(--muted-d);font-size:14px;}
  .map-card{position:relative;border-radius:var(--r);overflow:hidden;min-height:360px;background:linear-gradient(140deg,rgba(255,255,255,.08),rgba(255,255,255,.02));}
  .map-card img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;}
  .map-cap{position:absolute;left:22px;bottom:22px;z-index:3;background:rgba(12,16,22,.6);backdrop-filter:blur(8px);border:1px solid var(--line-d);border-radius:14px;padding:14px 18px;}
  .map-cap b{font-family:var(--display);font-size:26px;color:var(--lime);}
  .map-cap span{display:block;font-size:13px;color:#cfd4d9;}

  /* ===== STAKE TIERS ===== */
  .tiers{padding:20px 0 92px;}
  .tier-rows{margin:36px 0 30px;}
  .tier-row{display:grid;grid-template-columns:90px 1.4fr 1fr auto;align-items:center;gap:24px;padding:24px 6px;border-top:1px solid var(--line-d);}
  .tier-row:last-child{border-bottom:1px solid var(--line-d);}
  .tier-row .tn{font-family:var(--display);font-size:40px;color:#fff;}
  .tier-row .tt b{font-size:19px;font-weight:700;display:block;}
  .tier-row .tt span{font-size:14px;color:var(--muted-d);}
  .tier-row .td{font-size:15px;color:var(--muted-d);max-width:34ch;}
  .tier-stakes{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
  .tstake{border-radius:18px;padding:24px;background:var(--charcoal-2);border:1px solid var(--line-d);}
  .tstake.hot{background:var(--lime);color:var(--lime-ink);border-color:var(--lime);}
  .tstake .tdist{font-family:var(--display);font-size:30px;line-height:1;}
  .tstake .tprice{font-family:var(--mono);font-size:15px;margin-top:14px;font-weight:700;}
  .tstake .tlabel{font-size:12.5px;margin-top:4px;opacity:.7;font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;}

  /* ===== APP SCREENSHOTS ===== */
  .screens{background:var(--charcoal);padding:70px 0 90px;}
  .screens-head{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;margin:48px 0 38px;flex-wrap:wrap;}
  .screens-head h2{font-size:clamp(40px,5vw,72px);}
  .screens-head h2 em{font-style:normal;color:var(--lime);}
  .screens-scroll{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
  .screen-frame{border-radius:24px;overflow:hidden;border:1px solid var(--line-d);aspect-ratio:9/16;position:relative;}
  .screen-frame img{width:100%;height:100%;object-fit:cover;}

  /* ===== STORIES ===== */
  .stories{background:var(--paper);padding:70px 0 90px;}
  .stories .sec-head{border-color:var(--line);}
  .stories .sec-label{color:var(--muted);}
  .stories-head{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;margin:48px 0 38px;flex-wrap:wrap;}
  .stories-head h2{font-size:clamp(40px,5vw,72px);}
  .stories-head h2 em{font-style:normal;color:var(--blue);}
  .story-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;}
  .story{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:28px;display:flex;flex-direction:column;gap:20px;}
  .story .quote{font-size:18px;line-height:1.5;font-weight:500;letter-spacing:-.01em;color:#23272c;}
  .story .quote::before{content:"\\201C";font-family:var(--display);color:var(--blue);font-size:40px;line-height:0;vertical-align:-12px;margin-right:4px;}
  .story-by{display:flex;align-items:center;gap:14px;margin-top:auto;}
  .avatar{width:48px;height:48px;border-radius:50%;flex:none;background:var(--blue);display:grid;place-items:center;font-weight:700;font-size:18px;color:#fff;}
  .story-by b{font-size:15px;display:block;}
  .story-by span{font-size:13px;color:var(--muted);font-family:var(--mono);}

  /* ===== CTA BAND ===== */
  .cta-band{background:var(--ink);color:#fff;padding:90px 0;text-align:center;position:relative;overflow:hidden;}
  .cta-band .glow{position:absolute;inset:0;background:radial-gradient(60% 120% at 50% 120%,rgba(205,251,70,.18),transparent 60%);}
  .cta-band .inner{position:relative;z-index:2;}
  .cta-band h2{font-size:clamp(48px,8vw,118px);}
  .cta-band h2 em{font-style:normal;color:var(--lime);}
  .cta-band p{max-width:46ch;margin:20px auto 34px;font-size:18px;color:rgba(255,255,255,.72);line-height:1.55;}
  .cta-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;}

  /* ===== FOOTER ===== */
  footer{background:var(--charcoal);color:#fff;padding:64px 0 40px;border-top:1px solid var(--line-d);}
  .foot-top{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.3fr;gap:40px;padding-bottom:48px;border-bottom:1px solid var(--line-d);}
  .foot-brand .logo{color:#fff;margin-bottom:16px;}
  .foot-brand p{font-size:15px;line-height:1.6;color:var(--muted-d);max-width:30ch;}
  .foot-badges{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;}
  .badge{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:600;background:var(--charcoal-2);border:1px solid var(--line-d);border-radius:999px;padding:8px 14px;color:#d7dce1;}
  .badge .b-dot{width:7px;height:7px;border-radius:50%;background:var(--lime);}
  .foot-col h6{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-d);margin-bottom:18px;}
  .foot-col a{display:block;font-size:15px;color:#cdd2d7;padding:7px 0;transition:.15s;}
  .foot-col a:hover{color:var(--lime);}
  .foot-news p{font-size:14px;color:var(--muted-d);margin-bottom:14px;}
  .foot-input{display:flex;gap:6px;background:var(--charcoal-2);border:1px solid var(--line-d);border-radius:999px;padding:6px 6px 6px 18px;}
  .foot-input input{flex:1;background:transparent;border:none;outline:none;color:#fff;font-family:var(--sans);font-size:14px;}
  .foot-input input::placeholder{color:var(--muted-d);}
  .foot-bot{display:flex;align-items:center;justify-content:space-between;gap:20px;padding-top:28px;flex-wrap:wrap;font-size:13px;color:var(--muted-d);}
  .foot-bot .socials{display:flex;gap:10px;}
  .foot-bot .icon-btn{background:var(--charcoal-2);border-color:var(--line-d);width:38px;height:38px;}

  /* ---- contrast: <a>.logo / <a>.icon-btn inherited the dark anchor color ---- */
  .landing-page-container a.logo{color:#fff;}
  .landing-page-container .nav-right a.icon-btn{color:#fff;}
  .landing-page-container .foot-bot a.icon-btn{color:#cdd2d7;}

  /* ---- footer: keep the notify button compact (was wrapping into a big circle) ---- */
  .foot-input .btn{white-space:nowrap;flex-shrink:0;padding:11px 18px;font-size:14px;}

  /* ---- HERO streak card (replaces the stake card) ---- */
  .streak-card{width:300px;background:rgba(12,16,22,.55);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(14px);border-radius:22px;padding:20px;color:#fff;margin-top:auto;}
  .streak-card .row1{display:flex;align-items:center;justify-content:space-between;font-size:13px;color:rgba(255,255,255,.78);font-weight:600;}
  .streak-amt{display:flex;align-items:baseline;gap:6px;margin:6px 0 14px;}
  .streak-amt b{font-size:46px;font-weight:800;letter-spacing:-.03em;line-height:1;color:var(--lime);}
  .streak-amt small{font-size:13px;color:rgba(255,255,255,.7);}
  .streak-graph{display:flex;align-items:flex-end;gap:5px;height:54px;}
  .streak-graph i{flex:1;border-radius:3px;background:rgba(255,255,255,.1);}
  .streak-graph i.on{background:var(--lime);box-shadow:0 0 8px rgba(205,251,70,.55);}
  .streak-foot{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:12.5px;color:rgba(255,255,255,.82);}
  .streak-foot .dot{width:6px;height:6px;border-radius:50%;background:var(--lime);flex:none;}

  /* ---- scroll reveal (driven by IntersectionObserver, no JS deps) ---- */
  @media(prefers-reduced-motion:reduce){.reveal{opacity:1 !important;transform:none !important;}}

  /* ===== ANIMATIONS ===== */
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
  .hero-inner > *{animation:fadeUp .7s ease both;}
  .hero-inner .hero-tags{animation-delay:.1s;}
  .hero-inner .hero-h1{animation-delay:.22s;}
  .hero-inner .hero-sub{animation-delay:.34s;}
  .hero-inner .hero-cta{animation-delay:.46s;}

  /* ===== RESPONSIVE ===== */
  @media(max-width:1080px){
    .hero-cards{display:none;}
    .hero-photo{transform:translateX(-50%);opacity:.4;}
    .hero-foot{position:static;margin-top:48px;}
    .about-top{grid-template-columns:1fr;gap:32px;}
    .about-feature{grid-template-columns:1fr;}
    .steps,.prog-grid,.story-grid,.stat-band,.screens-scroll{grid-template-columns:1fr 1fr;}
    .tier-stakes{grid-template-columns:1fr 1fr;}
    .cities{grid-template-columns:1fr;}
    .foot-top{grid-template-columns:1fr 1fr;}
  }
  @media(max-width:680px){
    .wrap{padding:0 18px;}
    .nav-menu{display:none;}
    .nav-inner{padding:16px 18px;}
    .hero{min-height:100dvh;}
    .hero-inner{padding:70px 18px 36px;}
    .hero-h1{font-size:clamp(28px,9.5vw,44px);letter-spacing:-.02em;}
    .hero-sub{font-size:15px;max-width:100%;}
    .hero-tags{gap:7px;}
    .tag{font-size:12px;padding:6px 11px;}
    .steps,.prog-grid,.story-grid,.stat-band,.tier-stakes,.foot-top,.screens-scroll{grid-template-columns:1fr;}
    .tier-row{grid-template-columns:60px 1fr;gap:12px;}
    .tier-row .td,.tier-row .tt span{display:none;}
    .hero-cta{max-width:100%;display:none;}
    .hero-get-started{position:fixed;bottom:24px;left:18px;right:18px;width:calc(100% - 36px);justify-content:center;margin-top:0;z-index:30;}
    .hero{padding-bottom:96px;}
    .hero-foot{display:none;}
    .prog-head h2{font-size:clamp(36px,11vw,68px);}
    .about-h2{font-size:clamp(30px,8vw,54px);}
    .cta-band h2{font-size:clamp(36px,11vw,80px);}
    .sband b{font-size:clamp(36px,10vw,60px);}
    .big-num b{font-size:clamp(60px,18vw,100px);}
    .foot-top{grid-template-columns:1fr;}
    .foot-bot{flex-direction:column;align-items:flex-start;gap:14px;}
  }
` }} />
  )
}
