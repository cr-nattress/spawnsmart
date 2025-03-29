# Contentful Upload Agent

This document explains how to use the ContentfulUploadAgent to upload content to Contentful using the JSON example files.

## Overview

The ContentfulUploadAgent is an AI-powered tool that automates the process of uploading content to Contentful. It reads JSON example files from the `documentation/contentful-json-examples` directory and creates content types and entries in Contentful using the ContentfulService.

## Prerequisites

- Node.js installed on your system
- Contentful account with a space created
- Content Management API token with write access to your space
- Environment variables set up in `.env` file

## How It Works

The ContentfulUploadAgent follows these steps:

1. **Initialization**: Connects to Contentful using the ContentfulService
2. **Content Type Creation**: Creates all content types defined in the JSON files
3. **Entry Creation**: Creates entries in the correct order based on dependencies
4. **Reference Resolution**: Resolves references between entries

## Upload Order

The agent uploads content in the following order to ensure that dependencies are satisfied:

1. Suppliers
2. Products (depends on Suppliers)
3. Spores (depends on Suppliers)
4. Educational Content
5. FAQs (depends on Educational Content)
6. Mushroom Facts
7. Component Content

## Usage

### Running the Upload Script

```bash
# Set your Content Management API token
REACT_APP_CONTENTFUL_MANAGEMENT_TOKEN=your_token node scripts/upload-to-contentful.js
```

### Example Output

```
Starting content upload to Contentful...
[INFO] Initializing ContentfulUploadAgent
[INFO] Uploading content types to Contentful
[INFO] Creating content type: supplier
[INFO] Creating content type: product
...
[INFO] Uploading entries to Contentful
[INFO] Creating entry from file: supplier-entry-example.json
[INFO] Successfully created entry with ID: abc123
...
[INFO] Content upload completed successfully
Content upload completed successfully!
```

## Troubleshooting

If you encounter issues during the upload process:

1. Check that your Content Management API token is valid and has the correct permissions
2. Ensure that all JSON files are properly formatted
3. Verify that the content types and fields match the Contentful data model
4. Check the console output for specific error messages

## Extending the Agent

To add new content types or modify existing ones:

1. Create new JSON example files in the `documentation/contentful-json-examples` directory
2. Update the `contentTypes` array in the ContentfulUploadAgent
3. Update the `dependencies` object if there are relationships between content types

## Security Considerations

- Never commit your Content Management API token to version control
- Use environment variables to store sensitive information
- The Content Management API token has write access to your Contentful space, so keep it secure
