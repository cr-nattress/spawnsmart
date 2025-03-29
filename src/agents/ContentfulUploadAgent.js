/**
 * ContentfulUploadAgent.js
 * 
 * AI agent responsible for uploading data to Contentful via the ContentfulService.
 * This agent reads JSON example files and migrates the data to Contentful in the correct order.
 */

const fs = require('fs');
const path = require('path');
const contentfulService = require('../services/ContentfulService').default;

class ContentfulUploadAgent {
  constructor() {
    this.jsonExamplesDir = path.resolve(process.cwd(), 'documentation/contentful-json-examples');
    this.contentTypes = [
      'supplier',
      'product',
      'spore',
      'educational-content',
      'faq',
      'mushroom-fact',
      'component-content'
    ];
    
    // Map of content type to their dependencies
    this.dependencies = {
      'product': ['supplier'],
      'spore': ['supplier'],
      'educational-content': [],
      'faq': ['educational-content'],
      'mushroom-fact': [],
      'component-content': []
    };
    
    // Track processed entries to handle references
    this.processedEntries = new Map();
    
    // Setup logging
    this.log = {
      info: (message) => console.log(`[INFO] ${message}`),
      error: (message, error) => console.error(`[ERROR] ${message}`, error)
    };
  }

  /**
   * Initialize the agent and ContentfulService
   */
  async initialize() {
    try {
      this.log.info('Initializing ContentfulUploadAgent');
      await contentfulService.initialize();
      return true;
    } catch (error) {
      this.log.error('Failed to initialize ContentfulUploadAgent', error);
      return false;
    }
  }

  /**
   * Read a JSON file and parse its contents
   * @param {string} filePath - Path to the JSON file
   * @returns {Object} Parsed JSON data
   */
  readJsonFile(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      this.log.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Get all example files for a specific content type
   * @param {string} contentType - The content type to find examples for
   * @returns {Array<string>} Array of file paths
   */
  getExampleFiles(contentType) {
    const contentTypePrefix = contentType.replace('-content-type', '');
    const entryPattern = `${contentTypePrefix}-entry-example`;
    
    try {
      const files = fs.readdirSync(this.jsonExamplesDir);
      return files
        .filter(file => file.includes(entryPattern) && file.endsWith('.json'))
        .map(file => path.join(this.jsonExamplesDir, file));
    } catch (error) {
      this.log.error(`Failed to get example files for ${contentType}`, error);
      return [];
    }
  }

  /**
   * Process references in entry fields
   * @param {Object} fields - Entry fields
   * @returns {Object} Processed fields with resolved references
   */
  processReferences(fields) {
    const processedFields = { ...fields };
    
    // Process each field
    Object.keys(processedFields).forEach(fieldKey => {
      const field = processedFields[fieldKey];
      
      // Process localized field (e.g., { "en-US": value })
      Object.keys(field).forEach(locale => {
        const value = field[locale];
        
        // Check if the value is a link
        if (value && typeof value === 'object' && value.sys && value.sys.type === 'Link') {
          const linkId = value.sys.id;
          
          // Replace placeholder ID with actual ID if it exists in processedEntries
          if (this.processedEntries.has(linkId)) {
            field[locale].sys.id = this.processedEntries.get(linkId);
          }
        }
        
        // Check if the value is an array of links
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item && typeof item === 'object' && item.sys && item.sys.type === 'Link') {
              const linkId = item.sys.id;
              
              if (this.processedEntries.has(linkId)) {
                field[locale][index].sys.id = this.processedEntries.get(linkId);
              }
            }
          });
        }
      });
    });
    
    return processedFields;
  }

  /**
   * Check if a content type already exists in Contentful
   * @param {string} contentTypeName - The name of the content type to check
   * @returns {Promise<boolean>} True if the content type exists, false otherwise
   */
  async contentTypeExists(contentTypeName) {
    try {
      const environment = await contentfulService.getEnvironment();
      const contentTypes = await environment.getContentTypes();
      
      // Convert contentTypeName to ID format (lowercase, hyphens)
      const contentTypeId = contentTypeName.toLowerCase().replace(/\s+/g, '-');
      
      // Check if content type exists
      return contentTypes.items.some(ct => ct.sys.id === contentTypeId);
    } catch (error) {
      this.log.error(`Error checking if content type exists: ${contentTypeName}`, error);
      return false;
    }
  }

  /**
   * Upload content types to Contentful
   */
  async uploadContentTypes() {
    this.log.info('Uploading content types to Contentful');
    
    for (const contentType of this.contentTypes) {
      try {
        const contentTypeFile = path.join(this.jsonExamplesDir, `${contentType}-content-type.json`);
        const contentTypeData = this.readJsonFile(contentTypeFile);
        
        // Check if content type already exists
        const exists = await this.contentTypeExists(contentTypeData.name);
        
        if (exists) {
          this.log.info(`Content type already exists: ${contentTypeData.name}, skipping creation`);
        } else {
          this.log.info(`Creating content type: ${contentType}`);
          await contentfulService.createContentType(contentTypeData.name, contentTypeData.fields, contentTypeData.description);
        }
      } catch (error) {
        this.log.error(`Failed to upload content type: ${contentType}`, error);
      }
    }
  }

  /**
   * Upload entries to Contentful in the correct order based on dependencies
   */
  async uploadEntries() {
    this.log.info('Uploading entries to Contentful');
    
    // Process content types in order based on dependencies
    const processOrder = this.getProcessOrder();
    
    for (const contentType of processOrder) {
      const exampleFiles = this.getExampleFiles(contentType);
      
      for (const exampleFile of exampleFiles) {
        try {
          const entryData = this.readJsonFile(exampleFile);
          const processedFields = this.processReferences(entryData.fields);
          
          this.log.info(`Creating entry from file: ${path.basename(exampleFile)}`);
          const entry = await contentfulService.createEntry(contentType, processedFields);
          
          // Store the created entry ID with the placeholder ID
          const placeholderId = this.getPlaceholderId(exampleFile);
          this.processedEntries.set(placeholderId, entry.sys.id);
          
          this.log.info(`Successfully created entry with ID: ${entry.sys.id}`);
        } catch (error) {
          this.log.error(`Failed to upload entry from file: ${exampleFile}`, error);
        }
      }
    }
  }

  /**
   * Get a placeholder ID from the example file name
   * @param {string} filePath - Path to the example file
   * @returns {string} Placeholder ID
   */
  getPlaceholderId(filePath) {
    const fileName = path.basename(filePath, '.json');
    return fileName.replace('-entry-example', '');
  }

  /**
   * Determine the order in which to process content types based on dependencies
   * @returns {Array<string>} Ordered list of content types
   */
  getProcessOrder() {
    const visited = new Set();
    const order = [];
    
    const visit = (contentType) => {
      if (visited.has(contentType)) return;
      visited.add(contentType);
      
      // Visit dependencies first
      const deps = this.dependencies[contentType] || [];
      for (const dep of deps) {
        visit(dep);
      }
      
      order.push(contentType);
    };
    
    // Visit all content types
    for (const contentType of this.contentTypes) {
      visit(contentType);
    }
    
    return order;
  }

  /**
   * Run the upload process
   */
  async run() {
    try {
      const initialized = await this.initialize();
      if (!initialized) {
        this.log.error('Failed to initialize, aborting upload process');
        return false;
      }
      
      // First upload content types
      await this.uploadContentTypes();
      
      // Then upload entries
      await this.uploadEntries();
      
      this.log.info('Content upload completed successfully');
      return true;
    } catch (error) {
      this.log.error('Content upload process failed', error);
      return false;
    }
  }
}

module.exports = ContentfulUploadAgent;
