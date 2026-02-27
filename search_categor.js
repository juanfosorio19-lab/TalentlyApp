const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    if (l.includes('id="filtersView"')) console.log(`HTML:${i + 1} => ${l.trim().substring(0, 80)}`);
    if (l.includes('Categoría')) console.log(`HTML:${i + 1} => ${l.trim().substring(0, 80)}`);
    if (l.includes('<input type="range"') && l.includes('pointer-events: none')) console.log(`HTML:${i + 1} => ${l.trim().substring(0, 80)}`);
}
