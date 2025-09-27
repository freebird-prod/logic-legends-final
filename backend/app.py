import os
import sys
from typing import List
import google.generativeai as genai
import requests 
from flask import Flask, request, jsonify
from flask_cors import CORS 
from datetime import datetime

# ----------------------------------------------------
# 1. Configuration & Setup
# ----------------------------------------------------
app = Flask(__name__)
CORS(app) 

# --- Gemini AI Configuration ---
# 🚨 WARNING: HARDCODING KEY FOR TESTING. Use environment variables in production.
API_KEY = "AIzaSyDBp7egsp8Jl7mv4U2EVIoVjg44LYwtEWY" 
if not API_KEY: # This check is now redundant but kept for structure
    print("Error: API Key is missing.")
    sys.exit(1)
genai.configure(api_key=API_KEY)

# --- n8n Webhook Configuration ---
N8N_WEBHOOK_URL = os.environ.get(
    "N8N_WEBHOOK_URL",
    "http://localhost:5678/webhook/your_unique_n8n_path_here" 
)

# --- In-memory ticket storage ---
tickets = []
ticket_id_counter = 1
past_complaints = [
    "Payment deducted but subscription not activated",
    "App crashes when opening dashboard",
    "My account was charged twice for the same month.",
]


# ----------------------------------------------------
# 2. Helper Functions (Gemini & n8n Proxy)
# ----------------------------------------------------
# (NO CHANGES HERE - functions remain the same)
def call_gemini(prompt: str) -> str:
    """Calls the Gemini API (Core AI Logic)."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        generation_config = genai.types.GenerationConfig(temperature=0)
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text.strip() if response.parts else "Could not generate a response."
    except Exception as e:
        print(f"An API error occurred: {e}")
        return "An error occurred while communicating with the AI model."

def is_duplicate(new_complaint: str, past: List[str]) -> bool:
    """Checks for semantic duplicates using Gemini."""
    prompt = f"""
Analyze if the 'New Complaint' describes the same core issue as any of the 'Past Complaints'.
Past Complaints: {past}
New Complaint: "{new_complaint}"
Is the new complaint a duplicate? Answer only with 'Yes' or 'No'.
"""
    return call_gemini(prompt).lower() == "yes"

def classify_priority(complaint: str) -> str:
    """Classifies priority using Gemini."""
    prompt = f"Classify the priority of this complaint as 'High' or 'Moderate'. Answer only with the single word 'High' or 'Moderate'. Complaint: \"{complaint}\""
    return call_gemini(prompt)

def categorize_issue(complaint: str) -> str:
    """Categorizes issue using Gemini."""
    prompt = f"Categorize this complaint into one of the following types: Billing, Technical Issue, Product Query, or Feedback. Answer only with one of these four options. Complaint: \"{complaint}\""
    return call_gemini(prompt)

def process_complaint(complaint: str):
    """The core AI processing pipeline."""
    if is_duplicate(complaint, past_complaints):
        return {"status": "duplicate", "message": "Duplicate complaint detected."}

    priority = classify_priority(complaint)
    category = categorize_issue(complaint)
    
    past_complaints.append(complaint)

    return {
        "status": "processed",
        "priority": priority,
        "category": category
    }

def trigger_n8n_workflow(data: dict):
    """Sends a POST request to the n8n Webhook URL (The Proxy)."""
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(N8N_WEBHOOK_URL, json=data, headers=headers, timeout=30)
        response.raise_for_status() 
        return response.json(), response.status_code
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with n8n: {e}")
        return {"error": "Failed to trigger n8n workflow", "details": str(e)}, 503

# ----------------------------------------------------
# 3. Flask Routes (Unified API Gateway)
# ----------------------------------------------------
# (NO CHANGES HERE - routes remain the same)
@app.route("/", methods=["GET"])
def home():
    """Health check route."""
    return jsonify({"message": "Flask backend is running on port 5000! 🚀"}), 200

@app.route("/tickets", methods=["GET"])
def get_tickets():
    """GET all tickets (example of core data route)."""
    return jsonify(tickets), 200

@app.route("/tickets", methods=["POST"])
def create_ticket():
    """POST a new ticket (example of core data route)."""
    global ticket_id_counter
    data = request.json
    if not data.get("title"):
         return jsonify({"error": "Title is required"}), 400

    new_ticket = {
        "id": ticket_id_counter,
        "title": data["title"],
        "createdAt": datetime.now().isoformat(),
    }
    tickets.append(new_ticket)
    ticket_id_counter += 1

    return jsonify(new_ticket), 201

@app.route('/handle_complaint', methods=['POST'])
def handle_complaint_route():
    """
    Frontend calls this route.
    Flask executes Gemini AI logic, then conditionally routes to n8n if needed.
    """
    data = request.json
    if not data or 'complaint' not in data:
        return jsonify({"error": "Request body must contain 'complaint'"}), 400

    complaint_text = data['complaint']
    result = process_complaint(complaint_text)

    if result.get('status') == 'processed' and result.get('priority', '').lower() == 'high':
        print("🚨 High Priority detected. Triggering n8n for agent escalation.")
        
        n8n_payload = {
            "source": "AI Escalation",
            "complaint": complaint_text,
            "category": result.get("category")
        }
        
        n8n_resp, n8n_status = trigger_n8n_workflow(n8n_payload)
        
        result["escalation_status"] = "N8N Triggered" if n8n_status < 400 else "N8N Failed"
        result["n8n_response"] = n8n_resp

    return jsonify(result)

@app.route('/api/start_orchestration', methods=['POST'])
def start_orchestration():
    """
    Frontend calls this route to trigger an n8n workflow directly, bypassing AI logic.
    """
    try:
        input_data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    if not input_data:
        return jsonify({"error": "Missing data in request body"}), 400

    n8n_response, status_code = trigger_n8n_workflow(input_data)
    
    if status_code >= 400:
        return jsonify({"message": "Orchestration trigger failed", "n8n_error": n8n_response.get("error", "Unknown error")}), 500

    return jsonify({"message": "Orchestration successfully initiated via n8n", "n8n_status": n8n_response}), 202 


# ----------------------------------------------------
# 4. Run Server
# ----------------------------------------------------
if __name__ == "__main__":
    print("Starting Unified Flask API Gateway on port 5000...")
    app.run(debug=True, port=5000)