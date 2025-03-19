const express = require('express');
const { signup, login, protectedRoute, forgotPassword, resetPassword, restrictTo, logout } = require('../controllers/authController');
const { getUsers, getUserById, deleteUser, UpdateMyPassword, editUser } = require('../controllers/userController')

const router = express.Router();

router.patch('/:id', protectedRoute, editUser)
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.post('/resetPassword/:token', resetPassword)
router.patch('/UpdateMyPassword', protectedRoute, UpdateMyPassword)


router.use(protectedRoute)

router.use(restrictTo('admin'));

router.route('/').get(getUsers);

router.route('/:id')
    .get(getUserById)
    .delete(deleteUser)


module.exports = router; 