const reviewModel = require('../models/reviewModel');
const { createDoc, updateDoc, getAllDocs, deleteDoc, getDocById } = require('./handleFactory')

exports.setTourUserIds = (req, res, next) => {  // Set tourId and UserId so that later we identify the user who wrote this review and for which tour
    console.log(req.user)
    if (!req.body.tour)
        req.body.tour = req.params.tourId;
    if (!req.body.user)
        req.body.user = req.userId;
    next();
}

exports.createReview = createDoc(reviewModel);

exports.getReviewById = getDocById(reviewModel)

exports.getAllReviews = getAllDocs(reviewModel);

let updateReviewStats = true;

exports.updateReview = updateDoc(reviewModel,updateReviewStats);

exports.deleteReview = deleteDoc(reviewModel, updateReviewStats);