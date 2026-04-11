# orchestrator.py
# Routes user input to the correct agent and persists interactions to memory

from agents import witness_agent, analyst_agent, narrator_agent
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError
from memory import store_memory


def _classify_intent_keywords(user_input: str) -> str:
    u = user_input.lower()
    analyst_hits = (
        "clue", "evidence", "analyze", "analysis", "forensic", "lab", "sample",
        "dna", "print", "fiber", "ballistic", "swab",
    )
    witness_hits = (
        "where were", "alibi", "saw you", "did you", "why did", "tell me about",
        "suspect", "witness", "were you", "you were", "know anything",
        "belong to", "is this yours", "your", "whose", "own", "possession",
    )
    if any(w in u for w in analyst_hits):
        return "analyst"
    if any(w in u for w in witness_hits):
        return "witness"
    return "narrator"


def classify_intent(user_input: str) -> str:
    """
    Routes to witness / analyst / narrator.
    Uses the LLM when enabled; otherwise simple keyword routing.
    """
    if not is_live_llm_enabled():
        return _classify_intent_keywords(user_input)

    prompt = f"""You are a routing system for a murder mystery game.
A detective just said: "{user_input}"

Classify which agent should handle this message. Reply with EXACTLY one word:
- witness   → if the detective is questioning a suspect, asking about someone's whereabouts, actions, or if an item belongs to them
- analyst   → if the detective is submitting a clue, piece of evidence, or asking for forensic analysis
- narrator  → if the detective is making a general observation, moving the story forward, or anything else

Reply with only one word. No punctuation."""

    try:
        result = invoke_llm(prompt, "classify_intent").lower()
    except LLMUnavailableError:
        return _classify_intent_keywords(user_input)
    
    for agent in ["witness", "analyst", "narrator"]:
        if agent in result:
            return agent
    return _classify_intent_keywords(user_input)


def orchestrate(user_input: str, case: dict, case_file: str, case_history: str) -> dict:
    intent = classify_intent(user_input)
    updated_case_file = case_file

    # RAG: Store the detective's query in memory
    store_memory(f"Detective: {user_input}", "detective")

    if intent == "witness":
        response = witness_agent(user_input, case)
        agent_used = "🕵️ Witness"
        
        # RAG: Store witness response
        store_memory(f"Witness Response: {response}", "witness")

        narrator_update = narrator_agent(
            f"Detective interrogated witness. Exchange: '{user_input[:80]}...' Reply: '{response[:80]}...'",
            case_file,
        )
        updated_case_file = case_file + "\n" + narrator_update

    elif intent == "analyst":
        response = analyst_agent(user_input, case_history)
        agent_used = "🔬 Analyst"

        # RAG: Store analyst findings
        store_memory(f"Analyst Findings: {response}", "analyst")

        narrator_update = narrator_agent(
            f"Clue submitted for analysis: '{user_input}'. Analyst noted: '{response[:80]}...'",
            case_file,
        )
        updated_case_file = case_file + "\n" + narrator_update

    else:
        response = narrator_agent(user_input, case_file)
        agent_used = "🎙️ Narrator"
        
        # RAG: Store narrative flavor
        store_memory(f"Narrative Log: {response}", "narrator")
        
        updated_case_file = case_file + "\n" + response

    return {
        "agent": agent_used,
        "response": response,
        "updated_case_file": updated_case_file,
    }
