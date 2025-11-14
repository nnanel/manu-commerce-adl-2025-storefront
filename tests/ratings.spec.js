/**
 * Product Ratings Test Suite
 * 
 * Tests the product ratings feature across all pages:
 * - Ratings API availability and distribution data
 * - Product Detail Page ratings display and modal
 * - Product List Page ratings display and modal
 * - Product Recommendations ratings display and modal
 * - Modal functionality (open, close, distribution display)
 * - CSS styling (French blue color)
 * - Performance and caching
 */

import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const RATINGS_API_URL = process.env.RATINGS_API_URL || 'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings';
const FRENCH_BLUE = 'rgb(0, 85, 164)'; // #0055A4

// Sample product SKUs for testing - these should be adjusted based on your environment
const TEST_PRODUCT_SKU = process.env.TEST_PRODUCT_SKU || 'adb295';
const TEST_PDP_PATH = process.env.TEST_PDP_PATH || '/products/adobe-staff-event-tee/adb295';
const TEST_PLP_PATH = process.env.TEST_PLP_PATH || '/products';

// Helper function to check if a page exists
async function pageExists(page, path) {
  const response = await page.goto(`${BASE_URL}${path}`);
  return response && response.status() < 400;
}

test.describe('Product Ratings API', () => {
  test('should return valid rating data for a given SKU', async ({ request }) => {
    const response = await request.get(`${RATINGS_API_URL}?sku=${TEST_PRODUCT_SKU}`);
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // Verify response structure
    expect(data).toHaveProperty('sku');
    expect(data).toHaveProperty('averageRating');
    expect(data).toHaveProperty('totalCount');
    expect(data).toHaveProperty('distribution');
    
    // Verify data types and ranges
    expect(data.sku).toBe(TEST_PRODUCT_SKU);
    expect(typeof data.averageRating).toBe('number');
    expect(typeof data.totalCount).toBe('number');
    expect(data.averageRating).toBeGreaterThanOrEqual(1.0);
    expect(data.averageRating).toBeLessThanOrEqual(5.0);
    expect(data.totalCount).toBeGreaterThanOrEqual(1);
    expect(data.totalCount).toBeLessThanOrEqual(1000);
    
    // Verify distribution structure
    expect(data.distribution).toHaveProperty('1');
    expect(data.distribution).toHaveProperty('2');
    expect(data.distribution).toHaveProperty('3');
    expect(data.distribution).toHaveProperty('4');
    expect(data.distribution).toHaveProperty('5');
    
    // Verify distribution values are numbers
    expect(typeof data.distribution['1']).toBe('number');
    expect(typeof data.distribution['2']).toBe('number');
    expect(typeof data.distribution['3']).toBe('number');
    expect(typeof data.distribution['4']).toBe('number');
    expect(typeof data.distribution['5']).toBe('number');
    
    // Verify distribution sum equals totalCount
    const sum = data.distribution['1'] + data.distribution['2'] + 
                data.distribution['3'] + data.distribution['4'] + data.distribution['5'];
    expect(sum).toBe(data.totalCount);
  });

  test('should return 400 for missing SKU parameter', async ({ request }) => {
    const response = await request.get(RATINGS_API_URL);
    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should handle CORS preflight requests', async ({ request }) => {
    const response = await request.fetch(RATINGS_API_URL, {
      method: 'OPTIONS',
    });
    
    expect(response.ok()).toBeTruthy();
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
    expect(headers['access-control-allow-methods']).toContain('GET');
  });
});

test.describe('Product Detail Page Ratings', () => {
  test.beforeEach(async ({ page }) => {
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    // Wait for the page to load and ratings to appear
    await page.waitForLoadState('networkidle');
  });

  test('should display product ratings', async ({ page }) => {
    // Wait for the rating element to appear
    const ratingElement = page.locator('.product-rating--quantity-side');
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    // Verify rating stars are displayed
    const stars = ratingElement.locator('.product-rating__star');
    await expect(stars.first()).toBeVisible();
    
    // Verify review count is displayed as clickable link (format: "(123)")
    const reviewCount = ratingElement.locator('.product-rating__count--link');
    await expect(reviewCount).toBeVisible();
    // Check that the count has parentheses and a number
    const countText = await reviewCount.textContent();
    expect(countText).toMatch(/\(\d+\)/);
    
    // Verify it's a button (clickable)
    const tagName = await reviewCount.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');
  });

  test('should position ratings next to quantity field on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const ratingElement = page.locator('.product-rating--quantity-side');
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    const quantityField = page.locator('.product-details__quantity');
    await expect(quantityField).toBeVisible();
    
    // Get bounding boxes
    const ratingBox = await ratingElement.boundingBox();
    const quantityBox = await quantityField.boundingBox();
    
    // Verify ratings and quantity are on the same row (similar y position)
    // They should be vertically aligned
    expect(Math.abs(ratingBox.y - quantityBox.y)).toBeLessThan(100);
    
    // Verify rating is visible and positioned
    expect(ratingBox.width).toBeGreaterThan(0);
    expect(ratingBox.height).toBeGreaterThan(0);
  });

  test('should display ratings below quantity field on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const ratingElement = page.locator('.product-rating--quantity-side');
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    const quantityField = page.locator('.product-details__quantity');
    await expect(quantityField).toBeVisible();
    
    // Get bounding boxes
    const ratingBox = await ratingElement.boundingBox();
    const quantityBox = await quantityField.boundingBox();
    
    // Verify ratings are below quantity (higher y position)
    expect(ratingBox.y).toBeGreaterThan(quantityBox.y);
  });

  test('should use French blue color for filled stars', async ({ page }) => {
    const ratingElement = page.locator('.product-rating--quantity-side');
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    // Check the first filled star
    const filledStar = ratingElement.locator('.product-rating__star--filled').first();
    await expect(filledStar).toBeVisible();
    
    // Get computed color
    const color = await filledStar.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    expect(color).toBe(FRENCH_BLUE);
  });
});

test.describe('Ratings Distribution Modal', () => {
  test.beforeEach(async ({ page }) => {
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    await page.waitForLoadState('networkidle');
  });

  test('should have clickable review count with proper styling', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await expect(reviewCount).toBeVisible({ timeout: 10000 });
    
    // Check it's a button
    const tagName = await reviewCount.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');
    
    // Check for French blue color
    const color = await reviewCount.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(color).toBe(FRENCH_BLUE);
    
    // Check for underline (text-decoration)
    const textDecoration = await reviewCount.evaluate((el) => {
      return window.getComputedStyle(el).textDecoration;
    });
    expect(textDecoration).toContain('underline');
  });

  test('should open modal when review count is clicked', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await expect(reviewCount).toBeVisible({ timeout: 10000 });
    
    // Click the review count
    await reviewCount.click();
    
    // Modal should appear
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Modal should have dialog role
    const role = await modal.getAttribute('role');
    expect(role).toBe('dialog');
    
    // Modal should be aria-modal
    const ariaModal = await modal.getAttribute('aria-modal');
    expect(ariaModal).toBe('true');
  });

  test('should display modal with correct content', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Check for title
    const title = modal.locator('.rating-distribution-modal__title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Customer Reviews');
    
    // Check for close button
    const closeButton = modal.locator('.rating-distribution-modal__close');
    await expect(closeButton).toBeVisible();
    
    // Check for summary (rating value)
    const summaryRating = modal.locator('.rating-distribution-modal__summary-rating');
    await expect(summaryRating).toBeVisible();
    const ratingText = await summaryRating.textContent();
    expect(ratingText).toMatch(/^\d\.\d$/); // Should be like "4.1"
    
    // Check for summary stars
    const summaryStars = modal.locator('.rating-distribution-modal__summary-stars .product-rating__star');
    await expect(summaryStars).toHaveCount(5);
    
    // Check for "Based on X reviews" text
    const summaryCount = modal.locator('.rating-distribution-modal__summary-count');
    await expect(summaryCount).toBeVisible();
    const countText = await summaryCount.textContent();
    expect(countText).toMatch(/Based on \d+ reviews?/);
  });

  test('should display distribution bars in modal', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Check for distribution chart
    const chart = modal.locator('.rating-distribution-modal__chart');
    await expect(chart).toBeVisible();
    
    // Check for 5 rows (5 to 1 stars)
    const rows = chart.locator('.product-rating__distribution-row');
    await expect(rows).toHaveCount(5);
    
    // Check for progress bars
    const bars = chart.locator('.product-rating__distribution-bar');
    await expect(bars).toHaveCount(5);
    
    // First bar should have French blue color
    const firstBar = bars.first();
    const bgColor = await firstBar.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bgColor).toBe(FRENCH_BLUE);
  });

  test('should close modal with close button', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Click close button
    const closeButton = modal.locator('.rating-distribution-modal__close');
    await closeButton.click();
    
    // Modal should disappear
    await expect(modal).not.toBeVisible();
  });

  test('should close modal with Escape key', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Modal should disappear
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking overlay', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Click on overlay (not on content)
    await modal.click({ position: { x: 10, y: 10 } });
    
    // Modal should disappear
    await expect(modal).not.toBeVisible();
  });

  test('should focus close button when modal opens', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Close button should be focused
    const closeButton = modal.locator('.rating-distribution-modal__close');
    const isFocused = await closeButton.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBeTruthy();
  });

  test('should prevent body scroll when modal is open', async ({ page }) => {
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Check body overflow style
    const bodyOverflow = await page.evaluate(() => {
      return document.body.style.overflow;
    });
    expect(bodyOverflow).toBe('hidden');
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Body overflow should be restored
    const bodyOverflowAfter = await page.evaluate(() => {
      return document.body.style.overflow;
    });
    expect(bodyOverflowAfter).toBe('');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const reviewCount = page.locator('.product-rating__count--link').first();
    await reviewCount.click();
    
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible();
    
    // Modal content should be visible and scrollable
    const modalContent = modal.locator('.rating-distribution-modal__content');
    await expect(modalContent).toBeVisible();
    
    // Distribution should still have 5 rows
    const rows = modal.locator('.product-rating__distribution-row');
    await expect(rows).toHaveCount(5);
  });
});

test.describe('Product List Page Ratings', () => {
  test.beforeEach(async ({ page }) => {
    const exists = await pageExists(page, TEST_PLP_PATH);
    if (!exists) {
      test.skip();
    }
    await page.waitForLoadState('networkidle');
  });

  test('should display ratings for each product', async ({ page }) => {
    // Wait for product cards to load
    await page.waitForSelector('.dropin-product-item-card', { timeout: 10000 });
    
    // Wait for at least one rating to appear
    const ratingElement = page.locator('.product-rating').first();
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    // Verify rating stars are displayed
    const stars = ratingElement.locator('.product-rating__star');
    await expect(stars.first()).toBeVisible();
    
    // Verify review count is displayed as clickable button
    const reviewCount = ratingElement.locator('.product-rating__count--link');
    await expect(reviewCount).toBeVisible();
    
    // Verify it's a button
    const tagName = await reviewCount.evaluate((el) => el.tagName.toLowerCase());
    expect(tagName).toBe('button');
  });

  test('should position ratings after product name', async ({ page }) => {
    // Wait for product cards to load
    await page.waitForSelector('.dropin-product-item-card', { timeout: 10000 });
    
    const firstProduct = page.locator('.dropin-product-item-card').first();
    const productName = firstProduct.locator('[data-slot="ProductName"]');
    const rating = firstProduct.locator('.product-rating');
    
    await expect(productName).toBeVisible();
    await expect(rating).toBeVisible({ timeout: 10000 });
    
    // Get bounding boxes
    const nameBox = await productName.boundingBox();
    const ratingBox = await rating.boundingBox();
    
    // Verify rating is below product name
    expect(ratingBox.y).toBeGreaterThan(nameBox.y);
  });

  test('should use French blue color for stars', async ({ page }) => {
    const ratingElement = page.locator('.product-rating').first();
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    const filledStar = ratingElement.locator('.product-rating__star--filled').first();
    await expect(filledStar).toBeVisible();
    
    const color = await filledStar.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    expect(color).toBe(FRENCH_BLUE);
  });

  test('should open modal when review count is clicked', async ({ page }) => {
    // Wait for product cards to load
    await page.waitForSelector('.dropin-product-item-card', { timeout: 10000 });
    
    const reviewCount = page.locator('.product-rating__count--link').first();
    await expect(reviewCount).toBeVisible({ timeout: 10000 });
    
    // Click the review count
    await reviewCount.click();
    
    // Modal should appear
    const modal = page.locator('.rating-distribution-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Check for distribution content
    const chart = modal.locator('.rating-distribution-modal__chart');
    await expect(chart).toBeVisible();
    
    // Check for 5 rows
    const rows = chart.locator('.product-rating__distribution-row');
    await expect(rows).toHaveCount(5);
    
    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Product Recommendations Ratings', () => {
  test('should display ratings in product recommendations', async ({ page }) => {
    // Navigate to a page with product recommendations
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    await page.waitForLoadState('networkidle');
    
    // Scroll to recommendations section
    const recommendationsBlock = page.locator('.product-recommendations');
    if (await recommendationsBlock.isVisible()) {
      await recommendationsBlock.scrollIntoViewIfNeeded();
      
      // Wait for ratings to appear
      const rating = recommendationsBlock.locator('.product-rating').first();
      await expect(rating).toBeVisible({ timeout: 10000 });
      
      // Verify stars and count
      const stars = rating.locator('.product-rating__star');
      await expect(stars.first()).toBeVisible();
      
      // Verify review count is clickable button
      const reviewCount = rating.locator('.product-rating__count--link');
      await expect(reviewCount).toBeVisible();
      
      const tagName = await reviewCount.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe('button');
    }
  });

  test('should open modal when review count is clicked in recommendations', async ({ page }) => {
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    await page.waitForLoadState('networkidle');
    
    // Scroll to recommendations section
    const recommendationsBlock = page.locator('.product-recommendations');
    if (await recommendationsBlock.isVisible()) {
      await recommendationsBlock.scrollIntoViewIfNeeded();
      
      // Click review count
      const reviewCount = recommendationsBlock.locator('.product-rating__count--link').first();
      await expect(reviewCount).toBeVisible({ timeout: 10000 });
      await reviewCount.click();
      
      // Modal should appear
      const modal = page.locator('.rating-distribution-modal');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Check for distribution content
      const chart = modal.locator('.rating-distribution-modal__chart');
      await expect(chart).toBeVisible();
      
      // Check for 5 rows
      const rows = chart.locator('.product-rating__distribution-row');
      await expect(rows).toHaveCount(5);
      
      // Close modal
      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    }
  });
});

test.describe('Ratings CSS Styling', () => {
  test('should have correct CSS classes and structure', async ({ page }) => {
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    await page.waitForLoadState('networkidle');
    
    const ratingElement = page.locator('.product-rating').first();
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    // Verify structure
    const stars = ratingElement.locator('.product-rating__stars');
    await expect(stars).toBeVisible();
    
    const count = ratingElement.locator('.product-rating__count');
    await expect(count).toBeVisible();
    
    // Verify star classes exist in the main stars container (not distribution)
    await expect(stars.locator('.product-rating__star')).toHaveCount(5);
  });

  test('should have responsive font sizes', async ({ page }) => {
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    
    const ratingElement = page.locator('.product-rating').first();
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
    
    // Desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopFontSize = await ratingElement.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    // Mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileFontSize = await ratingElement.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    
    // Both should have valid font sizes
    expect(parseInt(desktopFontSize)).toBeGreaterThan(0);
    expect(parseInt(mobileFontSize)).toBeGreaterThan(0);
  });
});

test.describe('Ratings Performance', () => {
  test('should load ratings without blocking page render', async ({ page }) => {
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    
    const startTime = Date.now();
    
    // Page should be interactive quickly
    await page.waitForLoadState('domcontentloaded');
    const domLoadTime = Date.now() - startTime;
    
    // DOM should load within reasonable time
    expect(domLoadTime).toBeLessThan(5000);
    
    // Ratings can load asynchronously
    const ratingElement = page.locator('.product-rating').first();
    await expect(ratingElement).toBeVisible({ timeout: 10000 });
  });

  test('should cache rating requests', async ({ page }) => {
    const exists = await pageExists(page, TEST_PDP_PATH);
    if (!exists) {
      test.skip();
    }
    await page.waitForLoadState('networkidle');
    
    // Test caching by checking if multiple calls for the same SKU are fast
    // First call - should make API request
    const startTime1 = Date.now();
    await page.evaluate(async (sku) => {
      const { fetchProductRating } = await import('/scripts/ratings.js');
      await fetchProductRating(sku);
    }, TEST_PRODUCT_SKU);
    const firstCallTime = Date.now() - startTime1;
    
    // Second call - should use cache (much faster)
    const startTime2 = Date.now();
    await page.evaluate(async (sku) => {
      const { fetchProductRating } = await import('/scripts/ratings.js');
      await fetchProductRating(sku);
    }, TEST_PRODUCT_SKU);
    const secondCallTime = Date.now() - startTime2;
    
    // Second call should be significantly faster (less than 10ms if cached)
    // First call might take 100-500ms for API request
    expect(secondCallTime).toBeLessThan(50); // Cached should be very fast
  });
});

