const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @desc Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp with id ${req.params.bootcampId} was not found`,
          404
        )
      );
    }

    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.json({ success: true, count: courses.length, data: courses });
  }
  return res.json(res.advancedResults);
});

// @desc Get single course
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} was not found`, 404)
    );
  }

  res.json({ success: true, data: course });
});

// @desc Create new course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.params.bootcampId} was not found`,
        404
      )
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to create a course to ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.json({ success: true, data: course });
});

// @desc Update course
// @route PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} was not found`, 404)
    );
  }

  const bootcamp = await Bootcamp.findById(req.body.bootcamp);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.body.bootcamp} was not found`,
        404
      )
    );
  }

  // Make sure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update a course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: course });
});

// @desc Delete course
// @route DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `Bootcamp with id ${req.body.bootcamp} was not found`,
        404
      )
    );
  }

  // Make sure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete a course ${course._id}`,
        401
      )
    );
  }

  await course.remove();

  res.json({ success: true, data: course });
});
