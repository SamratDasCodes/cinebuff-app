import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Securely get the API key from Vercel's environment variables
TMDB_API_KEY = os.environ.get("TMDB_API_KEY")
TMDB_API_BASE_URL = "https://api.themoviedb.org/3"

@app.route('/api/tmdb', methods=['POST'])
def handle_tmdb_request():
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB API key is not configured on the server."}), 500

    try:
        data = request.get_json()
        endpoint = data.get('endpoint')
        params = data.get('params', {})

        if not endpoint:
            return jsonify({"error": "No endpoint provided"}), 400
        
        # Add the secret API key to the parameters for the TMDB request
        params['api_key'] = TMDB_API_KEY
        
        # Make the request to the actual TMDB API
        response = requests.get(f"{TMDB_API_BASE_URL}/{endpoint}", params=params)
        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)

        return jsonify(response.json())

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        return jsonify({"error": f"Failed to fetch from TMDB: {http_err}"}), http_err.response.status_code
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500
