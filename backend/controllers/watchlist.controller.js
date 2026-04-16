const { catchAsync, AppError } = require('../utils/error.util')
const { prisma } = require('../database')

const addToWatchlist = catchAsync(async (req, res) => {
    const { asset } = req.body
    const userId = req.user.id

    if (!asset) throw new AppError('Asset is required', 400)

    const existingItem = await prisma.watchlist.findFirst({
        where: {
            userId,
            asset,
        },
    })

    if (existingItem)
        throw new AppError('Asset is already in your watchlist', 400)

    const watchlistItem = await prisma.watchlist.create({
        data: {
            userId,
            asset,
        },
    })

    return res.status(201).json({
        success: true,
        data: watchlistItem,
    })
})

const getWatchlist = catchAsync(async (req, res) => {
    const userId = req.user.id

    const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({
        success: true,
        data: watchlist,
    })
})

const removeFromWatchlist = catchAsync(async (req, res) => {
    const { id } = req.params
    const userId = req.user.id

    const existingItem = await prisma.watchlist.findUnique({
        where: { id },
    })

    if (!existingItem) throw new AppError('Watchlist item not found', 404)

    if (existingItem.userId !== userId)
        throw new AppError('Forbidden: You do not own this watchlist item', 403)

    await prisma.watchlist.delete({
        where: { id },
    })

    return res.status(200).json({
        success: true,
        data: { id },
    })
})

module.exports = {
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist,
}
