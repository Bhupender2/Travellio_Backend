const express = require('express')
const { protectedRoute, restrictTo } = require('../controllers/authController')
const { createReview, getAllReviews, updateReview, deleteReview, setTourUserIds, getReviewById } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true })

router.use(protectedRoute)

router.route('/')
    .get(getAllReviews)
    .post(restrictTo('user'), setTourUserIds, createReview)

router.route('/:id')
    .get(getReviewById)
    .patch(restrictTo('user', 'admin'), updateReview)
    .delete(restrictTo('user', 'admin'), deleteReview)

module.exports = router;