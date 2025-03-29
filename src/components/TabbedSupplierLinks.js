import React, { useState, useEffect } from 'react';
import ContentService from '../services/ContentService';
import LoggingService from '../services/LoggingService';

/**
 * Component for displaying links to various suppliers in a tabbed interface
 * with tabs for Spores, Grain, Substrate, and Accessories.
 */
const TabbedSupplierLinks = () => {
    // State to track the active tab and suppliers
    const [activeTab, setActiveTab] = useState('substrate');
    const [suppliers, setSuppliers] = useState([]);
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Load content and initial suppliers
    useEffect(() => {
        const loadData = async () => {
            try {
                // Get component content
                const componentContent = await ContentService.getComponentContent('substrateSuppliers');
                setContent(componentContent);
                
                // Get initial suppliers (substrate tab is default)
                await loadSuppliers('substrate');
            } catch (error) {
                console.error('Error loading supplier data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);
    
    // Load suppliers based on tab
    const loadSuppliers = async (tabName) => {
        try {
            const tabSuppliers = await ContentService.getAllSuppliersByType(tabName);
            setSuppliers(tabSuppliers);
        } catch (error) {
            console.error(`Error loading ${tabName} suppliers:`, error);
            setSuppliers([]);
        }
    };

    // Handle click on supplier link
    const handleSupplierClick = async (supplierId) => {
        // Track the click through ContentService
        await ContentService.trackSupplierClick(supplierId);
    };
    
    // Handle tab change
    const handleTabChange = async (tabName) => {
        setActiveTab(tabName);
        setLoading(true);
        await loadSuppliers(tabName);
        setLoading(false);
        
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

    return (
        <div className="card mt-4 p-4 bg-gray-50">
            <div className="mb-2">
                <h2 className="text-lg font-semibold">{content.title || 'Trusted Suppliers'}</h2>
            </div>
            
            {/* Tab navigation */}
            <div className="flex border-b mb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`px-4 py-2 ${activeTab === tab.id ? 'border-b-2 border-green-500 text-green-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Supplier list */}
            {loading ? (
                <div className="py-4 text-center">
                    <div className="animate-pulse flex space-x-4 justify-center">
                        <div className="flex-1 space-y-4 py-1 max-w-md">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-slate-200 rounded"></div>
                            <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto"></div>
                        </div>
                    </div>
                </div>
            ) : suppliers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suppliers.map(supplier => (
                        <div key={supplier.id} className="p-3 border rounded hover:bg-gray-100 transition-colors">
                            <h3 className="font-medium">{supplier.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{supplier.description}</p>
                            <a
                                href={supplier.url + (supplier.referralCode ? `?ref=${supplier.referralCode}` : '')}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleSupplierClick(supplier.id)}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                                Visit Website {supplier.referralCode && '(10% off)'}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">No suppliers found for this category.</p>
            )}
            
            <div className="mt-2 text-xs text-gray-500">
                {content.disclaimer}
            </div>
        </div>
    );
};

export default TabbedSupplierLinks;
