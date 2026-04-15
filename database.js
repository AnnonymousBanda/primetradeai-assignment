const mongoose = require('mongoose')

const connectDB = async () => {
	const URI = process.env.DB_URI.replace(
		'<DB_USERNAME>',
		process.env.DB_USERNAME
	).replace('<DB_PASSWORD>', process.env.DB_PASSWORD)

	try {
		await mongoose.connect(URI)
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] ❌ MongoDB Connection Error: ${error.message}`
		)
		process.exit(1)
	}
}

const disconnectDB = async () => {
	try {
		await mongoose.disconnect()
	} catch (error) {
		console.error(
			`[${new Date().toISOString()}] ❌ MongoDB Disconnection Error: ${error.message}`
		)
		process.exit(1)
	}
}

mongoose.connection.on('connected', () => {
	console.info(`[${new Date().toISOString()}] ✅ MongoDB Connected`)
})

mongoose.connection.on('disconnected', () => {
	console.warn(`[${new Date().toISOString()}] ⚠️ MongoDB Disconnected`)
})

mongoose.connection.on('error', (err) => {
	console.error(`[${new Date().toISOString()}] ❌ MongoDB Error:`, err)
	process.exit(1)
})

module.exports = { connectDB, disconnectDB }
