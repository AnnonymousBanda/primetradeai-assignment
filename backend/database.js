const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')

function createAdapter() {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
        throw new Error('Missing DATABASE_URL in environment variables')
    }

    const connectionUrl = new URL(databaseUrl)
    const adapterConfig = {
        host: connectionUrl.hostname,
        port: connectionUrl.port ? Number(connectionUrl.port) : 3306,
        user: decodeURIComponent(connectionUrl.username),
        password: decodeURIComponent(connectionUrl.password),
        database: connectionUrl.pathname.replace(/^\//, ''),
        connectionLimit: 5,
    }

    const sslAccept = connectionUrl.searchParams.get('sslaccept')
    if (sslAccept === 'strict') {
        adapterConfig.ssl = { rejectUnauthorized: true }
    } else if (sslAccept === 'accept_invalid_certs') {
        adapterConfig.ssl = { rejectUnauthorized: false }
    }

    return new PrismaMariaDb(adapterConfig)
}

const globalForPrisma = globalThis

const prisma =
    globalForPrisma.prisma || new PrismaClient({ adapter: createAdapter() })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

const connectDB = async () => {
    try {
        await prisma.$connect()
        console.info(`[${new Date().toISOString()}] Database connected`)
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Database connection error: ${error.message}`,
        )
        throw error
    }
}

const disconnectDB = async () => {
    try {
        await prisma.$disconnect()
        console.warn(`[${new Date().toISOString()}] Database disconnected`)
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Database disconnection error: ${error.message}`,
        )
    }
}

module.exports = { prisma, connectDB, disconnectDB }
