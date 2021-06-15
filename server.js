const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

// Routes
const bootcamps = require('./routes/bootcamps');

// load env vars
dotenv.config({ path: './config/config.env' });

const app = express();

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
