import os
import sys
import time
import requests
from typing import List
from datetime import datetime
import json

# LangChain/Agent Imports
from langchain.agents import Tool, initialize_agent
from langchain.memory import ConversationBufferMemory
from langchain.llms.base import LLM
from langchain.schema import LLMResult
from pydantic import BaseModel, Field

# Flask Imports
from flask import Flask, request, jsonify
from flask_cors import CORS 

# ----------------------------------------------------
# 1. Configuration & Setup
# ----------------------------------------------------
app = Flask(__name__)
CORS(app) 

# --- Gemini API Key ---
# 🚨 IMPORTANT: Replace this placeholder with your actual key or use environment variable.
# Using a placeholder here based on the agent code, but environment variable is BEST.
API_KEY = os.environ.get("GOOGLE_API_KEY", "AIzaSyCM-H7eKRrEy5yJhBLtiNhHp6g7jfo40bc") 
if not API_KEY:
    print("Error: The GOOGLE_API_KEY environment variable is not set.")
    sys.exit(1)

# --- n8n Webhook Configuration (Proxy Target) ---
N8N_WEBHOOK_URL = os.environ.get(
    "N8N_WEBHOOK_URL",
    "http://localhost:5678/webhook/your_unique_n8n_path_here" # REPLACE THIS URL
)

# --- In-memory Data (from snippets 1 & 3) ---
tickets = []
ticket_id_counter = 1


# ----------------------------------------------------
# 2. Agent Helper Functions (LangChain Wrapper & Tools)
# ----------------------------------------------------

# --- A. Gemini LLM Wrapper (From agentic_support.py) ---
class GeminiLLM(LLM, BaseModel):
    api_key: str = Field(API_KEY, description="Your Gemini API key")

    @property
    def _llm_type(self) -> str:
        return "gemini"

    def _call(self, prompt: str, stop=None) -> str:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        headers = {"Content-Type": "application/json", "X-goog-api-key": self.api_key}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        
        # Reduced retry logic for clean integration
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            # Simplified parsing
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            print(f"Gemini API call failed: {e}")
            return "API_ERROR"

    def _generate(self, prompts, stop=None):
        texts = [self._call(prompt, stop=stop) for prompt in prompts]
        return LLMResult(generations=[[{"text": t}] for t in texts])

# --- B. Tools (Modified to use n8n proxy logic) ---

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

def send_email_action(email: str, subject: str, body: str) -> str:
    """Sends an email to a customer (Moderate Priority) via n8n."""
    payload = {"type": "email_moderate", "email": email, "subject": subject, "body": body}
    resp, status = trigger_n8n_workflow(payload)
    if status < 400:
        return f"ACTION_TAKEN: Email to {email} successfully triggered via n8n."
    return f"ACTION_FAILED: Email to {email} FAILED: {resp.get('error', 'n8n error')}"

def escalate_to_call_action(ticket_id: str, reason: str) -> str:
    """Immediately escalates a ticket for a live agent phone call (High Priority) via n8n."""
    payload = {"type": "call_high", "ticket_id": ticket_id, "reason": reason}
    resp, status = trigger_n8n_workflow(payload)
    if status < 400:
        return f"ACTION_TAKEN: Ticket {ticket_id} escalated for call successfully triggered via n8n."
    return f"ACTION_FAILED: Call escalation for {ticket_id} FAILED: {resp.get('error', 'n8n error')}"

def classify_priority_tool(query: str) -> str:
    """Tool to determine the priority (High, Moderate, Normal) of the customer query."""
    classification_llm = GeminiLLM(api_key=API_KEY)
    classification_prompt = f"""
    Analyze the following customer query and classify its priority.
    - 'High': Critical issues.
    - 'Moderate': Non-critical issues.
    - 'Normal': Simple questions.
    QUERY: "{query}"
    Respond ONLY with the single word: High, Moderate, or Normal.
    """
    priority_result = classification_llm._call(classification_prompt)
    priority = priority_result.strip().lower().capitalize()
    return priority if priority in ['High', 'Moderate', 'Normal'] else 'Normal' 

tools = [
    Tool(
        name="Priority Classifier",
        func=classify_priority_tool,
        description="ALWAYS use this tool FIRST to determine the priority (High, Moderate, Normal) of the customer's request. Input is the full customer query."
    ),
    Tool(
        name="Send Email",
        func=send_email_action,
        description="Use this to send a non-urgent email reply to a customer (Moderate Priority). Requires email, subject, and body."
    ),
    Tool(
        name="Escalate to Call",
        func=escalate_to_call_action,
        description="Use this to escalate a critical issue for an immediate phone call (High Priority). Requires ticket_id and reason."
    )
]

# --- C. Initialize Agent ---
gemini_llm = GeminiLLM(api_key=API_KEY)
memory = ConversationBufferMemory(memory_key="chat_history")
agent = initialize_agent(
    tools=tools,
    llm=gemini_llm,
    agent="zero-shot-react-description",
    memory=memory,
    max_iterations=5, 
    verbose=True,
    handle_parsing_errors=True
)

# ----------------------------------------------------
# 3. Flask Routes (Unified API Gateway)
# ----------------------------------------------------

# --- A. Core Application Logic (Tickets, Health Check) ---

@app.route("/", methods=["GET"])
def home():
    """Health check route."""
    return jsonify({"message": "Flask backend is running on port 5000! 🚀"}), 200

@app.route("/tickets", methods=["GET"])
def get_tickets():
    """GET all tickets."""
    return jsonify(tickets), 200

@app.route("/tickets", methods=["POST"])
def create_ticket():
    """POST a new ticket."""
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

# --- B. LangChain Agent Route ---

@app.route('/api/agent_route', methods=['POST'])
def run_agent_route():
    """Frontend calls this to run the full priority-based agent."""
    data = request.json
    required_fields = ['customer_email', 'ticket_id', 'query']
    if not all(field in data for field in required_fields):
        return jsonify({"error": f"Missing one of the required fields: {required_fields}"}), 400

    customer_email = data['customer_email']
    ticket_id = data['ticket_id']
    customer_query = data['query']

    # --- Construct the Agent Prompt ---
    # This guides the agent to use the classification tool first, then act.
    full_prompt = f"""
    TICKET_ID: {ticket_id}
    CUSTOMER_EMAIL: {customer_email}
    
    Customer Query: {customer_query}
    
    INSTRUCTIONS: 
    1. FIRST, use the 'Priority Classifier' tool to classify the Customer Query as High, Moderate, or Normal.
    2. Based on the classification:
       - If 'High', use the 'Escalate to Call' tool with the TICKET_ID and a brief REASON.
       - If 'Moderate', use the 'Send Email' tool. The subject should be a summary of the issue, and the body should be an empathetic, helpful response.
       - If 'Normal', skip all tools and formulate a helpful final answer (this is the 'Chat' reply).
    """

    print(f"\n--- Running Agent for Ticket {ticket_id} ---")
    try:
        agent_result = agent.run(full_prompt)
    except Exception as e:
        print(f"Agent failed to run: {e}")
        return jsonify({"error": "Agent execution failed", "details": str(e)}), 500

    # The agent's result is either the final chat message or the action confirmation.
    return jsonify({"status": "Success", "agent_response": agent_result}), 200


# --- C. Direct Orchestration Proxy (from snippet 2) ---

@app.route('/api/start_orchestration', methods=['POST'])
def start_orchestration():
    """Frontend calls this to trigger an n8n workflow directly."""
    try:
        input_data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    if not input_data:
        return jsonify({"error": "Missing data in request body"}), 400

    # Use the n8n proxy function
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
