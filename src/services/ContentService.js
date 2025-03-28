/**
 * ContentService.js
 * 
 * This service centralizes content management for the application,
 * including substrate supplier links, educational content, and other
 * static content that might need to be updated or managed in one place.
 */

import LoggingService from './LoggingService';

/**
 * Service for managing content across the application
 */
class ContentService {
  constructor() {
    this.substrateSuppliers = [];
    this.educationalContent = {};
    this.componentContent = {};
    this.staticFacts = [];
    
    this.loadSubstrateSuppliers();
    this.loadEducationalContent();
    this.loadComponentContent();
    this.loadStaticFacts();
  }

  /**
   * Load substrate supplier information
   */
  loadSubstrateSuppliers() {
    this.substrateSuppliers = [
      // Substrate suppliers
      {
        id: 'northspore',
        name: 'North Spore',
        description: 'Premium sterile substrates',
        url: 'https://northspore.com/collections/sterile-substrates',
        featured: true,
        referralCode: 'MYCO10',
        type: 'substrate',
        products: [
          { name: 'Boomr Bag', description: 'Ready-to-fruit substrate' },
          { name: 'Sterile Substrate', description: 'Various sterile options' }
        ]
      },
      {
        id: 'mycolabs',
        name: 'Myco Labs',
        description: 'Quality mushroom grow bags',
        url: 'https://mycolabs.com/collections/mushroom-grow-bags',
        featured: true,
        referralCode: '',
        type: 'substrate',
        products: [
          { name: 'All-in-One Bags', description: 'Complete growing solution' },
          { name: 'Bulk Substrate Bags', description: 'For larger grows' }
        ]
      },
      {
        id: 'mushroomsupplies',
        name: 'Mushroom Supplies',
        description: 'Premium mushroom substrate',
        url: 'https://www.mushroomsupplies.com/product-category/mushroom-substrates/',
        featured: true,
        referralCode: 'SPAWNIT',
        type: 'substrate',
        products: [
          { name: 'Manure-Based', description: 'For coprophilic species' },
          { name: 'Hardwood-Based', description: 'For wood-loving species' }
        ]
      },
      {
        id: 'boomershroomer',
        name: 'Boomer Shroomer',
        description: 'Bulk substrate options',
        url: 'https://www.boomershroomer.com/product/bulk-substrate/',
        featured: true,
        referralCode: '',
        type: 'substrate',
        products: [
          { name: 'CVG Mix', description: 'Ready-to-use CVG substrate' },
          { name: 'Bulk Casing', description: 'For casing layers' }
        ]
      },
      {
        id: 'midnightmushroom',
        name: 'Midnight Mushroom Co',
        description: 'Ready-to-use manure substrate',
        url: 'https://midnightmushroom.co/collections/manure-based-substrates',
        featured: true,
        referralCode: 'SPAWNIT10',
        type: 'substrate',
        products: [
          { name: 'Horse Manure', description: 'Pasteurized and ready to use' },
          { name: 'Specialty Mixes', description: 'Custom substrate blends' }
        ]
      },
      
      // Spore suppliers
      {
        id: 'pnwspore',
        name: 'PNW Spore Co.',
        description: 'Quality microscopy supplies',
        url: 'https://pnwspore.com/',
        featured: true,
        referralCode: '',
        type: 'spores',
        products: [
          { name: 'Spore Syringes', description: 'For microscopy research' },
          { name: 'Spore Prints', description: 'Various species available' }
        ]
      },
      {
        id: 'highdesertspores',
        name: 'High Desert Spores',
        description: 'Premium microscopy supplies',
        url: 'https://highdesertspores.com/',
        featured: true,
        referralCode: '',
        type: 'spores',
        products: [
          { name: 'Microscopy Kits', description: 'Complete research kits' },
          { name: 'Exotic Varieties', description: 'Rare spore varieties' }
        ]
      },
      {
        id: 'sporeworks',
        name: 'SporeWorks',
        description: 'Trusted source for microscopy supplies',
        url: 'https://sporeworks.com/',
        featured: true,
        referralCode: '',
        type: 'spores',
        products: [
          { name: 'Spore Syringes', description: 'For microscopy research' },
          { name: 'Spore Prints', description: 'Various species available' }
        ]
      },
      {
        id: 'lilshopofspores',
        name: 'Lil\' Shop of Spores',
        description: 'Quality microscopy supplies',
        url: 'https://lilshopofspores.com/',
        featured: true,
        referralCode: '',
        type: 'spores',
        products: [
          { name: 'Microscopy Kits', description: 'Complete research kits' },
          { name: 'Exotic Varieties', description: 'Rare spore varieties' }
        ]
      },
      
      // Grain suppliers
      {
        id: 'shroomsupply',
        name: 'Shroom Supply',
        description: 'Pre-sterilized grain spawn bags',
        url: 'https://www.shroomsupply.com/grain-spawn',
        featured: true,
        referralCode: 'SPAWN10',
        type: 'grain',
        products: [
          { name: 'Rye Berries', description: 'Classic grain spawn option' },
          { name: 'Millet Spawn', description: 'Small grain for faster colonization' }
        ]
      },
      {
        id: 'outgrow',
        name: 'Out-Grow',
        description: 'Quality grain spawn products',
        url: 'https://www.out-grow.com/grain-spawn-bags/',
        featured: true,
        referralCode: '',
        type: 'grain',
        products: [
          { name: 'Sterilized Grain Bags', description: 'Ready to inoculate' },
          { name: 'Master\'s Mix', description: 'Premium grain blend' }
        ]
      },
      {
        id: 'myctyson',
        name: 'Myc Tyson',
        description: 'Premium grain spawn bags',
        url: 'https://myctyson.com/shop/colonized-mushroom-substrates/sterilized-grain-bags/',
        featured: false,
        referralCode: '',
        type: 'grain',
        products: [
          { name: 'Rye Grain Bags', description: 'Professional quality' },
          { name: 'Wild Bird Seed', description: 'Economical option' }
        ]
      },
      
      // Accessories suppliers
      {
        id: 'midwestgrowkits',
        name: 'Midwest Grow Kits',
        description: 'Complete growing equipment',
        url: 'https://www.midwestgrowkits.com/mushroom-growing-supplies/',
        featured: true,
        referralCode: 'SPAWNIT15',
        type: 'accessories',
        products: [
          { name: 'Monotubs', description: 'Professional growing containers' },
          { name: 'Humidity Controllers', description: 'Automated environment control' }
        ]
      },
      {
        id: 'mycosupply',
        name: 'Myco Supply',
        description: 'Cultivation tools and equipment',
        url: 'https://mycosupply.com/product-category/tools-equipment/',
        featured: true,
        referralCode: '',
        type: 'accessories',
        products: [
          { name: 'Flow Hoods', description: 'Professional lab equipment' },
          { name: 'Pressure Cookers', description: 'For sterilization' }
        ]
      },
      {
        id: 'fungi',
        name: 'Fungi.com',
        description: 'Premium cultivation supplies',
        url: 'https://fungi.com/collections/cultivation-equipment',
        featured: false,
        referralCode: 'FUNGI10',
        type: 'accessories',
        products: [
          { name: 'Grow Chambers', description: 'Professional fruiting chambers' },
          { name: 'Cultivation Books', description: 'Educational resources' }
        ]
      }
    ];

    LoggingService.debug('Loaded substrate suppliers', { count: this.substrateSuppliers.length });
  }

  /**
   * Load educational content
   */
  loadEducationalContent() {
    this.educationalContent = {
      beginnerGuides: [
        {
          title: 'Getting Started with Mushroom Cultivation',
          description: 'Learn the basics of mushroom cultivation, including terminology, equipment, and processes.'
        },
        {
          title: 'Understanding Spawn-to-Substrate Ratios',
          description: 'Why spawn-to-substrate ratios matter and how they affect colonization times and yields.'
        },
        {
          title: 'Substrate Preparation 101',
          description: 'How to properly prepare and pasteurize different substrate types for optimal results.'
        }
      ],
      faq: [
        {
          question: 'What is spawn?',
          answer: 'Spawn is a substrate, such as grain or sawdust, that has been fully colonized by mushroom mycelium. It serves as the "seed" to inoculate bulk substrate.'
        },
        {
          question: 'Why is the spawn-to-substrate ratio important?',
          answer: 'The ratio affects colonization speed, contamination resistance, and potential yield. Higher spawn ratios colonize faster but can be more expensive.'
        },
        {
          question: 'What substrate should I use for beginners?',
          answer: 'CVG (coco coir, vermiculite, gypsum) is recommended for beginners due to its simplicity, contamination resistance, and good yields.'
        }
      ]
    };

    LoggingService.debug('Loaded educational content');
  }

  /**
   * Load static facts about mushrooms for use when API is unavailable
   */
  loadStaticFacts() {
    this.staticFacts = [
      "Mushrooms are more closely related to humans than to plants, belonging to their own kingdom called Fungi.",
      "Some mushroom species can break down plastic, potentially helping with environmental cleanup.",
      "The largest living organism on Earth is a honey fungus in Oregon, spanning 2.4 miles (3.8 km) across.",
      "Mushrooms can produce vitamin D when exposed to sunlight, similar to human skin.",
      "Some mushroom species are bioluminescent and glow in the dark naturally.",
      "Fungi play a crucial role in ecosystems as decomposers, breaking down dead organic matter.",
      "Mushrooms communicate through an underground network sometimes called the 'Wood Wide Web'.",
      "There are over 14,000 described species of mushrooms, with scientists estimating many more undiscovered.",
      "Mushrooms have been used medicinally for thousands of years in many cultures.",
      "The study of fungi is called mycology, derived from the Greek word 'mykes' meaning mushroom."
    ];
    
    LoggingService.debug('Loaded static mushroom facts', { count: this.staticFacts.length });
  }

  /**
   * Load component-specific content
   */
  loadComponentContent() {
    this.componentContent = {
      header: {
        title: "SpawnSmart",
        description: "The Ultimate Mushroom Cultivation Tool – Calculate spawn ratios, boost yields, and achieve pro-level results. Perfect for all skill levels!"
      },
      calculator: {
        header: {
          title: "SpawnSmart",
          description: "The Ultimate Mushroom Cultivation Tool – Calculate spawn ratios, boost yields, and achieve pro-level results. Perfect for all skill levels!"
        },
        formLabels: {
          experienceLevel: "Experience Level",
          spawnAmount: "Spawn Amount (quarts)",
          substrateRatio: "Substrate Ratio",
          substrateType: "Substrate Type",
          containerSize: "Container Size (quarts)"
        },
        buttons: {
          save: "Save",
          reset: "Reset"
        },
        alerts: {
          saveSuccess: "Settings saved successfully!",
          saveFailure: "Failed to save settings",
          saveError: "An error occurred while saving settings",
          resetConfirm: "Are you sure you want to reset to default values?"
        }
      },
      resultsPanel: {
        title: "Calculation Results",
        spawnAmountLabel: "Spawn Amount",
        substrateVolumeLabel: "Substrate Volume",
        ingredientsTitle: "Substrate Ingredients",
        noResultsText: "Complete the form to see results",
        containerAlertText: "Warning: Your container size is smaller than the total volume. Consider using a larger container or reducing amounts."
      },
      aiAdvice: {
        title: "AI Cultivation Advisor",
        loadingText: "Generating personalized cultivation advice...",
        errorText: "Unable to generate advice. Please check your API key or try again later.",
        refreshButton: "Get New Advice",
        prompt: `I'm growing mushrooms with the following setup: 
        - Experience level: {{experienceLevel}}
        - Using {{spawnAmount}} quarts of spawn
        - With a spawn-to-substrate ratio of 1:{{substrateRatio}}
        - Using {{substrateType}} substrate
        - In a {{containerSize}} quart container
        
        Based on this setup, what are 3-5 specific cultivation tips or potential issues I should be aware of? Focus on practical advice related to my specific parameters.`,
        systemPrompt: `You are a professional mycologist specializing in mushroom cultivation. 
        Provide practical, scientifically accurate cultivation advice based on the user's specific growing parameters. 
        Focus on spawn-to-substrate ratios, container size considerations, and substrate type optimization. 
        Keep your response concise, educational, and formatted as bullet points. 
        Avoid discussing psychoactive effects or illegal activities. 
        Limit your response to 3-5 specific, actionable tips directly related to the user's setup.`
      },
      mushroomFacts: {
        title: "Mushroom Fact",
        loadingText: "Loading interesting fact...",
        errorText: "Unable to load interesting fact. Please check your API key.",
        refreshButton: "New Fact",
        prompt: `Share one fascinating scientific fact about psilocybin mushrooms that most people don't know. 
        Focus on their biology, history, or ecological role - not their psychoactive effects. 
        Keep it concise (1-2 sentences) and educational.`,
        systemPrompt: `You are a mycology expert sharing educational information about mushrooms. 
        Provide scientifically accurate, interesting facts about psilocybin mushrooms focusing on their biology, 
        ecological role, or scientific history. Avoid discussing recreational use, cultivation techniques, 
        or psychoactive effects. Keep your response concise, educational, and suitable for a general audience.`
      },
      recommendations: {
        title: "Cultivation Recommendations",
        loadingText: "Loading recommendations...",
        errorText: "Unable to load recommendations. Please try again later.",
        refreshButton: "Refresh",
        noRecommendationsText: "Complete the form to see personalized recommendations."
      },
      substrateSuppliers: {
        title: "Suppliers",
        disclaimer: "* Affiliate links support this calculator",
        viewAllText: "View All",
        featuredOnlyText: "Featured Only"
      }
    };

    LoggingService.debug('Loaded component content');
  }

  /**
   * Get all substrate suppliers
   * 
   * @returns {Array} Array of substrate suppliers
   */
  getAllSuppliers() {
    return this.substrateSuppliers;
  }

  /**
   * Get featured substrate suppliers
   * 
   * @returns {Array} Array of featured substrate suppliers
   */
  getFeaturedSuppliers() {
    return this.substrateSuppliers.filter(supplier => supplier.featured);
  }
  
  /**
   * Get all suppliers by type
   * 
   * @param {string} type Type of suppliers (spores, grain, substrate, accessories)
   * @returns {Array} Array of suppliers of the specified type
   */
  getAllSuppliersByType(type) {
    return this.substrateSuppliers.filter(supplier => supplier.type === type);
  }
  
  /**
   * Get featured suppliers by type
   * 
   * @param {string} type Type of suppliers (spores, grain, substrate, accessories)
   * @returns {Array} Array of featured suppliers of the specified type
   */
  getFeaturedSuppliersByType(type) {
    return this.substrateSuppliers.filter(supplier => supplier.featured && supplier.type === type);
  }

  /**
   * Get a supplier by ID
   * 
   * @param {string} id Supplier ID
   * @returns {Object|null} Supplier object or null if not found
   */
  getSupplierById(id) {
    return this.substrateSuppliers.find(supplier => supplier.id === id) || null;
  }

  /**
   * Track a supplier link click
   * 
   * @param {string} supplierId ID of the supplier
   */
  trackSupplierClick(supplierId) {
    const supplier = this.getSupplierById(supplierId);
    
    if (supplier) {
      LoggingService.info('User clicked supplier link', { 
        supplierId,
        supplierName: supplier.name 
      });
      
      LoggingService.sendMetric('supplier_link_click', 1, {
        supplierId,
        supplierName: supplier.name,
        hasReferralCode: Boolean(supplier.referralCode)
      });
    }
  }

  /**
   * Get educational content by category
   * 
   * @param {string} category Category of educational content
   * @returns {Array} Array of educational content items
   */
  getEducationalContent(category) {
    return this.educationalContent[category] || [];
  }

  /**
   * Get component-specific content
   * 
   * @param {string} componentName Name of the component
   * @returns {Object} Component content
   */
  getComponentContent(componentName) {
    return this.componentContent[componentName] || {};
  }

  /**
   * Get a random static fact about mushrooms
   * 
   * @returns {string} A random mushroom fact
   */
  getRandomStaticFact() {
    const randomIndex = Math.floor(Math.random() * this.staticFacts.length);
    return this.staticFacts[randomIndex];
  }
}

// Create a singleton instance
const contentService = new ContentService();

export default contentService;
