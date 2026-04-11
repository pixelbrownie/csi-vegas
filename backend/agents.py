# agents.py
import logging
import re
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError
from memory import retrieve_relevant

logger = logging.getLogger(__name__)

def parse_agent_response(response_text: str):
    """
    Parses reasoning and final answer from a response that uses <thinking> tags.
    """
    reasoning = ""
    clean_text = response_text
    
    thinking_match = re.search(r'<thinking>(.*?)</thinking>', response_text, re.DOTALL)
    if thinking_match:
        reasoning = thinking_match.group(1).strip()
        clean_text = re.sub(r'<thinking>.*?</thinking>', '', response_text, flags=re.DOTALL).strip()
    
    return reasoning, clean_text

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

def witness_agent(question: str, case: dict) -> dict:
    suspect = case["suspect_a"]
    culprit = case["culprit"]
    weapon = case["murder_weapon"]
    clue = case["key_clue"]
    victim = case["victim"]

    # RAG: Retrieve relevant past evidence
    past_memory = retrieve_relevant(f"What do we know about {suspect['name']} and {victim['name']} in relation to {question}?")

    prompt = f"""You are {suspect['name']}, a witness being interrogated in a Las Vegas murder case.

CONFIDENTIAL TRUTH (never reveal directly):
- Victim: {victim['name']}, a {victim['role']}
- The real culprit is: {culprit}
- Murder weapon: {weapon}
- Hidden clue: {clue}
- Your alibi: {suspect['alibi']}
- Your motive (if suspected): {suspect['motive']}

RELEVANT PAST EVIDENCE / TURN HISTORY:
{past_memory if past_memory else "None on record yet."}

INSTRUCTIONS:
1. First, think about the detective's query and your alibi/guilt in <thinking> tags. 
   - Cross-reference with PAST EVIDENCE. 
   - Decide if you need to lie or deflect.
2. Then, provide your public response.
3. Stay fully in character. Dropping subtle hints (gesture descriptions in brackets) is encouraged.
4. Keep public response to 3 sentences max.

Detective's question: {question}
Your response (Starting with <thinking>):"""

    if not is_live_llm_enabled():
        return {"response": _witness_scripted(question, case), "reasoning": "Scripted fallback used."}
    
    try:
        raw_res = invoke_llm(prompt, "witness_agent")
        reasoning, clean_text = parse_agent_response(raw_res)
        return {"response": clean_text, "reasoning": reasoning}
    except LLMUnavailableError:
        return {"response": _witness_scripted(question, case), "reasoning": "Groq unavailable, used scripted fallback."}

def analyst_agent(clue: str, case_history: str) -> dict:
    past_findings = retrieve_relevant(f"Forensic facts related to: {clue}")

    prompt = f"""You are Agent Reyes, a forensic analyst at the Las Vegas Crime Lab.

CASE HISTORY SO FAR:
{case_history if case_history else "No prior clues on record."}

RELEVANT PAST FINDINGS (Vector Search):
{past_findings if past_findings else "No previous related patterns found."}

NEW CLUE SUBMITTED:
{clue}

TASK:
1. Think analytically about the clue and its relevance in <thinking> tags.
2. Provide a 3-sentence clinical summary of the findings.
3. Rate importance: LOW / MEDIUM / HIGH.

Your response (Starting with <thinking>):"""

    if not is_live_llm_enabled():
        return {"response": "Findings inconclusive based on current samples.", "reasoning": "Scripted fallback."}
    
    try:
        raw_res = invoke_llm(prompt, "analyst_agent")
        reasoning, clean_text = parse_agent_response(raw_res)
        return {"response": clean_text, "reasoning": reasoning}
    except LLMUnavailableError:
        return {"response": "System offline. Fallback diagnostics active.", "reasoning": "Groq error."}

def auditor_agent(question: str, response: str, case: dict) -> dict:
    """
    Silent agent that checks if the witness just lied by comparing response to Case Truth + Memory.
    """
    victim = case["victim"]
    suspect_a = case["suspect_a"]
    suspect_b = case["suspect_b"]
    truth = {
        "culprit": case["culprit"],
        "weapon": case["murder_weapon"],
        "suspect_a_alibi": suspect_a["alibi"],
        "suspect_b_alibi": suspect_b["alibi"],
        "key_clue": case["key_clue"]
    }
    
    # RAG: Check past statements
    past_statements = retrieve_relevant(f"What has been said about {question} or alibis previously?")

    prompt = f"""You are a Forensic Auditor. Your task is to detect LIES and CONTRADICTIONS.

GROUND TRUTH:
{truth}

PAST STATEMENTS:
{past_statements}

CURRENT INTERROGATION:
Detective asked: "{question}"
Witness responded: "{response}"

TASK:
- Does the witness response contradict the GROUND TRUTH or PAST STATEMENTS? 
- If YES, explain why in 1 sharp sentence.
- Format: Reply with EXACTLY a JSON-style object: {{"contradiction": true/false, "explanation": "..."}}"""

    if not is_live_llm_enabled():
        return {"contradiction": False, "explanation": ""}
    
    try:
        res = invoke_llm(prompt, "auditor_agent")
        # Crude sanitization for JSON
        is_cont = "true" in res.lower()
        expl = re.search(r'"explanation":\s*"(.*?)"', res)
        return {
            "contradiction": is_cont,
            "explanation": expl.group(1) if expl else "Discrepancy detected in timeline." if is_cont else ""
        }
    except Exception:
        return {"contradiction": False, "explanation": ""}

def narrator_agent(event: str, case_file: str) -> str:
    prompt = f"""You are the noir narrator of a Vegas murder mystery.
Update the case file with 2 punchy, cinematic sentences based on: {event}. 
Do NOT repeat the current file. Focus on the new mood."""
    
    if not is_live_llm_enabled():
        return f"Neon flickers as the hunt deepens: {event[:60]}..."
    
    try:
        return invoke_llm(prompt, "narrator_agent")
    except LLMUnavailableError:
        return f"Vegas doesn't care about the truth, only the stakes. {event[:60]}..."
