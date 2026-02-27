const fs = require('fs');
const js = fs.readFileSync('js/app_fixed.js', 'utf8');
const lines = js.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('salary')) {
        console.log(`Line ${i + 1}: ${lines[i].trim().substring(0, 100)}`);
    }
    if (lines[i].toLowerCase().includes('categor')) {
        console.log(`Line ${i + 1}: ${lines[i].trim().substring(0, 100)}`);
    }
}
