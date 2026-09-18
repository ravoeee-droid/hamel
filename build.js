const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = __dirname;
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const assets = path.join(dist, 'assets');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(assets, { recursive: true });

const readParts = prefix => fs.readdirSync(src)
  .filter(file => file.startsWith(prefix))
  .sort()
  .map(file => fs.readFileSync(path.join(src, file), 'utf8').trim())
  .join('');

const decodeParts = name => Buffer.from(readParts(`${name}.b64.`), 'base64');

const htmlGz = Buffer.from(readParts('index.html.gz.b64.'), 'base64');
let html = zlib.gunzipSync(htmlGz).toString('utf8');
html = html
  .replaceAll('assets/generations.webp', 'assets/generations.avif')
  .replaceAll('assets/truck.webp', 'assets/truck.avif')
  .replace('class="hero-fallback" src="assets/truck.avif"', 'class="hero-fallback" src="assets/hamel-road.avif"')
  .replace("texture=loader.load('assets/truck.avif'", "texture=loader.load('assets/hamel-road.avif'")
  .replaceAll('src="assets/generations.avif" alt="Zwei Generationen des HAMEL Familienunternehmens"', 'src="assets/hamel-father-son.avif" alt="Volker und Johannes Hamel – zwei Generationen des Familienunternehmens"')
  .replaceAll('src="assets/truck.avif" alt="HAMEL Tiertransport-Lkw"', 'src="assets/hamel-road.avif" alt="HAMEL Tiertransport-Lkw auf einer Landstraße"');

const styleMarker = '.external-proof{display:inline-flex;align-items:center;gap:10px;margin-top:34px;padding:11px 14px;border:1px solid var(--line);border-radius:999px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.external-proof i{width:7px;height:7px;background:#75a17d;border-radius:50%}';
const spotlightStyles = '.generation-spotlight{background:#061712;color:#fff;padding:0;position:relative;overflow:hidden}.generation-spotlight-inner{min-height:88svh;display:grid;grid-template-columns:1.25fr .75fr}.generation-spotlight-media{position:relative;overflow:hidden}.generation-spotlight-media img{width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.96) contrast(1.03);transform:scale(1.015)}.generation-spotlight-media:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 66%,rgba(6,23,18,.12) 82%,rgba(6,23,18,.55))}.generation-spotlight-copy{display:flex;flex-direction:column;justify-content:center;padding:70px clamp(30px,6vw,100px);position:relative}.generation-spotlight-copy:before{content:"";position:absolute;left:0;top:15%;bottom:15%;width:1px;background:rgba(255,255,255,.12)}.generation-spotlight-copy .eyebrow{color:#d7c9b7}.generation-spotlight-copy h2{font:400 clamp(54px,6vw,94px)/.9 Georgia,serif;letter-spacing:-.055em;margin:18px 0 24px}.generation-spotlight-copy p{font-size:17px;line-height:1.7;color:rgba(255,255,255,.65);max-width:520px}.generation-names{display:flex;gap:26px;margin-top:32px;padding-top:22px;border-top:1px solid rgba(255,255,255,.12)}.generation-names div{display:flex;flex-direction:column;gap:3px}.generation-names b{font:400 23px Georgia,serif}.generation-names span{font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:rgba(255,255,255,.43)}';
if (html.includes(styleMarker) && !html.includes('.generation-spotlight{')) html = html.replace(styleMarker, styleMarker + spotlightStyles);

const mobileMarker = '.founder-photo{border-radius:24px}}';
const mobileFix = '.founder-photo{border-radius:24px}.generation-spotlight-inner{grid-template-columns:1fr;min-height:auto}.generation-spotlight-media{height:62svh}.generation-spotlight-media:after{background:linear-gradient(180deg,transparent 72%,rgba(6,23,18,.42))}.generation-spotlight-copy{padding:54px 22px 68px}.generation-spotlight-copy:before{display:none}.generation-spotlight-copy h2{font-size:54px}.generation-names{flex-direction:column;gap:14px}}';
if (html.includes(mobileMarker)) html = html.replace(mobileMarker, mobileFix);

const sectionMarker = '</section><section class="media-ribbon">';
const spotlightSection = '</section><section class="generation-spotlight" aria-label="Volker und Johannes Hamel"><div class="generation-spotlight-inner"><figure class="generation-spotlight-media"><img src="assets/hamel-father-son.avif" alt="Johannes und Volker Hamel"></figure><div class="generation-spotlight-copy"><div class="eyebrow">Familie · Verantwortung · Übergabe</div><h2>Volker &<br>Johannes Hamel.</h2><p>Zwei Generationen, die das Unternehmen geprägt haben. Die Übergabe 2023 führt die Geschichte des Familienbetriebs weiter – mit Johannes Hamel in alleiniger Geschäftsführung.</p><div class="generation-names"><div><b>Volker Hamel</b><span>Unternehmensentwicklung über Jahrzehnte</span></div><div><b>Johannes Hamel</b><span>alleiniger Geschäftsführer seit 2023</span></div></div></div></div></section><section class="media-ribbon">';
if (html.includes(sectionMarker) && !html.includes('aria-label="Volker und Johannes Hamel"')) html = html.replace(sectionMarker, spotlightSection);

const founderAnim = "gsap.from('.founder-photo',{clipPath:'inset(8% 10% 8% 10% round 48px)'";
if (html.includes(founderAnim) && !html.includes("gsap.from('.generation-spotlight-media'")) {
  const spotlightAnim = "gsap.from('.generation-spotlight-media',{clipPath:'inset(6% 7% 6% 7% round 34px)',duration:1.15,ease:'power3.out',scrollTrigger:{trigger:'.generation-spotlight',start:'top 78%'}});\n      gsap.to('.generation-spotlight-media img',{scale:1.085,yPercent:3,ease:'none',scrollTrigger:{trigger:'.generation-spotlight',start:'top bottom',end:'bottom top',scrub:true}});\n      ";
  html = html.replace(founderAnim, spotlightAnim + founderAnim);
}


// HAMEL IMAGE WORLD V2 — close the visual gaps and keep the WebGL hero failsafe visible.
const worldStyles = `
  .hero-fallback{opacity:1!important}
  .hero-canvas{opacity:.72;mix-blend-mode:soft-light}\n  .founder-photo{background:url('assets/hamel-father-son.avif') center/cover no-repeat!important}\n  .founder-photo img{opacity:1!important;visibility:visible!important;object-position:center!important}
  .legacy-bg{filter:saturate(.82) contrast(1.02) brightness(.9)}
  .signature-sticky:before{
    background:
      linear-gradient(90deg,rgba(7,26,21,.96),rgba(7,26,21,.72) 42%,rgba(7,26,21,.88)),
      url('assets/hamel-road.avif') center/cover no-repeat!important;
  }
  .image-world{padding:0;background:#071a15;color:#fff;overflow:hidden}
  .image-world-head{padding:92px 0 48px;display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:end}
  .image-world-head h2{font:400 clamp(48px,5vw,78px)/.94 Georgia,serif;letter-spacing:-.05em;margin:12px 0 0}
  .image-world-head p{margin:0 0 7px;max-width:560px;color:rgba(255,255,255,.58);font-size:16px;line-height:1.7}
  .image-world-grid{display:grid;grid-template-columns:1.15fr .85fr .85fr;gap:12px;padding-bottom:12px}
  .world-shot{position:relative;min-height:520px;overflow:hidden;background:#0e241c}
  .world-shot:first-child{min-height:660px}
  .world-shot img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.02);filter:saturate(.86) contrast(1.06)}
  .world-shot:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(3,18,14,.82))}
  .world-shot figcaption{position:absolute;z-index:2;left:28px;right:28px;bottom:26px;display:flex;align-items:end;justify-content:space-between;gap:20px}
  .world-shot figcaption b{font:400 28px Georgia,serif}
  .world-shot figcaption span{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.58);text-align:right}
  .visual-break{padding:0;background:#061712;color:#fff}
  .visual-break-grid{display:grid;grid-template-columns:.9fr 1.1fr;min-height:72vh}
  .visual-break-copy{display:flex;flex-direction:column;justify-content:center;padding:70px max(32px,calc((100vw - var(--max))/2 + 32px))}
  .visual-break-copy h2{font:400 clamp(48px,5.2vw,82px)/.92 Georgia,serif;letter-spacing:-.055em;margin:14px 0 24px;max-width:700px}
  .visual-break-copy p{max-width:590px;color:rgba(255,255,255,.62);font-size:17px;line-height:1.72}
  .visual-break-media{position:relative;overflow:hidden}
  .visual-break-media img{width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.05)}
  .visual-break-media:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,23,18,.5),transparent 35%),linear-gradient(180deg,transparent 65%,rgba(6,23,18,.28))}
  @media(max-width:900px){
    .image-world-head{grid-template-columns:1fr;gap:22px;padding:64px 0 34px}
    .image-world-grid{grid-template-columns:1fr}
    .world-shot,.world-shot:first-child{min-height:62svh}
    .visual-break-grid{grid-template-columns:1fr}
    .visual-break-copy{padding:58px 22px}
    .visual-break-media{min-height:58svh}
  }
`;
if (!html.includes('.image-world{')) html = html.replace('
  /* HAMEL IMAGE FIDELITY HOTFIX
     Never soften source photography with WebGL resampling, forced zooms or CSS filters. */
  .hero-canvas{display:none!important}
  .hero-fallback{
    opacity:1!important;
    filter:none!important;
    transform:none!important;
    object-fit:cover;
    image-rendering:auto;
  }
  .media-ribbon-visual img,
  .generation-spotlight-media img,
  .founder-photo img,
  .world-shot img,
  .visual-break-media img,
  .network-photo img,
  .legacy-bg{
    filter:none!important;
    transform:none!important;
    image-rendering:auto;
  }
</style>', worldStyles + '</style>');

const imageWorld = `
<section class="image-world" aria-label="Bildwelt Landwirtschaft, Tierhaltung und Logistik">
  <div class="wrap image-world-head">
    <div><div class="eyebrow">Landwirtschaft · Tierhaltung · Logistik</div><h2>Ein Betrieb,<br>den man spüren kann.</h2></div>
    <p>Landwirtschaft, Tiervermarktung und Logistik gehören bei HAMEL zusammen. Vom Hof über die Vermarktung bis auf die Straße entstehen kurze Wege, persönliche Abstimmung und verlässliche Abläufe.</p>
  </div>
  <div class="image-world-grid">
    <figure class="world-shot">
      <img loading="lazy" src="assets/hamel-road.avif" alt="HAMEL Tiertransport-Lkw auf einer Landstraße">
      <figcaption><b>Unterwegs für die Landwirtschaft</b><span>Vermarktung · Logistik</span></figcaption>
    </figure>
    <figure class="world-shot">
      <img loading="lazy" src="assets/hamel-father-son.avif" alt="Volker und Johannes Hamel – zwei Generationen des Familienunternehmens">
      <figcaption><b>Zwei Generationen</b><span>Erfahrung · Zukunft</span></figcaption>
    </figure>
    <figure class="world-shot">
      <img loading="lazy" src="assets/hamel-farm.avif" alt="Landwirtschaftlicher Hof im warmen Abendlicht">
      <figcaption><b>Region</b><span>Hof · Bodenständigkeit</span></figcaption>
    </figure>
  </div>
</section>`;
if (!html.includes('aria-label="Bildwelt Landwirtschaft, Tierhaltung und Logistik"')) {
  html = html.replace('<section class="legacy" id="unternehmen">', imageWorld + '<section class="legacy" id="unternehmen">');
}

const visualBreak = `
<section class="visual-break" aria-label="Landwirtschaft im Alltag">
  <div class="visual-break-grid">
    <div class="visual-break-copy">
      <div class="eyebrow">Landwirtschaft aus eigener Praxis</div>
      <h2>Landwirtschaft ist hier kein Motiv. Sie ist Alltag.</h2>
      <p>HAMEL verbindet Viehhandel, Vermarktung und Logistik mit eigener landwirtschaftlicher Praxis. Wer Tiere, Stall und Betrieb selbst kennt, spricht mit Landwirten auf Augenhöhe und trifft Entscheidungen mit Blick für den Alltag vor Ort.</p>
    </div>
    <figure class="visual-break-media">
      <img loading="lazy" src="assets/hamel-farm.avif" alt="Rinder auf einer Weide bei Sonnenuntergang">
    </figure>
  </div>
</section>`;
if (!html.includes('aria-label="Landwirtschaft im Alltag"')) {
  html = html.replace('<section class="philosophy">', visualBreak + '<section class="philosophy">');
}

// Avoid repeating the same HAMEL truck photo in the editorial ribbon.
html = html.replace(
  '<img src="assets/truck.avif" alt="HAMEL Lkw im ländlichen Raum">',
  '<img loading="lazy" src="assets/hamel-road.avif" alt="HAMEL Tiertransport-Lkw auf einer Landstraße">'
);



// HAMEL BRAND ALIGNMENT — original blue identity.
// Keep the premium structure, imagery and motion, but return the complete visual system
// to the company's established blue/white identity instead of the invented green/copper palette.
html = html
  .replaceAll('#071a15', '#151043')
  .replaceAll('#061712', '#100c35')
  .replaceAll('#0d2a21', '#211a63')
  .replaceAll('#14372b', '#30277a')
  .replaceAll('#0d201a', '#17152f')
  .replaceAll('#f1eee6', '#f7f7fb')
  .replaceAll('#e5dfd3', '#eceef5')
  .replaceAll('#fffdf7', '#ffffff')
  .replaceAll('#d7c4aa', '#d9ddf1')
  .replaceAll('#b86d45', '#21146f')
  .replaceAll('#8e4e31', '#160e52')
  .replaceAll('#d9ae8f', '#8f88cf')
  .replaceAll('#e5b99a', '#7168bd')
  .replaceAll('#ecd6c3', '#f0efff')
  .replaceAll('#ecd9c8', '#f0efff')
  .replaceAll('#f4eadc', '#ffffff')
  .replaceAll('#edd8c3', '#efedff')
  .replaceAll('#d8ae8e', '#aaa4e1')
  .replaceAll('#d7ad8c', '#aaa4e1')
  .replaceAll('#d7c9b7', '#d8d5f4')
  .replaceAll('#ddcdb5', '#d8d5f4')
  .replaceAll('#e7d8c8', '#e7e5fb')
  .replaceAll('rgba(7,26,21,', 'rgba(21,16,67,')
  .replaceAll('rgba(6,23,18,', 'rgba(16,12,53,')
  .replaceAll('rgba(184,109,69,', 'rgba(33,20,111,')
  .replaceAll('rgba(234,202,173,', 'rgba(173,168,225,')
  .replaceAll('rgba(230,187,151,', 'rgba(170,164,225,')
  .replaceAll('content="#071a15"', 'content="#21146f"');

const brandStyles = `
  /* HAMEL brand reset: blue, white, precise, established */
  :root{
    --ink:#17152f;
    --forest:#151043;
    --forest-2:#211a63;
    --forest-3:#30277a;
    --paper:#f7f7fb;
    --paper-2:#eceef5;
    --white:#ffffff;
    --blue:#21146f;
    --sand:#d9ddf1;
    --copper:#21146f;
    --muted:#69687a;
    --line:rgba(33,20,111,.16);
    --line-light:rgba(255,255,255,.14);
    --shadow:0 35px 110px rgba(21,16,67,.16);
  }
  body{background:var(--paper);color:var(--ink)}
  ::selection{background:var(--blue);color:#fff}
  .loader,.hero,.legacy,.signature,.image-world,.visual-break,.generation-spotlight{background:var(--forest)}
  .ticker,.proofbar,.media-ribbon{background:#100c35}
  .nav.scrolled{background:rgba(21,16,67,.9)}
  .btn-primary{background:var(--blue)}
  .btn-primary:before{background:#160e52}
  .hero:before{
    background:
      radial-gradient(circle at 75% 12%,rgba(105,94,190,.24),transparent 30%),
      linear-gradient(180deg,transparent 65%,rgba(8,5,34,.34));
  }
  .hero-title em,.timeline .year,.signature-copy h2 em{color:#aaa4e1}
  .hero .eyebrow,.legacy-kicker,.generation-spotlight-copy .eyebrow,.signature-copy .eyebrow{color:#d8d5f4}
  .hero-frame{background:#1d1855}
  .hero-frame:after{
    background:
      linear-gradient(180deg,rgba(21,16,67,.02),rgba(21,16,67,.48)),
      radial-gradient(circle at 80% 16%,rgba(255,255,255,.13),transparent 32%);
  }
  .hero-glint{
    background:radial-gradient(circle,rgba(170,164,225,.28),rgba(170,164,225,0) 70%);
  }
  .hero-badge{background:rgba(255,255,255,.97)}
  .proof b,.legacy-proof b{color:#efedff}
  .legacy-bg{
    filter:saturate(.9) contrast(1.04);
  }
  .legacy:after{
    background:linear-gradient(180deg,rgba(21,16,67,.04),rgba(21,16,67,.86) 92%);
  }
  .legacy-proof{background:rgba(255,255,255,.14)}
  .legacy-proof div{background:rgba(21,16,67,.72)}
  .media-ribbon-visual:after{
    background:linear-gradient(90deg,transparent 60%,rgba(16,12,53,.72));
  }
  .generation-spotlight-media:after{
    background:linear-gradient(90deg,transparent 66%,rgba(16,12,53,.12) 82%,rgba(16,12,53,.58));
  }
  .signature-sticky:before{
    background:
      linear-gradient(90deg,rgba(21,16,67,.96),rgba(21,16,67,.7) 42%,rgba(16,12,53,.9)),
      url('assets/hamel-road.avif') center/cover no-repeat!important;
  }
  .sig-road-shadow{stroke:rgba(105,94,190,.18)}
  .image-world{background:#151043}
  .world-shot{background:#1d1855}
  .world-shot:after{background:linear-gradient(180deg,transparent 48%,rgba(10,7,43,.84))}
  .visual-break{background:#151043}
  .visual-break-media:after{
    background:
      linear-gradient(90deg,rgba(21,16,67,.5),transparent 35%),
      linear-gradient(180deg,transparent 65%,rgba(21,16,67,.3));
  }
  .founder{background:#fff}
  .founder-lead{color:#4b4960}
  .founder-photo:after{background:linear-gradient(180deg,transparent 56%,rgba(21,16,67,.48))}
  .founder-year-stack{background:rgba(21,16,67,.34)}
  .founder-light{
    background:radial-gradient(circle,rgba(170,164,225,.2),transparent 68%);
  }
  .core{background:var(--blue);box-shadow:0 0 0 30px rgba(33,20,111,.06)}
  .scroll-progress i{background:linear-gradient(90deg,#21146f,#7168bd)}
  .ticker-track i{background:#7168bd}
  .external-proof i{background:#21146f}
`;
html = html.replace('</style>', brandStyles + '</style>');

// Final public-copy cleanup: remove research labels / draft-like UI from the customer-facing page.
html = html
  .replace(/<small>Quelle:[^<]*<\/small>/g, '')
  .replace(/<div class="network-source">Quelle:[^<]*<\/div>/g, '')
  .replace(/<a class="external-proof"[\s\S]*?<\/a>/g, '')
  .replace(/<a href="https:\/\/www\.viehhandlung-hamel\.de\/"[^>]*>Bisheriger Webauftritt ↗<\/a>/g, '')
  .replaceAll('Die Pressemitteilung formuliert ausdrücklich den Wunsch, HAMEL langfristig weiterzuentwickeln und eines Tages in die achte Generation zu übergeben.', 'HAMEL soll langfristig als Familienunternehmen weitergeführt und Schritt für Schritt für die nächste Generation entwickelt werden.')
  .replaceAll('HAMEL IMAGE WORLD V2', 'HAMEL');

fs.writeFileSync(path.join(dist, 'index.html'), html);
fs.writeFileSync(path.join(assets, 'hamel-logo.webp'), decodeParts('hamel-logo.webp'));
fs.writeFileSync(path.join(assets, 'generations.avif'), decodeParts('generations.avif'));
fs.writeFileSync(path.join(assets, 'truck.avif'), decodeParts('truck.avif'));
for (const file of ['hamel-road.avif','hamel-farm.avif','hamel-father-son.avif']) {
  fs.copyFileSync(path.join(src, 'generated', file), path.join(assets, file));
}
fs.copyFileSync(path.join(src, 'robots.txt'), path.join(dist, 'robots.txt'));

console.log('HAMEL demo built successfully');
