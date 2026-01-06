describe('E2E: Homepage', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should load the homepage successfully', async () => {
    const response = await page.goto(global.baseUrl, {
      waitUntil: 'networkidle0',
      timeout: 10000,
    });

    // Accept 200 (OK) or 304 (Not Modified) as successful
    expect(response.status()).toBeLessThan(400);
  });

  test('should display the page title', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have a body element', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const bodyElement = await page.$('body');
    expect(bodyElement).not.toBeNull();
  });

  test('should load without JavaScript errors', async () => {
    const errors = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    // Allow some time for any async errors
    await page.waitForTimeout(2000);
    
    // Some errors might be acceptable, but critical errors should fail the test
    const criticalErrors = errors.filter(err => 
      err.includes('TypeError') || 
      err.includes('ReferenceError') ||
      err.includes('SyntaxError')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should have navigation bar', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const navbar = await page.$('nav.navbar, .navbar, [class*="nav"]');
    expect(navbar).not.toBeNull();
  });
});
