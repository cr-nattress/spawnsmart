# Contentful Data Model for SpawnSmart

This document outlines the content types and fields required to manage the SpawnSmart application's content through Contentful CMS.

## Content Types

### 1. Supplier

Represents suppliers for various mushroom cultivation products.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `id` | Short text | Unique identifier for the supplier |
| `name` | Short text | Name of the supplier |
| `description` | Short text | Brief description of the supplier |
| `url` | Short text | Website URL |
| `featured` | Boolean | Whether the supplier should be featured |
| `referralCode` | Short text | Referral code for affiliate links |
| `type` | Short text (dropdown) | Type of supplier (substrate, spores, grain, accessories, tools) |
| `products` | Array of References | References to Product entries |
| `logo` | Media - Image | Supplier logo |

### 2. Product

Represents products offered by suppliers.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `name` | Short text | Name of the product |
| `description` | Short text | Brief description of the product |
| `price` | Short text | Price of the product (can include currency symbol) |
| `url` | Short text | Direct URL to the product |
| `supplier` | Reference | Reference to the Supplier |
| `image` | Media - Image | Product image |

### 3. Spore

Represents spore varieties and their details.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `mushroomType` | Short text | Primary type (e.g., Psilocybe cubensis) |
| `subtype` | Short text | Specific variety (e.g., Golden Teacher) |
| `sporeName` | Short text | Marketing name for the spores |
| `price` | Short text | Price with currency symbol |
| `url` | Short text | URL to purchase |
| `store` | Reference | Reference to the Supplier |
| `growingConditions` | Long text | Detailed growing conditions |
| `appearance` | Long text | Size and appearance details |
| `strength` | Short text | Potency level (for active varieties) |
| `moodEffects` | Long text | Effects description (for active varieties) |
| `description` | Long text | General description of the variety |
| `culinaryUses` | Long text | Culinary applications (for gourmet varieties) |
| `medicinalBenefits` | Long text | Health benefits (for medicinal varieties) |
| `difficulty` | Short text (dropdown) | Growing difficulty (beginner, intermediate, advanced) |
| `colonizationTime` | Short text | Estimated colonization time |
| `image` | Media - Image | Image of the mushroom variety |

### 4. EducationalContent

Represents educational articles and resources.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `title` | Short text | Title of the article or resource |
| `description` | Long text | Brief summary or description |
| `content` | Rich text | Full content with formatting |
| `category` | Short text (dropdown) | Category (basics, advanced, substrate, spawn) |
| `tags` | Array of Short text | Tags for filtering and organization |
| `featuredImage` | Media - Image | Featured image for the content |
| `relatedContent` | Array of References | References to related educational content |

### 5. FAQ

Represents frequently asked questions.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `question` | Short text | The question |
| `answer` | Rich text | The answer with formatting |
| `category` | Short text (dropdown) | Category (general, substrate, spawn, cultivation) |
| `order` | Number | Display order |

### 6. MushroomFact

Represents interesting facts about mushrooms.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `fact` | Long text | The interesting fact |
| `source` | Short text | Source of the information (optional) |
| `category` | Short text | Category of the fact |

### 7. ComponentContent

Represents content for specific UI components.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `componentId` | Short text | ID of the component (e.g., header, calculator, resultsPanel) |
| `title` | Short text | Title text for the component |
| `description` | Long text | Description text for the component |
| `labels` | JSON Object | Key-value pairs for form labels and other UI text |
| `buttons` | JSON Object | Key-value pairs for button text |
| `alerts` | JSON Object | Key-value pairs for alert messages |
| `placeholders` | JSON Object | Key-value pairs for input placeholders |

### 8. SubstrateRecipe

Represents substrate recipes for different mushroom types.

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `name` | Short text | Name of the substrate recipe |
| `description` | Long text | Description of the substrate |
| `ingredients` | Array of JSON Objects | List of ingredients with amounts and units |
| `suitableFor` | Array of Short text | Mushroom types this substrate works well for |
| `difficulty` | Short text (dropdown) | Preparation difficulty |
| `preparationSteps` | Rich text | Step-by-step preparation instructions |
| `tips` | Rich text | Additional tips and notes |

## Content Relationships

### Relationship Diagram

```
Supplier (1) ----< Products (Many)
       ^
       |
       |
       |
      (Many)
       |
       |
Spore (Many) ----< SubstrateRecipe (Many)
       |
       |
       v
EducationalContent (Many) ----< FAQ (Many)
```

## Content Modeling Strategy

### Localization

All content types should be configured for localization to support multiple languages in the future.

### Content Reuse

- Component content should be structured to maximize reuse across the application
- Educational content should be tagged appropriately to enable filtering and cross-referencing

### Media Management

- Create separate folders for supplier logos, product images, and mushroom variety images
- Use standardized naming conventions for all assets

### Content Validation

Implement validation rules for required fields and format constraints:

- URLs should be validated to ensure they are properly formatted
- Prices should follow a consistent format
- Required fields should be clearly marked

## Implementation Notes

### API Integration

The ContentfulService should implement the following methods:

1. `getSuppliers(type)` - Get suppliers filtered by type
2. `getSpores(filters)` - Get spores with optional filtering
3. `getEducationalContent(category)` - Get educational content by category
4. `getFAQs(category)` - Get FAQs by category
5. `getComponentContent(componentId)` - Get content for a specific UI component
6. `getMushroomFacts()` - Get random mushroom facts
7. `getSubstrateRecipes(mushroomType)` - Get substrate recipes suitable for a mushroom type

### Content Migration

A migration plan should be developed to move the current hardcoded content into Contentful:

1. Create the content types in Contentful
2. Migrate supplier data
3. Migrate spore data
4. Migrate educational content and FAQs
5. Migrate component content
6. Migrate mushroom facts
7. Update the application to use the ContentfulService instead of hardcoded data
