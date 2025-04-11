const mongoose = require('mongoose');
const tourModel = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review can't be empty !!"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {                                 //PARENT REFERENCING
        type: mongoose.Schema.ObjectId,
        ref: 'tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {                                 //PARENT REFERENCING
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: [true, 'Review must belong to a user']
    }
})

//Preventing Duplicate Reviews -------------------
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                avgRatings: { $avg: '$rating' }
            }
        }
    ]);
    //console.log(stats);

    if (stats.length > 0) {
        await tourModel.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRatings
        });
    } else {
        await tourModel.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
})


const reviewModel = mongoose.model('review', reviewSchema);

module.exports = reviewModel;
