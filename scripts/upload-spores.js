/**
 * Upload Spore Data to Contentful
 * 
 * This script uploads spore data from the enhanced_spore_data.json file to Contentful.
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

// Path to enhanced spore data
const SPORE_DATA_PATH = path.resolve(process.cwd(), 'documentation/enhanced_spore_data.json');

/**
 * Read and parse the enhanced spore data
 */
function readSporeData() {
  try {
    const data = fs.readFileSync(SPORE_DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading spore data:', error.message);
    return null;
  }
}

/**
 * Transform spore data to Contentful format
 */
function transformSporeData(spore) {
  // Helper function to create RichText content
  const createRichText = (text) => ({
    nodeType: 'document',
    data: {},
    content: [
      {
        nodeType: 'paragraph',
        data: {},
        content: [
          {
            nodeType: 'text',
            value: text || '',
            marks: [],
            data: {}
          }
        ]
      }
    ]
  });

  return {
    fields: {
      mushroomType: {
        'en-US': spore['Mushroom Type'] || 'Psilocybe cubensis'
      },
      subtype: {
        'en-US': spore['Subtype']
      },
      sporeName: {
        'en-US': spore['Spore Name'] || `${spore['Subtype']} Spores`
      },
      price: {
        'en-US': spore['Price'] || ''
      },
      url: {
        'en-US': spore['URL'] || ''
      },
      growingConditions: {
        'en-US': createRichText(spore['Growing Conditions'] || '')
      },
      appearance: {
        'en-US': createRichText(spore['Size & Appearance'] || '')
      },
      strength: {
        'en-US': spore['Strength'] || 'Moderate'
      },
      moodEffects: {
        'en-US': createRichText(spore['Mood Effects'] || '')
      },
      description: {
        'en-US': createRichText(spore['Description'] || `${spore['Subtype']} is a variety of ${spore['Mushroom Type']}.`)
      },
      culinaryUses: {
        'en-US': createRichText(spore['Culinary Uses'] || '')
      },
      medicinalBenefits: {
        'en-US': createRichText(spore['Medicinal Benefits'] || '')
      },
      difficulty: {
        'en-US': spore['Difficulty'] || 'Intermediate'
      },
      colonizationTime: {
        'en-US': spore['Colonization Time'] || '10-14 days'
      }
    }
  };
}

/**
 * Upload a spore entry to Contentful
 */
async function uploadSpore(environment, sporeData) {
  try {
    console.log(`Creating entry for ${sporeData.fields.subtype['en-US']}`);
    
    // Create the entry
    const entry = await environment.createEntry('spore', sporeData);
    
    // Publish the entry
    await entry.publish();
    console.log(`Published spore: ${sporeData.fields.sporeName['en-US']} (ID: ${entry.sys.id})`);
    
    return entry;
  } catch (error) {
    console.error(`Error uploading spore ${sporeData.fields.sporeName['en-US']}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting spore data upload to Contentful...');
  
  try {
    // Check if management token is set
    if (!MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set');
      process.exit(1);
    }
    
    // Read spore data
    const spores = readSporeData();
    if (!spores || !Array.isArray(spores)) {
      console.error('Invalid or missing spore data');
      process.exit(1);
    }
    
    console.log(`Found ${spores.length} spore varieties to upload`);
    
    // Initialize client
    const client = createClient({
      accessToken: MANAGEMENT_TOKEN
    });
    
    // Get space and environment
    console.log(`Connecting to Contentful space: ${SPACE_ID}`);
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT_ID);
    
    // Upload spores (limit to first 10 for testing)
    const testSpores = spores.slice(0, 10);
    console.log(`Uploading ${testSpores.length} spore varieties...`);
    
    for (const spore of testSpores) {
      const contentfulSpore = transformSporeData(spore);
      await uploadSpore(environment, contentfulSpore);
    }
    
    console.log('\nSpore data upload completed successfully!');
  } catch (error) {
    console.error('Spore data upload failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main();
