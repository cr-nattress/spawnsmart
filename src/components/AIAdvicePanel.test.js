import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIAdvicePanel from './AIAdvicePanel';
import OpenAIService from '../services/OpenAIService';

// Mock the OpenAIService
jest.mock('../services/OpenAIService', () => ({
  generateCultivationAdvice: jest.fn(),
  saveTrainingDataToLocalStorage: jest.fn(),
  setApiKey: jest.fn()
}));

// Mock environment variables
const originalEnv = process.env;

describe('AIAdvicePanel Component', () => {
  const mockUserData = {
    experienceLevel: 'beginner',
    spawnAmount: 2,
    substrateType: 'cvg',
    containerSize: 'medium'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env for each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  test('renders with API key from environment', () => {
    // Set mock API key in environment
    process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
    
    render(<AIAdvicePanel userData={mockUserData} />);
    
    // Should not show API key input option
    expect(screen.queryByText(/configure openai api key/i)).not.toBeInTheDocument();
    
    // Should show generate button
    expect(screen.getByText(/generate ai cultivation advice/i)).toBeInTheDocument();
  });

  test('shows API key configuration when no environment key is available', () => {
    // Clear API key from environment
    process.env.REACT_APP_OPENAI_API_KEY = undefined;
    
    render(<AIAdvicePanel userData={mockUserData} />);
    
    // Should show API key configuration button
    expect(screen.getByText(/configure openai api key/i)).toBeInTheDocument();
  });

  test('shows API key input when configuration button is clicked', () => {
    // Clear API key from environment
    process.env.REACT_APP_OPENAI_API_KEY = undefined;
    
    render(<AIAdvicePanel userData={mockUserData} />);
    
    // Click configure button
    const configureButton = screen.getByText(/configure openai api key/i);
    fireEvent.click(configureButton);
    
    // Should show API key input
    expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    expect(screen.getByText(/your api key is stored locally/i)).toBeInTheDocument();
  });

  test('generate button is disabled without API key', () => {
    // Clear API key from environment
    process.env.REACT_APP_OPENAI_API_KEY = undefined;
    
    render(<AIAdvicePanel userData={mockUserData} />);
    
    // Generate button should be disabled
    const generateButton = screen.getByText(/generate ai cultivation advice/i);
    expect(generateButton).toBeDisabled();
  });

  test('generates advice when button is clicked', async () => {
    // Set mock API key in environment
    process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
    
    // Mock successful advice generation
    const mockAdvice = 'This is some test cultivation advice.';
    OpenAIService.generateCultivationAdvice.mockResolvedValue(mockAdvice);
    
    render(<AIAdvicePanel userData={mockUserData} />);
    
    // Click generate button
    const generateButton = screen.getByText(/generate ai cultivation advice/i);
    fireEvent.click(generateButton);
    
    // Button should show loading state
    expect(screen.getByText(/generating advice/i)).toBeInTheDocument();
    
    // Wait for advice to be generated
    await waitFor(() => {
      expect(screen.getByText(mockAdvice)).toBeInTheDocument();
    });
    
    // Check if OpenAIService was called with correct data
    expect(OpenAIService.generateCultivationAdvice).toHaveBeenCalledWith(mockUserData);
    expect(OpenAIService.saveTrainingDataToLocalStorage).toHaveBeenCalled();
  });

  test('shows error message when advice generation fails', async () => {
    // Set mock API key in environment
    process.env.REACT_APP_OPENAI_API_KEY = 'test-api-key';
    
    // Mock failed advice generation
    const errorMessage = 'API Error';
    OpenAIService.generateCultivationAdvice.mockRejectedValue(new Error(errorMessage));
    
    render(<AIAdvicePanel userData={mockUserData} />);
    
    // Click generate button
    const generateButton = screen.getByText(/generate ai cultivation advice/i);
    fireEvent.click(generateButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/error connecting to openai/i)).toBeInTheDocument();
    });
  });

  test('sets API key when provided via UI', async () => {
    // Clear API key from environment
    process.env.REACT_APP_OPENAI_API_KEY = undefined;
    
    // Mock successful advice generation
    OpenAIService.generateCultivationAdvice.mockResolvedValue('Test advice');
    
    render(<AIAdvicePanel userData={mockUserData} />);
    
    // Click configure button
    const configureButton = screen.getByText(/configure openai api key/i);
    fireEvent.click(configureButton);
    
    // Enter API key
    const apiKeyInput = screen.getByPlaceholderText('sk-...');
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key-from-ui' } });
    
    // Click generate button
    const generateButton = screen.getByText(/generate ai cultivation advice/i);
    fireEvent.click(generateButton);
    
    // Check if OpenAIService.setApiKey was called with the entered key
    expect(OpenAIService.setApiKey).toHaveBeenCalledWith('test-api-key-from-ui');
  });
});
