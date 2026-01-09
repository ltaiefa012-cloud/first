from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import google.generativeai as genai

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyCrFT1Q_GcKIEr8835-s7La06Afngk5bUA"  
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")

# Flask App Setup
app = Flask(__name__)
CORS(app) 

# Load knowledge.json safely
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
knowledge_file = os.path.join(BASE_DIR, "knowledge.json")

with open(knowledge_file, "r", encoding="utf-8") as f:
    knowledge = json.load(f)

def build_context():
    context = (
        "You are a professional AI assistant for ABBK Physicwork (EMWorks Tunisia).\n"
        "Answer ONLY using the information below.\n\n"
    )

    for key, value in knowledge.items():
        if isinstance(value, list):
            context += f"{key.upper()}:\n"
            for item in value:
                context += f"- {item}\n"
            context += "\n"
        elif isinstance(value, dict):
            context += f"{key.upper()}:\n"
            for k, v in value.items():
                context += f"{k}: {v}\n"
            context += "\n"
        else:
            context += f"{key.upper()}:\n{value}\n\n"

    return context

# Chat API Endpoint
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"response": "Please enter a valid question."})

        prompt = build_context() + f"User question: {user_message}"

        response = model.generate_content(prompt)

        return jsonify({
            "response": response.text
        })

    except Exception as e:
        return jsonify({
            "response": f"Server error: {str(e)}"
        }), 500

# Run Server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)