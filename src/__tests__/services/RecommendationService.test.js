/**
 * RecommendationService.test.js
 * Unit tests for the RecommendationService
 */
import RecommendationService from '../../services/RecommendationService';
import OpenAIService from '../../services/OpenAIService';
import UserDataService from '../../services/UserDataService';
import MyceliumDataService from '../../services/MyceliumDataService';
import LoggingService from '../../services/LoggingService';

// Mock dependencies
jest.mock('../../services/OpenAIService');
jest.mock('../../services/UserDataService');
jest.mock('../../services/MyceliumDataService');
jest.mock('../../services/LoggingService');
jest.mock('../data/recommendation-training-model.json', () => ({
  categories: [
    {
      category_name: 'Test Category 1',
      recommendations: ['Test recommendation 1', 'Test recommendation 2']
    },
    {
      category_name: 'Test Category 2',
      recommendations: ['Test recommendation 3', 'Test recommendation 4']
    }
  ]
}), { virtual: true });

describe('RecommendationService', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock UserDataService.getUserData
    UserDataService.getUserData.mockReturnValue({
      experienceLevel: 'beginner',
      spawnAmount: 1,
      substrateRatio: 2,
      substrateType: 'cvg',
      containerSize: 5
    });
    
    // Mock MyceliumDataService
    MyceliumDataService.experienceLevels = [
      { id: 'beginner', label: 'Beginner', recommendations: ['Beginner tip 1', 'Beginner tip 2'] },
      { id: 'intermediate', label: 'Intermediate', recommendations: ['Intermediate tip'] },
      { id: 'expert', label: 'Expert', recommendations: ['Expert tip'] }
    ];
    
    MyceliumDataService.substrateTypes = [
      { id: 'cvg', label: 'CVG', recommendations: ['CVG tip'] },
      { id: 'manure', label: 'Manure', recommendations: ['Manure tip'] }
    ];
    
    // Reset RecommendationService state
    RecommendationService.cachedRecommendations = null;
    RecommendationService.lastUserDataHash = '';
    RecommendationService.lastRequestTime = 0;
    RecommendationService.requestCount = 0;
  });
  
  describe('initialization', () => {
    test('should initialize with default values', () => {
      expect(RecommendationService.cachedRecommendations).toBeNull();
      expect(RecommendationService.lastUserDataHash).toBe('');
      expect(RecommendationService.lastRequestTime).toBe(0);
      expect(RecommendationService.requestCount).toBe(0);
      expect(RecommendationService.maxRequests).toBe(3);
    });
  });
  
  describe('resetRequestLimits', () => {
    test('should reset request count and last request time', () => {
      // Set some values
      RecommendationService.requestCount = 2;
      RecommendationService.lastRequestTime = 1000;
      
      // Reset limits
      RecommendationService.resetRequestLimits();
      
      // Check if values were reset
      expect(RecommendationService.requestCount).toBe(0);
      expect(RecommendationService.lastRequestTime).toBe(0);
      
      // Check if logging was called
      expect(LoggingService.info).toHaveBeenCalledWith('RecommendationService request limits reset');
    });
  });
  
  describe('canMakeNewRequest', () => {
    test('should return true if request count is below limit', () => {
      // Set request count below limit
      RecommendationService.requestCount = 2;
      RecommendationService.maxRequests = 3;
      
      // Check if new request is allowed
      expect(RecommendationService.canMakeNewRequest()).toBe(true);
    });
    
    test('should return false if request count is at or above limit', () => {
      // Set request count at limit
      RecommendationService.requestCount = 3;
      RecommendationService.maxRequests = 3;
      
      // Check if new request is denied
      expect(RecommendationService.canMakeNewRequest()).toBe(false);
      
      // Check if warning was logged
      expect(LoggingService.warning).toHaveBeenCalledWith(
        'Maximum request count reached',
        expect.objectContaining({
          requestCount: 3,
          maxRequests: 3
        })
      );
    });
    
    test('should return false if not enough time has passed since last request', () => {
      // Set last request time to recent past
      const now = Date.now();
      RecommendationService.lastRequestTime = now - 1000; // 1 second ago
      
      // Check if new request is denied
      expect(RecommendationService.canMakeNewRequest()).toBe(false);
      
      // Check if warning was logged
      expect(LoggingService.warning).toHaveBeenCalledWith(
        'Rate limit: Too soon since last request',
        expect.objectContaining({
          timeSinceLastRequest: expect.any(Number),
          minimumInterval: expect.any(Number)
        })
      );
    });
  });
  
  describe('generateUserDataHash', () => {
    test('should generate a consistent hash for the same user data', () => {
      const userData1 = {
        experienceLevel: 'beginner',
        spawnAmount: 1,
        substrateRatio: 2,
        substrateType: 'cvg',
        containerSize: 5
      };
      
      const userData2 = {
        experienceLevel: 'beginner',
        spawnAmount: 1,
        substrateRatio: 2,
        substrateType: 'cvg',
        containerSize: 5
      };
      
      const hash1 = RecommendationService.generateUserDataHash(userData1);
      const hash2 = RecommendationService.generateUserDataHash(userData2);
      
      expect(hash1).toBe(hash2);
    });
    
    test('should generate different hashes for different user data', () => {
      const userData1 = {
        experienceLevel: 'beginner',
        spawnAmount: 1,
        substrateRatio: 2,
        substrateType: 'cvg',
        containerSize: 5
      };
      
      const userData2 = {
        experienceLevel: 'intermediate',
        spawnAmount: 2,
        substrateRatio: 3,
        substrateType: 'manure',
        containerSize: 10
      };
      
      const hash1 = RecommendationService.generateUserDataHash(userData1);
      const hash2 = RecommendationService.generateUserDataHash(userData2);
      
      expect(hash1).not.toBe(hash2);
    });
  });
  
  describe('getPersonalizedRecommendations', () => {
    test('should return cached recommendations if user data has not changed', async () => {
      // Set cached recommendations
      const cachedRecommendations = {
        personalizedRecommendations: ['Cached recommendation 1', 'Cached recommendation 2'],
        source: 'ai',
        limitReached: false
      };
      RecommendationService.cachedRecommendations = cachedRecommendations;
      
      // Set last user data hash to match current user data
      const userData = UserDataService.getUserData();
      RecommendationService.lastUserDataHash = RecommendationService.generateUserDataHash(userData);
      
      // Get recommendations
      const recommendations = await RecommendationService.getPersonalizedRecommendations();
      
      // Should return cached recommendations
      expect(recommendations).toBe(cachedRecommendations);
      
      // Should log debug message
      expect(LoggingService.debug).toHaveBeenCalledWith(
        'Using cached recommendations',
        expect.objectContaining({
          experienceLevel: 'beginner',
          source: 'ai'
        })
      );
    });
    
    test('should use static recommendations if API key is not available', async () => {
      // Ensure no API key is set
      OpenAIService.apiKey = null;
      
      // Mock getStaticRecommendations
      const staticRecommendations = {
        personalizedRecommendations: ['Static recommendation 1', 'Static recommendation 2'],
        source: 'static',
        limitReached: false
      };
      jest.spyOn(RecommendationService, 'getStaticRecommendations').mockReturnValue(staticRecommendations);
      
      // Get recommendations
      const recommendations = await RecommendationService.getPersonalizedRecommendations();
      
      // Should return static recommendations
      expect(recommendations).toBe(staticRecommendations);
      
      // Should log warning
      expect(LoggingService.warning).toHaveBeenCalledWith('No API key available, using static recommendations');
    });
    
    test('should use static recommendations if request limits are reached', async () => {
      // Set API key
      OpenAIService.apiKey = 'test-api-key';
      
      // Set request count to limit
      RecommendationService.requestCount = 3;
      RecommendationService.maxRequests = 3;
      
      // Mock getStaticRecommendations
      const staticRecommendations = {
        personalizedRecommendations: ['Static recommendation 1', 'Static recommendation 2'],
        source: 'static',
        limitReached: false
      };
      jest.spyOn(RecommendationService, 'getStaticRecommendations').mockReturnValue(staticRecommendations);
      
      // Get recommendations
      const recommendations = await RecommendationService.getPersonalizedRecommendations();
      
      // Should return static recommendations with limitReached flag
      expect(recommendations).toEqual({
        ...staticRecommendations,
        limitReached: true
      });
      
      // Should log info message
      expect(LoggingService.info).toHaveBeenCalledWith(
        'Request limits reached, using static recommendations',
        expect.objectContaining({
          requestCount: 3,
          maxRequests: 3
        })
      );
    });
    
    test('should get AI recommendations if conditions allow', async () => {
      // Set API key
      OpenAIService.apiKey = 'test-api-key';
      
      // Mock getAIRecommendations
      const aiRecommendations = {
        personalizedRecommendations: ['AI recommendation 1', 'AI recommendation 2'],
        source: 'ai',
        limitReached: false
      };
      jest.spyOn(RecommendationService, 'getAIRecommendations').mockResolvedValue(aiRecommendations);
      
      // Get recommendations
      const recommendations = await RecommendationService.getPersonalizedRecommendations();
      
      // Should return AI recommendations
      expect(recommendations).toBe(aiRecommendations);
      
      // Should update cache and hash
      expect(RecommendationService.cachedRecommendations).toBe(aiRecommendations);
      expect(RecommendationService.lastUserDataHash).not.toBe('');
      
      // Should update request tracking
      expect(RecommendationService.requestCount).toBe(1);
      expect(RecommendationService.lastRequestTime).toBeGreaterThan(0);
      
      // Should log info message
      expect(LoggingService.info).toHaveBeenCalledWith(
        'Making OpenAI request for recommendations',
        expect.objectContaining({
          requestNumber: 1,
          maxRequests: 3,
          experienceLevel: 'beginner'
        })
      );
      
      // Should log success message
      expect(LoggingService.info).toHaveBeenCalledWith(
        'Successfully generated AI recommendations',
        expect.objectContaining({
          experienceLevel: 'beginner',
          recommendationCount: 2
        })
      );
      
      // Should send metric
      expect(LoggingService.sendMetric).toHaveBeenCalledWith(
        'recommendation_generation_success',
        1,
        expect.objectContaining({
          experienceLevel: 'beginner',
          source: 'ai'
        })
      );
    });
    
    test('should handle errors and fall back to static recommendations', async () => {
      // Set API key
      OpenAIService.apiKey = 'test-api-key';
      
      // Mock getAIRecommendations to throw an error
      jest.spyOn(RecommendationService, 'getAIRecommendations').mockRejectedValue(new Error('API Error'));
      
      // Mock getStaticRecommendations
      const staticRecommendations = {
        personalizedRecommendations: ['Static recommendation 1', 'Static recommendation 2'],
        source: 'static',
        limitReached: false
      };
      jest.spyOn(RecommendationService, 'getStaticRecommendations').mockReturnValue(staticRecommendations);
      
      // Get recommendations
      const recommendations = await RecommendationService.getPersonalizedRecommendations();
      
      // Should return static recommendations
      expect(recommendations).toBe(staticRecommendations);
      
      // Should log error
      expect(LoggingService.logError).toHaveBeenCalledWith(
        expect.any(Error),
        'Error generating recommendations',
        expect.objectContaining({
          experienceLevel: 'beginner',
          substrateType: 'cvg'
        })
      );
      
      // Should send metric for failure
      expect(LoggingService.sendMetric).toHaveBeenCalledWith(
        'recommendation_generation_failure',
        1,
        expect.objectContaining({
          experienceLevel: 'beginner',
          errorType: 'Error'
        })
      );
    });
  });
  
  describe('getAIRecommendations', () => {
    test('should send a prompt to OpenAI and parse the response', async () => {
      // Mock OpenAIService.sendMessage
      OpenAIService.sendMessage.mockResolvedValue({
        response: JSON.stringify(['AI recommendation 1', 'AI recommendation 2'])
      });
      
      // Get AI recommendations
      const userData = UserDataService.getUserData();
      const recommendations = await RecommendationService.getAIRecommendations(userData);
      
      // Should return parsed recommendations
      expect(recommendations).toEqual({
        personalizedRecommendations: ['AI recommendation 1', 'AI recommendation 2'],
        source: 'ai',
        limitReached: false
      });
      
      // Should call OpenAIService.sendMessage with appropriate prompts
      expect(OpenAIService.sendMessage).toHaveBeenCalledWith(
        expect.stringContaining('I\'m growing mushrooms with the following setup:'),
        expect.objectContaining({
          saveToHistory: false,
          systemPrompt: expect.stringContaining('You are an expert mushroom cultivation advisor')
        })
      );
      
      // Should send metric for processing time
      expect(LoggingService.sendMetric).toHaveBeenCalledWith(
        'recommendation_processing_time',
        expect.any(Number),
        expect.objectContaining({
          experienceLevel: 'beginner'
        })
      );
    });
    
    test('should handle non-JSON responses by extracting recommendations from text', async () => {
      // Mock OpenAIService.sendMessage to return non-JSON text
      OpenAIService.sendMessage.mockResolvedValue({
        response: '1. First recommendation\n2. Second recommendation'
      });
      
      // Mock extractRecommendationsFromText
      jest.spyOn(RecommendationService, 'extractRecommendationsFromText').mockReturnValue([
        'First recommendation',
        'Second recommendation'
      ]);
      
      // Get AI recommendations
      const userData = UserDataService.getUserData();
      const recommendations = await RecommendationService.getAIRecommendations(userData);
      
      // Should return extracted recommendations
      expect(recommendations).toEqual({
        personalizedRecommendations: ['First recommendation', 'Second recommendation'],
        source: 'ai',
        limitReached: false
      });
      
      // Should log warning about parsing failure
      expect(LoggingService.warning).toHaveBeenCalledWith(
        'Failed to parse OpenAI response as JSON, extracting recommendations from text',
        expect.objectContaining({
          responseLength: expect.any(Number)
        })
      );
    });
    
    test('should handle non-array responses by falling back to static recommendations', async () => {
      // Mock OpenAIService.sendMessage to return non-array JSON
      OpenAIService.sendMessage.mockResolvedValue({
        response: '{"message": "This is not an array"}'
      });
      
      // Mock getStaticRecommendations
      const staticRecommendations = {
        personalizedRecommendations: ['Static recommendation 1', 'Static recommendation 2'],
        source: 'static',
        limitReached: false
      };
      jest.spyOn(RecommendationService, 'getStaticRecommendations').mockReturnValue(staticRecommendations);
      
      // Get AI recommendations
      const userData = UserDataService.getUserData();
      const recommendations = await RecommendationService.getAIRecommendations(userData);
      
      // Should return static recommendations
      expect(recommendations).toBe(staticRecommendations);
      
      // Should log warning about non-array response
      expect(LoggingService.warning).toHaveBeenCalledWith(
        'OpenAI response is not an array, using static recommendations',
        expect.objectContaining({
          responseType: 'object'
        })
      );
    });
    
    test('should handle API errors', async () => {
      // Mock OpenAIService.sendMessage to throw an error
      OpenAIService.sendMessage.mockRejectedValue(new Error('API Error'));
      
      // Get AI recommendations
      const userData = UserDataService.getUserData();
      
      // Should throw the error
      await expect(RecommendationService.getAIRecommendations(userData)).rejects.toThrow('API Error');
      
      // Should log error
      expect(LoggingService.logError).toHaveBeenCalledWith(
        expect.any(Error),
        'Error getting AI recommendations',
        expect.objectContaining({
          experienceLevel: 'Beginner',
          substrateType: 'CVG'
        })
      );
    });
  });
  
  describe('extractRecommendationsFromText', () => {
    test('should extract recommendations from numbered lists', () => {
      const text = '1. First recommendation\n2. Second recommendation\n3. Third recommendation';
      
      const recommendations = RecommendationService.extractRecommendationsFromText(text);
      
      expect(recommendations).toEqual([
        'First recommendation',
        'Second recommendation',
        'Third recommendation'
      ]);
    });
    
    test('should extract recommendations from bullet points', () => {
      const text = '• First recommendation\n* Second recommendation\n- Third recommendation';
      
      const recommendations = RecommendationService.extractRecommendationsFromText(text);
      
      expect(recommendations).toEqual([
        'First recommendation',
        'Second recommendation',
        'Third recommendation'
      ]);
    });
    
    test('should fall back to splitting by newlines if no lists are found', () => {
      const text = 'First recommendation\nSecond recommendation\nThird recommendation';
      
      const recommendations = RecommendationService.extractRecommendationsFromText(text);
      
      expect(recommendations).toEqual([
        'First recommendation',
        'Second recommendation',
        'Third recommendation'
      ]);
    });
    
    test('should handle errors gracefully', () => {
      // Create a text that would cause the regex to throw an error
      const badRegex = jest.spyOn(String.prototype, 'match');
      badRegex.mockImplementation(() => { throw new Error('Regex error'); });
      
      const recommendations = RecommendationService.extractRecommendationsFromText('Some text');
      
      expect(recommendations).toEqual([]);
      expect(LoggingService.warning).toHaveBeenCalledWith(
        'Error extracting recommendations from text',
        expect.objectContaining({
          error: 'Regex error'
        })
      );
      
      // Restore the original method
      badRegex.mockRestore();
    });
  });
  
  describe('getStaticRecommendations', () => {
    test('should return recommendations based on experience level and substrate type', () => {
      const userData = {
        experienceLevel: 'beginner',
        substrateType: 'cvg'
      };
      
      const recommendations = RecommendationService.getStaticRecommendations(userData);
      
      expect(recommendations).toEqual({
        personalizedRecommendations: expect.arrayContaining([
          'Beginner tip 1',
          'Beginner tip 2',
          'CVG tip'
        ]),
        source: 'static',
        limitReached: false
      });
    });
    
    test('should provide default recommendations if none are found', () => {
      // Mock empty recommendations
      MyceliumDataService.experienceLevels = [
        { id: 'unknown', label: 'Unknown', recommendations: [] }
      ];
      MyceliumDataService.substrateTypes = [
        { id: 'unknown', label: 'Unknown', recommendations: [] }
      ];
      
      const userData = {
        experienceLevel: 'unknown',
        substrateType: 'unknown'
      };
      
      const recommendations = RecommendationService.getStaticRecommendations(userData);
      
      expect(recommendations.personalizedRecommendations.length).toBeGreaterThan(0);
      expect(recommendations.source).toBe('static');
      
      // Should log warning
      expect(LoggingService.warning).toHaveBeenCalledWith(
        'No static recommendations found for user data',
        userData
      );
    });
  });
});
