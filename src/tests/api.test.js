// const request = require('supertest');
// const app = require('../index');

// describe('API Tests', () => {
//   let authToken;

//   // Test the health check endpoint
//   describe('Health Check', () => {
//     it('should return 200 status', async () => {
//       const response = await request(app).get('/health');
//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//     });
//   });

//   // Test authentication endpoints
//   describe('Authentication', () => {
//     // Test user registration
//     it('should register a new user', async () => {
//       const userData = {
//         name: 'Test User',
//         email: `test-${Date.now()}@example.com`,
//         password: 'test1234'
//       };

//       const response = await request(app)
//         .post('/api/v1/auth/register')
//         .send(userData);

//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('token');
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data.email).toBe(userData.email);
//     });

//     // Test user login
//     it('should login a user', async () => {
//       const loginData = {
//         email: 'admin@example.com',
//         password: 'admin123'
//       };

//       const response = await request(app)
//         .post('/api/v1/auth/login')
//         .send(loginData);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('token');
      
//       // Save token for other tests
//       authToken = response.body.data.token;
//     });

//     // Test getting current user
//     it('should get current user', async () => {
//       if (!authToken) {
//         throw new Error('Authentication token not available');
//       }

//       const response = await request(app)
//         .get('/api/v1/auth/me')
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveProperty('id');
//       expect(response.body.data).toHaveProperty('email');
//     });
//   });

//   // Test case endpoints
//   describe('Cases', () => {
//     it('should get all cases', async () => {
//       if (!authToken) {
//         throw new Error('Authentication token not available');
//       }

//       const response = await request(app)
//         .get('/api/v1/cases')
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body).toHaveProperty('data');
//       expect(response.body).toHaveProperty('pagination');
//       expect(Array.isArray(response.body.data)).toBe(true);
//     });
//   });

//   // Test event endpoints
//   describe('Events', () => {
//     it('should get all events', async () => {
//       if (!authToken) {
//         throw new Error('Authentication token not available');
//       }

//       const response = await request(app)
//         .get('/api/v1/events')
//         .set('Authorization', `Bearer ${authToken}`);

//       expect(response.statusCode).toBe(200);
//       expect(response.body.success).toBe(true);
//       expect(response.body).toHaveProperty('data');
//       expect(response.body).toHaveProperty('pagination');
//       expect(Array.isArray(response.body.data)).toBe(true);
//     });
//   });
// }); 