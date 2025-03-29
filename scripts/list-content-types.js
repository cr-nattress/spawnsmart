/**
 * List Content Types in Contentful
 * 
 * This script lists all content types in the Contentful space.
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const { createClient } = require('contentful-management');

// Configuration
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_API_SPACE;
const ENVIRONMENT_ID = 'master';
const MANAGEMENT_TOKEN = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;

/**
 * Main function
 */
async function main() {
  console.log('Listing content types in Contentful...');
  
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
    
    // Get all content types
    const contentTypes = await environment.getContentTypes();
    
    console.log('\nContent types in this space:');
    contentTypes.items.forEach(contentType => {
      console.log(`- ID: ${contentType.sys.id}, Name: ${contentType.name}`);
      console.log(`  Display Field: ${contentType.displayField}`);
      console.log('  Fields:');
      contentType.fields.forEach(field => {
        console.log(`    - ${field.id} (${field.type})`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('Failed to list content types:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main();
