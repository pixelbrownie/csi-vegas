# orchestrator.py
import logging
import time
from agents import witness_agent, analyst_agent, narrator_agent, auditor_agent, AuditResult
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError
from logging_config import get_logger, log_orchestration_decision, log_agent_interaction

logger = get_logger(__name__)

def _classify_intent_keywords(user_input: str) -> str:
    u = user_input.lower()
    analyst_hits = ("clue", "evidence", "analyze", "analysis", "forensic", "lab", "sample", "dna", "print", "fiber", "ballistic", "swab", "weapon", "sweep", "scanner", "reyes", "crime scene")
    witness_hits = ("where were", "alibi", "saw you", "did you", "why did", "tell me about", "suspect", "witness", "were you", "you were", "know anything")
    if any(w in u for w in analyst_hits): return "analyst"
    if any(w in u for w in witness_hits): return "witness"
    return "narrator"

def classify_intent(user_input: str) -> str:
    # HIGH-EFFICIENCY MODE: Always use keywords to save tokens
    fallback_result = _classify_intent_keywords(user_input)
    logger.debug(f"CLASSIFY_INTENT_FAST | Result: {fallback_result}")
    return fallback_result
        
    prompt = f"Classify intent: '{user_input}'. Reply with EXACTLY one word: witness, analyst, or narrator."
    try:
        result = invoke_llm(prompt, "classify_intent").lower()
        logger.debug(f"CLASSIFY_INTENT_LLM_RESULT | Raw: '{result}'")
        
        for agent in ["witness", "analyst", "narrator"]:
            if agent in result: 
                logger.debug(f"CLASSIFY_INTENT_FINAL | Matched: {agent}")
                return agent
                
        logger.warning(f"CLASSIFY_INTENT_NO_MATCH | Using fallback for: '{result}'")
        fallback_result = _classify_intent_keywords(user_input)
        logger.debug(f"CLASSIFY_INTENT_FALLBACK | Result: {fallback_result}")
        return fallback_result
        
    except LLMUnavailableError as e:
        logger.error(f"CLASSIFY_INTENT_LLM_ERROR | {str(e)}")
        fallback_result = _classify_intent_keywords(user_input)
        logger.debug(f"CLASSIFY_INTENT_FALLBACK | Result: {fallback_result}")
        return fallback_result

def orchestrate(user_input: str, case: dict, case_file: str, case_history: str, suspect_name: str | None = None) -> dict:
    start_time = time.time()
    logger.info(f"ORCHESTRATE_START | Input: {user_input[:50]}...")
    
    if suspect_name:
        intent = "witness"
        logger.debug(f"INTENT_OVERRIDE | Explicit suspect selected: {suspect_name}")
    else:
        intent = classify_intent(user_input)
        logger.debug(f"INTENT_CLASSIFIED | {intent}")
    
    updated_case_file = case_file
    reasoning = ""
    audit_results: AuditResult = AuditResult(contradiction=False, explanation="")

    # Main interaction logic
    if intent == "witness":
        logger.debug(f"AGENT_DISPATCH | witness_agent")
        # SINGLE CALL: Only the character speaks
        agent_res = witness_agent(user_input, case, target_suspect=suspect_name)
        response = agent_res["response"]
        reasoning = agent_res["reasoning"]
        agent_used = "WITNESS"
        
        log_agent_interaction("witness", user_input, response, reasoning)
        
        # Auditor and Narrator disabled for High-Efficiency Mode
        updated_case_file = case_file + f"\nInterrogated {suspect_name if suspect_name else 'witness'}."

    elif intent == "analyst":
        logger.debug(f"AGENT_DISPATCH | analyst_agent")
        agent_res = analyst_agent(user_input, case_history, case)
        response = agent_res["response"]
        reasoning = agent_res["reasoning"]
        agent_used = "ANALYST"

        log_agent_interaction("analyst", user_input, response, reasoning)
        
        updated_case_file = case_file + "\nLab analysis complete."

    else:
        logger.debug(f"AGENT_DISPATCH | narrator_agent")
        # Use simple template for Narrator to save tokens
        response = f"Vegas doesn't care about the truth, only the stakes. {user_input[:50]}..." if not is_live_llm_enabled() else narrator_agent(user_input, case_file)
        agent_used = "NARRATOR"
        reasoning = "Generating narrative update."
        updated_case_file = case_file + "\n" + response

    # Calculate processing time and log completion
    processing_time = time.time() - start_time
    log_orchestration_decision(user_input, intent, agent_used, processing_time)
    logger.info(f"ORCHESTRATE_COMPLETE | Agent: {agent_used} | Time: {processing_time:.2f}s")

    return {
        "agent": agent_used,
        "response": response,
        "reasoning": reasoning,
        "audit": audit_results.model_dump(),
        "updated_case_file": updated_case_file,
    }
