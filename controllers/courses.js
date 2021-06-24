const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

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

// @desc Create new course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.params.bootcampId} was not found`,
        404
      )
    );

  const course = await Course.create(req.body);

  res.json({ success: true, data: course });
});

// @desc Update course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course)
    return next(
      new ErrorResponse(`Course with id ${req.params.id} was not found`, 404)
    );

  const bootcamp = await Bootcamp.findById(req.body.bootcamp);

  if (!bootcamp)
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.body.bootcamp} was not found`,
        404
      )
    );

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: course });
});
