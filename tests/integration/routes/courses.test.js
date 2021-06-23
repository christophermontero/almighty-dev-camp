require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const mongoose = require('mongoose');
const Course = require('../../../models/Course');
const Bootcamp = require('../../../models/Bootcamp');
let server;

describe('/api/v1/courses', () => {
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
    await Course.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all courses', async () => {
      await Bootcamp.collection.insertMany([
        {
          name: 'Bootcamp 1',
          description: 'Bootcamp description 1',
          website: 'https://bootcamp1.com',
          phone: '(111) 111-1111',
          email: 'boot1@email.com',
          address: 'Boot address 1',
          careers: ['Web Development']
        }
      ]);
      const { id } = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      await Course.collection.insertMany([
        {
          title: 'Course 1',
          description: 'Course description 1',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: id
        },
        {
          title: 'Course 2',
          description: 'Course description 2',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: id
        }
      ]);

      const res = await request(server).get('/api/v1/courses');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(
        res.body.data.some((course) => course.title === 'Course 1')
      ).toBeTruthy();
      expect(
        res.body.data.some((course) => course.title === 'Course 2')
      ).toBeTruthy();
    });
  });

  describe('GET /bootcamps/:bootcampId/courses', () => {
    it('should return 404 if bootcamp does not exists', async () => {
      const res = await request(server).get(
        `/api/v1/bootcamps/${mongoose.Types.ObjectId()}/courses`
      );

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid id is passed', async () => {
      const res = await request(server).get(`/api/v1/bootcamps/1/courses`);

      expect(res.status).toBe(400);
    });

    it('should return all courses by bootcamp', async () => {
      const bootcamp = new Bootcamp({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development']
      });
      await bootcamp.save();
      const bootcampId = bootcamp._id;

      await Course.collection.insertMany([
        {
          title: 'Course 1',
          description: 'Course description 1',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampId
        },
        {
          title: 'Course 2',
          description: 'Course description 2',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampId
        }
      ]);

      const res = await request(server).get(
        `/api/v1/bootcamps/${bootcampId}/courses`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(
        res.body.data.some((course) => course.title === 'Course 1')
      ).toBeTruthy();
      expect(
        res.body.data.some((course) => course.title === 'Course 2')
      ).toBeTruthy();
    });
  });
});
