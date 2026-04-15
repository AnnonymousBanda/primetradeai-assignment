const { catchAsync, AppError } = require('../utils/error.util')

const updateUserRole = catchAsync(async (req, res) => {
    const { id } = req.params
    const { role } = req.body

    if (!role) {
        throw new AppError('Role is required', 400)
    }

    if (role !== 'ADMIN' && role !== 'USER') {
        throw new AppError('Invalid role', 400)
    }

    return res.status(200).json({
        success: true,
        data: {
            id,
            email: 'user@example.com',
            role,
        },
    })
})

module.exports = { updateUserRole }
