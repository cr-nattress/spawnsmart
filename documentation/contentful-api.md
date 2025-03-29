Awesome. I’ll put together a README that outlines everything your internal devs need to know to communicate with the Contentful Content Delivery API using JavaScript/React, including setup instructions, example requests/responses, and error handling with a focus on using personal access tokens.

I’ll let you know as soon as it’s ready!

# Contentful Content Delivery API with JavaScript/React – Developer Guide

## Introduction 
Contentful’s **Content Delivery API (CDA)** is a RESTful, read-only API for delivering published content from Contentful to your applications ([API basics | Contentful](https://www.contentful.com/developers/docs/concepts/apis/#:~:text=The%20Content%20Delivery%20API%20,and%20other%20media%20as%20files)). It provides your content as JSON data, making it easy to consume in web or mobile apps. Using the CDA, you can fetch entries (pieces of content like blog posts, products, etc.) and assets (images, files) from your Contentful space to display on your website or React application. This guide will walk you through setting up and using the CDA in a JavaScript/React codebase.

## Setup and Installation 
To get started with Contentful in a React project, follow these steps:

1. **Create a Contentful Account and Space:** Sign up for Contentful (if you haven’t already) and create a *Space* – a container for all your content (e.g. one space per project or website). Note down the **Space ID**, which you can find in your space settings or API keys section. You will need this ID to query the API.

2. **Define Content Model and Content (optional):** Within your space, define some Content Types (models for your content, e.g. *BlogPost*, *Product*) and add a few entries. This isn’t strictly required for using the API, but you’ll need content in your space to fetch and display.

3. **Get a Content Delivery API Key (Access Token):** In the Contentful web app, navigate to **Settings > API keys** for your space. Create a new API Key (or use the default one). This will provide you with:
   - **Space ID:** (same as above, if not already known)
   - **Content Delivery API Access Token:** a token used to authenticate requests to the CDA. (This read-only token is sometimes informally called a *personal access token*, although “Personal Access Tokens” in Contentful usually refer to CMA tokens for the management API.) Use the generated delivery API token for accessing content. *Example:* The Contentful web app allows creating API keys and tokens per space ([Authentication | Contentful](https://www.contentful.com/developers/docs/references/authentication/#:~:text=You%20can%20also%20create%20API,and%20create%20your%20first%20token)). 

4. **Install Contentful’s JavaScript SDK:** Using npm or yarn, install the official Contentful client library. In your project directory, run:  
   ```bash
   npm install contentful
   ```  
   This library simplifies making requests to the CDA. (Alternatively, you could use `fetch` or Axios to call the REST API directly, but the SDK is recommended for convenience.)

5. **Initialize the Contentful Client in Your Code:** Import and configure the client with your credentials (space ID and delivery access token). For example, in a React app you might create a utility module (or use it directly in a component):  
   ```js
   import * as contentful from 'contentful';

   const client = contentful.createClient({
     space: '<YOUR_SPACE_ID>',
     accessToken: '<YOUR_CDA_ACCESS_TOKEN>'
   });
   ```  
   This establishes a client instance that you will use to fetch data. (If you have multiple environments in your space, you can also specify the environment ID, default is `"master"`).

6. **(Optional) Configure Environment Variables:** It’s a best practice not to hardcode your Space ID and access token. Instead, store them in environment variables and load them in your app. For example, in a Create React App, you can put them in a `.env` file as `REACT_APP_CONTENTFUL_SPACE_ID=...` and `REACT_APP_CONTENTFUL_ACCESS_TOKEN=...`, then use `process.env.REACT_APP_CONTENTFUL_SPACE_ID` in your code. This keeps secrets out of your repository – you’ll provide actual values through your build or hosting environment. (See **Best Practices** section below for more on API key security.)

With the client set up, you’re ready to authenticate and fetch content from Contentful.

## Authentication (Using Your Access Token) 
Every request to the Content Delivery API must include a valid access token to authenticate. When using the Contentful JavaScript SDK, the authentication is handled for you once you initialize the client with the `accessToken` as shown above. The client will internally include this token in API requests.

If you are making raw HTTP requests (e.g. via `fetch`), you can authenticate by adding the token as a query parameter or Authorization header. For example, a basic GET request with fetch might look like: 

```js
const spaceId = '<YOUR_SPACE_ID>';
const accessToken = '<YOUR_CDA_ACCESS_TOKEN>';
fetch(`https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}`)
  .then(res => res.json())
  .then(data => console.log(data));
``` 

Here the `access_token` query parameter is used to authenticate ([Authentication | Contentful](https://www.contentful.com/developers/docs/references/authentication/#:~:text=)). (Alternatively, you could set an HTTP header `Authorization: Bearer <ACCESS_TOKEN>` when using certain tokens.) Using the official SDK (as in this guide) abstracts this – you only need to provide the token when creating the client.

**Personal Access Token vs. Delivery Token:** Contentful distinguishes management tokens from delivery tokens. The token we use with the CDA is a delivery API key scoped to your space (obtained via the web app as above). Contentful *Personal Access Tokens* typically refer to tokens for the Content Management API (CMA) which grants broader access including writing content. For security, **use the delivery access token for read-only content queries**. It does not require associating with a user account login, only with the space’s API key ([Authentication | Contentful](https://www.contentful.com/developers/docs/references/authentication/#:~:text=To%20access%20the%20Content%20Management,the%20owner%20of%20the%20account)) ([Hiding contentful Space id and access token, client side javascript file - Stack Overflow](https://stackoverflow.com/questions/36134591/hiding-contentful-space-id-and-access-token-client-side-javascript-file#:~:text=Something%20interesting%20to%20note%20is,Contentful%2C%20just%20to%20read%20it)).

Once your client is configured with the correct Space ID and access token, you are authenticated and can start retrieving content.

## Fetching All Entries 
One of the most basic operations is to fetch all entries in your space. This will retrieve an array of all published entries (across all content types) up to the default or specified limit. Using the Contentful JS client, you can do this with `getEntries()`:

```js
client.getEntries()
  .then(response => {
    console.log(response.items);
    // work with response.items, which is an array of entry objects
  })
  .catch(error => console.error(error));
``` 

In the above code, `response` is an object containing the result set and some metadata. The array of entries is in `response.items`. Each entry in `items` has a **`sys`** property (system metadata like `id`, content type, timestamps) and a **`fields`** property (the actual content fields and their values). 

**Sample Response:** A successful response for fetching all entries might look like (truncated for brevity):

```json
{
  "sys": { "type": "Array" },
  "total": 4,
  "skip": 0,
  "limit": 100,
  "items": [
    {
      "sys": { 
        "id": "5KsDBWseXY6QegucYAoacS",
        "type": "Entry",
        "contentType": { "sys": { "id": "product", ... } },
        "createdAt": "2023-01-10T12:00:00Z",
        "updatedAt": "2023-01-15T08:30:00Z"
      },
      "fields": {
        "productName": "Whisk Beater",
        "price": 22,
        "...": "..." 
      }
    },
    {
      "sys": { "id": "3DVqIYj4dOwwcKu6sgqOgg", "type": "Entry", ... },
      "fields": {
        "productName": "SoSo Wall Clock",
        "price": 120
      }
    }
    /* ...other entries... */
  ]
}
``` 

In this example, there were 4 entries in the space, so `total: 4` and `items` contains four objects. We show two items here: for instance, a product with name "Whisk Beater" and another "SoSo Wall Clock", each with some fields like `price`. The `sys.type: "Array"` indicates the response is a collection. By default the API returns at most 100 entries per call, so if your space has more, you’d get `limit: 100` and you can use pagination to retrieve further pages (discussed below) ([Content Delivery API | Contentful](https://www.contentful.com/developers/docs/references/content-delivery-api/#:~:text=%7B%20,%5D)).

Each entry’s `fields` contain your content data. Notice that for text and number fields we see the actual values, while references to other entries or assets would appear as objects with an `sys` link (the Contentful SDK by default will automatically resolve one level of links for you, so you might already get the linked object in `fields` instead of just an ID).

## Fetching Entries by Content Type 
Often you will want to retrieve entries of a specific content type (for example, all blog posts or all products). The CDA allows filtering by content type by using the `content_type` query parameter. Using the JavaScript SDK, you pass this as an option to `getEntries()`:

```js
client.getEntries({ content_type: '<CONTENT_TYPE_ID>' })
  .then(response => {
    console.log(`Found ${response.items.length} entries of the specified content type.`);
    console.log(response.items);
  });
``` 

Replace `CONTENT_TYPE_ID` with the ID of your content type (you can find this in Contentful web app under Content model, or in the URL when viewing the content type). For example, if you have a content type *Product*, its ID might be `"product"` (IDs are usually lowercase and may differ from the name).

**Sample Response:** Suppose we query all entries of content type `Product`. The response structure is similar to the above, but now `items` will only include entries of type Product. For example:

```json
{
  "sys": { "type": "Array" },
  "total": 4,
  "skip": 0,
  "limit": 100,
  "items": [
    {
      "sys": { "id": "6dbjWqNd9SqccegcqYq224", "contentType": { "sys": { "id": "product" } } },
      "fields": {
        "productName": "Whisk Beater",
        "price": 22
      }
    },
    {
      "sys": { "id": "5KsDBWseXY6QegucYAoacS", "contentType": { "sys": { "id": "product" } } },
      "fields": {
        "productName": "Playsam Streamliner Classic Car, Espresso",
        "price": 44
      }
    },
    /* ...two more product entries... */
  ]
}
``` 

All four items in the array are Products (as indicated by each item’s `sys.contentType.sys.id`). In this example, the products returned have field values like `productName` and `price`. If the content type has other fields (text, references, etc.), those would appear under each item’s `fields` as well.

To iterate over these in React/JS, you could do something like: 

```js
const productEntries = response.items;
productEntries.forEach(entry => {
  console.log(entry.fields.productName, entry.fields.price);
});
``` 

This would log each product’s name and price. In the sample above, you’d see “Whisk Beater 22”, “Playsam Streamliner Classic Car, Espresso 44”, etc.

**Note:** When filtering by a field value (shown next), you **must** include a `content_type` parameter. The API requires knowing which content type’s fields to filter on, since field names can overlap between types ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=When%20you%20filter%20by%20the,same%20across%20all%20content%20types)). For simple content type filtering as shown here, that requirement is already satisfied by providing the `content_type` in the query.

## Fetching a Single Entry by ID 
If you know a specific entry’s ID (for example, you want to fetch a particular page or product by its ID), you can request it directly. Using the SDK:

```js
client.getEntry('<ENTRY_ID>')
  .then(entry => {
    console.log(entry.fields);
  })
  .catch(err => console.error(err));
``` 

This will retrieve the entry with the given ID (if it exists and is published). You can find an entry’s ID in the Contentful web app – when viewing an entry, the URL contains `/entries/<ENTRY_ID>` at the end. You might also get entry IDs from a previous query’s results (each item’s `sys.id`). 

**Sample Response:** Fetching a single entry returns an object with that entry’s data. For example, if `<ENTRY_ID>` refers to a Product entry (say, the “Playsam Streamliner Classic Car” product), the result could be:

```json
{
  "sys": {
    "id": "5KsDBWseXY6QegucYAoacS",
    "type": "Entry",
    "contentType": { "sys": { "id": "product", "type": "Link", "linkType": "ContentType" } },
    "createdAt": "2023-01-10T12:00:00Z",
    "updatedAt": "2023-01-15T08:30:00Z",
    "environment": { "sys": { "id": "master" } },
    "revision": 3,
    "locale": "en-US"
  },
  "fields": {
    "slug": "playsam-streamliner-classic-car-espresso",
    "productName": "Playsam Streamliner Classic Car, Espresso",
    "productDescription": "A classic Playsam design, the Streamliner Classic Car has been selected as a Swedish Design Classic by the national museum...",
    "sizetypecolor": "Length: 135 mm | color: espresso, green, or icar (white)",
    "price": 44,
    "sku": "B001R6JUZ2",
    "quantity": 56,
    "image": [ /* Asset link object */ ],
    "brand": { /* Reference to a Brand entry */ },
    "tags": [ "wood", "toy", "car", "sweden", "design" ],
    "website": "http://www.amazon.com/dp/B001R6JUZ2/"
  }
}
``` 

Here we see the entry’s `sys` metadata (including its id, contentType, timestamps, etc.) and all its fields. The `fields` object contains key-value pairs for each field of the content type. For primitive types (Text, Number, etc.), you get the value directly (string, number, etc.). For references (like `image` which is an Asset reference, or `brand` which links to another Entry), the value may be a link object; however, since the JS client by default resolves one level of links, you might actually get the linked entry/asset data embedded. In our example above, we left the asset and reference as placeholders. You could use those IDs to fetch the linked items or rely on the includes (the raw JSON would include an `includes` property with linked objects if not resolved automatically).

From the code perspective, after calling `getEntry`, you can use the returned entry object. For example, `entry.fields.productName` would be `"Playsam Streamliner Classic Car, Espresso"` ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=client.getEntry%28%27,sys)) ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=The%20object%20received%20by%20the,Product)). You can then display these values in your React components as needed.

## Using Query Parameters (Filtering, Ordering, Pagination) 
The Contentful CDA supports a variety of query parameters to refine the results. Using the SDK’s `getEntries` method, you can pass an object with query options. Here are common use-cases:

### Filtering Entries by a Field 
You can filter results to entries that meet certain field criteria. For example, to get all products with a specific SKU:

```js
client.getEntries({
  content_type: 'product',
  'fields.sku': 'B00E82D7I8'
})
  .then(res => {
    res.items.forEach(it => console.log(it.fields.sku));
  });
``` 

In this query, we provide `content_type: 'product'` and also `'fields.sku': 'B00E82D7I8'`. This will return only entries of type Product whose **SKU** field equals `"B00E82D7I8"`. (As noted, we included content_type because we are filtering by a field; the API requires it to know which field schema to apply ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=When%20you%20filter%20by%20the,same%20across%20all%20content%20types)).) 

**Sample Response:** If an entry with that SKU exists, the response might be an array with just that one entry. For example:

```json
{
  "sys": { "type": "Array" },
  "total": 1,
  "skip": 0,
  "limit": 100,
  "items": [
    {
      "sys": { "id": "7yFg...abcd", "contentType": { "sys": { "id": "product" } } },
      "fields": {
        "productName": "Some Product Name",
        "sku": "B00E82D7I8",
        "price": 99
      }
    }
  ]
}
``` 

If no entries match the filter, you’d get `"total": 0` and an empty `items` array.

You can use various operators in filters as well. Contentful supports query operators such as `[ne]` (not equal), `[exists]` (field exists or not), `[lt]`/`[gt]` (less/greater than), `[in]` (field value in a set), full-text search on text fields, etc. For example, to get all products where the `price` field is greater or equal to 20, you could query `{ content_type: 'product', 'fields.price[gte]': 20 }`. To use operators, append them in brackets after the field name in the query object.

### Ordering Results 
By default, the results might not be in a particular order (generally it’s by creation date). You can sort the entries by a specific field or system attribute using the `order` parameter. For example, to order products by price (ascending):

```js
client.getEntries({
  content_type: 'product',
  order: 'fields.price'
})
  .then(res => {
    res.items.forEach(p => console.log(p.fields.productName, p.fields.price));
  });
``` 

This will return all product entries sorted by their price value in ascending order. If you want descending order, prefix the field with a hyphen: `order: '-fields.price'`. You can also sort by multiple fields (as a comma-separated list or by providing multiple `order` parameters). Additionally, you may sort by system fields like `sys.createdAt` or `sys.updatedAt` – for example `order: '-sys.createdAt'` gives newest entries first ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=client%20.getEntries%28,length%29%3B%20%2F%2F%20200)).

**Sample:** Using the above order by price query, if we logged each item’s name and price, you might see output like:
```
Hudson Wall Cup 11
Whisk Beater 22
Playsam Streamliner Classic Car, Espresso 44
SoSo Wall Clock 120
``` 
indicating the entries were sorted by the price field.

### Pagination (Limit & Skip) 
By default, `getEntries` returns up to 100 entries (even if your space has more) ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=It%27s%20similar%20to%20getting%20a,and%20parameters%20relevant%20to%20pagination)). You can control pagination using the `limit` and `skip` parameters:
- `limit`: how many entries to fetch (max 1000 per request as per API limits).
- `skip`: how many entries to skip from the start.

For example, if you want to retrieve entries 101–200 (the second page of results, assuming 100 per page):

```js
client.getEntries({
  content_type: 'product',
  skip: 100,
  limit: 100,
  order: 'sys.createdAt'
})
  .then(res => {
    console.log(`Retrieved ${res.items.length} entries out of ${res.total} total.`);
  });
``` 

In this query, we skip the first 100 and then get the next 100 entries, ordering by creation date for consistency. The response will include the same structure with `items` array. The metadata `total` tells you how many total entries match the query (which, with no additional filters besides content_type in this case, would be total number of products). You can then calculate how many pages you need (e.g. if `total` is 250 and `limit` is 100, you’ll need 3 requests: skip 0, 100, 200). The `items.length` will equal the number of items actually returned (which could be less than `limit` on the final page).

Contentful’s response for a collection also includes `skip` and `limit` in the JSON for clarity ([Content Delivery API | Contentful](https://www.contentful.com/developers/docs/references/content-delivery-api/#:~:text=%7B%20,%5D)). Always check `response.total` vs the length of items to know if there are more pages to fetch.

## Error Handling in JavaScript/React 
When working with the Contentful CDA, you should handle potential errors, such as network issues or invalid queries. There are a few common scenarios to account for:

- **Invalid Credentials:** If the space ID or access token is wrong (or revoked), the API will return an error (HTTP 401 or 404). For example, a wrong space ID might yield a response with `{"sys": { "type": "Error", "id": "NotFound" }, "message": "The resource could not be found."}` ([Authentication | Contentful](https://www.contentful.com/developers/docs/references/authentication/#:~:text=%7B%20,Space)). In the SDK, this would surface via the Promise being rejected (or an exception in async/await).

- **Entry Not Found:** If you request a specific entry ID that doesn’t exist or isn’t published, you’ll get a 404 Not Found error. The SDK will throw an error in this case as well.

- **Network Errors:** If the network request fails (due to connectivity or a blocked domain, etc.), a fetch call would throw or return an error response. The SDK’s promise would reject with e.g. a NetworkError.

- **Rate Limiting:** Contentful has rate limits on API usage. If you exceed them, you may get a 429 Too Many Requests error. This is less common in typical usage, but if it happens, you should catch it and implement a retry with backoff strategy (the response headers will indicate when you can retry).

**Handling in Code:** Using promises: always include a `.catch` on `client.getEntries()` or `client.getEntry()`. Using `async/await`: wrap calls in `try...catch`. For example:

```js
async function fetchData() {
  try {
    const response = await client.getEntries({ content_type: 'product' });
    // Use response.items here
  } catch (error) {
    console.error('Error fetching entries:', error.message);
    // You could update component state to display an error message to users
  }
}
```

In a React component, you might call this in a `useEffect` and set state with the results or error. Ensure you handle the loading state and any errors gracefully (e.g., show a user-friendly message if content cannot be loaded).

The error object from the SDK will contain information about what went wrong. You can inspect `error.name` or `error.message`. If using raw fetch, check `response.ok` and if false, parse the JSON error message from `response.json()`. For example:

```js
fetch(url)
  .then(async res => {
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(`${res.status}: ${errData.message}`);
    }
    return res.json();
  })
  .then(data => { /* handle data */ })
  .catch(err => { console.error(err); });
```

The key is to gracefully catch errors so that a failure in contacting the API doesn’t crash your app. Log the error (for debugging) and inform the user if necessary. In development, you can also use Contentful’s response details to pinpoint issues (e.g., a "NotFound" message could hint at a wrong ID or token).

## Best Practices for API Keys and Environment Variables 
Working with API keys requires careful handling to avoid exposing sensitive information or leaking write access keys:

- **Do Not Commit API Keys to Repos:** Keep your Contentful access tokens and space IDs out of your version control. Use environment variables or a separate config file that is not committed (and add it to `.gitignore`). This prevents your keys from becoming public.

- **Use Environment Variables:** As mentioned in **Setup**, you can use environment variables to store the Space ID and Access Token. Many React setups (Create React App, Next.js, etc.) support loading variables from a `.env` file. For CRA, remember to prefix with `REACT_APP_` and restart the dev server after adding. Using env vars means you can set the real values in your deployment environment or CI, and not hardcode them. This is considered a good practice for keeping “secrets” or configuration separate from code ([Hiding contentful Space id and access token, client side javascript file - Stack Overflow](https://stackoverflow.com/questions/36134591/hiding-contentful-space-id-and-access-token-client-side-javascript-file#:~:text=There%20a%20few%20different%20ways,99019dfff716)).

- **Read-Only vs Read-Write Tokens:** Contentful’s CDA tokens are read-only. **Never expose a Content Management API (CMA) token** (which has write/delete permissions) in any client-side code ([Hiding contentful Space id and access token, client side javascript file - Stack Overflow](https://stackoverflow.com/questions/36134591/hiding-contentful-space-id-and-access-token-client-side-javascript-file#:~:text=Something%20interesting%20to%20note%20is,Contentful%2C%20just%20to%20read%20it)). If you only use the CDA token on the front-end, the worst someone could do is read your published content – which is usually acceptable since that content is meant to be public on your site anyway. However, treat the CDA token with some caution too: if your project is open source, you might not want to publish the token publicly, as someone could then use your content in unintended ways or exhaust your rate limit. If needed, you can regenerate the token in Contentful to revoke access.

- **Regenerate or Restrict Keys if Needed:** In Contentful’s settings, you can create multiple API keys (tokens) for a space. For instance, use one for development and one for production. If a token is compromised or misused, revoke it (delete the key in Contentful) and generate a new one. Monitor your usage on Contentful – if you see unusual activity, consider rotating the keys.

- **Do Not Expose Secrets in Client-Side If Possible:** While the CDA tokens are safe for client-side use (read-only), some teams opt to keep even those off the front-end by proxying requests through a backend. For example, you could have a simple Node/Express proxy or serverless function that holds the token and fetches Contentful data on behalf of the client. This way, the token is never in the browser. This can be overkill for many cases, but it’s an extra layer of security and also allows caching of responses to reduce direct hits to the API.

- **Store Tokens Securely:** If your app has a backend component, store the tokens in secure config or vault services provided by your hosting. For front-end only apps, rely on build-time environment injection (so the token isn’t in your source code). 

In summary, **treat your Contentful API keys as you would any other API secret**. Use environment variables to keep them out of the codebase ([Hiding contentful Space id and access token, client side javascript file - Stack Overflow](https://stackoverflow.com/questions/36134591/hiding-contentful-space-id-and-access-token-client-side-javascript-file#:~:text=There%20a%20few%20different%20ways,99019dfff716)), and never expose a write-enabled key on the client. By following these practices, you ensure that your Contentful content remains secure and only accessible in the ways you intend.

---

By following this guide, you should be able to set up a React application that safely communicates with Contentful’s Content Delivery API to fetch and display content. You learned how to initialize the client, query for entries in various ways, handle the responses (and errors), and keep your access keys secure. With this foundation, you can build dynamic content-driven applications powered by Contentful. Happy coding!

**Sources:**

- Contentful JS SDK and CDA Documentation – Contentful Developers Docs ([API basics | Contentful](https://www.contentful.com/developers/docs/concepts/apis/#:~:text=The%20Content%20Delivery%20API%20,and%20other%20media%20as%20files)) ([Authentication | Contentful](https://www.contentful.com/developers/docs/references/authentication/#:~:text=You%20can%20also%20create%20API,and%20create%20your%20first%20token)) ([Authentication | Contentful](https://www.contentful.com/developers/docs/references/authentication/#:~:text=%7B%20,Space)) ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=client.getEntry%28%27,sys)) ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=The%20object%20received%20by%20the,Product)) ([Content Delivery API | Contentful](https://www.contentful.com/developers/docs/references/content-delivery-api/#:~:text=%7B%20,%5D)) ([Getting Started with Contentful and JavaScript | Contentful](https://www.contentful.com/developers/docs/javascript/tutorials/using-js-cda-sdk/#:~:text=When%20you%20filter%20by%20the,same%20across%20all%20content%20types)) ([Hiding contentful Space id and access token, client side javascript file - Stack Overflow](https://stackoverflow.com/questions/36134591/hiding-contentful-space-id-and-access-token-client-side-javascript-file#:~:text=There%20a%20few%20different%20ways,99019dfff716)) ([Hiding contentful Space id and access token, client side javascript file - Stack Overflow](https://stackoverflow.com/questions/36134591/hiding-contentful-space-id-and-access-token-client-side-javascript-file#:~:text=Something%20interesting%20to%20note%20is,Contentful%2C%20just%20to%20read%20it)) (accessed 2025)