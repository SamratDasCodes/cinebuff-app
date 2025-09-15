// This file no longer contains any API keys. It now securely calls your own backend endpoints.

/**
 * Securely fetches data from The Movie Database (TMDB) via our own backend proxy.
 * @param {string} endpoint - The TMDB API endpoint to call (e.g., 'trending/movie/week').
 * @param {Object} [params={}] - An object of query parameters to add to the request.
 * @returns {Promise<Object|null>} The JSON response from the API, or null on error.
 */
async function fetchFromTMDb(endpoint, params = {}) {
    try {
        // All TMDB requests are now proxied through our own serverless function
        // to keep the API key secure.
        const response = await fetch('/api/tmdb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint, params })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`TMDB Proxy Error: ${response.status}`, errorBody.error);
            return null;
        }
        return response.json();
    } catch (error) {
        console.error('Failed to fetch from TMDB proxy:', error);
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
        // This makes a request to the gemini.py serverless function
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

