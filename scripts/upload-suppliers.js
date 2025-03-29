/**
 * Upload Suppliers to Contentful
 * 
 * This script uploads supplier data to Contentful.
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const { createClient } = require('contentful-management');
const fs = require('fs');
const path = require('path');

// Configuration
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_API_SPACE;
const ENVIRONMENT_ID = 'master';
const MANAGEMENT_TOKEN = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;

// Supplier data (copied from ContentService.js)
const suppliers = [
  // Substrate suppliers
  {
    id: 'northspore',
    name: 'North Spore',
    description: 'Premium sterile substrates',
    url: 'https://northspore.com/collections/sterile-substrates',
    featured: true,
    referralCode: 'MYCO10',
    type: 'substrate',
    products: [
      { name: 'Boomr Bag', description: 'Ready-to-fruit substrate' },
      { name: 'Sterile Substrate', description: 'Various sterile options' }
    ]
  },
  {
    id: 'mycolabs',
    name: 'Myco Labs',
    description: 'Quality mushroom grow bags',
    url: 'https://mycolabs.com/collections/mushroom-grow-bags',
    featured: true,
    type: 'substrate'
  },
  {
    id: 'shroomsupply',
    name: 'Shroom Supply',
    description: 'Complete substrate kits',
    url: 'https://www.shroomsupply.com/bulk-substrate',
    featured: false,
    type: 'substrate'
  },
  {
    id: 'midwestgrowkits',
    name: 'Midwest Grow Kits',
    description: 'Bulk casing and substrate',
    url: 'https://www.midwestgrowkits.com/bulk-casing-and-substrate.html',
    featured: false,
    type: 'substrate'
  },
  {
    id: 'outgrow',
    name: 'Out-Grow',
    description: 'Sterilized bulk substrates',
    url: 'https://www.out-grow.com/mushroom-growing-substrates/',
    featured: false,
    type: 'substrate'
  },
  // Spawn suppliers
  {
    id: 'northspore-spawn',
    name: 'North Spore',
    description: 'Premium mushroom grain spawn',
    url: 'https://northspore.com/collections/grain-spawn',
    featured: true,
    referralCode: 'MYCO10',
    type: 'spawn'
  },
  {
    id: 'fieldforest',
    name: 'Field & Forest',
    description: 'Professional quality spawn',
    url: 'https://fieldforest.net/category/grain-spawn',
    featured: true,
    type: 'spawn'
  },
  {
    id: 'shroomsupply-spawn',
    name: 'Shroom Supply',
    description: 'Sterilized grain spawn',
    url: 'https://www.shroomsupply.com/grain-spawn',
    featured: false,
    type: 'spawn'
  },
  {
    id: 'mushroomman',
    name: 'Mushroom Man',
    description: 'Quality grain spawn',
    url: 'https://mushroom-man.com/collections/grain-spawn',
    featured: false,
    type: 'spawn'
  },
  {
    id: 'everythingmushrooms',
    name: 'Everything Mushrooms',
    description: 'Grain spawn for various species',
    url: 'https://everythingmushrooms.com/collections/spawn',
    featured: false,
    type: 'spawn'
  },
  // Spore suppliers
  {
    id: 'sporeworks',
    name: 'Sporeworks',
    description: 'Premium spore syringes',
    url: 'https://sporeworks.com/Psilocybe-cubensis/',
    featured: true,
    type: 'spores'
  },
  {
    id: 'premiumspores',
    name: 'Premium Spores',
    description: 'Quality microscopy spores',
    url: 'https://premiumspores.com/',
    featured: true,
    type: 'spores'
  },
  {
    id: 'qualityspores',
    name: 'Quality Spores',
    description: 'Microscopy spore syringes',
    url: 'https://qualityspores.store/',
    featured: false,
    type: 'spores'
  },
  {
    id: 'sporeslab',
    name: 'Spores Lab',
    description: 'Spore syringes and prints',
    url: 'https://www.sporeslab.io/',
    featured: false,
    type: 'spores'
  },
  {
    id: 'ralphstersspores',
    name: 'Ralphsters Spores',
    description: 'Exotic spore varieties',
    url: 'https://www.ralphstersspores.com/',
    featured: false,
    type: 'spores'
  },
  // Equipment suppliers
  {
    id: 'midwestgrowkits-equipment',
    name: 'Midwest Grow Kits',
    description: 'Complete growing equipment',
    url: 'https://www.midwestgrowkits.com/',
    featured: true,
    type: 'equipment'
  },
  {
    id: 'myctyson',
    name: 'Myc Tyson',
    description: 'Premium cultivation supplies',
    url: 'https://myctyson.com/',
    featured: true,
    type: 'equipment'
  },
  {
    id: 'boomermushroomsupplies',
    name: 'Boomer Mushroom Supplies',
    description: 'Complete growing supplies',
    url: 'https://www.boomermushroomsupplies.com/',
    featured: false,
    type: 'equipment'
  },
  {
    id: 'mycosupply',
    name: 'Myco Supply',
    description: 'Professional cultivation equipment',
    url: 'https://mycosupply.com/',
    featured: false,
    type: 'equipment'
  },
  {
    id: 'mushroomsupplies',
    name: 'Mushroom Supplies',
    description: 'Full range of growing equipment',
    url: 'https://www.mushroomsupplies.com/',
    featured: false,
    type: 'equipment'
  }
];

/**
 * Transform supplier data to Contentful format
 */
function transformSupplierData(supplier) {
  return {
    fields: {
      id: {
        'en-US': supplier.id
      },
      name: {
        'en-US': supplier.name
      },
      description: {
        'en-US': supplier.description
      },
      url: {
        'en-US': supplier.url
      },
      featured: {
        'en-US': supplier.featured
      },
      referralCode: {
        'en-US': supplier.referralCode || ''
      },
      type: {
        'en-US': supplier.type
      }
    }
  };
}

/**
 * Upload a supplier to Contentful
 */
async function uploadSupplier(environment, supplier) {
  try {
    console.log(`Creating supplier: ${supplier.fields.name['en-US']}`);
    
    // Create the entry
    const entry = await environment.createEntry('supplier', supplier);
    
    // Publish the entry
    await entry.publish();
    console.log(`Published supplier: ${supplier.fields.name['en-US']} (ID: ${entry.sys.id})`);
    
    return entry;
  } catch (error) {
    console.error(`Error uploading supplier ${supplier.fields.name['en-US']}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting supplier upload to Contentful...');
  
  try {
    // Check if management token is set
    if (!MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set');
      process.exit(1);
    }
    
    console.log(`Found ${suppliers.length} suppliers to upload`);
    
    // Initialize client
    const client = createClient({
      accessToken: MANAGEMENT_TOKEN
    });
    
    // Get space and environment
    console.log(`Connecting to Contentful space: ${SPACE_ID}`);
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT_ID);
    
    // Upload suppliers
    for (const supplier of suppliers) {
      const contentfulSupplier = transformSupplierData(supplier);
      await uploadSupplier(environment, contentfulSupplier);
    }
    
    console.log('\nSupplier upload completed successfully!');
  } catch (error) {
    console.error('Supplier upload failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main();
