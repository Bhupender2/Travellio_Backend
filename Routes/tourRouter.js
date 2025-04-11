const express = require('express')
const { getTours, createTour, deleteTour, aliasTopTours, getTourStats, findTourById, patchTour, getToursWithin, getDistances } = require('../controllers/tourController')
const { protectedRoute, restrictTo } = require('../controllers/authController');
const reviewRouter = require('./reviewRouter')
const router = express.Router();

//NESTED ROUTES -------------------------------------------------------
router.use('/:tourId/reviews', reviewRouter)

router.route('/')
    .get(getTours)
    .post(protectedRoute, restrictTo('admin', 'lead-guide'), createTour)

router.route('/top5-cheapTours')
    .get(aliasTopTours, getTours)

//STANDARD WAY OF WRITING URL --> '/tours/tours-within/400/center/34.111745,-118.113491/unit/mi'
//NOT A STANDRARD WAY OF WRITING URL--> '/tours-within?distance=250&center=-40,45&unit=mi'
router.route('/tours-within/:distace/center/:latlng/unit/:unit').get(getToursWithin) //unit--> distance in miles or kilometers, center--> current location coordinates latitude and longitude

//CALCULATE DISTANCE BETWEEN CURRENT LOCATION(lat,ln) TO STARTING POINT OF ALL TOURS
router.route('/distances/:latlng/unit/:unit').get(getDistances)
//router.route('/:id').get(findTourById)
router.use(protectedRoute) //Refactor: To check whether user is logged in before doing the following operations

router.route('/tourStats')
    .get(getTourStats)

router.route('/:id')
    .get(findTourById)
    .delete(restrictTo('admin', 'lead-guide'), deleteTour)
    .patch(restrictTo('admin', 'lead-guide'), patchTour)

module.exports = router;