# Lightweight E2E Tests

## Overview
HTTP-based E2E tests using `axios` and `cheerio` - no browser automation needed!

## Benefits
- ⚡ **Fast**: ~100ms per test vs 2-5 seconds with Puppeteer
- 💾 **Lightweight**: ~2MB vs ~200MB with Puppeteer/Chromium
- 🎯 **Simple**: Pure HTTP requests, no browser complexity
- ✅ **CI-friendly**: Works anywhere, no special setup

## What We Test
1. **HTTP Health**: Verify endpoints respond with 200
2. **Content Verification**: Check HTML contains expected elements
3. **Structure**: Validate basic HTML structure (head, body, etc.)
4. **Static Assets**: Confirm JavaScript/CSS are served

## Running Tests

### Locally (with app running)
```bash
# Terminal 1: Start the app
npm start

# Terminal 2: Run E2E tests
npm run test:e2e
```

### Against staging/production
```bash
E2E_BASE_URL=http://192.168.56.11:8082 npm run test:e2e
```

## Comparison

### Old Approach (Puppeteer)
```
npm ci → ~2-3 minutes (downloads Chromium)
test:e2e → ~30-60 seconds (browser startup + navigation)
Size: ~200MB
```

### New Approach (axios + cheerio)
```
npm ci → ~30 seconds (no browser)
test:e2e → ~2-5 seconds (pure HTTP)
Size: ~2MB
```

## When to Use Each Approach

**Lightweight E2E (axios + cheerio)**: ✅ Recommended
- Verify pages load correctly
- Check HTML content and structure
- Test API endpoints
- Quick smoke tests in CI/CD

**Full Browser E2E (Puppeteer)**: Use locally when needed
- Complex user interactions (clicks, forms)
- JavaScript-heavy features
- Visual regression testing
- Screenshot comparisons

## CI/CD Integration
These lightweight tests can run in the `acceptance_tests` stage without requiring Docker or browser setup.
