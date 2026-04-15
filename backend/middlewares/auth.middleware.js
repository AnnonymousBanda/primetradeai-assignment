const { catchAsync, AppError } = require('../utils/error.util')
const { verifyToken } = require('../utils/jwt.utils')

const protect = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new AppError('Unauthorized', 401)

    const token = authHeader.split(' ')[1]
    if (!token) throw new AppError('Unauthorized', 401)

    const decoded = await verifyToken(token)

    if (!decoded) throw new AppError('Unauthorized', 401)

    req.user = decoded.id
    req.role = decoded.role

    next()
})

const mustBeAdmin = catchAsync(async (req, res, next) => {
    if (req.role !== 'admin') throw new AppError('Forbidden', 403)
    next()
})

module.exports = { protect, mustBeAdmin }
