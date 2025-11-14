# Product Ratings Test Suite

Comprehensive test suite for the Product Ratings feature using Playwright.

## Overview

This test suite validates the product ratings feature across:
- **Ratings API** - Endpoint availability, response validation, CORS handling
- **Product Detail Page (PDP)** - Display, positioning, responsiveness
- **Product List Page (PLP)** - Display across multiple products
- **Product Recommendations** - Display in recommendations block
- **CSS Styling** - French blue color, responsive design
- **Performance** - Load times, caching

## Prerequisites

1. **Node.js** - Version 18 or higher
2. **npm** - Version 9 or higher
3. **Playwright** - Installed automatically via `npm install`

## Installation

Install dependencies (includes Playwright):

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install --with-deps
```

## Configuration

### Environment Variables

You can configure the test suite using environment variables:

- `TEST_BASE_URL` - Base URL for the storefront (default: `http://localhost:3000`)
- `RATINGS_API_URL` - Ratings API endpoint URL
- `TEST_PRODUCT_SKU` - Product SKU for testing (default: `MH01`)
- `TEST_PDP_PATH` - Product detail page path
- `TEST_PLP_PATH` - Product list page path

### Test Configuration File

Edit `tests/config.js` to customize test parameters:

```javascript
export const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  ratingsApiUrl: 'https://...',
  testProductSku: 'MH01',
  testPdpPath: '/products/chaz-kangeroo-hoodie/MH01',
  testPlpPath: '/products',
  frenchBlue: 'rgb(0, 85, 164)',
  // ...
};
```

## Running Tests

### All Tests

Run all tests across all browsers:

```bash
npm test
```

### Specific Test Suite

Run only the ratings tests:

```bash
npm run test:ratings
```

### Specific Browser

Run tests in a specific browser:

```bash
npm run test:chromium   # Chrome/Chromium
npm run test:firefox    # Firefox
npm run test:webkit     # Safari/WebKit
```

### Mobile Tests

Run tests on mobile viewports:

```bash
npm run test:mobile
```

### Interactive Mode

Run tests with UI (great for debugging):

```bash
npm run test:ui
```

### Headed Mode

Run tests with visible browser windows:

```bash
npm run test:headed
```

### Watch Mode

Run tests in watch mode (re-run on file changes):

```bash
npx playwright test --watch
```

## Test Reports

### View HTML Report

After running tests, view the HTML report:

```bash
npm run test:report
```

This opens an interactive report in your browser with:
- Test results and status
- Screenshots of failures
- Video recordings
- Trace viewer for debugging

### Report Location

Test reports are saved in:
- **HTML Report**: `test-results/html/`
- **JSON Report**: `test-results/results.json`

## Test Structure

### Test Files

- `tests/ratings.spec.js` - Main test file for product ratings

### Test Suites

1. **Product Ratings API**
   - Valid rating data response with distribution
   - Distribution data structure and sum validation
   - Error handling (missing SKU)
   - CORS preflight requests

2. **Product Detail Page Ratings**
   - Display validation
   - Desktop positioning (below quantity)
   - Mobile positioning (below quantity)
   - French blue color validation

3. **Product Detail Page Ratings Distribution**
   - Distribution histogram display
   - Correct row order (5 to 1 stars)
   - Progress bar structure and widths
   - Rating counts display
   - French blue color for bars
   - Accessibility attributes (ARIA)
   - Bordered container styling
   - Mobile responsiveness
   - Max-width constraints

4. **Product List Page Ratings**
   - Display across multiple products
   - Positioning after product name
   - Color validation

5. **Product Recommendations Ratings**
   - Display in recommendations block
   - Stars and count validation

6. **Ratings CSS Styling**
   - Class structure validation
   - Responsive font sizes

7. **Ratings Performance**
   - Non-blocking page render
   - Caching validation

## CI/CD Integration

### GitHub Actions

Add this workflow to `.github/workflows/test.yml`:

```yaml
name: Test Product Ratings

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run tests
        run: npm test
        env:
          RATINGS_API_URL: ${{ secrets.RATINGS_API_URL }}
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

### Pre-deployment Script

Add to your deployment script:

```bash
#!/bin/bash

echo "Running pre-deployment tests..."

# Run tests
npm test

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Tests failed! Deployment aborted."
  exit 1
fi

echo "✅ All tests passed! Proceeding with deployment..."

# Continue with deployment
# ...
```

## Debugging

### Debug a Specific Test

Run a single test with debugging:

```bash
npx playwright test tests/ratings.spec.js:42 --debug
```

(Replace `42` with the line number of the test)

### Inspect Element Selectors

Use Playwright Inspector:

```bash
npx playwright test --debug
```

Then use the picker to select elements and see their selectors.

### View Traces

If a test fails, view the trace:

```bash
npx playwright show-trace test-results/traces/trace.zip
```

### Screenshots and Videos

Failed tests automatically capture:
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`

## Common Issues

### Issue: Tests fail with "Target page is closed"

**Solution**: Increase timeout in `playwright.config.js`:

```javascript
use: {
  timeout: 30000, // 30 seconds
}
```

### Issue: Tests fail with "Cannot find element"

**Solution**: Check if the page is fully loaded:

```javascript
await page.waitForLoadState('networkidle');
await page.waitForSelector('.product-rating', { timeout: 10000 });
```

### Issue: Color assertion fails

**Solution**: Verify the color format (RGB vs hex):

```javascript
// Browsers return RGB format
expect(color).toBe('rgb(0, 85, 164)'); // #0055A4
```

### Issue: API tests fail with CORS error

**Solution**: Ensure the API has correct CORS headers:

```javascript
'Access-Control-Allow-Origin': '*'
```

## Maintenance

### Updating Test Data

When product SKUs or paths change:

1. Update `tests/config.js`
2. Run tests to verify:
   ```bash
   npm test
   ```

### Adding New Tests

1. Add test to `tests/ratings.spec.js`:
   ```javascript
   test('should do something', async ({ page }) => {
     // Test implementation
   });
   ```

2. Run the new test:
   ```bash
   npm test
   ```

### Updating Playwright

Keep Playwright up to date:

```bash
npm install @playwright/test@latest
npx playwright install
```

## Best Practices

1. **Use Page Object Model** for complex pages
2. **Add explicit waits** for dynamic content
3. **Use data-testid** attributes for stable selectors
4. **Keep tests independent** - no shared state
5. **Mock external APIs** when appropriate
6. **Test across browsers** to catch compatibility issues
7. **Use descriptive test names** for clarity
8. **Add comments** for complex assertions

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Product Ratings Implementation](../PRODUCT_RATINGS_IMPLEMENTATION.md)
- [Ratings API Contract](../RATINGS_API_CONTRACT.md)

## Support

For issues or questions:
1. Check the [Common Issues](#common-issues) section
2. Review Playwright documentation
3. Check test logs and reports
4. Contact the development team

## License

Apache License 2.0

