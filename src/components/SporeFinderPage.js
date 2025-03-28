import React, { useState, useEffect } from 'react';
import initialSporeData, { fetchSporeData, processSporeData, consolidateSpores } from '../data/sporeData';

/**
 * SporeFinderPage component that helps users find spore sources
 * 
 * @returns {JSX.Element} The rendered SporeFinderPage component
 */
const SporeFinderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sporeData, setSporeData] = useState(initialSporeData);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load the spore data when the component mounts
  useEffect(() => {
    const loadSporeData = async () => {
      try {
        setIsLoading(true);
        const rawData = await fetchSporeData();
        const processedData = processSporeData(rawData);
        const consolidatedData = consolidateSpores(processedData);
        setSporeData(consolidatedData);
      } catch (error) {
        console.error('Error loading spore data:', error);
        // Keep using the initial data if there's an error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSporeData();
  }, []);
  
  // Filter spores based on search term and filter type
  const filteredSpores = sporeData.filter(spore => {
    const matchesSearch = spore.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         spore.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || spore.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full card bg-card-bg p-6 rounded-2xl shadow-md h-full">
        <h1 className="text-2xl font-bold mb-6">Spore Finder</h1>
        <p className="text-gray-600 mb-8">
          Find the perfect spores for your next cultivation project. Browse our database of mushroom varieties
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
        
        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-600">Loading spore data...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default SporeFinderPage;
