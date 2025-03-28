/**
 * LoggingService.js
 * A service for sending logs to BetterStack
 */
import axios from 'axios';

class LoggingService {
  constructor() {
    // Ensure the API URL has the correct protocol
    const apiUrlFromEnv = process.env.REACT_APP_BETTERSTACK_API_URL || 'logs.betterstack.com/api/v1/logs';
    this.apiUrl = apiUrlFromEnv.startsWith('http') ? apiUrlFromEnv : `https://${apiUrlFromEnv}`;
    this.apiToken = process.env.REACT_APP_BETTERSTACK_API_TOKEN || '';
    this.sourceId = 'spawnsmart';
    this.enabled = process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_LOGGING === 'true';
    this.batchSize = 10;
    this.batchTimeout = 5000; // 5 seconds
    this.logQueue = [];
    this.batchTimer = null;
    
    // Log levels
    this.LOG_LEVELS = {
      DEBUG: 'debug',
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error'
    };
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`LoggingService initialized with API URL: ${this.apiUrl}`);
    }
  }

  /**
   * Initialize the logging service
   * @param {Object} options - Configuration options
   * @param {boolean} options.enabled - Whether logging is enabled
   * @param {number} options.batchSize - Number of logs to batch before sending
   * @param {number} options.batchTimeout - Time in ms to wait before sending a partial batch
   */
  init(options = {}) {
    if (options.enabled !== undefined) {
      this.enabled = options.enabled;
    }
    if (options.batchSize) {
      this.batchSize = options.batchSize;
    }
    if (options.batchTimeout) {
      this.batchTimeout = options.batchTimeout;
    }
    
    console.log(`LoggingService initialized. Enabled: ${this.enabled}`);
  }

  /**
   * Send a debug log message
   * @param {string} message - The log message
   * @param {Object} context - Additional context data
   */
  debug(message, context = {}) {
    this.log(message, this.LOG_LEVELS.DEBUG, context);
  }

  /**
   * Send an info log message
   * @param {string} message - The log message
   * @param {Object} context - Additional context data
   */
  info(message, context = {}) {
    this.log(message, this.LOG_LEVELS.INFO, context);
  }

  /**
   * Send a warning log message
   * @param {string} message - The log message
   * @param {Object} context - Additional context data
   */
  warning(message, context = {}) {
    this.log(message, this.LOG_LEVELS.WARNING, context);
  }

  /**
   * Send an error log message
   * @param {string} message - The log message
   * @param {Object} context - Additional context data
   */
  error(message, context = {}) {
    this.log(message, this.LOG_LEVELS.ERROR, context);
  }

  /**
   * Log an error object
   * @param {Error} error - The error object
   * @param {string} message - Optional message to include
   * @param {Object} context - Additional context data
   */
  logError(error, message = '', context = {}) {
    const errorMessage = message || error.message;
    const errorContext = {
      ...context,
      errorName: error.name,
      stack: error.stack,
      originalMessage: error.message
    };
    
    this.error(errorMessage, errorContext);
  }

  /**
   * Internal method to create and queue a log entry
   * @param {string} message - The log message
   * @param {string} level - The log level
   * @param {Object} context - Additional context data
   * @private
   */
  log(message, level, context = {}) {
    if (!this.enabled) return;
    
    try {
      const logEntry = {
        dt: new Date().toISOString(),
        message,
        level,
        source: this.sourceId,
        context: {
          ...context,
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      };
      
      this.queueLog(logEntry);
      
      // Also log to console in development
      if (process.env.NODE_ENV !== 'production') {
        const consoleMethod = level === this.LOG_LEVELS.ERROR ? 'error' :
                             level === this.LOG_LEVELS.WARNING ? 'warn' :
                             level === this.LOG_LEVELS.INFO ? 'info' : 'debug';
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context);
      }
    } catch (error) {
      console.error('Error creating log entry:', error);
    }
  }

  /**
   * Add a log entry to the queue and schedule sending if needed
   * @param {Object} logEntry - The log entry to queue
   * @private
   */
  queueLog(logEntry) {
    this.logQueue.push(logEntry);
    
    // If we've reached the batch size, send immediately
    if (this.logQueue.length >= this.batchSize) {
      this.sendLogs();
    } else if (!this.batchTimer) {
      // Otherwise, set a timer to send after the timeout
      this.batchTimer = setTimeout(() => this.sendLogs(), this.batchTimeout);
    }
  }

  /**
   * Send queued logs to BetterStack
   * @private
   */
  async sendLogs() {
    if (!this.logQueue.length) return;
    
    // Clear the batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    const logsToSend = [...this.logQueue];
    this.logQueue = [];
    
    try {
      const payload = logsToSend.length === 1 ? logsToSend[0] : logsToSend;
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Sending logs to: ${this.apiUrl}`);
      }
      
      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        }
      });
      
      if (response.status !== 202) {
        console.warn(`Unexpected response from logging service: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending logs to BetterStack:', error.message);
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error details:', error);
      }
      
      // If sending fails, add the logs back to the queue
      this.logQueue = [...logsToSend, ...this.logQueue];
      
      // Limit queue size to prevent memory issues
      if (this.logQueue.length > this.batchSize * 5) {
        this.logQueue = this.logQueue.slice(-this.batchSize * 5);
      }
    }
  }

  /**
   * Send a metric to BetterStack
   * @param {string} name - The metric name
   * @param {number} value - The metric value
   * @param {Object} tags - Optional tags for the metric
   */
  sendMetric(name, value, tags = {}) {
    if (!this.enabled) return;
    
    try {
      const metricData = {
        dt: new Date().toISOString(),
        name,
        gauge: { value },
        source: this.sourceId,
        tags
      };
      
      axios.post(`${this.apiUrl}/metrics`, metricData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        }
      }).catch(error => {
        console.error('Error sending metric to BetterStack:', error);
      });
      
      // Also log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[METRIC] ${name}: ${value}`, tags);
      }
    } catch (error) {
      console.error('Error creating metric:', error);
    }
  }

  /**
   * Flush any remaining logs in the queue
   * This should be called before the application terminates
   */
  flush() {
    if (this.logQueue.length) {
      this.sendLogs();
    }
  }
}

// Create a singleton instance
const loggingService = new LoggingService();

export default loggingService;
