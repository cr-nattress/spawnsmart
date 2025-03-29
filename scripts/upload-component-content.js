/**
 * Upload Component Content to Contentful
 * 
 * This script uploads component content (UI text, labels, etc.) to Contentful.
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const { createClient } = require('contentful-management');

// Configuration
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_API_SPACE;
const ENVIRONMENT_ID = 'master';
const MANAGEMENT_TOKEN = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;

// Component content data for UI elements
const componentContent = {
  header: {
    title: 'SpawnSmart',
    subtitle: 'Mushroom Cultivation Calculator',
    tagline: 'Optimize your mushroom growing with precision calculations'
  },
  calculator: {
    title: 'Spawn-to-Substrate Calculator',
    description: 'Calculate the perfect spawn-to-substrate ratio for your mushroom cultivation',
    spawnLabel: 'Spawn Amount',
    substrateLabel: 'Substrate Amount',
    ratioLabel: 'Spawn-to-Substrate Ratio',
    calculateButton: 'Calculate',
    resetButton: 'Reset',
    resultsTitle: 'Calculation Results',
    errorMessage: 'Please enter valid values for calculation'
  },
  sporeFinderPage: {
    title: 'Spore Finder',
    description: 'Find the perfect spores for your next cultivation project',
    searchPlaceholder: 'Search for spore varieties...',
    filterLabel: 'Filter by type:',
    noResultsMessage: 'No spore varieties found matching your criteria',
    difficultyLabel: 'Difficulty:',
    colonizationTimeLabel: 'Colonization Time:',
    viewDetailsButton: 'View Details'
  },
  suppliersPage: {
    title: 'Trusted Suppliers',
    description: 'Find quality suppliers for all your mushroom cultivation needs',
    featuredLabel: 'Featured Suppliers',
    allSuppliersLabel: 'All Suppliers',
    categoriesLabel: 'Categories:',
    visitWebsiteButton: 'Visit Website'
  },
  footer: {
    disclaimer: 'For educational purposes only. Always research and follow local laws regarding mushroom cultivation.',
    copyright: '© 2025 SpawnSmart. All rights reserved.',
    privacyLink: 'Privacy Policy',
    termsLink: 'Terms of Use',
    contactLink: 'Contact Us'
  }
};

/**
 * Transform component content to Contentful format
 */
function transformComponentContent(section, key, value) {
  return {
    fields: {
      componentId: {
        'en-US': `${section}.${key}`
      },
      title: {
        'en-US': key
      },
      description: {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: `UI text for ${section} ${key}`,
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      labels: {
        'en-US': {
          value: value
        }
      },
      buttons: {
        'en-US': {}
      },
      alerts: {
        'en-US': {}
      },
      placeholders: {
        'en-US': {}
      }
    }
  };
}

/**
 * Upload component content to Contentful
 */
async function uploadComponentContent(environment, component) {
  try {
    console.log(`Creating component content: ${component.fields.componentId['en-US']}`);
    
    // Create the entry
    const entry = await environment.createEntry('componentContent', component);
    
    // Publish the entry
    await entry.publish();
    console.log(`Published component content: ${component.fields.componentId['en-US']} (ID: ${entry.sys.id})`);
    
    return entry;
  } catch (error) {
    console.error(`Error uploading component content ${component.fields.componentId['en-US']}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting component content upload to Contentful...');
  
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
    
    // Upload component content
    console.log('\nUploading component content...');
    
    // Process each section
    for (const section in componentContent) {
      const sectionContent = componentContent[section];
      console.log(`Processing section: ${section}`);
      
      // Process each key in the section
      for (const key in sectionContent) {
        const value = sectionContent[key];
        const contentfulComponent = transformComponentContent(section, key, value);
        await uploadComponentContent(environment, contentfulComponent);
      }
    }
    
    console.log('\nComponent content upload completed successfully!');
  } catch (error) {
    console.error('Component content upload failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main();
