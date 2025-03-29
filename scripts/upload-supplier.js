/**
 * Simple script to upload a supplier to Contentful
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const { createClient } = require('contentful-management');

// Configuration
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_API_SPACE;
const ENVIRONMENT_ID = 'master';
const MANAGEMENT_TOKEN = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;

// Supplier data
const supplierData = {
  fields: {
    name: {
      "en-US": "North Spore"
    },
    description: {
      "en-US": "Premium sterile substrates"
    },
    url: {
      "en-US": "https://northspore.com/collections/sterile-substrates"
    },
    featured: {
      "en-US": true
    },
    referralCode: {
      "en-US": "MYCO10"
    },
    type: {
      "en-US": "substrate"
    }
  }
};

/**
 * Main function to run the upload process
 */
async function main() {
  console.log('Starting supplier upload to Contentful...');
  
  try {
    // Initialize client
    const client = createClient({
      accessToken: MANAGEMENT_TOKEN
    });
    
    // Get space and environment
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT_ID);
    
    // Create entry
    console.log('Creating supplier entry...');
    const entry = await environment.createEntry('supplier', {
      fields: supplierData.fields
    });
    
    // Publish entry
    console.log('Publishing supplier entry...');
    await entry.publish();
    
    console.log(`Supplier uploaded successfully with ID: ${entry.sys.id}`);
  } catch (error) {
    console.error('Supplier upload failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();
