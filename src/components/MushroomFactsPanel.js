import React, { useState, useEffect, useCallback } from 'react';
import OpenAIService from '../services/OpenAIService';
import LoggingService from '../services/LoggingService';
import ContentService from '../services/ContentService';

/**
 * MushroomFactsPanel component for displaying interesting facts about psilocybin mushrooms
 * 
 * @returns {JSX.Element} The rendered MushroomFactsPanel component
 */
const MushroomFactsPanel = () => {
  const [fact, setFact] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState({
    title: 'Mushroom Fact',
    loadingText: 'Loading interesting fact...',
    errorText: 'Unable to load interesting fact. Please check your API key.',
    refreshButton: 'New Fact',
    prompt: `Share one fascinating scientific fact about psilocybin mushrooms that most people don't know. Focus on their biology, history, or ecological role - not their psychoactive effects. Keep it concise (1-2 sentences) and educational.`,
    systemPrompt: `You are a mycology expert sharing educational information about mushrooms. Provide scientifically accurate, interesting facts about psilocybin mushrooms focusing on their biology, ecological role, or scientific history. Avoid discussing recreational use, cultivation techniques, or psychoactive effects. Keep your response concise, educational, and suitable for a general audience.`
  });
  const [contentLoaded, setContentLoaded] = useState(false);

  // Load content from ContentService
  useEffect(() => {
    const loadContent = async () => {
      try {
        const mushroomFactsContent = await ContentService.getComponentContent('mushroomFacts');
        if (mushroomFactsContent && Object.keys(mushroomFactsContent).length > 0) {
          setContent(mushroomFactsContent);
        }
      } catch (error) {
        LoggingService.error('Failed to load mushroom facts content', { error });
      } finally {
        setContentLoaded(true);
      }
    };
    
    loadContent();
  }, []);

  /**
   * Fetch an interesting fact about psilocybin mushrooms from OpenAI
   */
  const fetchInterestingFact = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      LoggingService.info('Fetching new mushroom fact');
      const startTime = Date.now();
      
      // Check if OpenAI API key is available
      if (OpenAIService.apiKey) {
        // Send the prompt to OpenAI
        const response = await OpenAIService.sendMessage(content.prompt, {
          saveToHistory: false,
          systemPrompt: content.systemPrompt
        });
        
        // Set the fact from the response
        setFact(response.response.trim());
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        LoggingService.info('Mushroom fact fetched successfully', {
          processingTime,
          factLength: response.response.length
        });
        
        // Track fact generation as a metric
        LoggingService.sendMetric('mushroom_fact_generation_success', 1, {
          processingTime
        });
      } else {
        // If no API key is available, use a static fact
        const staticFact = ContentService.getRandomStaticFact();
        setFact(staticFact);
        
        LoggingService.info('Using static mushroom fact (no API key)');
      }
    } catch (error) {
      LoggingService.logError(error, 'Error fetching mushroom fact');
      setError(content.errorText);
      
      // Use a static fact as fallback
      const staticFact = ContentService.getRandomStaticFact();
      setFact(staticFact);
      
      // Track fact generation failure as a metric
      LoggingService.sendMetric('mushroom_fact_generation_failure', 1, {
        errorType: error.name || 'unknown'
      });
    } finally {
      setLoading(false);
    }
  }, [content]);

  // Fetch an interesting fact on component mount
  useEffect(() => {
    if (contentLoaded) {
      LoggingService.info('MushroomFactsPanel mounted');
      fetchInterestingFact();
      
      // Track panel view as a metric
      LoggingService.sendMetric('mushroom_facts_panel_view', 1);
    }
    
    return () => {
      LoggingService.debug('MushroomFactsPanel unmounted');
    };
  }, [fetchInterestingFact, contentLoaded]);

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    fetchInterestingFact();
    LoggingService.info('User requested new mushroom fact');
    LoggingService.sendMetric('mushroom_fact_refresh_click', 1);
  };

  return (
    <div className="card mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{content.title}</h2>
        <button 
          onClick={handleRefresh} 
          className="btn btn-secondary text-sm"
          disabled={loading}
        >
          {content.refreshButton}
        </button>
      </div>
      
      <div className="p-2 bg-gray-50 rounded-lg min-h-[80px] flex items-center justify-center">
        {loading ? (
          <p className="text-gray-500">{content.loadingText}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-gray-700">{fact}</p>
        )}
      </div>
    </div>
  );
};

export default MushroomFactsPanel;
