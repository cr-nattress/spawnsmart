/**
 * Contentful Upload Script
 * 
 * This script uses the ContentfulUploadAgent to upload all content from JSON examples
 * to Contentful using the ContentfulService.
 * 
 * Usage:
 * 1. Set the REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN environment variable
 * 2. Run: node scripts/upload-to-contentful.js
 */

// Load environment variables
require('dotenv').config();

// Import the ContentfulUploadAgent
const ContentfulUploadAgent = require('../src/agents/ContentfulUploadAgent');

/**
 * Main upload function
 */
async function uploadContent() {
  console.log('Starting content upload to Contentful...');
  
  try {
    // Check if management token is set
    if (!process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set.');
      console.log('Please set the environment variable and try again:');
      console.log('REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN=your_token node scripts/upload-to-contentful.js');
      process.exit(1);
    }
    
    // Create and run the ContentfulUploadAgent
    const agent = new ContentfulUploadAgent();
    const success = await agent.run();
    
    if (success) {
      console.log('Content upload completed successfully!');
    } else {
      console.error('Content upload failed. Check the logs for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Content upload failed:', error);
    process.exit(1);
  }
}

// Run the upload
uploadContent();
