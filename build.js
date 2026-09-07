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

fs.writeFileSync(path.join(dist, 'index.html'), html);
fs.writeFileSync(path.join(assets, 'hamel-logo.webp'), decodeParts('hamel-logo.webp'));
fs.writeFileSync(path.join(assets, 'generations.avif'), decodeParts('generations.avif'));
fs.writeFileSync(path.join(assets, 'truck.avif'), decodeParts('truck.avif'));
fs.copyFileSync(path.join(src, 'robots.txt'), path.join(dist, 'robots.txt'));

console.log('HAMEL demo built successfully');
