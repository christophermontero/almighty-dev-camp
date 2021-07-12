const express = require('express')

const router = express.Router({ mergeParams: true })
const { getReviews, getReview } = require('../controllers/reviews')

const Review = require('../models/Review')
const advancedResults = require('../middleware/advancedResults')

router.route('/').get(advancedResults(Review, {
  path: 'bootcamp',
  select: 'name description'
}), getReviews)

router.route('/:id').get(getReview)

module.exports = router
