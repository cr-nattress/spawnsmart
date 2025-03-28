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
    "Mood Effects": "Euphoric, uplifting, introspective.",
    "Description": "Golden Teacher is one of the most popular cubensis varieties, known for its balanced effects and reliable growth.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
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
    "Mood Effects": "Euphoric, visual, introspective.",
    "Description": "B+ is a resilient and forgiving strain, perfect for beginners with good yields and moderate potency.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
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
    "Mood Effects": "Intense visuals, profound introspection.",
    "Description": "Penis Envy is renowned for its high potency and distinctive appearance, requiring more advanced cultivation techniques.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
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
    "Mood Effects": "Intense visuals, euphoria, deep introspection.",
    "Description": "Psilocybe cyanescens, known as Wavy Caps, is a potent wood-loving species that grows naturally in temperate regions.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
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
    "Strength": "",
    "Mood Effects": "",
    "Description": "Blue Oyster is a popular gourmet mushroom with a mild flavor and meaty texture, excellent for beginners.",
    "Culinary Uses": "Excellent for stir-fries, soups, and meat substitutes.",
    "Medicinal Benefits": "Contains antioxidants and immune-supporting compounds."
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
    "Strength": "",
    "Mood Effects": "",
    "Description": "Lion's Mane is a unique-looking medicinal mushroom with significant cognitive and neurological benefits.",
    "Culinary Uses": "Seafood-like flavor, often used as a crab substitute in recipes.",
    "Medicinal Benefits": "Supports cognitive function, nerve health, and immune system."
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "A+ Mushroom",
    "Spore Name": "A+ Mushroom Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/a-mushroom-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Beginner-friendly; known for fast colonization and resilience.",
    "Size & Appearance": "Medium to large fruits with light golden caps.",
    "Strength": "Moderate",
    "Mood Effects": "Euphoric, visual, balanced experience.",
    "Description": "A+ is a popular beginner strain known for its resilience and consistent performance.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "African Transkei",
    "Spore Name": "African Transkei Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/african-transkei/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Intermediate; originally discovered in South Africa, known for potency.",
    "Size & Appearance": "Thin stems with small to medium caps, often with a pronounced nipple.",
    "Strength": "Strong",
    "Mood Effects": "Energetic, visual, euphoric.",
    "Description": "African Transkei originates from South Africa and is known for its potent and energetic effects.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Ajax",
    "Spore Name": "Ajax Cubensis Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/ajax/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Intermediate; requires consistent conditions for best results.",
    "Size & Appearance": "Medium-sized fruits with caramel-colored caps.",
    "Strength": "Moderate",
    "Mood Effects": "Balanced, mild visuals, introspective.",
    "Description": "Ajax is a lesser-known but reliable cubensis variety with balanced effects.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Albino A+",
    "Spore Name": "Albino A+ Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/albino-a-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Intermediate; leucistic variety with distinctive appearance.",
    "Size & Appearance": "Pale to white caps and stems with bluish bruising.",
    "Strength": "Moderate to Strong",
    "Mood Effects": "Visual, euphoric, introspective.",
    "Description": "Albino A+ is a leucistic (partially albino) variant of the A+ strain with a striking appearance.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Albino Penis Envy",
    "Spore Name": "Albino Penis Envy Spores",
    "Price": "$24.99",
    "URL": "https://pnwspore.com/product/albino-penis-envy-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Advanced; leucistic variety of Penis Envy with high potency.",
    "Size & Appearance": "White to pale fruits with thick stems and small caps, distinctive PE shape.",
    "Strength": "Very Strong",
    "Mood Effects": "Intense visuals, profound introspection, deep euphoria.",
    "Description": "Albino Penis Envy combines the potency of PE with a striking white appearance, one of the most potent varieties available.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Amazon",
    "Spore Name": "Amazon Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/amazon-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Beginner-friendly; originally from the Amazon basin, known for large fruits.",
    "Size & Appearance": "Large caps with dark centers fading to lighter edges, thick stems.",
    "Strength": "Moderate",
    "Mood Effects": "Balanced, euphoric, mild visuals.",
    "Description": "Amazon is a robust strain from South America known for producing large fruits and consistent flushes.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Burma",
    "Spore Name": "Burma Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/burma-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Intermediate; originally from Burma, known for fast colonization.",
    "Size & Appearance": "Medium to large caps with golden-brown coloration.",
    "Strength": "Moderate to Strong",
    "Mood Effects": "Energetic, visual, creative.",
    "Description": "Burma is a fast-colonizing strain originally collected in Myanmar, known for its energetic effects.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Cambodian",
    "Spore Name": "Cambodian Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/cambodian-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Beginner-friendly; fast colonizer with good yields.",
    "Size & Appearance": "Medium-sized with caramel caps and slender stems.",
    "Strength": "Moderate",
    "Mood Effects": "Energetic, creative, mild visuals.",
    "Description": "Cambodian is a fast-growing strain discovered near Angkor Wat, ideal for beginners seeking consistent results.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Ecuador",
    "Spore Name": "Ecuador Mushroom Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/ecuador-mushroom-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Beginner-friendly; originally from the highlands of Ecuador.",
    "Size & Appearance": "Large caps with light brown to golden coloration.",
    "Strength": "Moderate",
    "Mood Effects": "Balanced, euphoric, mild visuals.",
    "Description": "Ecuador is a hardy strain from the Andean highlands, known for its adaptability to various conditions.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Mazatapec",
    "Spore Name": "Mazatapec Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/mazatapec-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Beginner-friendly; ancient variety with historical significance.",
    "Size & Appearance": "Medium caps with cinnamon coloration and long, slender stems.",
    "Strength": "Moderate",
    "Mood Effects": "Spiritual, introspective, mild visuals.",
    "Description": "Mazatapec is a traditional strain used by indigenous Mazatec shamans in Mexico for centuries.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Psilocybe cubensis",
    "Subtype": "Tidal Wave",
    "Spore Name": "Tidal Wave #4 Spores",
    "Price": "$19.99",
    "URL": "https://pnwspore.com/product/tidal-wave-4-spores/",
    "Store": "PNW Spore Co.",
    "Growing Conditions": "Advanced; hybrid strain known for potency and unique appearance.",
    "Size & Appearance": "Varied appearance with wavy caps and thick stems.",
    "Strength": "Very Strong",
    "Mood Effects": "Intense visuals, profound introspection, euphoria.",
    "Description": "Tidal Wave is a potent hybrid cross between B+ and Penis Envy, combining the best traits of both parent strains.",
    "Culinary Uses": "",
    "Medicinal Benefits": ""
  },
  {
    "Mushroom Type": "Gourmet",
    "Subtype": "Pink Oyster",
    "Spore Name": "Pink Oyster Mushroom Culture",
    "Price": "$15.99",
    "URL": "https://northspore.com/collections/cultures/products/pink-oyster-pleurotus-djamor-culture",
    "Store": "North Spore",
    "Growing Conditions": "Beginner-friendly; fast colonizer that prefers warmer temperatures.",
    "Size & Appearance": "Vibrant pink clusters with shelf-like growth pattern.",
    "Strength": "",
    "Mood Effects": "",
    "Description": "Pink Oyster is a fast-growing, heat-loving mushroom with a striking pink color that fades when cooked.",
    "Culinary Uses": "Has a bacon-like flavor when cooked, great for stir-fries.",
    "Medicinal Benefits": "Contains antioxidants and cholesterol-lowering compounds."
  },
  {
    "Mushroom Type": "Medicinal",
    "Subtype": "Reishi",
    "Spore Name": "Reishi Culture",
    "Price": "$18.99",
    "URL": "https://northspore.com/collections/cultures/products/reishi-ganoderma-lucidum-culture",
    "Store": "North Spore",
    "Growing Conditions": "Intermediate; slow-growing but resilient on hardwood substrates.",
    "Size & Appearance": "Reddish-brown shelf-like growth with white edges.",
    "Strength": "",
    "Mood Effects": "",
    "Description": "Reishi is an ancient medicinal mushroom revered in traditional Chinese medicine for thousands of years.",
    "Culinary Uses": "Typically used in teas and extracts rather than culinary applications.",
    "Medicinal Benefits": "Supports immune function and stress response."
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

    // Use the provided description or generate one
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
