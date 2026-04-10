# agents.py
# Phase 3 — Three specialized agents (live LLM when enabled, else in-character templates)

import logging

from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError

logger = logging.getLogger(__name__)


def _witness_scripted(question: str, case: dict) -> str:
    suspect = case["suspect_a"]
    victim = case["victim"]
    other = case["suspect_b"]
    motive = other["motive"]
    motive_phrase = (motive[0].lower() + motive[1:]) if motive else "their own secrets"
    return (
        f"[{suspect['name']} avoids eye contact, voice tight] "
        f"Look, I already told security — I was {suspect['alibi']}. "
        f"{victim['name']}? We weren't friends, but I didn't wish that on anyone. "
        f"You're fishing. *nervous laugh* Ask about {other['name']} — "
        f"they had more reason than me: {motive_phrase}."
    )


def _analyst_scripted(clue: str, case_history: str) -> str:
    hist = case_history if case_history else "No prior clues on record."
    return (
        f"Preliminary read: the submission does not obviously contradict the logged timeline. "
        f"Case context: {hist[:120]}{'…' if len(hist) > 120 else ''} "
        f"New item: \"{clue[:100]}{'…' if len(clue) > 100 else ''}\" suggests follow-up on chain of custody. "
        f"Importance: MEDIUM — worth corroborating with venue security and witness statements."
    )


def _narrator_scripted(event: str, case_file: str) -> str:
    return (
        f"The Strip hums indifferent neon while the file thickens: {event[:140]}"
        f"{'…' if len(event) > 140 else ''} "
        "Another sin city secret waits behind mirrored glass."
    )


def witness_agent(question: str, case: dict) -> str:
    suspect = case["suspect_a"]
    culprit = case["culprit"]
    weapon = case["murder_weapon"]
    clue = case["key_clue"]
    victim = case["victim"]

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

    if not is_live_llm_enabled():
        return _witness_scripted(question, case)
    try:
        return invoke_llm(prompt, "witness_agent")
    except LLMUnavailableError as e:
        logger.warning("witness_agent: Groq failed, scripted fallback: %s", e)
        return _witness_scripted(question, case)


def analyst_agent(clue: str, case_history: str) -> str:
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

    if not is_live_llm_enabled():
        return _analyst_scripted(clue, case_history)
    try:
        return invoke_llm(prompt, "analyst_agent")
    except LLMUnavailableError as e:
        logger.warning("analyst_agent: Groq failed, scripted fallback: %s", e)
        return _analyst_scripted(clue, case_history)


def narrator_agent(event: str, case_file: str) -> str:
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

    if not is_live_llm_enabled():
        return _narrator_scripted(event, case_file)
    try:
        return invoke_llm(prompt, "narrator_agent")
    except LLMUnavailableError as e:
        logger.warning("narrator_agent: Groq failed, scripted fallback: %s", e)
        return _narrator_scripted(event, case_file)


if __name__ == "__main__":
    dummy_case = {
        "victim": {"name": "Marco Delgado", "role": "poker dealer"},
        "suspect_a": {"name": "Veronica Sloane", "motive": "witnessed chip skimming", "alibi": "spa all evening"},
        "suspect_b": {"name": "Danny Ricci", "motive": "owed money", "alibi": "at craps table"},
        "culprit": "Danny Ricci",
        "murder_weapon": "a weighted poker chip sleeve",
        "key_clue": "monogrammed loyalty card found under victim",
    }

    print("=== WITNESS AGENT ===")
    print(witness_agent("Where were you when Marco was killed?", dummy_case))
    print("\n=== ANALYST AGENT ===")
    print(analyst_agent("Found a loyalty card under the body", "Body found at 11pm near the high-stakes room."))
    print("\n=== NARRATOR AGENT ===")
    print(narrator_agent("Detective found a hidden loyalty card", "A body was found at the Bellagio. Investigation begins."))
