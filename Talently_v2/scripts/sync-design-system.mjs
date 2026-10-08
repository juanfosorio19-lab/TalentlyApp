// scripts/sync-design-system.mjs
// Sincroniza src/ui con el sistema de diseño de Claude Design guardado en
// docs/rediseno/diseno/ (fuente de verdad: artefacto «Sistema de diseño Talently»).
//   - Copia tokens.css, bundle.css y las fuentes Inter tal cual.
//   - Genera src/ui/icons/icons.generated.tsx desde icons.json.
// Uso: npm run ds:sync   (después de actualizar docs/rediseno/diseno con una
// entrega nueva de Claude Design). Nunca se editan a mano los archivos generados.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const design = join(root, '../docs/rediseno/diseno');
const dsDir = join(design, 'prototipo-f1/project/ds/talently');
const iconsJson = join(design, 'sistema-de-diseno/assets/Iconos/icons.json');
const logoDir = join(design, 'sistema-de-diseno/assets/Logo');
const out = join(root, 'src/ui');

mkdirSync(join(out, 'styles/fonts'), { recursive: true });
copyFileSync(join(dsDir, 'tokens.css'), join(out, 'styles/tokens.css'));
copyFileSync(join(dsDir, 'components/bundle.css'), join(out, 'styles/bundle.css'));
for (const f of readdirSync(join(dsDir, 'fonts'))) {
    copyFileSync(join(dsDir, 'fonts', f), join(out, 'styles/fonts', f));
}

// Logos oficiales (sección 10.1 y 10.2 del maestro): se copian tal cual.
mkdirSync(join(out, 'BrandLogo'), { recursive: true });
const logo = (f) => JSON.stringify(readFileSync(join(logoDir, f), 'utf8').trim());
writeFileSync(join(out, 'BrandLogo/logos.generated.ts'), [
    '// GENERADO por scripts/sync-design-system.mjs desde assets/Logo — no editar a mano.',
    `export const LOGO_TILE_SVG = ${logo('talently-logo-tile.svg')};`,
    `export const LOGO_SVG = ${logo('talently-logo.svg')};`,
    '',
].join('\n'));

const { icons, aliases } = JSON.parse(readFileSync(iconsJson, 'utf8'));
const names = Object.keys(icons);

// El SVG completo se guarda tal cual: es contenido propio del sistema de
// diseño (sin datos del usuario), así que inyectarlo inline es seguro.
const lines = [
    '// GENERADO por scripts/sync-design-system.mjs desde icons.json — no editar a mano.',
    "import { createIcon } from './createIcon';",
    '',
];
for (const name of names) {
    const { svg, usage, group } = icons[name];
    lines.push(`/** ${group} · ${usage} */`);
    lines.push(`export const ${name} = createIcon('${name}', ${JSON.stringify(svg)});`);
}
for (const [alias, target] of Object.entries(aliases ?? {})) {
    if (!names.includes(alias)) lines.push(`/** Alias de ${target} */\nexport const ${alias} = ${target};`);
}
lines.push('');
lines.push('export const ICON_GROUPS = ' + JSON.stringify(
    names.reduce((acc, n) => { (acc[icons[n].group] ??= []).push(n); return acc; }, {}),
    null, 2) + ' as const;');
lines.push('');
writeFileSync(join(out, 'icons/icons.generated.tsx'), lines.join('\n'));

console.log(`Sistema de diseño sincronizado: tokens.css, bundle.css, fuentes, logos y ${names.length} íconos.`);
