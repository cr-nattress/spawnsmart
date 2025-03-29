/**
 * Reload Supplier and Product Data to Contentful
 * 
 * This script reloads only supplier and product data to Contentful.
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const { createClient } = require('contentful-management');

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
      { name: 'Boomr Bag', description: 'Ready-to-fruit substrate', price: '$24.99', url: 'https://northspore.com/products/boomr-bag-manure-based-substrate-mushroom-growing-media' },
      { name: 'Sterile Substrate', description: 'Various sterile options', price: '$19.99', url: 'https://northspore.com/collections/sterile-substrates' }
    ]
  },
  {
    id: 'mycolabs',
    name: 'Myco Labs',
    description: 'Quality mushroom grow bags',
    url: 'https://mycolabs.com/collections/mushroom-grow-bags',
    featured: true,
    type: 'substrate',
    products: [
      { name: 'All-in-One Grow Bag', description: 'Complete substrate and grain spawn bag', price: '$29.99', url: 'https://mycolabs.com/products/all-in-one-mushroom-grow-bag' },
      { name: 'Bulk Substrate Bag', description: 'Sterilized bulk substrate', price: '$18.99', url: 'https://mycolabs.com/products/bulk-substrate-bag' }
    ]
  },
  {
    id: 'shroomsupply',
    name: 'Shroom Supply',
    description: 'Complete substrate kits',
    url: 'https://www.shroomsupply.com/bulk-substrate',
    featured: false,
    type: 'substrate',
    products: [
      { name: 'Bulk Casing Mix', description: 'Premium casing layer', price: '$14.95', url: 'https://www.shroomsupply.com/bulk-substrate/bulk-casing-mix' },
      { name: 'Sterilized Horse Manure', description: 'Pre-sterilized manure substrate', price: '$22.95', url: 'https://www.shroomsupply.com/bulk-substrate/sterilized-horse-manure' }
    ]
  },
  // Spawn suppliers
  {
    id: 'northspore-spawn',
    name: 'North Spore',
    description: 'Premium mushroom grain spawn',
    url: 'https://northspore.com/collections/grain-spawn',
    featured: true,
    referralCode: 'MYCO10',
    type: 'spawn',
    products: [
      { name: 'Grain Spawn', description: 'Sterilized grain spawn', price: '$28.00', url: 'https://northspore.com/collections/grain-spawn/products/sterilized-grain-spawn-for-mushroom-growing' },
      { name: 'Sawdust Spawn', description: 'Hardwood sawdust spawn', price: '$25.00', url: 'https://northspore.com/collections/sawdust-spawn' }
    ]
  },
  {
    id: 'fieldforest',
    name: 'Field & Forest',
    description: 'Professional quality spawn',
    url: 'https://fieldforest.net/category/grain-spawn',
    featured: true,
    type: 'spawn',
    products: [
      { name: 'Shiitake Grain Spawn', description: 'Professional shiitake spawn', price: '$32.00', url: 'https://fieldforest.net/product/shiitake-grain-spawn/grain-spawn' },
      { name: 'Oyster Grain Spawn', description: 'Professional oyster spawn', price: '$28.00', url: 'https://fieldforest.net/product/oyster-grain-spawn/grain-spawn' }
    ]
  },
  // Spore suppliers
  {
    id: 'sporeworks',
    name: 'Sporeworks',
    description: 'Premium spore syringes',
    url: 'https://sporeworks.com/Psilocybe-cubensis/',
    featured: true,
    type: 'spores',
    products: [
      { name: 'Golden Teacher Spore Syringe', description: 'Microscopy spore syringe', price: '$18.00', url: 'https://sporeworks.com/Psilocybe-cubensis-Golden-Teacher-Spore-Syringe.html' },
      { name: 'B+ Spore Syringe', description: 'Microscopy spore syringe', price: '$18.00', url: 'https://sporeworks.com/Psilocybe-cubensis-B-Spore-Syringe.html' }
    ]
  },
  // Equipment suppliers
  {
    id: 'midwestgrowkits-equipment',
    name: 'Midwest Grow Kits',
    description: 'Complete growing equipment',
    url: 'https://www.midwestgrowkits.com/',
    featured: true,
    type: 'equipment',
    products: [
      { name: 'Monotub Kit', description: 'Complete monotub setup', price: '$49.99', url: 'https://www.midwestgrowkits.com/60-quart-monotub.html' },
      { name: 'Pressure Cooker', description: '23-quart pressure cooker/canner', price: '$129.99', url: 'https://www.midwestgrowkits.com/23-Quart-Pressure-Cooker-Canner' }
    ]
  },
  {
    id: 'myctyson',
    name: 'Myc Tyson',
    description: 'Premium cultivation supplies',
    url: 'https://myctyson.com/',
    featured: true,
    type: 'equipment',
    products: [
      { name: 'Flow Hood', description: 'Professional laminar flow hood', price: '$599.99', url: 'https://myctyson.com/shop/mushroom-growing-supplies/flow-hoods-for-mushroom-growing/medium-flow-hood/' },
      { name: 'Cultivation Kit', description: 'Complete cultivation kit', price: '$149.99', url: 'https://myctyson.com/shop/mushroom-growing-supplies/mushroom-grow-kits/complete-cultivation-kit/' }
    ]
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
 * Transform product data to Contentful format
 */
function transformProductData(product, supplierId) {
  return {
    fields: {
      name: {
        'en-US': product.name
      },
      description: {
        'en-US': product.description
      },
      price: {
        'en-US': product.price || ''
      },
      url: {
        'en-US': product.url || ''
      },
      supplier: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: supplierId
          }
        }
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
 * Upload a product to Contentful
 */
async function uploadProduct(environment, product) {
  try {
    console.log(`Creating product: ${product.fields.name['en-US']}`);
    
    // Create the entry
    const entry = await environment.createEntry('product', product);
    
    // Publish the entry
    await entry.publish();
    console.log(`Published product: ${product.fields.name['en-US']} (ID: ${entry.sys.id})`);
    
    return entry;
  } catch (error) {
    console.error(`Error uploading product ${product.fields.name['en-US']}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting supplier and product upload to Contentful...');
  
  try {
    // Check if management token is set
    if (!MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set');
      process.exit(1);
    }
    
    console.log(`Found ${suppliers.length} suppliers to upload`);
    const productsCount = suppliers.reduce((count, supplier) => count + (supplier.products?.length || 0), 0);
    console.log(`Found ${productsCount} products to upload`);
    
    // Initialize client
    const client = createClient({
      accessToken: MANAGEMENT_TOKEN
    });
    
    // Get space and environment
    console.log(`Connecting to Contentful space: ${SPACE_ID}`);
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT_ID);
    
    // Upload suppliers and track their IDs
    const supplierMap = new Map();
    
    for (const supplier of suppliers) {
      const contentfulSupplier = transformSupplierData(supplier);
      const entry = await uploadSupplier(environment, contentfulSupplier);
      
      if (entry) {
        supplierMap.set(supplier.id, entry.sys.id);
      }
    }
    
    // Upload products with supplier references
    console.log('\nUploading products...');
    
    for (const supplier of suppliers) {
      const supplierId = supplierMap.get(supplier.id);
      
      if (supplierId && supplier.products && supplier.products.length > 0) {
        for (const product of supplier.products) {
          const contentfulProduct = transformProductData(product, supplierId);
          await uploadProduct(environment, contentfulProduct);
        }
      }
    }
    
    console.log('\nSupplier and product upload completed successfully!');
  } catch (error) {
    console.error('Upload failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main();
