# orchestrator.py
# Phase 3 — Routes user input to the correct agent
# Uses LLM-based intent classification for true agentic routing

import os
from langchain_groq import ChatGroq
llm = ChatGroq(
    model="mixtral-8x7b-32768",
    api_key=os.environ.get("GROQ_API_KEY")
)
from agents import witness_agent, analyst_agent, narrator_agent


def classify_intent_keyword(user_input: str) -> str:
    """Fast deterministic intent routing with zero LLM latency."""
    ui_lower = user_input.lower()
    if any(w in ui_lower for w in ["ask", "question", "where", "did you", "were you", "tell me", "who are", "why did", "suspect"]):
        return "witness"
    if any(w in ui_lower for w in ["clue", "evidence", "found", "analyze", "check", "examine", "lab", "forensic"]):
        return "analyst"
    return "narrator"


def classify_intent_llm(user_input: str) -> str:
    """
    Uses a small LLM call to classify the user's intent.
    Returns one of: 'witness', 'analyst', 'narrator'
    """
    prompt = f"""You are a routing system for a murder mystery game.
A detective just said: "{user_input}"

Classify which agent should handle this message. Reply with EXACTLY one word:
- witness   → if the detective is questioning a suspect or asking about someone's whereabouts, actions, or feelings
- analyst   → if the detective is submitting a clue, piece of evidence, or asking for forensic analysis
- narrator  → if the detective is making an observation, moving the story forward, or anything else

Reply with only one word. No punctuation."""

    try:
        result = llm.invoke(prompt).strip().lower()
        # Clean up in case LLM adds punctuation or extra words
        for agent in ["witness", "analyst", "narrator"]:
            if agent in result:
                return agent
    except Exception:
        pass

    return classify_intent_keyword(user_input)


def classify_intent(user_input: str) -> str:
    """
    Fast mode defaults to keyword router.
    Set CSI_USE_LLM_ROUTER=1 to enable LLM intent classification.
    """
    if os.getenv("CSI_USE_LLM_ROUTER", "0") == "1":
        return classify_intent_llm(user_input)
    return classify_intent_keyword(user_input)


def orchestrate(user_input: str, case: dict, case_file: str, case_history: str) -> dict:
    """
    Main routing function.
    Classifies the user's intent and delegates to the appropriate agent.

    Returns:
        dict with keys:
            - agent: str (which agent responded)
            - response: str (the agent's reply)
            - updated_case_file: str (new case file after narrator update)
    """
    intent = classify_intent(user_input)
    updated_case_file = case_file  # Default: unchanged

    fast_updates = os.getenv("CSI_FAST_CASEFILE_UPDATES", "1") == "1"

    if intent == "witness":
        response = witness_agent(user_input, case)
        agent_used = "🕵️ Witness"

        if fast_updates:
            updated_case_file = case_file + f"\nWitness note: {response[:120]}..."
        else:
            # Slower but richer mode: LLM-authored noir update
            narrator_update = narrator_agent(
                f"Detective interrogated witness. Exchange: '{user_input[:80]}...' Reply hinted: '{response[:80]}...'",
                case_file
            )
            updated_case_file = case_file + "\n" + narrator_update

    elif intent == "analyst":
        response = analyst_agent(user_input, case_history)
        agent_used = "🔬 Analyst"

        if fast_updates:
            updated_case_file = case_file + f"\nAnalyst note: {response[:120]}..."
        else:
            # Slower but richer mode: LLM-authored noir update
            narrator_update = narrator_agent(
                f"Clue submitted for analysis: '{user_input}'. Analyst noted: '{response[:80]}...'",
                case_file
            )
            updated_case_file = case_file + "\n" + narrator_update

    else:
        response = narrator_agent(user_input, case_file)
        agent_used = "🎙️ Narrator"
        updated_case_file = case_file + "\n" + response

    return {
        "agent": agent_used,
        "response": response,
        "updated_case_file": updated_case_file
    }


if __name__ == "__main__":
    # Test the orchestrator with a dummy case
    dummy_case = {
        "victim": {"name": "Marco Delgado", "role": "poker dealer"},
        "suspect_a": {"name": "Veronica Sloane", "motive": "witnessed chip skimming", "alibi": "spa all evening"},
        "suspect_b": {"name": "Danny Ricci", "motive": "owed money", "alibi": "at craps table"},
        "culprit": "Danny Ricci",
        "murder_weapon": "a weighted poker chip sleeve",
        "key_clue": "monogrammed loyalty card found under victim"
    }

    tests = [
        "Where were you when Marco died?",
        "I found a loyalty card near the body. Analyze it.",
        "The investigation deepens as night falls over the Strip."
    ]

    case_file = "A body was found at the Bellagio. Investigation begins."

    for t in tests:
        print(f"\nInput: {t}")
        result = orchestrate(t, dummy_case, case_file, "")
        print(f"Agent: {result['agent']}")
        print(f"Response: {result['response'][:200]}")
        case_file = result["updated_case_file"]