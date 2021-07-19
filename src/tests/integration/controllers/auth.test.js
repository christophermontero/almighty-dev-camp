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

  describe('GET /me', () => {
    it('should return 401 if jwt is not valid', async () => {
      const token = '';

      const res = await request(server)
        .get('/api/v1/auth/me')
        .set('authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
    });

    it('should return the user if it is valid', async () => {
      const user = new User({
        name: 'name 1',
        email: 'test@email.com',
        password: '12345678'
      });
      await user.save();
      const token = user.getSignedJwtToken();

      const res = await request(server)
        .get('/api/v1/auth/me')
        .set('authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('_id', user._id.toString());
      expect(res.body.data).toHaveProperty('name', user.name);
      expect(res.body.data).toHaveProperty('email', user.email);
    });
  });

  describe('POST /register', () => {
    let name;
    let email;
    let password;
    let role;

    const exec = () =>
      request(server).post('/api/v1/auth/register').send({
        name,
        email,
        password,
        role
      });

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
    let email;
    let password;

    const exec = () =>
      request(server).post('/api/v1/auth/login').send({
        email,
        password
      });

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

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
});
