const express = require('express');
const path = require('path');
require('dotenv').config({ path: './src/config/config.env' });
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./src/middleware/error');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');

require('colors');

// Routes
const bootcamps = require('./src/routes/bootcamps');
const courses = require('./src/routes/courses');
const auth = require('./src/routes/auth');
const users = require('./src/routes/users');
const reviews = require('./src/routes/reviews');

// Connect to DB
require('./src/config/db')();

const app = express();

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
        .bold
    );
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
