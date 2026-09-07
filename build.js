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
fs.writeFileSync(path.join(dist, 'index.html'), html);

fs.writeFileSync(path.join(assets, 'hamel-logo.webp'), decodeParts('hamel-logo.webp'));
fs.writeFileSync(path.join(assets, 'generations.avif'), decodeParts('generations.avif'));
fs.writeFileSync(path.join(assets, 'truck.avif'), decodeParts('truck.avif'));
fs.copyFileSync(path.join(src, 'robots.txt'), path.join(dist, 'robots.txt'));

console.log('HAMEL demo built successfully');
