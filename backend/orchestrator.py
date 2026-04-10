# orchestrator.py
# Phase 3 — Routes user input to the correct agent

from agents import witness_agent, analyst_agent, narrator_agent
from llm_client import invoke_llm, is_live_llm_enabled


def _classify_intent_keywords(user_input: str) -> str:
    u = user_input.lower()
    analyst_hits = (
        "clue",
        "evidence",
        "analyze",
        "analysis",
        "forensic",
        "lab",
        "sample",
        "dna",
        "print",
        "fiber",
        "ballistic",
        "swab",
    )
    witness_hits = (
        "where were",
        "alibi",
        "saw you",
        "did you",
        "why did",
        "tell me about",
        "suspect",
        "witness",
        "were you",
        "you were",
        "know anything",
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
- witness   → if the detective is questioning a suspect or asking about someone's whereabouts, actions, or feelings
- analyst   → if the detective is submitting a clue, piece of evidence, or asking for forensic analysis
- narrator  → if the detective is making an observation, moving the story forward, or anything else

Reply with only one word. No punctuation."""

    result = invoke_llm(prompt, "classify_intent").lower()
    for agent in ["witness", "analyst", "narrator"]:
        if agent in result:
            return agent
    raise RuntimeError(f"Invalid routing label from model: {result}")


def orchestrate(user_input: str, case: dict, case_file: str, case_history: str) -> dict:
    intent = classify_intent(user_input)
    updated_case_file = case_file

    if intent == "witness":
        response = witness_agent(user_input, case)
        agent_used = "🕵️ Witness"

        narrator_update = narrator_agent(
            f"Detective interrogated witness. Exchange: '{user_input[:80]}...' Reply hinted: '{response[:80]}...'",
            case_file,
        )
        updated_case_file = case_file + "\n" + narrator_update

    elif intent == "analyst":
        response = analyst_agent(user_input, case_history)
        agent_used = "🔬 Analyst"

        narrator_update = narrator_agent(
            f"Clue submitted for analysis: '{user_input}'. Analyst noted: '{response[:80]}...'",
            case_file,
        )
        updated_case_file = case_file + "\n" + narrator_update

    else:
        response = narrator_agent(user_input, case_file)
        agent_used = "🎙️ Narrator"
        updated_case_file = case_file + "\n" + response

    return {
        "agent": agent_used,
        "response": response,
        "updated_case_file": updated_case_file,
    }


if __name__ == "__main__":
    dummy_case = {
        "victim": {"name": "Marco Delgado", "role": "poker dealer"},
        "suspect_a": {"name": "Veronica Sloane", "motive": "witnessed chip skimming", "alibi": "spa all evening"},
        "suspect_b": {"name": "Danny Ricci", "motive": "owed money", "alibi": "at craps table"},
        "culprit": "Danny Ricci",
        "murder_weapon": "a weighted poker chip sleeve",
        "key_clue": "monogrammed loyalty card found under victim",
    }

    tests = [
        "Where were you when Marco died?",
        "I found a loyalty card near the body. Analyze it.",
        "The investigation deepens as night falls over the Strip.",
    ]

    case_file = "A body was found at the Bellagio. Investigation begins."

    for t in tests:
        print(f"\nInput: {t}")
        result = orchestrate(t, dummy_case, case_file, "")
        print(f"Agent: {result['agent']}")
        print(f"Response: {result['response'][:200]}")
        case_file = result["updated_case_file"]
