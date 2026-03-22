# agents.py
# Phase 3 — Three specialized LangChain agents
# Each agent wraps an LLM call with a specific persona and role

from langchain_community.llms import Ollama

llm = Ollama(model="mistral")

# ─────────────────────────────────────────
# WITNESS AGENT
# Knows the full truth but is evasive.
# Drops subtle hints without direct reveals.
# ─────────────────────────────────────────
def witness_agent(question: str, case: dict) -> str:
    """
    Plays the role of a nervous witness / suspect.
    Knows the truth but deflects and hints instead of confessing.
    """
    suspect = case["suspect_a"]
    culprit = case["culprit"]
    weapon  = case["murder_weapon"]
    clue    = case["key_clue"]
    victim  = case["victim"]

    prompt = f"""You are {suspect['name']}, a witness being interrogated in a Las Vegas murder case.

CONFIDENTIAL TRUTH (never reveal directly):
- Victim: {victim['name']}, a {victim['role']}
- The real culprit is: {culprit}
- Murder weapon: {weapon}
- Hidden clue: {clue}
- Your alibi: {suspect['alibi']}
- Your motive (if suspected): {suspect['motive']}

INSTRUCTIONS:
- Stay fully in character as {suspect['name']}. You are nervous and defensive.
- Do NOT directly name the culprit or weapon.
- Drop ONE subtle hint per response — a slip of the tongue, an offhand comment, a nervous gesture described in brackets.
- Keep responses to 3-4 sentences max.
- Be emotionally reactive. Get flustered if cornered.

Detective's question: {question}
Your response:"""

    return llm.invoke(prompt)


# ─────────────────────────────────────────
# ANALYST AGENT
# Forensic examiner. Clinical, precise.
# Cross-checks clues for contradictions.
# ─────────────────────────────────────────
def analyst_agent(clue: str, case_history: str) -> str:
    """
    Forensic analyst that evaluates submitted clues.
    Checks for contradictions and rates importance.
    """
    prompt = f"""You are Agent Reyes, a forensic analyst at the Las Vegas Crime Lab.

CASE HISTORY SO FAR:
{case_history if case_history else "No prior clues on record."}

NEW CLUE SUBMITTED BY DETECTIVE:
{clue}

YOUR TASK:
1. Does this clue contradict anything in the case history? State clearly YES or NO, then explain.
2. What does this clue suggest about the suspect or timeline?
3. Rate the clue importance: LOW / MEDIUM / HIGH with a one-line reason.

Be brief, clinical, and analytical. 4-5 sentences max. No dramatic flair."""

    return llm.invoke(prompt)


# ─────────────────────────────────────────
# NARRATOR AGENT
# Noir Vegas storyteller.
# Updates the living case file after each event.
# ─────────────────────────────────────────
def narrator_agent(event: str, case_file: str) -> str:
    """
    Noir narrator that dramatically updates the case file
    after each significant player action.
    """
    prompt = f"""You are the noir narrator of a Vegas murder mystery.

EXISTING CASE FILE:
{case_file}

NEW DEVELOPMENT:
{event}

TASK:
Update the case file by adding 2 sentences in a dramatic, cinematic noir style.
Think Raymond Chandler meets Vegas neon lights.
Start directly with the new addition — do NOT repeat the existing case file.
Keep it evocative and punchy."""

    return llm.invoke(prompt)


if __name__ == "__main__":
    # Quick test of each agent with a dummy case
    dummy_case = {
        "victim": {"name": "Marco Delgado", "role": "poker dealer"},
        "suspect_a": {"name": "Veronica Sloane", "motive": "witnessed chip skimming", "alibi": "spa all evening"},
        "suspect_b": {"name": "Danny Ricci", "motive": "owed money", "alibi": "at craps table"},
        "culprit": "Danny Ricci",
        "murder_weapon": "a weighted poker chip sleeve",
        "key_clue": "monogrammed loyalty card found under victim"
    }

    print("=== WITNESS AGENT ===")
    print(witness_agent("Where were you when Marco was killed?", dummy_case))
    print("\n=== ANALYST AGENT ===")
    print(analyst_agent("Found a loyalty card under the body", "Body found at 11pm near the high-stakes room."))
    print("\n=== NARRATOR AGENT ===")
    print(narrator_agent("Detective found a hidden loyalty card", "A body was found at the Bellagio. Investigation begins."))