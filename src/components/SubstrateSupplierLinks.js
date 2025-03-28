import React from 'react';
import LoggingService from '../services/LoggingService';

/**
 * SubstrateSupplierLinks component displays a list of businesses that sell substrate
 * with affiliate links to their websites.
 */
const SubstrateSupplierLinks = () => {
    // List of substrate suppliers with their details
    const suppliers = [
        {
            name: "North Spore",
            description: "Premium sterile substrates",
            url: "https://northspore.com/pages/sterile-substrates",
            referralCode: "?ref=spawnsmart"
        },
        {
            name: "Myco Labs",
            description: "Specialized mushroom grow bags",
            url: "https://www.mycolabs.com/mushroom-grow-bags",
            referralCode: "?ref=spawnsmart"
        },
        {
            name: "Mushroom Supplies",
            description: "Premium mushroom substrate",
            url: "https://mushroomsupplies.com/products/premium-mushroom-substrate",
            referralCode: "?ref=spawnsmart"
        },
        {
            name: "Boomer Shroomer",
            description: "Bulk substrate options",
            url: "https://boomershroomer.com/product-category/bulk-substrate/",
            referralCode: "?ref=spawnsmart"
        },
        {
            name: "Midnight Mushroom Co",
            description: "Ready-to-use manure-based substrate",
            url: "https://midnightmushroomco.com/products/ready-to-use-manure-based-substrate",
            referralCode: "?ref=spawnsmart"
        }
    ];

    // Handle click on supplier link
    const handleSupplierClick = (supplierName) => {
        try {
            LoggingService.info('User clicked supplier link', { supplierName });
            LoggingService.sendMetric('supplier_link_click', 1, { supplier: supplierName });
        } catch (error) {
            LoggingService.logError(error, 'Error logging supplier link click');
        }
    };

    return (
        <div className="card mt-4">
            <h2 className="text-xl font-bold mb-3">Substrate Suppliers</h2>
            
            <div className="space-y-2">
                {suppliers.map((supplier, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                        <a 
                            href={`${supplier.url}${supplier.referralCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleSupplierClick(supplier.name)}
                            className="block"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-blue-600">{supplier.name}</h3>
                                <p className="text-xs text-gray-600">{supplier.description}</p>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-3">Note: Links may include affiliate codes.</p>
        </div>
    );
};

export default SubstrateSupplierLinks;
