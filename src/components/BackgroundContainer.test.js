import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackgroundContainer from './BackgroundContainer';

describe('BackgroundContainer Component', () => {
  test('renders children correctly', () => {
    const testId = 'test-child';
    const { getByTestId } = render(
      <BackgroundContainer>
        <div data-testid={testId}>Test Child</div>
      </BackgroundContainer>
    );
    
    expect(getByTestId(testId)).toBeInTheDocument();
  });

  test('applies correct container class', () => {
    const { container } = render(
      <BackgroundContainer>
        <div>Test Content</div>
      </BackgroundContainer>
    );
    
    // Check if the main container has the expected classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('bg-cover');
    expect(mainContainer).toHaveClass('bg-center');
  });

  test('applies content container class', () => {
    const { container } = render(
      <BackgroundContainer>
        <div>Test Content</div>
      </BackgroundContainer>
    );
    
    // The content container should be the second div (child of the main container)
    const contentContainer = container.firstChild.firstChild;
    expect(contentContainer).toHaveClass('container');
    expect(contentContainer).toHaveClass('mx-auto');
    expect(contentContainer).toHaveClass('p-4');
  });
});
