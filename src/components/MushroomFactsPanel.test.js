import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MushroomFactsPanel from './MushroomFactsPanel';
import OpenAIService from '../services/OpenAIService';

// Mock the OpenAIService
jest.mock('../services/OpenAIService', () => ({
  sendMessage: jest.fn()
}));

describe('MushroomFactsPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    OpenAIService.sendMessage.mockResolvedValue({ response: 'Test fact' });
    
    render(<MushroomFactsPanel />);
    
    expect(screen.getByText(/loading interesting fact/i)).toBeInTheDocument();
  });

  test('renders mushroom fact after loading', async () => {
    const testFact = 'Mushrooms can communicate through underground networks';
    OpenAIService.sendMessage.mockResolvedValue({ response: testFact });
    
    render(<MushroomFactsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(testFact)).toBeInTheDocument();
    });
  });

  test('renders fallback fact when API fails', async () => {
    OpenAIService.sendMessage.mockRejectedValue(new Error('API Error'));
    
    render(<MushroomFactsPanel />);
    
    await waitFor(() => {
      expect(screen.getByText(/mushrooms are more closely related to humans than to plants/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/unable to load interesting fact/i)).toBeInTheDocument();
  });

  test('fetches new fact when New Fact button is clicked', async () => {
    const initialFact = 'Initial test fact';
    const newFact = 'New test fact';
    
    // First call returns initial fact, second call returns new fact
    OpenAIService.sendMessage
      .mockResolvedValueOnce({ response: initialFact })
      .mockResolvedValueOnce({ response: newFact });
    
    render(<MushroomFactsPanel />);
    
    // Wait for initial fact to load
    await waitFor(() => {
      expect(screen.getByText(initialFact)).toBeInTheDocument();
    });
    
    // Click New Fact button
    const newFactButton = screen.getByText('New Fact');
    fireEvent.click(newFactButton);
    
    // Button should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for new fact to load
    await waitFor(() => {
      expect(screen.getByText(newFact)).toBeInTheDocument();
    });
    
    // Verify OpenAIService was called twice
    expect(OpenAIService.sendMessage).toHaveBeenCalledTimes(2);
  });

  test('renders attribution text', () => {
    OpenAIService.sendMessage.mockResolvedValue({ response: 'Test fact' });
    
    render(<MushroomFactsPanel />);
    
    expect(screen.getByText(/facts provided by ai/i)).toBeInTheDocument();
  });

  test('sends correct prompt to OpenAI', async () => {
    OpenAIService.sendMessage.mockResolvedValue({ response: 'Test fact' });
    
    render(<MushroomFactsPanel />);
    
    await waitFor(() => {
      expect(OpenAIService.sendMessage).toHaveBeenCalledWith(
        expect.stringContaining('Share one fascinating scientific fact about psilocybin mushrooms'),
        expect.objectContaining({
          saveToHistory: false,
          systemPrompt: expect.stringContaining('You are a mycology expert')
        })
      );
    });
  });
});
