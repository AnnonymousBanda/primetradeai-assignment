const { catchAsync, AppError } = require('../utils/error.util')

const addToWatchlist = catchAsync(async (req, res) => {
    const { asset } = req.body

    if (!asset) {
        throw new AppError('Asset is required', 400)
    }

    return res.status(201).json({
        success: true,
        data: {
            id: `watch-${Date.now()}`,
            userId: req.user,
            asset,
            createdAt: new Date().toISOString(),
        },
    })
})

const getWatchlist = catchAsync(async (req, res) => {
    return res.status(200).json({
        success: true,
        data: [
            {
                id: 'watch-123',
                userId: req.user,
                asset: 'ETH/USDT',
                createdAt: new Date().toISOString(),
            },
        ],
    })
})

const removeFromWatchlist = catchAsync(async (req, res) => {
    const { id } = req.params

    return res.status(200).json({
        success: true,
        data: {
            id,
        },
    })
})

module.exports = {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist,
}
