// The TMDB API Key will be securely fetched from Vercel's Environment Variables.
// You must set a variable named 'VITE_TMDB_API_KEY' in your Vercel project settings.
const tmdbApiKey = process.env.VITE_TMDB_API_KEY; 
const tmdbApiBaseUrl = 'https://api.themoviedb.org/3';

/**
 * Fetches data from The Movie Database (TMDB) API.
 * @param {string} endpoint - The API endpoint to call (e.g., 'trending/movie/week').
 * @param {Object} [params={}] - An object of query parameters to add to the request.
 * @returns {Promise<Object|null>} The JSON response from the API, or null on error.
 */
async function fetchFromTMDb(endpoint, params = {}) {
    const urlParams = new URLSearchParams({
        api_key: tmdbApiKey,
        ...params,
    });
    const url = `${tmdbApiBaseUrl}/${endpoint}?${urlParams}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            return null;
        }
        return response.json();
    } catch (error) {
        console.error('Failed to fetch from TMDB:', error);
        return null;
    }
}


/**
 * Calls a serverless function to get a response from the Gemini API.
 * This function sends a prompt to a backend endpoint (/api/gemini),
 * which then securely calls the Gemini API.
 * @param {string} prompt - The prompt to send to the Gemini model.
 * @returns {Promise<string>} The text response from the model.
 */
async function callGemini(prompt) {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Gemini API Error: ${response.status} ${response.statusText}`, errorBody);
            return "Sorry, the AI is currently unavailable.";
        }
        
        const data = await response.json();
        return data.text;

    } catch (error) {
        console.error('Failed to call Gemini API endpoint:', error);
        return "Sorry, there was an error connecting to the AI.";
    }
}

