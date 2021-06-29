require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../../models/User');
let server;

describe('/api/v1/auth', () => {
  // Start server
  beforeAll(() => {
    server = require('../../../server');
  });

  // Close server and disconnect DB
  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  // Remove all data
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /register', () => {
    let name, email, password;

    const exec = () => {
      return request(server).post('/api/v1/auth/register').send({
        name,
        email,
        password
      });
    };

    beforeEach(() => {
      name = 'name 1';
      email = 'test@email.com';
      password = '12345678';
    });

    it('should return 400 if name is no provided', async () => {
      name = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
});
