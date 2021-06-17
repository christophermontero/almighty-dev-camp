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
          email: 'boot1@email.com',
          address: 'Boot address 1',
          careers: ['Web Development']
        },
        {
          name: 'Bootcamp 2',
          description: 'Bootcamp description 2',
          website: 'https://bootcamp2.com',
          phone: '(222) 222-2222',
          email: 'boot2@email.com',
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
        email: 'boot1@email.com',
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
      expect(res.body.data).toHaveProperty('address', 'Boot address 1');
      expect(res.body.data.careers).toEqual(
        expect.arrayContaining(['Web Development'])
      );
    });
  });

  describe('PUT /:id', () => {
    let bootcamp,
      id,
      newName,
      newDescription,
      newWebsite,
      newPhone,
      newEmail,
      newAddress,
      newCareers;

    const exec = () => {
      return request(server).put(`/api/v1/bootcamps/${id}`).send({
        name: newName,
        description: newDescription,
        website: newWebsite,
        phone: newPhone,
        email: newEmail,
        address: newAddress,
        careers: newCareers
      });
    };

    beforeEach(async () => {
      bootcamp = new Bootcamp({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development']
      });
      await bootcamp.save();

      id = bootcamp._id;
      newName = 'new Bootcamp';
      newDescription = 'new Bootcamp description';
      newWebsite = 'https://new-bootcamp.com';
      newPhone = '(000) 111-1111';
      newEmail = 'newboot@email.com';
      newAddress = 'new Boot address';
      newCareers = ['Web Development', 'UI/UX'];
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

    it('should return 400 if id is invalid', async () => {
      id = '1';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if bootcamp with the given id was not found', async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update name if input is valid', async () => {
      await exec();

      const updatedBootcamp = await Bootcamp.findById(id);

      expect(updatedBootcamp.name).toBe(newName);
    });

    it('should update description if input is valid', async () => {
      await exec();

      const updatedBootcamp = await Bootcamp.findById(id);

      expect(updatedBootcamp.description).toBe(newDescription);
    });

    it('should update website if input is valid', async () => {
      await exec();

      const updatedBootcamp = await Bootcamp.findById(id);

      expect(updatedBootcamp.website).toBe(newWebsite);
    });

    it('should update phone if input is valid', async () => {
      await exec();

      const updatedBootcamp = await Bootcamp.findById(id);

      expect(updatedBootcamp.phone).toBe(newPhone);
    });

    it('should update email if input is valid', async () => {
      await exec();

      const updatedBootcamp = await Bootcamp.findById(id);

      expect(updatedBootcamp.email).toBe(newEmail);
    });

    it('should update address if input is valid', async () => {
      await exec();

      const updatedBootcamp = await Bootcamp.findById(id);

      expect(updatedBootcamp.address).toBe(newAddress);
    });

    it('should update careers if input is valid', async () => {
      await exec();

      const updatedBootcamp = await Bootcamp.findById(id);

      expect(updatedBootcamp.careers).toEqual(
        expect.arrayContaining(newCareers)
      );
    });

    it('should return the updated bootcamp if it is valid', async () => {
      const res = await exec();

      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('name', newName);
      expect(res.body.data).toHaveProperty('description', newDescription);
      expect(res.body.data).toHaveProperty('website', newWebsite);
      expect(res.body.data).toHaveProperty('phone', newPhone);
      expect(res.body.data).toHaveProperty('email', newEmail);
      expect(res.body.data).toHaveProperty('address', newAddress);
      expect(res.body.data.careers).toEqual(expect.arrayContaining(newCareers));
    });
  });

  describe('DELETE /:id', () => {
    let bootcamp, id;

    const exec = () => {
      return request(server).delete(`/api/v1/bootcamps/${id}`);
    };

    beforeEach(async () => {
      bootcamp = new Bootcamp({
        name: 'Bootcamp 1',
        description: 'Bootcamp description 1',
        website: 'https://bootcamp1.com',
        phone: '(111) 111-1111',
        email: 'boot1@email.com',
        address: 'Boot address 1',
        careers: ['Web Development']
      });
      await bootcamp.save();

      id = bootcamp._id;
    });

    it('should return 400 if id is invalid', async () => {
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
      expect(res.body.data).toHaveProperty('name', bootcamp.name);
      expect(res.body.data).toHaveProperty('description', bootcamp.description);
      expect(res.body.data).toHaveProperty('website', bootcamp.website);
      expect(res.body.data).toHaveProperty('phone', bootcamp.phone);
      expect(res.body.data).toHaveProperty('email', bootcamp.email);
      expect(res.body.data).toHaveProperty('address', bootcamp.address);
      expect(res.body.data.careers).toEqual(
        expect.arrayContaining(bootcamp.careers)
      );
    });
  });
});
