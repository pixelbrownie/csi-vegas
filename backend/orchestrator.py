# orchestrator.py
import logging
import time
from agents import witness_agent, analyst_agent, narrator_agent, auditor_agent, AuditResult
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError
from memory import store_memory
from logging_config import get_logger, log_orchestration_decision, log_agent_interaction

logger = get_logger(__name__)

def _classify_intent_keywords(user_input: str) -> str:
    u = user_input.lower()
    analyst_hits = ("clue", "evidence", "analyze", "analysis", "forensic", "lab", "sample", "dna", "print", "fiber", "ballistic", "swab")
    witness_hits = ("where were", "alibi", "saw you", "did you", "why did", "tell me about", "suspect", "witness", "were you", "you were", "know anything")
    if any(w in u for w in analyst_hits): return "analyst"
    if any(w in u for w in witness_hits): return "witness"
    return "narrator"

def classify_intent(user_input: str) -> str:
    logger.debug(f"CLASSIFY_INTENT_START | Input: '{user_input}' | LLM_Enabled: {is_live_llm_enabled()}")
    
    if not is_live_llm_enabled(): 
        fallback_result = _classify_intent_keywords(user_input)
        logger.debug(f"CLASSIFY_INTENT_FALLBACK | Result: {fallback_result}")
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

    # RAG: Store query
    store_memory(f"Detective: {user_input}", "detective")
    logger.debug(f"MEMORY_STORED | Detective query")

    if intent == "witness":
        logger.debug(f"AGENT_DISPATCH | witness_agent")
        # PASS 1: Generate initial response
        agent_res = witness_agent(user_input, case, target_suspect=suspect_name)
        response = agent_res["response"]
        reasoning = agent_res["reasoning"]
        agent_used = "WITNESS"
        
        log_agent_interaction("witness", user_input, response, reasoning)
        
        # AUDIT: Run the forensic auditor
        logger.debug(f"AUDIT_START | Checking witness response for contradictions")
        audit_results = auditor_agent(user_input, response, case)
        logger.debug(f"AUDIT_RESULT | Contradiction: {audit_results.contradiction}")
        
        # PASS 2: Agentic Confrontation Loop
        if audit_results.contradiction:
            logger.warning(f"CONTRADICTION_DETECTED | {audit_results.explanation}")
            # Witness is lying or caught in a contradiction; give them a chance to "re-think"
            rethink_res = witness_agent(user_input, case, rethink_instruction=audit_results.explanation, target_suspect=suspect_name)
            response = rethink_res["response"]
            reasoning = f"[CONTRADICTION DETECTED] {audit_results.explanation}\n\n[RETHINKING] {rethink_res['reasoning']}"
            logger.info(f"WITNESS_RETHINK | Contradiction addressed")
        
        store_memory(f"Witness Response: {response}", "witness")
        logger.debug(f"MEMORY_STORED | Witness response")
        narrator_update = narrator_agent(f"Interrogated witness. Response: '{response[:80]}...'", case_file)
        updated_case_file = case_file + "\n" + narrator_update

    elif intent == "analyst":
        logger.debug(f"AGENT_DISPATCH | analyst_agent")
        agent_res = analyst_agent(user_input, case_history, case)
        response = agent_res["response"]
        reasoning = agent_res["reasoning"]
        agent_used = "ANALYST"

        log_agent_interaction("analyst", user_input, response, reasoning)
        
        store_memory(f"Analyst Findings: {response}", "analyst")
        logger.debug(f"MEMORY_STORED | Analyst findings")
        narrator_update = narrator_agent(f"Lab analysis complete: {response[:80]}...", case_file)
        updated_case_file = case_file + "\n" + narrator_update

    else:
        logger.debug(f"AGENT_DISPATCH | narrator_agent")
        response = narrator_agent(user_input, case_file)
        agent_used = "NARRATOR"
        reasoning = "Generating narrative flavor and updating case log."
        store_memory(f"Narrative Log: {response}", "narrator")
        logger.debug(f"MEMORY_STORED | Narrative log")
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
