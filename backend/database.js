const prisma = null

const connectDB = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('Missing DATABASE_URL in environment variables')
    }

    try {
        console.info(`[${new Date().toISOString()}] Database URL loaded`)
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Database connection error: ${error.message}`,
        )
        throw error
    }
}

const disconnectDB = async () => {
    try {
        console.warn(`[${new Date().toISOString()}] Database disconnected`)
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Database disconnection error: ${error.message}`,
        )
    }
}

module.exports = { prisma, connectDB, disconnectDB }
