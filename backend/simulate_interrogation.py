# simulate_interrogation.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import _new_case_payload
from orchestrator import orchestrate
from memory import collection
import json

def run_simulation():
    print("--- STARTING FORENSIC SIMULATION ---")
    
    # 1. Initialize Case
    payload = _new_case_payload()
    case = payload['case']
    case_file = payload['case_file']
    print(f"\n[CASE OPENED]: {case_file}")
    
    turns = [
        "I found a broken red poker chip near the body. Analyze it.",
        "The casino lights are quite bright tonight, aren't they?",
        "Ask the suspect: Does this red poker chip belong to you? I saw it in your pocket earlier."
    ]
    
    case_history = ""
    
    for i, user_input in enumerate(turns):
        print(f"\nTURN {i+1} | DETECTIVE: {user_input}")
        
        result = orchestrate(user_input, case, case_file, case_history)
        
        print(f"AGENT: {result['agent']}")
        print(f"RESPONSE: {result['response']}")
        
        case_file = result['updated_case_file']
        case_history += f" Turn {i+1}: {user_input} -> {result['response']}."
        
        # Check memory count
        print(f"DEBUG: Memory records so far: {collection.count()}")

    print("\n--- SIMULATION COMPLETE ---")

if __name__ == "__main__":
    try:
        run_simulation()
    except Exception as e:
        print(f"Simulation failed: {e}")
