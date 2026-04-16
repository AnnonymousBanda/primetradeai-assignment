const { catchAsync, AppError } = require('../utils/error.util')
const { verifyToken } = require('../utils/jwt.utils')

const protect = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new AppError('Unauthenticated', 401)

    const token = authHeader.split(' ')[1]
    if (!token) throw new AppError('Unauthenticated', 401)

    const decoded = await verifyToken(token)

    if (!decoded) throw new AppError('Unauthenticated', 401)

    req.user = {
        id: decoded.id,
        role: decoded.role,
    }

    next()
})

const mustBeAdmin = catchAsync(async (req, res, next) => {
    if (req.user?.role !== 'ADMIN') throw new AppError('Unauthorized', 403)
    next()
})

module.exports = { protect, mustBeAdmin }
