import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsPanel from './ResultsPanel';

describe('ResultsPanel Component', () => {
  const mockResults = {
    spawnAmount: 2,
    substrateVolume: '10',
    totalMixVolume: '12',
    containerFill: '80'
  };

  const mockIngredients = [
    { ingredient: 'Coco Coir', amount: '5', unit: 'quarts' },
    { ingredient: 'Vermiculite', amount: '3', unit: 'quarts' },
    { ingredient: 'Gypsum', amount: '2', unit: 'cups' }
  ];

  test('renders results data correctly', () => {
    render(<ResultsPanel results={mockResults} ingredients={mockIngredients} />);
    
    expect(screen.getByText(/Spawn Amount: 2 quarts/i)).toBeInTheDocument();
    expect(screen.getByText(/Substrate Volume: 10 quarts/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Mix Volume: 12 quarts/i)).toBeInTheDocument();
    expect(screen.getByText(/Container Fill: 80%/i)).toBeInTheDocument();
  });

  test('renders all ingredients correctly', () => {
    render(<ResultsPanel results={mockResults} ingredients={mockIngredients} />);
    
    mockIngredients.forEach(item => {
      expect(screen.getByText(
        new RegExp(`${item.ingredient}: ${item.amount} ${item.unit}`, 'i')
      )).toBeInTheDocument();
    });
  });

  test('renders section headings', () => {
    render(<ResultsPanel results={mockResults} ingredients={mockIngredients} />);
    
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Substrate Ingredients')).toBeInTheDocument();
  });

  test('handles empty ingredients array', () => {
    render(<ResultsPanel results={mockResults} ingredients={[]} />);
    
    expect(screen.getByText('Results')).toBeInTheDocument();
    expect(screen.getByText('Substrate Ingredients')).toBeInTheDocument();
    // Should not throw an error with empty ingredients
  });
});
