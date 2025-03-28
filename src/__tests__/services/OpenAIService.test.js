/**
 * OpenAIService.test.js
 * Unit tests for the OpenAIService
 */
import axios from 'axios';
import OpenAIService from '../../services/OpenAIService';

// Mock axios
jest.mock('axios');

describe('OpenAIService', () => {
  // Save original localStorage methods and console methods
  const originalLocalStorage = global.localStorage;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    
    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset API key
    OpenAIService.apiKey = '';
    OpenAIService.conversationHistory = [];
  });
  
  afterEach(() => {
    // Restore original localStorage and console methods
    global.localStorage = originalLocalStorage;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  describe('initialization', () => {
    test('should initialize with empty API key by default', () => {
      // Create a new instance with empty localStorage
      localStorage.getItem.mockReturnValue(null);
      const service = new OpenAIService();
      
      expect(service.apiKey).toBe('');
    });
    
    test('should load API key from localStorage if available', () => {
      // Mock localStorage to return an API key
      localStorage.getItem.mockReturnValue('test-api-key');
      
      // Create a new instance
      const service = new OpenAIService();
      
      expect(service.apiKey).toBe('test-api-key');
    });
  });
  
  describe('setApiKey', () => {
    test('should set the API key', () => {
      OpenAIService.setApiKey('new-api-key');
      expect(OpenAIService.apiKey).toBe('new-api-key');
    });
  });
  
  describe('sendMessage', () => {
    test('should throw an error if no API key is set', async () => {
      // Ensure API key is empty
      OpenAIService.apiKey = '';
      
      // Attempt to send a message
      await expect(OpenAIService.sendMessage('Test message')).rejects.toThrow();
    });
    
    test('should make a POST request to the OpenAI API', async () => {
      // Set API key
      OpenAIService.apiKey = 'test-api-key';
      
      // Mock successful API response
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: 'API response'
            }
          }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        }
      });
      
      // Send a message
      const response = await OpenAIService.sendMessage('Test message');
      
      // Check if axios.post was called with correct parameters
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.any(String)
            }),
            expect.objectContaining({
              role: 'user',
              content: 'Test message'
            })
          ])
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );
      
      // Check response format
      expect(response).toEqual(expect.objectContaining({
        response: 'API response',
        usage: expect.objectContaining({
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        })
      }));
    });
    
    test('should save message to conversation history if requested', async () => {
      // Set API key
      OpenAIService.apiKey = 'test-api-key';
      
      // Mock successful API response
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: 'API response'
            }
          }],
          usage: {}
        }
      });
      
      // Send a message with saveToHistory = true
      await OpenAIService.sendMessage('Test message', { saveToHistory: true });
      
      // Check if the message was added to conversation history
      expect(OpenAIService.conversationHistory.length).toBe(1);
      expect(OpenAIService.conversationHistory[0]).toEqual(expect.objectContaining({
        request: 'Test message',
        response: 'API response'
      }));
      
      // Check if the history was saved to localStorage
      expect(localStorage.setItem).toHaveBeenCalled();
    });
    
    test('should not save message to conversation history if not requested', async () => {
      // Set API key
      OpenAIService.apiKey = 'test-api-key';
      
      // Mock successful API response
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: 'API response'
            }
          }],
          usage: {}
        }
      });
      
      // Send a message with saveToHistory = false
      await OpenAIService.sendMessage('Test message', { saveToHistory: false });
      
      // Check if the message was not added to conversation history
      expect(OpenAIService.conversationHistory.length).toBe(0);
    });
    
    test('should handle API errors', async () => {
      // Set API key
      OpenAIService.apiKey = 'test-api-key';
      
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));
      
      // Attempt to send a message
      await expect(OpenAIService.sendMessage('Test message')).rejects.toThrow();
      
      // Check if error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('conversation history management', () => {
    test('should save conversation history to localStorage', () => {
      // Add some items to conversation history
      OpenAIService.conversationHistory = [
        { request: 'Request 1', response: 'Response 1' },
        { request: 'Request 2', response: 'Response 2' }
      ];
      
      // Save to localStorage
      OpenAIService.saveTrainingDataToLocalStorage();
      
      // Check if localStorage.setItem was called
      expect(localStorage.setItem).toHaveBeenCalled();
    });
    
    test('should load conversation history from localStorage', () => {
      // Mock localStorage to return conversation history
      localStorage.getItem.mockReturnValue(JSON.stringify([
        { request: 'Request 1', response: 'Response 1' },
        { request: 'Request 2', response: 'Response 2' }
      ]));
      
      // Load from localStorage
      OpenAIService.loadTrainingDataFromLocalStorage();
      
      // Check if conversation history was loaded
      expect(OpenAIService.trainingData.length).toBe(2);
      expect(OpenAIService.trainingData[0].request).toBe('Request 1');
      expect(OpenAIService.trainingData[1].response).toBe('Response 2');
    });
    
    test('should clear conversation history', () => {
      // Add some items to conversation history
      OpenAIService.conversationHistory = [
        { request: 'Request 1', response: 'Response 1' },
        { request: 'Request 2', response: 'Response 2' }
      ];
      
      // Clear conversation history
      OpenAIService.clearConversationHistory();
      
      // Check if conversation history is empty
      expect(OpenAIService.conversationHistory.length).toBe(0);
    });
  });
});
