import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get the TMDB API key from Vercel environment variables
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'

@app.route('/api/tmdb', methods=['POST'])
def handler():
    """
    This function acts as a secure proxy to the TMDB API.
    It receives the endpoint and parameters from the frontend,
    adds the secret API key, and forwards the request to TMDB.
    """
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY is not configured on the server."}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is missing or not JSON."}), 400

        endpoint = data.get('endpoint')
        params = data.get('params', {})

        if not endpoint:
            return jsonify({"error": "API 'endpoint' is required in the request body."}), 400

        # Add the API key to the parameters
        # This is done securely on the server, never exposed to the client
        params['api_key'] = TMDB_API_KEY

        # Make the request to the actual TMDB API
        response = requests.get(f"{TMDB_API_BASE_URL}/{endpoint}", params=params)

        # Raise an exception if the request failed (e.g., 401, 404)
        response.raise_for_status()

        # Return the JSON data from TMDB back to the frontend
        return jsonify(response.json())

    except requests.exceptions.HTTPError as http_err:
        # Handle HTTP errors from TMDB (like invalid key or not found)
        return jsonify({"error": f"TMDB API Error: {http_err}", "status_code": http_err.response.status_code}), http_err.response.status_code
    except requests.exceptions.RequestException as req_err:
        # Handle other network errors (like connection issues)
        return jsonify({"error": f"Network error connecting to TMDB: {req_err}"}), 503
    except Exception as e:
        # Handle any other unexpected errors
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

# This part is for local development testing and is not used by Vercel
if __name__ == '__main__':
    app.run(debug=True)
