const fs = require('fs');
const path = require('path');
let results = [];
function findInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
        if (l.toLowerCase().includes('ximamente') || l.toLowerCase().includes('proximamente')) {
            results.push(`- **${filePath}** (Line ${i + 1}): \`${l.trim()}\``);
        }
    });
}
findInFile('index.html');
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
jsFiles.forEach(f => findInFile(path.join('js', f)));
fs.writeFileSync('proximamente_results.txt', results.join('\n'));
