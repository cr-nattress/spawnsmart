/**
 * MyceliumDataService.js
 * 
 * This service provides data for the Mycelium Mix Calculator form options
 * including experience levels, substrate types, and recommendations.
 */

// Experience level options with associated default values
const experienceLevels = [
  {
    id: 'beginner',
    label: 'Beginner',
    defaultSubstrateRatio: 2,
    description: 'New to cultivation with limited experience',
    recommendations: [
      'Start with lower substrate ratios (1:1 to 1:2)',
      'Use simple substrate mixes like CVG',
      'Focus on sterile technique and contamination prevention',
      'Begin with more forgiving mushroom species'
    ]
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    defaultSubstrateRatio: 3,
    description: 'Some successful grows with basic understanding',
    recommendations: [
      'Experiment with substrate ratios between 1:2 and 1:4',
      'Try different substrate formulations',
      'Consider more advanced techniques like agar work',
      'Optimize fruiting conditions for better yields'
    ]
  },
  {
    id: 'expert',
    label: 'Expert',
    defaultSubstrateRatio: 4,
    description: 'Consistent success with advanced knowledge',
    recommendations: [
      'Push substrate ratios to 1:4 or higher for maximum yields',
      'Create custom substrate blends for specific species',
      'Implement advanced techniques like grain-to-grain transfers',
      'Fine-tune all environmental parameters for optimal results'
    ]
  }
];

// Substrate type options with composition details
const substrateTypes = [
  {
    id: 'cvg',
    label: 'CVG Mix (Coco coir, Vermiculite, Gypsum)',
    composition: [
      { ingredient: 'Coco Coir', ratio: 0.5, unit: 'quarts' },
      { ingredient: 'Vermiculite', ratio: 0.4, unit: 'quarts' },
      { ingredient: 'Gypsum', ratio: 0.1, unit: 'quarts' }
    ],
    description: 'A simple and effective substrate mix suitable for beginners',
    benefits: [
      'Easy to prepare',
      'Resistant to contamination',
      'Good water retention',
      'Widely available ingredients'
    ]
  },
  {
    id: 'manure',
    label: 'Manure Mix',
    composition: [
      { ingredient: 'Composted Manure', ratio: 0.5, unit: 'quarts' },
      { ingredient: 'Coco Coir', ratio: 0.3, unit: 'quarts' },
      { ingredient: 'Vermiculite', ratio: 0.15, unit: 'quarts' },
      { ingredient: 'Gypsum', ratio: 0.05, unit: 'quarts' }
    ],
    description: 'Nutrient-rich substrate for higher yields',
    benefits: [
      'Higher nutrient content',
      'Potentially larger yields',
      'Good for certain gourmet mushrooms',
      'Better for experienced growers'
    ]
  },
  {
    id: 'sawdust',
    label: 'Sawdust Mix',
    composition: [
      { ingredient: 'Hardwood Sawdust', ratio: 0.7, unit: 'quarts' },
      { ingredient: 'Wheat Bran', ratio: 0.2, unit: 'quarts' },
      { ingredient: 'Gypsum', ratio: 0.1, unit: 'quarts' }
    ],
    description: 'Specialized substrate for wood-loving species',
    benefits: [
      'Ideal for wood-loving species',
      'Good for oyster and lion\'s mane mushrooms',
      'Can be supplemented for higher yields',
      'Sustainable option using wood waste'
    ]
  }
];

// Container size options with descriptions
const containerSizes = [
  {
    size: 1,
    label: '1 quart',
    description: 'Small test batches or experiments'
  },
  {
    size: 5,
    label: '5 quarts',
    description: 'Standard shoebox size, good for beginners'
  },
  {
    size: 12,
    label: '12 quarts',
    description: 'Medium monotub, balanced yield and management'
  },
  {
    size: 20,
    label: '20 quarts',
    description: 'Large monotub, higher yields for experienced growers'
  },
  {
    size: 54,
    label: '54 quarts',
    description: 'Full-size monotub, maximum yields for experts'
  }
];

// General cultivation tips and best practices
const cultivationTips = [
  'Lower ratios (1:1, 1:2) provide faster colonization and less contamination risk.',
  'Higher ratios (1:4, 1:5) may provide better yields but increase contamination risk.',
  'Optimal temperature range is 65-80°F (18-27°C).',
  'Ensure proper field capacity (moisture content) in your substrate.',
  'Monitor pH levels (aim for 6.0–7.0).',
  'During colonization, CO2 levels can be high, but reduce during fruiting.',
  'Use a pressure cooker to properly sterilize grain spawn.',
  'Pasteurize bulk substrate to reduce competing organisms.',
  'Maintain cleanliness in your work area to prevent contamination.'
];

// Calculate substrate ingredients based on substrate type and volume
const calculateSubstrateIngredients = (substrateType, substrateVolume) => {
  const substrate = substrateTypes.find(type => type.id === substrateType) || substrateTypes[0];
  
  return substrate.composition.map(ingredient => ({
    ingredient: ingredient.ingredient,
    amount: (parseFloat(substrateVolume) * ingredient.ratio).toFixed(1),
    unit: ingredient.unit
  }));
};

// Get recommendations based on experience level
const getRecommendationsByExperience = (experienceLevel) => {
  const level = experienceLevels.find(level => level.id === experienceLevel) || experienceLevels[0];
  return level.recommendations;
};

// Export all data and utility functions
const MyceliumDataService = {
  experienceLevels,
  substrateTypes,
  containerSizes,
  cultivationTips,
  calculateSubstrateIngredients,
  getRecommendationsByExperience
};

export default MyceliumDataService;
