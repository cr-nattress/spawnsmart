/**
 * LoggingService.test.js
 * Unit tests for the LoggingService
 */
import axios from 'axios';
import LoggingService from '../../services/LoggingService';

// Mock axios
jest.mock('axios');

describe('LoggingService', () => {
  // Save original environment and console methods
  const originalEnv = process.env;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Mock environment variables
    process.env = {
      ...originalEnv,
      REACT_APP_BETTERSTACK_API_URL: 'https://test-api.example.com',
      REACT_APP_BETTERSTACK_API_TOKEN: 'test-token',
      REACT_APP_ENABLE_LOGGING: 'true'
    };
    
    // Reset the service before each test
    LoggingService.init({
      enabled: true,
      batchSize: 2,
      batchTimeout: 100
    });
    
    // Clear any queued logs
    LoggingService.logQueue = [];
    if (LoggingService.batchTimer) {
      clearTimeout(LoggingService.batchTimer);
      LoggingService.batchTimer = null;
    }
  });
  
  afterEach(() => {
    // Restore original environment and console methods
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  describe('initialization', () => {
    test('should initialize with default values', () => {
      const service = new LoggingService();
      expect(service.apiUrl).toBe('https://test-api.example.com');
      expect(service.apiToken).toBe('test-token');
      expect(service.enabled).toBe(true);
      expect(service.batchSize).toBe(10);
      expect(service.batchTimeout).toBe(5000);
    });
    
    test('should initialize with custom values', () => {
      const service = new LoggingService();
      service.init({
        enabled: false,
        batchSize: 5,
        batchTimeout: 2000
      });
      
      expect(service.enabled).toBe(false);
      expect(service.batchSize).toBe(5);
      expect(service.batchTimeout).toBe(2000);
    });
  });
  
  describe('logging methods', () => {
    test('debug method should call log with DEBUG level', () => {
      // Spy on the log method
      const logSpy = jest.spyOn(LoggingService, 'log');
      
      // Call debug method
      LoggingService.debug('Test debug message', { test: true });
      
      // Check if log was called with correct parameters
      expect(logSpy).toHaveBeenCalledWith(
        'Test debug message',
        LoggingService.LOG_LEVELS.DEBUG,
        { test: true }
      );
    });
    
    test('info method should call log with INFO level', () => {
      const logSpy = jest.spyOn(LoggingService, 'log');
      LoggingService.info('Test info message', { test: true });
      expect(logSpy).toHaveBeenCalledWith(
        'Test info message',
        LoggingService.LOG_LEVELS.INFO,
        { test: true }
      );
    });
    
    test('warning method should call log with WARNING level', () => {
      const logSpy = jest.spyOn(LoggingService, 'log');
      LoggingService.warning('Test warning message', { test: true });
      expect(logSpy).toHaveBeenCalledWith(
        'Test warning message',
        LoggingService.LOG_LEVELS.WARNING,
        { test: true }
      );
    });
    
    test('error method should call log with ERROR level', () => {
      const logSpy = jest.spyOn(LoggingService, 'log');
      LoggingService.error('Test error message', { test: true });
      expect(logSpy).toHaveBeenCalledWith(
        'Test error message',
        LoggingService.LOG_LEVELS.ERROR,
        { test: true }
      );
    });
    
    test('logError method should call log with ERROR level and format error object', () => {
      const logSpy = jest.spyOn(LoggingService, 'log');
      const testError = new Error('Test error');
      LoggingService.logError(testError, 'Error occurred', { test: true });
      
      expect(logSpy).toHaveBeenCalledWith(
        'Error occurred',
        LoggingService.LOG_LEVELS.ERROR,
        expect.objectContaining({
          test: true,
          error: expect.objectContaining({
            message: 'Test error',
            name: 'Error'
          })
        })
      );
    });
  });
  
  describe('log batching', () => {
    test('should add logs to queue', () => {
      LoggingService.log('Test message 1', LoggingService.LOG_LEVELS.INFO, { test: 1 });
      expect(LoggingService.logQueue.length).toBe(1);
      
      LoggingService.log('Test message 2', LoggingService.LOG_LEVELS.INFO, { test: 2 });
      expect(LoggingService.logQueue.length).toBe(2);
    });
    
    test('should send logs when batch size is reached', async () => {
      // Mock successful API response
      axios.post.mockResolvedValue({ status: 200 });
      
      // Set batch size to 2
      LoggingService.batchSize = 2;
      
      // Add logs to queue
      LoggingService.log('Test message 1', LoggingService.LOG_LEVELS.INFO, { test: 1 });
      LoggingService.log('Test message 2', LoggingService.LOG_LEVELS.INFO, { test: 2 });
      
      // Queue should be empty after sending
      expect(LoggingService.logQueue.length).toBe(0);
      
      // Check if axios.post was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        'https://test-api.example.com',
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Test message 1',
            level: 'info',
            context: expect.objectContaining({ test: 1 })
          }),
          expect.objectContaining({
            message: 'Test message 2',
            level: 'info',
            context: expect.objectContaining({ test: 2 })
          })
        ]),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
    
    test('should not send logs when logging is disabled', () => {
      // Disable logging
      LoggingService.enabled = false;
      
      // Add logs to queue
      LoggingService.log('Test message', LoggingService.LOG_LEVELS.INFO, { test: true });
      
      // Queue should be empty (logs are discarded when disabled)
      expect(LoggingService.logQueue.length).toBe(0);
      
      // axios.post should not be called
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
  
  describe('metrics', () => {
    test('sendMetric should call log with metric format', () => {
      const logSpy = jest.spyOn(LoggingService, 'log');
      
      LoggingService.sendMetric('test_metric', 42, { category: 'test' });
      
      expect(logSpy).toHaveBeenCalledWith(
        'METRIC test_metric',
        LoggingService.LOG_LEVELS.INFO,
        expect.objectContaining({
          metric_value: 42,
          category: 'test',
          metric_name: 'test_metric'
        })
      );
    });
  });
  
  describe('error handling', () => {
    test('should handle API errors gracefully', async () => {
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));
      
      // Add logs to queue
      LoggingService.log('Test message 1', LoggingService.LOG_LEVELS.INFO, { test: 1 });
      LoggingService.log('Test message 2', LoggingService.LOG_LEVELS.INFO, { test: 2 });
      
      // Queue should be empty (logs are discarded after failed send attempt)
      expect(LoggingService.logQueue.length).toBe(0);
      
      // console.error should be called with error message
      expect(console.error).toHaveBeenCalledWith(
        'Error sending logs to BetterStack:',
        expect.any(Error)
      );
    });
  });
});
