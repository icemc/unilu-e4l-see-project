module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e'],
  testMatch: ['**/e2e/lightweight-*.test.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  testTimeout: 10000,
};
