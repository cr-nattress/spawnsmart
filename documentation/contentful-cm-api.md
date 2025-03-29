✅ Option 2: Using Contentful Management API
This method provides more flexibility if you're working with custom scripts or integrating with other systems.

Install SDK:

bash
Copy
Edit
npm install contentful-management
Create Script to Upload Data: Here's a basic example of uploading entries:

javascript
Copy
Edit
const contentful = require('contentful-management');

const client = contentful.createClient({
  accessToken: '<your-management-token>',
});

async function uploadEntries() {
  const space = await client.getSpace('<your-space-id>');
  const environment = await space.getEnvironment('<your-environment-id>');

  const data = [
    { title: 'Entry 1', description: 'Description 1' },
    { title: 'Entry 2', description: 'Description 2' },
    // Add more entries as needed
  ];

  for (const item of data) {
    await environment.createEntry('<your-content-type-id>', {
      fields: {
        title: { 'en-US': item.title },
        description: { 'en-US': item.description },
      },
    });
    console.log(`Uploaded entry: ${item.title}`);
  }
}

uploadEntries().catch(console.error);