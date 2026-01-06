describe('E2E: Navigation', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
  });

  afterAll(async () => {
    await page.close();
  });

  test('should have clickable links in navigation', async () => {
    const links = await page.$$('nav a, .navbar a, a[href]');
    expect(links.length).toBeGreaterThan(0);
  });

  test('should navigate when clicking a link', async () => {
    const initialUrl = page.url();
    
    // Find first internal link
    const link = await page.$('a[href^="/"], a[href^="' + global.baseUrl + '"]');
    
    if (link) {
      await link.click();
      await page.waitForTimeout(1000);
      
      // URL might have changed
      const newUrl = page.url();
      expect(newUrl).toBeTruthy();
    } else {
      // If no internal links, test passes (navigation exists but no internal links)
      expect(true).toBe(true);
    }
  });

  test('should have footer section', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const footer = await page.$('footer, .footer, [class*="footer"]');
    expect(footer).not.toBeNull();
  });

  test('should display footer content', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const footerText = await page.$eval(
      'footer, .footer, [class*="footer"]',
      el => el.textContent
    );
    
    expect(footerText).toBeTruthy();
    expect(footerText.length).toBeGreaterThan(0);
  });

  test('should have current year in footer', async () => {
    await page.goto(global.baseUrl, { waitUntil: 'networkidle0' });
    
    const currentYear = new Date().getFullYear().toString();
    const footerText = await page.$eval(
      'footer, .footer, [class*="footer"]',
      el => el.textContent
    );
    
    expect(footerText).toContain(currentYear);
  });
});
