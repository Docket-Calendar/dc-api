// Setup test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRATION = '1h';
process.env.API_PREFIX = '/api/v1';

// Suppress console output during tests
console.log = jest.fn();
console.info = jest.fn();
console.error = jest.fn();
console.warn = jest.fn(); 