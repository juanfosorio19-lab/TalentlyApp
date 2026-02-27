const fs = require('fs');

const jsonPath = 'C:/Users/Juan Osorio/.gemini/antigravity/brain/844deb7d-8a36-47a6-b4a2-830f04fc9f37/.system_generated/steps/296/output.txt';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function processViews() {
    const screens = data.screens.filter(s => s.title.startsWith('Company'));

    // Group by title to pick just one variant per title
    const uniqueScreens = {};
    for (const s of screens) {
        if (!uniqueScreens[s.title]) {
            uniqueScreens[s.title] = s;
        }
    }

    // Read as utf16le because index.html is in utf16le in this project!
    let indexHtml = fs.readFileSync('index.html', 'utf16le');
    let injectedCount = 0;

    // For each unique screen, fetch and inject
    for (const [title, screen] of Object.entries(uniqueScreens)) {
        if (title.includes('Company Talent Swipe Dashboard')) {
            console.log(`Skipping "${title}" as it was already integrated.`);
            continue;
        }

        console.log(`Fetching: "${title}"...`);
        try {
            const res = await fetch(screen.htmlCode.downloadUrl);
            let htmlContent = await res.text();

            // Extract body content
            const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (!bodyMatch) {
                console.log(`[!] Could not parse <body> for ${title}`);
                continue;
            }
            let bodyInner = bodyMatch[1];

            // Strip out all class="dark:something" classes to strictly enforce Light Mode
            bodyInner = bodyInner.replace(/dark:[^\s"'>]+/g, '');

            // Remove global scripts to prevent pollution
            bodyInner = bodyInner.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

            // Generate a camelCase ID from the title
            let rawWords = title.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(w => w.trim().length > 0);
            let viewId = rawWords.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('') + 'View';

            let wrapperId = `stitch-${viewId}`; // extra unique

            let viewWrapper = `\n    <!-- === STITCH VIEW: ${title} === -->\n    <div id="${viewId}" class="view hidden h-screen w-screen overflow-y-auto bg-background-light">\n        ${bodyInner}\n    </div>\n`;

            if (indexHtml.includes(`<!-- === STITCH VIEW: ${title} === -->`)) {
                console.log(`-> View "${title}" is already in index.html. Skipping.`);
            } else {
                indexHtml = indexHtml.replace('</body>', viewWrapper + '\n</body>');
                console.log(`-> Injected successfully as #${viewId}`);
                injectedCount++;
            }
        } catch (err) {
            console.error(`Error fetching ${title}:`, err.message);
        }
    }

    if (injectedCount > 0) {
        fs.writeFileSync('index.html', indexHtml, 'utf16le');
        console.log(`\nSuccess! ${injectedCount} views injected into index.html and saved (UTF-16).`);
    } else {
        console.log('\nNo new views were injected.');
    }
}

processViews().catch(console.error);
