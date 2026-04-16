const bcrypt = require('bcrypt')
const { catchAsync, AppError } = require('../utils/error.util')
const { signToken } = require('../utils/jwt.utils')
const { prisma } = require('../database')

const registerUser = catchAsync(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        throw new AppError('Email and password are required', 400)

    if (!/\S+@\S+\.\S+/.test(email))
        throw new AppError('Invalid email format', 400)

    if (password.length < 6)
        throw new AppError('Password must be at least 6 characters long', 400)

    if (!/[A-Z]/.test(password))
        throw new AppError(
            'Password must contain at least one uppercase letter',
            400,
        )

    if (!/[a-z]/.test(password))
        throw new AppError(
            'Password must contain at least one lowercase letter',
            400,
        )

    if (!/[0-9]/.test(password))
        throw new AppError('Password must contain at least one number', 400)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) throw new AppError('Email already in use', 400)

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role: 'USER',
        },
    })

    const token = await signToken({ id: user.id, role: user.role })

    const { password: _, ...userData } = user

    return res.status(201).json({
        success: true,
        data: {
            ...userData,
            token,
        },
    })
})

const loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password)
        throw new AppError('Email and password are required', 400)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new AppError('Invalid email or password', 401)

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new AppError('Invalid email or password', 401)

    const token = await signToken({ id: user.id, role: user.role })

    const { password: _, ...userData } = user

    return res.status(200).json({
        success: true,
        data: {
            ...userData,
            token,
        },
    })
})

const getMe = catchAsync(async (req, res) => {
    const id = req.user.id

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new AppError('User not found', 404)

    const { password: _, ...userData } = user

    return res.status(200).json({
        success: true,
        data: userData,
    })
})

module.exports = { registerUser, loginUser, getMe }
