// Import the spore data from the JSON file
import sporeDataRaw from './sporeData.json';

// Process the spore data to standardize fields and add additional information
const sporeData = sporeDataRaw.map((spore, index) => {
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
  if (spore['Mushroom Type'].toLowerCase().includes('cyanescens')) {
    type = 'cyanescens';
  } else if (['oyster', 'lion\'s mane', 'reishi', 'shiitake'].some(t => spore['Subtype'].toLowerCase().includes(t))) {
    type = 'gourmet';
  } else if (['reishi', 'lion\'s mane', 'cordyceps'].some(t => spore['Subtype'].toLowerCase().includes(t))) {
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
    name: spore['Subtype'],
    type: type,
    difficulty: difficulty,
    colonizationTime: colonizationTime,
    suppliers: [spore['Store']],
    description: description,
    price: spore['Price'],
    url: spore['URL'],
    imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(spore['Subtype'])}`
  };
});

// Consolidate duplicate spore varieties by combining their suppliers
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

// Convert back to array
const finalSporeData = Object.values(consolidatedSpores);

// Export the processed spore data for use in components
export default finalSporeData;
