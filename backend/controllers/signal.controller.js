const { PrismaClient } = require('@prisma/client')
const { catchAsync, AppError } = require('../utils/error.util')

const prisma = new PrismaClient()

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

module.exports = {
    createSignal,
    getSignalsUsingQuery,
    getSignalById,
    updateSignal,
    deleteSignal,
}
