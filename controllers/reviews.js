const asyncHandler = require('../middleware/async')
const Review = require('../models/Review')

// @desc Get all reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId })

    // if (!reviews) {
    //   return next(
    //     new ErrorResponse(
    //       `Bootcamp with id ${req.params.bootcampId} was not found`,
    //       404,
    //     ),
    //   );
    // }

    return res.json({ success: true, count: reviews.length, data: reviews })
  }
  return res.json(res.advancedResults)
})
