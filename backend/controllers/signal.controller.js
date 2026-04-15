const { catchAsync, AppError } = require('../utils/error.util')

const createSignal = catchAsync(async (req, res) => {
    return res.status(201).json({
        success: true,
        message: 'Signal created successfully',
        data: null,
    })
})

const updateSignal = catchAsync(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Signal updated successfully',
        data: null,
    })
})

const deleteSignal = catchAsync(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Signal deleted successfully',
        data: null,
    })
})

const getSignalsUsingQuery = catchAsync(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Signals fetched successfully using query',
        data: null,
    })
})

const getSignalById = catchAsync(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Signal fetched successfully by id',
        data: null,
    })
})

module.exports = {
    createSignal,
    getSignalsUsingQuery,
    getSignalById,
    updateSignal,
    deleteSignal,
}
