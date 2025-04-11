const userModel = require("../models/userModel")
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Email = require('../Email.js');


const jwtSignin = async (payload) => {
    return await jwt.sign({ payload }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const jwtVerify = (req, next) => {
    try {
        const token = req.cookies?.login;  // Ensure req.cookies is defined
        if (!token) {
            return next(new AppError('You are not logged in! Please login again to get access..', 401));
        }
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, role, password, confirmPassword } = req.body;

    if (password != confirmPassword)
        return next(new AppError('Passwords must be same', 404));

    let user = await userModel.create({
        name, email, role, password, confirmPassword
    })

    res.status(201).json({ name, email, role, message: `${user.name} signed up successfully...` });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    //check is email and password exist
    if (!email || !password)
        return next(new AppError('Kindly provide both email and password', 404));

    //check mail id is present
    let doc = await userModel.findOne({ email }).select('+password'); //select('+password)-->bcz otherwise you will not receive password field in returned document

    //verify the password
    if (!doc || !await doc.correctPassword(password, doc.password))
        return next(new AppError('Incorrect email or Password...', 404))

    const token = await jwtSignin(doc._id);

    res.cookie('login', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
    }).status(200).json({
        name: doc.name,
        email: doc.email,
        role: doc.role,
        docId: doc._id
    });
});

// exports.logout = catchAsync(async (req, res, next) => {
//     // Clear the cookie named 'login'
//     // console.log(req)
//     res.clearCookie('login', {
//         path: '/', // Ensure the cookie path matches the one used during login
//         httpOnly: true, // Ensure cookie is HTTP-only
//         sameSite: 'none',       // Ensure this matches your cookie's setting
//         secure: false
//     });

//     res.status(200).json({ message: 'Logged out successfully' });
// });

exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('login', '', {
        expires: new Date(0),              // Set to past date
        httpOnly: true,
        sameSite: 'Lax',
        secure: false,
    });

    res.status(200).json({ message: 'Logged out successfully' });
});


exports.protectedRoute = (req, res, next) => {
    try {
        // 1. Get token from cookie
        const token = req.cookies.login;
        if (!token) {
            return res.status(401).json({ message: 'You are not logged in' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Use same secret used to sign

        // 3. Attach user info to request (optional)
        req.user = decoded;

        // 4. Move to next middleware
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};


exports.restrictTo = (...roles) => {
    return async (req, res, next) => {
        const user = await userModel.findOne({ _id: req.userId });
        if (!roles.includes(user.role))
            next(new AppError('You are not authorized to perform this action', 401))
        next();
    }
}

exports.forgotPassword = async (req, res, next) => {
    // 1. Check if the email is associated with a user account
    const { email } = req.body;

    const doc = await userModel.findOne({ email });

    if (!doc)
        return next(new AppError('There is no account associated with that email address', 404));

    // 2. Generate a random token
    const Token = crypto.randomBytes(20).toString('hex');
    const HashToken = crypto.createHash('SHA256').update(Token).digest('hex'); //Hash Random Token

    // 3. Update the user's password
    let final_doc = await userModel.findByIdAndUpdate(doc._id, {
        resetPasswordToken: HashToken, //Store Token in the database
        resetPasswordExpires: Date.now() + 600000  //Token will exprie in 10 mins
    }, { new: true });
    console.log(final_doc);

    // 4. Send the email to the user
    const resetUrl = `http://localhost:5173/resetPassword/${Token}`;

    const message = `Forgot your password? Reset it using the following link: \n\n${resetUrl} \n\nThis link is valid for 10 minutes.`;
    try {
        await Email({
            email,
            subject: 'Password Reset (Valid for 10 minutes)',
            message
        })

        res.status(200).json({ status: 'success', message: `An email has been sent to ${doc.email} with further instructions` });

    } catch (err) {
        doc.resetPasswordToken = undefined;
        doc.resetPasswordExpires = undefined;
        await doc.save({ validateBeforeSave: false });

        return next(new AppError('Email could not be sent', 500));
    }
}

exports.resetPassword = async (req, res, next) => {
    let Token = req.params.token
    const HashToken = crypto.createHash('SHA256').update(Token).digest('hex'); //HashToken to search in the db for doc with same hash token

    const { newPassword, confirmPassword } = req.body;
    const doc = await userModel.findOne({ resetPasswordToken: HashToken });

    if (!doc)
        return next(new AppError('Invalid token', 400));
    // 1. Check if the new password is valid
    if (newPassword.length < 6)
        return next(new AppError('Password must be at least 6 characters long', 400));

    // 2. Check if the new password is the same as the confirm password
    if (newPassword !== confirmPassword)
        return next(new AppError('Passwords do not match', 400));

    // 3. Update the user's password
    doc.password = newPassword;
    doc.resetPasswordToken = undefined;
    doc.resetPasswordExpires = undefined;
    await doc.save({ validateBeforeSave: false }); // { validateBeforeSave: false }--> do this when you dont want all the validator to run, otherwise it will ask for comfirm password, email etc.
    res.status(200).json({ isSuccess: true, message: 'Congratulations! Password reset successfully' });
}
