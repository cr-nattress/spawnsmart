import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

describe('Header Component', () => {
  test('renders title and description correctly', () => {
    const testTitle = 'Test Title';
    const testDescription = 'Test Description';
    
    render(<Header title={testTitle} description={testDescription} />);
    
    expect(screen.getByText(testTitle)).toBeInTheDocument();
    expect(screen.getByText(testDescription)).toBeInTheDocument();
  });

  test('renders with default props when none are provided', () => {
    render(<Header />);
    
    // Check if the component renders without crashing
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });

  test('includes the logo image', () => {
    render(<Header title="Test" description="Test" />);
    
    const logoImage = screen.getByAltText(/spawnsmart logo/i);
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', expect.stringContaining('header-logo.png'));
  });
});
