/**
 * RecommendationService.js
 * 
 * This service handles generating personalized recommendations for mushroom cultivation
 * by combining user data with the OpenAI API and training model data.
 */

import OpenAIService from './OpenAIService';
import UserDataService from './UserDataService';
import MyceliumDataService from './MyceliumDataService';
import trainingModel from '../data/recommendation-training-model.json';

class RecommendationService {
  constructor() {
    this.cachedRecommendations = null;
    this.lastUserDataHash = '';
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.maxRequests = 3;
  }

  /**
   * Reset the request count and last request time
   * Used when the user resets to defaults
   */
  resetRequestLimits() {
    this.requestCount = 0;
    this.lastRequestTime = 0;
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
      console.log('Maximum request count reached');
      return false;
    }

    // Check if enough time has passed since the last request
    if (this.lastRequestTime > 0 && timeSinceLastRequest < minimumInterval) {
      console.log('Rate limit: Too soon since last request');
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
      return this.cachedRecommendations;
    }

    try {
      // If OpenAI API key is available, use AI-generated recommendations
      if (OpenAIService.apiKey) {
        // Check if we can make a new request based on rate limiting
        if (!this.canMakeNewRequest()) {
          console.log('Request limits reached, using static recommendations');
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
        console.log(`Making OpenAI request #${this.requestCount} of ${this.maxRequests}`);

        const recommendations = await this.getAIRecommendations(userData);
        this.cachedRecommendations = recommendations;
        this.lastUserDataHash = currentHash;
        return recommendations;
      } else {
        // Fall back to static recommendations if no API key is available
        const recommendations = this.getStaticRecommendations(userData);
        this.cachedRecommendations = recommendations;
        this.lastUserDataHash = currentHash;
        return recommendations;
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
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

    // Create a system prompt that includes the training data
    const systemPrompt = `
      You are a mushroom cultivation expert assistant. Use the following training data to provide 
      specific, tailored recommendations based on the user's cultivation setup.
      
      Training data: ${JSON.stringify(trainingModel)}
      
      Provide your response as a JSON array of 5 string recommendations. Each recommendation should 
      be specific to the user's setup and drawn from the most relevant tips in the training data.
    `;

    // Send the prompt to OpenAI
    const response = await OpenAIService.sendMessage(prompt, {
      saveToHistory: false,
      saveToTrainingData: true,
      systemPrompt: systemPrompt
    });

    try {
      // Parse the response as JSON
      let recommendations;
      const responseText = response.response;
      
      // Extract JSON array if it's wrapped in code blocks or other text
      const jsonMatch = responseText.match(/\[\s*".*"\s*\]/s) || 
                        responseText.match(/\[\s*'.*'\s*\]/s);
      
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // Try to parse the entire response as JSON
        recommendations = JSON.parse(responseText);
      }
      
      // Ensure we have an array of strings
      if (Array.isArray(recommendations)) {
        return {
          personalizedRecommendations: recommendations.slice(0, 5),
          source: 'ai'
        };
      } else {
        throw new Error('Response format not recognized');
      }
    } catch (error) {
      console.error('Error parsing AI recommendations:', error);
      // Fall back to static recommendations if parsing fails
      return this.getStaticRecommendations(userData);
    }
  }

  /**
   * Get static recommendations based on user data
   * @param {Object} userData - The user data object
   * @returns {Object} Object containing static recommendations
   */
  getStaticRecommendations(userData) {
    // Get recommendations based on experience level
    const baseRecommendations = MyceliumDataService.getRecommendationsByExperience(userData.experienceLevel);
    
    // Get substrate-specific recommendations
    const substrateType = MyceliumDataService.substrateTypes.find(
      type => type.id === userData.substrateType
    );
    
    // Add substrate-specific recommendation if available
    let recommendations = [...baseRecommendations];
    if (substrateType && substrateType.recommendation) {
      recommendations.push(substrateType.recommendation);
    }
    
    // Add ratio-specific recommendation
    if (userData.substrateRatio > 4) {
      recommendations.push('Consider using a higher spawn ratio for faster colonization and reduced contamination risk.');
    } else if (userData.substrateRatio < 3) {
      recommendations.push('Your high spawn ratio should result in faster colonization times.');
    }
    
    // Ensure we have exactly 5 recommendations
    if (recommendations.length < 5) {
      // Add general tips from training model to fill the gaps
      const generalTips = trainingModel.categories
        .flatMap(category => category.tips)
        .slice(0, 5 - recommendations.length);
      
      recommendations = [...recommendations, ...generalTips];
    } else if (recommendations.length > 5) {
      recommendations = recommendations.slice(0, 5);
    }
    
    return {
      personalizedRecommendations: recommendations,
      source: 'static'
    };
  }
}

// Create a singleton instance
const recommendationServiceInstance = new RecommendationService();

export default recommendationServiceInstance;
