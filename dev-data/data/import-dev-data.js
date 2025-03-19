const mongoose = require('mongoose')
const fs = require('fs')
const tourModel = require('../../models/tourModel');
const userModel = require('../../models/userModel');
const reviewModel = require('../../models/reviewModel');

//START SERVER AND CONNECT TO MONGODB
require('dotenv').config({ path: './config.env' })  // To Read .env file and set key value to node environment

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.set('strictQuery', false);  // mongoose new version we have to set this to true or false otherwise will keep givig warning

mongoose.connect(DB).then(() => console.log("DB CONNECTED SUCCESSFULLY..."))

//READ JSON FILE :
const toursData = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const usersData = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviewsData = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//IMPORT DATA INTO DB :
const importData = async () => {
    try {
        // await tourModel.create(toursData)
        // await userModel.create(usersData, { validateBeforeSave: false });
        await reviewModel.create(reviewsData);
        console.log('Data added successfully...!')
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

//DELETE DATA FROM DB :
const deleteData = async () => {
    try {
        // await tourModel.deleteMany();
        // await userModel.deleteMany();
        await reviewModel.deleteMany();
        console.log('Data successfully deleted...!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}