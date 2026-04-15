const { catchAsync, AppError } = require('../utils/error.util')

const registerUser = catchAsync(async (req, res) => {
    return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: null,
    })
})

const loginUser = catchAsync(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: null,
    })
})

const getMe = catchAsync(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'User details fetched successfully',
        data: null,
    })
})

module.exports = { registerUser, loginUser, getMe }
