/**
 * Test Configuration for Product Ratings
 * 
 * Adjust these values based on your environment and test data
 */

export const TEST_CONFIG = {
  // Base URL for the storefront
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  
  // Ratings API endpoint URL
  ratingsApiUrl: process.env.RATINGS_API_URL || 
    'https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings',
  
  // Test product SKU (adjust based on your test data)
  testProductSku: process.env.TEST_PRODUCT_SKU || 'adb295',
  
  // Test product detail page path
  testPdpPath: process.env.TEST_PDP_PATH || '/products/adobe-staff-event-tee/adb295',
  
  // Test product list page path
  testPlpPath: process.env.TEST_PLP_PATH || '/products',
  
  // French blue color (RGB format)
  frenchBlue: 'rgb(0, 85, 164)', // #0055A4
  
  // Timeouts
  timeouts: {
    default: 10000,
    network: 30000,
  },
};

