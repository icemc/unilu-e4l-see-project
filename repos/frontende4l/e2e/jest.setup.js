// Jest setup for E2E tests
const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:8080';

global.baseUrl = baseUrl;

// Increase default timeout for E2E tests
jest.setTimeout(30000);

console.log(`E2E tests will run against: ${baseUrl}`);
