# logging_config.py - Comprehensive logging setup for CSI Vegas
import logging
import logging.handlers
import os
from datetime import datetime

def setup_logging():
    """Configure comprehensive logging for the CSI Vegas backend"""
    
    # Create logs directory if it doesn't exist
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Generate timestamp for log filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(log_dir, f"csi_vegas_{timestamp}.log")
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)-15s | %(funcName)-12s:%(lineno)-4d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # File handler with rotation (keeps last 5 files, each max 10MB)
    file_handler = logging.handlers.RotatingFileHandler(
        log_file, 
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    
    # Console handler for development
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    # Configure specific loggers for different components
    configure_component_loggers()
    
    return logger

def configure_component_loggers():
    """Configure specific loggers for different components"""
    
    # Agent logger - tracks agent interactions
    agent_logger = logging.getLogger('agents')
    agent_logger.setLevel(logging.DEBUG)
    
    # LLM client logger - tracks API calls
    llm_logger = logging.getLogger('llm_client')
    llm_logger.setLevel(logging.INFO)
    
    # Memory logger - tracks vector operations
    memory_logger = logging.getLogger('memory')
    memory_logger.setLevel(logging.DEBUG)
    
    # Orchestrator logger - tracks routing decisions
    orchestrator_logger = logging.getLogger('orchestrator')
    orchestrator_logger.setLevel(logging.DEBUG)
    
    # API logger - tracks HTTP requests
    api_logger = logging.getLogger('uvicorn.access')
    api_logger.setLevel(logging.INFO)

def get_logger(name: str) -> logging.Logger:
    """Get a logger with the specified name"""
    return logging.getLogger(name)

# Convenience functions for different log levels
def log_debug(message: str, component: str = "general"):
    """Log debug message"""
    logger = logging.getLogger(component)
    logger.debug(message)

def log_info(message: str, component: str = "general"):
    """Log info message"""
    logger = logging.getLogger(component)
    logger.info(message)

def log_warning(message: str, component: str = "general"):
    """Log warning message"""
    logger = logging.getLogger(component)
    logger.warning(message)

def log_error(message: str, component: str = "general", exception=None):
    """Log error message with optional exception"""
    logger = logging.getLogger(component)
    if exception:
        logger.error(f"{message} | Exception: {str(exception)}", exc_info=True)
    else:
        logger.error(message)

def log_agent_interaction(agent_type: str, user_input: str, response: str, reasoning: str = ""):
    """Log agent interactions for debugging"""
    logger = logging.getLogger('agents')
    logger.info(f"AGENT_INTERACTION | {agent_type} | Input: {user_input[:100]}...")
    logger.debug(f"AGENT_RESPONSE | {agent_type} | Response: {response[:100]}...")
    if reasoning:
        logger.debug(f"AGENT_REASONING | {agent_type} | {reasoning[:100]}...")

def log_api_request(method: str, endpoint: str, user_agent: str = "", status: int = 0):
    """Log API requests"""
    logger = logging.getLogger('api')
    logger.info(f"API_REQUEST | {method} {endpoint} | Status: {status} | UA: {user_agent[:50]}...")

def log_llm_call(model: str, prompt_length: int, response_length: int, success: bool, error: str = ""):
    """Log LLM API calls"""
    logger = logging.getLogger('llm_client')
    status = "SUCCESS" if success else "FAILED"
    logger.info(f"LLM_CALL | Model: {model} | Prompt: {prompt_length} chars | Response: {response_length} chars | Status: {status}")
    if error:
        logger.error(f"LLM_ERROR | {error}")

def log_memory_operation(operation: str, query: str, results_count: int, category: str = ""):
    """Log memory operations"""
    logger = logging.getLogger('memory')
    logger.info(f"MEMORY_OP | {operation} | Category: {category} | Query: {query[:50]}... | Results: {results_count}")

def log_orchestration_decision(user_input: str, intent: str, agent_used: str, processing_time: float = 0):
    """Log orchestration routing decisions"""
    logger = logging.getLogger('orchestrator')
    logger.info(f"ORCHESTRATION | Input: {user_input[:50]}... | Intent: {intent} | Agent: {agent_used} | Time: {processing_time:.2f}s")
