/**
 * Contentful Bridge Script
 * 
 * This script creates a bridge between CommonJS and ES Modules to upload content to Contentful.
 * It directly uses the Contentful Management SDK to upload the example JSON files.
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const fs = require('fs');
const path = require('path');
const { createClient } = require('contentful-management');

// Configuration
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_API_SPACE;
const ENVIRONMENT_ID = 'master';
const MANAGEMENT_TOKEN = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;
const JSON_EXAMPLES_DIR = path.resolve(process.cwd(), 'documentation/contentful-json-examples');

// Content type order based on dependencies
const CONTENT_TYPES = [
  'supplier',
  'product',
  'spore',
  'educational-content',
  'faq',
  'mushroom-fact',
  'component-content'
];

// Map to track created entries
const processedEntries = new Map();

/**
 * Initialize the Contentful Management client
 */
function initializeClient() {
  return createClient({
    accessToken: MANAGEMENT_TOKEN
  });
}

/**
 * Get the Contentful environment
 */
async function getEnvironment(client) {
  const space = await client.getSpace(SPACE_ID);
  return await space.getEnvironment(ENVIRONMENT_ID);
}

/**
 * Read a JSON file and parse its contents
 */
function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Failed to read JSON file: ${filePath}`, error);
    throw error;
  }
}

/**
 * Check if a content type already exists
 */
async function contentTypeExists(environment, contentTypeName) {
  try {
    const contentTypes = await environment.getContentTypes();
    const contentTypeId = contentTypeName.toLowerCase().replace(/\s+/g, '-');
    return contentTypes.items.some(ct => ct.sys.id === contentTypeId);
  } catch (error) {
    console.error(`Error checking if content type exists: ${contentTypeName}`, error);
    return false;
  }
}

/**
 * Create a content type in Contentful
 */
async function createContentType(environment, contentTypeData) {
  try {
    const contentTypeId = contentTypeData.name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if content type already exists
    const exists = await contentTypeExists(environment, contentTypeData.name);
    if (exists) {
      console.log(`Content type already exists: ${contentTypeData.name}, skipping creation`);
      return;
    }
    
    console.log(`Creating content type: ${contentTypeData.name}`);
    
    // Create content type
    const contentType = await environment.createContentTypeWithId(contentTypeId, {
      name: contentTypeData.name,
      description: contentTypeData.description,
      displayField: contentTypeData.displayField,
      fields: contentTypeData.fields
    });
    
    // Publish content type
    await contentType.publish();
    console.log(`Content type published: ${contentTypeData.name}`);
  } catch (error) {
    console.error(`Failed to create content type: ${contentTypeData.name}`, error);
    throw error;
  }
}

/**
 * Process references in entry fields
 */
function processReferences(fields) {
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
        if (processedEntries.has(linkId)) {
          field[locale].sys.id = processedEntries.get(linkId);
        }
      }
      
      // Check if the value is an array of links
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item && typeof item === 'object' && item.sys && item.sys.type === 'Link') {
            const linkId = item.sys.id;
            
            if (processedEntries.has(linkId)) {
              field[locale][index].sys.id = processedEntries.get(linkId);
            }
          }
        });
      }
    });
  });
  
  return processedFields;
}

/**
 * Create an entry in Contentful
 */
async function createEntry(environment, contentTypeId, entryData) {
  try {
    const processedFields = processReferences(entryData.fields);
    
    console.log(`Creating entry for content type: ${contentTypeId}`);
    
    // Create entry
    const entry = await environment.createEntry(contentTypeId, {
      fields: processedFields
    });
    
    // Publish entry
    await entry.publish();
    console.log(`Entry published with ID: ${entry.sys.id}`);
    
    return entry;
  } catch (error) {
    console.error(`Failed to create entry for content type: ${contentTypeId}`, error);
    throw error;
  }
}

/**
 * Get a placeholder ID from the example file name
 */
function getPlaceholderId(filePath) {
  const fileName = path.basename(filePath, '.json');
  return fileName.replace('-entry-example', '');
}

/**
 * Get all example files for a specific content type
 */
function getExampleFiles(contentType) {
  // Handle special case for educational-content
  const contentTypePrefix = contentType === 'educational-content' ? 'educational-content' : contentType.replace('-content-type', '');
  const entryPattern = `${contentTypePrefix}-entry-example`;
  
  try {
    const files = fs.readdirSync(JSON_EXAMPLES_DIR);
    return files
      .filter(file => file.includes(entryPattern) && file.endsWith('.json'))
      .map(file => path.join(JSON_EXAMPLES_DIR, file));
  } catch (error) {
    console.error(`Failed to get example files for ${contentType}`, error);
    return [];
  }
}

/**
 * Upload content types to Contentful
 */
async function uploadContentTypes(environment) {
  console.log('Uploading content types to Contentful');
  
  for (const contentType of CONTENT_TYPES) {
    try {
      const contentTypeFile = path.join(JSON_EXAMPLES_DIR, `${contentType}-content-type.json`);
      const contentTypeData = readJsonFile(contentTypeFile);
      
      await createContentType(environment, contentTypeData);
    } catch (error) {
      console.error(`Failed to upload content type: ${contentType}`, error);
    }
  }
}

/**
 * Upload entries to Contentful
 */
async function uploadEntries(environment) {
  console.log('Uploading entries to Contentful');
  
  for (const contentType of CONTENT_TYPES) {
    const exampleFiles = getExampleFiles(contentType);
    
    for (const exampleFile of exampleFiles) {
      try {
        const entryData = readJsonFile(exampleFile);
        
        console.log(`Creating entry from file: ${path.basename(exampleFile)}`);
        const entry = await createEntry(environment, contentType, entryData);
        
        // Store the created entry ID with the placeholder ID
        const placeholderId = getPlaceholderId(exampleFile);
        processedEntries.set(placeholderId, entry.sys.id);
        
        console.log(`Successfully created entry with ID: ${entry.sys.id}`);
      } catch (error) {
        console.error(`Failed to upload entry from file: ${exampleFile}`, error);
      }
    }
  }
}

/**
 * Main function to run the upload process
 */
async function main() {
  console.log('Starting content upload to Contentful...');
  
  try {
    // Check if management token is set
    if (!MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set.');
      console.log('Please set the environment variable and try again:');
      console.log('REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN=your_token node scripts/contentful-bridge.js');
      process.exit(1);
    }
    
    // Initialize client and get environment
    const client = initializeClient();
    const environment = await getEnvironment(client);
    
    // Upload content types and entries
    await uploadContentTypes(environment);
    await uploadEntries(environment);
    
    console.log('Content upload completed successfully!');
  } catch (error) {
    console.error('Content upload failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();
