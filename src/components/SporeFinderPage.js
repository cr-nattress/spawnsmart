import React, { useState, useEffect } from 'react';
import ContentService from '../services/ContentService';
import LoggingService from '../services/LoggingService';

/**
 * SporeFinderPage component that helps users find spore sources
 * 
 * @returns {JSX.Element} The rendered SporeFinderPage component
 */
const SporeFinderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sporeData, setSporeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load spore data from ContentService
  useEffect(() => {
    const loadSporeData = async () => {
      try {
        LoggingService.debug('SporeFinderPage: Starting to load spore data');
        setLoading(true);
        setError(null);
        
        // Check if ContentService is initialized
        LoggingService.debug('SporeFinderPage: ContentService state', {
          initialized: await ContentService.ensureInitialized()
        });
        
        const data = await ContentService.getAllSporeData();
        
        // Log the received data
        LoggingService.debug('SporeFinderPage: Received spore data', {
          dataReceived: !!data,
          isArray: Array.isArray(data),
          length: Array.isArray(data) ? data.length : 'not an array',
          sample: Array.isArray(data) && data.length > 0 ? {
            id: data[0].id,
            name: data[0].name,
            type: data[0].type
          } : 'no data'
        });
        
        // Set the data, ensuring it's an array
        setSporeData(Array.isArray(data) ? data : []);
        
        // If we got no data, show a warning
        if (!data || (Array.isArray(data) && data.length === 0)) {
          LoggingService.warn('SporeFinderPage: No spore data received from ContentService');
          setError('No spore data available. Please check back later.');
        }
      } catch (error) {
        LoggingService.error('SporeFinderPage: Error loading spore data:', { 
          error,
          message: error.message,
          stack: error.stack
        });
        setError('Failed to load spore data. Please try again later.');
        setSporeData([]);
      } finally {
        setLoading(false);
        LoggingService.debug('SporeFinderPage: Finished loading spore data', {
          dataLength: sporeData.length,
          hasError: !!error
        });
      }
    };
    
    loadSporeData();
  }, []);
  
  // Filter spores based on search term and filter type
  const filteredSpores = sporeData.filter(spore => {
    // Skip invalid spores
    if (!spore || !spore.name) {
      LoggingService.warn('SporeFinderPage: Invalid spore in data', { spore });
      return false;
    }
    
    const matchesSearch = spore.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (spore.description && spore.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || spore.type === filterType;
    return matchesSearch && matchesType;
  });

  // Log filtered results
  useEffect(() => {
    LoggingService.debug('SporeFinderPage: Filtered spores', {
      totalSpores: sporeData.length,
      filteredCount: filteredSpores.length,
      searchTerm,
      filterType,
      hasError: !!error
    });
  }, [filteredSpores.length, searchTerm, filterType, sporeData.length, error]);

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full card bg-card-bg p-6 rounded-2xl shadow-md h-full">
          <h1 className="text-2xl font-bold mb-6">Spore Finder</h1>
          <div className="animate-pulse space-y-6 py-6">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 mr-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full card bg-card-bg p-6 rounded-2xl shadow-md h-full text-center">
          <h1 className="text-2xl font-bold mb-6">Spore Finder</h1>
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full card bg-card-bg p-6 rounded-2xl shadow-md h-full">
        <h1 className="text-2xl font-bold mb-6">Spore Finder</h1>
        <p className="text-gray-600 mb-8">
          Find the perfect spores for your next cultivation project. Browse our database of {sporeData.length} mushroom varieties
          and discover where to source them.
        </p>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search by name or description..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="cubensis">Cubensis</option>
              <option value="cyanescens">Cyanescens</option>
              <option value="gourmet">Gourmet</option>
              <option value="medicinal">Medicinal</option>
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredSpores.length} of {sporeData.length} varieties
        </div>
        
        {/* Spore Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpores.map(spore => (
            <div key={spore.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <img src={spore.imageUrl} alt={spore.name} className="w-16 h-16 rounded-full mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">{spore.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                      {spore.type}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                      {spore.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{spore.description}</p>
              
              {/* Appearance Information */}
              {spore.appearance && (
                <div className="mb-4">
                  <strong className="text-sm text-gray-700">Appearance:</strong>
                  <span className="text-sm ml-2">{spore.appearance}</span>
                </div>
              )}
              
              {/* Strength Information - Only show for psychoactive varieties */}
              {(spore.type === 'cubensis' || spore.type === 'cyanescens') && spore.strength && (
                <div className="mb-4">
                  <strong className="text-sm text-gray-700">Strength:</strong>
                  <span className="text-sm ml-2">{spore.strength}</span>
                </div>
              )}
              
              {/* Mood Effects - Only show for psychoactive varieties */}
              {(spore.type === 'cubensis' || spore.type === 'cyanescens') && spore.moodEffects && (
                <div className="mb-4">
                  <strong className="text-sm text-gray-700">Effects:</strong>
                  <span className="text-sm ml-2">{spore.moodEffects}</span>
                </div>
              )}
              
              {/* Medicinal Benefits - Only show for medicinal varieties */}
              {spore.type === 'medicinal' && spore.medicinalBenefits && (
                <div className="mb-4">
                  <strong className="text-sm text-gray-700">Medicinal Benefits:</strong>
                  <span className="text-sm ml-2">{spore.medicinalBenefits}</span>
                </div>
              )}
              
              {/* Culinary Uses - Only show for gourmet varieties */}
              {spore.type === 'gourmet' && spore.culinaryUses && (
                <div className="mb-4">
                  <strong className="text-sm text-gray-700">Culinary Uses:</strong>
                  <span className="text-sm ml-2">{spore.culinaryUses}</span>
                </div>
              )}
              
              <div className="mb-4">
                <strong className="text-sm text-gray-700">Colonization Time:</strong>
                <span className="text-sm ml-2">{spore.colonizationTime}</span>
              </div>
              <div className="mb-4">
                <strong className="text-sm text-gray-700">Price:</strong>
                <span className="text-sm ml-2">{spore.price}</span>
              </div>
              <div>
                <strong className="text-sm text-gray-700 block mb-2">Available From:</strong>
                <div className="flex flex-wrap gap-2">
                  {spore.suppliers.map((supplier, index) => (
                    <span 
                      key={index} 
                      className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                    >
                      {supplier}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <a 
                  href={spore.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  View Supplier
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {filteredSpores.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No spores found matching your criteria. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SporeFinderPage;
