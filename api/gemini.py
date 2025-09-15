import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Get the Gemini API key from Vercel environment variables
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Configure the genai library with the key if it exists
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# The route is now just '/', because Vercel handles the /api/gemini part
# based on the file's location.
@app.route('/', methods=['POST'])
def handler():
    """
    Acts as a secure proxy to the Google Gemini API.
    """
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY environment variable not set.")
        return jsonify({"error": "Gemini API key is not configured on the server."}), 500

    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({"error": "Request body must be JSON with a 'prompt' key."}), 400

        prompt = data.get('prompt')
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)

        # Check if the response has the 'text' attribute
        if hasattr(response, 'text'):
            return jsonify({"text": response.text})
        else:
            # Handle cases where the API might have blocked the response or other issues
            print(f"Gemini response did not contain text. Response: {response.prompt_feedback}")
            return jsonify({"error": "Failed to get a valid response from the AI model."}), 500

    except Exception as e:
        print(f"An unexpected error occurred in Gemini proxy: {str(e)}")
        return jsonify({"error": "An unexpected server error occurred."}), 500
