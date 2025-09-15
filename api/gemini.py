import os
import json
import google.generativeai as genai

gemini_key = os.environ.get("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

def handler(request):
    if not gemini_key:
        return {
            "statusCode": 500,
            "body": '{"error": "Gemini API key is not configured"}',
            "headers": {"Content-Type": "application/json"}
        }

    try:
        data = request.get_json()
        prompt = data.get('prompt')

        if not prompt:
            return {
                "statusCode": 400,
                "body": '{"error": "No prompt provided"}',
                "headers": {"Content-Type": "application/json"}
            }

        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)

        return {
            "statusCode": 200,
            "body": json.dumps({"text": response.text}),
            "headers": {"Content-Type": "application/json"}
        }

    except Exception:
        return {
            "statusCode": 500,
            "body": '{"error": "Internal server error"}',
            "headers": {"Content-Type": "application/json"}
        }

