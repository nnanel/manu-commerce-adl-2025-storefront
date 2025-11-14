# Product Ratings Distribution - Implementation Requirements

## Overview

Implement a ratings distribution histogram on the Product Detail Page (PDP) that displays the breakdown of ratings by star level (1-5 stars) with horizontal bar charts.

## Reference Design

![Ratings Distribution Reference](reference-image.png)

The component should display:
- 5 rows (one for each star rating from 5 stars down to 1 star)
- Each row shows:
  - Star icon + number (e.g., "5 ★", "4 ★", etc.)
  - Horizontal bar chart showing percentage of total ratings
  - Count of ratings (e.g., "6", "0", etc.)

## API Contract

The Ratings API now returns distribution data:

### Updated API Response

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
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `sku` | string | Product SKU |
| `averageRating` | number | Average rating (1.0-5.0) |
| `totalCount` | number | Total number of ratings |
| `distribution` | object | Rating counts by star level |
| `distribution.1` | number | Number of 1-star ratings |
| `distribution.2` | number | Number of 2-star ratings |
| `distribution.3` | number | Number of 3-star ratings |
| `distribution.4` | number | Number of 4-star ratings |
| `distribution.5` | number | Number of 5-star ratings |

**Note:** Sum of all distribution values equals `totalCount`.

## Component Requirements

### 1. Location

- **Page:** Product Detail Page (PDP) only
- **Position:** Below or next to the main product rating stars
- **Component:** Should be part of the existing ratings display system

### 2. Visual Design

Based on the reference image, the component should display:

```
5 ★ ████████████████████████ 6
4 ★ ░░░░░░░░░░░░░░░░░░░░░░░░ 0
3 ★ ░░░░░░░░░░░░░░░░░░░░░░░░ 0
2 ★ ░░░░░░░░░░░░░░░░░░░░░░░░ 0
1 ★ ░░░░░░░░░░░░░░░░░░░░░░░░ 0
```

#### Layout Structure

```
Row (5 stars):
  [Star Icon] [Rating Number] [█████████████████████░░░░░] [Count]
     |              |                    |                    |
  "5 ★"           "5"           Progress Bar (100%)         "6"
```

#### Visual Specifications

**Stars:**
- Display numbers 5 through 1 (descending order)
- Include gold star icon next to each number
- Use same star styling as existing rating stars

**Progress Bars:**
- Horizontal bars showing percentage of total ratings
- Filled portion: Blue (#0055A4 - French blue, same as existing stars)
- Unfilled portion: Light gray (#E0E0E0)
- Height: 16-20px
- Border radius: 4px
- Full width represents 100% of total ratings

**Counts:**
- Display actual count number at end of each row
- Align right
- Use regular font weight
- Color: #666666

### 3. Calculation Logic

For each star rating (1-5):

```javascript
const percentage = (distribution[star] / totalCount) * 100;
const barWidth = `${Math.round(percentage)}%`;
```

Example:
- Total ratings: 847
- 5-star ratings: 497
- Percentage: (497 / 847) × 100 = 58.7%
- Bar fills 59% of available width

### 4. Implementation Approach

#### Option A: Extend Existing Rating Component

Update `scripts/ratings.js` to include distribution:

```javascript
/**
 * Create rating distribution histogram
 * @param {object} distribution - Distribution object {1: count, 2: count, ...}
 * @param {number} totalCount - Total number of ratings
 * @returns {HTMLElement} Distribution element
 */
export function createRatingDistribution(distribution, totalCount) {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-rating__distribution';
  
  // Create rows for stars 5 down to 1
  for (let star = 5; star >= 1; star--) {
    const count = distribution[star] || 0;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
    
    const row = document.createElement('div');
    row.className = 'product-rating__distribution-row';
    
    // Star label
    const label = document.createElement('div');
    label.className = 'product-rating__distribution-label';
    label.innerHTML = `${star} <span class="product-rating__star product-rating__star--filled">★</span>`;
    
    // Progress bar
    const barContainer = document.createElement('div');
    barContainer.className = 'product-rating__distribution-bar-container';
    
    const bar = document.createElement('div');
    bar.className = 'product-rating__distribution-bar';
    bar.style.width = `${Math.round(percentage)}%`;
    bar.setAttribute('aria-label', `${count} ${star}-star ratings`);
    
    barContainer.appendChild(bar);
    
    // Count
    const countElement = document.createElement('div');
    countElement.className = 'product-rating__distribution-count';
    countElement.textContent = count;
    
    row.appendChild(label);
    row.appendChild(barContainer);
    row.appendChild(countElement);
    wrapper.appendChild(row);
  }
  
  return wrapper;
}
```

#### Option B: Separate Component

Create new file `scripts/ratings-distribution.js` with standalone component.

### 5. CSS Styling

Add to `styles/ratings.css`:

```css
/* Rating Distribution */
.product-rating__distribution {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
}

.product-rating__distribution-row {
  display: grid;
  grid-template-columns: 60px 1fr 60px;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.product-rating__distribution-row:last-child {
  margin-bottom: 0;
}

.product-rating__distribution-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
}

.product-rating__distribution-bar-container {
  height: 16px;
  background-color: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.product-rating__distribution-bar {
  height: 100%;
  background-color: #0055A4; /* French blue */
  transition: width 0.3s ease;
}

.product-rating__distribution-count {
  text-align: right;
  font-size: 14px;
  color: #666666;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .product-rating__distribution-row {
    grid-template-columns: 50px 1fr 50px;
    gap: 8px;
  }
  
  .product-rating__distribution-label {
    font-size: 12px;
  }
  
  .product-rating__distribution-bar-container {
    height: 14px;
  }
  
  .product-rating__distribution-count {
    font-size: 12px;
  }
}
```

### 6. Integration with Product Detail Page

Update `blocks/product-details/product-details.js`:

```javascript
// In the ratings event listener
events.on('pdp/data', async (productData) => {
  if (productData?.sku) {
    const ratingData = await fetchProductRating(productData.sku);
    if (ratingData) {
      // Existing: Add star rating
      const ratingElement = createRatingElement(
        ratingData.averageRating,
        ratingData.totalCount,
      );
      
      // NEW: Add distribution histogram
      if (ratingData.distribution) {
        const distributionElement = createRatingDistribution(
          ratingData.distribution,
          ratingData.totalCount
        );
        ratingElement.appendChild(distributionElement);
      }
      
      // Insert into page...
    }
  }
}, { eager: true });
```

### 7. Accessibility Requirements

- Each bar should have `aria-label` describing the rating count
- Distribution container should have `role="group"` and `aria-label="Rating distribution"`
- Screen readers should announce: "5 stars: 497 ratings, 4 stars: 234 ratings..." etc.

Example:

```javascript
wrapper.setAttribute('role', 'group');
wrapper.setAttribute('aria-label', 'Rating distribution');

bar.setAttribute('role', 'progressbar');
bar.setAttribute('aria-valuenow', percentage.toFixed(0));
bar.setAttribute('aria-valuemin', '0');
bar.setAttribute('aria-valuemax', '100');
bar.setAttribute('aria-label', `${count} ${star}-star ratings, ${percentage.toFixed(0)}% of total`);
```

### 8. Edge Cases

Handle these scenarios:

1. **No ratings** (`totalCount === 0`):
   - Show all bars at 0% with count "0"
   - Display message: "No ratings yet"

2. **Single rating category:**
   - One bar at 100%, others at 0%
   - Still display all 5 rows

3. **Very small percentages:**
   - Even if percentage < 1%, show minimum 2px bar width for visibility
   - Or use minimum 1% width

4. **Missing distribution data:**
   - Don't display histogram if API doesn't return distribution
   - Gracefully degrade to just showing average + count

### 9. Testing Checklist

- [ ] Distribution displays on PDP
- [ ] All 5 star levels shown (5 to 1)
- [ ] Bar widths correctly represent percentages
- [ ] Counts match API response
- [ ] Sum of distribution equals totalCount
- [ ] Styling matches reference image
- [ ] French blue color (#0055A4) used for filled bars
- [ ] Responsive on mobile devices
- [ ] Accessible to screen readers
- [ ] Works with cached rating data
- [ ] Handles edge cases (no ratings, single rating, etc.)

### 10. API Reference

See full API documentation: `RATINGS_API_CONTRACT.md`

**API Endpoint:**
```
GET https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings?sku={SKU}
```

**Response includes distribution:**
```json
{
  "distribution": {
    "1": 12,
    "2": 15,
    "3": 89,
    "4": 234,
    "5": 497
  }
}
```

## Implementation Steps

1. ✅ Update `scripts/ratings.js` to add `createRatingDistribution()` function
2. ✅ Add CSS styles to `styles/ratings.css`
3. ✅ Update `blocks/product-details/product-details.js` to integrate distribution
4. ✅ Test with real product data on PDP
5. ✅ Verify responsive design on mobile
6. ✅ Test accessibility with screen reader
7. ✅ Update tests if needed

## Questions?

- Refer to `RATINGS_API_CONTRACT.md` for complete API documentation
- Check `scripts/ratings.js` for existing rating utilities
- See reference image for visual design
- French blue color: #0055A4 (same as existing stars)

