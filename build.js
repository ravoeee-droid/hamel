const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const root = __dirname;
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const assets = path.join(dist, 'assets');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(assets, { recursive: true });
const readParts = prefix => fs.readdirSync(src).filter(f => f.startsWith(prefix)).sort().map(f => fs.readFileSync(path.join(src, f), 'utf8').trim()).join('');
const htmlGz = Buffer.from(readParts('index.html.gz.b64.'), 'base64');
fs.writeFileSync(path.join(dist, 'index.html'), zlib.gunzipSync(htmlGz));
for (const name of ['hamel-logo.webp', 'generations.webp', 'truck.webp']) {
  const b64 = readParts(name + '.b64.');
  fs.writeFileSync(path.join(assets, name), Buffer.from(b64, 'base64'));
}
console.log('HAMEL demo built successfully');
