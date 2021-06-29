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
    let name, email, password, role;

    const exec = () => {
      return request(server).post('/api/v1/auth/register').send({
        name,
        email,
        password,
        role
      });
    };

    beforeEach(() => {
      name = 'name 1';
      email = 'test@email.com';
      password = '12345678';
      role = 'user';
    });

    it('should return 400 if name is not provided', async () => {
      name = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if email is not provided', async () => {
      email = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if role is not allowed', async () => {
      role = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if password is not provided', async () => {
      password = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if password is less than 8 characters', async () => {
      password = '1234567';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the user if it is valid', async () => {
      await exec();

      const userInDb = await User.findOne({ email: 'test@email.com' });

      expect(userInDb).not.toBeNull();
    });

    it('should return the token if it is valid', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /login', () => {
    let email, password;

    const exec = () => {
      return request(server).post('/api/v1/auth/login').send({
        email,
        password
      });
    };

    beforeEach(async () => {
      const user = new User({
        name: 'name 1',
        email: 'test@email.com',
        password: '12345678'
      });
      await user.save();

      email = 'test@email.com';
      password = '12345678';
    });

    it('should return 400 if email is not provided', async () => {
      email = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if password is not provided', async () => {
      password = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 401 if email is not valid', async () => {
      email = 'notvalid@email.com';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 401 if password is not valid', async () => {
      password = 'invalidpassword';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return the token if input is valid', async () => {
      const res = await exec();

      const user = await User.findOne({ email: 'test@email.com' }).select(
        '+password'
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
