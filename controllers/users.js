const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc Get all users
// @route GET /api/v1/users
// @access Private
exports.getUsers = asyncHandler((req, res, next) => {
  res.json(res.advancedResults);
});

// @desc Get single user
// @route GET /api/v1/users/:id
// @access Private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ErrorResponse(`User with id ${req.params.id} was not found`, 404)
    );

  res.json({ success: true, data: user });
});

// @desc Create a user
// @route POST /api/v1/users
// @access Private
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.json({ success: true, data: user });
});

// @desc Update user
// @route PUT /api/v1/users/:id
// @access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user)
    return next(
      new ErrorResponse(`User with id ${req.params.id} was not found`, 404)
    );

  res.json({ success: true, data: user });
});

// @desc Delete user
// @route DELETE /api/v1/users/:id
// @access Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user)
    return next(
      new ErrorResponse(`User with id ${req.params.id} was not found`, 404)
    );

  res.json({ success: true, data: {} });
});
