# Logging Guide for CSI Vegas

This guide explains how to use and configure the comprehensive logging system implemented for CSI Vegas.

## Overview

The CSI Vegas project includes a robust logging system that helps with:
- Debugging agent interactions
- Monitoring API performance
- Tracking user behavior
- Analyzing system performance
- Troubleshooting issues

## Backend Logging

### Setup

The logging system is automatically initialized when the backend starts:

```python
# In main.py
from logging_config import setup_logging, get_logger
setup_logging()
logger = get_logger(__name__)
```

### Log Files

- **Location**: `backend/logs/`
- **Format**: `csi_vegas_YYYYMMDD_HHMMSS.log`
- **Rotation**: Keeps last 5 files, each max 10MB
- **Levels**: DEBUG, INFO, WARNING, ERROR

### Log Structure

```
2024-01-15 14:30:45 | INFO     | orchestrator   | orchestrate   :30  | ORCHESTRATE_START | Input: Where were you...
2024-01-15 14:30:45 | DEBUG    | orchestrator   | classify_intent:19  | INTENT_CLASSIFIED | witness
2024-01-15 14:30:46 | INFO     | agents        | witness_agent :57  | AGENT_INTERACTION | witness | Input: Where were you...
```

### Using the Logger

```python
from logging_config import get_logger, log_agent_interaction

logger = get_logger(__name__)

# Basic logging
logger.info("User connected")
logger.warning("API key missing")
logger.error("Database connection failed", exc_info=True)

# Specialized logging functions
log_agent_interaction("witness", user_input, response, reasoning)
log_api_request("POST", "/chat", user_agent, 200)
log_llm_call("llama-3.1-8b", 150, 300, True)
```

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about system operation
- **WARNING**: Something unexpected, but system continues
- **ERROR**: Serious error that may cause failure

## Frontend Logging

### Setup

The frontend logger is available in all components:

```javascript
import logger from '../utils/logger.js';

// Basic logging
logger.info('ChatRoom', 'Component mounted');
logger.error('API', 'Request failed', error);

// Specialized logging
logger.logUserAction('send_message', { messageLength: 50 });
logger.logApiCall('POST', '/chat', 200, 1200);
logger.logSuspectSelection('Lola Luxe', '');
```

### Browser Console

Logs appear in the browser console with color coding:
- **ERROR**: Red, bold
- **WARN**: Yellow, bold  
- **INFO**: Blue, bold
- **DEBUG**: Green, normal

### Local Storage

Recent logs are stored in `localStorage` for debugging:
- **Key**: `csi_logs`
- **Entries**: Last 100 log entries
- **Export**: Available via `window.exportLogs()` in development

## Log Categories

### Backend Components

- **orchestrator**: Intent classification and agent routing
- **agents**: Agent interactions and responses
- **llm_client**: LLM API calls and responses
- **memory**: Vector database operations
- **api**: HTTP requests and responses
- **general**: Miscellaneous system events

### Frontend Components

- **USER**: User actions and interactions
- **API**: Frontend API calls
- **GAME**: Game state changes
- **AGENT**: Agent interaction timing
- **UI**: UI component events
- **SYSTEM**: System-level events

## Configuration

### Environment Variables

```bash
# Backend
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
LOG_FILE_MAX_SIZE=10485760  # 10MB
LOG_FILE_BACKUP_COUNT=5

# Frontend (in .env)
VITE_LOG_LEVEL=debug
```

### Runtime Configuration

```javascript
// Frontend - change log level at runtime
logger.setLogLevel('debug');

// Backend - configure logger programmatically
import logging
logging.getLogger('agents').setLevel(logging.DEBUG)
```

## Monitoring and Analysis

### Viewing Logs

#### Backend
```bash
# View latest log file
tail -f backend/logs/csi_vegas_*.log

# Search for specific patterns
grep "CONTRADICTION_DETECTED" backend/logs/*.log

# Filter by log level
grep "ERROR" backend/logs/*.log
```

#### Frontend
```javascript
// Get recent logs in browser console
window.getLogs()

// Export logs to file
window.exportLogs()

// Clear all logs
window.clearLogs()
```

### Log Analysis

#### Common Patterns
- **ORCHESTRATE_START/ORCHESTRATE_COMPLETE**: Request processing time
- **AGENT_INTERACTION**: Agent response quality
- **CONTRADICTION_DETECTED**: Lie detection events
- **LLM_CALL**: API performance and errors
- **MEMORY_OP**: Vector database performance

#### Performance Metrics
```bash
# Average response time
grep "ORCHESTRATE_COMPLETE" logs/*.log | grep -o "Time: [0-9.]*s" | awk '{sum+=$2} END {print sum/NR}'

# Error rate
grep -c "ERROR" logs/*.log
grep -c "INFO" logs/*.log | awk '{print $1/$2}'
```

## Debugging Scenarios

### Agent Not Responding
1. Check backend logs for `AGENT_DISPATCH`
2. Look for `LLM_CALL` failures
3. Verify `CONTRADICTION_DETECTED` events

### Frontend Issues
1. Open browser console
2. Check for API errors in logs
3. Export frontend logs for analysis

### Performance Issues
1. Monitor `ORCHESTRATE_COMPLETE` timing
2. Check `LLM_CALL` response times
3. Analyze `MEMORY_OP` performance

## Best Practices

### Backend
1. Use appropriate log levels
2. Include context in log messages
3. Log agent interactions with `log_agent_interaction()`
4. Log errors with exception information

### Frontend
1. Log user actions for analytics
2. Include timing information
3. Use specialized logging methods
4. Export logs when reporting issues

### Production
1. Set appropriate log levels (INFO or WARNING)
2. Monitor log file sizes
3. Set up log rotation
4. Consider log aggregation for large deployments

## Troubleshooting

### Common Issues

**Logs not appearing:**
- Check log level configuration
- Verify logging initialization
- Check file permissions

**Too many logs:**
- Increase log level to WARNING or ERROR
- Adjust log rotation settings
- Use more specific loggers

**Missing context:**
- Add more detailed log messages
- Include relevant data in log calls
- Use structured logging formats

### Getting Help

1. Check existing logs for patterns
2. Export logs from both frontend and backend
3. Include log excerpts in bug reports
4. Use log analysis tools for large datasets
