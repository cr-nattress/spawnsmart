import React, { useState, useEffect } from 'react';
import OpenAIService from '../services/OpenAIService';
import LoggingService from '../services/LoggingService';

/**
 * MushroomFactsPanel component for displaying interesting facts about psilocybin mushrooms
 * 
 * @returns {JSX.Element} The rendered MushroomFactsPanel component
 */
const MushroomFactsPanel = () => {
  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch an interesting fact on component mount
  useEffect(() => {
    LoggingService.info('MushroomFactsPanel mounted');
    fetchInterestingFact();
    
    // Track panel view as a metric
    LoggingService.sendMetric('mushroom_facts_panel_view', 1);
    
    return () => {
      LoggingService.debug('MushroomFactsPanel unmounted');
    };
  }, []);

  /**
   * Fetch an interesting fact about psilocybin mushrooms from OpenAI
   */
  const fetchInterestingFact = async () => {
    setLoading(true);
    setError(null);
    
    try {
      LoggingService.info('Fetching new mushroom fact');
      const startTime = Date.now();
      
      // Create a prompt for OpenAI
      const prompt = `Share one fascinating scientific fact about psilocybin mushrooms that most people don't know. 
      Focus on their biology, history, or ecological role - not their psychoactive effects. 
      Keep it concise (1-2 sentences) and educational.`;
      
      // Create a system prompt
      const systemPrompt = `You are a mycology expert sharing educational information about mushrooms. 
      Provide scientifically accurate, interesting facts about psilocybin mushrooms focusing on their biology, 
      ecological role, or scientific history. Avoid discussing recreational use, cultivation techniques, 
      or psychoactive effects. Keep your response concise, educational, and suitable for a general audience.`;
      
      // Send the prompt to OpenAI
      const response = await OpenAIService.sendMessage(prompt, {
        saveToHistory: false,
        systemPrompt: systemPrompt
      });
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      setFact(response.response);
      
      LoggingService.info('Successfully fetched mushroom fact', {
        factLength: response.response.length,
        processingTime
      });
      
      // Track fact generation time as a metric
      LoggingService.sendMetric('mushroom_fact_generation_time', processingTime);
      LoggingService.sendMetric('mushroom_fact_generation_success', 1);
    } catch (err) {
      LoggingService.logError(err, 'Error fetching mushroom fact', {
        component: 'MushroomFactsPanel'
      });
      
      // Track fact generation failure as a metric
      LoggingService.sendMetric('mushroom_fact_generation_failure', 1, {
        errorType: err.name || 'unknown'
      });
      
      setError('Unable to load interesting fact. Please check your API key.');
      setFact('Did you know? Mushrooms are more closely related to humans than to plants!');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a new fact
   */
  const handleNewFact = () => {
    LoggingService.info('User requested new mushroom fact');
    fetchInterestingFact();
    
    // Track new fact button click as a metric
    LoggingService.sendMetric('new_fact_button_click', 1);
  };

  return (
    <div className="card mt-6 p-4 bg-note-bg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Mushroom Fact</h2>
        <button 
          onClick={handleNewFact} 
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'New Fact'}
        </button>
      </div>
      
      {error ? (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="italic">
          {loading ? (
            <div className="animate-pulse">Loading interesting fact...</div>
          ) : (
            fact
          )}
        </div>
      )}
      
      <div className="text-xs text-secondary-text mt-4">
        Facts provided by AI. For educational purposes only.
      </div>
    </div>
  );
};

export default MushroomFactsPanel;
