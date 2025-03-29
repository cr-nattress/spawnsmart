/**
 * Upload Educational Content to Contentful
 * 
 * This script uploads educational content and FAQs to Contentful.
 */

// Load environment variables
require('dotenv').config();

// Import required libraries
const { createClient } = require('contentful-management');

// Configuration
const SPACE_ID = process.env.REACT_APP_CONTENTFUL_API_SPACE;
const ENVIRONMENT_ID = 'master';
const MANAGEMENT_TOKEN = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;

// Educational content data (based on SporeFinderPage and other components)
const educationalContent = [
  {
    title: 'Introduction to Mushroom Cultivation',
    description: 'Learn the basics of mushroom cultivation for beginners',
    content: 'Mushroom cultivation is a rewarding hobby that combines science and art. This guide will walk you through the basic principles of growing mushrooms at home, from selecting the right species to harvesting your first flush.',
    category: 'beginner-guides',
    tags: ['beginner', 'cultivation', 'overview']
  },
  {
    title: 'Understanding Spore Types',
    description: 'A comprehensive guide to different mushroom spore varieties',
    content: 'Mushroom spores come in various types, including Psilocybe cubensis, gourmet, and medicinal varieties. Each type has unique characteristics, growing requirements, and uses. This guide explains the differences between spore types and helps you choose the right one for your cultivation goals.',
    category: 'spore-guides',
    tags: ['spores', 'varieties', 'selection']
  },
  {
    title: 'Substrate Preparation Techniques',
    description: 'Learn how to prepare substrate for optimal mushroom growth',
    content: 'Proper substrate preparation is crucial for successful mushroom cultivation. This guide covers various techniques for preparing, sterilizing, and pasteurizing substrates to create the ideal growing environment for your mushrooms.',
    category: 'substrate-guides',
    tags: ['substrate', 'preparation', 'sterilization']
  },
  {
    title: 'Spawn to Substrate Ratios',
    description: 'Understanding the ideal spawn-to-substrate ratios for different mushroom species',
    content: 'The spawn-to-substrate ratio is a critical factor in mushroom cultivation. This guide explains how to calculate the optimal ratio for different mushroom species and growing conditions, helping you maximize your yield and efficiency.',
    category: 'cultivation-techniques',
    tags: ['spawn', 'substrate', 'ratios', 'calculation']
  },
  {
    title: 'Fruiting Conditions Guide',
    description: 'Creating the perfect environment for mushroom fruiting',
    content: 'After colonization, mushrooms require specific conditions to trigger fruiting. This guide covers the essential factors like humidity, temperature, light, and fresh air exchange needed to induce and optimize mushroom fruiting.',
    category: 'cultivation-techniques',
    tags: ['fruiting', 'conditions', 'environment']
  }
];

// FAQ data
const faqs = [
  {
    question: 'What is the ideal spawn-to-substrate ratio?',
    answer: 'The ideal spawn-to-substrate ratio typically ranges from 1:2 to 1:5 depending on the mushroom species and substrate type. For beginners, a 1:3 ratio is often recommended as it provides a good balance between colonization speed and yield potential.',
    category: 'cultivation'
  },
  {
    question: 'How do I calculate how much substrate I need?',
    answer: 'To calculate substrate needs, first determine the volume of your growing container in quarts or liters. Then, based on your desired spawn-to-substrate ratio, calculate the amount of substrate required. The SpawnSmart calculator can help you make these calculations quickly and accurately.',
    category: 'calculation'
  },
  {
    question: 'What types of mushrooms are easiest for beginners?',
    answer: 'For beginners, oyster mushrooms (Pleurotus species) are generally considered the easiest to cultivate. They colonize quickly, are resistant to contamination, and fruit readily in a wide range of conditions. Other beginner-friendly options include shiitake and lion\'s mane mushrooms.',
    category: 'beginner'
  },
  {
    question: 'How long does colonization take?',
    answer: 'Colonization time varies by mushroom species, substrate type, and environmental conditions. Generally, it takes between 10-21 days for most species. Cubensis varieties typically colonize in 10-14 days under optimal conditions, while some gourmet species may take longer.',
    category: 'cultivation'
  },
  {
    question: 'What temperature should I maintain during colonization?',
    answer: 'Most mushroom species prefer temperatures between 75-80°F (24-27°C) during colonization. However, specific temperature requirements can vary by species. Always research the optimal temperature range for your particular mushroom variety.',
    category: 'cultivation'
  }
];

/**
 * Transform educational content to Contentful format
 */
function transformEducationalContent(content) {
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
                  value: content.content,
                  marks: [],
                  data: {}
                }
              ]
            }
          ]
        }
      },
      category: {
        'en-US': content.category
      },
      tags: {
        'en-US': content.tags
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
        'en-US': faq.category
      },
      order: {
        'en-US': index + 1
      }
    }
  };
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
 * Main function
 */
async function main() {
  console.log('Starting educational content upload to Contentful...');
  
  try {
    // Check if management token is set
    if (!MANAGEMENT_TOKEN) {
      console.error('Error: REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN is not set');
      process.exit(1);
    }
    
    console.log(`Found ${educationalContent.length} educational content items to upload`);
    console.log(`Found ${faqs.length} FAQs to upload`);
    
    // Initialize client
    const client = createClient({
      accessToken: MANAGEMENT_TOKEN
    });
    
    // Get space and environment
    console.log(`Connecting to Contentful space: ${SPACE_ID}`);
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT_ID);
    
    // Upload educational content
    console.log('\nUploading educational content...');
    for (const content of educationalContent) {
      const contentfulContent = transformEducationalContent(content);
      await uploadEducationalContent(environment, contentfulContent);
    }
    
    // Upload FAQs
    console.log('\nUploading FAQs...');
    for (let i = 0; i < faqs.length; i++) {
      const contentfulFAQ = transformFAQ(faqs[i], i);
      await uploadFAQ(environment, contentfulFAQ);
    }
    
    console.log('\nEducational content upload completed successfully!');
  } catch (error) {
    console.error('Educational content upload failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the main function
main();
