const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js/app.js');
const code = fs.readFileSync(filePath, 'utf8');
const lines = code.split('\n');

let count = 0;
let lastZeroLine = -1;

for (let j = 0; j < lines.length; j++) {
    const line = lines[j].replace(/\/\/.*$/, ''); // clean comments
    for (const char of line) {
        if (char === '(') count++;
        if (char === ')') count--;
    }
    if (count === 0) lastZeroLine = j;
}

console.log(`Last line with balanced parentheses (count=0): ${lastZeroLine + 1}`);
if (lastZeroLine + 1 < lines.length) {
    console.log(`Suspect unclosed '(' starts after line ${lastZeroLine + 1}`);
    // Print next few lines
    for (let k = lastZeroLine + 1; k < Math.min(lines.length, lastZeroLine + 10); k++) {
        console.log(`${k + 1}: ${lines[k]}`);
    }
} else {
    console.log("File ends with balanced parentheses?? But check_syntax said no.");
    console.log("Final count:", count);
}
