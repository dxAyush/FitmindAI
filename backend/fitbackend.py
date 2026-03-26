import sqlite3
import json
import os
import time
import requests
import jwt
from datetime import datetime, timedelta, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from collections import defaultdict

# Load API key from .env file instead of hardcoding
load_dotenv()
JWT_SECRET = os.getenv('JWT_SECRET', 'super_secret_fitmind_key_123')

app = Flask(__name__)
# Enable CORS to allow the frontend HTML file to interact freely with this API
CORS(app)

DB_FILE = 'fitmind_data.db'

# ─── Simple In-Memory Rate Limiter ───
rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60   # seconds
RATE_LIMIT_MAX = 15       # max requests per window

def is_rate_limited(ip):
    """Check if an IP has exceeded the rate limit."""
    now = time.time()
    # Clean old entries
    rate_limit_store[ip] = [t for t in rate_limit_store[ip] if now - t < RATE_LIMIT_WINDOW]
    if len(rate_limit_store[ip]) >= RATE_LIMIT_MAX:
        return True
    rate_limit_store[ip].append(now)
    return False


def init_db():
    with sqlite3.connect(DB_FILE) as conn:
        c = conn.cursor()
        # Create users table
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        conn.commit()

# Initialize DB when the script runs
init_db()

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    # Input length validation
    if len(name) > 100 or len(email) > 150 or len(password) > 200:
        return jsonify({"error": "Input too long"}), 400

    # Hash the password for safety
    hashed_password = generate_password_hash(password)

    try:
        with sqlite3.connect(DB_FILE) as conn:
            c = conn.cursor()
            c.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, hashed_password))
            conn.commit()
            
        # Generate JWT token
        token = jwt.encode({
            'email': email,
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({"success": True, "message": "User registered successfully!", "name": name, "token": token}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "This email is already registered."}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Missing email or password"}), 400

    try:
        with sqlite3.connect(DB_FILE) as conn:
            c = conn.cursor()
            c.execute('SELECT name, password FROM users WHERE email = ?', (email,))
            user = c.fetchone()

        if user:
            stored_name, stored_hash = user
            if check_password_hash(stored_hash, password):
                # Generate JWT token
                token = jwt.encode({
                    'email': email,
                    'exp': datetime.now(timezone.utc) + timedelta(days=7)
                }, JWT_SECRET, algorithm='HS256')
                
                return jsonify({"success": True, "message": "Login successful!", "name": stored_name, "token": token}), 200
            else:
                return jsonify({"error": "Invalid password."}), 401
        else:
            return jsonify({"error": "User with this email not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def api_chat():
    # Require authentication via JWT
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized. Please log in first."}), 401
        
    token = auth_header.split(' ')[1]
    try:
        jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Please log in again."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid authentication token."}), 401

    # Rate limiting
    client_ip = request.remote_addr
    if is_rate_limited(client_ip):
        return jsonify({"error": "Rate limit exceeded. Please wait a minute before trying again."}), 429

    data = request.get_json()
    if not data or not data.get('prompt'):
        return jsonify({"error": "No prompt provided"}), 400

    prompt = data.get('prompt')

    # Input length validation
    if len(prompt) > 5000:
        return jsonify({"error": "Prompt too long. Maximum 5000 characters."}), 400

    # Load API key from environment variable
    groq_key = os.getenv('GROQ_API_KEY')
    if not groq_key:
        return jsonify({"error": "Server misconfigured: GROQ_API_KEY not set. Add it to your .env file."}), 500

    url = "https://api.groq.com/openai/v1/chat/completions"

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {groq_key}"
    }

    try:
        print(f"Sending prompt to Groq API (Llama 3): {prompt[:50]}...")
        response = requests.post(url, json=payload, headers=headers)
        if response.ok:
            resp_data = response.json()
            try:
                text = resp_data['choices'][0]['message']['content']
                return jsonify({"response": text}), 200
            except (KeyError, IndexError):
                print(f"Malformed Groq Response: {json.dumps(resp_data)}")
                return jsonify({"error": "Received malformed response from Groq API"}), 502
        else:
            if response.status_code == 401:
                return jsonify({"error": "Groq Error: Invalid API Key. Please update your .env file."}), 401
            if response.status_code == 429:
                return jsonify({"error": "Groq Error: Rate Limit Exceeded. Please try again later."}), 429
            print(f"Groq API Error {response.status_code}: {response.text}")
            return jsonify({"error": f"Groq API Error: {response.text}"}), response.status_code
    except Exception as e:
        print(f"Server Internal Error: {str(e)}")
        return jsonify({"error": f"Failed to connect to Groq API: {str(e)}"}), 500

@app.route('/api/analyze-form', methods=['POST'])
def analyze_form():
    # Require authentication via JWT
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized. Please log in first."}), 401

    token = auth_header.split(' ')[1]
    try:
        jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Please log in again."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid authentication token."}), 401

    # Rate limiting
    client_ip = request.remote_addr
    if is_rate_limited(client_ip):
        return jsonify({"error": "Rate limit exceeded. Please wait a minute."}), 429

    data = request.get_json()
    if not data or not data.get('frame') or not data.get('exercise'):
        return jsonify({"error": "Missing frame image or exercise type"}), 400

    exercise = data.get('exercise')
    frame_b64 = data.get('frame')  # base64 encoded JPEG image

    groq_key = os.getenv('GROQ_API_KEY')
    if not groq_key:
        return jsonify({"error": "Server misconfigured: GROQ_API_KEY not set."}), 500

    url = "https://api.groq.com/openai/v1/chat/completions"

    prompt_text = f"""You are an expert fitness coach analyzing a photo of someone doing a "{exercise.replace('_', ' ')}".

Look carefully at the person's body position and posture in the image.

Respond ONLY with a valid JSON object. No markdown, no explanation outside the JSON.

{{
  "score": <integer 0-100 based on what you actually see>,
  "good_point": "<one short sentence about what they are doing well>",
  "fix": "<one short sentence about the main thing to fix>",
  "steps": ["<step 1 to fix it>", "<step 2 to fix it>", "<step 3 to fix it>"],
  "safety_note": "<one short sentence safety reminder for this exercise>"
}}

Be specific to what you see, not generic. If the image is blurry or unclear, still give your best assessment and note it in the fix field."""

    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{frame_b64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt_text
                    }
                ]
            }
        ],
        "temperature": 0.4,
        "max_tokens": 600
    }

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f"Bearer {groq_key}"
    }

    try:
        print(f"Sending frame to Groq Vision API for exercise: {exercise}")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        if response.ok:
            resp_data = response.json()
            text = resp_data['choices'][0]['message']['content']
            # Try to extract JSON from the response
            import re
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                analysis = json.loads(json_match.group())
                return jsonify({"success": True, "analysis": analysis}), 200
            else:
                return jsonify({"error": "AI returned unexpected format", "raw": text}), 502
        else:
            print(f"Groq Vision Error {response.status_code}: {response.text}")
            return jsonify({"error": f"Vision API error: {response.text}"}), response.status_code
    except Exception as e:
        print(f"Form analysis error: {str(e)}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"FitMind API Server starting on http://0.0.0.0:{port}")
    print(f"Data will be stored locally in: {DB_FILE}")
    print(f"API Key loaded: {'✅ Yes' if os.getenv('GROQ_API_KEY') else '❌ No — add GROQ_API_KEY to .env!'}")
    app.run(host='0.0.0.0', port=port, debug=False)

