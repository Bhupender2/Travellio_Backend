const mongoose = require('mongoose')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,  // to remove extra white space in string ex: " Hi  " will be saved as "Hi"
        maxlength: [50, 'A tour name should be less than or equal to 50 charcters'],
        minlength: [10, 'A tour name should be greater than characters']
    },
    duration: {
        type: Number,
        required: [true, 'A Tour must have a duration']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be less than or equals to 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    startDates: [Date],
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        }
    ],
    startLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//VIRTUAL FIELD:
tourSchema.virtual('durationInWeeks').get(function () {
    return this.duration / 7;
})

tourSchema.virtual('tourReviews', {
    ref: 'review',   //Name of the model that the virtual property is referencing, in this case the Review model.
    foreignField: 'tour',   //Name of the field in the referenced model (Review) that holds the reference to the Tour model, in this case the tour field in the Review model.
    localField: '_id',  //Name of the field in the current model (Tour) that holds the value that is being referenced in the foreign model (Review), in this case the _id field in the Tour model.
});

tourSchema.index({ price: 1, ratingsAverage: -1 })  //Indexes : Quick and Efficient way to search for data that matches a specific query.
tourSchema.index({ startLocation: '2dsphere' })

//REFACTORED:
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v'
    });
    next();
})

const tourModel = mongoose.model('tour', tourSchema)

module.exports = tourModel;