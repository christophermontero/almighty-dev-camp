require('dotenv').config({ path: './config/config.env' });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../../../models/User');

describe('getSignedJwtToken', () => {
  it('should return a valid JWT', () => {
    const payload = { _id: new mongoose.Types.ObjectId().toHexString() };

    const user = new User(payload);
    const token = user.getSignedJwtToken();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).toMatchObject(payload);
  });

  it('should match user entered password to hashed password', async () => {
    const password = '12345678';
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      password: passwordHashed,
    };

    const user = new User(payload);

    const isMatch = await user.matchPassword(password);

    expect(isMatch).toBeTruthy();
  });
});
