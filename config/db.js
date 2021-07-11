const mongoose = require('mongoose');

module.exports = async () => {
  const env = process.env.NODE_ENV.toUpperCase();

  const conn = await mongoose.connect(process.env[`MONGO_URI_${env}`], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });

  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `MongoDB connected: ${conn.connection.host}`.cyan.underline.bold,
    );
  }
};
