# agents.py
import logging
import re
import json
from pydantic import BaseModel, Field
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError
from memory import retrieve_relevant

logger = logging.getLogger(__name__)

class AuditResult(BaseModel):
    contradiction: bool
    explanation: str

def parse_agent_response(response_text: str, fallback_reasoning: str = ""):
    """
    Parses reasoning and final answer from a response.
    Supports <thinking> tags AND a REASONING: / RESPONSE: label format.
    Falls back to fallback_reasoning if nothing is found.
    """
    reasoning = ""
    clean_text = response_text

    # Try <thinking>...</thinking> first
    thinking_match = re.search(r'<thinking>(.*?)</thinking>', response_text, re.DOTALL)
    if thinking_match:
        reasoning = thinking_match.group(1).strip()
        clean_text = re.sub(r'<thinking>.*?</thinking>', '', response_text, flags=re.DOTALL).strip()
        return reasoning, clean_text

    # Try REASONING: ... RESPONSE: ... format
    reasoning_match = re.search(r'REASONING:(.*?)(?:RESPONSE:|$)', response_text, re.DOTALL | re.IGNORECASE)
    response_match = re.search(r'RESPONSE:(.*)', response_text, re.DOTALL | re.IGNORECASE)
    if reasoning_match:
        reasoning = reasoning_match.group(1).strip()
        clean_text = response_match.group(1).strip() if response_match else response_text
        return reasoning, clean_text

    # Fallback: use provided context as reasoning so button always appears
    reasoning = fallback_reasoning if fallback_reasoning else "Internal processing complete. No explicit reasoning trace available for this model."
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

def witness_agent(question: str, case: dict, rethink_instruction: str = "") -> dict:
    suspect = case["suspect_a"]
    culprit = case["culprit"]
    weapon = case["murder_weapon"]
    clue = case["key_clue"]
    victim = case["victim"]

    # RAG: Retrieve relevant past evidence
    past_memory = retrieve_relevant(f"What do we know about {suspect['name']} and {victim['name']} in relation to {question}?")

    rethink_block = ""
    if rethink_instruction:
        rethink_block = f"\nCRITICAL SELF-CORRECTION: Your previous draft was flagged for the following inconsistency: {rethink_instruction}. Adjust your response to be more subtle or defensive without admitting the truth directly."

    fallback_reasoning = (
        f"WITNESS PROFILE: {suspect['name']} | Alibi: {suspect['alibi']}\n"
        f"GUILT CHECK: Real culprit is '{culprit}'. Witness {'IS' if suspect['name'] == culprit else 'IS NOT'} the killer.\n"
        f"MEMORY CONTEXT: {past_memory[:200] if past_memory else 'No prior statements on record.'}\n"
        f"STRATEGY: {'Deflect and misdirect. Protect guilt.' if suspect['name'] == culprit else 'Maintain alibi. Redirect to other suspect.'}"
    )

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
{rethink_block}

INSTRUCTIONS:
First write your internal strategy under a line starting EXACTLY with "REASONING:"
Then write your in-character spoken response under a line starting EXACTLY with "RESPONSE:"
Keep RESPONSE to 3 sentences. Stay fully in character with gesture descriptions in [brackets].

Detective's question: {question}
REASONING:"""

    if not is_live_llm_enabled():
        return {"response": _witness_scripted(question, case), "reasoning": fallback_reasoning}
    
    try:
        raw_res = invoke_llm(prompt, "witness_agent")
        reasoning, clean_text = parse_agent_response(raw_res, fallback_reasoning)
        return {"response": clean_text, "reasoning": reasoning}
    except LLMUnavailableError:
        return {"response": _witness_scripted(question, case), "reasoning": fallback_reasoning}

def analyst_agent(clue: str, case_history: str) -> dict:
    past_findings = retrieve_relevant(f"Forensic facts related to: {clue}")

    fallback_reasoning = (
        f"VECTOR SEARCH: Queried ChromaDB for: 'Forensic facts related to: {clue[:80]}'\n"
        f"RETRIEVED CONTEXT: {past_findings[:300] if past_findings else 'No prior entries found in the evidence store.'}\n"
        f"RAG PIPELINE: Retrieved {1 if past_findings else 0} relevant document(s). Feeding to analyst LLM."
    )

    prompt = f"""You are Agent Reyes, a forensic analyst at the Las Vegas Crime Lab.

CASE HISTORY SO FAR:
{case_history if case_history else "No prior clues on record."}

RELEVANT PAST FINDINGS (Vector Search):
{past_findings if past_findings else "No previous related patterns found."}

NEW CLUE SUBMITTED:
{clue}

TASK:
First, write your internal reasoning under a line that starts EXACTLY with "REASONING:"
Then write your public 3-sentence forensic summary under a line that starts EXACTLY with "RESPONSE:"
End with Importance: LOW / MEDIUM / HIGH.

REASONING:"""

    if not is_live_llm_enabled():
        return {"response": "Findings inconclusive based on current samples.", "reasoning": fallback_reasoning}
    
    try:
        raw_res = invoke_llm(prompt, "analyst_agent")
        reasoning, clean_text = parse_agent_response(raw_res, fallback_reasoning)
        return {"response": clean_text, "reasoning": reasoning}
    except LLMUnavailableError:
        return {"response": "System offline. Fallback diagnostics active.", "reasoning": fallback_reasoning}

def auditor_agent(question: str, response: str, case: dict) -> AuditResult:
    """
    Checks if the witness just lied by comparing response to Case Truth + Memory.
    Returns a structured AuditResult.
    """
    victim = case["victim"]
    suspect_a = case["suspect_a"]
    truth = {
        "culprit": case["culprit"],
        "weapon": case["murder_weapon"],
        "suspect_a_alibi": suspect_a["alibi"],
        "key_clue": case["key_clue"]
    }
    
    past_statements = retrieve_relevant(f"What has been said about {question} or alibis previously?")

    prompt = f"""You are a Forensic Auditor. Detect LIES and CONTRADICTIONS.

GROUND TRUTH:
{truth}

PAST STATEMENTS:
{past_statements}

CURRENT INTERROGATION:
Detective asked: "{question}"
Witness responded: "{response}"

TASK:
- Does the witness response contradict the GROUND TRUTH or PAST STATEMENTS? 
- If YES, explain exactly why in 1 sharp sentence.
- Reply with ONLY a JSON object: {{"contradiction": true/false, "explanation": "..."}}"""

    if not is_live_llm_enabled():
        return AuditResult(contradiction=False, explanation="")
    
    try:
        raw = invoke_llm(prompt, "auditor_agent")
        match = re.search(r"(\{.*\})", raw, re.DOTALL)
        json_str = match.group(1) if match else raw
        return AuditResult(**json.loads(json_str))
    except Exception as e:
        logger.warning(f"Auditor failed: {e}")
        return AuditResult(contradiction=False, explanation="")

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
