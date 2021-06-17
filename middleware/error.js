const ErrorResponse = require('../utils/errorResponse');

module.exports = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  if (process.env.NODE_ENV === 'development') {
    console.log(err.stack.red);
  }

  if (err.name === 'CastError') {
    error = new ErrorResponse(error.message, 400);
  }

  if (err.name === 'ValidationError') {
    error = new ErrorResponse(error.message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server error' });
};
