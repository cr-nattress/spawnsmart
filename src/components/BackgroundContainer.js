import React from 'react';

// This is a sample component that demonstrates how to use background images
// You can replace the placeholder with an actual image path once you add images
const BackgroundContainer = ({ children }) => {
    const backgroundStyle = {
        backgroundImage: `url(${require('../assets/images/backgrounds/background.png')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        padding: '2rem 0'
    };

    return (
        <div style={backgroundStyle} className="bg-container">
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    );
};

export default BackgroundContainer;
