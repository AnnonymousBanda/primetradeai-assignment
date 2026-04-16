const { catchAsync, AppError } = require('../utils/error.util')
const { prisma } = require('../database')

const createSignal = catchAsync(async (req, res) => {
    const { asset, action, entryPrice, targetPrice, stopLoss } = req.body

    if (!asset || !action || !entryPrice || !targetPrice || !stopLoss)
        throw new AppError(
            'All fields (asset, action, entryPrice, targetPrice, stopLoss) are required',
            400,
        )

    if (action !== 'LONG' && action !== 'SHORT')
        throw new AppError('Action must be LONG or SHORT', 400)

    const signal = await prisma.signal.create({
        data: {
            asset,
            action,
            entryPrice: parseFloat(entryPrice),
            targetPrice: parseFloat(targetPrice),
            stopLoss: parseFloat(stopLoss),
            authorId: req.user.id,
        },
    })

    return res.status(201).json({
        success: true,
        data: signal,
    })
})

const updateSignal = catchAsync(async (req, res) => {
    const { id } = req.params
    const { asset, action, entryPrice, targetPrice, stopLoss, status } =
        req.body

    const existingSignal = await prisma.signal.findUnique({ where: { id } })

    if (!existingSignal) throw new AppError('Signal not found', 404)

    if (action && action !== 'LONG' && action !== 'SHORT')
        throw new AppError('Action must be LONG or SHORT', 400)

    if (status && status !== 'ACTIVE' && status !== 'CLOSED')
        throw new AppError('Status must be ACTIVE or CLOSED', 400)

    const updatedSignal = await prisma.signal.update({
        where: { id },
        data: {
            asset,
            action,
            entryPrice: entryPrice ? parseFloat(entryPrice) : undefined,
            targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
            stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
            status,
        },
    })

    return res.status(200).json({
        success: true,
        data: updatedSignal,
    })
})

const deleteSignal = catchAsync(async (req, res) => {
    const { id } = req.params

    const existingSignal = await prisma.signal.findUnique({ where: { id } })

    if (!existingSignal) throw new AppError('Signal not found', 404)

    await prisma.signal.delete({ where: { id } })

    return res.status(200).json({
        success: true,
        data: { id },
    })
})

const getSignalsUsingQuery = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status
    const asset = req.query.asset

    const skip = (page - 1) * limit
    const take = limit

    const where = {}
    if (status) where.status = status
    if (asset) where.asset = asset

    const [signals, totalCount] = await Promise.all([
        prisma.signal.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.signal.count({ where }),
    ])

    return res.status(200).json({
        success: true,
        data: signals,
        meta: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
    })
})

const getSignalById = catchAsync(async (req, res) => {
    const { id } = req.params

    const signal = await prisma.signal.findUnique({ where: { id } })

    if (!signal) throw new AppError('Signal not found', 404)

    return res.status(200).json({
        success: true,
        data: signal,
    })
})
const getMyWatchlistSignals = catchAsync(async (req, res) => {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    console.log('=== DEBUG START ===')
    console.log('1. Authenticated User ID:', userId, '| Type:', typeof userId)

    const userWatchlist = await prisma.watchlist.findMany({
        where: { userId },
        select: { asset: true },
    })

    const assetList = userWatchlist.map((item) =>
        item.asset.trim().toUpperCase(),
    )
    console.log('2. Watchlist Assets Found:', assetList)

    if (assetList.length === 0) {
        console.log('3. STOPPING: User has no items in their watchlist.')
        return res.status(200).json({
            success: true,
            data: [],
            meta: { page, limit, totalCount: 0, totalPages: 0 },
        })
    }

    // Let's do a raw check to see what signals actually exist for these assets, ignoring status first
    const rawSignalsExist = await prisma.signal.findMany({
        where: { asset: { in: assetList } },
        select: { asset: true, status: true },
    })
    console.log(
        '4. Raw Signals in DB matching these assets (Ignoring Status):',
        rawSignalsExist,
    )

    const [signals, totalCount] = await Promise.all([
        prisma.signal.findMany({
            where: {
                asset: { in: assetList },
                status: 'ACTIVE',
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.signal.count({
            where: {
                asset: { in: assetList },
                status: 'ACTIVE',
            },
        }),
    ])

    console.log(
        '5. Final Filtered Signals returning to frontend:',
        signals.length,
    )
    console.log('=== DEBUG END ===')

    return res.status(200).json({
        success: true,
        data: signals,
        meta: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
    })
})

module.exports = {
    createSignal,
    getSignalsUsingQuery,
    getSignalById,
    updateSignal,
    deleteSignal,
    getMyWatchlistSignals,
}
