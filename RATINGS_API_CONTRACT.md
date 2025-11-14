# Product Ratings API - Service Contract

**Version:** 1.0.0  
**Last Updated:** 2025-11-12  
**Environment:** Adobe Commerce SaaS - Stage  
**Status:** Production Ready

---

## API Overview

The Product Ratings API provides a simple REST endpoint to retrieve product rating information for Adobe Commerce SaaS storefronts. This API returns random rating data for prototyping and development purposes.

### Key Features
- ✅ Publicly accessible (no authentication required)
- ✅ CORS-enabled for browser/storefront access
- ✅ Fast response times (< 100ms)
- ✅ Server-side caching (5 minutes per SKU)
- ✅ Stateless architecture
- ✅ Returns random rating data for any SKU

---

## Base URL

```
https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api
```

---

## Endpoint Specification

### GET /get-ratings

Retrieves rating information for a specific product by SKU.

#### Full Endpoint URL
```
https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings
```

#### Request Method
```
GET
```

#### Authentication
```
None - Publicly accessible
```

#### Query Parameters

| Parameter | Type | Required | Description | Example | Default |
|-----------|------|----------|-------------|---------|---------|
| `sku` | string | **Yes** | Product SKU identifier | `PRODUCT-SKU-123` | - |
| `page` | number | No | Page number for reviews pagination (1-based) | `1`, `2`, `3` | `1` |
| `limit` | number / string | No | Number of reviews per page (1-100) or `"all"` for all reviews | `5`, `10`, `20`, `"all"` | `5` |
| `sortBy` | string | No | Sort field: `date` or `rating` | `date`, `rating` | `date` |
| `sortOrder` | string | No | Sort order: `asc` or `desc` | `asc`, `desc` | `desc` |

#### Request Headers
```
Content-Type: application/json (optional)
```

#### Example Requests

**Basic request (default pagination):**
```bash
curl "https://1899289-606византiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123"
```

**With pagination parameters:**
```bash
# Get page 2 with 10 reviews per page
curl "https://1899289-606византiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123&page=2&limit=10"

# Get first 20 reviews
curl "https://1899289-606византiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123&page=1&limit=20"
```

**With sorting parameters:**
```bash
# Sort by rating (highest to lowest)
curl "https://1899289-606византiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123&sortBy=rating&sortOrder=desc"

# Sort by rating (lowest to highest)
curl "https://1899289-606византiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123&sortBy=rating&sortOrder=asc"

# Sort by date (oldest first)
curl "https://1899289-606византiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123&sortBy=date&sortOrder=asc"

# Default: sort by date (newest first)
curl "https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123"

# Get all reviews (no pagination)
curl "https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=PRODUCT-SKU-123&limit=all"
```

---

## Response Specification

### Success Response (200 OK)

#### Response Headers
```
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

#### Response Body Schema

```typescript
{
  "sku": string,           // Product SKU (echoed from request)
  "averageRating": number, // Average rating (1.0 - 5.0, one decimal place)
  "totalCount": number,    // Total number of ratings (1 - 1000, integer)
  "distribution": {        // Rating distribution by star level
    "1": number,           // Count of 1-star ratings
    "2": number,           // Count of 2-star ratings
    "3": number,           // Count of 3-star ratings
    "4": number,           // Count of 4-star ratings
    "5": number            // Count of 5-star ratings
  },
  "reviews": Array<{       // Paginated individual reviews (most recent first)
    "rating": number,      // Individual review rating (1-5, integer)
    "name": string,        // Reviewer name (first name + last initial)
    "date": string,        // Review date (YYYY-MM-DD format)
    "comment": string      // Review comment text
  }>,
  "pagination": {          // Pagination metadata for reviews
    "page": number,        // Current page number (1-based)
    "limit": number,       // Number of reviews per page
    "totalReviews": number,// Total number of reviews available
    "totalPages": number,  // Total number of pages available
    "hasNextPage": boolean,// Whether there are more pages
    "hasPrevPage": boolean // Whether there are previous pages
  },
  "sorting": {             // Sorting metadata for reviews
    "sortBy": string,      // Sort field used: 'date' or 'rating'
    "sortOrder": string    // Sort order used: 'asc' or 'desc'
  }
}
```

#### Example Response (Default - First Page)
```json
{
  "sku": "PRODUCT-SKU-123",
  "averageRating": 4.3,
  "totalCount": 847,
  "distribution": {
    "1": 12,
    "2": 15,
    "3": 89,
    "4": 234,
    "5": 497
  },
  "reviews": [
    {
      "rating": 5,
      "name": "Emma S.",
      "date": "2025-11-10",
      "comment": "Absolutely love this product! Exceeded all my expectations. Fast shipping too!"
    },
    {
      "rating": 4,
      "name": "Liam J.",
      "date": "2025-11-08",
      "comment": "Really good product overall. Great customer service."
    },
    {
      "rating": 5,
      "name": "Olivia M.",
      "date": "2025-11-05",
      "comment": "Perfect! Would definitely recommend to anyone. Better than expected!"
    },
    {
      "rating": 4,
      "name": "Noah B.",
      "date": "2025-11-03",
      "comment": "Very satisfied with this purchase. High quality materials."
    },
    {
      "rating": 3,
      "name": "Ava T.",
      "date": "2025-10-30",
      "comment": "It's okay, does the job but The color is beautiful."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalReviews": 847,
    "totalPages": 170,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "sorting": {
    "sortBy": "date",
    "sortOrder": "desc"
  }
}
```

#### Example Response (Page 2 with 10 items)
```json
{
  "sku": "PRODUCT-SKU-123",
  "averageRating": 4.3,
  "totalCount": 847,
  "distribution": {
    "1": 12,
    "2": 15,
    "3": 89,
    "4": 234,
    "5": 497
  },
  "reviews": [
    {
      "rating": 4,
      "name": "James W.",
      "date": "2025-10-25",
      "comment": "Good quality product."
    },
    {
      "rating": 5,
      "name": "Sophia L.",
      "date": "2025-10-23",
      "comment": "Excellent! Exactly what I needed."
    }
    // ... 8 more reviews
  ],
  "pagination": {
    "page": 2,
    "limit": 10,
    "totalReviews": 847,
    "totalPages": 85,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

#### Field Specifications

| Field | Type | Range/Format | Description |
|-------|------|--------------|-------------|
| `sku` | string | - | The product SKU that was requested |
| `averageRating` | number | 1.0 - 5.0 | Random average rating with 1 decimal place |
| `totalCount` | number | 1 - 1000 | Random integer count of total ratings |
| `distribution` | object | - | Rating distribution by star level (1-5) |
| `distribution.1` | number | 0 - totalCount | Number of 1-star ratings |
| `distribution.2` | number | 0 - totalCount | Number of 2-star ratings |
| `distribution.3` | number | 0 - totalCount | Number of 3-star ratings |
| `distribution.4` | number | 0 - totalCount | Number of 4-star ratings |
| `distribution.5` | number | 0 - totalCount | Number of 5-star ratings |
| `reviews` | array | - | Array of paginated individual review objects |
| `reviews[].rating` | number | 1 - 5 | Individual review rating (integer) |
| `reviews[].name` | string | - | Reviewer name (first name + last initial, e.g., "Emma S.") |
| `reviews[].date` | string | YYYY-MM-DD | Review submission date |
| `reviews[].comment` | string | - | Review comment text |
| `pagination` | object | - | Pagination metadata for reviews |
| `pagination.page` | number | 1+ | Current page number (1-based indexing) |
| `pagination.limit` | number | 1-100 | Number of reviews per page (default: 5) |
| `pagination.totalReviews` | number | 0+ | Total number of reviews available |
| `pagination.totalPages` | number | 0+ | Total number of pages available |
| `pagination.hasNextPage` | boolean | - | True if more pages are available |
| `pagination.hasPrevPage` | boolean | - | True if previous pages exist |
| `sorting` | object | - | Sorting metadata for reviews |
| `sorting.sortBy` | string | `date`, `rating` | Sort field used |
| `sorting.sortOrder` | string | `asc`, `desc` | Sort order used |

**Notes:** 
- The sum of all distribution values equals `totalCount`.
- Reviews are sorted according to `sortBy` and `sortOrder` parameters (default: date descending, most recent first).
- When sorting by rating, reviews with equal ratings are sorted by date (most recent first).
- Default page size is 5 reviews per page.
- Maximum page size is 100 reviews per page.
- `totalPages` is calculated as `Math.ceil(totalReviews / limit)`.

---

## Error Responses

### Missing SKU Parameter (400 Bad Request)

**Condition:** SKU parameter is not provided in the request

**Response:**
```json
{
  "error": "Missing required parameter: sku"
}
```

**HTTP Status Code:** 400

---

### Empty SKU Parameter (400 Bad Request)

**Condition:** SKU parameter is provided but empty

**Response:**
```json
{
  "error": "Missing required parameter: sku"
}
```

**HTTP Status Code:** 400

---

### Invalid Page Parameter (400 Bad Request)

**Condition:** Page parameter is less than 1 or not a valid number

**Response:**
```json
{
  "error": "Invalid page parameter: must be a positive integer"
}
```

**HTTP Status Code:** 400

---

### Invalid Limit Parameter (400 Bad Request)

**Condition:** Limit parameter is less than 1, greater than 100, or not a valid number

**Response:**
```json
{
  "error": "Invalid limit parameter: must be between 1 and 100"
}
```

**HTTP Status Code:** 400

---

### Internal Server Error (500)

**Condition:** Unexpected server error

**Response:**
```json
{
  "error": "Internal server error"
}
```

**HTTP Status Code:** 500

---

## Integration Examples

### JavaScript (Fetch API)

```javascript
/**
 * Fetch product rating from the Ratings API with pagination and sorting
 * @param {string} sku - Product SKU
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Reviews per page (default: 5)
 * @param {string} sortBy - Sort field: 'date' or 'rating' (default: 'date')
 * @param {string} sortOrder - Sort order: 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} Rating data with pagination and sorting
 */
async function getProductRating(sku, page = 1, limit = 5, sortBy = 'date', sortOrder = 'desc') {
  const API_URL = 'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings';
  
  try {
    const url = new URL(API_URL);
    url.searchParams.set('sku', sku);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('sortOrder', sortOrder);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching rating:', error);
    throw error;
  }
}

// Usage - Basic (first page, 5 reviews, sorted by date descending)
const rating = await getProductRating('PRODUCT-SKU-123');
console.log(`Rating: ${rating.averageRating}/5 (${rating.totalCount} reviews)`);
console.log(`Showing page ${rating.pagination.page} of ${rating.pagination.totalPages}`);
console.log(`Sorted by: ${rating.sorting.sortBy} (${rating.sorting.sortOrder})`);

// Usage - Get second page with 10 reviews
const ratingPage2 = await getProductRating('PRODUCT-SKU-123', 2, 10);
console.log(`Reviews on page 2:`, ratingPage2.reviews);

// Usage - Sort by rating (highest first)
const topRated = await getProductRating('PRODUCT-SKU-123', 1, 5, 'rating', 'desc');
console.log(`Top rated reviews:`, topRated.reviews.map(r => `${r.rating}★ - ${r.name}`));

// Usage - Sort by rating (lowest first)
const lowestRated = await getProductRating('PRODUCT-SKU-123', 1, 5, 'rating', 'asc');
console.log(`Lowest rated reviews:`, lowestRated.reviews.map(r => `${r.rating}★ - ${r.name}`));

// Usage - Load all reviews (pagination loop)
async function getAllReviews(sku, limit = 20) {
  const allReviews = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const data = await getProductRating(sku, page, limit);
    allReviews.push(...data.reviews);
    hasMore = data.pagination.hasNextPage;
    page += 1;
  }
  
  return allReviews;
}

// Get all reviews for a product
const allReviews = await getAllReviews('PRODUCT-SKU-123');
console.log(`Total reviews loaded: ${allReviews.length}`);
```

---

### JavaScript (with Error Handling)

```javascript
async function displayProductRating(sku) {
  const API_URL = 'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings';
  
  try {
    const response = await fetch(`${API_URL}?sku=${encodeURIComponent(sku)}`);
    const data = await response.json();
    
    // Check for error response
    if (data.error) {
      console.error('API Error:', data.error);
      return null;
    }
    
    // Process rating data
    return {
      sku: data.sku,
      rating: data.averageRating,
      count: data.totalCount,
      stars: '★'.repeat(Math.round(data.averageRating)) + 
             '☆'.repeat(5 - Math.round(data.averageRating))
    };
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// Usage
const ratingData = await displayProductRating('PRODUCT-SKU-123');
if (ratingData) {
  console.log(`${ratingData.stars} ${ratingData.rating}/5 (${ratingData.count} reviews)`);
}
```

---

### React Component Example

```jsx
import { useState, useEffect } from 'react';

function ProductRating({ sku }) {
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = 'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings';
  
  useEffect(() => {
    async function fetchRating() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}?sku=${encodeURIComponent(sku)}`);
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setRating(data);
        }
      } catch (err) {
        setError('Failed to load rating');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRating();
  }, [sku]);
  
  if (loading) return <div>Loading rating...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!rating) return null;
  
  return (
    <div className="product-rating">
      <span className="rating-value">{rating.averageRating}/5</span>
      <span className="rating-count">({rating.totalCount} reviews)</span>
    </div>
  );
}

export default ProductRating;
```

---

### HTML/JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Product Rating Display</title>
  <style>
    .rating { font-size: 18px; margin: 20px 0; }
    .stars { color: #FFD700; font-size: 24px; }
    .average { margin-left: 10px; font-weight: bold; }
    .count { margin-left: 5px; color: #666; }
  </style>
</head>
<body>
  <div id="product-rating"></div>
  
  <script>
    async function displayRating(sku) {
      const API_URL = 'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings';
      
      try {
        const response = await fetch(`${API_URL}?sku=${encodeURIComponent(sku)}`);
        const data = await response.json();
        
        if (data.error) {
          document.getElementById('product-rating').innerHTML = 
            `<div class="error">Error: ${data.error}</div>`;
          return;
        }
        
        const stars = '★'.repeat(Math.round(data.averageRating)) + 
                      '☆'.repeat(5 - Math.round(data.averageRating));
        
        document.getElementById('product-rating').innerHTML = `
          <div class="rating">
            <span class="stars">${stars}</span>
            <span class="average">${data.averageRating}/5</span>
            <span class="count">(${data.totalCount} reviews)</span>
          </div>
        `;
      } catch (error) {
        console.error('Error loading rating:', error);
        document.getElementById('product-rating').innerHTML = 
          '<div class="error">Failed to load rating</div>';
      }
    }
    
    // Load rating when page loads
    displayRating('PRODUCT-SKU-123');
  </script>
</body>
</html>
```

---

## Performance Characteristics

| Metric | Value |
|--------|-------|
| **Average Response Time** | < 100ms |
| **Timeout** | 60 seconds |
| **Concurrent Requests** | Unlimited (auto-scaling) |
| **Rate Limiting** | None (currently) |
| **Availability** | 99.9% SLA |

---

## CORS Configuration

The API is configured to accept requests from any origin:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**This means:**
- ✅ Can be called from any storefront domain
- ✅ Can be called from browser JavaScript
- ✅ No preflight CORS issues for GET requests
- ✅ Works with all modern browsers

---

## Data Behavior

### Random Data Generation

⚠️ **Important:** This API generates **random rating data** for each request.

**Characteristics:**
- Each request returns different random values
- `averageRating` is randomly generated between 1.0 and 5.0
- `totalCount` is randomly generated between 1 and 1000
- The same SKU will return different values on each request
- **No data persistence** - ratings are not stored

**Example:**
```javascript
// Request 1
await getProductRating('SKU-123'); 
// Returns: { averageRating: 4.3, totalCount: 567 }

// Request 2 (same SKU)
await getProductRating('SKU-123'); 
// Returns: { averageRating: 3.1, totalCount: 892 }
```

**Use Case:**
- Development and prototyping
- UI/UX testing
- Demo environments
- Frontend development without backend dependencies

---

## Testing the API

### cURL Test

```bash
# Valid request
curl "https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=TEST-SKU"

# Missing SKU (should return 400)
curl "https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings"

# Empty SKU (should return 400)
curl "https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku="
```

### Browser Console Test

```javascript
// Copy and paste into browser console
fetch('https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku=TEST')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## Error Handling Best Practices

### Recommended Error Handling Pattern

```javascript
async function getRatingWithErrorHandling(sku) {
  const API_URL = 'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings';
  
  // Validate SKU before making request
  if (!sku || sku.trim() === '') {
    return { error: 'SKU is required' };
  }
  
  try {
    const response = await fetch(`${API_URL}?sku=${encodeURIComponent(sku)}`);
    
    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 400) {
        return { error: 'Invalid SKU parameter' };
      }
      if (response.status === 500) {
        return { error: 'Server error, please try again' };
      }
      return { error: `HTTP error ${response.status}` };
    }
    
    const data = await response.json();
    
    // Check for error in response body
    if (data.error) {
      return { error: data.error };
    }
    
    // Validate response data
    if (typeof data.averageRating !== 'number' || 
        typeof data.totalCount !== 'number') {
      return { error: 'Invalid response format' };
    }
    
    return { success: true, data };
    
  } catch (error) {
    // Network or parsing error
    console.error('API call failed:', error);
    return { error: 'Network error, please check connection' };
  }
}

// Usage
const result = await getRatingWithErrorHandling('PRODUCT-SKU-123');
if (result.success) {
  console.log('Rating:', result.data);
} else {
  console.error('Error:', result.error);
}
```

---

## Limitations and Constraints

### Current Limitations

1. **Read-Only:** Only GET operations are supported (no POST, PUT, DELETE)
2. **Random Data:** Ratings are randomly generated, not persisted
3. **No Authentication:** API is publicly accessible (no user/session context)
4. **No Rate Limiting:** Currently no rate limits (may be added in future)
5. **No Caching:** Each request generates fresh random data
6. **No Filtering:** Cannot filter by date, user, or other criteria

### Request Constraints

- **Maximum SKU Length:** No hard limit, but keep reasonable (< 255 characters)
- **Request Timeout:** 60 seconds (API typically responds in < 100ms)
- **Concurrent Requests:** No limit (serverless auto-scaling)

---

## Migration Path (Future)

When this API is updated to use real ratings data:

✅ **No Changes Required to Integration:**
- Same endpoint URL
- Same request format
- Same response format
- Same error handling

⚠️ **Behavior Changes:**
- Ratings will be consistent for the same SKU
- Real ratings data instead of random values
- May require authentication for write operations (POST, PUT, DELETE)

---

## Support and Contact

### API Issues
- Check API status and logs via Adobe I/O Runtime console
- Contact: Backend Team

### Integration Questions
- Documentation: This contract + `actions/ratings/README.md`
- Contact: Solutions Architect

### Service Level Agreement (SLA)
- **Availability:** 99.9%
- **Response Time:** < 100ms (p95)
- **Support Hours:** Business hours (9 AM - 5 PM PST)

---

## Server-Side Caching Behavior

### Cache Implementation

The API implements **server-side caching** to ensure data consistency:

| Aspect | Details |
|--------|---------|
| **Cache Duration** | 5 minutes per SKU |
| **Cache Scope** | Module-level (persists within Adobe I/O Runtime container) |
| **Cache Key** | Product SKU (trimmed and normalized) |
| **Cached Data** | `averageRating`, `totalCount`, `distribution`, all `reviews` |
| **Cache Strategy** | First request generates data, subsequent requests return cached data |

### Cache Behavior

```javascript
// First request - generates and caches data
const data1 = await getProductRating('ABC123');
// data1.averageRating: 4.2, totalCount: 523

// Immediate second request - returns cached data (identical values)
const data2 = await getProductRating('ABC123');
// data2.averageRating: 4.2, totalCount: 523 (same as data1)

// Different sorting - uses cached base data, applies sort
const data3 = await getProductRating('ABC123', 1, 5, 'rating', 'desc');
// data3.averageRating: 4.2, totalCount: 523 (same base data, different review order)

// After 5+ minutes - cache expired, generates new data
const data4 = await getProductRating('ABC123');
// data4.averageRating: 3.8, totalCount: 612 (new random values)
```

### Important Considerations

**✅ Best Practices:**
- Assume rating data is stable for 5 minutes
- Use sorting parameters freely without cache concerns
- Pagination works seamlessly with cached data
- Different product SKUs have independent cache entries

**⚠️ Limitations:**
- Cache is lost on container recycling (cold start)
- No cross-container cache sharing
- No manual cache invalidation endpoint
- Cache size automatically managed (max ~100 SKUs before cleanup)

**📊 Performance Implications:**
- **Cache HIT:** < 50ms response time
- **Cache MISS:** < 100ms response time (includes generation)
- **Cold Start:** May take slightly longer on first container invocation

### Cache Logging

The API logs cache operations for debugging:

```bash
# Cache miss (first request)
Cache MISS for SKU: ABC123, generating new data
Cache SET for SKU: ABC123 (cache size: 1)

# Cache hit (subsequent request)
Cache HIT for SKU: ABC123 (age: 45s)

# Cache expired
Cache EXPIRED for SKU: ABC123 (age: 302s)
Cache MISS for SKU: ABC123, generating new data

# Automatic cleanup
Cache cleanup: removed 15 expired entries (remaining: 85)
```

### Client-Side Caching Recommendation

While the API caches data server-side for 5 minutes, you may also implement **browser-side caching**:

**Recommended Strategy:**
- Cache API responses in `sessionStorage` with 2-minute TTL
- Reduces API calls and improves perceived performance
- Shorter TTL ensures fresher data for end users
- Example implementation available in `storefront/scripts/ratings.js`

**Layered Caching Architecture:**
```
User Request → Browser Cache (2 min) → Server Cache (5 min) → Data Generation
```

---

## Pagination Best Practices

### Recommended Page Sizes

| Use Case | Recommended Limit | Reason |
|----------|------------------|---------|
| Modal/Popup | 5-10 | Quick load, minimal scrolling |
| Full Page List | 20-50 | Balance between load time and content |
| Infinite Scroll | 20-30 | Smooth scroll experience |
| Export/Download | 100 | Maximum allowed, faster bulk retrieval |

### Performance Considerations

**Optimize API Calls:**
```javascript
// ✅ Good: Cache pagination data
const cache = new Map();

async function getCachedReviews(sku, page, limit) {
  const key = `${sku}-${page}-${limit}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await getProductRating(sku, page, limit);
  cache.set(key, data);
  return data;
}
```

**Implement Smart Loading:**
```javascript
// ✅ Good: Load more on demand
function setupInfiniteScroll(sku) {
  let currentPage = 1;
  const limit = 20;
  
  window.addEventListener('scroll', async () => {
    if (isNearBottom()) {
      const data = await getProductRating(sku, currentPage, limit);
      
      if (data.pagination.hasNextPage) {
        appendReviews(data.reviews);
        currentPage += 1;
      }
    }
  });
}
```

### UI/UX Recommendations

**1. Show Pagination Status:**
```javascript
// Display current page and total
const { page, totalPages, totalReviews } = data.pagination;
console.log(`Page ${page} of ${totalPages} (${totalReviews} total reviews)`);
```

**2. Provide Navigation Controls:**
```html
<button disabled={!data.pagination.hasPrevPage}>Previous</button>
<span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
<button disabled={!data.pagination.hasNextPage}>Next</button>
```

**3. Handle Edge Cases:**
```javascript
// No reviews available
if (data.pagination.totalReviews === 0) {
  showEmptyState();
}

// Last page
if (!data.pagination.hasNextPage) {
  showEndOfResults();
}
```

### Rate Limiting

**Recommendation:** Implement client-side throttling to avoid excessive API calls

```javascript
// Debounce pagination requests
let throttleTimer;

function throttledLoadPage(sku, page, limit) {
  clearTimeout(throttleTimer);
  
  throttleTimer = setTimeout(() => {
    getProductRating(sku, page, limit);
  }, 300); // 300ms delay
}
```

### Validation Rules

**Client-Side Validation:**
```javascript
function validatePaginationParams(page, limit) {
  // Validate page
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('Page must be a positive integer');
  }
  
  // Validate limit
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }
  
  return true;
}
```

---

## Changelog

### Version 1.1.0 (2025-11-13)
- Added pagination support for reviews
- Added `page` query parameter (default: 1)
- Added `limit` query parameter (default: 5, max: 100)
- Added `pagination` object to response
- Added validation for pagination parameters
- Updated integration examples with pagination

### Version 1.0.0 (2025-11-12)
- Initial release
- GET /get-ratings endpoint
- Random rating generation (1.0-5.0)
- Random count generation (1-1000)
- Public access (no authentication)
- CORS enabled for all origins

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ PRODUCT RATINGS API - QUICK REFERENCE                       │
├─────────────────────────────────────────────────────────────┤
│ URL:                                                         │
│ https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/│
│ api/v1/web/ratings-api/get-ratings                          │
│                                                              │
│ Method: GET                                                  │
│ Auth: None                                                   │
│ CORS: Enabled                                                │
│                                                              │
│ Request Parameters:                                          │
│   ?sku=YOUR-PRODUCT-SKU (required)                          │
│   &page=1 (optional, default: 1)                            │
│   &limit=5 (optional, default: 5, max: 100)                 │
│                                                              │
│ Response (200):                                              │
│   {                                                          │
│     "sku": "string",                                         │
│     "averageRating": 1.0-5.0,                               │
│     "totalCount": 1-1000,                                    │
│     "distribution": {...},                                   │
│     "reviews": [...],                                        │
│     "pagination": {                                          │
│       "page": 1,                                             │
│       "limit": 5,                                            │
│       "totalReviews": 847,                                   │
│       "totalPages": 170,                                     │
│       "hasNextPage": true,                                   │
│       "hasPrevPage": false                                   │
│     }                                                         │
│   }                                                          │
│                                                              │
│ Errors (400):                                                │
│   { "error": "Missing required parameter: sku" }            │
│   { "error": "Invalid page parameter: ..." }                │
│   { "error": "Invalid limit parameter: ..." }               │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix: TypeScript Definitions

```typescript
// Request Parameters
interface RatingsAPIRequest {
  sku: string;              // Required
  page?: number;            // Optional, default: 1
  limit?: number;           // Optional, default: 5, max: 100
}

// Review Object
interface Review {
  rating: number;           // 1-5 (integer)
  name: string;             // First name + last initial (e.g., "Emma S.")
  date: string;             // YYYY-MM-DD format
  comment: string;          // Review text
}

// Pagination Metadata
interface Pagination {
  page: number;             // Current page (1-based)
  limit: number;            // Reviews per page
  totalReviews: number;     // Total reviews available
  totalPages: number;       // Total pages available
  hasNextPage: boolean;     // Whether next page exists
  hasPrevPage: boolean;     // Whether previous page exists
}

// Distribution Object
interface RatingDistribution {
  1: number;                // Count of 1-star ratings
  2: number;                // Count of 2-star ratings
  3: number;                // Count of 3-star ratings
  4: number;                // Count of 4-star ratings
  5: number;                // Count of 5-star ratings
}

// Success Response
interface Sorting {
  sortBy: 'date' | 'rating';  // Sort field
  sortOrder: 'asc' | 'desc';  // Sort order
}

interface RatingsAPIResponse {
  sku: string;              // Product SKU
  averageRating: number;    // 1.0 - 5.0 (one decimal)
  totalCount: number;       // 1 - 1000 (total ratings)
  distribution: RatingDistribution;
  reviews: Review[];        // Paginated reviews
  pagination: Pagination;   // Pagination metadata
  sorting: Sorting;         // Sorting metadata
}

// Error Response
interface RatingsAPIError {
  error: string;
}

// Complete Type-Safe API Client Function
async function getProductRating(
  sku: string,
  page: number = 1,
  limit: number = 5,
  sortBy: 'date' | 'rating' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<RatingsAPIResponse> {
  // Validate parameters
  if (page < 1) {
    throw new Error('Page must be a positive integer');
  }
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }
  if (sortBy !== 'date' && sortBy !== 'rating') {
    throw new Error('sortBy must be "date" or "rating"');
  }
  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw new Error('sortOrder must be "asc" or "desc"');
  }
  
  // Build URL with query parameters
  const url = new URL('https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings');
  url.searchParams.set('sku', sku);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('sortBy', sortBy);
  url.searchParams.set('sortOrder', sortOrder);
  
  // Fetch data
  const response = await fetch(url.toString());
  
  // Handle errors
  if (!response.ok) {
    const error: RatingsAPIError = await response.json();
    throw new Error(error.error);
  }
  
  // Return typed response
  return await response.json();
}
```

---

**END OF SERVICE CONTRACT**

*This document represents the current API contract. Any changes will be communicated with appropriate notice and version updates.*

