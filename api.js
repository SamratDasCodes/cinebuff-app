/**
 * Fetches data from our secure TMDB proxy function.
 * @param {string} endpoint - The TMDB API endpoint to call (e.g., 'trending/movie/week').
 * @param {Object} [params={}] - An object of query parameters to add to the request.
 * @returns {Promise<Object|null>} The JSON response from the API, or null on error.
 */
async function fetchFromTMDb(endpoint, params = {}) {
    try {
        // This makes a POST request to our own backend function (/api/tmdb)
        // which then securely calls the real TMDB API.
        const response = await fetch('/api/tmdb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint, params })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error(`Proxy API Error: ${response.status} ${response.statusText}`, errorBody.error);
            return null;
        }
        
        return response.json();

    } catch (error) {
        console.error('Failed to fetch from our TMDB proxy:', error);
        return null;
    }
}


/**
 * Calls a serverless function to get a response from an AI API provider.
 * This function sends a prompt to a backend endpoint (/api/openrouter),
 * which then securely calls the OpenRouter API.
 * @param {string} prompt - The prompt to send to the AI model.
 * @returns {Promise<string>} The text response from the model.
 */
async function callAI(prompt) {
    try {
        // This makes a request to the openrouter.js serverless function
        const response = await fetch('/api/openrouter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`AI API Error: ${response.status} ${response.statusText}`, errorBody);
            return "Sorry, the AI is currently unavailable.";
        }
        
        const data = await response.json();
        return data.text;

    } catch (error) {
        console.error('Failed to call AI API endpoint:', error);
        return "Sorry, there was an error connecting to the AI.";
    }
}
