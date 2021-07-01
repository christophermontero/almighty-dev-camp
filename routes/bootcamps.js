const express = require('express');
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  getBootcampInRadius,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

const { protect } = require('../middleware/auth');

// Include other resource routers
const courseRouter = require('./courses');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

module.exports = router;
