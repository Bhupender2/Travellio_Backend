const tourModel = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')
const { createDoc, deleteDoc, getDocById, updateDoc, getAllDocs } = require('./handleFactory')
const AppError = require('../utils/AppError')

exports.aliasTopTours = (req, res, next) => {
    //  http://localhost:8000/api/v1/tours/top5-cheapTours ---> We assign route to a specific query which we know user can search multiple times also so user memorize it easily 
    req.query.sort = '-ratingsAverage,price' //first sort according to ratingsAverage(desc order) then price(asc order)
    req.query.fields = 'name,ratingsAverage,summary,startLocation,locations,startDates,maxGroupSize,price,images,duration'
    req.query.limit = 5
    
    next();
}

exports.getTours = getAllDocs(tourModel)

exports.createTour = createDoc(tourModel)

exports.patchTour = updateDoc(tourModel)

exports.deleteTour = deleteDoc(tourModel)

exports.findTourById = getDocById(tourModel, { path: 'tourReviews' })

exports.getTourStats = catchAsync(async (req, res) => {
    //IMPLEMENT FUNCTION TO CALCULATE THE BUSIEST MONTH OF THE GIVEN YEAR
    //In short - Find No. Of trips started in each month
    const stats = await tourModel.aggregate([
        {
            $unwind: '$startDates',  //Decontructs an array fields from input documents to output a document for each element.
        },
        {
            $group:
            {
                _id: { $month: '$startDates' },  //$month will returns the month of the date as a number between 1 to 12 
                numberOfBookings: { $sum: 1 },
            }
        },
        {
            $addFields: {
                MonthInNumbers: '$_id'
            }
        },
        {
            $project: {
                _id: 0,
            }
        },
        {
            $group: {
                _id: null,
                BusiestMonth: { $max: '$numberOfBookings' }
            }
        }
    ])

    res.status(200).send({
        status: "success",
        data: {
            stats
        }
    })

})

exports.getToursWithin = catchAsync(async function (req, res, next) {
    const { distace, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(new AppError('Please provide a lat and lng in lat,lng format..'), 400);
    }

    const radius = unit === 'mi' ? distace / 3963.2 : distace / 6378.1;

    const tours = await tourModel.find({
        startLocation:
        {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    })
    res.status(200).json({
        status: 'Success',
        dataLength: tours.length,
        data: {
            data: tours
        }
    })

})

exports.getDistances = catchAsync(async function (req, res, next) {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(new AppError('Please provide a lat and lng in lat,lng format..'), 400);
    }

    const multiplier = unit === 'mi' ? 0.000621371 : 0.0001;

    const distances = await tourModel.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            },
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])
    res.status(200).json({
        status: 'Success',
        data: {
            data: distances
        }
    })

})