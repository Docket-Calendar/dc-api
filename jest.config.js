module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/setup-tests.js'],
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000
}; 