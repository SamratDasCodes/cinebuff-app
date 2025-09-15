import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Get the TMDB API key from Vercel environment variables
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
TMDB_API_BASE_URL = 'https://api.themoviedb.org/3'

# The route is now just '/', because Vercel handles the /api/tmdb part
# based on the file's location. This is a more robust pattern.
@app.route('/', methods=['POST'])
def handler():
    """
    Acts as a secure proxy to the TMDB API. The frontend sends requests here,
    and this function adds the secret API key before fetching from TMDB.
    """
    if not TMDB_API_KEY:
        print("ERROR: TMDB_API_KEY environment variable not set.")
        return jsonify({"error": "TMDB API key is not configured on the server."}), 500

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is missing or not JSON."}), 400

        endpoint = data.get('endpoint')
        params = data.get('params', {})

        if not endpoint:
            return jsonify({"error": "API 'endpoint' is required."}), 400

        # Securely add the API key on the server
        params['api_key'] = TMDB_API_KEY

        response = requests.get(f"{TMDB_API_BASE_URL}/{endpoint}", params=params)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        return jsonify(response.json())

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP Error from TMDB: {http_err}")
        return jsonify({"error": str(http_err)}), http_err.response.status_code
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")
        return jsonify({"error": "An unexpected server error occurred."}), 500

