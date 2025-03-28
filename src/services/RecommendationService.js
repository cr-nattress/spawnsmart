/**
 * RecommendationService.js
 * 
 * This service handles generating personalized recommendations for mushroom cultivation
 * by combining user data with the OpenAI API and training model data.
 */

import OpenAIService from './OpenAIService';
import UserDataService from './UserDataService';
import MyceliumDataService from './MyceliumDataService';
import LoggingService from './LoggingService';
import trainingModel from '../data/recommendation-training-model.json';

class RecommendationService {
  constructor() {
    this.cachedRecommendations = null;
    this.lastUserDataHash = '';
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.maxRequests = 3;
    
    LoggingService.info('RecommendationService initialized', {
      maxRequests: this.maxRequests
    });
  }

  /**
   * Reset the request count and last request time
   * Used when the user resets to defaults
   */
  resetRequestLimits() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
    
    LoggingService.info('RecommendationService request limits reset');
  }

  /**
   * Check if we can make a new request based on rate limiting rules
   * @returns {boolean} Whether a new request is allowed
   */
  canMakeNewRequest() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minimumInterval = 5000; // 5 seconds in milliseconds

    // Check if we've hit the maximum number of requests
    if (this.requestCount >= this.maxRequests) {
      LoggingService.warning('Maximum request count reached', {
        requestCount: this.requestCount,
        maxRequests: this.maxRequests
      });
      return false;
    }

    // Check if enough time has passed since the last request
    if (this.lastRequestTime > 0 && timeSinceLastRequest < minimumInterval) {
      LoggingService.warning('Rate limit: Too soon since last request', {
        timeSinceLastRequest,
        minimumInterval
      });
      return false;
    }

    return true;
  }

  /**
   * Generate a hash of user data to determine if we need to regenerate recommendations
   * @param {Object} userData - The user data object
   * @returns {string} A string hash representing the user data state
   */
  generateUserDataHash(userData) {
    return JSON.stringify({
      experienceLevel: userData.experienceLevel,
      spawnAmount: userData.spawnAmount,
      substrateRatio: userData.substrateRatio,
      substrateType: userData.substrateType,
      containerSize: userData.containerSize
    });
  }

  /**
   * Get personalized recommendations based on user data
   * @param {boolean} forceRefresh - Whether to force a refresh of recommendations
   * @returns {Promise<Object>} Object containing recommendations
   */
  async getPersonalizedRecommendations(forceRefresh = false) {
    const userData = UserDataService.getUserData();
    const currentHash = this.generateUserDataHash(userData);
    
    // Return cached recommendations if user data hasn't changed and we're not forcing refresh
    if (!forceRefresh && this.cachedRecommendations && currentHash === this.lastUserDataHash) {
      LoggingService.debug('Using cached recommendations', {
        experienceLevel: userData.experienceLevel,
        source: this.cachedRecommendations.source
      });
      return this.cachedRecommendations;
    }

    try {
      // If OpenAI API key is available, use AI-generated recommendations
      if (OpenAIService.apiKey) {
        // Check if we can make a new request based on rate limiting
        if (!this.canMakeNewRequest()) {
          LoggingService.info('Request limits reached, using static recommendations', {
            requestCount: this.requestCount,
            maxRequests: this.maxRequests
          });
          const staticRecommendations = this.getStaticRecommendations(userData);
          return {
            ...staticRecommendations,
            source: 'static',
            limitReached: true
          };
        }

        // Update request tracking
        this.lastRequestTime = Date.now();
        this.requestCount++;
        LoggingService.info(`Making OpenAI request for recommendations`, {
          requestNumber: this.requestCount,
          maxRequests: this.maxRequests,
          experienceLevel: userData.experienceLevel
        });

        const recommendations = await this.getAIRecommendations(userData);
        this.cachedRecommendations = recommendations;
        this.lastUserDataHash = currentHash;
        
        LoggingService.info('Successfully generated AI recommendations', {
          experienceLevel: userData.experienceLevel,
          recommendationCount: recommendations.personalizedRecommendations.length
        });
        
        // Track recommendation generation time as a metric
        LoggingService.sendMetric('recommendation_generation_success', 1, {
          experienceLevel: userData.experienceLevel,
          source: 'ai'
        });
        
        return recommendations;
      } else {
        // Fall back to static recommendations if no API key is available
        LoggingService.warning('No API key available, using static recommendations');
        const recommendations = this.getStaticRecommendations(userData);
        this.cachedRecommendations = recommendations;
        this.lastUserDataHash = currentHash;
        return recommendations;
      }
    } catch (error) {
      LoggingService.logError(error, 'Error generating recommendations', {
        experienceLevel: userData.experienceLevel,
        substrateType: userData.substrateType,
        forceRefresh
      });
      
      // Track recommendation generation failures as a metric
      LoggingService.sendMetric('recommendation_generation_failure', 1, {
        experienceLevel: userData.experienceLevel,
        errorType: error.name || 'unknown'
      });
      
      // Fall back to static recommendations on error
      return this.getStaticRecommendations(userData);
    }
  }

  /**
   * Get AI-generated recommendations using OpenAI
   * @param {Object} userData - The user data object
   * @returns {Promise<Object>} Object containing AI-generated recommendations
   */
  async getAIRecommendations(userData) {
    // Get substrate type label
    const substrateType = MyceliumDataService.substrateTypes.find(
      type => type.id === userData.substrateType
    )?.label || 'unknown';

    // Get experience level label
    const experienceLevel = MyceliumDataService.experienceLevels.find(
      level => level.id === userData.experienceLevel
    )?.label || 'unknown';

    // Create a prompt using the training model data
    const prompt = `
      I'm growing mushrooms with the following setup:
      - Experience level: ${experienceLevel}
      - Spawn amount: ${userData.spawnAmount} quarts
      - Substrate ratio: 1:${userData.substrateRatio}
      - Substrate type: ${substrateType}
      - Container size: ${userData.containerSize} quarts
      
      Based on this information and the training data provided, give me 5 specific recommendations 
      for my cultivation setup. Format your response as a JSON array of strings, with each string 
      being a specific recommendation. Focus on the most relevant tips from the training data for my 
      specific setup.
      
      Training data categories: ${trainingModel.categories.map(cat => cat.category_name).join(', ')}
    `;

    // Create a system prompt using the training model data
    const systemPrompt = `
      You are an expert mushroom cultivation advisor. Your task is to provide personalized 
      recommendations based on the user's cultivation setup and the following training data:
      
      ${trainingModel.categories.map(category => {
        return `Category: ${category.category_name}\n${category.recommendations.join('\n')}`;
      }).join('\n\n')}
      
      Analyze the user's setup and provide the most relevant recommendations from the training data.
      Your response should be a valid JSON array of strings, with each string being a specific recommendation.
      Focus on providing actionable, specific advice that is directly relevant to the user's setup.
    `;

    try {
      const startTime = Date.now();
      const requestId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Log the request details before sending to OpenAI
      LoggingService.info('Preparing OpenAI recommendation request', {
        requestId,
        experienceLevel,
        substrateType,
        spawnAmount: userData.spawnAmount,
        substrateRatio: userData.substrateRatio,
        containerSize: userData.containerSize,
        promptLength: prompt.length,
        systemPromptLength: systemPrompt.length,
        trainingCategories: trainingModel.categories.length,
        timestamp: new Date().toISOString()
      });
      
      // Log a truncated version of the prompt for debugging
      const truncatedPrompt = prompt.length > 300 ? `${prompt.substring(0, 300)}...` : prompt;
      LoggingService.debug('OpenAI recommendation prompt', {
        requestId,
        prompt: truncatedPrompt
      });
      
      // Send the prompt to OpenAI
      const response = await OpenAIService.sendMessage(prompt, {
        saveToHistory: false,
        systemPrompt
      });
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Log the response details
      LoggingService.info('Received OpenAI recommendation response', {
        requestId,
        processingTime,
        responseLength: response.response.length,
        tokenUsage: response.usage,
        timestamp: new Date().toISOString()
      });
      
      // Track the processing time as a metric
      LoggingService.sendMetric('recommendation_processing_time', processingTime, {
        experienceLevel: userData.experienceLevel,
        requestId
      });

      // Parse the response as JSON
      let recommendations;
      try {
        recommendations = JSON.parse(response.response);
        
        // Log successful parsing
        LoggingService.info('Successfully parsed OpenAI response as JSON', {
          requestId,
          recommendationCount: recommendations.length
        });
      } catch (parseError) {
        LoggingService.warning('Failed to parse OpenAI response as JSON, extracting recommendations from text', {
          requestId,
          responseLength: response.response.length,
          errorMessage: parseError.message
        });
        
        // If parsing fails, try to extract recommendations from the text
        recommendations = this.extractRecommendationsFromText(response.response);
        
        LoggingService.info('Extracted recommendations from text', {
          requestId,
          extractedCount: recommendations.length
        });
      }

      // Ensure we have an array of recommendations
      if (!Array.isArray(recommendations)) {
        LoggingService.warning('OpenAI response is not an array, using static recommendations', {
          requestId,
          responseType: typeof recommendations
        });
        return this.getStaticRecommendations(userData);
      }

      // Log the final recommendations
      LoggingService.info('Finalized AI recommendations', {
        requestId,
        count: recommendations.length,
        processingTime
      });
      
      return {
        personalizedRecommendations: recommendations,
        source: 'ai',
        limitReached: false
      };
    } catch (error) {
      LoggingService.logError(error, 'Error getting AI recommendations', {
        experienceLevel,
        substrateType,
        errorType: error.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      });
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Extract recommendations from text when JSON parsing fails
   * @param {string} text - The response text from OpenAI
   * @returns {Array<string>} Array of extracted recommendations
   */
  extractRecommendationsFromText(text) {
    try {
      // Look for numbered lists (1. 2. 3. etc)
      const numberedListRegex = /(\d+\.\s*[^\d\n]+)/g;
      const numberedMatches = text.match(numberedListRegex) || [];
      
      if (numberedMatches.length > 0) {
        return numberedMatches.map(match => match.replace(/^\d+\.\s*/, '').trim());
      }
      
      // Look for bullet points
      const bulletPointRegex = /(•|\*|-)(\s*[^•*\-\n]+)/g;
      const bulletMatches = [];
      let match;
      
      while ((match = bulletPointRegex.exec(text)) !== null) {
        bulletMatches.push(match[2].trim());
      }
      
      if (bulletMatches.length > 0) {
        return bulletMatches;
      }
      
      // If all else fails, split by newlines and filter out empty lines
      return text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('{') && !line.startsWith('}') && !line.startsWith('[') && !line.startsWith(']'));
    } catch (error) {
      LoggingService.warning('Error extracting recommendations from text', { error: error.message });
      return [];
    }
  }

  /**
   * Get static recommendations based on user data
   * @param {Object} userData - The user data object
   * @returns {Object} Object containing static recommendations
   */
  getStaticRecommendations(userData) {
    // Get recommendations based on experience level
    const experienceLevel = MyceliumDataService.experienceLevels.find(
      level => level.id === userData.experienceLevel
    );

    // Get substrate-specific recommendations
    const substrateType = MyceliumDataService.substrateTypes.find(
      type => type.id === userData.substrateType
    );

    // Combine recommendations from experience level and substrate type
    const combinedRecommendations = [
      ...(experienceLevel?.recommendations || []),
      ...(substrateType?.recommendations || [])
    ];

    // Ensure we have at least some recommendations
    if (combinedRecommendations.length === 0) {
      LoggingService.warning('No static recommendations found for user data', userData);
      return {
        personalizedRecommendations: [
          "Maintain proper humidity levels during colonization.",
          "Ensure good air exchange during fruiting.",
          "Keep your workspace clean and sanitized.",
          "Monitor temperature to stay within the optimal range.",
          "Be patient and consistent with your cultivation practices."
        ],
        source: 'static',
        limitReached: false
      };
    }

    return {
      personalizedRecommendations: combinedRecommendations,
      source: 'static',
      limitReached: false
    };
  }
}

// Create a singleton instance
const recommendationServiceInstance = new RecommendationService();

export default recommendationServiceInstance;
