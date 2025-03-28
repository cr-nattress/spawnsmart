import React from 'react';
import headerLogo from '../assets/images/branding/header-logo.png';
import ContentService from '../services/ContentService';

/**
 * Header component for displaying the logo and description of a calculator
 * in a 2-row layout. The component takes 30% of the screen height, with the top row (logo)
 * taking 60% of the header height and the bottom row (description) taking 40%.
 * 
 * @returns {JSX.Element} The rendered Header component
 */
const Header = () => {
  // Get content from ContentService
  const content = ContentService.getComponentContent('header');

  return (
    <div className="header-container flex flex-col" style={{ height: '30vh' }}>
      {/* Top row - Logo (60% of header height) */}
      <div className="flex items-center justify-center h-3/5 overflow-visible">
        <img 
          src={headerLogo} 
          alt={content.title} 
          className="h-auto" 
          style={{ maxHeight: '200%' }} 
        />
      </div>
      
      {/* Bottom row - Description (40% of header height) */}
      <div className="flex items-center justify-center h-2/5">
        <p className="text-secondary-text text-center max-w-2xl px-4 font-medium" style={{ fontSize: '1.25rem' }}>
          {content.description}
        </p>
      </div>
    </div>
  );
};

export default Header;
