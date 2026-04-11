# orchestrator.py
from agents import witness_agent, analyst_agent, narrator_agent, auditor_agent, AuditResult
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError
from memory import store_memory

def _classify_intent_keywords(user_input: str) -> str:
    u = user_input.lower()
    analyst_hits = ("clue", "evidence", "analyze", "analysis", "forensic", "lab", "sample", "dna", "print", "fiber", "ballistic", "swab")
    witness_hits = ("where were", "alibi", "saw you", "did you", "why did", "tell me about", "suspect", "witness", "were you", "you were", "know anything")
    if any(w in u for w in analyst_hits): return "analyst"
    if any(w in u for w in witness_hits): return "witness"
    return "narrator"

def classify_intent(user_input: str) -> str:
    if not is_live_llm_enabled(): return _classify_intent_keywords(user_input)
    prompt = f"Classify intent: '{user_input}'. Reply with EXACTLY one word: witness, analyst, or narrator."
    try:
        result = invoke_llm(prompt, "classify_intent").lower()
    except LLMUnavailableError:
        return _classify_intent_keywords(user_input)
    for agent in ["witness", "analyst", "narrator"]:
        if agent in result: return agent
    return _classify_intent_keywords(user_input)

def orchestrate(user_input: str, case: dict, case_file: str, case_history: str) -> dict:
    intent = classify_intent(user_input)
    updated_case_file = case_file
    reasoning = ""
    audit_results: AuditResult = AuditResult(contradiction=False, explanation="")

    # RAG: Store query
    store_memory(f"Detective: {user_input}", "detective")

    if intent == "witness":
        # PASS 1: Generate initial response
        agent_res = witness_agent(user_input, case)
        response = agent_res["response"]
        reasoning = agent_res["reasoning"]
        agent_used = "🕵️ Witness"
        
        # AUDIT: Run the forensic auditor
        audit_results = auditor_agent(user_input, response, case)
        
        # PASS 2: Agentic Confrontation Loop
        if audit_results.contradiction:
            # Witness is lying or caught in a contradiction; give them a chance to "re-think"
            rethink_res = witness_agent(user_input, case, rethink_instruction=audit_results.explanation)
            response = rethink_res["response"]
            reasoning = f"[CONTRADICTION DETECTED] {audit_results.explanation}\n\n[RETHINKING] {rethink_res['reasoning']}"
        
        store_memory(f"Witness Response: {response}", "witness")
        narrator_update = narrator_agent(f"Interrogated witness. Response: '{response[:80]}...'", case_file)
        updated_case_file = case_file + "\n" + narrator_update

    elif intent == "analyst":
        agent_res = analyst_agent(user_input, case_history)
        response = agent_res["response"]
        reasoning = agent_res["reasoning"]
        agent_used = "🔬 Analyst"

        store_memory(f"Analyst Findings: {response}", "analyst")
        narrator_update = narrator_agent(f"Lab analysis complete: {response[:80]}...", case_file)
        updated_case_file = case_file + "\n" + narrator_update

    else:
        response = narrator_agent(user_input, case_file)
        agent_used = "🎙️ Narrator"
        reasoning = "Generating narrative flavor and updating case log."
        store_memory(f"Narrative Log: {response}", "narrator")
        updated_case_file = case_file + "\n" + response

    return {
        "agent": agent_used,
        "response": response,
        "reasoning": reasoning,
        "audit": audit_results.model_dump(),
        "updated_case_file": updated_case_file,
    }
