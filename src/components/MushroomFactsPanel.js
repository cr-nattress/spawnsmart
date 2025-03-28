import React, { useState, useEffect } from 'react';
import OpenAIService from '../services/OpenAIService';

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
    fetchInterestingFact();
  }, []);

  /**
   * Fetch an interesting fact about psilocybin mushrooms from OpenAI
   */
  const fetchInterestingFact = async () => {
    setLoading(true);
    setError(null);
    
    try {
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
      
      setFact(response.response);
    } catch (err) {
      console.error('Error fetching mushroom fact:', err);
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
    fetchInterestingFact();
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
