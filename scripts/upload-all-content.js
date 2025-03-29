/**
 * Complete Content Upload Script for Contentful
 * 
 * This script uploads all content types and entries to Contentful in the correct order.
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

// Content types in order of dependencies
const CONTENT_TYPES = [
  { id: 'supplier', name: 'Supplier' },
  { id: 'product', name: 'Product' },
  { id: 'spore', name: 'Spore' },
  { id: 'educational-content', name: 'EducationalContent' },
  { id: 'faq', name: 'FAQ' },
  { id: 'mushroom-fact', name: 'MushroomFact' },
  { id: 'component-content', name: 'ComponentContent' }
];

// Map to store created entry IDs
const createdEntries = new Map();

/**
 * Read a JSON file
 */
function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Check if a content type exists
 */
async function contentTypeExists(environment, contentTypeId) {
  try {
    await environment.getContentType(contentTypeId);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Create a content type
 */
async function createContentType(environment, contentTypeInfo) {
  const { id, name } = contentTypeInfo;
  const filePath = path.join(JSON_EXAMPLES_DIR, `${id}-content-type.json`);
  const data = readJsonFile(filePath);
  
  if (!data) {
    console.error(`Could not read content type data for ${id}`);
    return false;
  }
  
  try {
    // Check if content type already exists
    const exists = await contentTypeExists(environment, id);
    if (exists) {
      console.log(`Content type ${id} already exists, skipping...`);
      return true;
    }
    
    // Create the content type
    console.log(`Creating content type: ${name}`);
    const contentType = await environment.createContentTypeWithId(id, {
      name: data.name,
      description: data.description,
      displayField: data.displayField,
      fields: data.fields
    });
    
    // Publish the content type
    await contentType.publish();
    console.log(`Content type ${name} published successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating content type ${name}:`, error.message);
    return false;
  }
}

/**
 * Process references in entry fields
 */
function processReferences(fields) {
  const processedFields = JSON.parse(JSON.stringify(fields)); // Deep clone
  
  // Process each field
  Object.keys(processedFields).forEach(fieldKey => {
    const field = processedFields[fieldKey];
    
    // Process localized field
    Object.keys(field).forEach(locale => {
      const value = field[locale];
      
      // Check if the value is a link
      if (value && typeof value === 'object' && value.sys && value.sys.type === 'Link') {
        const linkId = value.sys.id;
        if (createdEntries.has(linkId)) {
          field[locale].sys.id = createdEntries.get(linkId);
        }
      }
      
      // Check if the value is an array of links
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item && typeof item === 'object' && item.sys && item.sys.type === 'Link') {
            const linkId = item.sys.id;
            if (createdEntries.has(linkId)) {
              field[locale][index].sys.id = createdEntries.get(linkId);
            }
          }
        });
      }
    });
  });
  
  return processedFields;
}

/**
 * Create an entry
 */
async function createEntry(environment, contentTypeId, entryFile) {
  const data = readJsonFile(entryFile);
  if (!data) {
    console.error(`Could not read entry data from ${entryFile}`);
    return null;
  }
  
  try {
    // Process any references in the entry fields
    const processedFields = processReferences(data.fields);
    
    // Create the entry
    console.log(`Creating entry for ${contentTypeId} from ${path.basename(entryFile)}`);
    const entry = await environment.createEntry(contentTypeId, {
      fields: processedFields
    });
    
    // Publish the entry
    await entry.publish();
    console.log(`Entry published with ID: ${entry.sys.id}`);
    
    // Store the entry ID with a placeholder based on the filename
    const placeholderId = path.basename(entryFile, '.json').replace('-entry-example', '');
    createdEntries.set(placeholderId, entry.sys.id);
    
    return entry;
  } catch (error) {
    console.error(`Error creating entry for ${contentTypeId}:`, error.message);
    return null;
  }
}

/**
 * Get example entry files for a content type
 */
function getEntryFiles(contentTypeId) {
  try {
    const files = fs.readdirSync(JSON_EXAMPLES_DIR);
    const pattern = new RegExp(`${contentTypeId}-entry-example.*\\.json$`);
    return files
      .filter(file => pattern.test(file))
      .map(file => path.join(JSON_EXAMPLES_DIR, file));
  } catch (error) {
    console.error(`Error getting entry files for ${contentTypeId}:`, error.message);
    return [];
  }
}

/**
 * Upload all content types
 */
async function uploadContentTypes(environment) {
  console.log('\nUploading content types...');
  
  for (const contentType of CONTENT_TYPES) {
    await createContentType(environment, contentType);
  }
}

/**
 * Upload all entries
 */
async function uploadEntries(environment) {
  console.log('\nUploading entries...');
  
  for (const contentType of CONTENT_TYPES) {
    const entryFiles = getEntryFiles(contentType.id);
    
    if (entryFiles.length === 0) {
      console.log(`No example entries found for ${contentType.id}`);
      continue;
    }
    
    for (const entryFile of entryFiles) {
      await createEntry(environment, contentType.id, entryFile);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting content upload to Contentful...');
  
  try {
    // Check if management token is set
    if (!MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set');
      process.exit(1);
    }
    
    // Initialize client
    const client = createClient({
      accessToken: MANAGEMENT_TOKEN
    });
    
    // Get space and environment
    console.log(`Connecting to Contentful space: ${SPACE_ID}`);
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT_ID);
    
    // Upload content types and entries
    await uploadContentTypes(environment);
    await uploadEntries(environment);
    
    console.log('\nContent upload completed successfully!');
  } catch (error) {
    console.error('Content upload failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main();
