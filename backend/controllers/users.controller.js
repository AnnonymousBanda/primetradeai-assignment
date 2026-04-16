const { catchAsync, AppError } = require('../utils/error.util')
const { prisma } = require('../database')

const updateUserRole = catchAsync(async (req, res) => {
    const { id } = req.params
    const { role } = req.body

    if (!role) throw new AppError('Role is required', 400)

    if (role !== 'ADMIN' && role !== 'USER')
        throw new AppError('Invalid role', 400)

    const existingUser = await prisma.user.findUnique({ where: { id } })

    if (!existingUser) throw new AppError('User not found', 404)

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
    })

    const { password: _, ...userData } = updatedUser

    return res.status(200).json({
        success: true,
        data: userData,
    })
})

module.exports = { updateUserRole }
