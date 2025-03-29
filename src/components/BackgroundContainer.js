import React from 'react';

/**
 * Component that provides a full-coverage background image
 * for the application regardless of screen size.
 */
const BackgroundContainer = ({ children }) => {
    return (
        <div className="bg-container relative w-full">
            {/* Fixed background div that covers the entire viewport - hidden on mobile */}
            <div 
                className="fixed inset-0 z-0 hidden md:block" 
                style={{
                    backgroundImage: `url(${require('../assets/images/backgrounds/background.png')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                }}
            />
            
            {/* Content container with proper z-index to appear above the background */}
            <div className="container mx-auto relative z-10 py-8 px-4">
                {children}
            </div>
        </div>
    );
};

export default BackgroundContainer;
