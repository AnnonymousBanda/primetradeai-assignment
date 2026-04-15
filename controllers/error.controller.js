const { AppError } = require("../utils/error.util")

const handleDevError = (err, res) => {
	const status = err.status || 500
	return res.status(status).json({
		status: status,
		message: err.message,
		stack: err.stack,
	})
}

const handleProdError = (err, res) => {
	if (err.isOperational) {
		return res.status(err.status).json({
			status: err.status,
			message: err.message,
		})
	} else {
		return res.status(500).json({
			status: 500,
			message: 'Something went wrong! Please try again later.',
		})
	}
}

const notFound = (req, res, next) => {
	const error = new AppError(
		`Can't find ${req.originalUrl} on this server!`,
		404
	)
	next(error)
}

const globalErrorHandler = (err, req, res, next) => {
	console.error(err)

	if (process.env.NODE_ENV === 'development') {
		return handleDevError(err, res)
	} else {
		return handleProdError(err, res)
	}
}

module.exports = { notFound, globalErrorHandler }
