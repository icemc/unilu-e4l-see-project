const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';

describe('E2E Tests - Homepage', () => {
  test('should load homepage with 200 status', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.status).toBe(200);
  });

  test('should contain expected content', async () => {
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    
    // Check for common elements - case insensitive
    expect(response.data.toLowerCase()).toContain('e4l');
    expect($('body').length).toBe(1);
  });

  test('should have proper HTML structure', async () => {
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    
    expect($('html').length).toBeGreaterThan(0);
    expect($('head').length).toBeGreaterThan(0);
    expect($('body').length).toBeGreaterThan(0);
  });
});
