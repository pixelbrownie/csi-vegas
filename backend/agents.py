# agents.py
import logging
import re
import json
from pydantic import BaseModel, Field
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError
from logging_config import get_logger

logger = get_logger(__name__)

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
    # Detect which suspect is being addressed
    suspect_a_name = case["suspect_a"]["name"].lower()
    suspect_b_name = case["suspect_b"]["name"].lower()
    question_lower = question.lower()
    
    if suspect_a_name in question_lower:
        suspect = case["suspect_a"]
    elif suspect_b_name in question_lower:
        suspect = case["suspect_b"]
    else:
        suspect = case["suspect_a"]  # default
    
    victim = case["victim"]
    other = case["suspect_b"] if suspect["name"] == case["suspect_a"]["name"] else case["suspect_a"]
    motive = other["motive"]
    motive_phrase = (motive[0].lower() + motive[1:]) if motive else "their own secrets"
    
    # Generate response based on question content
    if "where were" in question_lower or "alibi" in question_lower:
        return (
            f"[{suspect['name']} shifts nervously] "
            f"I was {suspect['alibi']}. "
            f"That's where I was the whole time. "
            f"I already told security this."
        )
    elif "victim" in question_lower or victim["name"].lower() in question_lower:
        return (
            f"[{suspect['name']} looks away momentarily] "
            f"{victim['name']}? We knew each other, but not well. "
            f"I didn't wish them harm, if that's what you're asking."
        )
    else:
        return (
            f"[{suspect['name']} avoids eye contact, voice tight] "
            f"Look, I was {suspect['alibi']}. "
            f"You should ask {other['name']} - "
            f"they had more reason than anyone: {motive_phrase}."
        )

def witness_agent(question: str, case: dict, rethink_instruction: str = "", target_suspect: str | None = None):
    # Detect which suspect is being addressed
    suspect_a_name = case["suspect_a"]["name"].lower()
    suspect_b_name = case["suspect_b"]["name"].lower()
    
    suspect = None
    if target_suspect:
        target_lower = target_suspect.lower()
        if target_lower == suspect_a_name:
            suspect = case["suspect_a"]
            logger.debug(f"WITNESS_AGENT | Targeted suspect_a: {suspect['name']}")
        elif target_lower == suspect_b_name:
            suspect = case["suspect_b"]
            logger.debug(f"WITNESS_AGENT | Targeted suspect_b: {suspect['name']}")

    if not suspect:
        question_lower = question.lower()
        # Determine which suspect to use based on question content
        if suspect_a_name in question_lower:
            suspect = case["suspect_a"]
            logger.debug(f"WITNESS_AGENT | Inferred suspect_a: {suspect['name']}")
        elif suspect_b_name in question_lower:
            suspect = case["suspect_b"]
            logger.debug(f"WITNESS_AGENT | Inferred suspect_b: {suspect['name']}")
        else:
            # Default to suspect_a if no specific name mentioned
            suspect = case["suspect_a"]
            logger.debug(f"WITNESS_AGENT | No specific suspect, defaulting to suspect_a: {suspect['name']}")
    
    culprit = case["culprit"]
    weapon = case["murder_weapon"]
    clue = case["key_clue"]
    victim = case["victim"]

    rethink_block = ""
    if rethink_instruction:
        rethink_block = f"\nCRITICAL SELF-CORRECTION: Your previous draft was flagged for the following inconsistency: {rethink_instruction}. Adjust your response to be more subtle or defensive without admitting the truth directly."

    fallback_reasoning = (
        f"ASSESSING WITNESS: {suspect['name']}. Prioritizing alibi integrity check: '{suspect['alibi']}'. "
        f"Cross-referencing with victim data ({victim['name']}). "
        f"Strategy: {'Evaluating inconsistencies in suspect narrative' if suspect['name'] == culprit else 'Verifying bystander proximity and motive weight.'}"
    )

    prompt = f"""You are {suspect['name']}, being interrogated about a Las Vegas murder. Maintain absolute character consistency.

YOUR CHARACTER PROFILE:
- You're {suspect['name']} and you must answer as yourself
- Personality Trait: {suspect.get('trait', 'nervous but trying to maintain composure')}
- You have an alibi: {suspect['alibi']}
- Your potential motive: {suspect['motive']}
- You're {'the actual killer and must lie to protect yourself' if suspect['name'] == culprit else 'innocent and being wrongly accused'}

CONFIDENTIAL TRUTH (never reveal directly):
- Victim: {victim['name']}, a {victim['role']}
- Real culprit: {culprit}
- Murder weapon: {weapon}
- Hidden clue: {clue}

INTERROGATION CONTEXT:
{rethink_block}

CRITICAL: You must answer the detective's specific question directly. The detective is asking: "{question}"

RESPONSE GUIDELINES:
1. READ THE QUESTION CAREFULLY and answer what was actually asked.
2. Embody your Personality Trait exactly. Use vocabulary, sentence structure, and tone that matches it. Do not act uniformly nervous unless your trait dictates it.
3. If asked about your location/alibi: Provide your alibi details naturally in conversation. Don't recite it like a robot.
4. If asked about the victim: Respond based on your relationship as defined by motive.
5. Speak naturally like a real person under pressure.
6. Include realistic emotions and physical actions in [brackets] matching your trait (e.g. [rolls eyes], [adjusts tie], [stammers]).
7. If guilty: Defend yourself but don't confess. Be manipulative, aggressive, or defensive according to your trait.
8. If innocent: Act consistently with your trait (e.g., indignant, confused, scared).
9. Keep responses to 2-4 natural sentences.
10. NEVER redirect to other suspects unless directly asked.

First write your internal thinking under "REASONING:"
Then write your direct answer under "RESPONSE:"

Detective asks: {question}
REASONING:"""

    if not is_live_llm_enabled():
        return {"response": _witness_scripted(question, case), "reasoning": fallback_reasoning}
    
    try:
        raw_res = invoke_llm(prompt, "witness_agent")
        reasoning, clean_text = parse_agent_response(raw_res, fallback_reasoning)
        return {"response": clean_text, "reasoning": reasoning}
    except LLMUnavailableError:
        return {"response": _witness_scripted(question, case), "reasoning": fallback_reasoning}

def analyst_agent(clue: str, case_history: str, case: dict = None) -> dict:
    fallback_reasoning = (
        f"FORENSIC TRACE ANALYSIS: Initiating deep-scan on '{clue[:40]}...'. "
        f"Reviewing legacy forensic database for pattern matches. "
        f"Synthesizing forensic indicators to provide investigative lead."
    )

    prompt = f"""You are Agent Reyes, a senior forensic analyst at the Las Vegas Crime Lab.

GROUND TRUTH EVIDENCE (Only reveal if specifically investigated or relevant to the clue):
- Murder Weapon: {case.get('murder_weapon', 'Unknown') if case else 'Unknown'}
- Key Clue: {case.get('key_clue', 'Unknown') if case else 'Unknown'}

CURRENT INVESTIGATION:
{case_history if case_history else "Initial evidence collection phase."}

NEW EVIDENCE TO ANALYZE:
{clue}

ANALYSIS APPROACH:
1. Consider the scientific implications of this evidence
2. If the user asks to "sweep the crime scene" or asks generally about weapons/clues, gently reveal the Murder Weapon and Key Clue.
3. Be direct and practical in your conclusions

RESPONSE FORMAT:
First write your expert analysis under "REASONING:"
Then provide your professional assessment under "RESPONSE:" (2-3 sentences)
Conclude with: Importance: LOW/MEDIUM/HIGH

REASONING:"""

    if not is_live_llm_enabled():
        return {"response": "Findings inconclusive based on current samples.", "reasoning": fallback_reasoning}
    
    try:
        raw_res = invoke_llm(prompt, "analyst_agent")
        reasoning, clean_text = parse_agent_response(raw_res, fallback_reasoning)
        return {"response": clean_text, "reasoning": reasoning}
    except LLMUnavailableError as e:
        # FLAWLESS FALLBACK: If LLM fails, we provide a variety of scripted responses so it's not repetitive
        import traceback
        import random
        with open("error_log.txt", "a") as f:
            f.write(f"Analyst Agent Error: {e}\n{traceback.format_exc()}\n")
            
        weapon = case.get('murder_weapon', 'unidentified object') if case else 'unidentified object'
        key_clue = case.get('key_clue', 'no distinct anomalies') if case else 'no distinct anomalies'
        
        fallback_templates = [
            f"Initial spectrum analysis complete. We identified the primary instrument as {weapon}. Furthermore, regional sweeps isolated a distinct trace: {key_clue}. Logging this into the evidence locker now.\n\nImportance: HIGH",
            f"Forensics processed the site. The findings confirm the use of a {weapon}. We also recovered a specific evidence item: {key_clue}. All data has been uploaded to the Case Dossier.\n\nImportance: CRITICAL",
            f"Lab results are in from the crime scene sweep. The trauma matches a {weapon}, and our team secured a critical clue: {key_clue}. Proceed with the investigation based on these leads.\n\nImportance: HIGH"
        ]
        
        return {"response": random.choice(fallback_templates), "reasoning": "Rerouting to localized heuristic diagnostics due to network packet loss. Pattern match on crime scene variables successful."}

def auditor_agent(question: str, response: str, case: dict) -> AuditResult:
    """
    Checks if the witness just lied by comparing response to Case Truth.
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
    
    prompt = f"""You are a Forensic Auditor. Detect LIES and CONTRADICTIONS.

GROUND TRUTH:
{truth}

CURRENT INTERROGATION:
Detective asked: "{question}"
Witness responded: "{response}"

TASK:
- Does the witness response contradict the GROUND TRUTH? 
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
    import random
    prompt = f"""You are the noir narrator of a Vegas murder mystery.
Update the case file with 2 punchy, cinematic sentences based on: {event}. 
Do NOT repeat the current file. Focus on the new mood."""
    
    fallbacks = [
        f"Vegas doesn't care about the truth, only the stakes. {event[:60]}...",
        f"The neon signs flicker, casting long shadows over the new evidence. {event[:60]}...",
        f"Another secret buried in the desert dirt. The investigation takes a turn: {event[:60]}...",
        f"In a city built on illusions, you have to look closely to see the bloodstains. {event[:60]}..."
    ]
    
    if not is_live_llm_enabled():
        return random.choice(fallbacks)
    
    try:
        return invoke_llm(prompt, "narrator_agent")
    except LLMUnavailableError:
        return random.choice(fallbacks)
