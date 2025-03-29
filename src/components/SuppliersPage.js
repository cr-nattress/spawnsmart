import React, { useState, useEffect } from 'react';
import TabbedSupplierLinks from './TabbedSupplierLinks';
import ContentService from '../services/ContentService';

/**
 * SuppliersPage component that displays a comprehensive list of suppliers
 * for various mushroom cultivation needs
 * 
 * @returns {JSX.Element} The rendered SuppliersPage component
 */
const SuppliersPage = () => {
  // State for content and suppliers
  const [content, setContent] = useState({});
  const [featuredSuppliers, setFeaturedSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from ContentService
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get component content
        const componentContent = await ContentService.getComponentContent('substrateSuppliers');
        setContent(componentContent);
        
        // Get featured suppliers
        const suppliers = await ContentService.getFeaturedSuppliers();
        setFeaturedSuppliers(suppliers);
      } catch (error) {
        console.error('Error loading supplier data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle supplier click
  const handleSupplierClick = async (supplierId) => {
    await ContentService.trackSupplierClick(supplierId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="w-full card bg-card-bg p-6 rounded-2xl shadow-md h-full">
          <h1 className="text-2xl font-bold mb-4">Loading Suppliers...</h1>
          <div className="animate-pulse flex space-x-4 justify-center">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1 max-w-md">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full card bg-card-bg p-6 rounded-2xl shadow-md h-full">
        <h1 className="text-2xl font-bold mb-4">Mushroom Cultivation Suppliers</h1>
        <p className="text-gray-600 mb-6">
          Find trusted suppliers for all your mushroom cultivation needs. We've curated a list of reliable
          vendors for spores, grain spawn, substrate materials, and cultivation accessories.
        </p>
        
        {/* Featured Suppliers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured Suppliers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSuppliers.slice(0, 3).map(supplier => (
              <div key={supplier.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{supplier.name}</h3>
                <p className="text-gray-600 mb-4">{supplier.description}</p>
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 capitalize">
                    {supplier.type}
                  </span>
                  {supplier.featured && (
                    <span className="inline-block ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Featured
                    </span>
                  )}
                </div>
                <a 
                  href={supplier.url + (supplier.referralCode ? `?ref=${supplier.referralCode}` : '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSupplierClick(supplier.id)}
                  className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tabbed Supplier Links */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Browse All Suppliers</h2>
          <p className="text-gray-600 mb-4">
            Use the tabs below to browse suppliers by category. Each supplier has been verified for quality and reliability.
          </p>
          <TabbedSupplierLinks />
        </div>
        
        {/* Disclaimer */}
        <div className="mt-8 text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium mb-2">Disclaimer:</p>
          <p>{content.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

export default SuppliersPage;
