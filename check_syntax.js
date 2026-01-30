const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js/app.js');
const code = fs.readFileSync(filePath, 'utf8');

let count = 0;
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Remove comments
    const cleanLine = line.replace(/\/\/.*$/, '');
    // We ignore block comments /* */ for simplicity as they are rare inside lines in this file

    for (const char of cleanLine) {
        if (char === '(') count++;
        if (char === ')') count--;
    }

    if (count < 0) {
        console.log(`[PARENTHESIS ERROR] Too many closing ')' at line ${i + 1}`);
        console.log(`Line content: "${line.trim()}"`);
        process.exit(1);
    }
}

if (count > 0) {
    console.log(`[PARENTHESIS ERROR] Unclosed '(' found. Total open at end: ${count}`);
} else {
    console.log("[PARENTHESIS OK] Balance is zero.");
}

// Also check braces (rough check)
let braceCount = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/\/\/.*$/, '');
    for (const char of cleanLine) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
    }
    if (braceCount < 0) {
        console.log(`[BRACE ERROR] Too many closing '}' at line ${i + 1}`);
        console.log(`Line content: "${line.trim()}"`); // Added logging
        process.exit(1);
    }
}
if (braceCount > 0) {
    console.log(`[BRACE ERROR] Unclosed '{' found. Total open: ${braceCount}`);
} else {
    console.log("[BRACE OK] Balance is zero.");
}
