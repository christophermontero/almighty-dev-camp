require('dotenv').config({ path: './config/config.env' });
const fs = require('fs');
const path = require('path');
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
          averageCost: 10000
        },
        {
          name: 'Bootcamp 2',
          description: 'Bootcamp description 2',
          website: 'https://bootcamp2.com',
          phone: '(222) 222-2222',
          email: 'boot2@email.com',
          address: 'Boot address 2',
          careers: ['Web Development'],
          averageCost: 5000
        }
      ]);
    });

    it('should return all bootcamps', async () => {
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

    it('should select just the name from all bootcamps', async () => {
      const res = await request(server).get('/api/v1/bootcamps?select=name');

      expect(res.status).toBe(200);
      expect(res.body.data.every((bootcamp) => bootcamp.name)).toBeTruthy();
      expect(
        res.body.data.every((bootcamp) => bootcamp.description)
      ).toBeFalsy();
    });

    it('should query the results using mongo operators', async () => {
      const res = await request(server).get(
        '/api/v1/bootcamps?averageCost[gte]=8000'
      );

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((bootcamp) => bootcamp.averageCost >= 8000)
      ).toBeTruthy();
    });

    it('should sort ascending the results by name', async () => {
      const res = await request(server).get('/api/v1/bootcamps?sort=name');

      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Bootcamp 1');
      expect(res.body.data[1].name).toBe('Bootcamp 2');
    });

    it('should add the previous page to pagination', async () => {
      const pagination = {
        prev: {
          page: 1,
          limit: 1
        }
      };

      const res = await request(server).get('/api/v1/bootcamps?page=2&limit=1');

      expect(res.status).toBe(200);
      expect(res.body.pagination).toMatchObject(pagination);
    });

    it('should add the next page to pagination', async () => {
      const pagination = {
        next: {
          page: 2,
          limit: 1
        }
      };

      const res = await request(server).get('/api/v1/bootcamps?page=1&limit=1');

      expect(res.status).toBe(200);
      expect(res.body.pagination).toMatchObject(pagination);
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
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        averageCost: 10000
      });
      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      const res = await request(server).get(
        `/api/v1/bootcamps/${bootcampInDb._id}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', bootcampInDb.name);
    });
  });

  describe('POST /', () => {
    let name, description, website, phone, email, address, careers;

    const exec = () => {
      return request(server).post('/api/v1/bootcamps').send({
        name,
        description,
        website,
        phone,
        email,
        address,
        careers
      });
    };

    beforeEach(() => {
      name = 'Bootcamp 1';
      description = 'Bootcamp description 1';
      website = 'https://bootcamp1.com';
      phone = '(111) 111-1111';
      email = 'boot1@email.com';
      address = 'Boot address 1';
      careers = ['Web Development'];
    });

    it('should return 400 if name is greater than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if description is greater than 500 characters', async () => {
      name = new Array(502).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if website is invalid', async () => {
      website = 'bootcamp1.com';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is less than 8 characters', async () => {
      phone = '1234567';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is greater than 15 characters', async () => {
      phone = '1234567891234567';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      email = 'email.com';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the bootcamp if it is invalid', async () => {
      await exec();

      const bootcamp = await Bootcamp.find({ name: 'Bootcamp 1' });

      expect(bootcamp).not.toBeNull();
    });

    it('should set the created date if input is valid', async () => {
      await exec();

      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      const diff = new Date() - bootcampInDb.createdAt;

      expect(bootcampInDb.createdAt).toBeDefined();
      expect(diff).toBeLessThan(15 * 1000);
    });

    it('should set the location if input is valid', async () => {
      await exec();

      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      expect(bootcampInDb.location).toHaveProperty('type', 'Point');
      expect(bootcampInDb.location).toHaveProperty('coordinates');
      expect(bootcampInDb.location).toHaveProperty('formattedAddress');
      expect(bootcampInDb.location).toHaveProperty('street');
      expect(bootcampInDb.location).toHaveProperty('city');
      expect(bootcampInDb.location).toHaveProperty('state');
      expect(bootcampInDb.location).toHaveProperty('zipcode');
      expect(bootcampInDb.location).toHaveProperty('country');
    });

    it('should slugify the name if input is valid', async () => {
      await exec();

      const bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      expect(bootcampInDb.slug).toBe('bootcamp-1');
    });

    it('should return the bootcamp if it is valid', async () => {
      const res = await exec();

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', 'Bootcamp 1');
      expect(res.body.data).toHaveProperty(
        'description',
        'Bootcamp description 1'
      );
      expect(res.body.data).toHaveProperty('website', 'https://bootcamp1.com');
      expect(res.body.data).toHaveProperty('phone', '(111) 111-1111');
      expect(res.body.data).toHaveProperty('email', 'boot1@email.com');
      expect(res.body.data.address).toBeUndefined();
      expect(res.body.data.careers).toEqual(
        expect.arrayContaining(['Web Development'])
      );
      expect(res.body.data).toHaveProperty('location');
      expect(res.body.data).toHaveProperty('photo', 'no-photo.jpg');
      expect(res.body.data).toHaveProperty('slug');
      expect(res.body.data.housing).toBeFalsy();
      expect(res.body.data.jobAssistance).toBeFalsy();
      expect(res.body.data.jobGuarantee).toBeFalsy();
      expect(res.body.data.acceptGi).toBeFalsy();
    });
  });

  describe('PUT /:id', () => {
    let bootcampInDb,
      id,
      newName,
      newDescription,
      newWebsite,
      newPhone,
      newEmail,
      newCareers,
      newHousing,
      newJobAssistance,
      newJobGuarantee,
      newAcceptGi;

    const exec = () => {
      return request(server).put(`/api/v1/bootcamps/${id}`).send({
        name: newName,
        description: newDescription,
        website: newWebsite,
        phone: newPhone,
        email: newEmail,
        careers: newCareers,
        housing: newHousing,
        jobAssistance: newJobAssistance,
        jobGuarantee: newJobGuarantee,
        acceptGi: newAcceptGi
      });
    };

    beforeEach(async () => {
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        averageCost: 10000
      });
      bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      id = bootcampInDb._id;
      newName = 'new Bootcamp';
      newDescription = 'new Bootcamp description';
      newWebsite = 'https://new-bootcamp.com';
      newPhone = '(000) 111-1111';
      newEmail = 'newboot@email.com';
      newCareers = ['Web Development', 'UI/UX'];
      newHousing = true;
      newJobAssistance = true;
      newJobGuarantee = true;
      newAcceptGi = true;
    });

    it('should return 400 if name is greater than 50 characters', async () => {
      newName = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if description is greater than 500 characters', async () => {
      newName = new Array(502).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if website is invalid', async () => {
      newWebsite = 'bootcamp1.com';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is less than 8 characters', async () => {
      newPhone = '1234567';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is greater than 15 characters', async () => {
      newPhone = '1234567891234567';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if email is invalid', async () => {
      newEmail = 'email.com';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if bootcamp with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update bootcamp if it is valid', async () => {
      await exec();

      const bootcampInDb = await Bootcamp.findById(id);

      expect(bootcampInDb).toHaveProperty('_id');
      expect(bootcampInDb).toHaveProperty('name', newName);
      expect(bootcampInDb).toHaveProperty('description', newDescription);
      expect(bootcampInDb).toHaveProperty('website', newWebsite);
      expect(bootcampInDb).toHaveProperty('phone', newPhone);
      expect(bootcampInDb).toHaveProperty('email', newEmail);
      expect(bootcampInDb.createdAt).toBeDefined();
      expect(bootcampInDb.careers).toEqual(expect.arrayContaining(newCareers));
      expect(bootcampInDb).toHaveProperty('location');
      expect(bootcampInDb).toHaveProperty('slug');
      expect(bootcampInDb).toHaveProperty('photo', 'no-photo.jpg');
      expect(bootcampInDb.housing).toBeTruthy();
      expect(bootcampInDb.jobAssistance).toBeTruthy();
      expect(bootcampInDb.jobGuarantee).toBeTruthy();
      expect(bootcampInDb.acceptGi).toBeTruthy();
    });

    it('should return the updated bootcamp if it is valid', async () => {
      const res = await exec();

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', newName);
      expect(res.body.data).toHaveProperty('description', newDescription);
      expect(res.body.data).toHaveProperty('website', newWebsite);
      expect(res.body.data).toHaveProperty('phone', newPhone);
      expect(res.body.data).toHaveProperty('email', newEmail);
      expect(res.body.data.createdAt).toBeDefined();
      expect(res.body.data.careers).toEqual(expect.arrayContaining(newCareers));
      expect(res.body.data).toHaveProperty('photo', 'no-photo.jpg');
      expect(res.body.data.housing).toBeTruthy();
      expect(res.body.data.jobAssistance).toBeTruthy();
      expect(res.body.data.jobGuarantee).toBeTruthy();
      expect(res.body.data.acceptGi).toBeTruthy();
    });
  });

  describe('PUT /:id/photo', () => {
    let bootcampInDb, id, filePath;

    beforeAll(() => {
      if (!fs.existsSync(__dirname + '/uploads')) {
        fs.mkdir(__dirname + '/uploads', { recursive: true }, (err) => {
          if (err) throw err;
        });
      }
    });

    beforeEach(async () => {
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        averageCost: 10000
      });
      bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      id = bootcampInDb._id;
      filePath = './images/photo.jpg';
    });

    afterAll(() => {
      fs.rmdir(__dirname + '/uploads', { recursive: true }, (err) => {
        if (err) throw err;
      });
    });

    const exec = () => {
      return request(server)
        .put(`/api/v1/bootcamps/${id}/photo`)
        .attach('file', path.resolve(__dirname, filePath));
    };

    it('should return 400 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if image file is not provided', async () => {
      const res = await request(server).put(`/api/v1/bootcamps/${id}/photo`);

      expect(res.status).toBe(400);
    });

    it('should return 400 if upload is not an image', async () => {
      filePath = './images/nonphoto.txt';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if bootcamp with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should upload the photo if it is valid', async () => {
      await exec();

      const bootcampInDb = await Bootcamp.findById(id);

      expect(bootcampInDb).toHaveProperty(
        'photo',
        `photo_${bootcampInDb._id}.jpg`
      );
    });

    it('should return the photo file name if it is valid', async () => {
      const res = await exec();

      expect(res.body.data).toBe(`photo_${id}.jpg`);
    });
  });

  describe('DELETE /:id', () => {
    let bootcampInDb, id;

    const exec = () => {
      return request(server).delete(`/api/v1/bootcamps/${id}`);
    };

    beforeEach(async () => {
      await Bootcamp.collection.insertOne({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development'],
        averageCost: 10000
      });
      bootcampInDb = await Bootcamp.findOne({ name: 'Bootcamp 1' });

      id = bootcampInDb._id;
    });

    it('should return 400 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if bootcamp with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the bootcamp if input is valid', async () => {
      await exec();

      const bootcampInDb = await Bootcamp.findById(id);

      expect(bootcampInDb).toBeNull();
    });

    it('should return the remove bootcamp', async () => {
      const res = await exec();

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', bootcampInDb.name);
      expect(res.body.data).toHaveProperty(
        'description',
        bootcampInDb.description
      );
      expect(res.body.data).toHaveProperty('website', bootcampInDb.website);
      expect(res.body.data).toHaveProperty('phone', bootcampInDb.phone);
      expect(res.body.data).toHaveProperty('email', bootcampInDb.email);
      expect(res.body.data).toHaveProperty('address', bootcampInDb.address);
      expect(res.body.data.careers).toEqual(
        expect.arrayContaining(bootcampInDb.careers)
      );
    });
  });
});
