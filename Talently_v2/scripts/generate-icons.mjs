// scripts/generate-icons.mjs
// Genera TODOS los assets nativos de Android (launcher + splash) y el favicon
// desde assets/logo.svg. Correr con `npm run icons` ANTES de compilar el APK
// (los PNG no van al repo: este script es la fuente de verdad).
//
// Estrategia: para cada PNG existente en android/res se lee su tamaño real y
// se regenera con las mismas dimensiones — así no dependemos de tablas de
// densidades ni rompemos nada que Capacitor espere encontrar.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// sharp NO va en package.json (mantiene el lockfile liviano): instalarlo
// al vuelo la primera vez con `npm i --no-save sharp`.
let sharp;
try {
    sharp = (await import('sharp')).default;
} catch {
    console.error('Falta sharp. Corre primero:  npm i --no-save sharp');
    process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const RES = join(root, 'android/app/src/main/res');
const LOGO = join(root, 'assets/logo.svg');
const SPLASH_BG = '#ECE6FB'; // lavanda muy claro, a juego con la marca

const logoSvg = readFileSync(LOGO, 'utf8');

// La marca "T" sola (sin tile) para el foreground adaptativo: quitamos el rect
// de fondo y dejamos los trazos, centrados en la zona segura (66%).
const markOnly = logoSvg.replace(/<rect width="1024"[^/]*\/>/, '');

const renderLogo = (size) =>
    sharp(Buffer.from(logoSvg), { density: 300 }).resize(size, size).png().toBuffer();

// Foreground adaptativo: lienzo transparente con la marca al 62% centrada
async function renderForeground(size) {
    const inner = Math.round(size * 0.62);
    const mark = await sharp(Buffer.from(markOnly), { density: 300 })
        .resize(inner, inner).png().toBuffer();
    const pad = Math.round((size - inner) / 2);
    return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: mark, top: pad, left: pad }])
        .png().toBuffer();
}

// Round: el tile completo recortado en círculo
async function renderRound(size) {
    const tile = await renderLogo(size);
    const circle = Buffer.from(
        `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`
    );
    return sharp(tile).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
}

// Splash: fondo lavanda con el tile centrado (~28% del lado menor)
async function renderSplash(w, h) {
    const side = Math.round(Math.min(w, h) * 0.28);
    const tile = await renderLogo(side);
    return sharp({ create: { width: w, height: h, channels: 4, background: SPLASH_BG } })
        .composite([{ input: tile, top: Math.round((h - side) / 2), left: Math.round((w - side) / 2) }])
        .png().toBuffer();
}

async function replacePng(path, bufferFor) {
    const meta = await sharp(path).metadata();
    const buf = await bufferFor(meta.width, meta.height);
    await sharp(buf).toFile(path);
    console.log(`  ✓ ${path.replace(RES + '/', '')} (${meta.width}x${meta.height})`);
}

console.log('Generando assets desde assets/logo.svg…');

for (const dir of readdirSync(RES)) {
    const full = join(RES, dir);
    if (!statSync(full).isDirectory()) continue;

    for (const file of readdirSync(full)) {
        if (!file.endsWith('.png')) continue;
        const path = join(full, file);
        if (file === 'ic_launcher.png') {
            await replacePng(path, (w) => renderLogo(w));
        } else if (file === 'ic_launcher_round.png') {
            await replacePng(path, (w) => renderRound(w));
        } else if (file === 'ic_launcher_foreground.png') {
            await replacePng(path, (w) => renderForeground(w));
        } else if (file.startsWith('splash')) {
            await replacePng(path, (w, h) => renderSplash(w, h));
        }
    }
}

// Favicon PNG de respaldo (el SVG ya vive en public/favicon.svg)
await sharp(Buffer.from(logoSvg), { density: 300 }).resize(512, 512).png()
    .toFile(join(root, 'public/icon-512.png'));
console.log('  ✓ public/icon-512.png');

console.log('Listo. Recompila el APK para ver el ícono nuevo (docs/MOBILE.md §3).');
