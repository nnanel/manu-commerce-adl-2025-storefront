# Product Ratings Testing Guide

This guide provides instructions for testing the Product Ratings feature before deployment.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install Playwright and all necessary dependencies.

### 2. Run Pre-Deployment Checks

```bash
npm run predeploy
```

This runs the complete pre-deployment test suite including:
- ✅ Linting (JavaScript and CSS)
- ✅ API health check
- ✅ Product Ratings test suite

### 3. Deploy (if all checks pass)

```bash
# Deploy your changes
npm run deploy  # or your deployment command
```

## Test Suite Overview

### What's Tested

The test suite validates:

1. **Ratings API**
   - ✅ Returns valid rating data
   - ✅ Handles missing SKU parameter
   - ✅ Supports CORS preflight requests
   - ✅ Response structure validation

2. **Product Detail Page (PDP)**
   - ✅ Ratings display correctly
   - ✅ Positioned to the right of quantity field (desktop)
   - ✅ Positioned below quantity field (mobile)
   - ✅ French blue color (#0055A4)
   - ✅ Responsive design

3. **Product List Page (PLP)**
   - ✅ Ratings display for each product
   - ✅ Positioned after product name
   - ✅ French blue color
   - ✅ Multiple products handled correctly

4. **Product Recommendations**
   - ✅ Ratings display in recommendations
   - ✅ Stars and review count visible

5. **CSS Styling**
   - ✅ Correct class structure
   - ✅ Responsive font sizes
   - ✅ Color consistency

6. **Performance**
   - ✅ Non-blocking page load
   - ✅ Rating caching

## Running Tests

### All Tests

Run the complete test suite:

```bash
npm test
```

### Ratings Tests Only

Run only the product ratings tests:

```bash
npm run test:ratings
```

### Specific Browser

```bash
npm run test:chromium   # Chrome
npm run test:firefox    # Firefox
npm run test:webkit     # Safari
```

### Mobile Tests

```bash
npm run test:mobile
```

### Interactive Mode (Debugging)

```bash
npm run test:ui
```

## Pre-Deployment Script

The pre-deployment script (`scripts/pre-deploy.sh`) performs these checks:

### 1. Linting

Validates JavaScript and CSS code quality:

```bash
npm run lint
```

If linting fails, fix issues with:

```bash
npm run lint:fix
```

### 2. API Health Check

Verifies the Ratings API is:
- ✅ Accessible
- ✅ Returning HTTP 200
- ✅ Response structure is valid

The script tests: `GET /api/v1/web/ratings-api/get-ratings?sku=MH01`

Expected response:
```json
{
  "sku": "MH01",
  "averageRating": 4.5,
  "totalCount": 123
}
```

### 3. Test Suite Execution

Runs all Playwright tests across:
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit
- ✅ Mobile Chrome
- ✅ Mobile Safari

## Configuration

### Test Configuration

Edit `tests/config.js`:

```javascript
export const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  ratingsApiUrl: 'https://your-api-url.com/api/v1/web/ratings-api/get-ratings',
  testProductSku: 'MH01',
  testPdpPath: '/products/your-product/MH01',
  testPlpPath: '/products',
  frenchBlue: 'rgb(0, 85, 164)',
};
```

### Environment Variables

Set environment variables for different environments:

```bash
# Local testing
export TEST_BASE_URL=http://localhost:3000

# Stage testing
export TEST_BASE_URL=https://stage--repo--owner.aem.page

# Production testing
export TEST_BASE_URL=https://main--repo--owner.aem.live

# API URL
export RATINGS_API_URL=https://your-runtime.adobeioruntime.net/api/v1/web/ratings-api/get-ratings
```

## CI/CD Integration

### GitHub Actions

The test suite is integrated with GitHub Actions via `.github/workflows/test-ratings.yml`.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**What it does:**
1. Runs linting
2. Checks API health
3. Runs tests across all browsers
4. Uploads test results and reports
5. Blocks deployment if tests fail

### Pull Request Checks

All PRs must pass:
- ✅ Linting
- ✅ API health check
- ✅ All browser tests

### Secrets Configuration

Add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add secret: `RATINGS_API_URL`
   - Value: Your Ratings API endpoint URL

## Test Reports

### View HTML Report

After running tests:

```bash
npm run test:report
```

This opens an interactive HTML report with:
- 📊 Test results by browser
- 📸 Screenshots of failures
- 🎥 Video recordings
- 🔍 Trace viewer for debugging

### Report Location

- **HTML Report**: `test-results/html/`
- **JSON Report**: `test-results/results.json`
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/`

## Debugging Failed Tests

### 1. Check Test Report

```bash
npm run test:report
```

Review:
- Test failure message
- Screenshot at failure point
- Video recording
- Stack trace

### 2. Run in Headed Mode

```bash
npm run test:headed
```

Watch the browser execute tests to see what's happening.

### 3. Use Interactive Mode

```bash
npm run test:ui
```

Step through tests one at a time, inspect elements, and debug.

### 4. View Traces

If a test fails, view its trace:

```bash
npx playwright show-trace test-results/traces/trace.zip
```

### 5. Check API

Test the API manually:

```bash
curl "https://your-api-url.com/api/v1/web/ratings-api/get-ratings?sku=MH01"
```

## Common Issues

### Issue: "Target page is closed"

**Cause**: Test timeout or page crash

**Solution**:
```javascript
// Increase timeout in playwright.config.js
use: {
  timeout: 30000,
}
```

### Issue: "Element not found"

**Cause**: Page not fully loaded or selector changed

**Solution**:
```javascript
await page.waitForLoadState('networkidle');
await page.waitForSelector('.product-rating', { timeout: 10000 });
```

### Issue: API tests fail

**Cause**: API not deployed or CORS issue

**Solution**:
1. Verify API is deployed:
   ```bash
   curl -I "https://your-api-url.com/api/v1/web/ratings-api/get-ratings?sku=MH01"
   ```
2. Check CORS headers are present
3. Verify API URL is correct

### Issue: Color assertion fails

**Cause**: Browser returns RGB instead of hex

**Solution**:
```javascript
// Use RGB format
expect(color).toBe('rgb(0, 85, 164)'); // Not #0055A4
```

### Issue: Tests pass locally but fail in CI

**Cause**: Different environment or timing issues

**Solution**:
1. Add more explicit waits
2. Check environment variables
3. Review CI logs for details

## Manual Testing Checklist

If automated tests are not available, use this checklist:

### Product Detail Page
- [ ] Ratings display on page load
- [ ] Ratings positioned to right of quantity (desktop)
- [ ] Ratings positioned below quantity (mobile)
- [ ] Stars are French blue (#0055A4)
- [ ] Review count displays correctly
- [ ] Responsive design works

### Product List Page
- [ ] Ratings display for each product
- [ ] Ratings positioned after product name
- [ ] Stars are French blue
- [ ] Review count displays correctly

### Product Recommendations
- [ ] Ratings display in recommendations
- [ ] Stars and count visible

### API Testing
- [ ] GET request with valid SKU returns 200
- [ ] Response has correct structure
- [ ] GET request without SKU returns 400
- [ ] CORS headers present

## Best Practices

1. **Run tests before every deployment**
   ```bash
   npm run predeploy
   ```

2. **Test across browsers**
   - Chrome/Chromium
   - Firefox
   - Safari/WebKit

3. **Test responsive design**
   - Desktop (1280x720)
   - Tablet (768x1024)
   - Mobile (375x667)

4. **Keep tests updated**
   - Update when features change
   - Add tests for new features

5. **Monitor API health**
   - Check API is accessible
   - Verify response structure
   - Test CORS headers

## Support

### Documentation
- [Test Suite README](tests/README.md)
- [Product Ratings Implementation](PRODUCT_RATINGS_IMPLEMENTATION.md)
- [Ratings API Contract](RATINGS_API_CONTRACT.md)

### Tools
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

### Getting Help
1. Check test reports for details
2. Review documentation
3. Check common issues section
4. Contact development team

## Summary

Before each deployment:

```bash
# 1. Run pre-deployment checks
npm run predeploy

# 2. If all checks pass, deploy
npm run deploy

# 3. If checks fail, debug and fix
npm run test:report  # View detailed report
```

This ensures the Product Ratings feature works correctly across all pages and browsers! 🎉

