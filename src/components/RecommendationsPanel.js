import React, { useState, useEffect } from 'react';
import RecommendationService from '../services/RecommendationService';

/**
 * RecommendationsPanel component for displaying cultivation recommendations and tips
 * 
 * @param {Object} props Component props
 * @param {Array<string>} props.recommendations Experience-based recommendations from static data
 * @param {Array<string>} props.cultivationTips General cultivation tips
 * @param {Object} props.userData User's cultivation data
 * @returns {JSX.Element} The rendered RecommendationsPanel component
 */
const RecommendationsPanel = ({ recommendations, cultivationTips, userData }) => {
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  // Fetch personalized recommendations on component mount
  useEffect(() => {
    fetchPersonalizedRecommendations();
  }, [userData]); // Re-fetch when userData changes

  /**
   * Fetch personalized recommendations from the RecommendationService
   * @param {boolean} forceRefresh Whether to force a refresh of recommendations
   */
  const fetchPersonalizedRecommendations = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await RecommendationService.getPersonalizedRecommendations(forceRefresh);
      setAiRecommendations(result);
      setLimitReached(result.limitReached || false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Unable to load personalized recommendations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh recommendations manually
   */
  const handleRefreshRecommendations = async () => {
    await fetchPersonalizedRecommendations(true);
  };

  // Determine which recommendations to display
  const displayRecommendations = aiRecommendations?.personalizedRecommendations || recommendations;
  const isAiSource = aiRecommendations?.source === 'ai';

  return (
    <div className="notes mt-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">
          {isAiSource ? 'AI-Powered Recommendations' : 'Experience-Based Recommendations'}
        </h2>
        <button 
          onClick={handleRefreshRecommendations} 
          className="btn btn-secondary btn-sm"
          disabled={loading || limitReached}
        >
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {limitReached && (
        <div className="p-3 mb-4 bg-yellow-100 text-yellow-800 rounded-lg">
          API request limit reached. To generate more AI recommendations, click "Reset to Defaults" or wait for the next session.
        </div>
      )}
      
      <ul className="list-disc list-inside mb-6">
        {displayRecommendations.map((tip, index) => (
          <li key={index} className={isAiSource ? 'font-medium' : ''}>{tip}</li>
        ))}
      </ul>
      
      <h2 className="text-xl font-semibold">General Cultivation Tips</h2>
      <ul className="list-disc list-inside">
        {cultivationTips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationsPanel;
