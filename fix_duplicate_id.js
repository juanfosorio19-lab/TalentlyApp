const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf16le');

let matchCount = 0;
html = html.replace(/id="expCompany"/g, (match, offset) => {
    matchCount++;
    if (matchCount === 2) {
        return 'id="companyOnboardingExpCompany"';
    }
    return match;
});

matchCount = 0;
html = html.replace(/for="expCompany"/g, (match, offset) => {
    matchCount++;
    if (matchCount === 2) {
        return 'for="companyOnboardingExpCompany"';
    }
    return match;
});

fs.writeFileSync('index.html', html, 'utf16le');
console.log('Fixed duplicate IDs in index.html (UTF-16LE)');
