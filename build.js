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
  .replaceAll('assets/truck.webp', 'assets/truck.avif');

const styleMarker = '.external-proof{display:inline-flex;align-items:center;gap:10px;margin-top:34px;padding:11px 14px;border:1px solid var(--line);border-radius:999px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}.external-proof i{width:7px;height:7px;background:#75a17d;border-radius:50%}';
const spotlightStyles = '.generation-spotlight{background:#061712;color:#fff;padding:0;position:relative;overflow:hidden}.generation-spotlight-inner{min-height:88svh;display:grid;grid-template-columns:1.25fr .75fr}.generation-spotlight-media{position:relative;overflow:hidden}.generation-spotlight-media img{width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.96) contrast(1.03);transform:scale(1.015)}.generation-spotlight-media:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 66%,rgba(6,23,18,.12) 82%,rgba(6,23,18,.55))}.generation-spotlight-copy{display:flex;flex-direction:column;justify-content:center;padding:70px clamp(30px,6vw,100px);position:relative}.generation-spotlight-copy:before{content:"";position:absolute;left:0;top:15%;bottom:15%;width:1px;background:rgba(255,255,255,.12)}.generation-spotlight-copy .eyebrow{color:#d7c9b7}.generation-spotlight-copy h2{font:400 clamp(54px,6vw,94px)/.9 Georgia,serif;letter-spacing:-.055em;margin:18px 0 24px}.generation-spotlight-copy p{font-size:17px;line-height:1.7;color:rgba(255,255,255,.65);max-width:520px}.generation-names{display:flex;gap:26px;margin-top:32px;padding-top:22px;border-top:1px solid rgba(255,255,255,.12)}.generation-names div{display:flex;flex-direction:column;gap:3px}.generation-names b{font:400 23px Georgia,serif}.generation-names span{font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:rgba(255,255,255,.43)}';
if (html.includes(styleMarker) && !html.includes('.generation-spotlight{')) html = html.replace(styleMarker, styleMarker + spotlightStyles);

const mobileMarker = '.founder-photo{border-radius:24px}}';
const mobileFix = '.founder-photo{border-radius:24px}.generation-spotlight-inner{grid-template-columns:1fr;min-height:auto}.generation-spotlight-media{height:62svh}.generation-spotlight-media:after{background:linear-gradient(180deg,transparent 72%,rgba(6,23,18,.42))}.generation-spotlight-copy{padding:54px 22px 68px}.generation-spotlight-copy:before{display:none}.generation-spotlight-copy h2{font-size:54px}.generation-names{flex-direction:column;gap:14px}}';
if (html.includes(mobileMarker)) html = html.replace(mobileMarker, mobileFix);

const sectionMarker = '</section><section class="media-ribbon">';
const spotlightSection = '</section><section class="generation-spotlight" aria-label="Volker und Johannes Hamel"><div class="generation-spotlight-inner"><figure class="generation-spotlight-media"><img src="assets/generations.avif" alt="Johannes und Volker Hamel vor einer Steinwand"></figure><div class="generation-spotlight-copy"><div class="eyebrow">Familie · Verantwortung · Übergabe</div><h2>Volker &<br>Johannes Hamel.</h2><p>Zwei Generationen, die das Unternehmen geprägt haben. Die Übergabe 2023 führt die Geschichte des Familienbetriebs weiter – mit Johannes Hamel in alleiniger Geschäftsführung.</p><div class="generation-names"><div><b>Volker Hamel</b><span>Unternehmensentwicklung über Jahrzehnte</span></div><div><b>Johannes Hamel</b><span>alleiniger Geschäftsführer seit 2023</span></div></div></div></div></section><section class="media-ribbon">';
if (html.includes(sectionMarker) && !html.includes('aria-label="Volker und Johannes Hamel"')) html = html.replace(sectionMarker, spotlightSection);

const founderAnim = "gsap.from('.founder-photo',{clipPath:'inset(8% 10% 8% 10% round 48px)'";
if (html.includes(founderAnim) && !html.includes("gsap.from('.generation-spotlight-media'")) {
  const spotlightAnim = "gsap.from('.generation-spotlight-media',{clipPath:'inset(6% 7% 6% 7% round 34px)',duration:1.15,ease:'power3.out',scrollTrigger:{trigger:'.generation-spotlight',start:'top 78%'}});\n      gsap.to('.generation-spotlight-media img',{scale:1.085,yPercent:3,ease:'none',scrollTrigger:{trigger:'.generation-spotlight',start:'top bottom',end:'bottom top',scrub:true}});\n      ";
  html = html.replace(founderAnim, spotlightAnim + founderAnim);
}


// HAMEL IMAGE WORLD V2 — close the visual gaps and keep the WebGL hero failsafe visible.
const worldStyles = `
  .hero-fallback{opacity:1!important}
  .hero-canvas{opacity:.72;mix-blend-mode:soft-light}
  .legacy-bg{filter:saturate(.82) contrast(1.02) brightness(.9)}
  .signature-sticky:before{
    background:
      linear-gradient(90deg,rgba(7,26,21,.96),rgba(7,26,21,.72) 42%,rgba(7,26,21,.88)),
      url('https://images.unsplash.com/photo-1720155390935-f49e18525eb9?auto=format&fit=crop&w=2400&q=86') center/cover no-repeat!important;
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
if (!html.includes('.image-world{')) html = html.replace('</style>', worldStyles + '</style>');

const imageWorld = `
<section class="image-world" aria-label="Bildwelt Landwirtschaft, Tierhaltung und Logistik">
  <div class="wrap image-world-head">
    <div><div class="eyebrow">Landwirtschaft · Tierhaltung · Logistik</div><h2>Ein Betrieb,<br>den man spüren kann.</h2></div>
    <p>Die Bildwelt übersetzt HAMEL in echte Situationen: Tiere, Fläche, Hof und Bewegung. Ruhig, hochwertig und bodenständig statt austauschbarer Stock-Optik.</p>
  </div>
  <div class="image-world-grid">
    <figure class="world-shot">
      <img loading="lazy" src="https://images.unsplash.com/photo-1778949367453-168e90145d58?auto=format&fit=crop&w=2000&q=86" alt="Rinder auf einer Weide im Abendlicht">
      <figcaption><b>Tierhaltung</b><span>Nähe · Verantwortung</span></figcaption>
    </figure>
    <figure class="world-shot">
      <img loading="lazy" src="https://images.unsplash.com/photo-1503054578884-5753a0efe39f?auto=format&fit=crop&w=1600&q=86" alt="Landwirtschaftliche Flächen aus der Luft">
      <figcaption><b>Landwirtschaft</b><span>Fläche · Herkunft</span></figcaption>
    </figure>
    <figure class="world-shot">
      <img loading="lazy" src="https://images.unsplash.com/photo-1761481253997-10501d9f4c23?auto=format&fit=crop&w=1600&q=86" alt="Landwirtschaftlicher Hof im warmen Abendlicht">
      <figcaption><b>Region</b><span>Hof · Bodenständigkeit</span></figcaption>
    </figure>
  </div>
</section>`;
if (!html.includes('aria-label="Bildwelt Landwirtschaft, Tierhaltung und Logistik"')) {
  html = html.replace('<section class="legacy">', imageWorld + '<section class="legacy">');
}

const visualBreak = `
<section class="visual-break" aria-label="Landwirtschaft im Alltag">
  <div class="visual-break-grid">
    <div class="visual-break-copy">
      <div class="eyebrow">Praxis statt Prospekt</div>
      <h2>Landwirtschaft ist hier kein Motiv. Sie ist Alltag.</h2>
      <p>HAMEL verbindet Vermarktung und Logistik mit eigener landwirtschaftlicher Praxis. Die neue Bildsprache macht genau diese Verbindung sichtbar und gibt den langen Storytelling-Passagen endlich visuelle Spannung.</p>
    </div>
    <figure class="visual-break-media">
      <img loading="lazy" src="https://images.unsplash.com/photo-1763349212487-ec3f9a238074?auto=format&fit=crop&w=2200&q=86" alt="Rinder auf einer Weide bei Sonnenuntergang">
    </figure>
  </div>
</section>`;
if (!html.includes('aria-label="Landwirtschaft im Alltag"')) {
  html = html.replace('<section class="philosophy">', visualBreak + '<section class="philosophy">');
}

// Avoid repeating the same HAMEL truck photo in the editorial ribbon.
html = html.replace(
  '<img src="assets/truck.avif" alt="HAMEL Lkw im ländlichen Raum">',
  '<img loading="lazy" src="https://images.unsplash.com/photo-1761481253997-10501d9f4c23?auto=format&fit=crop&w=2200&q=86" alt="Landwirtschaftlicher Hof im warmen Abendlicht">'
);

fs.writeFileSync(path.join(dist, 'index.html'), html);
fs.writeFileSync(path.join(assets, 'hamel-logo.webp'), decodeParts('hamel-logo.webp'));
fs.writeFileSync(path.join(assets, 'generations.avif'), decodeParts('generations.avif'));
fs.writeFileSync(path.join(assets, 'truck.avif'), decodeParts('truck.avif'));
fs.copyFileSync(path.join(src, 'robots.txt'), path.join(dist, 'robots.txt'));

console.log('HAMEL demo built successfully');
