// Import a sample of the spore data directly
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
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "B+",
    "Spore Name": "B+ Mushroom Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/b-mushroom-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Beginner-friendly; resilient strain that adapts well to various conditions.",
    "Size & Appearance": "Large caps with caramel coloration and thick stems.",
    "Strength": "Moderate",
    "Mood Effects": "Euphoric, visual, introspective."
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Penis Envy",
    "Spore Name": "Penis Envy Spores",
    "Price": "$24.99",
    "URL": "https://pnwspore.com/product/penis-envy-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Advanced; requires careful attention to humidity and substrate quality.",
    "Size & Appearance": "Distinctive phallic shape with thick stems and small caps.",
    "Strength": "Very Strong",
    "Mood Effects": "Intense visuals, profound introspection."
  },
  {
    "Mushroom Type": "Psilocybe cyanescens",
    "Subtype": "Wavy Caps",
    "Spore Name": "Psilocybe Cyanescens Spores",
    "Price": "$29.99",
    "URL": "https://pnwspore.com/product/psilocybe-cyanescens-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Advanced; prefers woody substrates and cooler temperatures.",
    "Size & Appearance": "Distinctive wavy caps with caramel to chestnut coloration.",
    "Strength": "Very Strong",
    "Mood Effects": "Intense visuals, euphoria, deep introspection."
  },
  {
    "Mushroom Type": "Gourmet",
    "Subtype": "Blue Oyster",
    "Spore Name": "Blue Oyster Mushroom Culture",
    "Price": "$15.99",
    "URL": "https://northspore.com/collections/cultures/products/blue-oyster-pleurotus-ostreatus-var-columbinus-culture",
    "Store": "North Spore",
    "Growing Conditions": "Beginner-friendly; grows well on straw, coffee grounds, and hardwood.",
    "Size & Appearance": "Beautiful blue-gray clusters with shelf-like growth pattern.",
    "Culinary Uses": "Excellent for stir-fries, soups, and meat substitutes."
  },
  {
    "Mushroom Type": "Medicinal",
    "Subtype": "Lion's Mane",
    "Spore Name": "Lion's Mane Culture",
    "Price": "$18.99",
    "URL": "https://northspore.com/collections/cultures/products/lions-mane-hericium-erinaceus-culture",
    "Store": "North Spore",
    "Growing Conditions": "Intermediate; prefers hardwood substrates with high humidity.",
    "Size & Appearance": "Distinctive white, tooth-like or pom-pom appearance.",
    "Medicinal Benefits": "Supports cognitive function, nerve health, and immune system."
  }
];

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
      const subtype = (spore['Subtype'] || '').toLowerCase();
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
    } else if (spore['Mushroom Type'] && spore['Mushroom Type'].toLowerCase().includes('gourmet')) {
      type = 'gourmet';
    } else if (spore['Mushroom Type'] && spore['Mushroom Type'].toLowerCase().includes('medicinal')) {
      type = 'medicinal';
    } else if (spore['Subtype'] && ['oyster', 'lion\'s mane', 'reishi', 'shiitake'].some(t => (spore['Subtype'] || '').toLowerCase().includes(t))) {
      type = 'gourmet';
    } else if (spore['Subtype'] && ['reishi', 'lion\'s mane', 'cordyceps'].some(t => (spore['Subtype'] || '').toLowerCase().includes(t))) {
      type = 'medicinal';
    }

    // Generate a description if not available
    const description = spore['Description'] || 
      `${spore['Subtype'] || 'This mushroom'} is a ${difficulty} level ${type} variety. ${spore['Growing Conditions'] || ''} ${spore['Store'] ? `Available from ${spore['Store']}.` : ''}`;

    // Standardize colonization time
    let colonizationTime = '14-21 days';
    if (difficulty === 'beginner') {
      colonizationTime = '10-14 days';
    } else if (difficulty === 'advanced') {
      colonizationTime = '21-30 days';
    }

    return {
      id: index + 1,
      name: spore['Subtype'] || 'Unknown Variety',
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
const finalSporeData = consolidateSpores(initialSporeData);

// Export the processed spore data
export default finalSporeData;
