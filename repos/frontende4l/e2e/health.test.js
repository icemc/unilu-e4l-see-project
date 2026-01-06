describe('E2E: Application Health', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
  });

  afterAll(async () => {
    await page.close();
  });

  test('should respond to health check requests', async () => {
    const response = await page.goto(global.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    expect(response).not.toBeNull();
    expect(response.status()).toBeLessThan(400);
  });

  test('should load CSS resources', async () => {
    const cssRequests = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.css') || response.headers()['content-type']?.includes('text/css')) {
        cssRequests.push({
          url,
          status: response.status(),
        });
      }
    });

    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    // Check that CSS files loaded successfully (if any)
    cssRequests.forEach(request => {
      expect(request.status).toBeLessThan(400);
    });
  });

  test('should load JavaScript resources', async () => {
    const jsRequests = [];
    
    page.on('response', (response) => {
      const url = response.url();
      if (url.endsWith('.js') || response.headers()['content-type']?.includes('javascript')) {
        jsRequests.push({
          url,
          status: response.status(),
        });
      }
    });

    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    // At least one JS file should have loaded
    expect(jsRequests.length).toBeGreaterThan(0);
    
    // All JS files should load successfully
    jsRequests.forEach(request => {
      expect(request.status).toBeLessThan(400);
    });
  });

  test('should have interactive elements', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const buttons = await page.$$('button, [role="button"], input[type="button"], input[type="submit"]');
    const links = await page.$$('a[href]');
    
    const totalInteractive = buttons.length + links.length;
    expect(totalInteractive).toBeGreaterThan(0);
  });

  test('should render main content container', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const mainContent = await page.$('main, #root, #app, .container, [class*="container"]');
    expect(mainContent).not.toBeNull();
  });
});
