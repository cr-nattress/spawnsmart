/**
 * ContentService.js
 * 
 * This service centralizes content management for the application,
 * including substrate supplier links, educational content, and other
 * static content that might need to be updated or managed in one place.
 */

import LoggingService from './LoggingService';
import contentfulService from './ContentfulService';

/**
 * Service for managing content across the application
 */
class ContentService {
  constructor() {
    this.substrateSuppliers = [];
    this.educationalContent = {};
    this.componentContent = {};
    this.staticFacts = [];
    this.sporeData = []; // New property for spore data
    this.initialized = false;
    
    // Initialize the service
    this.initialize();
  }
  
  /**
   * Initialize the content service
   */
  async initialize() {
    try {
      LoggingService.debug('ContentService: Starting initialization');
      
      // Initialize Contentful service
      contentfulService.initialize();
      
      // Log initialization progress
      LoggingService.debug('ContentService: Contentful service initialized');
      
      // Load all content
      await this.loadSubstrateSuppliers();
      LoggingService.debug('ContentService: Suppliers loaded', { count: this.substrateSuppliers.length });
      
      await this.loadEducationalContent();
      LoggingService.debug('ContentService: Educational content loaded', { 
        categories: Object.keys(this.educationalContent) 
      });
      
      await this.loadComponentContent();
      LoggingService.debug('ContentService: Component content loaded', { 
        components: Object.keys(this.componentContent) 
      });
      
      await this.loadStaticFacts();
      LoggingService.debug('ContentService: Static facts loaded', { count: this.staticFacts.length });
      
      await this.loadSporeData(); // New method call to load spore data
      LoggingService.debug('ContentService: Spore data loaded', { count: this.sporeData.length });
      
      this.initialized = true;
      LoggingService.log('ContentService initialized successfully');
    } catch (error) {
      this.initialized = false;
      LoggingService.error('ContentService: Failed to initialize', { 
        error, 
        message: error.message,
        stack: error.stack 
      });
    }
  }
  
  /**
   * Ensure the service is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.initialized;
  }

  /**
   * Load substrate supplier information
   */
  async loadSubstrateSuppliers() {
    try {
      // Initialize suppliers array
      this.substrateSuppliers = [];
      
      // Fetch suppliers from Contentful
      const suppliers = await contentfulService.getContent('supplier');
      
      if (suppliers && suppliers.length > 0) {
        // Transform Contentful response to our format
        this.substrateSuppliers = suppliers.map(supplier => {
          return {
            id: supplier.fields.id,
            name: supplier.fields.name,
            description: supplier.fields.description,
            url: supplier.fields.url,
            featured: supplier.fields.featured,
            referralCode: supplier.fields.referralCode || '',
            type: supplier.fields.type,
            supplierId: supplier.sys.id, // Store Contentful ID for reference
            products: [] // Will be populated with products later
          };
        });
        
        // Fetch products for these suppliers
        await this.loadProducts();
      } else {
        LoggingService.warn('No suppliers found in Contentful');
      }
    } catch (error) {
      LoggingService.error('Failed to load suppliers from Contentful', { error });
      // Fallback to empty array if there's an error
      this.substrateSuppliers = [];
    }
    
    LoggingService.debug('Loaded substrate suppliers', { count: this.substrateSuppliers.length });
  }

  /**
   * Load products for suppliers
   */
  async loadProducts() {
    try {
      // Fetch all products from Contentful
      const products = await contentfulService.getContent('product');
      
      if (products && products.length > 0) {
        // Group products by supplier
        products.forEach(product => {
          // Skip products without supplier reference
          if (!product.fields.supplier || !product.fields.supplier.sys) {
            return;
          }
          
          const supplierId = product.fields.supplier.sys.id;
          
          // Find the supplier in our array
          const supplier = this.substrateSuppliers.find(s => s.supplierId === supplierId);
          
          if (supplier) {
            // Add product to supplier's products array
            supplier.products.push({
              name: product.fields.name,
              description: product.fields.description,
              price: product.fields.price,
              url: product.fields.url || supplier.url, // Fallback to supplier URL if product URL is not set
              productId: product.sys.id // Store Contentful ID for reference
            });
          }
        });
      } else {
        LoggingService.warn('No products found in Contentful');
      }
    } catch (error) {
      LoggingService.error('Failed to load products from Contentful', { error });
    }
  }

  /**
   * Load educational content
   */
  async loadEducationalContent() {
    try {
      // Initialize educational content object
      this.educationalContent = {};
      
      // Fetch educational content from Contentful
      const educationalEntries = await contentfulService.getContent('educationalContent');
      
      if (educationalEntries && educationalEntries.length > 0) {
        // Group educational content by category
        educationalEntries.forEach(entry => {
          const category = entry.fields.category;
          
          if (!this.educationalContent[category]) {
            this.educationalContent[category] = [];
          }
          
          this.educationalContent[category].push({
            id: entry.sys.id,
            title: entry.fields.title,
            description: entry.fields.description,
            content: entry.fields.content,
            imageUrl: entry.fields.image && entry.fields.image.sys ? 
              entry.fields.image.fields.file.url : null
          });
        });
        
        // Fetch FAQs and add them to educational content
        await this.loadFAQs();
      } else {
        LoggingService.warn('No educational content found in Contentful');
      }
    } catch (error) {
      LoggingService.error('Failed to load educational content from Contentful', { error });
      // Initialize with empty object if there's an error
      this.educationalContent = {};
    }
    
    LoggingService.debug('Loaded educational content');
  }

  /**
   * Load FAQs and add them to educational content
   */
  async loadFAQs() {
    try {
      // Fetch FAQs from Contentful
      const faqEntries = await contentfulService.getContent('faq');
      
      if (faqEntries && faqEntries.length > 0) {
        // Initialize FAQ category if it doesn't exist
        if (!this.educationalContent['faq']) {
          this.educationalContent['faq'] = [];
        }
        
        // Add FAQs to educational content
        faqEntries.forEach(entry => {
          this.educationalContent['faq'].push({
            id: entry.sys.id,
            question: entry.fields.question,
            answer: entry.fields.answer,
            category: entry.fields.category || 'general'
          });
        });
      } else {
        LoggingService.warn('No FAQs found in Contentful');
      }
    } catch (error) {
      LoggingService.error('Failed to load FAQs from Contentful', { error });
    }
  }

  /**
   * Load static facts about mushrooms for use when API is unavailable
   */
  async loadStaticFacts() {
    try {
      // Initialize static facts array
      this.staticFacts = [];
      
      // Fetch mushroom facts from Contentful
      const factEntries = await contentfulService.getContent('mushroomFact');
      
      if (factEntries && factEntries.length > 0) {
        // Transform Contentful response to our format
        this.staticFacts = factEntries.map(entry => entry.fields.factText);
      } else {
        LoggingService.warn('No mushroom facts found in Contentful');
        // Fallback to hardcoded facts if none found in Contentful
        this.staticFacts = [
          "Mushrooms are more closely related to humans than to plants, belonging to their own kingdom called Fungi.",
          "Some mushroom species can break down plastic, potentially helping with environmental cleanup.",
          "The largest living organism on Earth is a honey fungus in Oregon, spanning 2.4 miles (3.8 km) across.",
          "Mushrooms can produce vitamin D when exposed to sunlight, similar to human skin.",
          "Some mushroom species are bioluminescent and glow in the dark naturally."
        ];
      }
    } catch (error) {
      LoggingService.error('Failed to load mushroom facts from Contentful', { error });
      // Fallback to empty array if there's an error
      this.staticFacts = [];
    }
    
    LoggingService.debug('Loaded static mushroom facts', { count: this.staticFacts.length });
  }

  /**
   * Load component-specific content
   */
  async loadComponentContent() {
    try {
      // Initialize component content object
      this.componentContent = {};
      
      // Fetch component content from Contentful
      const componentEntries = await contentfulService.getContent('componentContent');
      
      if (componentEntries && componentEntries.length > 0) {
        // Group component content by component name
        componentEntries.forEach(entry => {
          const componentName = entry.fields.componentName;
          
          // Initialize the component object if it doesn't exist
          if (!this.componentContent[componentName]) {
            this.componentContent[componentName] = {};
          }
          
          // Add content fields to the component
          if (entry.fields.contentFields) {
            Object.entries(entry.fields.contentFields).forEach(([key, value]) => {
              this.componentContent[componentName][key] = value;
            });
          }
          
          // Add title and description if they exist
          if (entry.fields.title) {
            this.componentContent[componentName].title = entry.fields.title;
          }
          
          if (entry.fields.description) {
            this.componentContent[componentName].description = entry.fields.description;
          }
          
          // Add any nested objects if they exist
          if (entry.fields.nestedContent) {
            try {
              const nestedContent = JSON.parse(entry.fields.nestedContent);
              Object.entries(nestedContent).forEach(([key, value]) => {
                this.componentContent[componentName][key] = value;
              });
            } catch (parseError) {
              LoggingService.error('Failed to parse nested content', { parseError });
            }
          }
        });
      } else {
        LoggingService.warn('No component content found in Contentful');
      }
    } catch (error) {
      LoggingService.error('Failed to load component content from Contentful', { error });
      // Initialize with empty object if there's an error
      this.componentContent = {};
    }
    
    LoggingService.debug('Loaded component content');
  }

  /**
   * Load spore data from Contentful
   */
  async loadSporeData() {
    try {
      LoggingService.debug('ContentService: loadSporeData called');
      
      // Initialize spore data array
      this.sporeData = [];
      
      // Fetch spore data from Contentful
      LoggingService.debug('ContentService: Attempting to fetch spore data from Contentful');
      const sporeEntries = await contentfulService.getContent('spore');
      
      // Debug log the raw spore entries
      LoggingService.debug('ContentService: Raw spore entries from Contentful', { 
        count: sporeEntries?.length,
        sample: sporeEntries?.[0] ? {
          sys: sporeEntries[0].sys,
          fieldKeys: sporeEntries[0].fields ? Object.keys(sporeEntries[0].fields) : []
        } : null
      });
      
      if (sporeEntries && sporeEntries.length > 0) {
        LoggingService.debug('ContentService: Processing Contentful spore entries');
        
        // Transform Contentful response to our format
        this.sporeData = sporeEntries.map(spore => {
          // Skip invalid entries
          if (!spore || !spore.fields) {
            LoggingService.warn('ContentService: Invalid spore entry found', { id: spore?.sys?.id });
            return null;
          }
          
          // Extract fields with proper fallbacks
          const fields = spore.fields || {};
          
          // Debug log the name field structure
          LoggingService.debug('ContentService: Spore name field structure', { 
            id: spore.sys?.id,
            nameField: fields.name,
            isObject: typeof fields.name === 'object',
            hasEnUS: fields.name && fields.name['en-US'] !== undefined,
            enUSValue: fields.name?.['en-US'],
            enUSType: fields.name?.['en-US'] !== undefined ? typeof fields.name['en-US'] : 'undefined'
          });
          
          // Get supplier references if they exist
          let suppliers = [];
          if (fields.suppliers && Array.isArray(fields.suppliers)) {
            suppliers = fields.suppliers.map(supplierRef => {
              return supplierRef.sys?.id || '';
            }).filter(id => id);
          }
          
          // Process text fields that might be localized or rich text
          const name = this.extractContentfulField(fields.name) || 'Unknown Spore';
          const scientificName = this.extractContentfulField(fields.mushroomType || fields.scientificName) || '';
          const description = this.extractContentfulField(fields.description || fields.growingConditions) || 'No description available';
          const appearance = this.extractContentfulField(fields.appearance || fields.sizeAppearance) || '';
          const strength = this.extractContentfulField(fields.strength) || '';
          const moodEffects = this.extractContentfulField(fields.moodEffects) || '';
          const medicinalBenefits = this.extractContentfulField(fields.medicinalBenefits) || '';
          const culinaryUses = this.extractContentfulField(fields.culinaryUses) || '';
          const difficulty = this.extractContentfulField(fields.difficulty) || 'intermediate';
          const colonizationTime = this.extractContentfulField(fields.colonizationTime) || '14-21 days';
          const fruitingTime = this.extractContentfulField(fields.fruitingTime) || '7-14 days';
          const price = this.extractContentfulField(fields.price) || '$10-20';
          const url = this.extractContentfulField(fields.url) || '#';
          
          // Debug log the extracted name
          LoggingService.debug('ContentService: Extracted spore name', { 
            id: spore.sys?.id,
            name,
            originalName: JSON.stringify(fields.name).substring(0, 100)
          });
          
          // Extract type field or determine from scientific name
          const rawType = this.extractContentfulField(fields.type) || this.extractSporeType(scientificName);
          const type = this.mapSporeType(rawType);
          
          // Map Contentful fields to our application's expected format
          return {
            id: spore.sys?.id || `spore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            scientificName,
            type,
            difficulty,
            colonizationTime,
            fruitingTime,
            description,
            appearance,
            imageUrl: this.getImageUrl(fields.image),
            suppliers,
            price,
            strength,
            moodEffects,
            medicinalBenefits,
            culinaryUses,
            url
          };
        }).filter(spore => spore !== null); // Filter out null entries
      } else {
        LoggingService.warn('ContentService: No spore data found in Contentful, attempting to load from local file');
        
        // Fallback to local JSON file if no data from Contentful
        try {
          // Import the enhanced_spore_data.json file
          const enhancedSporeData = require('../data/enhanced_spore_data.json');
          LoggingService.debug('ContentService: Loaded enhanced_spore_data.json', { 
            count: enhancedSporeData?.length 
          });
          
          if (enhancedSporeData && enhancedSporeData.length > 0) {
            this.sporeData = enhancedSporeData;
            LoggingService.debug('ContentService: Using local spore data as fallback', { 
              count: this.sporeData.length 
            });
          } else {
            LoggingService.warn('ContentService: Local spore data file is empty or invalid');
          }
        } catch (localError) {
          LoggingService.error('ContentService: Failed to load local spore data file', { 
            error: localError,
            message: localError.message
          });
        }
      }
    } catch (error) {
      LoggingService.error('ContentService: Failed to load spore data from Contentful', { 
        error,
        message: error.message,
        stack: error.stack
      });
      
      // Fallback to empty array if there's an error
      this.sporeData = [];
      
      // Try to load from local file as a last resort
      try {
        const enhancedSporeData = require('../data/enhanced_spore_data.json');
        if (enhancedSporeData && enhancedSporeData.length > 0) {
          this.sporeData = enhancedSporeData;
          LoggingService.debug('ContentService: Using local spore data after Contentful error', { 
            count: this.sporeData.length 
          });
        }
      } catch (localError) {
        LoggingService.error('ContentService: Failed to load local spore data as fallback', { 
          error: localError 
        });
      }
    }
    
    LoggingService.debug('ContentService: Finished loading spore data', { 
      count: this.sporeData.length,
      names: this.sporeData.slice(0, 3).map(s => s.name)
    });
  }
  
  /**
   * Helper method to extract the spore type from the scientific name
   * 
   * @param {string} mushroomType The scientific name of the mushroom
   * @returns {string} The extracted spore type
   */
  extractSporeType(mushroomType) {
    if (!mushroomType) return 'unknown';
    
    // Convert to lowercase for easier matching
    const type = mushroomType.toLowerCase();
    
    if (type.includes('cubensis')) return 'cubensis';
    if (type.includes('cyanescens')) return 'cyanescens';
    if (type.includes('pleurotus') || type.includes('agaricus')) return 'gourmet';
    if (type.includes('reishi') || type.includes('lion') || type.includes('maitake')) return 'medicinal';
    
    return 'other';
  }
  
  /**
   * Helper method to map spore types to standardized categories
   * 
   * @param {string} type The raw type from Contentful
   * @returns {string} The standardized type
   */
  mapSporeType(type) {
    if (!type) return 'unknown';
    
    // Convert to lowercase for easier matching
    const lowerType = type.toLowerCase();
    
    // Map to standard categories
    if (lowerType.includes('cubensis')) return 'cubensis';
    if (lowerType.includes('cyanescens')) return 'cyanescens';
    if (lowerType.includes('gourmet')) return 'gourmet';
    if (lowerType.includes('medicinal')) return 'medicinal';
    if (lowerType.includes('edible')) return 'gourmet';
    
    return lowerType;
  }
  
  /**
   * Helper method to extract image URL from Contentful image field
   * 
   * @param {Object} imageField Contentful image field
   * @returns {string} The image URL or default image
   */
  getImageUrl(imageField) {
    if (!imageField) return '/default-spore-image.jpg';
    
    try {
      // Debug the image field structure
      LoggingService.debug('Image field structure in getImageUrl', { 
        imageField,
        type: typeof imageField,
        keys: imageField ? Object.keys(imageField) : []
      });
      
      // Check if it's a localized field
      if (imageField['en-US'] !== undefined) {
        imageField = imageField['en-US'];
      }
      
      // Handle different Contentful image field structures
      if (imageField.fields && imageField.fields.file && imageField.fields.file.url) {
        const url = imageField.fields.file.url;
        return url.startsWith('//') ? `https:${url}` : url;
      }
      
      if (imageField.sys && imageField.sys.id) {
        // If we only have the image ID, we might need to fetch the asset separately
        return `/contentful-assets/${imageField.sys.id}.jpg`;
      }
    } catch (error) {
      LoggingService.error('Error extracting image URL', { error, imageField: JSON.stringify(imageField).substring(0, 100) });
    }
    
    return '/default-spore-image.jpg';
  }

  /**
   * Helper method to extract text content from Contentful fields that might be localized or rich text
   * 
   * @param {Object|string} field Contentful field that might be localized or rich text
   * @returns {string} The extracted text content
   */
  extractContentfulField(field) {
    if (!field) return '';
    
    // If it's already a string, return it
    if (typeof field === 'string') return field;
    
    try {
      // For Contentful fields, the structure is typically:
      // { "en-US": "value" } or { "en-US": { content: [...], nodeType: "document", ... } }
      
      // First, check if it's a localized field with 'en-US' key
      if (field['en-US'] !== undefined) {
        const localizedValue = field['en-US'];
        
        // If the localized value is a string, return it directly
        if (typeof localizedValue === 'string') {
          return localizedValue;
        }
        
        // If it's a rich text field, extract the text from it
        if (localizedValue && typeof localizedValue === 'object') {
          return this.extractTextFromRichText(localizedValue);
        }
        
        // If we can't determine the type, convert to string
        return String(localizedValue || '');
      }
      
      // If it's a rich text field without localization, extract the text
      if (field.nodeType === 'document' && field.content) {
        return this.extractTextFromRichText(field);
      }
      
      // For other object types, try to get a meaningful string representation
      if (typeof field === 'object') {
        // If it has a toString method that's not the default Object.toString
        if (field.toString && field.toString !== Object.prototype.toString) {
          return field.toString();
        }
        
        // Otherwise, convert to JSON and limit the length
        return JSON.stringify(field).substring(0, 50) + '...';
      }
      
      // For any other type, convert to string
      return String(field);
    } catch (error) {
      LoggingService.error('Error extracting content from Contentful field', { 
        error, 
        fieldType: typeof field,
        fieldSample: typeof field === 'object' ? JSON.stringify(field).substring(0, 100) : field 
      });
      return '';
    }
  }

  /**
   * Helper method to extract text content from Contentful rich text fields
   * 
   * @param {Object} richTextField Contentful rich text field
   * @returns {string} The extracted text content
   */
  extractTextFromRichText(richTextField) {
    if (!richTextField) return '';
    
    // If it's already a string, return it
    if (typeof richTextField === 'string') return richTextField;
    
    try {
      // Handle different rich text structures
      
      // Case 1: Document with content array
      if (richTextField.nodeType === 'document' && Array.isArray(richTextField.content)) {
        return richTextField.content.map(node => {
          // Extract text from paragraph nodes
          if (node.nodeType === 'paragraph' && Array.isArray(node.content)) {
            return node.content.map(textNode => {
              // Text nodes have a value property
              if (textNode.nodeType === 'text') {
                return textNode.value || '';
              }
              return '';
            }).join('');
          }
          
          // Extract text from heading nodes
          if (node.nodeType && node.nodeType.startsWith('heading-') && Array.isArray(node.content)) {
            return node.content.map(textNode => {
              if (textNode.nodeType === 'text') {
                return textNode.value || '';
              }
              return '';
            }).join('');
          }
          
          return '';
        }).filter(text => text).join(' ');
      }
      
      // Case 2: Array of content nodes
      if (Array.isArray(richTextField.content)) {
        return richTextField.content.map(node => {
          if (node.value) return node.value;
          
          if (node.content && Array.isArray(node.content)) {
            return node.content.map(childNode => {
              return childNode.value || '';
            }).join(' ');
          }
          
          return '';
        }).join(' ');
      }
      
      // Case 3: Simple text node
      if (richTextField.nodeType === 'text' && richTextField.value) {
        return richTextField.value;
      }
      
      // Case 4: Unknown structure, try to extract any text we can find
      const jsonString = JSON.stringify(richTextField);
      // Extract anything that looks like text content
      const textMatches = jsonString.match(/"value":"([^"]*)"/g) || [];
      if (textMatches.length > 0) {
        return textMatches
          .map(match => match.replace('"value":"', '').replace('"', ''))
          .join(' ');
      }
      
      // If we can't parse it, return empty string
      return '';
    } catch (error) {
      LoggingService.error('Error extracting text from rich text field', { 
        error,
        fieldType: typeof richTextField,
        fieldSample: typeof richTextField === 'object' ? JSON.stringify(richTextField).substring(0, 100) : richTextField
      });
      return '';
    }
  }

  /**
   * Get all substrate suppliers
   * 
   * @returns {Array} Array of substrate suppliers
   */
  async getAllSuppliers() {
    await this.ensureInitialized();
    return this.substrateSuppliers;
  }

  /**
   * Get featured substrate suppliers
   * 
   * @returns {Array} Array of featured substrate suppliers
   */
  async getFeaturedSuppliers() {
    await this.ensureInitialized();
    return this.substrateSuppliers.filter(supplier => supplier.featured);
  }
  
  /**
   * Get all suppliers by type
   * 
   * @param {string} type Type of suppliers (spores, grain, substrate, accessories)
   * @returns {Array} Array of suppliers of the specified type
   */
  async getAllSuppliersByType(type) {
    await this.ensureInitialized();
    return this.substrateSuppliers.filter(supplier => supplier.type === type);
  }
  
  /**
   * Get featured suppliers by type
   * 
   * @param {string} type Type of suppliers (spores, grain, substrate, accessories)
   * @returns {Array} Array of featured suppliers of the specified type
   */
  async getFeaturedSuppliersByType(type) {
    await this.ensureInitialized();
    return this.substrateSuppliers.filter(supplier => supplier.featured && supplier.type === type);
  }

  /**
   * Get a supplier by ID
   * 
   * @param {string} id Supplier ID
   * @returns {Object|null} Supplier object or null if not found
   */
  async getSupplierById(id) {
    await this.ensureInitialized();
    return this.substrateSuppliers.find(supplier => supplier.id === id) || null;
  }

  /**
   * Track supplier click for analytics
   * 
   * @param {string} supplierId ID of the supplier
   */
  async trackSupplierClick(supplierId) {
    await this.ensureInitialized();
    const supplier = await this.getSupplierById(supplierId);
    
    if (supplier) {
      LoggingService.log('Supplier click tracked', {
        supplierId,
        name: supplier.name,
        type: supplier.type
      });
      
      // Here you would typically send this data to an analytics service
      // For now, we just log it
    }
  }

  /**
   * Get educational content by category
   * 
   * @param {string} category Category of educational content
   * @returns {Array} Array of educational content items
   */
  async getEducationalContent(category) {
    await this.ensureInitialized();
    return this.educationalContent[category] || [];
  }

  /**
   * Get component-specific content
   * 
   * @param {string} componentName Name of the component
   * @returns {Object} Component content
   */
  async getComponentContent(componentName) {
    await this.ensureInitialized();
    return this.componentContent[componentName] || {};
  }

  /**
   * Get a random static fact about mushrooms
   * 
   * @returns {string} A random mushroom fact
   */
  async getRandomStaticFact() {
    await this.ensureInitialized();
    const randomIndex = Math.floor(Math.random() * this.staticFacts.length);
    return this.staticFacts[randomIndex];
  }

  /**
   * Get all spore data
   * 
   * @returns {Array} Array of spore data
   */
  async getAllSporeData() {
    LoggingService.debug('ContentService: getAllSporeData called');
    
    try {
      const initialized = await this.ensureInitialized();
      LoggingService.debug('ContentService: Initialization status in getAllSporeData', { initialized });
      
      // Check if we have spore data
      if (!this.sporeData || this.sporeData.length === 0) {
        LoggingService.warn('ContentService: No spore data available, attempting to load');
        await this.loadSporeData();
      }
      
      LoggingService.debug('ContentService: Returning spore data', { 
        count: this.sporeData.length,
        sample: this.sporeData.length > 0 ? {
          id: this.sporeData[0].id,
          name: this.sporeData[0].name,
          type: this.sporeData[0].type
        } : 'no data'
      });
      
      return this.sporeData || [];
    } catch (error) {
      LoggingService.error('ContentService: Error in getAllSporeData', {
        error,
        message: error.message,
        stack: error.stack
      });
      return [];
    }
  }

  /**
   * Get spore data by type
   * 
   * @param {string} type Type of spores (cubensis, gourmet, medicinal, etc.)
   * @returns {Array} Array of spore data of the specified type
   */
  async getSporeDataByType(type) {
    await this.ensureInitialized();
    return this.sporeData.filter(spore => spore.type === type) || [];
  }

  /**
   * Get spore data by ID
   * 
   * @param {string} id Spore ID
   * @returns {Object|null} Spore data object or null if not found
   */
  async getSporeDataById(id) {
    await this.ensureInitialized();
    return this.sporeData.find(spore => spore.id === id) || null;
  }
}

// Create a singleton instance
const contentService = new ContentService();

export default contentService;
