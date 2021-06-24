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

      const course = new Course({
        title: 'Course 1',
        description: 'Course description 1',
        weeks: 1,
        tuition: 1,
        minimumSkill: 'beginner',
        scholarhipsAvailable: true,
        bootcamp: bootcampId
      });
      await course.save();

      const res = await request(server).get(`/api/v1/courses/${course._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('title', course.title);
    });
  });

  describe('POST /bootcamps/:bootcampId/courses', () => {
    let title,
      description,
      weeks,
      tuition,
      minimumSkill,
      scholarhipsAvailable,
      bootcamp,
      bootcampId;

    const exec = () => {
      return request(server)
        .post(`/api/v1/bootcamps/${bootcampId}/courses`)
        .send({
          title,
          description,
          weeks,
          tuition,
          minimumSkill,
          scholarhipsAvailable,
          bootcamp
        });
    };

    beforeEach(async () => {
      const newBootcamp = new Bootcamp({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development']
      });
      await newBootcamp.save();

      title = 'Course 1';
      description = 'Course description 1';
      weeks = '1';
      tuition = 1;
      minimumSkill = 'beginner';
      scholarhipsAvailable = true;
      bootcamp = newBootcamp._id;
      bootcampId = newBootcamp._id;
    });

    it('should return 404 if no bootcamp with the given id exists', async () => {
      bootcampId = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid bootcamp id is passed', async () => {
      bootcampId = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is no provided', async () => {
      title = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if description is no provided', async () => {
      description = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if week is no provided', async () => {
      weeks = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if tuition is no provided', async () => {
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
        'Course description 1'
      );
      expect(res.body.data).toHaveProperty('weeks', '1');
      expect(res.body.data).toHaveProperty('tuition', 1);
      expect(res.body.data).toHaveProperty('minimumSkill', 'beginner');
      expect(res.body.data.scholarhipsAvailable).toBeTruthy();
      expect(res.body.data).toHaveProperty('bootcamp');
    });
  });

  describe('PUT /:id', () => {
    let course,
      id,
      newTitle,
      newDescription,
      newWeeks,
      newTuition,
      newMinimumSkill,
      newScholarhipsAvailable,
      newBootcamp;

    const exec = () => {
      return request(server).put(`/api/v1/courses/${id}`).send({
        title: newTitle,
        description: newDescription,
        weeks: newWeeks,
        tuition: newTuition,
        minimumSkill: newMinimumSkill,
        scholarhipsAvailable: newScholarhipsAvailable,
        bootcamp: newBootcamp
      });
    };

    beforeEach(async () => {
      const bootcmp = new Bootcamp({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development']
      });
      await bootcmp.save();

      const newBootcmp = new Bootcamp({
        name: 'New bootcamp',
        description: 'New bootcamp description',
        website: 'https://newbootcamp.com',
        phone: '(222) 222-2222',
        email: 'newboot@email.com',
        address: 'New boot address',
        careers: ['Web Development']
      });
      await newBootcmp.save();

      course = new Course({
        title: 'Course 1',
        description: 'Course description 1',
        weeks: '1',
        tuition: 1,
        minimumSkill: 'beginner',
        scholarhipsAvailable: true,
        bootcamp: bootcmp._id
      });
      await course.save();

      id = course._id;
      newTitle = 'new Course';
      newDescription = 'new course description';
      newWeeks = '2';
      newTuition = 2;
      newMinimumSkill = 'advanced';
      newScholarhipsAvailable = false;
      newBootcamp = newBootcmp._id;
    });

    it('should return 404 if no course with the given id exists', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no bootcamp with the given id exists', async () => {
      newBootcamp = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if title is no provided', async () => {
      newTitle = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if description is no provided', async () => {
      newDescription = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if week is no provided', async () => {
      newWeeks = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if tuition is no provided', async () => {
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
});
