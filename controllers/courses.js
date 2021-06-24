const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description'
    });
  }

  const courses = await query;

  if (courses.length === 0)
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.params.bootcampId} was not found`,
        404
      )
    );

  res.json({ success: true, count: courses.length, data: courses });
});

// @desc Get single course
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course)
    return next(
      new ErrorResponse(`Course with id ${req.params.id} was not found`, 404)
    );

  res.json({ success: true, data: course });
});
