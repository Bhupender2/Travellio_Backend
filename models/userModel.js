const mongoose = require('mongoose');
var validator = require('validator');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter your Name'],
        minlength: [3, 'Name should be atleast of 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email id'],
        unique: [true, 'This Email is already had a account'],
        validator: [validator.isEmail, 'Please provide valid Email id']
    },
    photo: String,
    role: {
        type: String,
        enum: ['admin', 'user', 'guide', 'lead-guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: true,
        minlength: [5, 'Password must be equal or greater than 5 characters'],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Provide confirm password'],
        validate: {
            validator: function (cp) {
                return cp === this.password
            }
        },
        message: 'Password and Confirm Password does not match'
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    this.confirmPassword = undefined;
    next();
})

userSchema.methods.correctPassword = async (enteredPass, userPassword) => {
    return await bcrypt.compare(enteredPass, userPassword);
}

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;