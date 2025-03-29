/**
 * ContentfulService.js
 * 
 * This service provides integration with Contentful CMS,
 * allowing the application to fetch and manage content from Contentful
 * including spore data, educational content, and other dynamic content.
 */

import { createClient } from 'contentful';
import { createClient as createManagementClient } from 'contentful-management';
import LoggingService from './LoggingService';
import ContentService from './ContentService';
import sporeData from '../data/sporeData';

/**
 * Service for interacting with Contentful CMS
 */
class ContentfulService {
  constructor() {
    this.spaceId = process.env.REACT_APP_CONTENTFUL_API_SPACE;
    this.accessToken = process.env.REACT_APP_CONTENTFUL_API_TOKEN;
    this.managementToken = process.env.REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN;
    this.environment = 'master'; // Default environment
    this.deliveryClient = null;
    this.managementClient = null;
    this.initialized = false;
  }

  /**
   * Initialize the Contentful service
   */
  initialize() {
    try {
      // Initialize the Content Delivery API client
      this.deliveryClient = createClient({
        space: this.spaceId,
        accessToken: this.accessToken
      });

      // Initialize the Content Management API client
      if (this.managementToken) {
        this.managementClient = createManagementClient({
          accessToken: this.managementToken
        });
      }

      this.initialized = true;
      LoggingService.log('ContentfulService initialized');
    } catch (error) {
      LoggingService.error('Failed to initialize ContentfulService', { error });
      throw error;
    }
  }

  /**
   * Ensure the service is initialized before making requests
   */
  ensureInitialized() {
    if (!this.initialized) {
      this.initialize();
    }
  }

  /**
   * Get the management space and environment
   * @returns {Promise<Object>} - The environment object
   */
  async getEnvironment() {
    this.ensureInitialized();
    
    if (!this.managementClient) {
      throw new Error('Content Management API client not initialized. Please provide a management token.');
    }

    try {
      const space = await this.managementClient.getSpace(this.spaceId);
      return await space.getEnvironment(this.environment);
    } catch (error) {
      LoggingService.error('Failed to get Contentful environment', { error });
      throw error;
    }
  }

  /**
   * Fetch content from Contentful
   * 
   * @param {string} contentType - The content type to fetch
   * @param {Object} query - Additional query parameters
   * @returns {Promise<Array>} - Promise resolving to the content items
   */
  async getContent(contentType, query = {}) {
    this.ensureInitialized();
    
    try {
      LoggingService.debug(`Fetching content of type: ${contentType}`, { query });
      
      // Check if we have the necessary credentials
      if (!this.spaceId || !this.accessToken) {
        LoggingService.error('Missing Contentful credentials', { 
          hasSpaceId: !!this.spaceId, 
          hasAccessToken: !!this.accessToken 
        });
        return [];
      }
      
      // Log the client state
      LoggingService.debug('Contentful client state', { 
        initialized: this.initialized,
        hasDeliveryClient: !!this.deliveryClient
      });
      
      const response = await this.deliveryClient.getEntries({
        content_type: contentType,
        ...query
      });
      
      LoggingService.debug(`Fetched ${contentType} content from Contentful`, { 
        total: response.total,
        limit: response.limit,
        skip: response.skip,
        itemCount: response.items?.length
      });
      
      // Log the first item structure if available
      if (response.items && response.items.length > 0) {
        const sampleItem = response.items[0];
        LoggingService.debug(`Sample ${contentType} item structure`, {
          sys: sampleItem.sys,
          fieldKeys: Object.keys(sampleItem.fields || {}),
          hasFields: !!sampleItem.fields
        });
      } else {
        LoggingService.warn(`No ${contentType} items found in Contentful`);
      }
      
      return response.items;
    } catch (error) {
      LoggingService.error(`Failed to fetch content of type: ${contentType}`, { 
        error, 
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack
      });
      return [];
    }
  }

  /**
   * Fetch a single content entry by ID
   * 
   * @param {string} entryId - The ID of the entry to fetch
   * @returns {Promise<Object>} - Promise resolving to the content entry
   */
  async getEntry(entryId) {
    this.ensureInitialized();
    
    try {
      return await this.deliveryClient.getEntry(entryId);
    } catch (error) {
      LoggingService.error(`Failed to fetch entry with ID: ${entryId}`, { error });
      return null;
    }
  }

  /**
   * Fetch assets from Contentful
   * 
   * @param {Object} query - Query parameters for filtering assets
   * @returns {Promise<Array>} - Promise resolving to the assets
   */
  async getAssets(query = {}) {
    this.ensureInitialized();
    
    try {
      const response = await this.deliveryClient.getAssets(query);
      return response.items;
    } catch (error) {
      LoggingService.error('Failed to fetch assets', { error });
      return [];
    }
  }

  /**
   * Create a content type in Contentful
   * 
   * @param {Object} contentTypeData - The content type definition
   * @returns {Promise<Object>} - The created content type
   */
  async createContentType(contentTypeData) {
    const environment = await this.getEnvironment();
    
    try {
      // Check if content type already exists
      try {
        await environment.getContentType(contentTypeData.id);
        LoggingService.warn(`Content type ${contentTypeData.id} already exists`);
        return null;
      } catch (error) {
        // Content type doesn't exist, proceed with creation
      }
      
      // Create the content type
      const contentType = await environment.createContentType(contentTypeData);
      
      // Publish the content type
      const publishedContentType = await contentType.publish();
      
      LoggingService.log(`Content type ${contentTypeData.id} created and published`);
      return publishedContentType;
    } catch (error) {
      LoggingService.error(`Failed to create content type: ${contentTypeData.id}`, { error });
      throw error;
    }
  }

  /**
   * Create an entry in Contentful
   * 
   * @param {string} contentTypeId - The content type ID
   * @param {Object} fields - The entry fields
   * @returns {Promise<Object>} - The created entry
   */
  async createEntry(contentTypeId, fields) {
    const environment = await this.getEnvironment();
    
    try {
      // Prepare localized fields (Contentful requires locale)
      const localizedFields = {};
      
      Object.keys(fields).forEach(key => {
        localizedFields[key] = {
          'en-US': fields[key]
        };
      });
      
      // Create the entry
      const entry = await environment.createEntry(contentTypeId, {
        fields: localizedFields
      });
      
      // Publish the entry
      const publishedEntry = await entry.publish();
      
      LoggingService.log(`Entry created for content type: ${contentTypeId}`);
      return publishedEntry;
    } catch (error) {
      LoggingService.error(`Failed to create entry for content type: ${contentTypeId}`, { error });
      throw error;
    }
  }

  /**
   * Create an asset in Contentful
   * 
   * @param {Object} assetData - The asset data
   * @returns {Promise<Object>} - The created asset
   */
  async createAsset(assetData) {
    const environment = await this.getEnvironment();
    
    try {
      // Create the asset
      const asset = await environment.createAsset({
        fields: {
          title: {
            'en-US': assetData.title
          },
          description: {
            'en-US': assetData.description || ''
          },
          file: {
            'en-US': {
              contentType: assetData.contentType,
              fileName: assetData.fileName,
              upload: assetData.url
            }
          }
        }
      });
      
      // Process and publish the asset
      const processedAsset = await asset.processForAllLocales();
      const publishedAsset = await processedAsset.publish();
      
      LoggingService.log(`Asset created: ${assetData.title}`);
      return publishedAsset;
    } catch (error) {
      LoggingService.error(`Failed to create asset: ${assetData.title}`, { error });
      throw error;
    }
  }

  /**
   * Create all content types defined in the data model
   * 
   * @returns {Promise<void>}
   */
  async createContentTypes() {
    try {
      // Define content types based on the data model
      const contentTypes = [
        {
          id: 'supplier',
          name: 'Supplier',
          description: 'Represents suppliers for various mushroom cultivation products',
          displayField: 'name',
          fields: [
            {
              id: 'id',
              name: 'ID',
              type: 'Symbol',
              required: true
            },
            {
              id: 'name',
              name: 'Name',
              type: 'Symbol',
              required: true
            },
            {
              id: 'description',
              name: 'Description',
              type: 'Symbol',
              required: true
            },
            {
              id: 'url',
              name: 'URL',
              type: 'Symbol',
              required: true
            },
            {
              id: 'featured',
              name: 'Featured',
              type: 'Boolean',
              required: false
            },
            {
              id: 'referralCode',
              name: 'Referral Code',
              type: 'Symbol',
              required: false
            },
            {
              id: 'type',
              name: 'Type',
              type: 'Symbol',
              required: true,
              validations: [
                {
                  in: ['substrate', 'spores', 'grain', 'accessories', 'tools']
                }
              ]
            },
            {
              id: 'products',
              name: 'Products',
              type: 'Array',
              items: {
                type: 'Link',
                linkType: 'Entry',
                validations: [
                  {
                    linkContentType: ['product']
                  }
                ]
              },
              required: false
            }
          ]
        },
        {
          id: 'product',
          name: 'Product',
          description: 'Represents products offered by suppliers',
          displayField: 'name',
          fields: [
            {
              id: 'name',
              name: 'Name',
              type: 'Symbol',
              required: true
            },
            {
              id: 'description',
              name: 'Description',
              type: 'Symbol',
              required: true
            },
            {
              id: 'price',
              name: 'Price',
              type: 'Symbol',
              required: false
            },
            {
              id: 'url',
              name: 'URL',
              type: 'Symbol',
              required: false
            },
            {
              id: 'supplier',
              name: 'Supplier',
              type: 'Link',
              linkType: 'Entry',
              validations: [
                {
                  linkContentType: ['supplier']
                }
              ],
              required: false
            }
          ]
        },
        {
          id: 'spore',
          name: 'Spore',
          description: 'Represents spore varieties and their details',
          displayField: 'subtype',
          fields: [
            {
              id: 'mushroomType',
              name: 'Mushroom Type',
              type: 'Symbol',
              required: true
            },
            {
              id: 'subtype',
              name: 'Subtype',
              type: 'Symbol',
              required: true
            },
            {
              id: 'sporeName',
              name: 'Spore Name',
              type: 'Symbol',
              required: true
            },
            {
              id: 'price',
              name: 'Price',
              type: 'Symbol',
              required: false
            },
            {
              id: 'url',
              name: 'URL',
              type: 'Symbol',
              required: false
            },
            {
              id: 'store',
              name: 'Store',
              type: 'Link',
              linkType: 'Entry',
              validations: [
                {
                  linkContentType: ['supplier']
                }
              ],
              required: false
            },
            {
              id: 'growingConditions',
              name: 'Growing Conditions',
              type: 'Text',
              required: false
            },
            {
              id: 'appearance',
              name: 'Size & Appearance',
              type: 'Text',
              required: false
            },
            {
              id: 'strength',
              name: 'Strength',
              type: 'Symbol',
              required: false
            },
            {
              id: 'moodEffects',
              name: 'Mood Effects',
              type: 'Text',
              required: false
            },
            {
              id: 'description',
              name: 'Description',
              type: 'Text',
              required: false
            },
            {
              id: 'culinaryUses',
              name: 'Culinary Uses',
              type: 'Text',
              required: false
            },
            {
              id: 'medicinalBenefits',
              name: 'Medicinal Benefits',
              type: 'Text',
              required: false
            },
            {
              id: 'difficulty',
              name: 'Difficulty',
              type: 'Symbol',
              validations: [
                {
                  in: ['beginner', 'intermediate', 'advanced']
                }
              ],
              required: false
            },
            {
              id: 'colonizationTime',
              name: 'Colonization Time',
              type: 'Symbol',
              required: false
            }
          ]
        },
        {
          id: 'educationalContent',
          name: 'Educational Content',
          description: 'Represents educational articles and resources',
          displayField: 'title',
          fields: [
            {
              id: 'title',
              name: 'Title',
              type: 'Symbol',
              required: true
            },
            {
              id: 'description',
              name: 'Description',
              type: 'Text',
              required: true
            },
            {
              id: 'content',
              name: 'Content',
              type: 'RichText',
              required: false
            },
            {
              id: 'category',
              name: 'Category',
              type: 'Symbol',
              validations: [
                {
                  in: ['basics', 'advanced', 'substrate', 'spawn']
                }
              ],
              required: true
            },
            {
              id: 'tags',
              name: 'Tags',
              type: 'Array',
              items: {
                type: 'Symbol'
              },
              required: false
            }
          ]
        },
        {
          id: 'faq',
          name: 'FAQ',
          description: 'Represents frequently asked questions',
          displayField: 'question',
          fields: [
            {
              id: 'question',
              name: 'Question',
              type: 'Symbol',
              required: true
            },
            {
              id: 'answer',
              name: 'Answer',
              type: 'RichText',
              required: true
            },
            {
              id: 'category',
              name: 'Category',
              type: 'Symbol',
              validations: [
                {
                  in: ['general', 'substrate', 'spawn', 'cultivation']
                }
              ],
              required: true
            },
            {
              id: 'order',
              name: 'Order',
              type: 'Integer',
              required: false
            }
          ]
        },
        {
          id: 'mushroomFact',
          name: 'Mushroom Fact',
          description: 'Represents interesting facts about mushrooms',
          displayField: 'fact',
          fields: [
            {
              id: 'fact',
              name: 'Fact',
              type: 'Text',
              required: true
            },
            {
              id: 'source',
              name: 'Source',
              type: 'Symbol',
              required: false
            },
            {
              id: 'category',
              name: 'Category',
              type: 'Symbol',
              required: false
            }
          ]
        },
        {
          id: 'componentContent',
          name: 'Component Content',
          description: 'Represents content for specific UI components',
          displayField: 'componentId',
          fields: [
            {
              id: 'componentId',
              name: 'Component ID',
              type: 'Symbol',
              required: true
            },
            {
              id: 'title',
              name: 'Title',
              type: 'Symbol',
              required: false
            },
            {
              id: 'description',
              name: 'Description',
              type: 'Text',
              required: false
            },
            {
              id: 'labels',
              name: 'Labels',
              type: 'Object',
              required: false
            },
            {
              id: 'buttons',
              name: 'Buttons',
              type: 'Object',
              required: false
            },
            {
              id: 'alerts',
              name: 'Alerts',
              type: 'Object',
              required: false
            },
            {
              id: 'placeholders',
              name: 'Placeholders',
              type: 'Object',
              required: false
            }
          ]
        },
        {
          id: 'substrateRecipe',
          name: 'Substrate Recipe',
          description: 'Represents substrate recipes for different mushroom types',
          displayField: 'name',
          fields: [
            {
              id: 'name',
              name: 'Name',
              type: 'Symbol',
              required: true
            },
            {
              id: 'description',
              name: 'Description',
              type: 'Text',
              required: true
            },
            {
              id: 'ingredients',
              name: 'Ingredients',
              type: 'Array',
              items: {
                type: 'Object'
              },
              required: true
            },
            {
              id: 'suitableFor',
              name: 'Suitable For',
              type: 'Array',
              items: {
                type: 'Symbol'
              },
              required: false
            },
            {
              id: 'difficulty',
              name: 'Difficulty',
              type: 'Symbol',
              validations: [
                {
                  in: ['beginner', 'intermediate', 'advanced']
                }
              ],
              required: true
            },
            {
              id: 'preparationSteps',
              name: 'Preparation Steps',
              type: 'RichText',
              required: true
            },
            {
              id: 'tips',
              name: 'Tips',
              type: 'RichText',
              required: false
            }
          ]
        }
      ];
      
      // Create each content type
      for (const contentType of contentTypes) {
        await this.createContentType(contentType);
      }
      
      LoggingService.log('All content types created');
    } catch (error) {
      LoggingService.error('Failed to create content types', { error });
      throw error;
    }
  }

  /**
   * Migrate supplier data to Contentful
   * 
   * @returns {Promise<void>}
   */
  async migrateSuppliers() {
    try {
      const suppliers = ContentService.getSuppliers();
      
      for (const supplier of suppliers) {
        await this.createEntry('supplier', {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          url: supplier.url,
          featured: supplier.featured || false,
          referralCode: supplier.referralCode || '',
          type: supplier.type
        });
        
        // Create products for this supplier
        if (supplier.products && supplier.products.length > 0) {
          for (const product of supplier.products) {
            await this.createEntry('product', {
              name: product.name,
              description: product.description,
              supplier: {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: supplier.id
                }
              }
            });
          }
        }
      }
      
      LoggingService.log('Supplier data migrated to Contentful');
    } catch (error) {
      LoggingService.error('Failed to migrate supplier data', { error });
      throw error;
    }
  }

  /**
   * Migrate spore data to Contentful
   * 
   * @returns {Promise<void>}
   */
  async migrateSpores() {
    try {
      // Get the raw spore data
      const spores = sporeData;
      
      for (const spore of spores) {
        await this.createEntry('spore', {
          mushroomType: spore.type,
          subtype: spore.name,
          sporeName: spore.name + ' Spores',
          price: spore.price,
          url: spore.url,
          growingConditions: spore.growingConditions || '',
          appearance: spore.appearance || '',
          strength: spore.strength || '',
          moodEffects: spore.moodEffects || '',
          description: spore.description || '',
          culinaryUses: spore.culinaryUses || '',
          medicinalBenefits: spore.medicinalBenefits || '',
          difficulty: spore.difficulty || 'intermediate',
          colonizationTime: spore.colonizationTime || '14-21 days'
        });
      }
      
      LoggingService.log('Spore data migrated to Contentful');
    } catch (error) {
      LoggingService.error('Failed to migrate spore data', { error });
      throw error;
    }
  }

  /**
   * Migrate educational content to Contentful
   * 
   * @returns {Promise<void>}
   */
  async migrateEducationalContent() {
    try {
      const educationalContent = ContentService.getEducationalContent();
      
      // Migrate articles
      if (educationalContent.articles) {
        for (const article of educationalContent.articles) {
          await this.createEntry('educationalContent', {
            title: article.title,
            description: article.description,
            category: 'basics'
          });
        }
      }
      
      // Migrate FAQs
      if (educationalContent.faq) {
        for (let i = 0; i < educationalContent.faq.length; i++) {
          const faq = educationalContent.faq[i];
          await this.createEntry('faq', {
            question: faq.question,
            answer: faq.answer,
            category: 'general',
            order: i + 1
          });
        }
      }
      
      LoggingService.log('Educational content migrated to Contentful');
    } catch (error) {
      LoggingService.error('Failed to migrate educational content', { error });
      throw error;
    }
  }

  /**
   * Migrate mushroom facts to Contentful
   * 
   * @returns {Promise<void>}
   */
  async migrateFacts() {
    try {
      const facts = ContentService.getStaticFacts();
      
      for (const fact of facts) {
        await this.createEntry('mushroomFact', {
          fact: fact,
          category: 'general'
        });
      }
      
      LoggingService.log('Mushroom facts migrated to Contentful');
    } catch (error) {
      LoggingService.error('Failed to migrate mushroom facts', { error });
      throw error;
    }
  }

  /**
   * Migrate component content to Contentful
   * 
   * @returns {Promise<void>}
   */
  async migrateComponentContent() {
    try {
      const componentContent = ContentService.getAllComponentContent();
      
      for (const [componentId, content] of Object.entries(componentContent)) {
        // Extract title and description if they exist
        const title = content.title || (content.header ? content.header.title : '');
        const description = content.description || (content.header ? content.header.description : '');
        
        // Create an object for the remaining content
        const contentObj = { ...content };
        if (title) delete contentObj.title;
        if (description) delete contentObj.description;
        if (contentObj.header) delete contentObj.header;
        
        await this.createEntry('componentContent', {
          componentId: componentId,
          title: title,
          description: description,
          labels: contentObj.formLabels || {},
          buttons: contentObj.buttons || {},
          alerts: contentObj.alerts || {},
          placeholders: contentObj.placeholders || {}
        });
      }
      
      LoggingService.log('Component content migrated to Contentful');
    } catch (error) {
      LoggingService.error('Failed to migrate component content', { error });
      throw error;
    }
  }

  /**
   * Migrate all content to Contentful
   * 
   * @returns {Promise<void>}
   */
  async migrateAllContent() {
    try {
      LoggingService.log('Starting content migration to Contentful');
      
      // Create content types first
      await this.createContentTypes();
      
      // Migrate all content
      await this.migrateSuppliers();
      await this.migrateSpores();
      await this.migrateEducationalContent();
      await this.migrateFacts();
      await this.migrateComponentContent();
      
      LoggingService.log('All content successfully migrated to Contentful');
    } catch (error) {
      LoggingService.error('Content migration failed', { error });
      throw error;
    }
  }
}

// Create a singleton instance
const contentfulService = new ContentfulService();

export default contentfulService;
