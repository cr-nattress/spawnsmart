import React, { useState, useEffect } from 'react';
import OpenAIService from '../services/OpenAIService';

/**
 * AIAdvicePanel component for displaying AI-generated cultivation advice
 * 
 * @param {Object} props Component props
 * @param {Object} props.userData The user's cultivation data
 * @returns {JSX.Element} The rendered AIAdvicePanel component
 */
const AIAdvicePanel = ({ userData }) => {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState('');
  const [hasEnvApiKey, setHasEnvApiKey] = useState(false);

  // Check if API key is available in environment variables
  useEffect(() => {
    const envApiKey = process.env.REACT_APP_OPENAI_API_KEY;
    setHasEnvApiKey(!!envApiKey && envApiKey !== 'your_openai_api_key_here');
  }, []);

  /**
   * Generate AI advice using the OpenAI service
   */
  const generateAdvice = async () => {
    // Reset states
    setError('');
    setLoading(true);
    
    try {
      // Set the API key if provided via UI and not in env
      if (!hasEnvApiKey && apiKey) {
        OpenAIService.setApiKey(apiKey);
      }
      
      // Generate advice
      const generatedAdvice = await OpenAIService.generateCultivationAdvice(userData);
      setAdvice(generatedAdvice);
      
      // Save this exchange to training data
      OpenAIService.saveTrainingDataToLocalStorage();
    } catch (error) {
      console.error('Error generating advice:', error);
      setError(
        error.response?.data?.error?.message || 
        'Error connecting to OpenAI. Please check your API key and try again.'
      );
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
        </div>
      )}
    </div>
  );
};

export default AIAdvicePanel;
