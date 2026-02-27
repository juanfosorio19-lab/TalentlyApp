const fs = require('fs');
const path = require('path');

let results = [];
function findInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
        if (l.toLowerCase().includes('ximamente') || l.toLowerCase().includes('proximamente')) {
            // Try to extract the label or context
            let context = l.trim();
            if (context.length > 60) context = context.substring(0, 60) + '...';
            results.push(`- **${filePath}** (Line ${i + 1}): \`${context}\``);
        }
    });
}

findInFile('index.html');
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
jsFiles.forEach(f => findInFile(path.join('js', f)));

console.log(results.join('\n'));
