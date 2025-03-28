import React, { useState, useEffect } from 'react';
import OpenAIService from '../services/OpenAIService';
import LoggingService from '../services/LoggingService';

/**
 * AIAdvicePanel component for generating AI-powered cultivation advice
 * 
 * @param {Object} props - Component props
 * @param {Object} props.userData - User data from the calculator
 * @returns {JSX.Element} The rendered AIAdvicePanel component
 */
const AIAdvicePanel = ({ userData }) => {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!localStorage.getItem('openai_api_key'));
  const [hasEnvApiKey, setHasEnvApiKey] = useState(false);

  // Check if API key is available in environment variables
  useEffect(() => {
    const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    setHasEnvApiKey(!!envApiKey && envApiKey !== 'your_openai_api_key_here');
  }, []);

  // Set the API key in the OpenAIService when it changes
  useEffect(() => {
    LoggingService.info('AIAdvicePanel mounted');
    
    if (apiKey) {
      OpenAIService.setApiKey(apiKey);
      LoggingService.debug('API key set in OpenAIService');
    }
    
    // Track panel view as a metric
    LoggingService.sendMetric('ai_advice_panel_view', 1);
    
    return () => {
      LoggingService.debug('AIAdvicePanel unmounted');
    };
  }, [apiKey]);

  /**
   * Save the API key to localStorage
   */
  const handleSaveApiKey = () => {
    try {
      if (apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
        OpenAIService.setApiKey(apiKey);
        setShowApiKeyInput(false);
        LoggingService.info('User saved API key');
        LoggingService.sendMetric('api_key_save', 1);
      }
    } catch (error) {
      LoggingService.logError(error, 'Error saving API key');
      setError('Failed to save API key');
    }
  };

  /**
   * Generate cultivation advice based on user data
   */
  const generateAdvice = async () => {
    if (!hasEnvApiKey && !apiKey) {
      setShowApiKeyInput(true);
      LoggingService.warning('Attempted to generate advice without API key');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      LoggingService.info('Generating cultivation advice', {
        experienceLevel: userData.experienceLevel,
        substrateType: userData.substrateType
      });
      
      const startTime = Date.now();
      
      // Create a prompt for OpenAI
      const prompt = `
        I'm growing mushrooms with the following setup:
        - Experience level: ${userData.experienceLevel}
        - Spawn amount: ${userData.spawnAmount} quarts
        - Substrate ratio: 1:${userData.substrateRatio}
        - Substrate type: ${userData.substrateType}
        - Container size: ${userData.containerSize} quarts
        
        Based on this information, provide me with detailed cultivation advice. 
        Include tips on optimal conditions, potential challenges I might face, and how to maximize yield.
      `;
      
      // Create a system prompt
      const systemPrompt = `
        You are an expert mushroom cultivation advisor. Provide detailed, helpful advice 
        based on the user's specific setup. Focus on practical tips, optimal conditions, 
        and how to maximize success. Your advice should be tailored to their experience level 
        and specific cultivation parameters. Keep your response under 300 words and focus on 
        actionable advice.
      `;
      
      // Send the prompt to OpenAI
      const response = await OpenAIService.sendMessage(prompt, {
        saveToHistory: false,
        systemPrompt: systemPrompt
      });
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      setAdvice(response.response);
      
      LoggingService.info('Successfully generated cultivation advice', {
        responseLength: response.response.length,
        processingTime
      });
      
      // Track advice generation time as a metric
      LoggingService.sendMetric('advice_generation_time', processingTime);
      LoggingService.sendMetric('advice_generation_success', 1);
    } catch (error) {
      LoggingService.logError(error, 'Error generating cultivation advice', {
        experienceLevel: userData.experienceLevel,
        substrateType: userData.substrateType
      });
      
      // Track advice generation failure as a metric
      LoggingService.sendMetric('advice_generation_failure', 1, {
        errorType: error.name || 'unknown'
      });
      
      setError('Failed to generate advice. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold">AI Cultivation Advisor</h2>
      <p className="text-secondary-text mt-2 mb-4">
        Get personalized cultivation advice based on your current settings.
      </p>
      
      {!hasEnvApiKey && (
        <>
          {!showApiKeyInput ? (
            <button 
              className="btn btn-primary mb-4" 
              onClick={() => setShowApiKeyInput(true)}
            >
              Configure OpenAI API Key
            </button>
          ) : (
            <div className="mb-4">
              <label className="block mb-2">OpenAI API Key</label>
              <input 
                type="password" 
                className="input w-full mb-2" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="sk-..."
              />
              <p className="text-xs text-secondary-text mb-2">
                Your API key is stored locally in your browser and never sent to our servers.
                For better security, set the REACT_APP_OPENAI_API_KEY in your .env file.
              </p>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowApiKeyInput(false)}
              >
                Hide
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveApiKey}
                disabled={!apiKey}
              >
                Save
              </button>
            </div>
          )}
        </>
      )}
      
      <button 
        className="btn btn-primary w-full" 
        onClick={generateAdvice} 
        disabled={loading || (!hasEnvApiKey && !apiKey)}
      >
        {loading ? 'Generating Advice...' : 'Generate AI Cultivation Advice'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {advice && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Personalized Advice</h3>
          <div className="p-4 bg-note-bg rounded-lg whitespace-pre-wrap">
            {advice}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={generateAdvice}
              disabled={loading}
            >
              Regenerate Advice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvicePanel;
