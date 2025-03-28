import React, { useState } from 'react';
import ContentService from '../services/ContentService';
import LoggingService from '../services/LoggingService';

/**
 * Component for displaying links to various suppliers in a tabbed interface
 * with tabs for Spores, Grain, Substrate, and Accessories.
 */
const TabbedSupplierLinks = () => {
    // State to track the active tab
    const [activeTab, setActiveTab] = useState('substrate');
    
    // Get content from ContentService
    const content = ContentService.getComponentContent('substrateSuppliers');
  
    // Get suppliers based on active tab
    const getSuppliers = () => {
        return ContentService.getAllSuppliersByType(activeTab);
    };

    // Handle click on supplier link
    const handleSupplierClick = (supplierId) => {
        // Track the click through ContentService
        ContentService.trackSupplierClick(supplierId);
    };
    
    // Handle tab change
    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        LoggingService.info(`User changed supplier tab to ${tabName}`);
        LoggingService.sendMetric('supplier_tab_change', 1, {
            tabName: tabName
        });
    };
    
    // Define the tabs
    const tabs = [
        { id: 'spores', label: 'Spores' },
        { id: 'grain', label: 'Grain' },
        { id: 'substrate', label: 'Substrate' },
        { id: 'accessories', label: 'Accessories' }
    ];
    
    // Get the suppliers for the active tab
    const suppliers = getSuppliers();

    return (
        <div className="card mt-4 p-4 bg-gray-50">
            <div className="mb-2">
                <h2 className="text-lg font-semibold">{content.title}</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`py-2 px-4 text-sm font-medium ${activeTab === tab.id 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Supplier List */}
            <div className="space-y-3">
                {suppliers.length > 0 ? (
                    suppliers.map(supplier => (
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
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        No suppliers found for this category.
                    </div>
                )}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
                {content.disclaimer}
            </div>
        </div>
    );
};

export default TabbedSupplierLinks;
