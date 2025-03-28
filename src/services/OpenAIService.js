/**
 * OpenAIService.js
 * 
 * This service handles communication with the OpenAI API,
 * including sending messages, receiving responses, and managing training data.
 */

import axios from 'axios';
import LoggingService from './LoggingService';

class OpenAIService {
  constructor() {
    // Try to get API key from environment variables
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY || null;
    this.baseURL = 'https://api.openai.com/v1';
    // Try to get model from environment variables, default to gpt-4o
    this.model = process.env.REACT_APP_OPENAI_MODEL || 'gpt-4o';
    this.trainingData = [];
    this.conversationHistory = [];
    
    // Load training data from localStorage on initialization
    this.loadTrainingDataFromLocalStorage();
    
    LoggingService.info('OpenAIService initialized', {
      model: this.model,
      apiKeyPresent: !!this.apiKey,
      trainingDataCount: this.trainingData.length
    });
  }

  /**
   * Set the OpenAI API key
   * @param {string} apiKey - The OpenAI API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    LoggingService.info('API key set in OpenAIService');
  }

  /**
   * Set the model to use for requests
   * @param {string} model - The model name (e.g., 'gpt-4o', 'gpt-3.5-turbo')
   */
  setModel(model) {
    this.model = model;
    LoggingService.info('OpenAI model updated', { model });
  }

  /**
   * Get the headers for API requests
   * @returns {Object} Headers object with authorization
   */
  getHeaders() {
    if (!this.apiKey) {
      const error = new Error('API key not set. Please call setApiKey() first.');
      LoggingService.warning('Attempted to get headers without API key');
      throw error;
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  /**
   * Send a message to OpenAI and get a response
   * @param {string} message - The message to send
   * @param {Object} options - Additional options for the request
   * @param {boolean} options.saveToHistory - Whether to save this exchange to conversation history
   * @param {boolean} options.saveToTrainingData - Whether to save this exchange to training data
   * @param {Array} options.systemPrompt - Optional system prompt to include
   * @returns {Promise<Object>} The response from OpenAI
   */
  async sendMessage(message, options = {}) {
    const {
      saveToHistory = true,
      saveToTrainingData = false,
      systemPrompt = "You are a helpful assistant specializing in mushroom cultivation."
    } = options;

    try {
      if (!this.apiKey) {
        const error = new Error('API key not set. Please call setApiKey() first.');
        LoggingService.warning('Attempted to send message without API key');
        throw error;
      }

      // Start timing the request
      const startTime = Date.now();
      
      // Prepare messages array with system prompt and conversation history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory,
        { role: 'user', content: message }
      ];
      
      // Log detailed information about the request being sent
      LoggingService.info('Sending request to OpenAI API', {
        messageLength: message.length,
        systemPromptLength: systemPrompt.length,
        model: this.model,
        historyLength: this.conversationHistory.length,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        saveToHistory,
        saveToTrainingData
      });
      
      // Log the actual content being sent (truncated for large messages)
      const truncatedMessage = message.length > 500 ? `${message.substring(0, 500)}...` : message;
      LoggingService.debug('OpenAI request content', {
        userMessage: truncatedMessage,
        systemPrompt: systemPrompt.length > 500 ? `${systemPrompt.substring(0, 500)}...` : systemPrompt
      });

      // Make the API request
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        { headers: this.getHeaders() }
      );

      // Calculate request duration
      const requestDuration = Date.now() - startTime;

      // Check if the response is ok
      if (!response.data) {
        const error = new Error('Error connecting to OpenAI API');
        LoggingService.logError(error, 'OpenAI API error response', {
          status: response.status,
          errorMessage: response.statusText,
          requestDuration
        });
        
        throw error;
      }

      // Extract the assistant's response
      const assistantResponse = response.data.choices[0].message.content;
      
      // Log detailed information about the response received
      LoggingService.info('Received response from OpenAI API', {
        responseLength: assistantResponse.length,
        tokenUsage: response.data.usage,
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens,
        requestDuration,
        model: this.model,
        timestamp: new Date().toISOString()
      });
      
      // Log the actual content received (truncated for large responses)
      const truncatedResponse = assistantResponse.length > 500 ? 
        `${assistantResponse.substring(0, 500)}...` : assistantResponse;
      LoggingService.debug('OpenAI response content', {
        assistantResponse: truncatedResponse
      });
      
      // Track API call metrics
      LoggingService.sendMetric('openai_api_call_success', 1, {
        tokenUsage: response.data.usage,
        requestDuration
      });
      
      // Track request duration as a separate metric
      LoggingService.sendMetric('openai_request_duration', requestDuration, {
        model: this.model
      });

      // Save to conversation history if requested
      if (saveToHistory) {
        this.conversationHistory.push(
          { role: 'user', content: message },
          { role: 'assistant', content: assistantResponse }
        );
        LoggingService.debug('Added exchange to conversation history', {
          historyLength: this.conversationHistory.length
        });
      }

      // Save to training data if requested
      if (saveToTrainingData) {
        this.addToTrainingData({
          input: message,
          output: assistantResponse,
          timestamp: new Date().toISOString(),
          model: this.model
        });
        LoggingService.debug('Added exchange to training data', {
          trainingDataLength: this.trainingData.length
        });
      }

      return {
        response: assistantResponse,
        fullResponse: response.data,
        usage: response.data.usage,
        requestDuration
      };
    } catch (error) {
      // If the error wasn't already logged (from the response.ok check)
      if (!error.status) {
        LoggingService.logError(error, 'Error in OpenAI API call', {
          messageLength: message.length,
          model: this.model,
          timestamp: new Date().toISOString()
        });
      }
      
      // Track API call failure
      LoggingService.sendMetric('openai_api_call_failure', 1, {
        errorType: error.name || 'unknown',
        errorStatus: error.status || 'unknown',
        model: this.model
      });
      
      throw error;
    }
  }

  /**
   * Add an exchange to the training data
   * @param {Object} data - The data to add
   * @param {string} data.input - The user input
   * @param {string} data.output - The model output
   * @param {string} data.timestamp - The timestamp of the exchange
   * @param {string} data.model - The model used
   */
  addToTrainingData(data) {
    this.trainingData.push(data);
  }

  /**
   * Get all training data
   * @returns {Array} The training data
   */
  getTrainingData() {
    return this.trainingData;
  }

  /**
   * Export training data to JSON
   * @returns {string} JSON string of training data
   */
  exportTrainingData() {
    return JSON.stringify(this.trainingData, null, 2);
  }

  /**
   * Import training data from JSON
   * @param {string} jsonData - JSON string of training data
   */
  importTrainingData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        this.trainingData = data;
        return true;
      }
      return false;
    } catch (error) {
      LoggingService.logError(error, 'Error importing training data');
      return false;
    }
  }

  /**
   * Save training data to localStorage
   * @returns {boolean} Whether the save was successful
   */
  saveTrainingDataToLocalStorage() {
    try {
      localStorage.setItem('openaiTrainingData', this.exportTrainingData());
      LoggingService.debug('Saved training data to localStorage');
      return true;
    } catch (error) {
      LoggingService.logError(error, 'Error saving training data to localStorage');
      return false;
    }
  }

  /**
   * Load training data from localStorage
   * @returns {boolean} Whether the load was successful
   */
  loadTrainingDataFromLocalStorage() {
    try {
      const data = localStorage.getItem('openaiTrainingData');
      if (data) {
        return this.importTrainingData(data);
      }
      return false;
    } catch (error) {
      LoggingService.logError(error, 'Error loading training data from localStorage');
      return false;
    }
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory() {
    this.conversationHistory = [];
    LoggingService.info('Cleared conversation history');
  }

  /**
   * Get the current conversation history
   * @returns {Array} The conversation history
   */
  getConversationHistory() {
    return this.conversationHistory;
  }

  /**
   * Generate cultivation advice based on user data
   * @param {Object} userData - The user's cultivation data
   * @returns {Promise<string>} Personalized cultivation advice
   */
  async generateCultivationAdvice(userData) {
    const prompt = `
      I'm growing mushrooms with the following setup:
      - Experience level: ${userData.experienceLevel}
      - Spawn amount: ${userData.spawnAmount} quarts
      - Substrate ratio: 1:${userData.substrateRatio}
      - Substrate type: ${userData.substrateType}
      - Container size: ${userData.containerSize} quarts
      
      Based on this information, can you provide me with personalized cultivation advice?
      Include tips on optimal conditions, potential issues to watch for, and how to maximize yield.
    `;

    const response = await this.sendMessage(prompt, {
      saveToHistory: false,
      systemPrompt: "You are a mycology expert specializing in mushroom cultivation. Provide concise, accurate advice for mushroom growers based on their specific setup. Focus on practical tips that will help them succeed."
    });

    return response.response;
  }
}

// Create a singleton instance
const openAIServiceInstance = new OpenAIService();

export default openAIServiceInstance;
