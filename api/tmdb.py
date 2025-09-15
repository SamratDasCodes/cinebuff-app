import os
import requests

TMDB_API_KEY = os.environ.get("TMDB_API_KEY")
TMDB_API_BASE_URL = "https://api.themoviedb.org/3"

def handler(request):
    if not TMDB_API_KEY:
        return {
            "statusCode": 500,
            "body": '{"error": "TMDB API key is not configured on the server."}',
            "headers": {"Content-Type": "application/json"}
        }

    try:
        data = request.get_json()
        endpoint = data.get('endpoint')
        params = data.get('params', {})

        if not endpoint:
            return {
                "statusCode": 400,
                "body": '{"error": "No endpoint provided"}',
                "headers": {"Content-Type": "application/json"}
            }

        params['api_key'] = TMDB_API_KEY
        response = requests.get(f"{TMDB_API_BASE_URL}/{endpoint}", params=params)
        response.raise_for_status()

        return {
            "statusCode": 200,
            "body": response.text,
            "headers": {"Content-Type": "application/json"}
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": '{"error": "Internal server error"}',
            "headers": {"Content-Type": "application/json"}
        }
