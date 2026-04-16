const jwt = require('jsonwebtoken')

const getJwtExpiresIn = () => {
    const defaultExpiry = '1d'
    const rawExpiry = process.env.JWT_EXPIRES_IN

    if (rawExpiry === undefined || rawExpiry === null) return defaultExpiry

    if (typeof rawExpiry === 'number' && Number.isFinite(rawExpiry)) {
        return rawExpiry
    }

    const normalized = String(rawExpiry)
        .trim()
        .replace(/^['\"]|['\"]$/g, '')

    if (!normalized) return defaultExpiry

    if (/^\d+$/.test(normalized)) {
        return Number(normalized)
    }

    return normalized
}

const signToken = async (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: getJwtExpiresIn(),
    })
}

const verifyToken = async (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { signToken, verifyToken }
