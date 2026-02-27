const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf16le');

const regex = /id=["']([^"']+)["']/gi;
let match;
let idCounts = {};
let duplicates = new Set();

while ((match = regex.exec(html)) !== null) {
    let id = match[1];
    idCounts[id] = (idCounts[id] || 0) + 1;
    if (idCounts[id] > 1) {
        duplicates.add(id);
    }
}

console.log('Duplicates found:', Array.from(duplicates));

duplicates.forEach(id => {
    let count = 0;
    html = html.replace(new RegExp('id=["\']' + id + '["\']', 'g'), (m) => {
        count++;
        if (count > 1) {
            console.log(`Renaming duplicate instance of ${id} to ${id}_stitch`);
            return `id="${id}_stitch"`;
        }
        return m;
    });

    let forCount = 0;
    html = html.replace(new RegExp('for=["\']' + id + '["\']', 'g'), (m) => {
        forCount++;
        if (forCount > 1) return `for="${id}_stitch"`;
        return m;
    });
});

fs.writeFileSync('index.html', html, 'utf16le');
console.log('Finished fixing duplicates!');
