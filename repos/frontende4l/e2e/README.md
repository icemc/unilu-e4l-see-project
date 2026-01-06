# End-to-End (E2E) Tests

This directory contains E2E acceptance tests that validate the application running in a real environment.

## Overview

E2E tests use **Puppeteer** to automate browser interactions and verify that the application works correctly from a user's perspective.

## Test Structure

```
e2e/
├── jest.setup.js           # Jest configuration for E2E tests
├── puppeteer.config.js     # Puppeteer browser configuration
├── homepage.test.js        # Homepage functionality tests
├── navigation.test.js      # Navigation and footer tests
└── health.test.js          # Application health checks
```

## Running E2E Tests

### Locally

```bash
# Set the base URL (default: http://localhost:8080)
export E2E_BASE_URL=http://localhost:8080

# Run E2E tests
npm run test:e2e
```

### In CI/CD

E2E tests run automatically in the CI/CD pipeline after deploying to staging:

1. **Deploy to Staging** - Application is deployed to the staging environment
2. **Run E2E Tests** - Automated tests verify the deployment
3. **Deploy to Production** - If tests pass, deploy to production

```bash
# CI environment
E2E_BASE_URL=http://e4l-frontend-staging:80 npm run test:e2e:ci
```

## Test Categories

### Homepage Tests (homepage.test.js)
- ✅ Homepage loads successfully
- ✅ Page title is present
- ✅ No critical JavaScript errors
- ✅ Navigation bar exists

### Navigation Tests (navigation.test.js)
- ✅ Clickable links in navigation
- ✅ Navigation between pages works
- ✅ Footer section is present
- ✅ Footer displays current year

### Health Tests (health.test.js)
- ✅ Application responds to requests
- ✅ CSS resources load correctly
- ✅ JavaScript resources load correctly
- ✅ Interactive elements are present
- ✅ Main content container renders

## Configuration

### Environment Variables

- `E2E_BASE_URL` - Base URL of the application to test (required)

### Puppeteer Options

The tests run in headless mode with the following options:
- `--no-sandbox` - Required for Docker environments
- `--disable-setuid-sandbox` - Security option for containers
- `--disable-dev-shm-usage` - Prevents memory issues in containers
- `--disable-gpu` - Disables GPU for headless mode

## Writing New Tests

### Basic Test Structure

```javascript
describe('E2E: Feature Name', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
  });

  afterAll(async () => {
    await page.close();
  });

  test('should do something', async () => {
    const element = await page.$('.my-element');
    expect(element).not.toBeNull();
  });
});
```

### Best Practices

1. **Use proper wait conditions**: `waitUntil: 'networkidle0'` or `waitForSelector()`
2. **Handle timeouts**: Set appropriate timeouts for slow operations
3. **Clean up**: Always close pages in `afterAll` hooks
4. **Be specific**: Use specific selectors to avoid flaky tests
5. **Test user flows**: Focus on critical user journeys

## Troubleshooting

### Tests timing out
- Increase `testTimeout` in jest-puppeteer.config.js
- Check if the application is accessible at `E2E_BASE_URL`
- Verify network connectivity

### Browser crashes in Docker
- Ensure `--no-sandbox` flag is set
- Increase shared memory with `--disable-dev-shm-usage`
- Check available resources in container

### Elements not found
- Add explicit waits: `await page.waitForSelector('.element')`
- Check if element selectors match the actual HTML
- Verify the page has fully loaded before searching

## CI/CD Integration

E2E tests are part of the deployment pipeline:

```
Build → Test (Unit/Integration) → Deploy Staging → E2E Tests → Deploy Production
                                                        ↓
                                                   If tests fail, 
                                                   production deployment 
                                                   is blocked
```

This ensures that only verified, working code reaches production.
