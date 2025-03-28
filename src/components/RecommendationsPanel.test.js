import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecommendationsPanel from './RecommendationsPanel';
import RecommendationService from '../services/RecommendationService';

// Mock the RecommendationService
jest.mock('../services/RecommendationService', () => ({
  getPersonalizedRecommendations: jest.fn()
}));

describe('RecommendationsPanel Component', () => {
  const mockRecommendations = [
    'Use a 1:2 spawn to substrate ratio for best results',
    'Maintain humidity between 90-95% during colonization'
  ];

  const mockCultivationTips = [
    'Sterilize all equipment before use',
    'Monitor temperature daily'
  ];

  const mockUserData = {
    experienceLevel: 'beginner',
    spawnAmount: 2,
    substrateType: 'cvg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders static recommendations when AI recommendations are not available', () => {
    // Mock the service to return null (no AI recommendations)
    RecommendationService.getPersonalizedRecommendations.mockResolvedValue(null);
    
    render(
      <RecommendationsPanel 
        recommendations={mockRecommendations}
        cultivationTips={mockCultivationTips}
        userData={mockUserData}
      />
    );
    
    // Check for static recommendations
    expect(screen.getByText('Experience-Based Recommendations')).toBeInTheDocument();
    mockRecommendations.forEach(tip => {
      expect(screen.getByText(tip)).toBeInTheDocument();
    });
  });

  test('renders AI recommendations when available', async () => {
    const mockAiRecommendations = {
      personalizedRecommendations: [
        'Based on your setup, consider increasing FAE',
        'For beginners with CVG, maintain higher humidity'
      ],
      source: 'ai',
      limitReached: false
    };
    
    RecommendationService.getPersonalizedRecommendations.mockResolvedValue(mockAiRecommendations);
    
    render(
      <RecommendationsPanel 
        recommendations={mockRecommendations}
        cultivationTips={mockCultivationTips}
        userData={mockUserData}
      />
    );
    
    // Wait for AI recommendations to load
    await waitFor(() => {
      expect(screen.getByText('AI-Powered Recommendations')).toBeInTheDocument();
    });
    
    // Check for AI recommendations
    mockAiRecommendations.personalizedRecommendations.forEach(tip => {
      expect(screen.getByText(tip)).toBeInTheDocument();
    });
  });

  test('renders general cultivation tips', () => {
    RecommendationService.getPersonalizedRecommendations.mockResolvedValue(null);
    
    render(
      <RecommendationsPanel 
        recommendations={mockRecommendations}
        cultivationTips={mockCultivationTips}
        userData={mockUserData}
      />
    );
    
    expect(screen.getByText('General Cultivation Tips')).toBeInTheDocument();
    mockCultivationTips.forEach(tip => {
      expect(screen.getByText(tip)).toBeInTheDocument();
    });
  });

  test('shows error message when recommendation fetch fails', async () => {
    RecommendationService.getPersonalizedRecommendations.mockRejectedValue(new Error('API Error'));
    
    render(
      <RecommendationsPanel 
        recommendations={mockRecommendations}
        cultivationTips={mockCultivationTips}
        userData={mockUserData}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unable to load personalized recommendations/i)).toBeInTheDocument();
    });
  });

  test('shows limit reached message when API limit is reached', async () => {
    const mockLimitReachedResponse = {
      personalizedRecommendations: mockRecommendations,
      source: 'static',
      limitReached: true
    };
    
    RecommendationService.getPersonalizedRecommendations.mockResolvedValue(mockLimitReachedResponse);
    
    render(
      <RecommendationsPanel 
        recommendations={mockRecommendations}
        cultivationTips={mockCultivationTips}
        userData={mockUserData}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/API request limit reached/i)).toBeInTheDocument();
    });
    
    // Refresh button should be disabled
    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeDisabled();
  });

  test('refresh button triggers new recommendation fetch', async () => {
    RecommendationService.getPersonalizedRecommendations.mockResolvedValue({
      personalizedRecommendations: mockRecommendations,
      source: 'ai',
      limitReached: false
    });
    
    render(
      <RecommendationsPanel 
        recommendations={mockRecommendations}
        cultivationTips={mockCultivationTips}
        userData={mockUserData}
      />
    );
    
    // Click refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    // Check if service was called with forceRefresh=true
    await waitFor(() => {
      expect(RecommendationService.getPersonalizedRecommendations).toHaveBeenCalledWith(true);
    });
  });
});
