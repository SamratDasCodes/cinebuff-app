const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_API_KEY_HERE'; // I'll assume it's in env
// But I need to run this with the actual key. I'll read it from .env.local if possible or user context.
// Actually, I can just use the tool `read_resource` if I knew the server... no.
// I will just use the existing `searchKeywords` function in my codebase? No, I can't call exports from terminal easily.
// I'll write a standalone script.

const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Read .env.local to get key
const envPath = path.join(__dirname, '.env.local');
let apiKey = '';
try {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/TMDB_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.log("Could not read .env.local");
}

if (!apiKey) {
    console.error("No API Key found");
    process.exit(1);
}

const terms = ['hentai', 'erotic', 'sex', 'av', 'adult anime', 'ecchi'];

function search(term) {
    return new Promise((resolve) => {
        https.get(`https://api.themoviedb.org/3/search/keyword?api_key=${apiKey}&query=${encodeURIComponent(term)}&page=1`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`\nResults for '${term}':`);
                    (json.results || []).slice(0, 5).forEach(r => console.log(`${r.id}: ${r.name}`));
                    resolve();
                } catch (e) {
                    console.error(e);
                    resolve();
                }
            });
        });
    });
}

(async () => {
    for (const term of terms) {
        await search(term);
    }
})();
