module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/e2e/**/*.test.js'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/e2e/jest.setup.js'],
};
