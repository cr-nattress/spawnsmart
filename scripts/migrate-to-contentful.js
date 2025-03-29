/**
 * Contentful Migration Script
 * 
 * This script migrates all site content to Contentful using the ContentfulService.
 * 
 * Usage:
 * 1. Set the REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN environment variable
 * 2. Run: node scripts/migrate-to-contentful.js
 */

// Load environment variables
require('dotenv').config();

// Import the ContentfulService
const contentfulService = require('../src/services/ContentfulService').default;

/**
 * Main migration function
 */
async function migrateContent() {
  console.log('Starting content migration to Contentful...');
  
  try {
    // Check if management token is set
    if (!process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set.');
      console.log('Please set the environment variable and try again:');
      console.log('REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN=your_token node scripts/migrate-to-contentful.js');
      process.exit(1);
    }
    
    // Initialize the ContentfulService
    contentfulService.initialize();
    
    // Migrate all content
    await contentfulService.migrateAllContent();
    
    console.log('Content migration completed successfully!');
  } catch (error) {
    console.error('Content migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateContent();
