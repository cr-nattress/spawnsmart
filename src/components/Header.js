import React from 'react';
import headerLogo from '../assets/images/branding/header-logo.png';

/**
 * Header component for displaying the logo and description of a calculator
 * 
 * @param {Object} props Component props
 * @param {string} props.title The main title (not displayed, used for accessibility)
 * @param {string} props.description The description text to display below the logo
 * @returns {JSX.Element} The rendered Header component
 */
const Header = ({ title, description }) => {
  return (
    <div className="header-container relative">
      <div className="text-center">
        <img 
          src={headerLogo} 
          alt={title} 
          className="mx-auto h-96" 
        />
        <div 
          className="absolute w-full text-center" 
          style={{ top: 'calc(50% + 130px)' }}
        >
          <p className="text-secondary-text inline-block max-w-2xl">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
