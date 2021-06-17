const request = require('supertest');
const mongoose = require('mongoose');
const Bootcamp = require('../../../models/Bootcamp');
let server;

describe('/api/v1/bootcamps', () => {
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
    await Bootcamp.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all bootcamps', async () => {
      await Bootcamp.collection.insertMany([
        {
          name: 'Bootcamp 1',
          description: 'Bootcamp description 1',
          website: 'https://bootcamp1.com',
          phone: '(111) 111-1111',
          email: 'boot1@test.com',
          address: 'Boot address 1',
          careers: ['Web Development']
        },
        {
          name: 'Bootcamp 2',
          description: 'Bootcamp description 2',
          website: 'https://bootcamp2.com',
          phone: '(222) 222-2222',
          email: 'boot2@test.com',
          address: 'Boot address 2',
          careers: ['Web Development']
        }
      ]);

      const res = await request(server).get('/api/v1/bootcamps');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(
        res.body.data.some((bootcamp) => bootcamp.name === 'Bootcamp 1')
      ).toBeTruthy();
      expect(
        res.body.data.some((bootcamp) => bootcamp.name === 'Bootcamp 2')
      ).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 if bootcamp does not exists', async () => {
      const res = await request(server).get(
        `/api/v1/bootcamps/${mongoose.Types.ObjectId()}`
      );

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid id is passed', async () => {
      const res = await request(server).get('/api/v1/bootcamps/1');

      expect(res.status).toBe(400);
    });

    it('should return a bootcamp if valid id is passed', async () => {
      const bootcamp = new Bootcamp({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@test.com',
        address: 'Boot address 1',
        careers: ['Web Development']
      });
      await bootcamp.save();

      const res = await request(server).get(
        `/api/v1/bootcamps/${bootcamp._id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', bootcamp.name);
    });
  });
});
