require('dotenv').config({ path: './config/config.env' });
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../../models/User');
const Course = require('../../../models/Course');
const Bootcamp = require('../../../models/Bootcamp');

let server;
let admin;
let defaultUser;

describe('/api/v1/courses', () => {
  // Start server and create users to testing authorization
  beforeAll(async () => {
    server = require('../../../server');

    admin = new User({
      name: 'admin',
      email: 'admin@email.com',
      password: '12345678',
      role: 'publisher',
    });
    await admin.save();

    defaultUser = new User({
      name: 'default user',
      email: 'defaultuser@email.com',
      password: '12345678',
      role: 'user',
    });
    await defaultUser.save();
  });

  // Close server and disconnect DB
  afterAll(async () => {
    await User.deleteMany({});
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
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        user: admin._id,
      });
      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      await Course.collection.insertMany([
        {
          title: 'Course 1',
          description: 'Course description 1',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: admin._id,
        },
        {
          title: 'Course 2',
          description: 'Course description 2',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: admin._id,
        },
      ]);

      const res = await request(server).get('/api/v1/courses');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(
        res.body.data.some((course) => course.title === 'Course 1'),
      ).toBeTruthy();
      expect(
        res.body.data.some((course) => course.title === 'Course 2'),
      ).toBeTruthy();
    });
  });

  describe('GET /bootcamps/:bootcampId/courses', () => {
    it('should return 404 if bootcamp does not exists', async () => {
      const res = await request(server).get(
        `/api/v1/bootcamps/${mongoose.Types.ObjectId()}/courses`,
      );

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid id is passed', async () => {
      const res = await request(server).get('/api/v1/bootcamps/1/courses');

      expect(res.status).toBe(400);
    });

    it('should return all courses by bootcamp', async () => {
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        user: admin._id,
      });
      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      await Course.collection.insertMany([
        {
          title: 'Course 1',
          description: 'Course description 1',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: admin._id,
        },
        {
          title: 'Course 2',
          description: 'Course description 2',
          weeks: 1,
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: admin._id,
        },
      ]);

      const res = await request(server).get(
        `/api/v1/bootcamps/${bootcampInDb._id}/courses`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(
        res.body.data.some((course) => course.title === 'Course 1'),
      ).toBeTruthy();
      expect(
        res.body.data.some((course) => course.title === 'Course 2'),
      ).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 400 if invalid id is passed', async () => {
      const res = await request(server).get('/api/v1/courses/1');

      expect(res.status).toBe(400);
    });

    it('should return 404 if no course with the given id exists', async () => {
      const id = mongoose.Types.ObjectId().toHexString();

      const res = await request(server).get(`/api/v1/courses/${id}`);

      expect(res.status).toBe(404);
    });

    it('should return a course if valid id is passed', async () => {
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        user: admin._id,
      });
      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      const course = new Course({
        title: 'Course 1',
        description: 'Course description 1',
        weeks: 1,
        tuition: 1,
        minimumSkill: 'beginner',
        scholarhipsAvailable: true,
        bootcamp: bootcampInDb._id,
        user: admin._id,
      });
      await course.save();

      const res = await request(server).get(`/api/v1/courses/${course._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('title', course.title);
    });
  });

  describe('POST /bootcamps/:bootcampId/courses', () => {
    let token;
    let title;
    let description;
    let weeks;
    let tuition;
    let minimumSkill;
    let scholarhipsAvailable;
    let bootcamp;
    let bootcampId;

    const exec = () => request(server)
      .post(`/api/v1/bootcamps/${bootcampId}/courses`)
      .set('authorization', `Bearer ${token}`)
      .send({
        title,
        description,
        weeks,
        tuition,
        minimumSkill,
        scholarhipsAvailable,
        bootcamp,
        user: admin._id,
      });

    beforeEach(async () => {
      await Bootcamp.collection.insertMany([
        {
          name: 'Bootcamp 1',
          description: 'Bootcamp description 1',
          website: 'https://bootcamp1.com',
          phone: '(111) 111-1111',
          email: 'boot1@email.com',
          address: 'Boot address 1',
          careers: ['Web Development'],
          user: admin._id,
        },
        {
          name: 'Bootcamp 2',
          description: 'Bootcamp description 2',
          website: 'https://bootcamp2.com',
          phone: '(111) 111-1111',
          email: 'boot2@email.com',
          address: 'Boot address 2',
          careers: ['Web Development'],
          averageCost: 10000,
          user: defaultUser._id,
        },
      ]);
      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      token = admin.getSignedJwtToken();
      title = 'Course 1';
      description = 'Course description 1';
      weeks = '1';
      tuition = 1;
      minimumSkill = 'beginner';
      scholarhipsAvailable = true;
      bootcamp = bootcampInDb._id;
      bootcampId = bootcampInDb._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 401 if user is not the bootcamp owner', async () => {
      bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 2' });
      bootcampId = bootcampInDb._id;

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      token = defaultUser.getSignedJwtToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if no bootcamp with the given id exists',
      async () => {
        bootcampId = mongoose.Types.ObjectId();

        const res = await exec();

        expect(res.status).toBe(404);
      });

    it('should return 400 if invalid bootcamp id is passed', async () => {
      bootcampId = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is not provided', async () => {
      title = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if description is not provided', async () => {
      description = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if week is not provided', async () => {
      weeks = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if tuition is not provided', async () => {
      tuition = null;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if minimum skill is not in enum', async () => {
      minimumSkill = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the course if it is valid', async () => {
      await exec();

      const course = await Course.find({ title: 'Course 1' });

      expect(course).not.toBeNull();
    });

    it('should return the course if it is valid', async () => {
      const res = await exec();

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('title', 'Course 1');
      expect(res.body.data).toHaveProperty(
        'description',
        'Course description 1',
      );
      expect(res.body.data).toHaveProperty('weeks', '1');
      expect(res.body.data).toHaveProperty('tuition', 1);
      expect(res.body.data).toHaveProperty('minimumSkill', 'beginner');
      expect(res.body.data.scholarhipsAvailable).toBeTruthy();
      expect(res.body.data).toHaveProperty('bootcamp');
    });
  });

  describe('PUT /:id', () => {
    let token;
    let course;
    let id;
    let newTitle;
    let newDescription;
    let newWeeks;
    let newTuition;
    let newMinimumSkill;
    let newScholarhipsAvailable;
    let newBootcamp;

    const exec = () => request(server)
      .put(`/api/v1/courses/${id}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        title: newTitle,
        description: newDescription,
        weeks: newWeeks,
        tuition: newTuition,
        minimumSkill: newMinimumSkill,
        scholarhipsAvailable: newScholarhipsAvailable,
        bootcamp: newBootcamp,
      });

    beforeEach(async () => {
      await Bootcamp.collection.insertMany([
        {
          name: 'Bootcamp 1',
          description: 'Bootcamp description 1',
          website: 'https://bootcamp1.com',
          phone: '(111) 111-1111',
          email: 'boot1@email.com',
          address: 'Boot address 1',
          careers: ['Web Development'],
          user: admin._id,
        },
        {
          name: 'New bootcamp',
          description: 'New bootcamp description',
          website: 'https://newbootcamp.com',
          phone: '(222) 222-2222',
          email: 'newboot@email.com',
          address: 'New boot address',
          careers: ['Web Development'],
          user: admin._id,
        },
      ]);
      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });
      const newBootcampInDb = await Bootcamp.findOne({ name: 'New bootcamp' });

      await Course.collection.insertMany([
        {
          title: 'Course 1',
          description: 'Course description 1',
          weeks: '1',
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: admin._id,
        },
        {
          title: 'Course 2',
          description: 'Course description 2',
          weeks: '1',
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: defaultUser._id,
        },
      ]);
      course = await Course.findOne({ title: 'Course 1' });

      token = admin.getSignedJwtToken();
      id = course._id;
      newTitle = 'new Course';
      newDescription = 'new course description';
      newWeeks = '2';
      newTuition = 2;
      newMinimumSkill = 'advanced';
      newScholarhipsAvailable = false;
      newBootcamp = newBootcampInDb._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 401 if user is not the bootcamp owner', async () => {
      course = await Course.findOne({ title: 'Course 2' });
      id = course._id;

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      token = defaultUser.getSignedJwtToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if no course with the given id exists', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no bootcamp with the given id exists',
      async () => {
        newBootcamp = mongoose.Types.ObjectId();

        const res = await exec();

        expect(res.status).toBe(404);
      });

    it('should return 400 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is not provided', async () => {
      newTitle = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if description is not provided', async () => {
      newDescription = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if week is not provided', async () => {
      newWeeks = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if tuition is not provided', async () => {
      newTuition = null;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if minimum skill is not in enum', async () => {
      newMinimumSkill = 'a';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should update course if it is valid', async () => {
      await exec();

      const courseInDb = await Course.findById(id);

      expect(courseInDb).toHaveProperty('_id');
      expect(courseInDb).toHaveProperty('title', newTitle);
      expect(courseInDb).toHaveProperty('description', newDescription);
      expect(courseInDb).toHaveProperty('weeks', newWeeks);
      expect(courseInDb).toHaveProperty('tuition', newTuition);
      expect(courseInDb).toHaveProperty('minimumSkill', newMinimumSkill);
      expect(courseInDb).toHaveProperty('bootcamp', newBootcamp);
    });

    it('should return the updated course if it is valid', async () => {
      const res = await exec();

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('title', newTitle);
      expect(res.body.data).toHaveProperty('description', newDescription);
      expect(res.body.data).toHaveProperty('weeks', newWeeks);
      expect(res.body.data).toHaveProperty('tuition', newTuition);
      expect(res.body.data).toHaveProperty('minimumSkill', newMinimumSkill);
      expect(res.body.data).toHaveProperty('bootcamp', newBootcamp.toString());
    });
  });

  describe('DELETE /:id', () => {
    let token; let course; let
      id;

    const exec = () => request(server)
      .delete(`/api/v1/courses/${id}`)
      .set('authorization', `Bearer ${token}`);

    beforeEach(async () => {
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        user: admin._id,
      });
      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      await Course.collection.insertMany([
        {
          title: 'Course 1',
          description: 'Course description 1',
          weeks: '1',
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: admin._id,
        },
        {
          title: 'Course 2',
          description: 'Course description 2',
          weeks: '1',
          tuition: 1,
          minimumSkill: 'beginner',
          scholarhipsAvailable: true,
          bootcamp: bootcampInDb._id,
          user: defaultUser._id,
        },
      ]);
      course = await Course.findOne({ title: 'Course 1' });

      token = admin.getSignedJwtToken();
      id = course._id;
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 401 if user is not the bootcamp owner', async () => {
      course = await Course.findOne({ title: 'Course 2' });
      id = course._id;

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      token = defaultUser.getSignedJwtToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if course with the given id was not found',
      async () => {
        id = mongoose.Types.ObjectId();

        const res = await exec();

        expect(res.status).toBe(404);
      });

    it('should delete the course if input is valid', async () => {
      await exec();

      const courseInDb = await Course.findById(id);

      expect(courseInDb).toBeNull();
    });

    it('should return the remove course', async () => {
      const res = await exec();

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('title', course.title);
      expect(res.body.data).toHaveProperty('description', course.description);
      expect(res.body.data).toHaveProperty('weeks', course.weeks);
      expect(res.body.data).toHaveProperty('tuition', course.tuition);
      expect(res.body.data).toHaveProperty('minimumSkill', course.minimumSkill);
      expect(res.body.data).toHaveProperty(
        'bootcamp',
        course.bootcamp.toString(),
      );
    });
  });
});
