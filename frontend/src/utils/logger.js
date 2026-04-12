// logger.js - Frontend logging utility for CSI Vegas
class Logger {
  constructor() {
    this.logLevel = this.getLogLevel();
    this.prefix = '[CSI Vegas]';
  }

  getLogLevel() {
    // Get log level from environment or localStorage
    const envLevel = import.meta.env?.VITE_LOG_LEVEL;
    const localLevel = localStorage.getItem('csi_log_level');
    
    if (envLevel) return envLevel;
    if (localLevel) return localLevel;
    
    // Default to 'info' in production, 'debug' in development
    return import.meta.env.DEV ? 'debug' : 'info';
  }

  setLogLevel(level) {
    this.logLevel = level;
    localStorage.setItem('csi_log_level', level);
  }

  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  formatMessage(level, component, message, data = null) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `${timestamp} | ${level.toUpperCase()} | ${component} | ${message}`;
    
    if (data) {
      return [formattedMessage, data];
    }
    return formattedMessage;
  }

  log(level, component, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, component, message, data);
    
    // Console logging with appropriate styling
    switch (level) {
      case 'error':
        console.error('%c' + formatted, 'color: #ff6b6b; font-weight: bold;', data || '');
        break;
      case 'warn':
        console.warn('%c' + formatted, 'color: #feca57; font-weight: bold;', data || '');
        break;
      case 'info':
        console.info('%c' + formatted, 'color: #48dbfb; font-weight: bold;', data || '');
        break;
      case 'debug':
        console.debug('%c' + formatted, 'color: #1dd1a1; font-weight: normal;', data || '');
        break;
      default:
        console.log(formatted, data || '');
    }

    // Store in localStorage for debugging (keep last 100 entries)
    this.storeLogEntry(level, component, message, data);
  }

  storeLogEntry(level, component, message, data) {
    try {
      const logs = JSON.parse(localStorage.getItem('csi_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        component,
        message,
        data: data ? JSON.stringify(data) : null
      });
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('csi_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store log entry:', error);
    }
  }

  // Convenience methods
  error(component, message, data) {
    this.log('error', component, message, data);
  }

  warn(component, message, data) {
    this.log('warn', component, message, data);
  }

  info(component, message, data) {
    this.log('info', component, message, data);
  }

  debug(component, message, data) {
    this.log('debug', component, message, data);
  }

  // Specialized logging methods for CSI Vegas
  logUserAction(action, details = {}) {
    this.info('USER', `Action: ${action}`, details);
  }

  logApiCall(method, url, status, responseTime) {
    this.info('API', `${method} ${url}`, { status, responseTime: `${responseTime}ms` });
  }

  logApiError(method, url, error, status) {
    this.error('API', `${method} ${url} failed`, { error: error.message, status });
  }

  logGameState(state, details = {}) {
    this.info('GAME', `State: ${state}`, details);
  }

  logAgentInteraction(agent, userInput, response, processingTime) {
    this.info('AGENT', `${agent} interaction`, {
      inputLength: userInput.length,
      responseLength: response.length,
      processingTime: `${processingTime}ms`
    });
  }

  logSuspectSelection(suspect, previousSuspect) {
    this.info('UI', `Suspect selection changed`, {
      new: suspect,
      previous: previousSuspect
    });
  }

  logError(error, component, context = {}) {
    this.error(component, error.message, {
      stack: error.stack,
      context
    });
  }

  // Export logs for debugging
  exportLogs() {
    try {
      const logs = JSON.parse(localStorage.getItem('csi_logs') || '[]');
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `csi-vegas-logs-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.info('SYSTEM', 'Logs exported successfully');
    } catch (error) {
      this.error('SYSTEM', 'Failed to export logs', error);
    }
  }

  // Clear logs
  clearLogs() {
    localStorage.removeItem('csi_logs');
    this.info('SYSTEM', 'Logs cleared');
  }

  // Get recent logs
  getRecentLogs(count = 20) {
    try {
      const logs = JSON.parse(localStorage.getItem('csi_logs') || '[]');
      return logs.slice(-count);
    } catch (error) {
      this.error('SYSTEM', 'Failed to retrieve logs', error);
      return [];
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Development helper: add to window for debugging
if (import.meta.env.DEV) {
  window.csiLogger = logger;
  window.exportLogs = () => logger.exportLogs();
  window.clearLogs = () => logger.clearLogs();
  window.getLogs = () => logger.getRecentLogs();
}

export default logger;
