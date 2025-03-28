import React from 'react';
import headerLogo from '../assets/images/branding/header-logo.png';
import ContentService from '../services/ContentService';

/**
 * Header component for displaying the logo and description of a calculator
 * 
 * @returns {JSX.Element} The rendered Header component
 */
const Header = () => {
  // Get content from ContentService
  const content = ContentService.getComponentContent('header');

  return (
    <div className="header-container relative">
      <div className="text-center">
        <img 
          src={headerLogo} 
          alt={content.title} 
          className="mx-auto h-96" 
        />
        <div 
          className="absolute w-full text-center" 
          style={{ top: 'calc(50% + 130px)' }}
        >
          <p className="text-secondary-text inline-block max-w-2xl">{content.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
