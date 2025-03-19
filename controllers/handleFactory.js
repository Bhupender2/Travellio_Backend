const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/APIFeatures");

exports.createDoc = Model => catchAsync(async (req, res) => {
    let doc = await Model.create(req.body);

    res.status(201).send({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getDocById = (Model, popluateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popluateOptions)
        query = query.populate(popluateOptions);
    const doc = await query;
    if (!doc)
        return next(new AppError('No document found with id ' + req.params.id));

    res.status(200).json({
        status: 'success',
        data: doc
    })
});

exports.getAllDocs = Model => catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId)
        filter = { tour: req.params.tourId }

    let features = new APIFeatures(Model.find(filter), req.query).filter().sort().fields().pagination();

    const docs = await features.query //features has 2 prop unresoled query and queryObj
    res.status(200).json({
        status: 'success',
        data: docs
    });
})

exports.deleteDoc = (Model, updateReviewStats) => catchAsync(async (req, res, next) => {

    const deletedDoc = await Model.findByIdAndDelete(req.params.id);

    if (!deletedDoc)
        return next(new AppError('No Doc Found with id ' + req.params.id))

    if (updateReviewStats) {
        Model.calcAverageRatings(deletedDoc.tour);
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});

exports.updateDoc = (Model,updateReviewStats) => catchAsync(async (req, res) => {
    console.log(req.params)
    const updatedReview = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidtors: true
    });

    if (!updatedReview)
        return next(new AppError('No Doc Found with id ' + req.params.id))

    if (updateReviewStats) {
        console.log(updatedReview);
        Model.calcAverageRatings(updatedReview.tour);
    }
    res.status(200).json({
        status: 'success',
        data: updatedReview
    });
});