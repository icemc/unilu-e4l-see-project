const axios = require('axios');

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';

describe('E2E Tests - Health Check', () => {
  test('should respond to health checks', async () => {
    const response = await axios.get(BASE_URL, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status
    });
    
    // Just verify we get a response
    expect(response.status).toBeDefined();
    expect([200, 304]).toContain(response.status);
  });

  test('should serve static content', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.headers['content-type']).toMatch(/html|text/);
  });
});
