const fs = require('fs');
const path = require('path');

function findInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf16le'); // Try UTF-16 first
    // Convert to lowercase to search
    let safeContent = content;
    if (safeContent.includes('\0')) {
        // It might be UTF-16, keep safeContent as is
        if (!safeContent.toLowerCase().includes('ximamente')) {
            // Try utf8
            safeContent = fs.readFileSync(filePath, 'utf8');
        }
    } else {
        safeContent = fs.readFileSync(filePath, 'utf8');
    }

    const lines = safeContent.split('\n');
    lines.forEach((l, i) => {
        if (l.toLowerCase().includes('ximamente')) {
            console.log(`[${filePath}] Line ${i + 1}: ${l.trim().substring(0, 100)}`);
        }
    });
}

findInFile('index.html');
const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
jsFiles.forEach(f => findInFile(path.join('js', f)));
