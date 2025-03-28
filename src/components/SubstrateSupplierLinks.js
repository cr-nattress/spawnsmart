import React, { useState } from 'react';
import ContentService from '../services/ContentService';
import LoggingService from '../services/LoggingService';

/**
 * Component for displaying links to substrate suppliers
 * with affiliate links to their websites.
 */
const SubstrateSupplierLinks = () => {
    // State to track whether to show featured suppliers only
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(true);
    
    // Get content from ContentService
    const content = ContentService.getComponentContent('substrateSuppliers');
  
    // Get suppliers based on filter setting
    const suppliers = showFeaturedOnly 
      ? ContentService.getFeaturedSuppliers() 
      : ContentService.getAllSuppliers();

    // Handle click on supplier link
    const handleSupplierClick = (supplierId) => {
        // Track the click through ContentService
        ContentService.trackSupplierClick(supplierId);
    };

    // Toggle between featured and all suppliers
    const toggleSupplierDisplay = () => {
        setShowFeaturedOnly(!showFeaturedOnly);
        LoggingService.info(`User toggled supplier display to ${!showFeaturedOnly ? 'featured only' : 'all suppliers'}`);
        LoggingService.sendMetric('supplier_display_toggle', 1, {
            showFeaturedOnly: !showFeaturedOnly
        });
    };

    return (
        <div className="card mt-4 p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{content.title}</h2>
                <button 
                    onClick={toggleSupplierDisplay}
                    className="text-xs text-blue-600 hover:underline"
                >
                    {showFeaturedOnly ? content.viewAllText : content.featuredOnlyText}
                </button>
            </div>
            
            <div className="space-y-3">
                {suppliers.map(supplier => (
                    <div key={supplier.id} className="border rounded p-2 bg-white">
                        <a 
                            href={supplier.url + (supplier.referralCode ? `?ref=${supplier.referralCode}` : '')}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSupplierClick(supplier.id)}
                            className="block hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium text-primary">{supplier.name}</div>
                            <div className="text-sm text-secondary-text">{supplier.description}</div>
                        </a>
                    </div>
                ))}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
                {content.disclaimer}
            </div>
        </div>
    );
};

export default SubstrateSupplierLinks;
