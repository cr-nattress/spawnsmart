// Import the spore data directly
const sporeDataRaw = [
  // Sample of the data structure
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Golden Teacher",
    "Spore Name": "Golden Teacher Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/golden-teacher-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Beginner-friendly; grows well indoors in warm, humid environments using standard substrates like brown rice flour or manure.",
    "Size & Appearance": "Medium-sized with golden-yellow caps, up to 8 cm wide, and slender pale stems.",
    "Strength": "Moderate to Strong",
    "Mood Effects": "Euphoric, uplifting, introspective."
  }
];

// Fetch the data from the API endpoint
const fetchSporeData = async () => {
  try {
    const response = await fetch('/documentation/enhanced_spore_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching spore data:', error);
    // Return sample data if fetch fails
    return sporeDataRaw;
  }
};

// Process the spore data to standardize fields and add additional information
const processSporeData = (rawData) => {
  return rawData.map((spore, index) => {
    // Extract the difficulty level from Growing Conditions if available
    let difficulty = 'intermediate';
    if (spore['Growing Conditions']) {
      if (spore['Growing Conditions'].toLowerCase().includes('beginner')) {
        difficulty = 'beginner';
      } else if (spore['Growing Conditions'].toLowerCase().includes('advanced') || 
                 spore['Growing Conditions'].toLowerCase().includes('challenging')) {
        difficulty = 'advanced';
      }
    } else {
      // Assign default difficulty based on known varieties
      const subtype = spore['Subtype'].toLowerCase();
      if (['golden teacher', 'b+', 'cambodian', 'z-strain', 'ecuador'].includes(subtype)) {
        difficulty = 'beginner';
      } else if (['penis envy', 'albino penis envy', 'enigma', 'tidal wave'].includes(subtype)) {
        difficulty = 'advanced';
      }
    }

    // Determine the type category
    let type = 'cubensis';
    if (spore['Mushroom Type'] && spore['Mushroom Type'].toLowerCase().includes('cyanescens')) {
      type = 'cyanescens';
    } else if (spore['Subtype'] && ['oyster', 'lion\'s mane', 'reishi', 'shiitake'].some(t => spore['Subtype'].toLowerCase().includes(t))) {
      type = 'gourmet';
    } else if (spore['Subtype'] && ['reishi', 'lion\'s mane', 'cordyceps'].some(t => spore['Subtype'].toLowerCase().includes(t))) {
      type = 'medicinal';
    }

    // Generate a description if not available
    const description = spore['Description'] || 
      `${spore['Subtype']} is a ${difficulty} level ${type} variety. Available from ${spore['Store']}.`;

    // Standardize colonization time
    let colonizationTime = '14-21 days';
    if (difficulty === 'beginner') {
      colonizationTime = '10-14 days';
    } else if (difficulty === 'advanced') {
      colonizationTime = '21-30 days';
    }

    return {
      id: index + 1,
      name: spore['Subtype'] || '',
      type: type,
      difficulty: difficulty,
      colonizationTime: colonizationTime,
      suppliers: [spore['Store'] || 'Unknown'],
      description: description,
      price: spore['Price'] || 'Price not available',
      url: spore['URL'] || '#',
      imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(spore['Subtype'] || 'Mushroom')}`
    };
  });
};

// Consolidate duplicate spore varieties
const consolidateSpores = (sporeData) => {
  const consolidatedSpores = {};
  sporeData.forEach(spore => {
    const key = `${spore.name}-${spore.type}`;
    if (!consolidatedSpores[key]) {
      consolidatedSpores[key] = { ...spore };
    } else {
      // Add unique suppliers
      spore.suppliers.forEach(supplier => {
        if (!consolidatedSpores[key].suppliers.includes(supplier)) {
          consolidatedSpores[key].suppliers.push(supplier);
        }
      });
    }
  });
  return Object.values(consolidatedSpores);
};

// For immediate use, provide the sample data
const initialSporeData = processSporeData(sporeDataRaw);

// Export the processed spore data and the fetch function
export { fetchSporeData, processSporeData, consolidateSpores };
export default initialSporeData;
