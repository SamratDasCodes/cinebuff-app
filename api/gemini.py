import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# This is the Vercel entry point for the /api/gemini endpoint
app = Flask(__name__)
CORS(app) # Allow cross-origin requests

# Configure the Gemini API key from the secure environment variable
try:
    # Vercel will make the GEMINI_API_KEY available here
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        genai.configure(api_key=gemini_key)
    else:
        print("GEMINI_API_KEY environment variable not found.")
except Exception as e:
    print(f"Error configuring Gemini: {e}")

@app.route('/api/gemini', methods=['POST'])
def handle_gemini_request():
    if not os.environ.get("GEMINI_API_KEY"):
        return jsonify({"error": "Gemini API key is not configured on the server."}), 500

    try:
        data = request.get_json()
        prompt = data.get('prompt')

        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        # Initialize the model and generate content
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)

        return jsonify({"text": response.text})

    except Exception as e:
        print(f"An error occurred during Gemini API call: {e}")
        return jsonify({"error": "An internal server error occurred while contacting the AI model."}), 500

