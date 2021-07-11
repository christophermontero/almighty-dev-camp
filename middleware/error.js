const ErrorResponse = require('../utils/errorResponse')

module.exports = (err, req, res, next) => {
  let error = { ...err }

  error.message = err.message

  if (process.env.NODE_ENV === 'development') {
    console.log(err)
  }

  // Mongoose invalid Object Id
  if (err.name === 'CastError') {
    error = new ErrorResponse(error.message, 400)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((e) => e.message)
    error = new ErrorResponse(msg, 400)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = new ErrorResponse(error.message, 400)
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server error' })
}
