const userModel = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const { getDocById, getAllDocs, updateDoc, deleteDoc } = require('./handleFactory')


exports.getUsers = getAllDocs(userModel)

exports.getUserById = getDocById(userModel)

exports.editUser = updateDoc(userModel)

exports.deleteUser = deleteDoc(userModel)

exports.UpdateMyPassword = async (req, res, next) => {
    //Change password when user already logged in
    const { currentPassword, password, confirmPassword } = req.body;
    const doc = await userModel.findById({ _id: req.userId }).select('+password')
    if (!doc)
        return next(new AppError('User not found', 404))

    if (await doc.correctPassword(currentPassword, doc.password))
        return next(new AppError('Passwords do not match', 403))

    doc.password = password;
    doc.confirmPassword = confirmPassword;
    doc.save();

    res.status(200).send('Password reset successful...')
}