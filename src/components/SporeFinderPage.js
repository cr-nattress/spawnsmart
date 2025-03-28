import React, { useState } from 'react';

/**
 * SporeFinderPage component that helps users find spore sources
 * 
 * @returns {JSX.Element} The rendered SporeFinderPage component
 */
const SporeFinderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Sample spore data - in a real app, this would come from an API or database
  const spores = [
    {
      id: 1,
      name: 'Golden Teacher',
      type: 'cubensis',
      difficulty: 'beginner',
      colonizationTime: '10-14 days',
      suppliers: ['Sporeworks', 'Premium Spores', 'Mushrooms.com'],
      description: 'A classic variety known for moderate potency and ease of cultivation. Excellent for beginners.',
      imageUrl: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      name: 'Blue Oyster',
      type: 'gourmet',
      difficulty: 'beginner',
      colonizationTime: '10-14 days',
      suppliers: ['North Spore', 'Mushroom Mountain', 'Field & Forest'],
      description: 'Fast-growing gourmet mushroom with beautiful blue-gray coloration. Great for beginners.',
      imageUrl: 'https://via.placeholder.com/150'
    },
    {
      id: 3,
      name: 'Lion\'s Mane',
      type: 'medicinal',
      difficulty: 'intermediate',
      colonizationTime: '14-21 days',
      suppliers: ['North Spore', 'Mushroom Mountain', 'Southwest Mushrooms'],
      description: 'Prized for its cognitive benefits and seafood-like taste. Beautiful white, tooth-like appearance.',
      imageUrl: 'https://via.placeholder.com/150'
    },
    {
      id: 4,
      name: 'Pink Oyster',
      type: 'gourmet',
      difficulty: 'beginner',
      colonizationTime: '7-10 days',
      suppliers: ['North Spore', 'Field & Forest', 'Fungi Perfecti'],
      description: 'Fast colonizer with vibrant pink color. Has a bacon-like flavor when cooked.',
      imageUrl: 'https://via.placeholder.com/150'
    },
    {
      id: 5,
      name: 'Reishi',
      type: 'medicinal',
      difficulty: 'intermediate',
      colonizationTime: '21-30 days',
      suppliers: ['Mushroom Mountain', 'Fungi Perfecti', 'Southwest Mushrooms'],
      description: 'Ancient medicinal mushroom known for immune support. Grows with beautiful reddish-brown shelf-like formations.',
      imageUrl: 'https://via.placeholder.com/150'
    },
    {
      id: 6,
      name: 'B+',
      type: 'cubensis',
      difficulty: 'beginner',
      colonizationTime: '10-14 days',
      suppliers: ['Sporeworks', 'Premium Spores', 'Sporeslab'],
      description: 'Resilient strain that produces large mushrooms. Known for being forgiving to cultivation mistakes.',
      imageUrl: 'https://via.placeholder.com/150'
    }
  ];

  // Filter spores based on search term and filter type
  const filteredSpores = spores.filter(spore => {
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
              <option value="gourmet">Gourmet</option>
              <option value="medicinal">Medicinal</option>
            </select>
          </div>
        </div>
        
        {/* Spore Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpores.map(spore => (
            <div key={spore.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <img src={spore.imageUrl} alt={spore.name} className="w-16 h-16 rounded-full mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">{spore.name}</h2>
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                    {spore.type}
                  </span>
                  <span className="inline-block ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                    {spore.difficulty}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{spore.description}</p>
              <div className="mb-4">
                <strong className="text-sm text-gray-700">Colonization Time:</strong>
                <span className="text-sm ml-2">{spore.colonizationTime}</span>
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
