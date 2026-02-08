const fs = require('fs');
const path = require('path');
const https = require('https');

// Simple .env parser since we might not have dotenv installed
const envPath = path.resolve(__dirname, '../.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/TMDB_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Could not read .env.local file");
    process.exit(1);
}

if (!apiKey) {
    console.error("TMDB_API_KEY not found in .env.local");
    process.exit(1);
}

console.log(`Testing TMDB API with Key: ${apiKey.substring(0, 5)}...`);

const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`;

https.get(url, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.results) {
                console.log(`✅ Success! Fetched ${json.results.length} movies.`);
                console.log(`Top Movie: ${json.results[0].title}`);
            } else {
                console.error("❌ API Error:", json);
            }
        } catch (e) {
            console.error("❌ Parse Error:", e);
            console.log("Raw Data:", data);
        }
    });

}).on('error', (err) => {
    console.error("❌ Network Error:", err.message);
});
