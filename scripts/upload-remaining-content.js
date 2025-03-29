/**
 * Upload Remaining Content to Contentful
 * 
 * This script uploads suppliers, educational content, FAQs, and component content to Contentful.
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const { createClient } = require('contentful-management');

// Configuration
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_API_SPACE;
const ENVIRONMENT_ID = 'master';
const MANAGEMENT_TOKEN = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;

// Import ContentService to get the data
// Note: We're using require directly in the functions instead

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
 * Transform educational content to Contentful format
 */
function transformEducationalContent(content, index) {
  return {
    fields: {
      title: {
        'en-US': content.title
      },
      description: {
        'en-US': content.description
      },
      content: {
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
                  value: content.description,
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      category: {
        'en-US': 'beginner-guides'
      },
      tags: {
        'en-US': ['beginner', 'guide', 'cultivation']
      }
    }
  };
}

/**
 * Transform FAQ to Contentful format
 */
function transformFAQ(faq, index) {
  return {
    fields: {
      question: {
        'en-US': faq.question
      },
      answer: {
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
                  value: faq.answer,
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      category: {
        'en-US': 'cultivation'
      },
      order: {
        'en-US': index + 1
      }
    }
  };
}

/**
 * Transform component content to Contentful format
 */
function transformComponentContent(section, key, value) {
  return {
    fields: {
      componentId: {
        'en-US': `${section}-${key}`
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
                  value: `${section} ${key} content`,
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      labels: {
        'en-US': {}
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
 * Upload educational content to Contentful
 */
async function uploadEducationalContent(environment, content) {
  try {
    console.log(`Creating educational content: ${content.fields.title['en-US']}`);
    
    // Create the entry
    const entry = await environment.createEntry('educationalContent', content);
    
    // Publish the entry
    await entry.publish();
    console.log(`Published educational content: ${content.fields.title['en-US']} (ID: ${entry.sys.id})`);
    
    return entry;
  } catch (error) {
    console.error(`Error uploading educational content ${content.fields.title['en-US']}:`, error.message);
    return null;
  }
}

/**
 * Upload FAQ to Contentful
 */
async function uploadFAQ(environment, faq) {
  try {
    console.log(`Creating FAQ: ${faq.fields.question['en-US']}`);
    
    // Create the entry
    const entry = await environment.createEntry('faq', faq);
    
    // Publish the entry
    await entry.publish();
    console.log(`Published FAQ: ${faq.fields.question['en-US']} (ID: ${entry.sys.id})`);
    
    return entry;
  } catch (error) {
    console.error(`Error uploading FAQ ${faq.fields.question['en-US']}:`, error.message);
    return null;
  }
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
 * Upload all suppliers
 */
async function uploadSuppliers(environment) {
  try {
    // Get suppliers from ContentService
    const suppliers = require('../src/services/ContentService').default.getAllSuppliers();
    console.log(`Found ${suppliers.length} suppliers to upload`);
    
    for (const supplier of suppliers) {
      const contentfulSupplier = transformSupplierData(supplier);
      await uploadSupplier(environment, contentfulSupplier);
    }
    
    console.log('All suppliers uploaded successfully');
  } catch (error) {
    console.error('Error uploading suppliers:', error.message);
  }
}

/**
 * Upload all educational content
 */
async function uploadEducationalContents(environment) {
  try {
    // Get educational content from ContentService
    const educationalContent = require('../src/services/ContentService').default.getEducationalContent().beginnerGuides;
    console.log(`Found ${educationalContent.length} educational content items to upload`);
    
    for (let i = 0; i < educationalContent.length; i++) {
      const contentfulEducationalContent = transformEducationalContent(educationalContent[i], i);
      await uploadEducationalContent(environment, contentfulEducationalContent);
    }
    
    console.log('All educational content uploaded successfully');
  } catch (error) {
    console.error('Error uploading educational content:', error.message);
  }
}

/**
 * Upload all FAQs
 */
async function uploadFAQs(environment) {
  try {
    // Get FAQs from ContentService
    const faqs = require('../src/services/ContentService').default.getEducationalContent().faq;
    console.log(`Found ${faqs.length} FAQs to upload`);
    
    for (let i = 0; i < faqs.length; i++) {
      const contentfulFAQ = transformFAQ(faqs[i], i);
      await uploadFAQ(environment, contentfulFAQ);
    }
    
    console.log('All FAQs uploaded successfully');
  } catch (error) {
    console.error('Error uploading FAQs:', error.message);
  }
}

/**
 * Upload all component content
 */
async function uploadComponentContents(environment) {
  try {
    // Get component content from ContentService
    const componentContent = require('../src/services/ContentService').default.getComponentContent();
    console.log('Found component content to upload');
    
    // Process each section
    for (const section in componentContent) {
      const sectionContent = componentContent[section];
      
      // If the section content is an object with nested properties
      if (typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
        for (const key in sectionContent) {
          const value = sectionContent[key];
          
          // If the value is a string, upload it as component content
          if (typeof value === 'string') {
            const contentfulComponentContent = transformComponentContent(section, key, value);
            await uploadComponentContent(environment, contentfulComponentContent);
          }
        }
      }
    }
    
    console.log('All component content uploaded successfully');
  } catch (error) {
    console.error('Error uploading component content:', error.message);
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
    
    // Upload all content types
    console.log('\nUploading suppliers...');
    await uploadSuppliers(environment);
    
    console.log('\nUploading educational content...');
    await uploadEducationalContents(environment);
    
    console.log('\nUploading FAQs...');
    await uploadFAQs(environment);
    
    console.log('\nUploading component content...');
    await uploadComponentContents(environment);
    
    console.log('\nAll content uploaded successfully!');
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
